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
const { protect, admin, optionalAuth } = require("../../common/middleware/authMiddleware");

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/:id/recommendations", optionalAuth, getRecommendations);
router.post("/:id/interaction", optionalAuth, recordInteraction);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
