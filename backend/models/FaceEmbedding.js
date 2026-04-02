import mongoose from 'mongoose';

const faceEmbeddingSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },

  // store multiple angles
  embeddings: {
    front: { type: [Number], required: true },
    left: { type: [Number], required: true },
    right: { type: [Number], required: true }
  },

  // optional but useful
  model_version: { type: String, default: "arcface_v1" },

  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('FaceEmbedding', faceEmbeddingSchema);