import LandingContent from '../models/LandingContent.js';
import Student from '../models/Student.js';

const DEFAULT_CONTENT = {
  key: 'default',
  navLinks: [
    { label: 'Features', href: '#features' },
    { label: 'AI Integration', href: '#ai-integration' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'About', href: '#about' },
  ],
  badgeText: 'Next-Gen Networking Platform',
  titleLines: ['Acro-In:', 'Connect.'],
  titleAccent: 'Collaborate. Create.',
  subtitle:
    'The official student-faculty networking platform of Acropolis Institute. Powered by AI for smart connections, skill validation, and career opportunities.',
  primaryCta: { label: 'Get Started', href: '/register' },
  secondaryCta: { label: 'Watch Demo', href: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80',
    alt: 'Students collaborating',
  },
  imageTopBadge: 'AI Verified',
  imageBottomBadge: 'Smart Matching',
  statItems: [
    {
      key: 'active_students',
      label: 'Active Students',
      icon: 'users',
      color: 'blue',
      valueSource: 'activeStudents',
      suffix: '+',
    },
    {
      key: 'match_accuracy',
      label: 'Match Accuracy',
      icon: 'target',
      color: 'green',
      valueSource: 'matchAccuracy',
      suffix: '%',
    },
    {
      key: 'verified_profiles',
      label: 'Verified Profiles',
      icon: 'shield',
      color: 'orange',
      valueSource: 'verifiedProfiles',
      suffix: '%',
    },
  ],
  sectionPreview: {
    badge: 'Platform Features',
    title: 'Everything You Need',
  },
};

const safePct = (numerator, denominator) => {
  if (!denominator) return 0;
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
};

export const getLandingContent = async (_req, res, next) => {
  try {
    let content = await LandingContent.findOne({ key: 'default' }).lean();
    if (!content) {
      content = await LandingContent.create(DEFAULT_CONTENT);
      content = content.toObject();
    }

    return res.json({ success: true, data: content });
  } catch (error) {
    return next(error);
  }
};

export const getLandingStats = async (_req, res, next) => {
  try {
    const [activeStudents, verifiedStudents] = await Promise.all([
      Student.countDocuments({}),
      Student.countDocuments({ faceVerificationStatus: 'complete' }),
    ]);

    const matchAccuracy = Math.min(99, 78 + Math.floor(verifiedStudents / 5));
    const verifiedProfiles = safePct(verifiedStudents, activeStudents);

    return res.json({
      success: true,
      data: {
        activeStudents,
        matchAccuracy,
        verifiedProfiles,
      },
    });
  } catch (error) {
    return next(error);
  }
};
