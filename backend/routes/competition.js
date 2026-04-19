import express from 'express';
import mongoose from 'mongoose';
import Competition from '../models/Competition.js';
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

const canMutateCompetition = async (req, competition) => {
  if (!competition) return false;
  if (req.user?.userType === 'admin') return true;
  if (competition.createdBy?.toString() === req.user?.id) return true;

  if (req.user?.userType === 'student') {
    const requesterStudentId = await resolveRequesterStudentId(req);
    return requesterStudentId && competition.student?.toString() === requesterStudentId.toString();
  }

  return false;
};

// Get all competitions
router.get('/', verifyToken, isAdminOrFaculty, async (_req, res) => {
  try {
    const competitions = await Competition.find();
    res.json(competitions.map(withApplicationLink));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get competitions by student
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) return res.json([]);

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId || requesterStudentId.toString() !== studentId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to access these competitions' });
      }
    }

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

    if (isAdminOrFacultyUser && !payload.application_link) {
      return res.status(400).json({
        success: false,
        message: 'Competition link is required for admin/faculty submissions',
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
        return res.status(403).json({ success: false, message: 'Students can only create competitions for themselves' });
      }

      payload.student = requesterStudentId;
    }

    payload.createdBy = req.user?.id;
    payload.createdByRole = req.user?.userType;

    const competition = new Competition(payload);
    await competition.save();

    // Add competition ID to student's competitions array
    if (competition.student) {
      await Student.findByIdAndUpdate(
        competition.student,
        { $addToSet: { competitions: competition._id } },
        { new: true }
      );
    }

    await createAnnouncementNotifications({
      req,
      payload,
      announcementType: 'competition',
      sourceId: competition._id,
      title: competition.name,
    });

    res.status(201).json(withApplicationLink(competition));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Apply to competition
router.post('/:id/apply', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }

    if (req.user?.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can apply' });
    }

    const requesterStudentId = await resolveRequesterStudentId(req);
    if (!requesterStudentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found for authenticated user' });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });

    if (!competition.students) competition.students = [];
    if (!competition.students.some((id) => id.toString() === requesterStudentId.toString())) {
      competition.students.push(requesterStudentId);
    }

    await competition.save();
    res.json(withApplicationLink(competition));
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update competition
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    const allowed = await canMutateCompetition(req, competition);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this competition' });
    }

    const payload = normalizeApplicationLinkPayload({ ...(req.body || {}) });
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    Object.assign(competition, payload);
    await competition.save();

    res.json(withApplicationLink(competition));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete competition
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }

    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });

    const allowed = await canMutateCompetition(req, competition);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this competition' });
    }

    await Competition.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Competition deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
