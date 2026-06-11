-- PostgreSQL Schema for Dropshipping Application
-- Run this SQL script on your PostgreSQL database to create all tables
-- Or let Sequelize auto-sync by running: npm start

-- =====================================================
-- Enable TEXT generation extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_email_confirmed BOOLEAN DEFAULT FALSE,
  email_confirmation_token TEXT,
  email_confirmation_expires TIMESTAMP WITH TIME ZONE,
  login_otp_hash TEXT,
  login_otp_expires TIMESTAMP WITH TIME ZONE,
  magic_login_token_hash TEXT,
  magic_login_expires TIMESTAMP WITH TIME ZONE,
  google_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  cost_price NUMERIC(10,2),
  image TEXT,
  brand VARCHAR(255),
  category VARCHAR(255),
  count_in_stock INTEGER DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);

-- =====================================================
-- USER PRODUCT SIGNALS
-- Replaces MongoDB nested arrays: productSignals.recentlyViewed and productSignals.cartAdds
-- =====================================================
CREATE TABLE user_product_signals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  signal_type VARCHAR(30) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_signal_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_signal_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_signal_type
    CHECK (signal_type IN ('recentlyViewed', 'cartAdds'))
);

CREATE INDEX idx_signal_user ON user_product_signals(user_id);
CREATE INDEX idx_signal_product ON user_product_signals(product_id);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  payment_method VARCHAR(100),
  items_price NUMERIC(10,2) DEFAULT 0,
  shipping_price NUMERIC(10,2) DEFAULT 0,
  tax_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  shipping_address TEXT,
  shipping_city VARCHAR(255),
  shipping_postal_code VARCHAR(50),
  shipping_country VARCHAR(255),
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  stripe_session_id VARCHAR(255) UNIQUE,
  is_delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_paid ON orders(is_paid);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);

-- =====================================================
-- ORDER ITEMS TABLE
-- Replaces MongoDB nested array: Order.orderItems
-- =====================================================
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT,
  name VARCHAR(255) NOT NULL,
  qty INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image TEXT,
  CONSTRAINT fk_order_item_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_item_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- CHECKOUT DRAFTS TABLE
-- =====================================================
CREATE TABLE checkout_drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  items_price NUMERIC(10,2) DEFAULT 0,
  shipping_price NUMERIC(10,2) DEFAULT 0,
  tax_price NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) DEFAULT 0,
  stripe_session_id VARCHAR(255),
  shipping_address TEXT,
  shipping_city VARCHAR(255),
  shipping_postal_code VARCHAR(50),
  shipping_country VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_checkout_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_checkout_expires ON checkout_drafts(expires_at);
CREATE INDEX idx_checkout_user ON checkout_drafts(user_id);

-- =====================================================
-- CHECKOUT DRAFT ITEMS TABLE
-- Replaces MongoDB nested array: CheckoutDraft.orderItems
-- =====================================================
CREATE TABLE checkout_draft_items (
  id TEXT PRIMARY KEY,
  checkout_draft_id TEXT NOT NULL,
  product_id TEXT,
  name VARCHAR(255) NOT NULL,
  qty INTEGER NOT NULL,
  image TEXT,
  price NUMERIC(10,2) NOT NULL,
  CONSTRAINT fk_checkout_item_draft
    FOREIGN KEY (checkout_draft_id)
    REFERENCES checkout_drafts(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_checkout_item_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE SET NULL
);

CREATE INDEX idx_checkout_item_draft ON checkout_draft_items(checkout_draft_id);
CREATE INDEX idx_checkout_item_product ON checkout_draft_items(product_id);

-- =====================================================
-- Optional: Add constraints for positive prices
-- =====================================================
ALTER TABLE orders 
ADD CONSTRAINT chk_order_prices_positive 
CHECK (items_price >= 0 AND shipping_price >= 0 AND tax_price >= 0 AND total_price >= 0);

ALTER TABLE checkout_drafts
ADD CONSTRAINT chk_checkout_prices_positive
CHECK (items_price >= 0 AND shipping_price >= 0 AND tax_price >= 0 AND total_price >= 0);

-- =====================================================
-- Optional: Cleanup job for expired checkout drafts
-- Run this periodically (every hour) to remove expired drafts:
-- DELETE FROM checkout_drafts WHERE expires_at < NOW();
-- =====================================================

-- =====================================================
-- Verification queries - run these to check your setup
-- =====================================================

-- List all tables:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Count rows in each table:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM products;
-- SELECT COUNT(*) FROM orders;
-- SELECT COUNT(*) FROM order_items;
-- SELECT COUNT(*) FROM checkout_drafts;
-- SELECT COUNT(*) FROM checkout_draft_items;
-- SELECT COUNT(*) FROM user_product_signals;
