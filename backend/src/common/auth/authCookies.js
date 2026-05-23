const jwt = require("jsonwebtoken");

const COOKIE_NAME = "shipit_auth";

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  // Secure cookies are ignored on http:// (e.g. local Docker). Set COOKIE_SECURE=true only behind HTTPS.
  secure: process.env.COOKIE_SECURE === "true",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  // Session JWT never exposed to JavaScript — mitigates XSS token theft.
});

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: "30d" });
};

const setAuthCookie = (res, userId) => {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, cookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
};

const readAuthCookieToken = (req) => {
  const t = req.cookies?.[COOKIE_NAME];
  return typeof t === "string" && t.length > 10 ? t : "";
};

module.exports = {
  COOKIE_NAME,
  setAuthCookie,
  clearAuthCookie,
  readAuthCookieToken,
  signToken,
};

