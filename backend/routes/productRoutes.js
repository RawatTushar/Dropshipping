const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  getRecommendations,
  recordInteraction,
} = require("../controllers/recommendationController");
const { protect, admin, optionalAuth } = require("../middleware/authMiddleware");

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.get("/:id/recommendations", optionalAuth, getRecommendations);
router.post("/:id/interaction", optionalAuth, recordInteraction);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
