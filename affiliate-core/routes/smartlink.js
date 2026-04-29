const express = require("express");
const axios = require("axios");
const router = express.Router();

const Offer = require("../models/Offer");
const Click = require("../models/Click");
const Smartlink = require("../models/Smartlink"); // ✅ ADD
const { pickByWeight } = require("../utils/pickByWeight");
const { verifyToken } = require("../utils/token");
const auth = require("../middleware/auth"); // ✅ ADD

// ===================================================
// 🔥 GET MY SMARTLINKS (API FIX)
// ===================================================
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const smartlinks = await Smartlink.find({
      user_id: userId
    }).populate("default_offer");

    res.json(smartlinks);

  } catch (err) {
    console.log("SMARTLINK FETCH ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch smartlinks"
    });
  }
});


// ===================================================
// 🚀 SMARTLINK REDIRECT (PUBLIC)
// ===================================================
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const token = req.query.t;

    // 🔐 TOKEN REQUIRED
    if (!token) {
      return res.status(403).send("Token required");
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(403).send("Invalid token");
    }

    const userId = decoded.id;

    // 🌐 IP + DEVICE
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const userAgent = req.headers["user-agent"] || "";
    const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";

    // 🌍 GEO
    let country = "ALL";

    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
      country = geoRes.data.countryCode || "ALL";
    } catch {}

    let offers = await Offer.find({
      smartlinkCode: code,
      country,
      device,
      status: "active",
    });

    if (!offers.length) {
      offers = await Offer.find({
        smartlinkCode: code,
        country,
        status: "active",
      });
    }

    if (!offers.length) {
      offers = await Offer.find({
        smartlinkCode: code,
        device,
        status: "active",
      });
    }

    if (!offers.length) {
      offers = await Offer.find({
        smartlinkCode: code,
        status: "active",
      });
    }

    if (!offers.length) {
      return res.redirect("https://google.com");
    }

    const selected = pickByWeight(offers);

    const sessionId =
      Date.now() + "_" + Math.random().toString(36).substring(2);

    await Click.create({
      offerId: selected._id,
      user_id: userId,
      smartlink_id: code,
      ip,
      country,
      device,
      session_id: sessionId,
    });

    return res.redirect(`${selected.url}?click_id=${sessionId}`);

  } catch (err) {
    console.error("SMARTLINK ERROR:", err);
    return res.redirect("https://google.com");
  }
});

module.exports = router;