const Order = require("../orders/order.model");
const Product = require("../products/product.model");

const LOW_STOCK_THRESHOLD = 10;

const getAdminInsights = async (req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find().lean(),
      Order.find().select("orderItems totalPrice").lean(),
    ]);

    const soldByProduct = new Map();
    let revenueFromLineItems = 0;

    for (const order of orders) {
      for (const item of order.orderItems || []) {
        const pid = item.product ? String(item.product) : "";
        if (!pid) continue;
        const qty = Number(item.qty || 0);
        if (qty < 1) continue;
        const lineTotal = Number(item.price || 0) * qty;
        revenueFromLineItems += lineTotal;
        soldByProduct.set(pid, (soldByProduct.get(pid) || 0) + qty);
      }
    }

    const profitability = products.map((p) => {
      const id = String(p._id);
      const price = Number(p.price || 0);
      const costRaw = p.costPrice;
      const hasCost =
        costRaw != null && costRaw !== "" && !Number.isNaN(Number(costRaw));
      const cost = hasCost ? Number(costRaw) : null;
      const unitsSold = soldByProduct.get(id) || 0;
      const unitProfit = hasCost ? price - cost : null;
      const marginOnRevenue =
        hasCost && price > 0 ? ((price - cost) / price) * 100 : null;
      const realizedProfit =
        hasCost && unitsSold > 0 ? unitsSold * (price - cost) : hasCost ? 0 : null;
      const inventoryRetailValue = (p.countInStock || 0) * price;
      const inventoryCostBasis =
        hasCost && (p.countInStock || 0) > 0
          ? (p.countInStock || 0) * cost
          : hasCost
            ? 0
            : null;

      return {
        _id: p._id,
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
        _id: row._id,
        name: row.name,
        unitsSold: row.unitsSold,
        revenueContribution:
          row.unitsSold * row.price,
        marginPercent: row.marginPercent,
        unitProfit: row.unitProfit,
      }));

    const lowStock = products
      .filter((p) => (p.countInStock ?? 0) <= LOW_STOCK_THRESHOLD)
      .sort(
        (a, b) => (a.countInStock ?? 0) - (b.countInStock ?? 0)
      )
      .map((p) => {
        const stock = p.countInStock ?? 0;
        let level = "low";
        if (stock === 0) level = "out";
        else if (stock <= 3) level = "critical";
        return {
          _id: p._id,
          name: p.name,
          countInStock: stock,
          price: p.price,
          level,
        };
      });

    const totalUnitsSold = [...soldByProduct.values()].reduce(
      (acc, n) => acc + n,
      0
    );

    const rowsWithCost = profitability.filter((r) => r.hasCost);
    const totalRealizedProfit =
      rowsWithCost.length > 0
        ? rowsWithCost.reduce((acc, r) => acc + (r.realizedProfit || 0), 0)
        : null;
    const blendedMarginPercent =
      revenueFromLineItems > 0 &&
      totalRealizedProfit != null &&
      rowsWithCost.length
        ? (totalRealizedProfit / revenueFromLineItems) * 100
        : null;

    const missingCostCount = profitability.filter((r) => !r.hasCost).length;

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
        totalRealizedProfit,
        blendedMarginPercent,
        lowStockCount: lowStock.length,
        missingCostCount,
      },
      bestSellers,
      lowStock,
      profitability: profitability.sort(
        (a, b) => (b.realizedProfit || 0) - (a.realizedProfit || 0)
      ),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminInsights };
