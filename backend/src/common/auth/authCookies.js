const jwt = require("jsonwebtoken");

const COOKIE_NAME = "shipit_auth";

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });

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

