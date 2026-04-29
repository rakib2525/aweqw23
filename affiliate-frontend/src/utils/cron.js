const cron = require("node-cron");
const runOptimizer = require("./optimizer");

// 🔥 প্রতি 10 মিনিটে run
const startCron = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏱ Running optimization...");
    await runOptimizer();
  });
};

module.exports = startCron;