import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  userType: { type: String, enum: ['student', 'faculty', 'admin'], required: true, index: true },
  displayName: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true, index: true },
  department: { type: String, trim: true, index: true },
  year: { type: String, trim: true },
  semester: { type: String, trim: true },
  designation: { type: String, trim: true },
  location: { type: String, trim: true },
  skills: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  profileCompleteness: { type: Number, default: 0, min: 0, max: 100, index: true },
  verificationStatus: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

profileSchema.index({ userType: 1, department: 1, profileCompleteness: -1 });
profileSchema.index({ tags: 1 });

export default mongoose.model('Profile', profileSchema);
