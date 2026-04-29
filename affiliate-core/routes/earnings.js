const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Commission = require("../models/Commission");

const auth = require("../middleware/auth");

const router = express.Router();

// ===============================
// 📊 GET USER BALANCE
// ===============================
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: {
        balance: user.balance || 0,
        total_earned: user.total_earned || 0,
      },
    });

  } catch (err) {
    console.error("❌ BALANCE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// ===============================
// 📊 COMMISSION HISTORY
// ===============================
router.get("/history", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const commissions = await Commission.find({
      user_id: userId,
    })
      .sort({ created_at: -1 })
      .lean();

    return res.json({
      success: true,
      data: commissions || [],
    });

  } catch (err) {
    console.error("❌ HISTORY ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// ===============================
// 📈 DAILY GRAPH
// ===============================
router.get("/graph", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const data = await Commission.aggregate([
      {
        $match: {
          user_id: userId,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$created_at",
            },
          },
          total: {
            $sum: {
              $ifNull: ["$affiliate_earning", 0], // 🔥 safe sum
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.json({
      success: true,
      data: data || [],
    });

  } catch (err) {
    console.error("❌ GRAPH ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;