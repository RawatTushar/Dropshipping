/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: OK
 */
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: "cost_price",
    },
    image: {
      type: DataTypes.TEXT,
    },
    brand: {
      type: DataTypes.STRING(255),
    },
    category: {
      type: DataTypes.STRING(255),
    },
    countInStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "count_in_stock",
    },
    compareAtPrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: "compare_at_price",
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "review_count",
    },
    soldCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "sold_count",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Product;
