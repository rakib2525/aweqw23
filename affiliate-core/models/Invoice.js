const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  withdrawId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Withdraw"
  },

  amount: {
    type: Number,
    required: true
  },

  method: String,
  account: String,

  // 🔥 PERIOD SYSTEM
  period: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: "daily"
  },

  // 📅 range
  periodStart: Date,
  periodEnd: Date,

  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "paid"
  }

}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);