import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: { type: String, enum: ['student', 'faculty', 'dept_admin', 'admin', 'super_admin', 'system'], default: 'system' },
  actorDepartment: { type: String, default: null },
  affectedDepartment: { type: String, default: null },
  action: { type: String, required: true },
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, required: true },
  success: { type: Boolean, required: true },
  ip: String,
  userAgent: String,
  payload: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ affectedDepartment: 1, createdAt: -1 });
auditLogSchema.index({ actorDepartment: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
