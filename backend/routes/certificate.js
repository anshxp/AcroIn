import express from 'express';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { createAnnouncementNotifications } from '../utils/announcementNotifications.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();

const resolveRequesterStudentId = async (req) => {
  if (req.user?.userType !== 'student' || !req.user?.id) {
    return null;
  }

  const userRecord = await User.findById(req.user.id).select('email');
  if (!userRecord?.email) {
    return null;
  }

  const student = await Student.findOne({ email: userRecord.email }).select('_id');
  return student?._id || null;
};

const canMutateCertificate = async (req, certificate) => {
  if (!certificate) return false;
  if (req.user?.userType === 'admin') return true;
  if (certificate.createdBy?.toString() === req.user?.id) return true;

  if (req.user?.userType === 'student') {
    const requesterStudentId = await resolveRequesterStudentId(req);
    return requesterStudentId && certificate.student?.toString() === requesterStudentId.toString();
  }

  return false;
};

// Create certificate - students add their own, admin/faculty add for others
router.post('/', verifyToken, async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    const isAdminOrFacultyUser = req.user?.userType === 'admin' || req.user?.userType === 'faculty';

    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId) {
        return res.status(403).json({ success: false, message: 'Student profile not found for authenticated user' });
      }

      if (payload.student && payload.student.toString() !== requesterStudentId.toString()) {
        return res.status(403).json({ success: false, message: 'Students can only create certificates for themselves' });
      }

      payload.student = requesterStudentId;
    }

    payload.createdBy = req.user?.id;
    payload.createdByRole = req.user?.userType;

    if (isAdminOrFacultyUser && payload.createdByRole) {
      payload.adminAssigned = true;
    }

    const certificate = new Certificate(payload);
    await certificate.save();

    // Add certificate ID to student's certificates array
    if (certificate.student) {
      await Student.findByIdAndUpdate(
        certificate.student,
        { $addToSet: { certificates: certificate._id } },
        { new: true }
      );
    }

    const notificationTitle = certificate.title || 'Certificate';

    if (payload.student) {
      const studentRecord = await Student.findById(payload.student).select('email');
      if (studentRecord?.email) {
        const recipientUser = await User.findOne({ email: studentRecord.email }).select('_id');
        if (recipientUser?._id) {
          await createAnnouncementNotifications({
            req,
            payload,
            announcementType: 'certificate',
            sourceId: certificate._id,
            title: notificationTitle,
            recipientUserIds: [recipientUser._id],
          });
        }
      }
    } else {
      await createAnnouncementNotifications({
        req,
        payload,
        announcementType: 'certificate',
        sourceId: certificate._id,
        title: notificationTitle,
      });
    }

    res.status(201).json(certificate);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all certificates
router.get('/', verifyToken, isAdminOrFaculty, async (_req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get certificates by student
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) return res.json([]);

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId || requesterStudentId.toString() !== studentId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to access these certificates' });
      }
    }

    const certificates = await Certificate.find({ student: studentId });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get certificate by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId || certificate.student?.toString() !== requesterStudentId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to access this certificate' });
      }
    }

    res.json(certificate);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update certificate
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });

    const allowed = await canMutateCertificate(req, certificate);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this certificate' });
    }

    const payload = { ...(req.body || {}) };
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    Object.assign(certificate, payload);
    await certificate.save();

    res.json(certificate);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete certificate
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });

    const allowed = await canMutateCertificate(req, certificate);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this certificate' });
    }

    await Certificate.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
