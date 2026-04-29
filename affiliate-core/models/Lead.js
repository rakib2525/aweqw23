const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({

  click_id: {
    type: String,
  },

  // 🔥 FIX → ObjectId (VERY IMPORTANT)
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // 🔥 OFFER RELATION
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true
  },

  // 🔥 3 STEP STATUS SYSTEM
  status: {
    type: String,
    enum: ["pending", "confirmed", "approved", "declined"],
    default: "pending"
  },

  fraud_flag: {
    type: Boolean,
    default: false
  },

  // 💰 PAYOUT FROM OFFER
  payout: {
    type: Number,
    default: 0
  },

  // 💰 OPTIONAL (store for fast query)
  affiliate_earning: {
    type: Number,
    default: 0
  },

  ip: {
    type: String
  },

}, {
  timestamps: true // 🔥 createdAt + updatedAt auto
});

module.exports = mongoose.model("Lead", leadSchema);