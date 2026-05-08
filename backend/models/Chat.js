import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now },
      flagged: { type: Boolean, default: false },
      tag: {
        type: String,
        enum: ['DOUBT', 'GENERAL'],
        default: 'GENERAL'
      },
      senderRole: { type: String, enum: ['student', 'faculty'] }
    },
  ],
  facultyMediator: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  isActive: { type: Boolean, default: true },
  messageType: {
    type: String,
    enum: ['STUDENT_TO_FACULTY', 'FACULTY_TO_FACULTY'],
    default: 'STUDENT_TO_FACULTY'
  }
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
