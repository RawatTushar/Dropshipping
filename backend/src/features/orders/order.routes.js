const express = require("express");
const router = express.Router();

const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateMyOrder,
  cancelMyOrder,
  getAllOrders,
} = require("./order.controller");

const { protect, admin } = require("../../common/middleware/authMiddleware");

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             orderItems:
 *               - product: "68591738f4a5f3"
 *                 quantity: 2
 *             shippingAddress:
 *               address: "Noida Sector 62"
 *               city: "Noida"
 *               postalCode: "201301"
 *               country: "India"
 *     responses:
 *       201:
 *         description: Order created
 *
 *   get:
 *     tags: [Orders]
 *     summary: Get My Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.route("/")
  .post(protect, addOrderItems)
  .get(protect, getMyOrders);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     tags: [Orders]
 *     summary: Get All Orders (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders fetched successfully
 *       403:
 *         description: Admin access required
 */
router.route("/admin/all")
  .get(protect, admin, getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get Order By ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order found
 *
 *   put:
 *     tags: [Orders]
 *     summary: Update Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             status: delivered
 *     responses:
 *       200:
 *         description: Order updated
 *
 *   delete:
 *     tags: [Orders]
 *     summary: Cancel Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.route("/:id")
  .get(protect, getOrderById)
  .put(protect, updateMyOrder)
  .delete(protect, cancelMyOrder);

module.exports = router;