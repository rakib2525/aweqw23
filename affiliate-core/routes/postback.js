const express = require("express");
const router = express.Router();

const Click = require("../models/Click");
const Conversion = require("../models/Conversion");
const User = require("../models/User");
const Offer = require("../models/Offer");


// ===============================
// 🔥 POSTBACK (FINAL SAFE VERSION)
// ===============================
router.get("/", async (req, res) => {
  try {
    const { click_id, payout } = req.query;

    if (!click_id) {
      return res.status(400).send("Missing click_id");
    }

    const amount = Number(payout) || 0;

    let click = null;

    // ===============================
    // ✅ SUPPORT BOTH (_id + session_id)
    // ===============================
    if (click_id.length === 24) {
      click = await Click.findById(click_id);
    }

    if (!click) {
      click = await Click.findOne({ session_id: click_id });
    }

    if (!click) {
      return res.status(404).send("Invalid click");
    }

    // ===============================
    // ❌ STRONG DUPLICATE BLOCK
    // ===============================
    const exists = await Conversion.findOne({
      $or: [
        { clickId: click_id },
        { clickId: click._id.toString() }
      ]
    });

    if (exists) {
      return res.send("Already converted");
    }

    // ===============================
    // 🔥 CREATE CONVERSION
    // ===============================
    await Conversion.create({
      clickId: click._id.toString(), // ✅ ALWAYS STORE _id
      userId: click.user,
      offerId: click.offer,
      subid: click.subid || null,
      country: click.country || null,
      device: click.device || null,
      revenue: amount,
      status: "pending"
    });

    // ===============================
    // 💰 UPDATE USER
    // ===============================
    if (click.user) {
      await User.findByIdAndUpdate(click.user, {
        $inc: {
          pendingBalance: amount
        }
      });
    }

    // ===============================
    // 📊 UPDATE OFFER
    // ===============================
    if (click.offer) {
      await Offer.findByIdAndUpdate(click.offer, {
        $inc: { todayConversions: 1 }
      });
    }

    // ===============================
    // 🔥 MARK CLICK CONVERTED
    // ===============================
    await Click.findByIdAndUpdate(click._id, {
      isConverted: true,
      revenue: amount
    });

    console.log("💸 POSTBACK:", click_id, amount);

    res.send("OK");

  } catch (err) {
    console.error("🔥 POSTBACK ERROR:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;