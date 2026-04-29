const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // =========================
  // 👤 BASIC INFO
  // =========================
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  // =========================
  // 🧠 ROLE SYSTEM
  // =========================
  role: {
    type: String,
    enum: ["admin", "manager", "affiliate"],
    default: "affiliate"
  },

  // =========================
  // 🚦 ACCOUNT STATUS
  // =========================
  status: {
    type: String,
    enum: ["active", "banned", "pending"],
    default: "active"
  },

  // =========================
  // 👨‍💼 MANAGER SYSTEM
  // =========================
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // =========================
  // 🔐 AUTH SYSTEM
  // =========================
  refreshToken: {
    type: String,
    default: null
  },

  // =========================
  // 💰 FINANCIALS
  // =========================
  balance: {
    type: Number,
    default: 0
  },

  pendingBalance: {
    type: Number,
    default: 0
  },

  total_earned: {
    type: Number,
    default: 0
  },

  withdrawn: {
    type: Number,
    default: 0
  },

  // =========================
  // 💳 WALLET SYSTEM (UPGRADED 🔥)
  // =========================
  wallet: {
    method: {
      type: String,
      default: null // 🔥 better than ""
    },
    account: {
      type: String,
      default: null
    }
  },

  walletLocked: {
    type: Boolean,
    default: false
  },

  // =========================
  // 🎯 OFFERS
  // =========================
  appliedOffers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer"
    }
  ],

  // =========================
  // 📊 TRACKING STATS
  // =========================
  totalClicks: {
    type: Number,
    default: 0
  },

  totalLeads: {
    type: Number,
    default: 0
  },

  totalApproved: {
    type: Number,
    default: 0
  },

  // =========================
  // 🌍 EXTRA INFO
  // =========================
  country: {
    type: String,
    default: null
  },

  device: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});

// =========================
// 🔥 INDEX
// =========================
userSchema.index({ role: 1 });
userSchema.index({ manager_id: 1 });

// =========================
// 🔥 VIRTUAL PROFIT
// =========================
userSchema.virtual("profit").get(function () {
  return this.total_earned - this.withdrawn;
});

module.exports = mongoose.model("User", userSchema);