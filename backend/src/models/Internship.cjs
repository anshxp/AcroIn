const mongoose = require('mongoose');

const normalizeApplicationLink = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const validateApplicationLink = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const internshipSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  duration: String,
  description: String,
  certificate_link: String,
  application_link: {
    type: String,
    required: [true, 'Application link is required'],
    trim: true,
    set: normalizeApplicationLink,
    validate: {
      validator: validateApplicationLink,
      message: 'application_link must be a valid http or https URL',
    },
  },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
}, { timestamps: true });

internshipSchema.set('toJSON', { virtuals: true });
internshipSchema.set('toObject', { virtuals: true });
internshipSchema.virtual('applicationUrl').get(function applicationUrlGetter() {
  return this.application_link;
});

module.exports = mongoose.model('Internship', internshipSchema);
