const jwt = require("jsonwebtoken");
const { User } = require("../../models");
const { readAuthCookieToken } = require("../auth/authCookies");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      next();
    } catch {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // fallback to httpOnly cookie
    token = readAuthCookieToken(req);
    if (!token) return res.status(401).json({ message: "Not authorized, no token" });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      next();
    } catch {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
};

const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

/** Attaches `req.user` when a valid Bearer token is present; otherwise continues as guest. */
const optionalAuth = async (req, res, next) => {
  req.user = null;
  let token = "";
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = readAuthCookieToken(req);
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch {
    /* invalid or expired token — treat as guest */
  }
  return next();
};

module.exports = { protect, admin, optionalAuth };
