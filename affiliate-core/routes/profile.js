const express = require("express");
const router = express.Router();

const User = require("../models/User");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const bcrypt = require("bcryptjs"); // ✅ ADD

// =========================
// 🔥 GET PROFILE
// =========================
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error("PROFILE GET ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 🔥 UPDATE PROFILE
// =========================
router.put("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name required ❗"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 🔐 CHANGE PASSWORD (FIXED)
// =========================
router.put("/password", auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password too short ❗"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔥 HASH PASSWORD (VERY IMPORTANT)
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password updated 🔐"
    });

  } catch (err) {
    console.error("PASSWORD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 💳 SAVE WALLET
// =========================
router.put("/wallet", auth, async (req, res) => {
  try {
    const { method, account } = req.body;

    if (!method || !account) {
      return res.status(400).json({
        success: false,
        message: "Wallet info required ❗"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔒 LOCK CHECK
    if (user.walletLocked) {
      return res.status(400).json({
        success: false,
        message: "Wallet already locked 🔒"
      });
    }

    user.wallet = { method, account };

    await user.save();

    res.json({
      success: true,
      message: "Wallet saved ✅"
    });

  } catch (err) {
    console.error("WALLET SAVE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 🔒 LOCK WALLET
// =========================
router.patch("/wallet/lock", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.wallet || !user.wallet.account) {
      return res.status(400).json({
        success: false,
        message: "Save wallet first ❗"
      });
    }

    user.walletLocked = true;
    await user.save();

    res.json({
      success: true,
      message: "Wallet locked 🔒"
    });

  } catch (err) {
    console.error("WALLET LOCK ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 🔓 ADMIN / MANAGER UNLOCK WALLET
// =========================
router.patch("/wallet/unlock/:id", auth, role("admin", "manager"), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 🔒 MANAGER SECURITY
    if (req.user.role === "manager") {
      if (!user.manager_id || user.manager_id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not your affiliate ❌"
        });
      }
    }

    user.walletLocked = false;
    await user.save();

    res.json({
      success: true,
      message: "Wallet unlocked 🔓"
    });

  } catch (err) {
    console.error("UNLOCK ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;