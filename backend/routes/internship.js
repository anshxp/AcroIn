import express from 'express';
import mongoose from 'mongoose';
import Internship from '../models/Internship.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';
import { verifyToken } from '../middleware/authMiddleware.js';
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

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships.map(withApplicationLink));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get internships by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) return res.json([]);

    const internships = await Internship.find({ student: studentId });
    res.json(internships.map(withApplicationLink));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create internship (admin/faculty with links, student optional)
router.post('/', verifyToken, async (req, res) => {
  try {
    const isAdminOrFacultyUser = req.user?.userType === 'admin' || req.user?.userType === 'faculty';
    const payload = normalizeApplicationLinkPayload({ ...(req.body || {}) });
    
    // For admin/faculty, application_link is required. For students, it's optional
    if (isAdminOrFacultyUser && !payload.application_link) {
      return res.status(400).json({ 
        success: false, 
        message: 'Internship link is required for admin/faculty submissions' 
      });
    }
    
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }
    
    // Track who created this
    payload.createdBy = req.user?.id;
    payload.createdByRole = req.user?.userType;

    const internship = new Internship(payload);
    await internship.save();
    res.status(201).json(withApplicationLink(internship));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Apply to internship
router.post('/:id/apply', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }
    const { studentId } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
    if (!internship.students) internship.students = [];
    if (studentId && !internship.students.includes(studentId)) internship.students.push(studentId);
    await internship.save();
    res.json(withApplicationLink(internship));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update internship
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }

    const payload = normalizeApplicationLinkPayload({ ...(req.body || {}) });
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    const internship = await Internship.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
    res.json(withApplicationLink(internship));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete internship
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Internship not found' });
    res.json({ success: true, message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
