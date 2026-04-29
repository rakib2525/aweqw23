const express = require("express");
const router = express.Router();

const Domain = require("../models/Domain");
const Smartlink = require("../models/Smartlink");
const auth = require("../middleware/auth");

// ===============================
// 🔒 DOMAIN VALIDATOR
// ===============================
function isValidDomain(d) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d);
}

// ===============================
// 🧼 CLEAN DOMAIN
// ===============================
function cleanDomain(domain) {
  return domain
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .replace("domain:", "")
    .trim()
    .toLowerCase();
}


// ===============================
// ➕ ADD DOMAIN
// ===============================
router.post("/", auth, async (req, res) => {
  try {
    let { domain, smartlink_id } = req.body;

    // 1️⃣ validate input
    if (!domain || !smartlink_id) {
      return res.status(400).json({
        message: "domain & smartlink_id required"
      });
    }

    // 2️⃣ clean domain
    domain = cleanDomain(domain);

    // 3️⃣ validate format
    if (!isValidDomain(domain)) {
      return res.status(400).json({
        message: "Invalid domain format"
      });
    }

    // 4️⃣ check smartlink exists
    const sl = await Smartlink.findById(smartlink_id);
    if (!sl) {
      return res.status(404).json({
        message: "Smartlink not found"
      });
    }

    // 🔥 IMPORTANT: ownership check
    if (sl.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not your smartlink"
      });
    }

    // 5️⃣ prevent duplicate
    const exists = await Domain.findOne({ domain });
    if (exists) {
      return res.status(400).json({
        message: "Domain already exists"
      });
    }

    // 6️⃣ create
    const d = await Domain.create({
      domain,
      smartlink_id,
      user_id: req.user.id,
      status: "active"
    });

    console.log("✅ DOMAIN ADDED:", d.domain);

    res.json(d);

  } catch (err) {
    console.log("❌ DOMAIN ADD ERROR:", err);
    res.status(500).send("Server Error");
  }
});


// ===============================
// 📋 GET MY DOMAINS
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const list = await Domain.find({ user_id: req.user.id })
      .populate("smartlink_id", "name")
      .sort({ createdAt: -1 });

    res.json(list);

  } catch (err) {
    console.log("❌ DOMAIN FETCH ERROR:", err);
    res.status(500).send("Error");
  }
});


// ===============================
// ❌ DELETE DOMAIN
// ===============================
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Domain.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Domain not found"
      });
    }

    console.log("🗑️ DOMAIN DELETED:", deleted.domain);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.log("❌ DELETE ERROR:", err);
    res.status(500).send("Error");
  }
});


// ===============================
// 🔁 TOGGLE DOMAIN
// ===============================
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const domain = await Domain.findOne({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!domain) {
      return res.status(404).json({
        message: "Domain not found"
      });
    }

    domain.status = domain.status === "active" ? "paused" : "active";
    await domain.save();

    console.log("🔁 DOMAIN TOGGLED:", domain.domain, domain.status);

    res.json(domain);

  } catch (err) {
    console.log("❌ TOGGLE ERROR:", err);
    res.status(500).send("Error");
  }
});

module.exports = router;