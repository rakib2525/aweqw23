const mongoose = require("mongoose");

const conversionSchema = new mongoose.Schema({
  // 🔥 CLICK ID
  clickId: {
    type: String,
    required: true,
    index: true
  },

  // 👤 USER
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  // 🎯 OFFER
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    required: true,
    index: true
  },

  // 🔥 SUBID TRACKING
  subid: {
    type: String,
    default: null
  },

  // 🌍 GEO
  country: {
    type: String,
    default: null
  },

  // 💻 DEVICE
  device: {
    type: String,
    default: null
  },

  // 💰 REVENUE
  revenue: {
    type: Number,
    default: 0
  },

  // 📊 STATUS
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, {
  timestamps: true
});

// ===============================
// ✅ SAFE INDEX (NO DUPLICATE)
// ===============================
conversionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Conversion", conversionSchema);