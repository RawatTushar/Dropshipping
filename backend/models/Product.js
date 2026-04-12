const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    /** Supplier / landed cost per unit — used for margin & profit reporting */
    costPrice: { type: Number, min: 0 },
    image: String,
    brand: String,
    category: String,
    countInStock: { type: Number, default: 0 },
    /** MSRP / was price — when greater than `price`, UI shows a discount */
    compareAtPrice: { type: Number, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    /** Denormalized units sold (incremented on each paid order) */
    soldCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
