const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = require("../middleware/auth");
const { generateToken } = require("../utils/token");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// =========================
// 🔐 REGISTER
// =========================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "affiliate",
      status: "active",
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =========================
// 🔐 LOGIN
// =========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Wrong password",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =========================
// 🔁 REFRESH TOKEN
// =========================
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No token",
      });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Expired token",
      });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });

  } catch (err) {
    console.error("REFRESH ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =========================
// 🔓 LOGOUT
// =========================
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    return res.json({
      success: true,
      data: null,
    });

  } catch (err) {
    console.error("LOGOUT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// =========================
// 🔗 SMARTLINK
// =========================
router.get("/smartlink/:code", auth, async (req, res) => {
  try {
    const { code } = req.params;

    const token = generateToken(req.user.id);

    const link = `${
      process.env.BASE_URL || "http://localhost:5000"
    }/${code}?t=${token}`;

    return res.json({
      success: true,
      data: {
        link,
      },
    });

  } catch (err) {
    console.error("SMARTLINK ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;