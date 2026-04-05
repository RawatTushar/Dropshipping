const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  confirmEmail,
  getMe,
  requestLoginOtp,
  verifyLoginOtp,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/confirm-email/:token", confirmEmail);
router.get("/me", protect, getMe);
router.post("/login-otp/send", requestLoginOtp);
router.post("/login-otp/verify", verifyLoginOtp);

module.exports = router;
