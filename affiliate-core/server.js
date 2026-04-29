require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");

console.log("🚀 MAIN SERVER FILE RUNNING");

const app = express();

// ================= ENV =================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing");
  process.exit(1);
}

// ================= DNS =================
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ================= MIDDLEWARE =================
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.json());

// DEV LOGGER
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("👉", req.method, req.originalUrl);
    next();
  });
}

// ================= ROUTES =================
console.log("📁 Loading routes...");

const adminRoute = require("./routes/admin");
const managerRoute = require("./routes/manager");
const trackRoute = require("./routes/track");
const leadRoute = require("./routes/lead");
const statsRoute = require("./routes/stats");
const earningsRoute = require("./routes/earnings");
const withdrawRoute = require("./routes/withdraw");
const authRoute = require("./routes/auth");
const offerRoute = require("./routes/offers");
const postbackRoute = require("./routes/postback");
const conversionRoute = require("./routes/conversion");
const smartlinkRoute = require("./routes/smartlink");
const domainRoute = require("./routes/domain");
const profileRoute = require("./routes/profile");
const invoiceRoute = require("./routes/invoice");

console.log("✅ ALL ROUTES LOADED");

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI, {
  autoIndex: true,
})
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch(err => {
  console.error("❌ Mongo Error:", err);
  process.exit(1);
});

// ================= ROUTES MOUNT =================
console.log("📡 Mounting routes...");

// AUTH
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);

// OTHER
app.use("/api/invoice", invoiceRoute);
app.use("/api/admin", adminRoute);
app.use("/api/manager", managerRoute);
app.use("/api/lead", leadRoute);
app.use("/api/stats", statsRoute);
app.use("/api/earnings", earningsRoute);
app.use("/api/withdraw", withdrawRoute);
app.use("/api/offers", offerRoute);
app.use("/api/conversion", conversionRoute);
app.use("/api/smartlinks", smartlinkRoute);
app.use("/api/domains", domainRoute);

// 🔥 FIXED: ONLY ONE TRACK ROUTE
app.use("/track", trackRoute);

// PUBLIC
app.use("/r", smartlinkRoute);
app.use("/postback", postbackRoute);

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API Running"
  });
});

// ================= 404 =================
app.use((req, res) => {
  console.log("❌ ROUTE NOT FOUND:", req.originalUrl);

  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

// ================= ERROR =================
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message
  });
});

// ================= START =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= SHUTDOWN =================
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
  console.log("🛑 Shutting down...");

  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB closed");
  } catch (err) {
    console.error("❌ DB close error:", err);
  }

  server.close(() => {
    console.log("💀 Server closed");
    process.exit(0);
  });
}