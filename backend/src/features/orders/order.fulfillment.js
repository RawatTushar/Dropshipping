/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: OK
 */
const { Product, Order, OrderItem } = require("../../models");
const { sequelize } = require("../../config/db");

function normalizeOrderItemProductId(item) {
  const p = item?.product;
  if (p == null) return "";
  if (typeof p === "object") {
    const id = p.id || p._id;
    if (id != null) return String(id);
    return "";
  }
  const s = String(p).trim();
  return s === "[object Object]" ? "" : s;
}

const rollbackStock = async (changes) => {
  if (!changes.length) return;
  await Promise.all(
    changes.map(async (change) => {
      const p = await Product.findByPk(change.productId);
      if (!p) return;
      p.countInStock = Number(p.countInStock || 0) + change.qty;
      await p.save();
    })
  );
};

async function createOrderWithInventory({
  userId,
  orderItems,
  shippingAddress,
  paymentMethod,
  itemsPrice,
  taxPrice,
  shippingPrice,
  totalPrice,
  isPaid = false,
  paidAt = null,
  stripeSessionId = null,
}) {
  if (!orderItems?.length) {
    throw new Error("No order items");
  }

  if (stripeSessionId) {
    const dup = await Order.findOne({ where: { stripeSessionId } });
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

  const t = await sequelize.transaction();
  try {
    // Reserve stock and increment soldCount in the same transaction
    for (const merged of mergedItems.values()) {
      const product = await Product.findByPk(merged.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product || Number(product.countInStock || 0) < merged.qty) {
        throw new Error(
          `Insufficient stock for ${merged.name}. Please refresh products and try again.`
        );
      }
      product.countInStock = Number(product.countInStock) - merged.qty;
      product.soldCount = Number(product.soldCount || 0) + merged.qty;
      await product.save({ transaction: t });
    }

    // Map shippingAddress into order fields
    const orderPayload = {
      userId,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: paidAt || null,
      stripeSessionId: stripeSessionId || null,
      shippingAddress: shippingAddress?.address || null,
      shippingCity: shippingAddress?.city || null,
      shippingPostalCode: shippingAddress?.postalCode || null,
      shippingCountry: shippingAddress?.country || null,
    };

    const created = await Order.create(orderPayload, { transaction: t });

    // Create order items
    await Promise.all(
      orderItems.map((it) =>
        OrderItem.create(
          {
            orderId: created.id,
            productId: normalizeOrderItemProductId(it),
            name: it.name,
            qty: it.qty,
            price: it.price,
            image: it.image,
          },
          { transaction: t }
        )
      )
    );

    await t.commit();
    return created;
  } catch (err) {
    await t.rollback();
    throw err;
  }
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
    merged.set(pid, (merged.get(pid) || 0) + q);
  }

  const t = await sequelize.transaction();
  try {
    for (const [productId, qty] of merged.entries()) {
      const product = await Product.findByPk(productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) continue;
      product.countInStock = Number(product.countInStock || 0) + qty;
      product.soldCount = Math.max(0, Number(product.soldCount || 0) - qty);
      await product.save({ transaction: t });
    }
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = {
  createOrderWithInventory,
  rollbackStock,
  restoreInventoryFromCanceledOrder,
};
