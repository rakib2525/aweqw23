const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    // 🔥 affiliate user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🔥 offer
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      index: true,
    },

    // 🔗 smartlink
    smartlink_id: {
      type: String,
      default: null,
      index: true,
    },

    // 🔥 SUBID TRACKING (UPDATED)
    subid: {
      type: String,
      default: null,
      index: true, // ✅ important for filtering
    },

    // 🌐 tracking
    ip: {
      type: String,
      default: "0.0.0.0",
      index: true,
    },

    country: {
      type: String,
      default: "Unknown",
    },

    device: {
      type: String,
      default: "Unknown",
    },

    // 🔥 UNIQUE CLICK ID
    session_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 💰 revenue
    revenue: {
      type: Number,
      default: 0,
    },

    // ✅ conversion
    isConverted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🚫 fraud
    isFraud: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ===============================
// ✅ SAFE INDEX (NO DUPLICATE)
// ===============================
clickSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Click", clickSchema);