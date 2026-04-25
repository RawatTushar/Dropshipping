const Order = require("../models/Order");
const {
  createOrderWithInventory,
  restoreInventoryFromCanceledOrder,
} = require("../services/orderFulfillmentService");

const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    if (!orderItems?.length) {
      return res.status(400).json({ message: "No order items" });
    }

    const created = await createOrderWithInventory({
      userId: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      paidAt: null,
      stripeSessionId: null,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const ownerId = order.user?._id?.toString() ?? order.user?.toString();
    if (ownerId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const ORDER_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * User updates own order (delivery address only) within 24h of placing it.
 */
const updateMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.isDelivered) {
      return res.status(400).json({ message: "Delivered orders cannot be edited." });
    }
    const placedAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(placedAt)) {
      return res.status(400).json({ message: "Invalid order data." });
    }
    if (Date.now() - placedAt > ORDER_EDIT_WINDOW_MS) {
      return res.status(400).json({
        message:
          "This order can no longer be edited. The 24-hour edit window has passed.",
      });
    }

    const { shippingAddress } = req.body;
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({ message: "shippingAddress is required." });
    }

    if (!order.shippingAddress) {
      order.shippingAddress = {};
    }

    if (shippingAddress.address != null) {
      order.shippingAddress.address = String(shippingAddress.address).trim();
    }
    if (shippingAddress.city != null) {
      order.shippingAddress.city = String(shippingAddress.city).trim();
    }
    if (shippingAddress.postalCode != null) {
      order.shippingAddress.postalCode = String(shippingAddress.postalCode).trim();
    }
    if (shippingAddress.country != null) {
      order.shippingAddress.country = String(shippingAddress.country).trim();
    }

    const addr = String(order.shippingAddress.address || "").trim();
    if (addr.length < 8) {
      return res.status(400).json({
        message: "Please provide a complete delivery address (at least 8 characters).",
      });
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * User cancels own order: restore stock, reduce soldCount, delete order.
 * Not allowed after marked delivered.
 */
const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.isDelivered) {
      return res
        .status(400)
        .json({ message: "Delivered orders cannot be cancelled." });
    }

    await restoreInventoryFromCanceledOrder(order);

    await Order.findByIdAndDelete(order._id);
    res.json({ message: "Order cancelled", _id: order._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  updateMyOrder,
  cancelMyOrder,
};
