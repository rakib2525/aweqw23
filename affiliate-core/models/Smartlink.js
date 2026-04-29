const mongoose = require("mongoose");

const smartlinkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  default_offer: {
    type: String,
    required: true
  },

  user_id: String,

  // 💰 AFFILIATE PERCENT
  affiliate_percent: {
    type: Number,
    default: 50 // 🔥 default 50%
  },

  // 🌐 DOMAIN (for custom tracking)
  domain: {
    type: String,
    default: "http://localhost:5000"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Smartlink", smartlinkSchema);