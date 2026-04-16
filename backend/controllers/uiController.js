import Project from '../models/Project.js';
import Student from '../models/Student.js';
import FaceEmbedding from '../models/FaceEmbedding.js';
import SystemSettings from '../models/SystemSettings.js';

const DEFAULT_LOGIN_CONTENT = {
  leftPanel: {
    badge: 'AI-Powered Platform',
    titleLine1: 'Welcome to the',
    titleLine2: 'Smart Academic Network',
    subtitle:
      'Connect with peers, showcase your achievements, and unlock career opportunities with AI-powered insights.',
    highlights: [
      {
        key: 'active_users',
        title: '5,000+ Active Users',
        description: 'Join our growing community',
      },
      {
        key: 'verified_profiles',
        title: 'Verified Profiles',
        description: 'AI-powered identity verification',
      },
      {
        key: 'smart_matching',
        title: 'Smart Matching',
        description: 'AI-driven recommendations',
      },
    ],
  },
  tabs: ['Student', 'Faculty', 'Admin'],
  socialProviders: ['Google', 'Facebook', 'Apple'],
  demoButtons: [
    { key: 'student', label: 'Demo Student' },
    { key: 'faculty', label: 'Demo Faculty' },
    { key: 'admin', label: 'Demo Admin' },
  ],
};

const DEFAULT_SETTINGS = {
  key: 'default',
  general: {
    siteName: 'AcroIn',
    siteUrl: 'https://acroin.edu',
    adminEmail: 'admin@acroin.edu',
    supportEmail: 'support@acroin.edu',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    autoApproval: false,
  },
  security: {
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    maintenanceMode: false,
  },
  upload: {
    maxFileSizeMb: 10,
    allowedFileTypes: ['pdf', 'png', 'jpg'],
  },
  database: {
    backupFrequency: 'weekly',
    lastBackupAt: null,
  },
};

const safePct = (numerator, denominator) => {
  if (!denominator) return 0;
  return Math.max(0, Math.min(100, Math.round((numerator / denominator) * 100)));
};

export const getStudentProjectsView = async (_req, res, next) => {
  try {
    const [projects, totalStudents, verifiedStudents] = await Promise.all([
      Project.find({}).sort({ createdAt: -1 }).lean(),
      Student.countDocuments({}),
      FaceEmbedding.countDocuments({}),
    ]);

    const cards = projects.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description || 'No description available',
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      githubLink: project.github_link || '',
      liveLink: project.live_link || '',
      createdAt: project.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        pageTitle: 'Projects',
        subtitle: 'Showcase your work and achievements',
        cards,
        profileStats: {
          profileScore: Math.min(100, 60 + Math.floor(cards.length * 3)),
          skillsVerified: verifiedStudents,
          connections: Math.max(totalStudents - 1, 0),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFacultyAnalyticsView = async (_req, res, next) => {
  try {
    const [students, verifiedStudents, projects] = await Promise.all([
      Student.find({}).lean(),
      FaceEmbedding.countDocuments({}),
      Project.find({}).lean(),
    ]);

    const totalStudents = students.length;
    const verificationRate = safePct(verifiedStudents, totalStudents);

    const skillMap = new Map();
    students.forEach((student) => {
      (student.tech_stack || []).forEach((skill) => {
        const key = String(skill || '').trim();
        if (!key) return;
        skillMap.set(key, (skillMap.get(key) || 0) + 1);
      });
    });

    const trendingSkills = Array.from(skillMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, studentsCount], index) => ({
        rank: index + 1,
        name,
        students: studentsCount,
        growthPct: Math.max(10, 50 - index * 7),
      }));

    const topSkills = Array.from(skillMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(([skill]) => skill);

    const clusters = [
      {
        name: 'AI Enthusiasts',
        members: topSkills.slice(0, 3).length ? Math.max(8, Math.round(totalStudents * 0.18)) : 0,
        skills: topSkills.slice(0, 3),
        activityLevel: 92,
      },
      {
        name: 'Full Stack Developers',
        members: topSkills.slice(3, 6).length ? Math.max(6, Math.round(totalStudents * 0.15)) : 0,
        skills: topSkills.slice(3, 6),
        activityLevel: 85,
      },
      {
        name: 'Data Analysts',
        members: topSkills.slice(6, 9).length ? Math.max(4, Math.round(totalStudents * 0.12)) : 0,
        skills: topSkills.slice(6, 9),
        activityLevel: 78,
      },
    ].filter((cluster) => cluster.skills.length > 0);

    return res.json({
      success: true,
      data: {
        title: 'Analytics Dashboard',
        subtitle: 'ML-powered insights and anomaly detection',
        stats: {
          totalProfiles: totalStudents,
          verifiedUsers: verifiedStudents,
          activeSearches: projects.length * 4 + totalStudents,
          anomaliesDetected: Math.max(0, Math.floor((100 - verificationRate) / 15)),
          verificationRate,
        },
        trendingSkills,
        clusters,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdminSettingsView = async (_req, res, next) => {
  try {
    let settings = await SystemSettings.findOne({ key: 'default' }).lean();

    if (!settings) {
      settings = await SystemSettings.create(DEFAULT_SETTINGS);
      settings = settings.toObject();
    }

    return res.json({ success: true, data: settings });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminSettingsView = async (req, res, next) => {
  try {
    const incoming = req.body || {};

    const updated = await SystemSettings.findOneAndUpdate(
      { key: 'default' },
      {
        $set: {
          general: incoming.general,
          notifications: incoming.notifications,
          security: incoming.security,
          upload: incoming.upload,
          database: incoming.database,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    return res.json({ success: true, data: updated, message: 'Settings updated successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getLoginContent = async (_req, res, next) => {
  try {
    const [totalStudents, verifiedStudents] = await Promise.all([
      Student.countDocuments({}),
      FaceEmbedding.countDocuments({}),
    ]);

    return res.json({
      success: true,
      data: {
        ...DEFAULT_LOGIN_CONTENT,
        leftPanel: {
          ...DEFAULT_LOGIN_CONTENT.leftPanel,
          highlights: DEFAULT_LOGIN_CONTENT.leftPanel.highlights.map((item) => {
            if (item.key === 'active_users') {
              return {
                ...item,
                title: `${Math.max(totalStudents, 0).toLocaleString()}+ Active Users`,
              };
            }

            if (item.key === 'verified_profiles') {
              return {
                ...item,
                description: `${safePct(verifiedStudents, totalStudents)}% verification rate`,
              };
            }

            return item;
          }),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};
