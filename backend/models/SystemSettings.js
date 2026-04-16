import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: 'default',
      index: true,
    },
    general: {
      siteName: { type: String, required: true },
      siteUrl: { type: String, required: true },
      adminEmail: { type: String, required: true },
      supportEmail: { type: String, required: true },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      autoApproval: { type: Boolean, default: false },
    },
    security: {
      sessionTimeoutMinutes: { type: Number, default: 30 },
      maxLoginAttempts: { type: Number, default: 5 },
      maintenanceMode: { type: Boolean, default: false },
    },
    upload: {
      maxFileSizeMb: { type: Number, default: 10 },
      allowedFileTypes: [{ type: String }],
    },
    database: {
      backupFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
      lastBackupAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model('SystemSettings', systemSettingsSchema);
