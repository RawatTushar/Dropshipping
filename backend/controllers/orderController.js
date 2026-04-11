const Order = require("../models/Order");
const Product = require("../models/Product");

const rollbackStock = async (changes) => {
  if (!changes.length) return;

  await Promise.all(
    changes.map((change) =>
      Product.findByIdAndUpdate(change.productId, {
        $inc: { countInStock: change.qty },
      })
    )
  );
};

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

    // Merge duplicate product rows to avoid double-updating stock for same product.
    const mergedItems = new Map();
    for (const item of orderItems) {
      const productId = String(item.product || "");
      const qty = Number(item.qty || 0);
      if (!productId || qty < 1) {
        return res.status(400).json({ message: "Invalid order item payload" });
      }

      const existing = mergedItems.get(productId);
      mergedItems.set(productId, {
        productId,
        qty: Number((existing?.qty || 0) + qty),
        name: item.name || existing?.name || "Product",
      });
    }

    const reservedChanges = [];
    for (const merged of mergedItems.values()) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: merged.productId,
          countInStock: { $gte: merged.qty },
        },
        {
          $inc: { countInStock: -merged.qty },
        },
        { new: true }
      );

      if (!updated) {
        await rollbackStock(reservedChanges);
        return res.status(400).json({
          message: `Insufficient stock for ${merged.name}. Please refresh products and try again.`,
        });
      }

      reservedChanges.push({ productId: merged.productId, qty: merged.qty });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    let created;
    try {
      created = await order.save();
    } catch (saveErr) {
      await rollbackStock(reservedChanges);
      throw saveErr;
    }

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

module.exports = { addOrderItems, getOrderById, getMyOrders };
