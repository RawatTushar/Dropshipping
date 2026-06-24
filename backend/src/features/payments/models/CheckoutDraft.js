
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

const CheckoutDraft = sequelize.define(
  "CheckoutDraft",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    itemsPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "items_price",
    },
    shippingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "shipping_price",
    },
    taxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "tax_price",
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_price",
    },
    stripeSessionId: {
      type: DataTypes.STRING(255),
      field: "stripe_session_id",
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      field: "shipping_address",
    },
    shippingCity: {
      type: DataTypes.STRING(255),
      field: "shipping_city",
    },
    shippingPostalCode: {
      type: DataTypes.STRING(50),
      field: "shipping_postal_code",
    },
    shippingCountry: {
      type: DataTypes.STRING(255),
      field: "shipping_country",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
  },
  {
    tableName: "checkout_drafts",
    timestamps: true,
    underscored: true,
  }
);

module.exports = CheckoutDraft;
