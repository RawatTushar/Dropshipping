
require('dotenv').config();
const { sequelize } = require('../config/db');
const { User } = require('../models');

const seedTestUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');

    const testUser = await User.findOne({ where: { email: 'test@example.com' } });
    if (!testUser) {
      const createdUser = await User.create({
        id: 'test_user_1',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2a$10$abcdefghijklmnopqrstuv',
      });
      console.log('✅ Test user created');
      return createdUser.id;
    } else {
      console.log('✅ Test user already exists');
      return testUser.id;
    }
  } catch (error) {
    console.error('❌ Test user seed failed:', error);
    process.exit(1);
  }
};

seedTestUser().then((userId) => {
  console.log('Test user ID:', userId);
  process.exit(0);
});
