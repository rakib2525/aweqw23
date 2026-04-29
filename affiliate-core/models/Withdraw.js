const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  // 🔥 FIX: use consistent naming (same as Conversion → userId)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  amount: {
    type: Number,
    required: true,
    min: 1
  },

  method: {
    type: String,
    required: true, // bkash / nagad / paypal / binance
    trim: true
  },

  account: {
    type: String,
    required: true, // phone / email / wallet
    trim: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true
  },

  note: {
    type: String,
    default: ""
  },

  // 🔥 NEW: processed time (admin approve করলে useful)
  processedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Withdraw", withdrawSchema);