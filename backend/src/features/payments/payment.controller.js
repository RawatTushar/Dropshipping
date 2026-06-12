// Stripe must not be constructed at load time with an empty key (throws).
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "");
const Stripe = require("stripe");
const { CheckoutDraft, CheckoutDraftItem, Order, Product } = require("../../models");
const { createOrderWithInventory } = require("../orders/order.fulfillment");

const clientUrl = () =>
  (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

const isStripeConfigured = () =>
  Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.length > 8);

const getStripe = () => {
  if (!isStripeConfigured()) return null;
  return Stripe(process.env.STRIPE_SECRET_KEY);
};

/**
 * POST /api/payments/create-checkout-session
 * Validates cart against DB, stores draft, returns Stripe Checkout URL.
 */
const createCheckoutSession = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        message:
          "Card payments are not configured. Add STRIPE_SECRET_KEY to the server environment.",
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        message:
          "Card payments are not configured. Add STRIPE_SECRET_KEY to the server environment.",
      });
    }

    const {
      orderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems?.length) {
      return res.status(400).json({ message: "No order items" });
    }
    if (!shippingAddress?.address || String(shippingAddress.address).trim().length < 8) {
      return res.status(400).json({ message: "Please provide a complete delivery address." });
    }

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
      });
    }

    const normalizedItems = [];
    let computedSubtotal = 0;

    for (const merged of mergedItems.values()) {
      const product = await Product.findByPk(merged.productId);
      if (!product) {
        return res.status(400).json({ message: "One or more products are no longer available." });
      }
      const stock = Number(product.countInStock || 0);
      if (stock < merged.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Please refresh and update your cart.`,
        });
      }
      const price = Number(product.price || 0);
      const lineTotal = price * merged.qty;
      computedSubtotal += lineTotal;
      normalizedItems.push({
        name: product.name,
        qty: merged.qty,
        image: product.image || "",
        price,
        product: product.id,
      });
    }

    const itemsPriceNum = Number(computedSubtotal.toFixed(2));
    const shippingPriceNum = Number(shippingPrice || 0);
    const taxPriceNum = Number(taxPrice || 0);
    const totalNum = Number((itemsPriceNum + shippingPriceNum + taxPriceNum).toFixed(2));

    if (Math.abs(Number(totalPrice) - totalNum) > 0.02) {
      return res.status(400).json({
        message: "Order total mismatch. Please refresh checkout and try again.",
      });
    }

    const draft = await CheckoutDraft.create({
      userId: req.user.id,
      shippingAddress: String(shippingAddress.address || "").trim(),
      shippingCity: String(shippingAddress.city || "").trim(),
      shippingPostalCode: String(shippingAddress.postalCode || "").trim(),
      shippingCountry: String(shippingAddress.country || "").trim(),
      itemsPrice: itemsPriceNum,
      shippingPrice: shippingPriceNum,
      taxPrice: taxPriceNum,
      totalPrice: totalNum,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    // persist draft items
    await Promise.all(
      normalizedItems.map((row) =>
        CheckoutDraftItem.create({
          checkoutDraftId: draft.id,
          productId: row.product,
          name: row.name,
          qty: row.qty,
          image: row.image,
          price: row.price,
        })
      )
    );

    const lineItems = normalizedItems.map((row) => {
      const img = row.image && /^https:\/\//i.test(String(row.image))
        ? [String(row.image).slice(0, 2048)]
        : [];
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: row.name,
            ...(img.length ? { images: img } : {}),
          },
          unit_amount: Math.round(Number(row.price) * 100),
        },
        quantity: row.qty,
      };
    });

    if (shippingPriceNum > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingPriceNum * 100),
        },
        quantity: 1,
      });
    }
    if (taxPriceNum > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: Math.round(taxPriceNum * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email || undefined,
      line_items: lineItems,
      metadata: {
        draftId: String(draft.id),
        userId: String(req.user.id),
      },
      success_url: `${clientUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl()}/checkout?payment=canceled`,
    });

    await draft.update({ stripeSessionId: session.id });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("createCheckoutSession", err);
    return res.status(400).json({
      message: err.message || "Unable to start card checkout.",
    });
  }
};

/**
 * POST /api/payments/stripe/complete
 * After redirect from Stripe — creates order if payment succeeded.
 */
const completeStripeCheckout = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({ message: "Stripe is not configured." });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ message: "Stripe is not configured." });
    }

    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ message: "Missing session id." });
    }

    const existing = await Order.findOne({ where: { stripeSessionId: sessionId } });
    if (existing) {
      return res.json({ order: existing, alreadyCompleted: true });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment is not completed yet." });
    }

    const draftId = session.metadata?.draftId;
    if (!draftId) {
      return res.status(400).json({ message: "Invalid checkout session." });
    }

    const draft = await CheckoutDraft.findByPk(draftId, { include: [{ model: CheckoutDraftItem, as: 'items' }] });
    if (!draft) {
      return res.status(400).json({
        message: "Checkout session expired. Contact support if you were charged.",
      });
    }

    if (String(draft.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized for this order." });
    }

    if (draft.stripeSessionId && draft.stripeSessionId !== session.id) {
      return res.status(400).json({ message: "Session mismatch." });
    }

    const expectedCents = Math.round(Number(draft.totalPrice) * 100);
    if (
      session.amount_total != null &&
      Math.abs(session.amount_total - expectedCents) > 1
    ) {
      return res.status(400).json({ message: "Amount mismatch. Please contact support." });
    }

    let order;
    try {
      const items = (draft.items || []).map((it) => ({
        name: it.name,
        qty: it.qty,
        image: it.image,
        price: Number(it.price),
        product: it.productId,
      }));

      order = await createOrderWithInventory({
        userId: req.user.id,
        orderItems: items,
        shippingAddress: {
          address: draft.shippingAddress,
          city: draft.shippingCity,
          postalCode: draft.shippingPostalCode,
          country: draft.shippingCountry,
        },
        paymentMethod: "stripe",
        itemsPrice: draft.itemsPrice,
        shippingPrice: draft.shippingPrice,
        taxPrice: draft.taxPrice,
        totalPrice: draft.totalPrice,
        isPaid: true,
        paidAt: new Date(),
        stripeSessionId: session.id,
      });
    } catch (createErr) {
      // handle duplicate stripe session in case of race
      const dup = await Order.findOne({ where: { stripeSessionId: session.id } });
      if (dup) {
        await CheckoutDraft.destroy({ where: { id: draft.id } }).catch(() => undefined);
        return res.json({ order: dup, alreadyCompleted: true });
      }
      throw createErr;
    }

    await CheckoutDraft.destroy({ where: { id: draft.id } });

    return res.json({ order, alreadyCompleted: false });
  } catch (err) {
    console.error("completeStripeCheckout", err);
    return res.status(400).json({
      message: err.message || "Unable to complete payment.",
    });
  }
};

const getPaymentConfig = (req, res) => {
  res.json({
    stripeEnabled: isStripeConfigured(),
  });
};

module.exports = {
  createCheckoutSession,
  completeStripeCheckout,
  getPaymentConfig,
  isStripeConfigured,
};
