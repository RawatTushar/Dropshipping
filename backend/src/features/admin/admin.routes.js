const express = require("express");
const router = express.Router();
const { getAdminInsights } = require("../controllers/adminInsightsController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/insights", protect, admin, getAdminInsights);

module.exports = router;
