const express = require("express");
const router = express.Router();

const Conversion = require("../models/Conversion");
const Click = require("../models/Click");
const User = require("../models/User");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


// ===============================
// 🔥 POSTBACK (AUTO CONVERSION)
// ===============================
router.get("/", async (req, res) => {
  try {
    const { click_id, payout } = req.query;

    if (!click_id) {
      return res.status(400).send("Missing click_id");
    }

    const click = await Click.findById(click_id);

    if (!click) {
      return res.status(404).send("Click not found");
    }

    // ❌ prevent duplicate conversion
    if (click.isConverted) {
      return res.send("Already converted");
    }

    const amount = Number(payout || 0);

    // ===============================
    // 🔥 CREATE CONVERSION (PENDING)
    // ===============================
    const conversion = await Conversion.create({
      clickId: click._id,        // ✅ FIXED
      offerId: click.offer,      // ✅ FIXED
      userId: click.user,        // ✅ FIXED
      revenue: amount,
      status: "pending"
    });

    // ===============================
    // 💰 ADD TO PENDING BALANCE
    // ===============================
    await User.findByIdAndUpdate(click.user, {
      $inc: {
        pendingBalance: amount
      }
    });

    // ===============================
    // 🔥 UPDATE CLICK
    // ===============================
    await Click.findByIdAndUpdate(click_id, {
      revenue: amount,
      isConverted: true
    });

    console.log("💸 POSTBACK:", click_id, amount);

    res.send("OK");

  } catch (err) {
    console.log("❌ POSTBACK ERROR:", err);
    res.status(500).send("Server Error");
  }
});


// ===============================
// ✅ APPROVE
// ===============================
router.post("/approve/:id", auth, admin, async (req, res) => {
  try {
    const conv = await Conversion.findById(req.params.id);

    if (!conv || conv.status !== "pending") {
      return res.status(400).send("Invalid conversion");
    }

    conv.status = "approved";
    await conv.save();

    await User.findByIdAndUpdate(conv.userId, {
      $inc: {
        balance: conv.revenue,
        pendingBalance: -conv.revenue,
        total_earned: conv.revenue   // 🔥 ADDED
      }
    });

    res.send("Approved");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// ===============================
// ❌ REJECT
// ===============================
router.post("/reject/:id", auth, admin, async (req, res) => {
  try {
    const conv = await Conversion.findById(req.params.id);

    if (!conv || conv.status !== "pending") {
      return res.status(400).send("Invalid conversion");
    }

    conv.status = "rejected";
    await conv.save();

    await User.findByIdAndUpdate(conv.userId, {
      $inc: {
        pendingBalance: -conv.revenue
      }
    });

    res.send("Rejected");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;