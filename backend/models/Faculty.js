import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilepic: String,
  experience: Number,
  qualification: String,
  subjects: [String],
  department: String,
  headof: [String],
  designation: String,
  dob: String,
  linkedin: String,
  skills: [String],
  techstacks: [String],
  phone: String,
  role: [{ type: String, enum: ['faculty', 'dept_admin', 'super_admin'] }],
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Faculty', facultySchema);
