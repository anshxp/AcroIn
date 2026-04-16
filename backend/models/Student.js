import mongoose from 'mongoose';

const studentSkillSchema = new mongoose.Schema({
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
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  competitions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competition' }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
