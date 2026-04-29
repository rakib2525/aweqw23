const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({

  // =========================
  // 🔗 RELATIONS
  // =========================
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: true
  },

  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // =========================
  // 💰 EARNINGS SYSTEM
  // =========================

  // 🔥 Affiliate earning (main payout)
  affiliate_earning: {
    type: Number,
    default: 0
  },

  // 🔥 Manager commission cut
  manager_cut: {
    type: Number,
    default: 0
  },

  // 🔥 Admin profit (your income 💰)
  admin_cut: {
    type: Number,
    default: 0
  },

  // 🔥 Total revenue from offer
  revenue: {
    type: Number,
    default: 0
  },

  // =========================
  // 📊 STATUS
  // =========================
  status: {
    type: String,
    enum: ["pending", "approved", "paid"],
    default: "pending"
  },

  // =========================
  // 🧠 EXTRA (FUTURE SAFE)
  // =========================
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null
  },

  note: {
    type: String,
    default: ""
  },

  // =========================
  // 🕒 TIME
  // =========================
  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  }

});

// 🔥 AUTO UPDATE TIME
commissionSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Commission", commissionSchema);