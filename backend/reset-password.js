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

    const email = 'lavishjangid230719@acropolis.in';
    const newPassword = 'Lavish@262';

    const user = await User.findOne({ email });
    if (user) {
      console.log('User found. Checking current password hash...');
      const matchesExisting = await bcrypt.compare(newPassword, user.password);
      console.log('Does existing hash match "Lavish@262"?', matchesExisting);

      if (!matchesExisting) {
        console.log('Updating password hash to "Lavish@262"...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        console.log('Password successfully reset to "Lavish@262"!');
      } else {
        console.log('Password hash already matches "Lavish@262". No update needed.');
      }
    } else {
      console.log(`User ${email} not found in database!`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
