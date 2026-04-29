const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Conversion = require("../models/Conversion");
const Click = require("../models/Click");
const Offer = require("../models/Offer");
const Smartlink = require("../models/Smartlink");
const User = require("../models/User");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


// ===============================
// 📊 GET ALL LEADS (ADMIN)
// ===============================
router.get("/", auth, admin, async (req, res) => {
  try {
    const leads = await Conversion.find()
      .populate("userId", "name email")
      .populate("offerId", "name payout")
      .sort({ createdAt: -1 });

    res.json(leads);

  } catch (err) {
    console.log("GET LEADS ERROR:", err);
    res.status(500).send("Server Error");
  }
});


// ===============================
// 💰 APPROVE LEAD (🔥 FINAL FIX)
// ===============================
router.patch("/leads/:id/approve", auth, admin, async (req, res) => {
  try {
    const leadId = req.params.id;

    // ❌ invalid lead id
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).send("Invalid lead ID");
    }

    const lead = await Conversion.findById(leadId);

    if (!lead) return res.status(404).send("Lead not found");

    if (lead.status !== "pending") {
      return res.status(400).send("Already processed");
    }

    // ❌ invalid clickId fix
    if (!mongoose.Types.ObjectId.isValid(lead.clickId)) {
      console.log("❌ INVALID clickId:", lead.clickId);
      return res.status(400).send("Invalid clickId");
    }

    const click = await Click.findById(lead.clickId);
    if (!click) return res.status(400).send("Click not found");

    // ❌ invalid offerId fix
    if (!mongoose.Types.ObjectId.isValid(lead.offerId)) {
      return res.status(400).send("Invalid offerId");
    }

    const offer = await Offer.findById(lead.offerId);
    if (!offer) return res.status(400).send("Offer not found");

    // 🔥 SAFE smartlink
    let percent = 50;

    if (
      click.smartlink_id &&
      mongoose.Types.ObjectId.isValid(click.smartlink_id)
    ) {
      const smartlink = await Smartlink.findById(click.smartlink_id);
      if (smartlink?.affiliate_percent) {
        percent = smartlink.affiliate_percent;
      }
    }

    // 💰 calculation
    const payout = Number(lead.revenue || offer.payout || 0);
    const earning = (payout * percent) / 100;

    // 💾 update lead
    lead.status = "approved";
    await lead.save();

    // ❌ userId safety
    if (!mongoose.Types.ObjectId.isValid(lead.userId)) {
      return res.status(400).send("Invalid userId");
    }

    // 💰 update user
    await User.findByIdAndUpdate(lead.userId, {
      $inc: {
        balance: earning,
        pendingBalance: -payout,
        total_earned: earning
      }
    });

    res.json({
      success: true,
      payout,
      earning
    });

  } catch (err) {
    console.log("🔥 APPROVE ERROR:", err);
    res.status(500).send("Server Error");
  }
});


// ===============================
// ❌ DECLINE LEAD
// ===============================
router.patch("/leads/:id/decline", auth, admin, async (req, res) => {
  try {
    const leadId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).send("Invalid lead ID");
    }

    const lead = await Conversion.findById(leadId);

    if (!lead) return res.status(404).send("Lead not found");

    if (lead.status !== "pending") {
      return res.status(400).send("Already processed");
    }

    lead.status = "declined";
    await lead.save();

    await User.findByIdAndUpdate(lead.userId, {
      $inc: {
        pendingBalance: -Number(lead.revenue || 0)
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.log("DECLINE ERROR:", err);
    res.status(500).send("Server Error");
  }
});


module.exports = router;