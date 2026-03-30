const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  technologies: [String],
  github_link: String,
  live_link: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
