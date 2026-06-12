const { Op } = require("sequelize");
const {
  Product,
  Order,
  OrderItem,
  User,
  UserProductSignal,
} = require("../../models");

const MAX_VIEWED_QUERY = 16;
const DEFAULT_LIMIT = 8;
const CO_ORDER_SAMPLE = 250;

const parseViewedIds = (raw) => {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((id) => id.length > 0)
    .slice(0, MAX_VIEWED_QUERY);
};

const uniqObjectIds = (ids) => {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    const s = String(id);
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
};

const toProductJson = (product) => {
  const json = product.toJSON ? product.toJSON() : product;
  return { ...json, _id: json._id || json.id };
};

const scoreCandidate = (p, anchor, ctx) => {
  let score = 0;
  const ac = String(anchor.category || "").toLowerCase().trim();
  const pc = String(p.category || "").toLowerCase().trim();
  if (ac && pc === ac) score += 28;
  const ap = Number(anchor.price) || 0;
  const pp = Number(p.price) || 0;
  if (ap > 0) {
    const rel = Math.abs(pp - ap) / ap;
    score += Math.max(0, 22 * (1 - Math.min(rel, 1.2) / 1.2));
  }
  if (ctx.affinityCategories.has(pc)) score += 14;
  if (ctx.affinityBrands.has(String(p.brand || "").toLowerCase())) score += 8;
  const co = ctx.coBuy.get(String(p.id || p._id)) || 0;
  score += Math.min(24, co * 4);
  if (ctx.cartProductIds.has(String(p.id || p._id))) score += 10;
  return score;
};

const recordInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body || {};
    if (!["view", "cart_add"].includes(type)) {
      return res.status(400).json({ message: "Invalid interaction type" });
    }
    const product = await Product.findByPk(id, { attributes: ["id"] });
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!req.user) return res.sendStatus(204);

    const signalType = type === "view" ? "recentlyViewed" : "cartAdds";

    // Create a simple signal record. More advanced dedupe/limit logic can be added later.
    await UserProductSignal.create({ userId: req.user.id, productId: product.id, signalType });

    return res.sendStatus(204);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const limit = Math.min(
      24,
      Math.max(1, parseInt(String(req.query.limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    const anchor = await Product.findByPk(req.params.id);
    if (!anchor) return res.status(404).json({ message: "Product not found" });

    const anchorId = String(anchor.id);
    const guestViewed = parseViewedIds(req.query.viewed);

    const purchasedIds = new Set();
    const cartProductIds = new Set();
    const signalProductIds = [];

    if (req.user) {
      const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, as: 'orderItems' }] });
      for (const o of orders) {
        for (const it of o.orderItems || []) {
          if (it.productId) purchasedIds.add(String(it.productId));
        }
      }

      const signals = await UserProductSignal.findAll({ where: { userId: req.user.id } });
      for (const s of signals) {
        if (s.productId) {
          signalProductIds.push(s.productId);
          if (s.signalType === 'cartAdds') cartProductIds.add(String(s.productId));
        }
      }
    }

    for (const id of guestViewed) {
      if (id !== anchorId) signalProductIds.push(id);
    }

    const affinityCategories = new Set();
    const affinityBrands = new Set();
    const sigIds = uniqObjectIds(signalProductIds).filter((id) => String(id) !== anchorId);

    if (sigIds.length) {
      const sigProducts = await Product.findAll({ where: { id: { [Op.in]: sigIds } }, attributes: ['id','category','brand'] });
      for (const sp of sigProducts) {
        const c = String(sp.category || '').toLowerCase().trim();
        if (c) affinityCategories.add(c);
        const b = String(sp.brand || '').toLowerCase().trim();
        if (b) affinityBrands.add(b);
      }
    }

    const coBuy = new Map();
    // find sample orders that include anchor product by looking up order items
    const anchorOrderItems = await OrderItem.findAll({ where: { productId: anchor.id }, attributes: ['orderId'], limit: CO_ORDER_SAMPLE });
    const orderIds = [...new Set(anchorOrderItems.map((r) => r.orderId))];
    if (orderIds.length) {
      const coOrderItems = await OrderItem.findAll({ where: { orderId: { [Op.in]: orderIds } } });
      for (const it of coOrderItems) {
        const pid = it.productId ? String(it.productId) : '';
        if (!pid || pid === anchorId) continue;
        const q = Number(it.qty || 0) || 1;
        coBuy.set(pid, (coBuy.get(pid) || 0) + q);
      }
    }

    const excludeList = uniqObjectIds([anchor.id, ...purchasedIds]);

    const anchorCat = String(anchor.category || '').trim();
    const ap = Number(anchor.price) || 0;
    const strictLow = ap * 0.72;
    const strictHigh = ap * 1.28;
    const looseLow = ap * 0.55;
    const looseHigh = ap * 1.45;

    const baseWhere = {
      id: { [Op.notIn]: excludeList.length ? excludeList : [''] },
      countInStock: { [Op.gt]: 0 },
    };

    let pool = [];

    if (anchorCat) {
      pool = await Product.findAll({
        where: {
          ...baseWhere,
          category: anchorCat,
          price: { [Op.between]: [strictLow, strictHigh] },
        },
        limit: 80,
      });
    } else {
      pool = await Product.findAll({ where: { ...baseWhere, price: { [Op.between]: [strictLow, strictHigh] } }, limit: 80 });
    }

    if (pool.length < 12 && anchorCat) {
      const more = await Product.findAll({ where: { ...baseWhere, category: anchorCat }, limit: 80 });
      pool = [...pool, ...more];
    }

    if (pool.length < 12) {
      const more = await Product.findAll({ where: { ...baseWhere, price: { [Op.between]: [looseLow, looseHigh] } }, limit: 80 });
      pool = [...pool, ...more];
    }

    if (pool.length < 8) {
      const more = await Product.findAll({ where: baseWhere, limit: 100 });
      pool = [...pool, ...more];
    }

    const seen = new Set();
    const unique = [];
    for (const p of pool) {
      const id = String(p.id);
      if (seen.has(id)) continue;
      seen.add(id);
      unique.push(p);
    }

    const ctx = {
      affinityCategories,
      affinityBrands,
      coBuy,
      cartProductIds,
    };

    const ranked = unique
      .map((p) => ({ p, score: scoreCandidate(p, anchor, ctx) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => toProductJson(x.p));

    const personalized = Boolean(req.user) && (purchasedIds.size > 0 || sigIds.length > 0 || affinityCategories.size > 0 || coBuy.size > 0);

    return res.json({
      recommendations: ranked,
      meta: {
        anchorId: anchor.id,
        personalized,
        usedGuestSignals: guestViewed.length > 0,
        count: ranked.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getRecommendations, recordInteraction };
