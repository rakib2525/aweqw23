const mongoose = require("mongoose");

const ruleSchema = new mongoose.Schema({
  smartlink_id: String,

  country: String,

  // 🔥 FIX
  offer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer"
  },

  priority: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model("Rule", ruleSchema);