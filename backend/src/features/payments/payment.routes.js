const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  completeStripeCheckout,
  getPaymentConfig,
} = require("./payment.controller");
const { protect } = require("../../common/middleware/authMiddleware");

router.get("/config", getPaymentConfig);
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/stripe/complete", protect, completeStripeCheckout);

module.exports = router;
