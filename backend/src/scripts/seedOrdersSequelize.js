
require('dotenv').config();
const { sequelize } = require('../config/db');
const { Product, Order, OrderItem } = require('../models');

const seedOrders = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');

    const products = await Product.findAll({ raw: true });
    if (!products.length) {
      console.log('⚠️ No products found to seed orders with');
      process.exit(1);
    }

    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    console.log('🗑️ Old orders removed');

    const ordersToCreate = [];
    const orderItemsToCreate = [];
    const orderCount = 15;

    for (let i = 0; i < orderCount; i++) {
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [...products].sort(() => Math.random() - 0.5).slice(0, itemsCount);
      let totalAmount = 0;

      const orderId = `ord_${Date.now()}_${i}`;
      const orderItems = selectedProducts.map(p => {
        const qty = Math.floor(Math.random() * 2) + 1;
        const lineTotal = qty * p.price;
        totalAmount += lineTotal;
        return {
          orderId: orderId,
          productId: p.id,
          name: p.name,
          qty: qty,
          price: p.price,
          image: p.image,
        };
      });

      ordersToCreate.push({
        id: orderId,
        createdAt: new Date(Date.now() - (orderCount - i) * 86400000),
        userId: 'test_user_1',
        shippingAddress: '123 Test St',
        paymentMethod: 'card',
        paymentResult: { id: 'test_payment_id' },
        taxPrice: Number((totalAmount * 0.08).toFixed(2)),
        shippingPrice: 5.99,
        totalPrice: Number((totalAmount + (totalAmount * 0.08) + 5.99).toFixed(2)),
        isPaid: true,
        paidAt: new Date(),
        isDelivered: true,
        deliveredAt: new Date(),
      });

      orderItemsToCreate.push(...orderItems);
    }

    await Order.bulkCreate(ordersToCreate);
    await OrderItem.bulkCreate(orderItemsToCreate);

    console.log(`✅ Seeded ${ordersToCreate.length} test orders with ${orderItemsToCreate.length} items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Order seed failed:', error);
    process.exit(1);
  }
};

seedOrders();
