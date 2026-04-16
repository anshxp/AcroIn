import mongoose from 'mongoose';

const statItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    color: {
      type: String,
      enum: ['blue', 'green', 'orange'],
      required: true,
    },
    valueSource: {
      type: String,
      enum: ['activeStudents', 'matchAccuracy', 'verifiedProfiles'],
      required: true,
    },
    suffix: { type: String, default: '' },
  },
  { _id: false }
);

const landingContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      index: true,
    },
    navLinks: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
      },
    ],
    badgeText: { type: String, required: true },
    titleLines: [{ type: String, required: true }],
    titleAccent: { type: String, required: true },
    subtitle: { type: String, required: true },
    primaryCta: {
      label: { type: String, required: true },
      href: { type: String, required: true },
    },
    secondaryCta: {
      label: { type: String, required: true },
      href: { type: String, required: true },
    },
    heroImage: {
      src: { type: String, required: true },
      alt: { type: String, required: true },
    },
    imageTopBadge: { type: String, required: true },
    imageBottomBadge: { type: String, required: true },
    statItems: [statItemSchema],
    sectionPreview: {
      badge: { type: String, required: true },
      title: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('LandingContent', landingContentSchema);
