const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizer: String,
  position: String,
  date: String,
  certificate_link: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });

module.exports = mongoose.model('Competition', competitionSchema);
