const express = require("express");
const router = express.Router();

console.log("🔥 ADMIN ROUTE FILE LOADED ✅");

const mongoose = require("mongoose");

const Lead = require("../models/Lead");
const Commission = require("../models/Commission");
const User = require("../models/User");
const Offer = require("../models/Offer");
const Smartlink = require("../models/Smartlink");

const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const role = require("../middleware/role");

// =========================
// 🧪 TEST ROUTE
// =========================
if (process.env.NODE_ENV !== "production") {
  router.get("/test", (req, res) => {
    res.send("ADMIN ROUTE OK");
  });
}

// =========================
// 🚀 CREATE MANAGER
// =========================
router.post("/create-manager", auth, role("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "manager",
      status: "active",
    });

    res.json({ success: true, data: manager });

  } catch (err) {
    console.error("❌ CREATE MANAGER ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// =========================
// 👨‍💼 GET MANAGERS
// =========================
router.get("/managers", auth, role("admin"), async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: managers });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =========================
// 🧠 ASSIGN MANAGER
// =========================
router.post("/assign-manager", auth, role("admin"), async (req, res) => {
  try {
    const { userId, managerId } = req.body;

    const user = await User.findById(userId);
    const manager = await User.findById(managerId);

    if (!user || !manager || manager.role !== "manager") {
      return res.status(400).json({ success: false });
    }

    user.manager_id = managerId;
    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =========================
// 👥 AFFILIATES
// =========================
router.get("/affiliates", auth, role("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "affiliate" })
      .populate("manager_id", "name email")
      .select("-password")
      .lean();

    res.json({ success: true, data: users });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =========================
// 🎯 ASSIGN OFFER
// =========================
router.post("/assign-offer", auth, role("admin", "manager"), async (req, res) => {
  try {
    const { userId, offerId } = req.body;

    const user = await User.findById(userId);
    const offer = await Offer.findById(offerId);

    if (!user || !offer) {
      return res.status(404).json({ success: false });
    }

    if (req.user.role === "manager") {
      if (!user.manager_id || user.manager_id.toString() !== req.user.id) {
        return res.status(403).json({ success: false });
      }
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
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// =========================
// ✅ APPROVE LEAD (🔥 MAIN FIX)
// =========================
router.patch("/leads/:id/approve", auth, role("admin"), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ success: false });

    if (lead.status === "approved") {
      return res.json({ success: true, message: "Already approved" });
    }

    lead.status = "approved";
    await lead.save();

    const user = await User.findById(lead.user_id);
    if (!user) return res.status(404).json({ success: false });

    const managerId = user.manager_id;

    const payout = lead.payout || 5;

    const manager_cut = payout * 0.1;
    const admin_cut = payout * 0.2;
    const affiliate_earning = payout - manager_cut - admin_cut;

    // 💰 BALANCE UPDATE (🔥 CORE FIX)
    user.balance = (user.balance || 0) + affiliate_earning;
    await user.save();

    // 👉 manager balance
    if (managerId) {
      const manager = await User.findById(managerId);
      if (manager) {
        manager.balance = (manager.balance || 0) + manager_cut;
        await manager.save();
      }
    }

    // 🧾 SAVE COMMISSION
    await Commission.create({
      user_id: user._id,
      lead_id: lead._id,
      manager_id: managerId,
      affiliate_earning,
      manager_cut,
      admin_cut,
      revenue: payout,
      status: "approved",
    });

    res.json({
      success: true,
      message: "Lead approved + balance added 💰"
    });

  } catch (err) {
    console.error("❌ APPROVE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// =========================
// ❌ DECLINE LEAD
// =========================
router.patch("/leads/:id/decline", auth, role("admin"), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) return res.status(404).json({ success: false });

    lead.status = "declined";
    await lead.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// =========================
// 💰 PAY COMMISSION
// =========================
router.patch("/commission/:id/pay", auth, role("admin"), async (req, res) => {
  try {
    const commission = await Commission.findById(req.params.id);

    if (!commission) return res.status(404).json({ success: false });

    commission.status = "paid";
    await commission.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;