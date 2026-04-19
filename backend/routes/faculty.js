import express from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { syncFacultyProfile, syncStudentProfileByEmail } from '../utils/profileSync.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { extractFaceEmbedding, searchFace } from '../services/faceServices.js';
import { verifyToken, isAdmin, isAdminOrFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();

const faceSearchUpload = multer({
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

const FALLBACK_FACE_MATCH_THRESHOLD = Number(process.env.BACKEND_FACE_MATCH_THRESHOLD || 0.45);

const cosineSimilarity = (left, right) => {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || !left.length) {
    return -1;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let i = 0; i < left.length; i += 1) {
    const a = Number(left[i]);
    const b = Number(right[i]);
    dot += a * b;
    leftNorm += a * a;
    rightNorm += b * b;
  }

  if (!leftNorm || !rightNorm) return -1;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
};

const findBestStudentByProfileEmbeddings = async (queryEmbedding) => {
  const candidates = await Student.find({ faceVerificationStatus: 'complete' })
    .select('+faceEmbeddings name roll department email verificationStatus faceVerificationStatus profileCompleteness profile_image cover_image')
    .lean();

  let best = null;

  for (const candidate of candidates) {
    const stored = candidate?.faceEmbeddings;
    if (!stored) continue;

    const scores = [
      cosineSimilarity(queryEmbedding, stored.front),
      cosineSimilarity(queryEmbedding, stored.left),
      cosineSimilarity(queryEmbedding, stored.right),
    ].filter((score) => Number.isFinite(score) && score >= 0);

    if (!scores.length) continue;
    const confidence = Math.max(...scores);

    if (!best || confidence > best.confidence) {
      best = { candidate, confidence };
    }
  }

  if (!best || best.confidence < FALLBACK_FACE_MATCH_THRESHOLD) {
    return null;
  }

  return best;
};

const getRequesterContext = async (req) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId) {
    return { userId: null, userType, email: '' };
  }

  const userRecord = await User.findById(userId).select('email');
  return {
    userId,
    userType,
    email: userRecord?.email || '',
  };
};

const deleteIfLocalFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
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

const normalizeDepartment = (value) => {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
};

const hasSameDepartment = (facultyDepartment, studentDepartment) => {
  const left = normalizeDepartment(facultyDepartment);
  const right = normalizeDepartment(studentDepartment);
  return Boolean(left) && Boolean(right) && left === right;
};

const findFacultyByRequester = async (req) => {
  const requester = await getRequesterContext(req);
  if (!requester.email) {
    return null;
  }

  return Faculty.findOne({ email: requester.email });
};

const syncFacultyProfileFromDoc = async (faculty) => {
  if (!faculty?.email) return;

  const user = await User.findOne({ email: faculty.email }).select('_id email name userType');
  if (!user) return;

  await syncFacultyProfile({ user, faculty });
};

const promoteToStronglyVerifiedIfEligible = (student, facultyId) => {
  const profileReady = (student.profileCompleteness || 0) >= 40 && student.faceVerificationStatus === 'complete';
  const skillsVerified = !Array.isArray(student.skills) || student.skills.every((skill) => Boolean(skill.verified));
  const certificatesVerified = !Array.isArray(student.certificates) || student.certificates.every((certificate) => Boolean(certificate.verified));

  if (profileReady && skillsVerified && certificatesVerified) {
    student.verificationStatus = 'strongly_verified';
    student.verifiedBy = facultyId;
    student.verifiedAt = new Date();
  }
};

// Create faculty
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = new Faculty({
      ...rest,
      password: hashedPassword,
    });

    await faculty.save();
    await syncFacultyProfileFromDoc(faculty);

    const { password: _, ...facultyData } = faculty._doc;

    res.status(201).json(facultyData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all faculty
router.get('/', verifyToken, isAdminOrFaculty, async (_req, res) => {
  const faculty = await Faculty.find().select('-password');
  res.json(faculty);
});

// Search student by face image (faculty/admin)
router.post('/face-search', verifyToken, isAdminOrFaculty, faceSearchUpload.single('face'), async (req, res) => {
  const faceFile = req.file;

  try {
    if (!faceFile) {
      return res.status(400).json({ success: false, message: 'Face image is required' });
    }

    const result = await searchFace(faceFile);
    if (result?.match && result?.student_id) {
      const student = await Student.findById(result.student_id).select('-password');
      if (student) {
        return res.json({
          success: true,
          match: true,
          confidence: result.confidence,
          source: 'faiss',
          student,
        });
      }
    }

    const queryEmbedding = await extractFaceEmbedding(faceFile);
    const fallbackMatch = await findBestStudentByProfileEmbeddings(queryEmbedding);

    if (!fallbackMatch) {
      return res.json({ success: true, match: false, message: 'No registered student found.' });
    }

    const { candidate, confidence } = fallbackMatch;
    const { faceEmbeddings, ...safeStudent } = candidate;

    return res.json({
      success: true,
      match: true,
      confidence,
      source: 'profile_embeddings_fallback',
      student: safeStudent,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Face search failed' });
  }
});

// Verify a student (faculty same department only)
router.post('/verify-student/:id', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const requester = await getRequesterContext(req);
    const faculty = await Faculty.findOne({ email: requester.email }).select('_id department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!hasSameDepartment(faculty.department, student.department)) {
      return res.status(403).json({ success: false, message: 'You can verify only students from your department' });
    }

    if (student.faceVerificationStatus !== 'complete') {
      return res.status(400).json({ success: false, message: 'Student face verification is incomplete' });
    }

    if ((student.profileCompleteness || 0) < 40) {
      return res.status(400).json({ success: false, message: 'Student profile completeness must be at least 40%' });
    }

    student.verificationStatus = 'verified';
    student.verifiedBy = faculty._id;
    student.verifiedAt = new Date();
    promoteToStronglyVerifiedIfEligible(student, faculty._id);

    await student.save();
    await syncStudentProfileByEmail(student.email);

    return res.json({
      success: true,
      message: 'Student verified successfully',
      verificationStatus: student.verificationStatus,
      verifiedAt: student.verifiedAt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify all student skills at once (faculty same department only)
router.post('/verify-student/:id/skills/verify-all', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const requester = await getRequesterContext(req);
    const faculty = await Faculty.findOne({ email: requester.email }).select('_id department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!hasSameDepartment(faculty.department, student.department)) {
      return res.status(403).json({ success: false, message: 'You can verify only students from your department' });
    }

    if (!Array.isArray(student.skills) || !student.skills.length) {
      return res.status(400).json({ success: false, message: 'No skills found to verify' });
    }

    student.skills.forEach((skill) => {
      skill.verified = true;
    });

    promoteToStronglyVerifiedIfEligible(student, faculty._id);

    await student.save();
    await syncStudentProfileByEmail(student.email);

    return res.json({
      success: true,
      message: 'All student skills verified successfully',
      verificationStatus: student.verificationStatus,
      skills: student.skills,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify a single student skill (faculty same department only)
router.post('/verify-student/:id/skills/:skillId/verify', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const requester = await getRequesterContext(req);
    const faculty = await Faculty.findOne({ email: requester.email }).select('_id department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!hasSameDepartment(faculty.department, student.department)) {
      return res.status(403).json({ success: false, message: 'You can verify only students from your department' });
    }

    const skill = (student.skills || []).id(req.params.skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    skill.verified = true;
    promoteToStronglyVerifiedIfEligible(student, faculty._id);

    await student.save();
    await syncStudentProfileByEmail(student.email);

    return res.json({
      success: true,
      message: 'Skill verified successfully',
      skill,
      verificationStatus: student.verificationStatus,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify all student certificates at once (faculty same department only)
router.post('/verify-student/:id/certificates/verify-all', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const requester = await getRequesterContext(req);
    const faculty = await Faculty.findOne({ email: requester.email }).select('_id department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!hasSameDepartment(faculty.department, student.department)) {
      return res.status(403).json({ success: false, message: 'You can verify only students from your department' });
    }

    if (!Array.isArray(student.certificates) || !student.certificates.length) {
      return res.status(400).json({ success: false, message: 'No certificates found to verify' });
    }

    const certificateIds = student.certificates.map((certificateId) => String(certificateId));
    await Certificate.updateMany(
      { _id: { $in: certificateIds } },
      { $set: { verified: true } }
    );

    promoteToStronglyVerifiedIfEligible(student, faculty._id);

    await student.save();
    await syncStudentProfileByEmail(student.email);

    return res.json({
      success: true,
      message: 'All student certificates verified successfully',
      certificates: certificateIds,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify a single student certificate (faculty same department only)
router.post('/verify-student/:id/certificates/:certificateId/verify', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const requester = await getRequesterContext(req);
    const faculty = await Faculty.findOne({ email: requester.email }).select('_id department');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!hasSameDepartment(faculty.department, student.department)) {
      return res.status(403).json({ success: false, message: 'You can verify only students from your department' });
    }

    const studentCertificateIds = Array.isArray(student.certificates)
      ? student.certificates.map((certificateId) => String(certificateId))
      : [];

    if (!studentCertificateIds.includes(String(req.params.certificateId))) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const certificate = await Certificate.findByIdAndUpdate(
      req.params.certificateId,
      { $set: { verified: true } },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    promoteToStronglyVerifiedIfEligible(student, faculty._id);

    await student.save();
    await syncStudentProfileByEmail(student.email);

    return res.json({
      success: true,
      message: 'Certificate verified successfully',
      certificate,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get logged-in faculty profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const faculty = await findFacultyByRequester(req);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const { password: _, ...facultyData } = faculty.toObject();
    return res.json(facultyData);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update logged-in faculty profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const faculty = await findFacultyByRequester(req);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const disallowedFields = new Set(['_id', 'password', 'role', 'createdAt', 'updatedAt']);
    const requestedEmail = String(req.body?.email || '').trim();
    if (requestedEmail) {
      const existingUser = await User.findOne({ email: requestedEmail, _id: { $ne: req.user.id } });
      const existingFaculty = await Faculty.findOne({ email: requestedEmail, _id: { $ne: faculty._id } });
      if (existingUser || existingFaculty) {
        return res.status(409).json({ success: false, message: 'Email is already in use' });
      }
    }

    const updates = Object.entries(req.body || {}).reduce((acc, [key, value]) => {
      if (!disallowedFields.has(key)) {
        acc[key] = value;
      }
      return acc;
    }, {});

    Object.assign(faculty, updates);
    await faculty.save();

    // Keep User collection profile fields aligned with faculty profile edits.
    const displayName = `${faculty.firstname || ''} ${faculty.lastName || ''}`.trim();
    await User.findByIdAndUpdate(req.user.id, {
      email: requestedEmail || faculty.email,
      name: displayName,
      firstname: faculty.firstname,
      lastName: faculty.lastName,
      department: faculty.department,
      designation: faculty.designation,
    });
    await syncFacultyProfileFromDoc(faculty);

    const { password: _, ...facultyData } = faculty.toObject();
    return res.json(facultyData);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Get faculty by ID
router.get('/:id', verifyToken, isAdminOrFaculty, async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).select('-password');
  if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
  res.json(faculty);
});

// Update faculty
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const targetFaculty = await Faculty.findById(req.params.id);
    if (!targetFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    const requester = await getRequesterContext(req);
    const isAdminUser = requester.userType === 'admin';
    const isSelf = requester.userType === 'faculty' && requester.email && requester.email === targetFaculty.email;

    if (!isAdminUser && !isSelf) {
      return res.status(403).json({ message: 'Not authorized to update this faculty profile' });
    }

    const updatedData = { ...req.body };

    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    const faculty = await Faculty.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    }).select('-password');

    await syncFacultyProfileFromDoc(faculty);

    res.json(faculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete faculty
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  await Faculty.findByIdAndDelete(req.params.id);
  res.json({ message: 'Faculty deleted' });
});

export default router;
