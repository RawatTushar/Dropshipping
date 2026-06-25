const { Order, OrderItem, User } = require("../../models");
const {
  createOrderWithInventory,
  restoreInventoryFromCanceledOrder,
} = require("./order.fulfillment");

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
      userId: req.user.id,
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
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }, { model: OrderItem, as: "orderItems" }],
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    const ownerId = order.user?.id ?? order.userId;
    if (ownerId !== req.user.id && !req.user.isAdmin) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, as: 'orderItems' }] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: OrderItem, as: "orderItems" }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const ORDER_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const ORDER_CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * User updates own order (delivery address only) within 24h of placing it.
 */
const updateMyOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId !== req.user.id) {
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

    if (shippingAddress.address != null) {
      order.shippingAddress = String(shippingAddress.address).trim();
    }
    if (shippingAddress.city != null) {
      order.shippingCity = String(shippingAddress.city).trim();
    }
    if (shippingAddress.postalCode != null) {
      order.shippingPostalCode = String(shippingAddress.postalCode).trim();
    }
    if (shippingAddress.country != null) {
      order.shippingCountry = String(shippingAddress.country).trim();
    }

    const addr = String(order.shippingAddress || "").trim();
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
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'orderItems' }] });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.userId !== req.user.id) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.isDelivered) {
      return res
        .status(400)
        .json({ message: "Delivered orders cannot be cancelled." });
    }
    const placedAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(placedAt)) {
      return res.status(400).json({ message: "Invalid order data." });
    }
    if (Date.now() - placedAt > ORDER_CANCEL_WINDOW_MS) {
      return res.status(400).json({
        message:
          "This order can no longer be cancelled. The 24-hour delete window has passed.",
      });
    }

    await restoreInventoryFromCanceledOrder(order);

    await order.destroy();
    res.json({ message: "Order cancelled", _id: order.id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateMyOrder,
  cancelMyOrder,
};
