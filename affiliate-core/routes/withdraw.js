const express = require("express");
const router = express.Router();

const Withdraw = require("../models/Withdraw");
const User = require("../models/User");
const mongoose = require("mongoose");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

// 🔥 NEW: INVOICE GENERATOR
const generateInvoice = require("../utils/generateInvoice");

// ================= USER =================

// 🔥 REQUEST WITHDRAW (SECURED)
router.post("/", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (amount < 10) {
      return res.status(400).json({ success: false, message: "Minimum withdraw is $10" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔒 MUST LOCK WALLET
    if (!user.walletLocked) {
      return res.status(400).json({
        success: false,
        message: "Lock your wallet first 🔒"
      });
    }

    // 🔒 MUST HAVE WALLET
    if (!user.wallet || !user.wallet.account) {
      return res.status(400).json({
        success: false,
        message: "Add wallet first ❗"
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // 🔥 prevent multiple pending
    const pending = await Withdraw.findOne({
      userId: user._id,
      status: "pending"
    });

    if (pending) {
      return res.status(400).json({
        success: false,
        message: "Already have pending request"
      });
    }

    // ✅ wallet auto attach
    const withdraw = await Withdraw.create({
      userId: user._id,
      amount,
      method: user.wallet.method,
      account: user.wallet.account,
      role: req.user.role,
      status: "pending"
    });

    res.json({
      success: true,
      data: withdraw
    });

  } catch (err) {
    console.error("WITHDRAW REQUEST ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// 🔥 USER HISTORY
router.get("/my", auth, async (req, res) => {
  try {
    const data = await Withdraw.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("WITHDRAW HISTORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ================= ADMIN + MANAGER =================

// 🔥 GET ALL WITHDRAW REQUESTS
router.get("/", auth, role("admin", "manager"), async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "manager") {
      const affiliates = await User.find({
        manager_id: req.user.id,
        role: "affiliate"
      }).select("_id");

      const ids = affiliates.map(a => a._id);
      query.userId = { $in: ids };
    }

    const data = await Withdraw.find(query)
      .populate("userId", "name email balance")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error("GET WITHDRAW ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// 🔥 AFFILIATE WITHDRAW HISTORY
router.get("/affiliate-withdraws/:id", auth, role("admin", "manager"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (req.user.role === "manager") {
      const user = await User.findById(userId);

      if (!user || user.manager_id?.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not your affiliate ❌"
        });
      }
    }

    const data = await Withdraw.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error("AFFILIATE WITHDRAW ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// 🔥 APPROVE WITHDRAW + AUTO INVOICE 🔥
router.patch("/:id/approve", auth, role("admin", "manager"), async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const w = await Withdraw.findById(id);
    if (!w) return res.status(404).json({ success: false, message: "Withdraw not found" });

    if (w.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already processed" });
    }

    const user = await User.findById(w.userId);

    // 🔒 MANAGER SECURITY
    if (req.user.role === "manager") {
      if (!user.manager_id || user.manager_id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not your affiliate ❌"
        });
      }
    }

    if (user.balance < w.amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // 💸 deduct balance
    user.balance -= w.amount;
    user.withdrawn = (user.withdrawn || 0) + w.amount;
    await user.save();

    // ✅ update withdraw
    w.status = "approved";
    w.processedAt = new Date();
    await w.save();

    // =========================
    // 🔥 AUTO INVOICE CREATE
    // =========================
    await generateInvoice({
      user,
      withdraw: w
    });

    res.json({
      success: true,
      message: "Withdraw approved + Invoice created 🧾"
    });

  } catch (err) {
    console.error("APPROVE WITHDRAW ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// 🔥 REJECT WITHDRAW
router.patch("/:id/reject", auth, role("admin", "manager"), async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const w = await Withdraw.findById(id);
    if (!w) return res.status(404).json({ success: false, message: "Withdraw not found" });

    if (w.status !== "pending") {
      return res.status(400).json({ success: false, message: "Already processed" });
    }

    const user = await User.findById(w.userId);

    if (req.user.role === "manager") {
      if (!user.manager_id || user.manager_id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not your affiliate ❌"
        });
      }
    }

    w.status = "rejected";
    w.processedAt = new Date();
    await w.save();

    res.json({
      success: true,
      message: "Withdraw rejected"
    });

  } catch (err) {
    console.error("REJECT WITHDRAW ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;