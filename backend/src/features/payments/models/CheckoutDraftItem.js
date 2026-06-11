const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db");

const CheckoutDraftItem = sequelize.define(
  "CheckoutDraftItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    checkoutDraftId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "checkout_draft_id",
    },
    productId: {
      type: DataTypes.UUID,
      field: "product_id",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "checkout_draft_items",
    timestamps: false,
    underscored: true,
  }
);

module.exports = CheckoutDraftItem;
