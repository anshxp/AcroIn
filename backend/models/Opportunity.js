import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['internship', 'job', 'competition', 'workshop', 'certification'],
    default: 'internship'
  },
  company: String,
  location: String,
  eventDate: Date,
  deadline: Date,
  description: String,
  requirements: [String],
  attachments: [String],
  application_link: {
    type: String,
    required: [true, 'Application link is required for opportunities']
  },
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdByRole: {
    type: String,
    enum: ['faculty', 'admin'],
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Opportunity', opportunitySchema);
