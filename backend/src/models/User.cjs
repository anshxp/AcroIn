const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  userType: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
  role: [String],
  firstname: String,
  lastName: String,
  department: String,
  designation: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
