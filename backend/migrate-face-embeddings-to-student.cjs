require('dotenv').config();

const mongoose = require('mongoose');

const faceEmbeddingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  embeddings: {
    front: { type: [Number], required: true },
    left: { type: [Number], required: true },
    right: { type: [Number], required: true },
  },
  model_version: { type: String, default: 'arcface_v1' },
  created_at: { type: Date, default: Date.now },
}, { collection: 'faceembeddings' });

const studentSchema = new mongoose.Schema({
  faceEmbeddings: {
    front: [Number],
    left: [Number],
    right: [Number],
    modelVersion: String,
    updatedAt: Date,
  },
  faceVerificationStatus: {
    type: String,
    enum: ['none', 'partial', 'complete'],
    default: 'none',
  },
}, { collection: 'students' });

const FaceEmbedding = mongoose.model('FaceEmbeddingMigration', faceEmbeddingSchema);
const Student = mongoose.model('StudentMigration', studentSchema);

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in environment');
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const records = await FaceEmbedding.find({}).lean();
  let migratedCount = 0;

  for (const record of records) {
    if (!record.student || !record.embeddings) {
      continue;
    }

    const result = await Student.updateOne(
      { _id: record.student },
      {
        $set: {
          faceEmbeddings: {
            front: Array.isArray(record.embeddings.front) ? record.embeddings.front : [],
            left: Array.isArray(record.embeddings.left) ? record.embeddings.left : [],
            right: Array.isArray(record.embeddings.right) ? record.embeddings.right : [],
            modelVersion: record.model_version || 'arcface_v1',
            updatedAt: record.created_at || new Date(),
          },
          faceVerificationStatus: 'complete',
        },
      }
    );

    if (result.modifiedCount > 0 || result.matchedCount > 0) {
      migratedCount += 1;
    }
  }

  console.log(`Face embeddings migrated to student profiles: ${migratedCount}`);

  await mongoose.disconnect();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Migration failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_err) {
      // no-op
    }
    process.exit(1);
  });
