/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: OK
 */
const { Product, Order, OrderItem, User } = require("../../models");

const LOW_STOCK_THRESHOLD = 10;

const getAdminInsights = async (req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.findAll({ raw: true }),
      Order.findAll({
        include: [
          { model: OrderItem, as: "orderItems" },
          { model: User, as: "user", attributes: ["id", "name", "email"] },
        ],
        order: [["createdAt", "DESC"]],
      }),
    ]);

    const soldByProduct = new Map();
    let revenueFromLineItems = 0;

    for (const order of orders) {
      const items = order.orderItems || [];
      for (const item of items) {
        const pid = item.productId ? String(item.productId) : "";
        if (!pid) continue;
        const qty = Number(item.qty || 0);
        if (qty < 1) continue;
        const lineTotal = Number(item.price || 0) * qty;
        revenueFromLineItems += lineTotal;
        soldByProduct.set(pid, (soldByProduct.get(pid) || 0) + qty);
      }
    }

    const profitability = products.map((p) => {
      const id = String(p.id);
      const price = Number(p.price || 0);
      const costRaw = p.costPrice;
      const hasCost = costRaw != null && costRaw !== "" && !Number.isNaN(Number(costRaw));
      const cost = hasCost ? Number(costRaw) : null;
      const unitsSold = soldByProduct.get(id) || 0;
      const unitProfit = hasCost ? price - cost : null;
      const marginOnRevenue = hasCost && price > 0 ? ((price - cost) / price) * 100 : null;
      const realizedProfit = hasCost && unitsSold > 0 ? unitsSold * (price - cost) : hasCost ? 0 : null;
      const inventoryRetailValue = (p.countInStock || 0) * price;
      const inventoryCostBasis = hasCost && (p.countInStock || 0) > 0 ? (p.countInStock || 0) * cost : hasCost ? 0 : null;

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price,
        costPrice: cost,
        hasCost,
        countInStock: p.countInStock ?? 0,
        unitsSold,
        unitProfit,
        marginPercent: marginOnRevenue,
        realizedProfit,
        inventoryRetailValue,
        inventoryCostBasis,
      };
    });

    const bestSellers = profitability
      .filter((row) => row.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 8)
      .map((row) => ({
        id: row.id,
        name: row.name,
        unitsSold: row.unitsSold,
        revenueContribution: row.unitsSold * row.price,
        marginPercent: row.marginPercent,
        unitProfit: row.unitProfit,
      }));

    const lowStock = products
      .filter((p) => (p.countInStock ?? 0) <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => (a.countInStock ?? 0) - (b.countInStock ?? 0))
      .map((p) => {
        const stock = p.countInStock ?? 0;
        let level = "low";
        if (stock === 0) level = "out";
        else if (stock <= 3) level = "critical";
        return {
          id: p.id,
          name: p.name,
          countInStock: stock,
          price: p.price,
          level,
        };
      });

    const totalUnitsSold = [...soldByProduct.values()].reduce((acc, n) => acc + n, 0);

    const rowsWithCost = profitability.filter((r) => r.hasCost);
    const totalRealizedProfit = rowsWithCost.length > 0 ? rowsWithCost.reduce((acc, r) => acc + (r.realizedProfit || 0), 0) : null;
    const blendedMarginPercent = revenueFromLineItems > 0 && totalRealizedProfit != null && rowsWithCost.length ? (totalRealizedProfit / revenueFromLineItems) * 100 : null;

    const missingCostCount = profitability.filter((r) => !r.hasCost).length;

    const totalOrderRevenue = orders.reduce(
      (acc, o) => acc + Number(o.totalPrice || 0),
      0
    );

    const recentOrders = orders.slice(0, 25).map((o) => ({
        id: o.id,
        customerName: o.user?.name || "Guest",
        customerEmail: o.user?.email || "",
        totalPrice: Number(o.totalPrice || 0),
        itemsPrice: Number(o.itemsPrice || 0),
        paymentMethod: o.paymentMethod || "—",
        isPaid: Boolean(o.isPaid),
        isDelivered: Boolean(o.isDelivered),
        createdAt: o.createdAt,
        items: (o.orderItems || []).map((item) => ({
          productId: item.productId,
          name: item.name,
          qty: Number(item.qty || 0),
          price: Number(item.price || 0),
          lineTotal: Number(item.price || 0) * Number(item.qty || 0),
        })),
      }));

const totalInventoryValue = products.reduce(
      (acc, p) => acc + (Number(p.countInStock || 0) * Number(p.price || 0)),
      0
    );

    res.json({
      meta: {
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        generatedAt: new Date().toISOString(),
      },
      summary: {
        productCount: products.length,
        orderCount: orders.length,
        totalUnitsSold,
        revenueFromLineItems,
        totalOrderRevenue,
        totalRealizedProfit,
        blendedMarginPercent,
        lowStockCount: lowStock.length,
        missingCostCount,
        totalInventoryValue,
      },
      summary: {
        productCount: products.length,
        orderCount: orders.length,
        totalUnitsSold,
        revenueFromLineItems,
        totalOrderRevenue,
        totalRealizedProfit,
        blendedMarginPercent,
        lowStockCount: lowStock.length,
        missingCostCount,
        revenueNote: 'Line-item revenue sums item price × quantity for each order item. Order-total revenue sums each order’s stored totalPrice, which may include tax or shipping. They can differ when orders were captured with different pricing, rounding, or additional fees.',
      },
      bestSellers,
      lowStock,
      recentOrders,
      profitability: profitability.sort((a, b) => (b.realizedProfit || 0) - (a.realizedProfit || 0)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminInsights };
