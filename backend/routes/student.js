import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import fs from 'fs';
import multer from 'multer';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { syncStudentProfile } from '../utils/profileSync.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { enrollFace } from '../services/faceServices.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const faceImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const getRequesterContext = async (req) => {
  const userType = req.user?.userType;
  const userId = req.user?.id;

  if (!userId) {
    return { userType, userId: null, email: '' };
  }

  const userRecord = await User.findById(userId).select('email');
  return {
    userType,
    userId,
    email: userRecord?.email || '',
  };
};

const canStudentAccessOwnRecord = async (req, student) => {
  const requester = await getRequesterContext(req);
  return requester.userType === 'student' && requester.email && requester.email === student.email;
};

const syncStudentProfileFromDoc = async (student) => {
  if (!student?.email) return;

  const user = await User.findOne({ email: student.email }).select('_id email name userType');
  if (!user) return;

  await syncStudentProfile({ user, student });
};

const deleteIfLocalFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const getOrdinalSuffix = (value) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) return '';
  const mod10 = normalized % 10;
  const mod100 = normalized % 100;
  if (mod10 === 1 && mod100 !== 11) return 'st';
  if (mod10 === 2 && mod100 !== 12) return 'nd';
  if (mod10 === 3 && mod100 !== 13) return 'rd';
  return 'th';
};

const deriveYearFromSemester = (semester) => {
  const match = String(semester || '').match(/(\d+)/);
  if (!match) return '';

  const semesterNumber = Number(match[1]);
  if (!Number.isFinite(semesterNumber) || semesterNumber <= 0) return '';

  const yearNumber = Math.ceil(semesterNumber / 2);
  return `${yearNumber}${getOrdinalSuffix(yearNumber)} Year`;
};

const calculateProfileCompleteness = (studentDoc) => {
  const student = typeof studentDoc?.toObject === 'function'
    ? studentDoc.toObject()
    : (studentDoc || {});
            
  const hasValue = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return Number.isFinite(value);
    return Boolean(String(value || '').trim());
  };

  const checkpoints = [
    student.name,
    student.roll,
    student.email,
    student.department,
    student.year || deriveYearFromSemester(student.semester),
    student.semester,
    student.phone,
    student.birthday,
    student.address,
    student.location || student.address,
    student.bio,
    student.linkedin,
    student.github,
    student.portfolio,
    student.cgpa,
    student.resume,
    student.profile_image,
    student.tech_stack,
    student.skills,
    student.experiences,
  ];

  const completed = checkpoints.filter((value) => hasValue(value)).length;
  return Math.round((completed / checkpoints.length) * 100);
};

const normalizeStudentResponse = (studentDoc) => {
  const plainStudent = typeof studentDoc?.toObject === 'function'
    ? studentDoc.toObject()
    : studentDoc;

  const normalizedYear = String(plainStudent?.year || '').trim() || deriveYearFromSemester(plainStudent?.semester);
  const normalizedLocation = String(plainStudent?.location || '').trim() || String(plainStudent?.address || '').trim();

  const { password, ...safeStudent } = plainStudent || {};
  const completeness = Number.isFinite(safeStudent.profileCompleteness)
    ? safeStudent.profileCompleteness
    : calculateProfileCompleteness(safeStudent);

  return {
    ...safeStudent,
    year: normalizedYear,
    location: normalizedLocation,
    profileCompleteness: completeness,
  };
};

const resolveStudent = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await Student.findById(identifier);
    if (byId) return byId;
  }

  const normalizedIdentifier = String(identifier || '').trim();
  if (!normalizedIdentifier) return null;

  const byRoll = await Student.findOne({ roll: normalizedIdentifier });
  if (byRoll) return byRoll;

  const byEmail = await Student.findOne({ email: normalizedIdentifier });
  if (byEmail) return byEmail;

  return null;
};

/// Create student
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      ...rest,
      password: hashedPassword,
    });
    student.profileCompleteness = calculateProfileCompleteness(student);

    await student.save();
    await syncStudentProfileFromDoc(student);

    // remove password from response
    const { password: _, ...studentData } = student._doc;

    res.status(201).json(studentData);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all students
router.get('/', verifyToken, async (req, res) => {
  const students = await Student.find().populate([
    { path: 'projects' },
    { path: 'internships' },
    { path: 'competitions' },
    { path: 'certificates' },
  ]);
  const normalizedStudents = students.map((student) => normalizeStudentResponse(student));
  const requesterType = String(req.user?.userType || '').trim().toLowerCase();

  if (requesterType === 'student') {
    const visibleStudents = normalizedStudents.filter((student) => {
      const status = String(student.verificationStatus || '').trim().toLowerCase();
      return status === 'verified' || status === 'strongly_verified';
    });

    const discoveryPayload = visibleStudents.map((student) => ({
      _id: student._id,
      name: student.name,
      roll: student.roll,
      department: student.department,
      year: student.year,
      semester: student.semester,
      location: student.location,
      address: student.address,
      profile_image: student.profile_image,
      verificationStatus: student.verificationStatus,
      tech_stack: Array.isArray(student.tech_stack) ? student.tech_stack : [],
      skills: Array.isArray(student.skills)
        ? student.skills.map((skill) => ({
            name: skill?.name || skill,
            category: skill?.category,
          }))
        : [],
      projects: Array.isArray(student.projects)
        ? student.projects.map((project) => ({
            _id: project?._id,
            title: project?.title,
            description: project?.description,
            technologies: Array.isArray(project?.technologies) ? project.technologies : [],
          }))
        : [],
      certificates: Array.isArray(student.certificates)
        ? student.certificates.map((certificate) => ({
            _id: certificate?._id,
            title: certificate?.title,
            organization: certificate?.organization,
          }))
        : [],
    }));

    return res.json(discoveryPayload);
  }

  return res.json(normalizedStudents);
});

// Get student by ID
router.get('/:id', verifyToken, async (req, res) => {
  const student = await resolveStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const requester = await getRequesterContext(req);
  const isPrivileged = requester.userType === 'admin' || requester.userType === 'faculty';
  const isSelf = requester.userType === 'student' && requester.email && requester.email === student.email;

  if (!isPrivileged && !isSelf) {
    return res.status(403).json({ message: 'Not authorized to access this profile' });
  }

  const populatedStudent = await student.populate([
    { path: 'projects' },
    { path: 'internships' },
    { path: 'competitions' },
    { path: 'certificates' },
  ]);
  const normalizedStudent = normalizeStudentResponse(populatedStudent);

  const shouldPersistYear = !String(student.year || '').trim() && normalizedStudent.year;
  const shouldPersistLocation = !String(student.location || '').trim() && normalizedStudent.location;

  if (shouldPersistYear || shouldPersistLocation) {
    if (shouldPersistYear) {
      student.year = normalizedStudent.year;
    }
    if (shouldPersistLocation) {
      student.location = normalizedStudent.location;
    }
    student.profileCompleteness = calculateProfileCompleteness(student);
    await student.save();
    await syncStudentProfileFromDoc(student);
  }

  res.json(normalizedStudent);
});

// Get student skills
router.get('/:id/skills', verifyToken, async (req, res) => {
  try {
    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const requester = await getRequesterContext(req);
    const isPrivileged = requester.userType === 'admin' || requester.userType === 'faculty';
    const isSelf = requester.userType === 'student' && requester.email && requester.email === student.email;

    if (!isPrivileged && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to access this student skills data' });
    }

    const normalizedSkills = Array.isArray(student.skills) && student.skills.length
      ? student.skills
      : (student.tech_stack || []).map((name) => ({
          category: 'General',
          name,
          level: 'Beginner',
          verified: false,
          endorsements: 0,
          progress: 10,
        }));

    res.json({ skills: normalizedSkills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add student skill
router.post('/:id/skills', verifyToken, async (req, res) => {
  try {
    const { category, name, level, verified, endorsements, progress } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isSelf = await canStudentAccessOwnRecord(req, student);
    if (!isSelf) {
      return res.status(403).json({ message: 'You can only add skills to your own profile' });
    }

    const skillToAdd = {
      category: String(category || 'General').trim(),
      name: String(name).trim(),
      level: ['Beginner', 'Intermediate', 'Advanced'].includes(level) ? level : 'Beginner',
      verified: false,
      endorsements: Math.max(0, Number(endorsements) || 0),
      progress: Math.min(100, Math.max(0, Number(progress) || 10)),
    };

    student.skills = [...(student.skills || []), skillToAdd];

    const existingTechStack = new Set((student.tech_stack || []).map((item) => String(item).trim()).filter(Boolean));
    existingTechStack.add(skillToAdd.name);
    student.tech_stack = Array.from(existingTechStack);

    student.profileCompleteness = calculateProfileCompleteness(student);
    await student.save();
    await syncStudentProfileFromDoc(student);

    res.status(201).json({
      message: 'Skill added successfully',
      skill: student.skills[student.skills.length - 1],
      skills: student.skills,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update student skill
router.put('/:id/skills/:skillId', verifyToken, async (req, res) => {
  try {
    const { category, name, level, verified, endorsements, progress } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isSelf = await canStudentAccessOwnRecord(req, student);
    if (!isSelf) {
      return res.status(403).json({ message: 'You can only edit skills on your own profile' });
    }

    const skill = (student.skills || []).id(req.params.skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const previousName = String(skill.name || '').trim();
    const nextName = String(name).trim();

    skill.category = String(category || 'General').trim();
    skill.name = nextName;
    skill.level = ['Beginner', 'Intermediate', 'Advanced'].includes(level) ? level : 'Beginner';
    skill.verified = Boolean(skill.verified);
    skill.endorsements = Math.max(0, Number(endorsements) || 0);
    skill.progress = Math.min(100, Math.max(0, Number(progress) || 10));

    const techStack = new Set((student.tech_stack || []).map((item) => String(item).trim()).filter(Boolean));
    if (previousName && previousName !== nextName) {
      techStack.delete(previousName);
    }
    techStack.add(nextName);
    student.tech_stack = Array.from(techStack);

    student.profileCompleteness = calculateProfileCompleteness(student);
    await student.save();
    await syncStudentProfileFromDoc(student);

    res.json({
      message: 'Skill updated successfully',
      skill,
      skills: student.skills,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update student
router.put('/:id', verifyToken, async (req, res) => {
  const student = await resolveStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const requester = await getRequesterContext(req);
  const isAdminUser = requester.userType === 'admin';
  const isSelf = requester.userType === 'student' && requester.email && requester.email === student.email;

  if (!isAdminUser && !isSelf) {
    return res.status(403).json({ message: 'Not authorized to update this profile' });
  }

  Object.assign(student, req.body);
  student.profileCompleteness = calculateProfileCompleteness(student);
  await student.save();
  await syncStudentProfileFromDoc(student);
  res.json(normalizeStudentResponse(student));
});

// Delete student
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  const student = await resolveStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  await Student.deleteOne({ _id: student._id });
  res.json({ message: 'Student deleted' });
});

// Upload profile image
router.post('/:id/upload-profile-image', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isSelf = await canStudentAccessOwnRecord(req, student);
    if (!isSelf) {
      return res.status(403).json({ message: 'You can only update your own profile image' });
    }

    // Use Cloudinary URL if available, otherwise use local path
    const imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    student.profile_image = imageUrl;
    student.profileCompleteness = calculateProfileCompleteness(student);
    await student.save();
    await syncStudentProfileFromDoc(student);

    res.json({
      message: 'Profile image uploaded successfully',
      profile_image: imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload cover image
router.post('/:id/upload-cover-image', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isSelf = await canStudentAccessOwnRecord(req, student);
    if (!isSelf) {
      return res.status(403).json({ message: 'You can only update your own cover image' });
    }

    // Use Cloudinary URL if available, otherwise use local path
    const imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    student.cover_image = imageUrl;
    student.profileCompleteness = calculateProfileCompleteness(student);
    await student.save();
    await syncStudentProfileFromDoc(student);

    res.json({
      message: 'Cover image uploaded successfully',
      cover_image: imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll student face embeddings (front, left, right)
router.post(
  '/:id/face/enroll',
  verifyToken,
  faceImageUpload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 },
  ]),
  async (req, res) => {
    const front = req.files?.front?.[0];
    const left = req.files?.left?.[0];
    const right = req.files?.right?.[0];
    let student = null;

    try {
      if (!front || !left || !right) {
        return res.status(400).json({ message: 'front, left, and right face images are required' });
      }

      student = await resolveStudent(req.params.id);
      if (!student) return res.status(404).json({ message: 'Student not found' });

      const isSelf = await canStudentAccessOwnRecord(req, student);
      if (!isSelf) {
        return res.status(403).json({ message: 'You can only enroll face data for your own profile' });
      }

      const enrollResult = await enrollFace(String(student._id), front, left, right);

      const frontEmbedding = enrollResult?.embeddings?.front;
      const leftEmbedding = enrollResult?.embeddings?.left;
      const rightEmbedding = enrollResult?.embeddings?.right;

      if (!Array.isArray(frontEmbedding) || !Array.isArray(leftEmbedding) || !Array.isArray(rightEmbedding)) {
        throw new Error('Face service did not return valid embeddings.');
      }

      student.faceEmbeddings = {
        front: frontEmbedding,
        left: leftEmbedding,
        right: rightEmbedding,
        modelVersion: enrollResult?.model_version || 'arcface_v1',
        updatedAt: new Date(),
      };

      student.faceVerificationStatus = 'complete';
      student.profileCompleteness = calculateProfileCompleteness(student);
      await student.save();
      await syncStudentProfileFromDoc(student);

      res.json({
        success: true,
        message: 'Face data enrolled successfully',
        faceVerificationStatus: student.faceVerificationStatus,
      });
    } catch (err) {
      if (student) {
        student.faceVerificationStatus = 'partial';
        student.profileCompleteness = calculateProfileCompleteness(student);
        await student.save();
        await syncStudentProfileFromDoc(student);
      }
      res.status(500).json({ success: false, message: err.message || 'Failed to enroll face data' });
    }
  }
);

export default router;
