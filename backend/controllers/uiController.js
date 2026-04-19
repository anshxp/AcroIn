import Project from '../models/Project.js';
import Student from '../models/Student.js';
import AuditLog from '../models/AuditLog.js';
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

const normalizeSkill = (value) => String(value || '').trim().toLowerCase();

const formatSkillLabel = (skill) => {
  const normalized = normalizeSkill(skill);
  if (!normalized) return 'Unknown';
  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const isVerifiedStatus = (status) => ['verified', 'strongly_verified'].includes(String(status || '').toLowerCase());

const extractStudentSkills = (student) => {
  const collected = [];

  (student.tech_stack || []).forEach((skill) => {
    const normalized = normalizeSkill(skill);
    if (normalized) collected.push(normalized);
  });

  (student.skills || []).forEach((skillItem) => {
    const normalized = normalizeSkill(skillItem?.name || skillItem);
    if (normalized) collected.push(normalized);
  });

  return Array.from(new Set(collected));
};

const toDate = (value) => {
  const date = value ? new Date(value) : null;
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
};

const pctDelta = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export const getStudentProjectsView = async (_req, res, next) => {
  try {
    const [projects, totalStudents, verifiedStudents] = await Promise.all([
      Project.find({}).sort({ createdAt: -1 }).lean(),
      Student.countDocuments({}),
      Student.countDocuments({ faceVerificationStatus: 'complete' }),
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
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const [students, verifiedStudents, projects, recentSearches, previousSearches] = await Promise.all([
      Student.find({}).lean(),
      Student.countDocuments({ faceVerificationStatus: 'complete' }),
      Project.find({}).lean(),
      AuditLog.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        $or: [
          { path: /search/i },
          { path: /recommend/i },
        ],
      }),
      AuditLog.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
        $or: [
          { path: /search/i },
          { path: /recommend/i },
        ],
      }),
    ]);

    const totalStudents = students.length;
    const verificationRate = safePct(verifiedStudents, totalStudents);

    const recentlyCreatedStudents = students.filter((student) => {
      const createdAt = toDate(student.createdAt);
      return createdAt && createdAt >= thirtyDaysAgo;
    }).length;

    const previousCreatedStudents = students.filter((student) => {
      const createdAt = toDate(student.createdAt);
      return createdAt && createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    }).length;

    const profileGrowthPct = pctDelta(recentlyCreatedStudents, previousCreatedStudents);
    const activeSearchesGrowthPct = pctDelta(recentSearches, previousSearches);

    const skillMap = new Map();
    const recentSkillMap = new Map();
    const previousSkillMap = new Map();

    students.forEach((student) => {
      const skills = extractStudentSkills(student);
      const createdAt = toDate(student.createdAt);

      skills.forEach((skill) => {
        skillMap.set(skill, (skillMap.get(skill) || 0) + 1);

        if (createdAt && createdAt >= thirtyDaysAgo) {
          recentSkillMap.set(skill, (recentSkillMap.get(skill) || 0) + 1);
        } else if (createdAt && createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo) {
          previousSkillMap.set(skill, (previousSkillMap.get(skill) || 0) + 1);
        }
      });
    });

    const trendingSkills = Array.from(skillMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, studentsCount], index) => {
        const recentCount = recentSkillMap.get(name) || 0;
        const previousCount = previousSkillMap.get(name) || 0;
        const growthPct = pctDelta(recentCount, previousCount);

        return {
        rank: index + 1,
        name: formatSkillLabel(name),
        students: studentsCount,
        growthPct,
      };
      });

    const globalSkillRank = Array.from(skillMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skill]) => skill);
    const rankBySkill = new Map(globalSkillRank.map((skill, index) => [skill, index]));

    const clusterMap = new Map();
    students.forEach((student) => {
      const skills = extractStudentSkills(student).sort((a, b) => {
        const leftRank = rankBySkill.get(a) ?? Number.MAX_SAFE_INTEGER;
        const rightRank = rankBySkill.get(b) ?? Number.MAX_SAFE_INTEGER;
        if (leftRank === rightRank) return a.localeCompare(b);
        return leftRank - rightRank;
      });

      if (!skills.length) return;

      const signatureSkills = skills.slice(0, Math.min(2, skills.length));
      const signature = signatureSkills.join('|');
      const existing = clusterMap.get(signature) || {
        members: 0,
        skills: signatureSkills,
        completenessTotal: 0,
        verifiedMembers: 0,
      };

      existing.members += 1;
      existing.completenessTotal += Number(student.profileCompleteness || 0);
      if (isVerifiedStatus(student.verificationStatus)) {
        existing.verifiedMembers += 1;
      }

      clusterMap.set(signature, existing);
    });

    const clusters = Array.from(clusterMap.entries())
      .map(([signature, data]) => {
        const clusterSkills = data.skills.map((skill) => formatSkillLabel(skill));
        const avgCompleteness = data.members ? data.completenessTotal / data.members : 0;
        const verifiedRatio = data.members ? data.verifiedMembers / data.members : 0;
        const activityLevel = Math.max(
          5,
          Math.min(100, Math.round(avgCompleteness * 0.65 + verifiedRatio * 35))
        );

        return {
          key: signature,
          name:
            clusterSkills.length >= 2
              ? `${clusterSkills[0]} + ${clusterSkills[1]} Track`
              : `${clusterSkills[0]} Specialists`,
          members: data.members,
          skills: clusterSkills,
          activityLevel,
        };
      })
      .sort((a, b) => b.members - a.members)
      .slice(0, 4);

    const emailCounts = new Map();
    const rollCounts = new Map();
    students.forEach((student) => {
      const email = String(student.email || '').trim().toLowerCase();
      const roll = String(student.roll || '').trim().toUpperCase();
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      if (roll) rollCounts.set(roll, (rollCounts.get(roll) || 0) + 1);
    });

    const anomalyAlerts = [];
    students.forEach((student) => {
      if (
        isVerifiedStatus(student.verificationStatus)
        && String(student.faceVerificationStatus || '').toLowerCase() !== 'complete'
      ) {
        anomalyAlerts.push({
          title: 'Verification mismatch',
          severity: 'High',
          description: 'Profile is verified but face verification is not complete.',
          user: `${student.name || 'Unknown'} - ${student.roll || student.department || 'N/A'}`,
          action: 'Review Verification',
          timestamp: student.updatedAt || student.createdAt,
        });
      }

      if ((student.profileCompleteness || 0) >= 80 && !isVerifiedStatus(student.verificationStatus)) {
        anomalyAlerts.push({
          title: 'Pending high-quality profile',
          severity: 'Medium',
          description: 'Profile is highly complete but still not verified.',
          user: `${student.name || 'Unknown'} - ${student.roll || student.department || 'N/A'}`,
          action: 'Prioritize Review',
          timestamp: student.updatedAt || student.createdAt,
        });
      }

      const cgpa = Number(student.cgpa);
      if (!Number.isNaN(cgpa) && (cgpa < 0 || cgpa > 10)) {
        anomalyAlerts.push({
          title: 'CGPA out of range',
          severity: 'High',
          description: 'CGPA value is outside expected 0-10 bounds.',
          user: `${student.name || 'Unknown'} - ${student.roll || student.department || 'N/A'}`,
          action: 'Fix Data',
          timestamp: student.updatedAt || student.createdAt,
        });
      }

      const hasUnusualEndorsements = (student.skills || []).some(
        (skill) => Number(skill?.endorsements || 0) > 200
      );
      if (hasUnusualEndorsements) {
        anomalyAlerts.push({
          title: 'Unusual endorsement spike',
          severity: 'Low',
          description: 'One or more skills have unusually high endorsement counts.',
          user: `${student.name || 'Unknown'} - ${student.roll || student.department || 'N/A'}`,
          action: 'Investigate',
          timestamp: student.updatedAt || student.createdAt,
        });
      }

      const normalizedEmail = String(student.email || '').trim().toLowerCase();
      if (normalizedEmail && (emailCounts.get(normalizedEmail) || 0) > 1) {
        anomalyAlerts.push({
          title: 'Duplicate email detected',
          severity: 'High',
          description: 'Email appears on more than one student profile.',
          user: `${student.name || 'Unknown'} - ${student.roll || student.department || 'N/A'}`,
          action: 'Resolve Conflict',
          timestamp: student.updatedAt || student.createdAt,
        });
      }

      const normalizedRoll = String(student.roll || '').trim().toUpperCase();
      if (normalizedRoll && (rollCounts.get(normalizedRoll) || 0) > 1) {
        anomalyAlerts.push({
          title: 'Duplicate roll number',
          severity: 'High',
          description: 'Roll number appears on more than one student profile.',
          user: `${student.name || 'Unknown'} - ${student.roll || student.department || 'N/A'}`,
          action: 'Resolve Conflict',
          timestamp: student.updatedAt || student.createdAt,
        });
      }
    });

    const severityOrder = { High: 3, Medium: 2, Low: 1 };
    const sortedAlerts = anomalyAlerts
      .sort((left, right) => {
        const severityDelta = (severityOrder[right.severity] || 0) - (severityOrder[left.severity] || 0);
        if (severityDelta !== 0) return severityDelta;

        const leftTime = toDate(left.timestamp)?.getTime() || 0;
        const rightTime = toDate(right.timestamp)?.getTime() || 0;
        return rightTime - leftTime;
      })
      .slice(0, 10)
      .map(({ timestamp, ...alert }) => alert);

    return res.json({
      success: true,
      data: {
        title: 'Analytics Dashboard',
        subtitle: 'ML-powered insights and anomaly detection',
        stats: {
          totalProfiles: totalStudents,
          verifiedUsers: verifiedStudents,
          activeSearches: recentSearches,
          anomaliesDetected: sortedAlerts.length,
          verificationRate,
          profileGrowthPct,
          activeSearchesGrowthPct,
          newProfilesLast30Days: recentlyCreatedStudents,
          projectsTracked: projects.length,
        },
        trendingSkills,
        clusters,
        anomalyAlerts: sortedAlerts,
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

    const existing = await SystemSettings.findOne({ key: 'default' }).lean();
    const base = existing || DEFAULT_SETTINGS;

    const payload = {
      general: {
        ...base.general,
        ...(incoming.general || {}),
      },
      notifications: {
        ...base.notifications,
        ...(incoming.notifications || {}),
      },
      security: {
        ...base.security,
        ...(incoming.security || {}),
      },
      upload: {
        ...base.upload,
        ...(incoming.upload || {}),
      },
      database: {
        ...base.database,
        ...(incoming.database || {}),
      },
    };

    const updated = await SystemSettings.findOneAndUpdate(
      { key: 'default' },
      {
        $set: payload,
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
      Student.countDocuments({ faceVerificationStatus: 'complete' }),
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
