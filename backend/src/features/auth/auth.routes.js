const express = require("express");
const router = express.Router();
const { protect } = require("../../common/middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  confirmEmail,
  getMe,
  requestLoginOtp,
  verifyLoginOtp,
  logoutUser,
  requestMagicLink,
  verifyMagicLink,
  startGoogleOAuth,
  googleOauthCallback,
} = require("./auth.controller");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/confirm-email/:token", confirmEmail);
router.get("/me", protect, getMe);
router.post("/login-otp/send", requestLoginOtp);
router.post("/login-otp/verify", verifyLoginOtp);
router.post("/magic-link/send", requestMagicLink);
router.post("/magic-link/verify", verifyMagicLink);
router.get("/google", startGoogleOAuth);
// Backwards-compat alias for common typo
router.get("/googl", startGoogleOAuth);
router.get("/google/callback", googleOauthCallback);
router.post("/logout", logoutUser);

module.exports = router;
