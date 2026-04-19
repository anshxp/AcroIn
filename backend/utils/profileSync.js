import Profile from '../models/Profile.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';

const normalizeString = (value) => String(value || '').trim();

const toUniqueList = (values = []) => {
  const normalized = values
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .map((item) => item.toLowerCase());

  return Array.from(new Set(normalized));
};

const deriveYearFromSemester = (semester) => {
  const match = String(semester || '').match(/(\d+)/);
  if (!match) return '';

  const semesterNumber = Number(match[1]);
  if (!Number.isFinite(semesterNumber) || semesterNumber <= 0) return '';

  return `${Math.ceil(semesterNumber / 2)} Year`;
};

const upsertProfile = async ({ user, payload }) => {
  if (!user?._id) return null;

  return Profile.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        userType: user.userType,
        displayName: payload.displayName,
        email: payload.email,
        department: payload.department,
        year: payload.year,
        semester: payload.semester,
        designation: payload.designation,
        location: payload.location,
        skills: payload.skills,
        tags: payload.tags,
        profileCompleteness: payload.profileCompleteness,
        verificationStatus: payload.verificationStatus,
        isActive: payload.isActive,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

export const syncStudentProfile = async ({ user, student }) => {
  if (!user?._id || !student) return null;

  const displayName = normalizeString(student.name) || normalizeString(user.name) || 'Student';
  const year = normalizeString(student.year) || deriveYearFromSemester(student.semester);
  const location = normalizeString(student.location) || normalizeString(student.address);

  const skillNames = Array.isArray(student.skills)
    ? student.skills.map((skill) => (typeof skill === 'string' ? skill : skill?.name))
    : [];

  const skills = toUniqueList([...(student.tech_stack || []), ...skillNames]);
  const tags = toUniqueList([
    student.department,
    year,
    student.semester,
    student.verificationStatus,
    location,
    ...skills,
  ]);

  return upsertProfile({
    user,
    payload: {
      displayName,
      email: normalizeString(student.email) || normalizeString(user.email),
      department: normalizeString(student.department),
      year,
      semester: normalizeString(student.semester),
      designation: '',
      location,
      skills,
      tags,
      profileCompleteness: Number.isFinite(student.profileCompleteness) ? student.profileCompleteness : 0,
      verificationStatus: normalizeString(student.verificationStatus),
      isActive: true,
    },
  });
};

export const syncFacultyProfile = async ({ user, faculty }) => {
  if (!user?._id || !faculty) return null;

  const displayName = `${normalizeString(faculty.firstname)} ${normalizeString(faculty.lastName)}`.trim()
    || normalizeString(user.name)
    || 'Faculty';

  const skills = toUniqueList([...(faculty.skills || []), ...(faculty.techstacks || []), ...(faculty.subjects || [])]);
  const tags = toUniqueList([
    faculty.department,
    faculty.designation,
    faculty.qualification,
    ...(faculty.headof || []),
    ...skills,
  ]);

  return upsertProfile({
    user,
    payload: {
      displayName,
      email: normalizeString(faculty.email) || normalizeString(user.email),
      department: normalizeString(faculty.department),
      year: '',
      semester: '',
      designation: normalizeString(faculty.designation),
      location: '',
      skills,
      tags,
      profileCompleteness: 100,
      verificationStatus: 'verified',
      isActive: true,
    },
  });
};

export const syncStudentProfileByEmail = async (email) => {
  const normalizedEmail = normalizeString(email).toLowerCase();
  if (!normalizedEmail) return null;

  const [user, student] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select('_id email name userType'),
    Student.findOne({ email: normalizedEmail }),
  ]);

  if (!user || !student) return null;
  return syncStudentProfile({ user, student });
};

export const syncFacultyProfileByEmail = async (email) => {
  const normalizedEmail = normalizeString(email).toLowerCase();
  if (!normalizedEmail) return null;

  const [user, faculty] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select('_id email name userType'),
    Faculty.findOne({ email: normalizedEmail }),
  ]);

  if (!user || !faculty) return null;
  return syncFacultyProfile({ user, faculty });
};
