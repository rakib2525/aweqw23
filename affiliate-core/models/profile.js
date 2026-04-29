const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// ================= GET PROFILE =================
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  res.json({
    success: true,
    data: user,
  });
});

// ================= UPDATE BASIC =================
router.put("/update", auth, async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    );

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ================= CHANGE PASSWORD =================
router.put("/password", auth, async (req, res) => {
  try {
    const { password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hash,
    });

    res.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ================= SAVE WALLET =================
router.put("/wallet", auth, async (req, res) => {
  try {
    const { method, account } = req.body;

    const user = await User.findById(req.user.id);

    if (user.walletLocked) {
      return res.status(400).json({
        success: false,
        message: "Wallet is locked 🔒",
      });
    }

    user.wallet = { method, account };
    await user.save();

    res.json({
      success: true,
      message: "Wallet saved",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ================= LOCK WALLET =================
router.put("/wallet-lock", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      walletLocked: true,
    });

    res.json({
      success: true,
      message: "Wallet locked 🔒",
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;