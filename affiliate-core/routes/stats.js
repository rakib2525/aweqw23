const express = require("express");
const mongoose = require("mongoose");

const Click = require("../models/Click");
const Conversion = require("../models/Conversion");
const User = require("../models/User");
const Offer = require("../models/Offer");
const Lead = require("../models/Lead");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

const router = express.Router();

// ===============================
// 📊 GLOBAL STATS
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const { startDate, endDate, country, device, browser, offerId, subid } =
      req.query;

    const clickFilter = {};
    const conversionFilter = {};

    // 🔒 Affiliate filter
    if (userRole === "affiliate") {
      clickFilter.user = new mongoose.Types.ObjectId(userId);
      conversionFilter.userId = new mongoose.Types.ObjectId(userId);
    }

    // 📅 Date filter
    if (startDate || endDate) {
      clickFilter.createdAt = {};
      conversionFilter.createdAt = {};

      if (startDate) {
        clickFilter.createdAt.$gte = new Date(startDate);
        conversionFilter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        clickFilter.createdAt.$lte = new Date(endDate);
        conversionFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // 🎯 Filters
    if (country) clickFilter.country = country;
    if (device) clickFilter.device = device;
    if (browser) clickFilter.browser = browser;

    if (offerId && mongoose.Types.ObjectId.isValid(offerId)) {
      clickFilter.offer = new mongoose.Types.ObjectId(offerId);
      conversionFilter.offerId = new mongoose.Types.ObjectId(offerId);
    }

    if (subid) {
      clickFilter.subid = subid;
      conversionFilter.subid = subid;
    }

    // ================= COUNT =================
    const clicks = await Click.countDocuments(clickFilter);

    const approved = await Conversion.countDocuments({
      ...conversionFilter,
      status: "approved",
    });

    const pending = await Conversion.countDocuments({
      ...conversionFilter,
      status: "pending",
    });

    // ================= REVENUE =================
    const revenueData = await Conversion.aggregate([
      {
        $match: {
          ...conversionFilter,
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$revenue", 0],
            },
          },
        },
      },
    ]);

    const revenue = revenueData[0]?.total || 0;

    const cr =
      clicks > 0 ? Number(((approved / clicks) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      data: { clicks, approved, pending, revenue, cr },
    });

  } catch (err) {
    console.error("❌ STATS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Stats failed",
    });
  }
});


// ===============================
// 👨‍💼 MANAGER STATS
// ===============================
router.get("/manager", auth, role("manager"), async (req, res) => {
  try {
    const managerId = req.user.id;

    const affiliates = await User.find({
      manager_id: managerId,
      role: "affiliate",
    }).select("_id");

    const affiliateIds = affiliates.map((a) => a._id);

    const clicks = await Click.countDocuments({
      user: { $in: affiliateIds },
    });

    const leads = await Lead.find({
      user_id: { $in: affiliateIds },
    }).lean();

    const totalLeads = leads.length;
    const approved = leads.filter((l) => l.status === "approved").length;
    const pending = leads.filter((l) => l.status === "pending").length;

    const revenue = leads
      .filter((l) => l.status === "approved")
      .reduce((sum, l) => sum + (l.payout || 0), 0);

    return res.json({
      success: true,
      data: {
        affiliates: affiliateIds.length,
        clicks,
        totalLeads,
        approved,
        pending,
        revenue,
      },
    });

  } catch (err) {
    console.error("❌ MANAGER STATS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Manager stats failed",
    });
  }
});


// ===============================
// 📈 EPC
// ===============================
router.get("/epc", auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    const clickMatch = { offer: { $ne: null } };
    const convMatch = { status: "approved" };

    if (userRole === "affiliate") {
      clickMatch.user = new mongoose.Types.ObjectId(userId);
      convMatch.userId = new mongoose.Types.ObjectId(userId);
    }

    const stats = await Click.aggregate([
      { $match: clickMatch },
      {
        $group: {
          _id: "$offer",
          clicks: { $sum: 1 },
        },
      },
    ]);

    const conversions = await Conversion.aggregate([
      { $match: convMatch },
      {
        $group: {
          _id: "$offerId",
          revenue: {
            $sum: { $ifNull: ["$revenue", 0] },
          },
          conversions: { $sum: 1 },
        },
      },
    ]);

    const convMap = {};
    conversions.forEach((c) => {
      if (c._id) convMap[c._id.toString()] = c;
    });

    const result = await Promise.all(
      stats.map(async (s) => {
        if (!s._id) return null;

        const id = s._id.toString();
        const conv = convMap[id];

        const revenue = conv?.revenue || 0;
        const conversionsCount = conv?.conversions || 0;

        const offer = await Offer.findById(id).select("name");

        return {
          offerId: s._id,
          name: offer?.name || "Unknown",
          clicks: s.clicks,
          conversions: conversionsCount,
          revenue,
          epc: revenue / (s.clicks || 1),
          cr: (conversionsCount / (s.clicks || 1)) * 100,
        };
      })
    );

    return res.json({
      success: true,
      data: result.filter(Boolean),
    });

  } catch (err) {
    console.error("❌ EPC ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "EPC failed",
    });
  }
});


// ===============================
// 🏆 TOP AFFILIATES
// ===============================
router.get("/top-affiliates", auth, role("admin"), async (req, res) => {
  try {
    const data = await Conversion.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$userId",
          revenue: {
            $sum: { $ifNull: ["$revenue", 0] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const result = await Promise.all(
      data.map(async (item) => {
        const user = await User.findById(item._id).select("name email");

        return {
          _id: item._id,
          name: user?.name || "Unknown",
          email: user?.email || "",
          revenue: item.revenue,
        };
      })
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("❌ TOP AFFILIATES ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Top affiliates failed",
    });
  }
});


// ===============================
// 💰 TOP OFFERS
// ===============================
router.get("/top-offers", auth, role("admin"), async (req, res) => {
  try {
    const data = await Conversion.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$offerId",
          revenue: {
            $sum: { $ifNull: ["$revenue", 0] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const result = await Promise.all(
      data.map(async (item) => {
        const offer = await Offer.findById(item._id).select("name");

        return {
          _id: item._id,
          name: offer?.name || "Unknown",
          revenue: item.revenue,
        };
      })
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("❌ TOP OFFERS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Top offers failed",
    });
  }
});

module.exports = router;