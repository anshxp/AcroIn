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

const competitionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizer: String,
  position: String,
  date: String,
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

competitionSchema.set('toJSON', { virtuals: true });
competitionSchema.set('toObject', { virtuals: true });
competitionSchema.virtual('applicationUrl').get(function applicationUrlGetter() {
  return this.application_link;
});

module.exports = mongoose.model('Competition', competitionSchema);
