const mongoose = require("mongoose");
const Order = require("./order.model");
const Product = require("../products/product.model");

function normalizeOrderItemProductId(item) {
  const p = item?.product;
  if (p == null) return "";
  if (typeof p === "object") {
    const id = p._id != null ? p._id : p.id;
    if (id != null) return String(id);
    return "";
  }
  const s = String(p).trim();
  return s === "[object Object]" ? "" : s;
}

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

/**
 * Creates an order, decrements stock, increments soldCount.
 * @param {object} params
 * @param {string} params.userId
 * @param {Array} params.orderItems
 * @param {object} params.shippingAddress
 * @param {string} params.paymentMethod
 * @param {number} params.itemsPrice
 * @param {number} params.shippingPrice
 * @param {number} params.taxPrice
 * @param {number} params.totalPrice
 * @param {boolean} [params.isPaid]
 * @param {Date} [params.paidAt]
 * @param {string} [params.stripeSessionId]
 */
async function createOrderWithInventory({
  userId,
  orderItems,
  shippingAddress,
  paymentMethod,
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
  isPaid = false,
  paidAt = null,
  stripeSessionId = null,
}) {
  if (!orderItems?.length) {
    throw new Error("No order items");
  }

  if (stripeSessionId) {
    const dup = await Order.findOne({ stripeSessionId });
    if (dup) return dup;
  }

  const mergedItems = new Map();
  for (const item of orderItems) {
    const productId = normalizeOrderItemProductId(item);
    const qty = Number(item.qty || 0);
    if (!productId || qty < 1) {
      throw new Error("Invalid order item payload");
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
      throw new Error(
        `Insufficient stock for ${merged.name}. Please refresh products and try again.`
      );
    }

    reservedChanges.push({ productId: merged.productId, qty: merged.qty });
  }

  const order = new Order({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid,
    paidAt: paidAt || undefined,
    stripeSessionId: stripeSessionId || undefined,
  });

  let created;
  try {
    created = await order.save();
  } catch (saveErr) {
    await rollbackStock(reservedChanges);
    throw saveErr;
  }

  await Promise.all(
    [...mergedItems.values()].map((m) =>
      Product.findByIdAndUpdate(m.productId, {
        $inc: { soldCount: m.qty },
      })
    )
  );

  return created;
}

/**
 * When an order is removed (cancel/delete), put units back in stock and unwind soldCount.
 * Uses aggregation-pipeline updates so counts stay consistent under concurrency.
 */
async function restoreInventoryFromCanceledOrder(order) {
  const merged = new Map();
  for (const oi of order.orderItems || []) {
    const pid = normalizeOrderItemProductId(oi);
    const q = Number(oi.qty || 0);
    if (!pid || q < 1) continue;
    if (!mongoose.Types.ObjectId.isValid(pid)) continue;
    merged.set(pid, (merged.get(pid) || 0) + q);
  }

  await Promise.all(
    [...merged.entries()].map(async ([productId, qty]) => {
      const product = await Product.findById(productId);
      if (!product) return;
      product.countInStock = Number(product.countInStock || 0) + qty;
      product.soldCount = Math.max(0, Number(product.soldCount || 0) - qty);
      await product.save();
    })
  );
}

module.exports = {
  createOrderWithInventory,
  rollbackStock,
  restoreInventoryFromCanceledOrder,
};
