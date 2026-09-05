import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const email = String(process.env.RESET_PASSWORD_EMAIL || '').trim().toLowerCase();
const newPassword = String(process.env.RESET_PASSWORD || '');

if (!MONGO_URI || !email || !newPassword) {
  console.error('Required environment variables: MONGO_URI, RESET_PASSWORD_EMAIL, RESET_PASSWORD');
  process.exit(1);
}

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

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User ${email} not found in database.`);
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(`Password reset successfully for ${email}.`);
  } catch (error) {
    console.error('Password reset failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
