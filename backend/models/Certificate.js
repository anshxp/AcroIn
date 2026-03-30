import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: String,
  issue_date: String,
  certificate_link: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
