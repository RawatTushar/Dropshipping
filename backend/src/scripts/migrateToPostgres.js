/**
 * Migration script to convert MongoDB data to PostgreSQL
 * Run: node src/scripts/migrateToPostgres.js
 * 
 * Prerequisites:
 * - MongoDB database with all collections exported to BSON files
 * - PostgreSQL database created and tables synchronized
 * - POSTGRES_URL environment variable set
 */

require("dotenv").config();
const { MongoClient } = require("mongodb");
const { sequelize } = require("../config/db");
const {
  User,
  Product,
  Order,
  OrderItem,
  CheckoutDraft,
  CheckoutDraftItem,
  UserProductSignal,
} = require("../models");

const MONGO_URI = process.env.MONGO_URI;

async function migrateData() {
  let mongoClient;
  try {
    console.log("🔄 Starting data migration from MongoDB to PostgreSQL...\n");

    // Connect to MongoDB
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const mongoDb = mongoClient.db();
    console.log("✅ Connected to MongoDB");

    // Connect to PostgreSQL
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL\n");

    // Clear existing data (optional - comment out to keep existing data)
    // await clearPostgresData();

    // Migrate collections
await migrateUsers(mongoDb);
await migrateProducts(mongoDb);
await migrateUserProductSignals(mongoDb);
await migrateOrders(mongoDb);
await migrateCheckoutDrafts(mongoDb);

    console.log("\n✅ Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    if (mongoClient) await mongoClient.close();
    await sequelize.close();
  }
}

async function migrateUsers(mongoDb) {
  try {
    const mongoUsers = await mongoDb.collection("users").find({}).toArray();
    console.log(`📦 Found ${mongoUsers.length} users in MongoDB`);

    for (const mongoUser of mongoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: mongoUser.email } });
      if (existingUser) {
        console.log(`⏭️  Skipping user ${mongoUser.email} (already exists)`);
        continue;
      }

      // Create user
      const user = await User.create({
        id: mongoUser._id.toString(), // Convert ObjectId to string UUID
        name: mongoUser.name || "",
        email: mongoUser.email || "",
        password: mongoUser.password || "",
        isAdmin: mongoUser.isAdmin || false,
        isEmailConfirmed: mongoUser.isEmailConfirmed || false,
        emailConfirmationToken: mongoUser.emailConfirmationToken,
        emailConfirmationExpires: mongoUser.emailConfirmationExpires,
        loginOtpHash: mongoUser.loginOtpHash,
        loginOtpExpires: mongoUser.loginOtpExpires,
        magicLoginTokenHash: mongoUser.magicLoginTokenHash,
        magicLoginExpires: mongoUser.magicLoginExpires,
        googleId: mongoUser.googleId,
      });

      // Migrate product signals (recentlyViewed and cartAdds)
 

      console.log(`✅ Migrated user: ${mongoUser.email}`);
    }

    console.log(`✅ Users migration complete\n`);
  } catch (err) {
    console.error("❌ User migration failed:", err.message);
    throw err;
  }
}

async function migrateProducts(mongoDb) {
  try {
    const mongoProducts = await mongoDb.collection("products").find({}).toArray();
    console.log(`📦 Found ${mongoProducts.length} products in MongoDB`);

    for (const mongoProduct of mongoProducts) {
      // Check if product already exists
      const existingProduct = await Product.findOne({ where: { id: mongoProduct._id.toString() } });
      if (existingProduct) {
        console.log(`⏭️  Skipping product ${mongoProduct.name} (already exists)`);
        continue;
      }

      await Product.create({
        id: mongoProduct._id.toString(),
        name: mongoProduct.name || "",
        description: mongoProduct.description,
        price: mongoProduct.price || 0,
        costPrice: mongoProduct.costPrice,
        image: mongoProduct.image,
        brand: mongoProduct.brand,
        category: mongoProduct.category,
        countInStock: mongoProduct.countInStock || 0,
        compareAtPrice: mongoProduct.compareAtPrice,
        rating: mongoProduct.rating || 0,
        reviewCount: mongoProduct.reviewCount || 0,
        soldCount: mongoProduct.soldCount || 0,
      });

      console.log(`✅ Migrated product: ${mongoProduct.name}`);
    }

    console.log(`✅ Products migration complete\n`);
  } catch (err) {
    console.error("❌ Product migration failed:", err.message);
    throw err;
  }
}

async function migrateUserProductSignals(mongoDb) {
  const mongoUsers = await mongoDb.collection("users").find({}).toArray();

  for (const mongoUser of mongoUsers) {
    if (!mongoUser.productSignals) continue;

    // recentlyViewed
    if (Array.isArray(mongoUser.productSignals.recentlyViewed)) {
      for (const signal of mongoUser.productSignals.recentlyViewed) {

        if (!signal.product) continue;

        const productId = signal.product.toString();

        const product = await Product.findByPk(productId);

        if (!product) {
          console.log(`Skipping missing product ${productId}`);
          continue;
        }

        await UserProductSignal.create({
          userId: mongoUser._id.toString(),
          productId,
          signalType: "recentlyViewed",
        });
      }
    }

    // cartAdds
    if (Array.isArray(mongoUser.productSignals.cartAdds)) {
      for (const signal of mongoUser.productSignals.cartAdds) {

        if (!signal.product) continue;

        const productId = signal.product.toString();

        const product = await Product.findByPk(productId);

        if (!product) {
          console.log(`Skipping missing product ${productId}`);
          continue;
        }

        await UserProductSignal.create({
          userId: mongoUser._id.toString(),
          productId,
          signalType: "cartAdds",
        });
      }
    }
  }

  console.log("✅ User product signals migration complete");
}

async function migrateOrders(mongoDb) {
  try {
    const mongoOrders = await mongoDb.collection("orders").find({}).toArray();
    console.log(`📦 Found ${mongoOrders.length} orders in MongoDB`);

    for (const mongoOrder of mongoOrders) {
      // Check if order already exists
      const existingOrder = await Order.findOne({ where: { id: mongoOrder._id.toString() } });
      if (existingOrder) {
        console.log(`⏭️  Skipping order ${mongoOrder._id} (already exists)`);
        continue;
      }

      const order = await Order.create({
        id: mongoOrder._id.toString(),
        userId: mongoOrder.user?.toString() || null,
        paymentMethod: mongoOrder.paymentMethod,
        itemsPrice: mongoOrder.itemsPrice || 0,
        shippingPrice: mongoOrder.shippingPrice || 0,
        taxPrice: mongoOrder.taxPrice || 0,
        totalPrice: mongoOrder.totalPrice || 0,
        shippingAddress: mongoOrder.shippingAddress?.address,
        shippingCity: mongoOrder.shippingAddress?.city,
        shippingPostalCode: mongoOrder.shippingAddress?.postalCode,
        shippingCountry: mongoOrder.shippingAddress?.country,
        isPaid: mongoOrder.isPaid || false,
        paidAt: mongoOrder.paidAt,
        stripeSessionId: mongoOrder.stripeSessionId,
        isDelivered: mongoOrder.isDelivered || false,
        deliveredAt: mongoOrder.deliveredAt,
      });

      // Migrate order items
      if (mongoOrder.orderItems && Array.isArray(mongoOrder.orderItems)) {
        for (const mongoItem of mongoOrder.orderItems) {
          await OrderItem.create({
            orderId: order.id,
            productId: mongoItem.product?.toString() || null,
            name: mongoItem.name || "",
            qty: mongoItem.qty || 0,
            price: mongoItem.price || 0,
            image: mongoItem.image,
          });
        }
      }

      console.log(`✅ Migrated order: ${mongoOrder._id}`);
    }

    console.log(`✅ Orders migration complete\n`);
  } catch (err) {
    console.error("❌ Order migration failed:", err.message);
    throw err;
  }
}

async function migrateCheckoutDrafts(mongoDb) {
  try {
    const mongoDrafts = await mongoDb.collection("checkoutdrafts").find({}).toArray();
    console.log(`📦 Found ${mongoDrafts.length} checkout drafts in MongoDB`);

    for (const mongoDraft of mongoDrafts) {
      // Check if draft already exists
      const existingDraft = await CheckoutDraft.findOne({ where: { id: mongoDraft._id.toString() } });
      if (existingDraft) {
        console.log(`⏭️  Skipping draft ${mongoDraft._id} (already exists)`);
        continue;
      }

      // Calculate expires_at (24 hours from createdAt or now)
      const createdAt = mongoDraft.createdAt || new Date();
      const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

      const draft = await CheckoutDraft.create({
        id: mongoDraft._id.toString(),
        userId: mongoDraft.user?.toString() || null,
        itemsPrice: mongoDraft.itemsPrice || 0,
        shippingPrice: mongoDraft.shippingPrice || 0,
        taxPrice: mongoDraft.taxPrice || 0,
        totalPrice: mongoDraft.totalPrice || 0,
        stripeSessionId: mongoDraft.stripeSessionId,
        shippingAddress: mongoDraft.shippingAddress?.address,
        shippingCity: mongoDraft.shippingAddress?.city,
        shippingPostalCode: mongoDraft.shippingAddress?.postalCode,
        shippingCountry: mongoDraft.shippingAddress?.country,
        expiresAt: expiresAt,
      });

      // Migrate checkout draft items
      if (mongoDraft.orderItems && Array.isArray(mongoDraft.orderItems)) {
        for (const mongoItem of mongoDraft.orderItems) {
          await CheckoutDraftItem.create({
            checkoutDraftId: draft.id,
            productId: mongoItem.product?.toString() || null,
            name: mongoItem.name || "",
            qty: mongoItem.qty || 0,
            image: mongoItem.image,
            price: mongoItem.price || 0,
          });
        }
      }

      console.log(`✅ Migrated checkout draft: ${mongoDraft._id}`);
    }

    console.log(`✅ Checkout drafts migration complete\n`);
  } catch (err) {
    console.error("❌ Checkout draft migration failed:", err.message);
    throw err;
  }
}

async function clearPostgresData() {
  console.log("🧹 Clearing existing PostgreSQL data...");
  try {
    await CheckoutDraftItem.destroy({ where: {}, truncate: true });
    await CheckoutDraft.destroy({ where: {}, truncate: true });
    await OrderItem.destroy({ where: {}, truncate: true });
    await Order.destroy({ where: {}, truncate: true });
    await UserProductSignal.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    await Product.destroy({ where: {}, truncate: true });
    console.log("✅ Data cleared\n");
  } catch (err) {
    console.error("⚠️  Warning: Could not clear data:", err.message);
  }
}

// Run migration
if (require.main === module) {
  migrateData();
}

module.exports = migrateData;
