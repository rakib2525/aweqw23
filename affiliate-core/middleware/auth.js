const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // ❌ No Authorization header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // ❌ Invalid format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    // ✅ Extract token safely
    const token = authHeader.split(" ")[1]?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // ❌ ENV check
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET missing in .env");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Normalize user id
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    // ✅ Attach user to request
    req.user = {
      id: userId,
      role: decoded.role || "affiliate",
    };

    // 🔥 DEBUG (only dev)
    if (process.env.NODE_ENV !== "production") {
      console.log("🔐 AUTH USER:", req.user);
    }

    next();

  } catch (err) {
    console.error("❌ TOKEN ERROR:", err.message);

    // 🔥 Token expired
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // 🔥 Invalid token
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // 🔥 Fallback
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};