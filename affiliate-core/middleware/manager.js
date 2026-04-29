module.exports = function (req, res, next) {
  if (!req.user || !["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Manager access only ❌"
    });
  }

  next();
};