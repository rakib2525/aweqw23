const express = require("express");
const geoip = require("geoip-lite");
const { v4: uuidv4 } = require("uuid");

const Click = require("../models/Click");
const Smartlink = require("../models/Smartlink");
const Rule = require("../models/Rule");
const Offer = require("../models/Offer");
const Domain = require("../models/Domain");

const router = express.Router();

console.log("🔥 TRACK ROUTE LOADED");

// ===============================
// 🤖 BOT DETECTION
// ===============================
function isBot(userAgent = "") {
  const bots = [
    "facebookexternalhit",
    "Facebot",
    "Twitterbot",
    "LinkedInBot",
    "WhatsApp",
    "TelegramBot",
    "Googlebot"
  ];

  return bots.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

// ===============================
// 🚫 FRAUD DETECTION
// ===============================
async function detectFraud(ip) {
  const lastMinute = new Date(Date.now() - 60 * 1000);

  const clicks = await Click.countDocuments({
    ip,
    createdAt: { $gte: lastMinute }
  });

  return clicks > 10;
}

// ===============================
// 🧠 SMART SELECT
// ===============================
async function getBestOfferAI(offers, userId) {
  if (!offers.length) return null;

  const lastClicks = await Click.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("offer");

  const recentIds = lastClicks.map(c => c.offer.toString());

  let filtered = offers.filter(
    o => !recentIds.includes(o._id.toString())
  );

  if (!filtered.length) filtered = offers;

  filtered.sort((a, b) => (b.epc || 0) - (a.epc || 0));

  const top = filtered.slice(0, 3);
  const randomIndex = Math.floor(Math.random() * top.length);

  return top[randomIndex];
}

// ===============================
// 🚀 MAIN TRACK (🔥 FIXED)
// ===============================
router.get("/:id", async (req, res) => {
  try {
    let sl = req.params.id; // ✅ FIX HERE
    let { subid } = req.query;

    console.log("👉 Incoming Track:", { sl, subid });

    let host = req.headers.host || "";
    host = host.split(":")[0];

    let smartlink;

    const domain = await Domain.findOne({
      domain: host,
      status: "active"
    });

    if (domain) {
      smartlink = await Smartlink.findById(domain.smartlink_id);

      if (!smartlink) {
        return res.status(404).send("Smartlink not found (domain)");
      }

      sl = smartlink._id;

    } else {
      if (!sl) {
        return res.status(400).send("Missing smartlink");
      }

      smartlink = await Smartlink.findById(sl);

      if (!smartlink) {
        return res.status(404).send("Smartlink not found");
      }
    }

    if (!smartlink.user_id) {
      return res.status(400).send("Smartlink not linked to user");
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      "0.0.0.0";

    const userAgent = req.headers["user-agent"] || "";
    const bot = isBot(userAgent);
    const isFraud = await detectFraud(ip);

    const geo = geoip.lookup(ip);
    let country = geo?.country || "UNKNOWN";

    if (ip === "::1" || ip === "127.0.0.1") {
      country = "US";
    }

    const rules = await Rule.find({ smartlink_id: sl });

    const matchedRules = rules.filter(
      r => r.country && r.country === country
    );

    let offerIds = matchedRules.length
      ? matchedRules.map(r => r.offer_id)
      : [smartlink.default_offer];

    offerIds = offerIds.filter(Boolean);

    const offers = await Offer.find({
      _id: { $in: offerIds },
      status: "active"
    });

    if (!offers.length) {
      return res.status(404).send("No offers available");
    }

    const bestOffer = await getBestOfferAI(
      offers,
      smartlink.user_id
    );

    if (!bestOffer) {
      return res.status(500).send("Offer selection failed");
    }

    const session_id = uuidv4();

    await Click.create({
      user: smartlink.user_id,
      smartlink_id: sl,
      offer: bestOffer._id,
      subid: subid || null,
      ip,
      country,
      device: userAgent,
      session_id,
      isFraud,
      isConverted: false,
      revenue: 0
    });

    console.log("✅ CLICK SAVED");

    if (bot) {
      return res.redirect("https://www.google.com");
    }

    const separator = bestOffer.url.includes("?") ? "&" : "?";

    const redirect_url =
      `${bestOffer.url}${separator}click_id=${session_id}` +
      (subid ? `&subid=${subid}` : "");

    return res.redirect(redirect_url);

  } catch (err) {
    console.log("❌ TRACK ERROR:", err);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;