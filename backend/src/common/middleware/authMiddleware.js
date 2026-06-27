const { User } = require("../../models");

const protect = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authorized, no session" });
    }
    req.user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] },
    });
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized" });
  }
};

const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

const optionalAuth = async (req, res, next) => {
  req.user = null;
  if (req.session?.userId) {
    try {
      req.user = await User.findByPk(req.session.userId, {
        attributes: { exclude: ["password"] },
      });
    } catch {
      /* invalid session — treat as guest */
    }
  }
  return next();
};

module.exports = { protect, admin, optionalAuth };
