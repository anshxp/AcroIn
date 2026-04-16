import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Project from '../models/Project.js';
import Internship from '../models/Internship.js';
import Competition from '../models/Competition.js';
import Certificate from '../models/Certificate.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

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
router.post('/', async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      ...rest,
      password: hashedPassword
    });

    await student.save();

    // remove password from response
    const { password: _, ...studentData } = student._doc;

    res.status(201).json(studentData);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  const students = await Student.find().populate('projects internships competitions certificates');
  res.json(students);
});

// Get student by ID
router.get('/:id', async (req, res) => {
  const student = await resolveStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(await student.populate('projects internships competitions certificates'));
});

// Get student skills
router.get('/:id/skills', async (req, res) => {
  try {
    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const normalizedSkills = Array.isArray(student.skills) && student.skills.length
      ? student.skills
      : (student.tech_stack || []).map((name) => ({
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
router.post('/:id/skills', async (req, res) => {
  try {
    const { name, level, verified, endorsements, progress } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const skillToAdd = {
      name: String(name).trim(),
      level: ['Beginner', 'Intermediate', 'Advanced'].includes(level) ? level : 'Beginner',
      verified: Boolean(verified),
      endorsements: Math.max(0, Number(endorsements) || 0),
      progress: Math.min(100, Math.max(0, Number(progress) || 10)),
    };

    student.skills = [...(student.skills || []), skillToAdd];

    const existingTechStack = new Set((student.tech_stack || []).map((item) => String(item).trim()).filter(Boolean));
    existingTechStack.add(skillToAdd.name);
    student.tech_stack = Array.from(existingTechStack);

    await student.save();

    res.status(201).json({
      message: 'Skill added successfully',
      skill: student.skills[student.skills.length - 1],
      skills: student.skills,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  const student = await resolveStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  Object.assign(student, req.body);
  await student.save();
  res.json(student);
});

// Delete student
router.delete('/:id', async (req, res) => {
  const student = await resolveStudent(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  await Student.deleteOne({ _id: student._id });
  res.json({ message: 'Student deleted' });
});

// Upload profile image
router.post('/:id/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Use Cloudinary URL if available, otherwise use local path
    const imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    student.profile_image = imageUrl;
    await student.save();

    res.json({
      message: 'Profile image uploaded successfully',
      profile_image: imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload cover image
router.post('/:id/upload-cover-image', upload.single('coverImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await resolveStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Use Cloudinary URL if available, otherwise use local path
    const imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    student.cover_image = imageUrl;
    await student.save();

    res.json({
      message: 'Cover image uploaded successfully',
      cover_image: imageUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
