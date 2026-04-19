import express from 'express';
import mongoose from 'mongoose';
import Internship from '../models/Internship.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { createAnnouncementNotifications } from '../utils/announcementNotifications.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';

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

const canMutateInternship = async (req, internship) => {
  if (!internship) return false;
  if (req.user?.userType === 'admin') return true;
  if (internship.createdBy?.toString() === req.user?.id) return true;

  if (req.user?.userType === 'student') {
    const requesterStudentId = await resolveRequesterStudentId(req);
    return requesterStudentId && internship.student?.toString() === requesterStudentId.toString();
  }

  return false;
};

// Get all internships
router.get('/', verifyToken, isAdminOrFaculty, async (_req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships.map(withApplicationLink));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get internships by student
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) return res.json([]);

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId || requesterStudentId.toString() !== studentId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to access these internships' });
      }
    }

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

    if (isAdminOrFacultyUser && !payload.application_link) {
      return res.status(400).json({
        success: false,
        message: 'Internship link is required for admin/faculty submissions',
      });
    }

    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId) {
        return res.status(403).json({ success: false, message: 'Student profile not found for authenticated user' });
      }

      if (payload.student && payload.student.toString() !== requesterStudentId.toString()) {
        return res.status(403).json({ success: false, message: 'Students can only create internships for themselves' });
      }

      payload.student = requesterStudentId;
    }

    payload.createdBy = req.user?.id;
    payload.createdByRole = req.user?.userType;

    const internship = new Internship(payload);
    await internship.save();

    // Add internship ID to student's internships array
    if (internship.student) {
      await Student.findByIdAndUpdate(
        internship.student,
        { $addToSet: { internships: internship._id } },
        { new: true }
      );
    }

    await createAnnouncementNotifications({
      req,
      payload,
      announcementType: 'internship',
      sourceId: internship._id,
      title: `${internship.position} at ${internship.company}`,
    });

    res.status(201).json(withApplicationLink(internship));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Apply to internship
router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }

    if (req.user?.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can apply' });
    }

    const requesterStudentId = await resolveRequesterStudentId(req);
    if (!requesterStudentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found for authenticated user' });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    if (!internship.students) internship.students = [];
    if (!internship.students.some((id) => id.toString() === requesterStudentId.toString())) {
      internship.students.push(requesterStudentId);
    }

    await internship.save();
    res.json(withApplicationLink(internship));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update internship
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    const allowed = await canMutateInternship(req, internship);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this internship' });
    }

    const payload = normalizeApplicationLinkPayload({ ...(req.body || {}) });
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    Object.assign(internship, payload);
    await internship.save();

    res.json(withApplicationLink(internship));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete internship
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    const allowed = await canMutateInternship(req, internship);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this internship' });
    }

    await Internship.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
