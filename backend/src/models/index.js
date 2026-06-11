const User = require("../features/users/models/User");
const Product = require("../features/products/models/Product");
const Order = require("../features/orders/models/Order");
const OrderItem = require("../features/orders/models/OrderItem");
const CheckoutDraft = require("../features/payments/models/CheckoutDraft");
const CheckoutDraftItem = require("../features/payments/models/CheckoutDraftItem");
const UserProductSignal = require("../features/users/models/UserProductSignal");

// Define associations
User.hasMany(Order, { foreignKey: "userId", as: "orders", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "orderItems", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(CheckoutDraft, { foreignKey: "userId", as: "checkoutDrafts", onDelete: "CASCADE" });
CheckoutDraft.belongsTo(User, { foreignKey: "userId", as: "user" });

CheckoutDraft.hasMany(CheckoutDraftItem, { foreignKey: "checkoutDraftId", as: "items", onDelete: "CASCADE" });
CheckoutDraftItem.belongsTo(CheckoutDraft, { foreignKey: "checkoutDraftId", as: "checkout" });

Product.hasMany(CheckoutDraftItem, { foreignKey: "productId", as: "checkoutDraftItems" });
CheckoutDraftItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(UserProductSignal, { foreignKey: "userId", as: "productSignals", onDelete: "CASCADE" });
UserProductSignal.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(UserProductSignal, { foreignKey: "productId" });
UserProductSignal.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  CheckoutDraft,
  CheckoutDraftItem,
  UserProductSignal,
};
