const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  duration: String,
  description: String,
  certificate_link: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
