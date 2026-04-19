import Faculty from '../models/Faculty.js';
import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getStudentSkillTokens = (student) => {
  const skillNames = Array.isArray(student.skills)
    ? student.skills.map((skill) => (typeof skill === 'string' ? skill : skill?.name)).filter(Boolean)
    : [];

  return new Set(
    [
      student.department,
      student.year,
      student.semester,
      student.location,
      student.address,
      ...(student.tech_stack || []),
      ...skillNames,
    ]
      .map(normalizeText)
      .filter(Boolean)
  );
};

const getAnnouncementTokens = (payload) => {
  const parts = [
    payload.title,
    payload.name,
    payload.description,
    payload.organizer,
    payload.company,
    payload.location,
    payload.type,
    ...(normalizeList(payload.requirements) || []),
    ...(normalizeList(payload.targetDepartments) || []),
    ...(normalizeList(payload.targetYears) || []),
    ...(normalizeList(payload.targetSkills) || []),
    ...(normalizeList(payload.targetLocations) || []),
  ];

  return new Set(parts.map(normalizeText).filter(Boolean));
};

const matchesAnyToken = (tokens, candidates) => {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeText(candidate);
    if (!normalizedCandidate) continue;

    for (const token of tokens) {
      if (!token) continue;
      if (normalizedCandidate.includes(token) || token.includes(normalizedCandidate)) {
        return true;
      }
    }
  }

  return false;
};

const studentYearMatches = (student, targetYears) => {
  if (!targetYears.length) return true;

  const studentYear = normalizeText(student.year);
  const studentSemester = normalizeText(student.semester);

  return targetYears.some((targetYear) => {
    const normalizedTarget = normalizeText(targetYear);
    return normalizedTarget === studentYear || normalizedTarget === studentSemester;
  });
};

const studentLocationMatches = (student, targetLocations) => {
  if (!targetLocations.length) return true;

  const studentLocation = normalizeText(student.location || student.address);
  return targetLocations.some((targetLocation) => {
    const normalizedTarget = normalizeText(targetLocation);
    return studentLocation.includes(normalizedTarget) || normalizedTarget.includes(studentLocation);
  });
};

const studentSkillsMatch = (student, targetSkills) => {
  if (!targetSkills.length) return true;

  const tokens = getStudentSkillTokens(student);
  return targetSkills.some((targetSkill) => {
    const normalizedTarget = normalizeText(targetSkill);
    for (const token of tokens) {
      if (token.includes(normalizedTarget) || normalizedTarget.includes(token)) {
        return true;
      }
    }
    return false;
  });
};

const studentDepartmentMatches = (student, targetDepartments) => {
  if (!targetDepartments.length) return true;

  const studentDepartment = normalizeText(student.department);
  return targetDepartments.some((targetDepartment) => normalizeText(targetDepartment) === studentDepartment);
};

const studentCgpaMatches = (student, minCgpa) => {
  if (minCgpa === undefined || minCgpa === null || minCgpa === '') return true;
  const parsedCgpa = Number(student.cgpa);
  const requiredCgpa = Number(minCgpa);
  if (Number.isNaN(requiredCgpa)) return true;
  if (Number.isNaN(parsedCgpa)) return false;
  return parsedCgpa >= requiredCgpa;
};

const studentVerificationMatches = (student, verificationStatus) => {
  if (!verificationStatus) return true;
  return normalizeText(student.verificationStatus) === normalizeText(verificationStatus);
};

const studentMatchesAnnouncement = (student, payload, creatorDepartment) => {
  const targetDepartments = normalizeList(payload.targetDepartments);
  const targetYears = normalizeList(payload.targetYears);
  const targetSkills = normalizeList(payload.targetSkills);
  const targetLocations = normalizeList(payload.targetLocations);
  const announcementTokens = getAnnouncementTokens(payload);
  const studentTokens = getStudentSkillTokens(student);

  const explicitTargetMatch =
    studentDepartmentMatches(student, targetDepartments) &&
    studentYearMatches(student, targetYears) &&
    studentSkillsMatch(student, targetSkills) &&
    studentLocationMatches(student, targetLocations) &&
    studentCgpaMatches(student, payload.minCgpa) &&
    studentVerificationMatches(student, payload.targetVerificationStatus);

  if (targetDepartments.length || targetYears.length || targetSkills.length || targetLocations.length || payload.minCgpa || payload.targetVerificationStatus) {
    return explicitTargetMatch;
  }

  if (creatorDepartment && normalizeText(student.department) === normalizeText(creatorDepartment)) {
    return true;
  }

  return matchesAnyToken(announcementTokens, studentTokens);
};

const getCreatorContext = async (req) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;
  const context = {
    creatorName: 'Faculty',
    creatorDepartment: '',
    creatorRole: userType || 'system',
  };

  if (!userId) return context;

  const user = await User.findById(userId).select('email name firstname lastName userType');
  if (!user) return context;

  context.creatorName = user.name || [user.firstname, user.lastName].filter(Boolean).join(' ') || context.creatorName;

  if (user.userType === 'faculty') {
    const faculty = await Faculty.findOne({ email: user.email }).select('department firstname lastName');
    if (faculty?.department) {
      context.creatorDepartment = faculty.department;
    }
    context.creatorName = [faculty?.firstname, faculty?.lastName].filter(Boolean).join(' ') || context.creatorName;
  }

  return context;
};

const buildAnnouncementMessage = ({ announcementType, title, creatorName, creatorDepartment }) => {
  const prefix = announcementType === 'certificate' ? 'New certification available' : `New ${announcementType} announced`;
  const creatorPart = creatorDepartment
    ? `${creatorName} • ${creatorDepartment}`
    : creatorName;

  return `${prefix}: ${title} by ${creatorPart}`;
};

const getRecipientsForAnnouncement = async (req, payload, announcementType, title) => {
  const creatorContext = await getCreatorContext(req);
  const eligibleStudents = await Student.find({ profileCompleteness: { $gte: 40 } })
    .select('email department year semester location address tech_stack skills cgpa verificationStatus')
    .lean();

  return eligibleStudents.filter((student) => studentMatchesAnnouncement(student, payload, creatorContext.creatorDepartment));
};

export const createAnnouncementNotifications = async ({ req, payload, announcementType, sourceId, title, recipientUserIds = [], actionPath = '' }) => {
  try {
    if (!req.user || req.user.userType === 'student') {
      return { matchedStudents: 0, notificationsCreated: 0 };
    }

    const creatorContext = await getCreatorContext(req);
    const eligibleStudents = recipientUserIds.length > 0
      ? []
      : await getRecipientsForAnnouncement(req, payload, announcementType, title);

    if (!recipientUserIds.length && !eligibleStudents.length) {
      return { matchedStudents: 0, notificationsCreated: 0 };
    }

    const users = recipientUserIds.length > 0
      ? await User.find({ _id: { $in: recipientUserIds } }).select('_id email')
      : await User.find({
          email: { $in: eligibleStudents.map((student) => student.email).filter(Boolean) },
        }).select('_id email');

    const userIdByEmail = new Map(users.map((user) => [normalizeText(user.email), user._id]));
    const message = buildAnnouncementMessage({
      announcementType,
      title,
      creatorName: creatorContext.creatorName,
      creatorDepartment: creatorContext.creatorDepartment,
    });

    const notifications = recipientUserIds.length > 0
      ? users.map((user) => ({
          user: user._id,
          message,
          type: announcementType === 'certificate' ? 'certificate' : 'system',
          sourceType: announcementType,
          sourceId,
          sourceTitle: title,
          actionPath,
        }))
      : eligibleStudents
          .map((student) => {
            const userId = userIdByEmail.get(normalizeText(student.email));
            if (!userId) return null;

            return {
              user: userId,
              message,
              type: announcementType === 'certificate' ? 'certificate' : 'system',
              sourceType: announcementType,
              sourceId,
              sourceTitle: title,
              actionPath,
            };
          })
          .filter(Boolean);

    if (!notifications.length) {
      return { matchedStudents: eligibleStudents.length, notificationsCreated: 0 };
    }

    await Notification.insertMany(notifications);

    return {
      matchedStudents: eligibleStudents.length || users.length,
      notificationsCreated: notifications.length,
    };
  } catch (error) {
    console.warn('Failed to create announcement notifications:', error.message);
    return { matchedStudents: 0, notificationsCreated: 0 };
  }
};