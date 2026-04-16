import mongoose from 'mongoose';
import Student from '../models/Student.js';

export const resolveStudentId = async (identifier) => {
  const normalized = String(identifier || '').trim();
  if (!normalized) return null;

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    const byId = await Student.findById(normalized).select('_id');
    if (byId) return byId._id;
  }

  const byRoll = await Student.findOne({ roll: normalized }).select('_id');
  if (byRoll) return byRoll._id;

  const byEmail = await Student.findOne({ email: normalized }).select('_id');
  if (byEmail) return byEmail._id;

  return null;
};
