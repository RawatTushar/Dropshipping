const express = require("express");
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateMyOrder,
  cancelMyOrder,
} = require("./order.controller");
const { protect } = require("../../common/middleware/authMiddleware");

router.route("/").post(protect, addOrderItems).get(protect, getMyOrders);
router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, updateMyOrder)
  .delete(protect, cancelMyOrder);

module.exports = router;
