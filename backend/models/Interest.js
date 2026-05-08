import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure one student can mark interest only once per opportunity
interestSchema.index({ student: 1, opportunity: 1 }, { unique: true });

export default mongoose.model('Interest', interestSchema);
