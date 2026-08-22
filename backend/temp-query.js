import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb://localhost:27017/AcroIn';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  userType: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'email name userType password');
    console.log('--- REGISTERED USERS ---');
    console.log(JSON.stringify(users, null, 2));
    console.log('------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
