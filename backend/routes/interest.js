import express from 'express';
import mongoose from 'mongoose';
import Interest from '../models/Interest.js';
import Opportunity from '../models/Opportunity.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';

const router = express.Router();

const getStudentIdFromRequest = async (req) => {
  if (!req.user?.id) return null;
  const user = await User.findById(req.user.id).select('email');
  if (!user?.email) return null;
  const student = await Student.findOne({ email: user.email }).select('_id');
  return student?._id || null;
};

// Mark interest on opportunity (student only)
router.post('/:opportunityId/mark', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.opportunityId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }

    if (req.user?.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can mark interest' });
    }

    const studentId = await getStudentIdFromRequest(req);
    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found' });
    }

    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Check if student already interested
    const existingInterest = await Interest.findOne({
      student: studentId,
      opportunity: req.params.opportunityId
    });

    if (existingInterest) {
      return res.status(400).json({ success: false, message: 'You have already marked interest in this opportunity' });
    }

    // Create new interest record
    const interest = await Interest.create({
      student: studentId,
      opportunity: req.params.opportunityId
    });

    await interest.populate('student opportunity');

    res.status(201).json({
      success: true,
      message: 'Interest marked successfully',
      interest
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Unmark interest on opportunity (student only)
router.delete('/:opportunityId/unmark', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.opportunityId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }

    if (req.user?.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can unmark interest' });
    }

    const studentId = await getStudentIdFromRequest(req);
    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found' });
    }

    const result = await Interest.deleteOne({
      student: studentId,
      opportunity: req.params.opportunityId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Interest record not found' });
    }

    res.json({ success: true, message: 'Interest unmarked successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get interested students for opportunity (faculty only)
router.get('/:opportunityId/interested', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.opportunityId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }

    // Only the faculty who posted the opportunity or an admin can view interested students
    if (req.user?.userType !== 'faculty' && req.user?.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Faculty or admin access required' });
    }

    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // If requester is faculty, ensure they created this opportunity
    if (req.user?.userType === 'faculty') {
      if (!req.user?.id || opportunity.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Only the faculty who posted this opportunity can view interested students' });
      }
    }

    // Get all interests for this opportunity, sorted by createdAt (ascending = earliest first)
    const interests = await Interest.find({ opportunity: req.params.opportunityId })
      .populate({ path: 'student', select: 'name roll email department year semester cgpa skills parentInfo' })
      .sort({ createdAt: 1 });

    res.json({ success: true, count: interests.length, interests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check if student has marked interest
router.get('/:opportunityId/has-interest', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.opportunityId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }

    if (req.user?.userType !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can check interest' });
    }

    const studentId = await getStudentIdFromRequest(req);
    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found' });
    }

    const hasInterest = await Interest.exists({
      student: studentId,
      opportunity: req.params.opportunityId
    });

    res.json({ hasInterest: !!hasInterest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
