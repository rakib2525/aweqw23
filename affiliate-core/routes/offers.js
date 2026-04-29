const express = require("express");
const router = express.Router();

const Offer = require("../models/Offer");
const User = require("../models/User");
const Smartlink = require("../models/Smartlink");
const auth = require("../middleware/auth");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// =========================
// CREATE OFFER
// =========================
router.post("/", async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.json(offer);
  } catch (err) {
    console.error("❌ CREATE OFFER ERROR:", err);
    res.status(500).json({ error: "Create offer failed" });
  }
});

// =========================
// GET ALL OFFERS
// =========================
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    console.error("❌ FETCH OFFERS ERROR:", err);
    res.status(500).json({ error: "Fetch offers failed" });
  }
});

// =========================
// APPLY OFFER + SMARTLINK CREATE 🔥
// =========================
router.post("/apply/:id", auth, async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // already applied check
    const alreadyApplied = user.appliedOffers.some(
      (o) => o.toString() === offerId
    );

    // check existing smartlink
    const existingSmartlink = await Smartlink.findOne({
      user_id: userId,
      default_offer: offerId
    });

    // ✅ IF EXIST → RETURN SAME LINK (FIXED)
    if (existingSmartlink) {
      return res.json({
        success: true,
        message: "Already applied",
        smartlink: existingSmartlink,
        tracking_link: `${BASE_URL}/track/${existingSmartlink._id}` // ✅ FIX
      });
    }

    // add offer
    if (!alreadyApplied) {
      user.appliedOffers.push(offerId);
      await user.save();
    }

    // create smartlink
    const smartlink = await Smartlink.create({
      name: `SL_${userId}_${offerId}`,
      user_id: userId,
      default_offer: offerId,
      status: "active"
    });

    console.log("✅ Smartlink created:", smartlink._id);

    // ✅ FIXED TRACK LINK
    const trackingLink = `${BASE_URL}/track/${smartlink._id}`;

    res.json({
      success: true,
      message: "Applied + Smartlink created ✅",
      smartlink,
      tracking_link: trackingLink
    });

  } catch (err) {
    console.error("❌ APPLY ERROR:", err);
    res.status(500).json({
      message: "Apply failed"
    });
  }
});

// =========================
// UPDATE OFFER
// =========================
router.put("/:id", async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(offer);
  } catch (err) {
    console.error("❌ UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// =========================
// DELETE OFFER
// =========================
router.delete("/:id", async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;