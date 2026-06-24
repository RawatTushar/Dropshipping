const express = require("express");
const router = express.Router();

const { getAdminInsights } = require("./adminInsights.controller");
const { protect, admin } = require("../../common/middleware/authMiddleware");

/**
 * @swagger
 * /api/admin/insights:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard insights
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard insights retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               totalUsers: 120
 *               totalOrders: 450
 *               totalProducts: 75
 *               revenue: 250000
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/insights", protect, admin, getAdminInsights);

module.exports = router;