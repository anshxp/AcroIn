import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: String,
    profileImage: String,
    department: String,
    userType: { type: String, enum: ['student', 'faculty', 'admin'] },
  },
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: String,
    designation: String,
    department: String,
    profileImage: String,
    userType: { type: String, enum: ['faculty', 'admin'] },
  },
  content: String,
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  linkedOpportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  scope: { type: String, enum: ['campus', 'department'], default: 'campus' },
  visibleToDepartments: [String],
}, { timestamps: true });

postSchema.index({ scope: 1, createdAt: -1 });
postSchema.index({ visibleToDepartments: 1, createdAt: -1 });
postSchema.index({ 'author.department': 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);
