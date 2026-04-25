const express = require("express");
const router = express.Router();
const { getAdminInsights } = require("./adminInsights.controller");
const { protect, admin } = require("../../common/middleware/authMiddleware");

router.get("/insights", protect, admin, getAdminInsights);

module.exports = router;
