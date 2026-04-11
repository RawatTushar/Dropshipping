const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const MAX_VIEWED_QUERY = 16;
const DEFAULT_LIMIT = 8;
const CO_ORDER_SAMPLE = 250;

const parseViewedIds = (raw) => {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .slice(0, MAX_VIEWED_QUERY);
};

const uniqObjectIds = (ids) => {
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    const s = String(id);
    if (!mongoose.Types.ObjectId.isValid(s)) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(new mongoose.Types.ObjectId(s));
  }
  return out;
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
  const co = ctx.coBuy.get(String(p._id)) || 0;
  score += Math.min(24, co * 4);
  if (ctx.cartProductIds.has(String(p._id))) score += 10;
  return score;
};

const recordInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body || {};
    if (!["view", "cart_add"].includes(type)) {
      return res.status(400).json({ message: "Invalid interaction type" });
    }
    const product = await Product.findById(id).select("_id");
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!req.user) return res.sendStatus(204);

    const path =
      type === "view"
        ? "productSignals.recentlyViewed"
        : "productSignals.cartAdds";

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { [path]: { product: product._id } },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        [path]: {
          $each: [{ product: product._id, at: new Date() }],
          $position: 0,
          $slice: 50,
        },
      },
    });

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
    const anchor = await Product.findById(req.params.id).lean();
    if (!anchor) return res.status(404).json({ message: "Product not found" });

    const anchorId = String(anchor._id);
    const guestViewed = parseViewedIds(req.query.viewed);

    const purchasedIds = new Set();
    const cartProductIds = new Set();
    const signalProductIds = [];

    if (req.user) {
      const orders = await Order.find({ user: req.user._id })
        .select("orderItems")
        .lean();
      for (const o of orders) {
        for (const it of o.orderItems || []) {
          if (it.product) purchasedIds.add(String(it.product));
        }
      }

      const fresh = await User.findById(req.user._id)
        .select("productSignals")
        .lean();

      const rv = fresh?.productSignals?.recentlyViewed || [];
      const ca = fresh?.productSignals?.cartAdds || [];
      for (const row of rv) {
        if (row.product) signalProductIds.push(row.product);
      }
      for (const row of ca) {
        if (row.product) {
          signalProductIds.push(row.product);
          cartProductIds.add(String(row.product));
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
      const sigProducts = await Product.find({ _id: { $in: sigIds } })
        .select("category brand")
        .lean();
      for (const sp of sigProducts) {
        const c = String(sp.category || "").toLowerCase().trim();
        if (c) affinityCategories.add(c);
        const b = String(sp.brand || "").toLowerCase().trim();
        if (b) affinityBrands.add(b);
      }
    }

    const coBuy = new Map();
    const coOrders = await Order.find({
      "orderItems.product": anchor._id,
    })
      .select("orderItems")
      .limit(CO_ORDER_SAMPLE)
      .lean();

    for (const o of coOrders) {
      for (const it of o.orderItems || []) {
        const pid = it.product ? String(it.product) : "";
        if (!pid || pid === anchorId) continue;
        const q = Number(it.qty || 0) || 1;
        coBuy.set(pid, (coBuy.get(pid) || 0) + q);
      }
    }

    const excludeList = uniqObjectIds([anchor._id, ...purchasedIds]);

    const anchorCat = String(anchor.category || "").trim();
    const ap = Number(anchor.price) || 0;
    const strictLow = ap * 0.72;
    const strictHigh = ap * 1.28;
    const looseLow = ap * 0.55;
    const looseHigh = ap * 1.45;

    const base = {
      _id: { $nin: excludeList },
      countInStock: { $gt: 0 },
    };

    let pool = [];

    if (anchorCat) {
      pool = await Product.find({
        ...base,
        category: anchorCat,
        price: { $gte: strictLow, $lte: strictHigh },
      })
        .limit(80)
        .lean();
    } else {
      pool = await Product.find({
        ...base,
        price: { $gte: strictLow, $lte: strictHigh },
      })
        .limit(80)
        .lean();
    }

    if (pool.length < 12 && anchorCat) {
      const more = await Product.find({
        ...base,
        category: anchorCat,
      })
        .limit(80)
        .lean();
      pool = [...pool, ...more];
    }

    if (pool.length < 12) {
      const more = await Product.find({
        ...base,
        price: { $gte: looseLow, $lte: looseHigh },
      })
        .limit(80)
        .lean();
      pool = [...pool, ...more];
    }

    if (pool.length < 8) {
      const more = await Product.find(base).limit(100).lean();
      pool = [...pool, ...more];
    }

    const seen = new Set();
    const unique = [];
    for (const p of pool) {
      const id = String(p._id);
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
      .map((p) => ({
        p,
        score: scoreCandidate(p, anchor, ctx),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.p);

    const personalized =
      Boolean(req.user) &&
      (purchasedIds.size > 0 ||
        sigIds.length > 0 ||
        affinityCategories.size > 0 ||
        coBuy.size > 0);

    return res.json({
      recommendations: ranked,
      meta: {
        anchorId: anchor._id,
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
