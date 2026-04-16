import express from 'express';
import mongoose from 'mongoose';
import Competition from '../models/Competition.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';
import { verifyToken, isAdminOrFaculty, isStudent } from '../middleware/authMiddleware.js';
const router = express.Router();

const withApplicationLink = (doc) => {
  const obj = typeof doc?.toObject === 'function' ? doc.toObject() : doc;
  const link = obj?.application_link || null;
  return {
    ...obj,
    apply_link: link,
    applicationUrl: link,
  };
};

const normalizeApplicationLinkPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;

  const linkCandidate = [
    payload.application_link,
    payload.apply_link,
    payload.applicationUrl,
    payload.applyUrl,
    payload.registration_link,
    payload.registrationUrl,
    payload.link,
    payload.url,
  ].find((value) => typeof value === 'string' && value.trim().length > 0);

  if (typeof linkCandidate === 'string') {
    payload.application_link = linkCandidate;
  }

  return payload;
};

// Get all competitions
router.get('/', async (req, res) => {
  try {
    const competitions = await Competition.find();
    res.json(competitions.map(withApplicationLink));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get competitions by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) return res.json([]);

    const competitions = await Competition.find({ student: studentId });
    res.json(competitions.map(withApplicationLink));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create competition (admin/faculty with links, student optional)
router.post('/', verifyToken, async (req, res) => {
  try {
    const isAdminOrFacultyUser = req.user?.userType === 'admin' || req.user?.userType === 'faculty';
    const payload = normalizeApplicationLinkPayload({ ...(req.body || {}) });
    
    // For admin/faculty, application_link is required. For students, it's optional
    if (isAdminOrFacultyUser && !payload.application_link) {
      return res.status(400).json({ 
        success: false, 
        message: 'Competition link is required for admin/faculty submissions' 
      });
    }
    
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }
    
    // Track who created this
    payload.createdBy = req.user?.id;
    payload.createdByRole = req.user?.userType;

    const competition = new Competition(payload);
    await competition.save();
    res.status(201).json(withApplicationLink(competition));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Apply to competition
router.post('/:id/apply', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }
    const { studentId } = req.body;
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });
    if (!competition.students) competition.students = [];
    if (studentId && !competition.students.includes(studentId)) competition.students.push(studentId);
    await competition.save();
    res.json(withApplicationLink(competition));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update competition
router.put('/:id', async (req, res) => {
  try {
    const payload = normalizeApplicationLinkPayload({ ...(req.body || {}) });
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    res.json(withApplicationLink(competition));

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Delete competition
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }
    const deleted = await Competition.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Competition not found' });
    res.json({ success: true, message: 'Competition deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
