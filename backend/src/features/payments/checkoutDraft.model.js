const mongoose = require("mongoose");

const draftItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  image: String,
  price: Number,
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
});

const checkoutDraftSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [draftItemSchema],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    itemsPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    stripeSessionId: { type: String, default: "" },
  },
  { timestamps: true }
);

checkoutDraftSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

module.exports = mongoose.model("CheckoutDraft", checkoutDraftSchema);
