module.exports = function (req, res, next) {
  try {
    // 🔒 check user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔥 admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only access" });
    }

    next();

  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};