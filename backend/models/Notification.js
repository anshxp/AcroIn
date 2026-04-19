import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'message', 'profile_view', 'system', 'certificate'], default: 'alert' },
  read: { type: Boolean, default: false },
  sourceType: { type: String, enum: ['competition', 'internship', 'certificate', 'opportunity', 'post', 'system'] },
  sourceId: { type: mongoose.Schema.Types.ObjectId },
  sourceTitle: { type: String },
  actionPath: { type: String },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
