const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // ✅ NEW: role added (secure enum)
    role: {
      type: String,
      enum: ["affiliate", "manager"],
      required: true,
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    approvedDate: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // 🔥 createdAt + updatedAt auto
  }
);

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);