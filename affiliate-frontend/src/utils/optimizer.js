const Click = require("../models/Click");
const Offer = require("../models/Offer");

const runOptimizer = async () => {
  try {
    // 🔥 EPC calculate
    const stats = await Click.aggregate([
      {
        $group: {
          _id: "$offerId",
          clicks: { $sum: 1 },
          revenue: { $sum: "$revenue" }
        }
      }
    ]);

    // 🔥 EPC calculate
    const optimized = stats.map((s) => ({
      offerId: s._id,
      epc: s.clicks ? s.revenue / s.clicks : 0
    }));

    // 🔥 update weight
    for (let item of optimized) {
      const weight = Math.max(1, Math.round(item.epc * 100));

      await Offer.findByIdAndUpdate(item.offerId, {
        weight: weight
      });
    }

    console.log("✅ Optimizer ran successfully");
  } catch (err) {
    console.error("❌ Optimizer error:", err);
  }
};

module.exports = runOptimizer;