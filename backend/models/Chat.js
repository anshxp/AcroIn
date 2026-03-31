import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now },
      flagged: { type: Boolean, default: false },
    },
  ],
  facultyMediator: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
