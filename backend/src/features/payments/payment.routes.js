const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  completeStripeCheckout,
  getPaymentConfig,
} = require("./payment.controller");

const { protect } = require("../../common/middleware/authMiddleware");

/**
 * @swagger
 * /api/payments/config:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment configuration
 *     responses:
 *       200:
 *         description: Payment configuration fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               provider: stripe
 *               currency: INR
 */
router.get("/config", getPaymentConfig);

/**
 * @swagger
 * /api/payments/create-checkout-session:
 *   post:
 *     tags: [Payments]
 *     summary: Create Stripe Checkout Session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             orderId: "68591738f4a5f3"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             example:
 *               sessionId: "cs_test_xxxxxx"
 *               url: "https://checkout.stripe.com/..."
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/create-checkout-session",
  protect,
  createCheckoutSession
);

/**
 * @swagger
 * /api/payments/stripe/complete:
 *   post:
 *     tags: [Payments]
 *     summary: Complete Stripe Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             sessionId: "cs_test_xxxxxx"
 *     responses:
 *       200:
 *         description: Payment completed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               paymentStatus: paid
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/stripe/complete",
  protect,
  completeStripeCheckout
);

module.exports = router;