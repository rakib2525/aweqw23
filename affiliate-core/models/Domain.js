const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  // 🌐 domain name
  domain: {
    type: String,
    required: true,
    unique: true
  },

  // 🔗 smartlink connect
  smartlink_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Smartlink",
    required: true
  },

  // 🔥 status control
  status: {
    type: String,
    enum: ["active", "paused"],
    default: "active"
  },

  // 📊 tracking info (future use)
  total_clicks: {
    type: Number,
    default: 0
  },

  // 🧠 owner
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Domain", domainSchema);