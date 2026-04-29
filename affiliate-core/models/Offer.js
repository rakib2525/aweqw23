const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  name: String,
  url: String,
  payout: { type: Number, default: 0 },

  countries: [String],
  devices: [String],

  weight: { type: Number, default: 1 },
  priority: { type: Number, default: 0 },

  status: { type: String, default: "active" },

  dailyCap: { type: Number, default: 0 },
  todayConversions: { type: Number, default: 0 },

  // 🔥 NEW FIELD
  lastPausedAt: {
    type: Date,
    default: null
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Offer", OfferSchema);