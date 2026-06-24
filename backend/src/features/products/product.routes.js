const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./product.controller");

const {
  getRecommendations,
  recordInteraction,
} = require("./recommendation.controller");

const {
  protect,
  admin,
  optionalAuth,
} = require("../../common/middleware/authMiddleware");

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: iPhone 15
 *             description: Latest Apple smartphone
 *             price: 79999
 *             brand: Apple
 *             category: Mobile
 *             countInStock: 20
 *             image: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.route("/")
  .get(getProducts)
  .post(protect, admin, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *
 *   put:
 *     tags: [Products]
 *     summary: Update product
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
 *             name: Updated Product
 *             price: 999
 *             description: Updated Description
 *     responses:
 *       200:
 *         description: Product updated
 *
 *   delete:
 *     tags: [Products]
 *     summary: Delete product
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
 *         description: Product deleted
 */
router.route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

/**
 * @swagger
 * /api/products/{id}/recommendations:
 *   get:
 *     tags: [Recommendations]
 *     summary: Get product recommendations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recommendations fetched successfully
 */
router.get("/:id/recommendations", optionalAuth, getRecommendations);

/**
 * @swagger
 * /api/products/{id}/interaction:
 *   post:
 *     tags: [Recommendations]
 *     summary: Record user interaction with a product
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
 *             action: view
 *     responses:
 *       200:
 *         description: Interaction recorded successfully
 */
router.post("/:id/interaction", optionalAuth, recordInteraction);

module.exports = router;