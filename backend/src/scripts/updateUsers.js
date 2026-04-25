const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  isEmailConfirmed: { type: Boolean, default: false },
  emailConfirmationToken: String,
  emailConfirmationExpires: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to database');

  // Option 1: Make all existing users require confirmation (recommended)
  const result1 = await User.updateMany(
    { isEmailConfirmed: { $exists: false } },
    { $set: { isEmailConfirmed: false } }
  );
  console.log('Updated users without confirmation field:', result1.modifiedCount);

  // Option 2: Confirm all existing users (uncomment if you want this instead)
  // const result2 = await User.updateMany({}, { $set: { isEmailConfirmed: true } });
  // console.log('Confirmed all existing users:', result2.modifiedCount);

  const users = await User.find({}, 'email isEmailConfirmed');
  console.log('\nFinal user status:');
  users.forEach(user => {
    console.log(`Email: ${user.email}, Confirmed: ${user.isEmailConfirmed}`);
  });

  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});