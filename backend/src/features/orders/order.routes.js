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

router.route("/").post(protect, addOrderItems).get(protect, getMyOrders);
router.route("/admin/all").get(protect, admin, getAllOrders);
router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, updateMyOrder)
  .delete(protect, cancelMyOrder);

module.exports = router;
