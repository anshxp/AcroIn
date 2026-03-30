const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  tech_stack: [String],
  profile_image: String,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  competitions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competition' }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
