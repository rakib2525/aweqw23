const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const User = require("../models/User");
const Offer = require("../models/Offer");
const Smartlink = require("../models/Smartlink");
const Click = require("../models/Click");
const Lead = require("../models/Lead");
const Commission = require("../models/Commission");  // Import Commission model for earnings

const auth = require("../middleware/auth");
const role = require("../middleware/role");

// =========================
// 👥 GET MY AFFILIATES
// =========================
router.get("/affiliates", auth, role("manager"), async (req, res) => {
  try {
    const users = await User.find({
      role: "affiliate",
      manager_id: req.user.id,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (err) {
    console.error("❌ FETCH MANAGER AFFILIATES:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch affiliates",
    });
  }
});

// =========================
// 📊 AFFILIATE STATS (LIGHT)
// =========================
router.get("/affiliate-stats/:id", auth, role("manager"), async (req, res) => {
  try {
    const affiliateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(affiliateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid affiliate ID",
      });
    }

    const affiliate = await User.findById(affiliateId);

    if (!affiliate || affiliate.role !== "affiliate") {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    if (!affiliate.manager_id || affiliate.manager_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not your affiliate ❌",
      });
    }

    const clicks = await Click.countDocuments({ user: affiliateId });
    const leads = await Lead.find({ user_id: affiliateId });

    const totalLeads = leads.length;
    const approved = leads.filter(l => l.status === "approved").length;
    const pending = leads.filter(l => l.status === "pending").length;

    const revenue = leads
      .filter(l => l.status === "approved")
      .reduce((sum, l) => sum + (l.payout || 0), 0);

    res.json({
      success: true,
      data: {
        affiliateId,
        clicks,
        totalLeads,
        approved,
        pending,
        revenue,
      },
    });

  } catch (err) {
    console.error("❌ AFFILIATE STATS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load stats",
    });
  }
});

// =========================
// 🔥 AFFILIATE DETAILS (HEAVY ANALYTICS)
// =========================
router.get("/affiliate-details/:id", auth, role("manager"), async (req, res) => {
  try {
    const affiliateId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(affiliateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid affiliate ID",
      });
    }

    const affiliate = await User.findById(affiliateId);

    if (!affiliate || affiliate.role !== "affiliate") {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    if (!affiliate.manager_id || affiliate.manager_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not your affiliate ❌",
      });
    }

    // ================= SUMMARY
    const clicks = await Click.countDocuments({ user: affiliateId });
    const leads = await Lead.find({ user_id: affiliateId });

    const totalLeads = leads.length;
    const approved = leads.filter(l => l.status === "approved").length;
    const pending = leads.filter(l => l.status === "pending").length;

    const revenue = leads
      .filter(l => l.status === "approved")
      .reduce((sum, l) => sum + (l.payout || 0), 0);

    // ================= OFFER PERFORMANCE
    const offerStats = await Lead.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(affiliateId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$offer_id",
          revenue: { $sum: "$payout" },
          conversions: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // ================= CLICK TIMELINE (LAST 7 DAYS)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const clickTimeline = await Click.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(affiliateId),
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate._id,
          name: affiliate.name,
          email: affiliate.email,
        },
        summary: {
          clicks,
          totalLeads,
          approved,
          pending,
          revenue,
        },
        offerStats,
        clickTimeline,
      },
    });

  } catch (err) {
    console.error("❌ AFFILIATE DETAILS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load details",
    });
  }
});

// =========================
// 🎯 ASSIGN OFFER
// =========================
router.post("/assign-offer", auth, role("manager"), async (req, res) => {
  try {
    const { userId, offerId } = req.body;

    if (!userId || !offerId) {
      return res.status(400).json({
        success: false,
        message: "userId & offerId required",
      });
    }

    const user = await User.findById(userId);
    const offer = await Offer.findById(offerId);

    if (!user || !offer) {
      return res.status(404).json({
        success: false,
        message: "User or offer not found",
      });
    }

    if (!user.manager_id || user.manager_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not your affiliate ❌",
      });
    }

    if (!user.appliedOffers.includes(offerId)) {
      user.appliedOffers.push(offerId);
      await user.save();
    }

    let sl = await Smartlink.findOne({
      user_id: userId,
      default_offer: offerId,
    });

    if (!sl) {
      sl = await Smartlink.create({
        name: `${offer.name} - SL`,
        user_id: userId,
        default_offer: offerId,
      });
    }

    res.json({
      success: true,
      tracking_link: `${process.env.BASE_URL || "http://localhost:5000"}/track?sl=${sl._id}`,
    });

  } catch (err) {
    console.error("❌ ASSIGN OFFER ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Assign failed",
    });
  }
});

// =========================
// ❌ REMOVE AFFILIATE
// =========================
router.patch("/remove-affiliate/:id", auth, role("manager"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== "affiliate") {
      return res.status(404).json({
        success: false,
        message: "Affiliate not found",
      });
    }

    if (!user.manager_id || user.manager_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    user.manager_id = null;
    await user.save();

    res.json({
      success: true,
      message: "Affiliate removed from your team",
    });

  } catch (err) {
    console.error("❌ REMOVE AFFILIATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed",
    });
  }
});

// =========================
// 💰 MANAGER EARNINGS (NEW)
// =========================
router.get("/earnings", auth, role("manager"), async (req, res) => {
  try {
    const commissions = await Commission.find({
      manager_id: req.user.id,
      status: "approved"
    });

    const total = commissions.reduce(
      (sum, c) => sum + (c.manager_cut || 0),
      0
    );

    res.json({
      success: true,
      total,
      count: commissions.length
    });

  } catch (err) {
    console.error("❌ MANAGER EARNINGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load earnings"
    });
  }
});

module.exports = router;