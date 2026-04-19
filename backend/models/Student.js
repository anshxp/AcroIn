import mongoose from 'mongoose';

const studentSkillSchema = new mongoose.Schema({
  category: { type: String, default: 'General', trim: true },
  name: { type: String, required: true, trim: true },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  verified: { type: Boolean, default: false },
  endorsements: { type: Number, default: 0, min: 0 },
  progress: { type: Number, default: 10, min: 0, max: 100 },
}, { _id: true });

const studentExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  verified: { type: Boolean, default: false },
}, { _id: true });

const studentFaceEmbeddingsSchema = new mongoose.Schema({
  front: { type: [Number], default: undefined },
  left: { type: [Number], default: undefined },
  right: { type: [Number], default: undefined },
  modelVersion: { type: String, default: 'arcface_v1' },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  year: String,
  semester: String,
  phone: String,
  birthday: String,
  address: String,
  linkedin: String,
  github: String,
  portfolio: String,
  location: String,
  bio: String,
  tech_stack: [String],
  skills: [studentSkillSchema],
  experiences: [studentExperienceSchema],
  profile_image: String,
  cover_image: String,
  cgpa: Number,
  resume: String,
  profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
  faceVerificationStatus: {
    type: String,
    enum: ['none', 'partial', 'complete'],
    default: 'none',
  },
  faceEmbeddings: {
    type: studentFaceEmbeddingsSchema,
    select: false,
  },
  verificationStatus: {
    type: String,
    enum: ['not_verified', 'verified', 'strongly_verified'],
    default: 'not_verified',
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  verifiedAt: Date,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  competitions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competition' }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
