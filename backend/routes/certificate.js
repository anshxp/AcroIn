import express from 'express';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';
const router = express.Router();

// Create certificate - students add their own, admin/faculty add for others
router.post('/', verifyToken, async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    const isAdminOrFacultyUser = req.user?.userType === 'admin' || req.user?.userType === 'faculty';
    
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }
    
    // Track who created this
    payload.createdBy = req.user?.id;
    payload.createdByRole = req.user?.userType;
    
    // If admin/faculty creates for someone, mark as admin-assigned
    if (isAdminOrFacultyUser && payload.createdByRole) {
      payload.adminAssigned = true;
    }

    const certificate = new Certificate(payload);
    await certificate.save();
    res.status(201).json(certificate);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get certificates by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) return res.json([]);

    const certificates = await Certificate.find({ student: studentId });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get certificate by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update certificate
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }

    const payload = { ...(req.body || {}) };
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    const certificate = await Certificate.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json(certificate);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete certificate
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }
    const deleted = await Certificate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
