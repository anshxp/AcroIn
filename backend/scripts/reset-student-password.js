import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';

dotenv.config();

const emailArg = String(process.argv[2] || '').trim().toLowerCase();
const passwordArg = String(process.argv[3] || '');

if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/reset-student-password.js <email> <newPassword>');
  process.exit(1);
}

if (passwordArg.length < 8) {
  console.error('Password must be at least 8 characters long.');
  process.exit(1);
}

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/AcroIn';

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
