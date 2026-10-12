import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';

dotenv.config();

const emailArg = String(process.argv[2] || '').trim().toLowerCase();
const passwordArg = String(process.env.RESET_PASSWORD || '');

if (!emailArg || !passwordArg) {
  console.error('Set RESET_PASSWORD in your local environment, then run: node scripts/reset-student-password.js <email>');
  process.exit(1);
}

if (passwordArg.length < 12) {
  console.error('Password must be at least 12 characters long.');
  process.exit(1);
}

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/AcroIn';

if (process.env.NODE_ENV === 'production') {
  console.error('Password reset scripts are disabled in production; use the approved account recovery procedure.');
  process.exit(1);
}

const isRemoteMongoTarget = (value) => {
  try {
    const parsed = new URL(value);
    return !['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  } catch {
    return true;
  }
};

if (isRemoteMongoTarget(mongoUri) && process.env.ALLOW_REMOTE_PASSWORD_RESET !== 'true') {
  console.error('Remote password resets require ALLOW_REMOTE_PASSWORD_RESET=true and are never allowed in production.');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(mongoUri);

  const user = await User.findOne({ email: emailArg });
  const student = await Student.findOne({ email: emailArg });

  if (!user && !student) {
    throw new Error(`No account found for ${emailArg}`);
  }

  const hashed = await bcrypt.hash(passwordArg, 10);

  if (user) {
    user.password = hashed;
    await user.save();
  }

  if (student) {
    student.password = hashed;
    await student.save();
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        email: emailArg,
        updatedUser: Boolean(user),
        updatedStudent: Boolean(student),
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
