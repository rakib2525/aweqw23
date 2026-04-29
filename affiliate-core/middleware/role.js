module.exports = (...roles) => {
  return (req, res, next) => {
    try {
      // ❗ check user exists
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized ❌",
        });
      }

      // ❗ check role exists
      if (!req.user.role) {
        return res.status(400).json({
          success: false,
          message: "User role missing ❌",
        });
      }

      // ❗ normalize role (safety: lowercase)
      const userRole = req.user.role.toLowerCase();

      // ❗ normalize allowed roles
      const allowedRoles = roles.map((r) => r.toLowerCase());

      // ❗ check access
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access denied ❌",
        });
      }

      next();
    } catch (err) {
      console.error("ROLE MIDDLEWARE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
};