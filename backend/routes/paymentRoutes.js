const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  completeStripeCheckout,
  getPaymentConfig,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/config", getPaymentConfig);
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/stripe/complete", protect, completeStripeCheckout);

module.exports = router;
