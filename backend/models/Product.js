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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
