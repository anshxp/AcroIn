import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizer: String,
  date: Date,
  location: String, // ✅ ADD THIS
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }
}, { timestamps: true });
export default mongoose.model('Competition', competitionSchema);
