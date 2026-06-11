# PostgreSQL Migration Setup Guide

## Prerequisites

1. **Create Amazon RDS PostgreSQL instance**
   - Go to AWS Console → RDS
   - Create a new PostgreSQL database
   - Save the connection details

2. **Update environment variables**
   - Copy your PostgreSQL connection string to `.env`
   - Keep `MONGO_URI` for now (used during migration)

## Step-by-step Migration

### 1. Set up environment variables

Add to your `.env` file:

```bash
# PostgreSQL Connection
POSTGRES_URL=postgresql://username:password@your-rds-endpoint:5432/dropshipping

# Keep MongoDB URI for migration (temporary)
MONGO_URI=mongodb://your-mongo-connection-string

# Other existing variables
PORT=5000
JWT_SECRET=your_secret
# ... other env vars
```

### 2. Install dependencies (if not already done)

```bash
cd backend
npm install pg sequelize
```

Packages already installed:
- `pg` - PostgreSQL client
- `sequelize` - ORM for Node.js
- `dotenv` - Environment variables

### 3. Create PostgreSQL tables

Run the SQL script provided in the PostgreSQL schema file to create tables:

```sql
-- Run this SQL on your PostgreSQL database
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all tables (user, product, order, etc.)
-- See the schema.sql file for the complete SQL
```

Or let Sequelize auto-create tables by starting the server:

```bash
npm start
```

### 4. Run the data migration

```bash
npm run migrate
```

This will:
- Connect to MongoDB
- Read all collections (users, products, orders, checkoutdrafts)
- Transform Mongo documents into SQL rows
- Insert into PostgreSQL tables
- Handle nested arrays and references

### 5. Verify migration

Check that data was migrated:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM checkout_drafts;
```

### 6. Start the server

```bash
npm start
# or for development
npm run dev
```

### 7. Test API endpoints

Run your API tests to ensure all endpoints work with PostgreSQL:

```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/health
```

## Troubleshooting

### Connection Error
```
❌ PostgreSQL connection failed: connect ECONNREFUSED
```

**Solution:**
- Check `POSTGRES_URL` in `.env`
- Verify PostgreSQL instance is running
- Check security groups allow connections from your server

### Migration Error
```
❌ Migration failed: relation "users" does not exist
```

**Solution:**
- Run SQL script to create tables first
- Or start server with `npm start` to auto-sync

### UUID issues
```
ERROR: invalid input syntax for type uuid
```

**Solution:**
- Ensure MongoDB ObjectIds are being converted to strings
- Migration script already handles this conversion

## Next Steps

1. ✅ All models are now using Sequelize/PostgreSQL
2. ✅ Data is migrated from MongoDB
3. ✅ Controllers need updates (see below)

### Update Controllers

Each controller file needs to change from Mongoose to Sequelize syntax.

Example changes:

**Mongoose (old):**
```js
const user = await User.findById(id);
await user.save();
```

**Sequelize (new):**
```js
const user = await User.findByPk(id);
await user.save();
```

See migration guide in each feature folder for controller updates.

## Timeline

- [ ] Set up PostgreSQL RDS instance
- [ ] Update .env with POSTGRES_URL
- [ ] Run `npm install` (if needed)
- [ ] Create tables (SQL or auto-sync)
- [ ] Run `npm run migrate`
- [ ] Verify data
- [ ] Test API endpoints
- [ ] Update controllers (if needed)
- [ ] Remove Mongoose/MongoDB dependencies

## Support

If you need help with specific controller updates or have issues, refer to:
- Sequelize documentation: https://sequelize.org/
- PostgreSQL connection strings: https://www.postgresql.org/docs/current/libpq-connect.html
