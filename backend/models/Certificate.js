import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: String,
  issue_date: String,
  certificate_link: String,
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdByRole: { type: String, enum: ['student', 'faculty', 'admin'] },
  adminAssigned: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Certificate', certificateSchema);
