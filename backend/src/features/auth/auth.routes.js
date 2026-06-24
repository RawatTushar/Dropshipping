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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: John Doe
 *             email: john@example.com
 *             password: Password123
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: john@example.com
 *             password: Password123
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/confirm-email/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Confirm user email
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email confirmed
 */
router.get("/confirm-email/:token", confirmEmail);

/**
 * @swagger
 * /api/auth/login-otp/send:
 *   post:
 *     tags: [Auth]
 *     summary: Send login OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post("/login-otp/send", requestLoginOtp);

/**
 * @swagger
 * /api/auth/login-otp/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify login OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: john@example.com
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified
 */
router.post("/login-otp/verify", verifyLoginOtp);

/**
 * @swagger
 * /api/auth/magic-link/send:
 *   post:
 *     tags: [Auth]
 *     summary: Send magic login link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: john@example.com
 *     responses:
 *       200:
 *         description: Magic link sent
 */
router.post("/magic-link/send", requestMagicLink);

/**
 * @swagger
 * /api/auth/magic-link/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify magic link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             token: abc123xyz
 *     responses:
 *       200:
 *         description: Magic link verified
 */
router.post("/magic-link/verify", verifyMagicLink);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Start Google OAuth login
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get("/google", startGoogleOAuth);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     responses:
 *       200:
 *         description: Google login successful
 */
router.get("/google/callback", googleOauthCallback);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", logoutUser);

// Backwards compatibility
router.get("/googl", startGoogleOAuth);

module.exports = router;