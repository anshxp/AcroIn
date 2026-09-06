import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import User from '../models/User.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();

const resolveUserId = async (identifier) => {
  const normalized = String(identifier || '').trim();
  if (!normalized) return null;

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    const directUser = await User.findById(normalized).select('_id');
    if (directUser) return directUser._id;

    const student = await Student.findById(normalized).select('email');
    if (student?.email) {
      const user = await User.findOne({ email: student.email }).select('_id');
      if (user) return user._id;
    }

    const faculty = await Faculty.findById(normalized).select('email');
    if (faculty?.email) {
      const user = await User.findOne({ email: faculty.email }).select('_id');
      if (user) return user._id;
    }
  }

  const byEmail = await User.findOne({ email: normalized.toLowerCase() }).select('_id');
  return byEmail?._id || null;
};

const canAccessNotification = (req, notification) => {
  if (!notification) return false;
  if (req.user?.userType === 'admin') return true;
  return notification.user?.toString() === req.user?.id;
};

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const requestedUserId = await resolveUserId(req.params.userId);
    const authenticatedUserId = await resolveUserId(req.user?.id);

    if (!requestedUserId || !authenticatedUserId) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    if (req.user?.userType !== 'admin' && requestedUserId.toString() !== authenticatedUserId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access these notifications' });
    }

    const notifications = await Notification.find({ user: requestedUserId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', verifyToken, isAdminOrFaculty, async (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    payload.user = await resolveUserId(payload.user);
    if (!payload.user) return res.status(400).json({ success: false, message: 'Valid recipient user is required' });

    const notification = new Notification(payload);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (!canAccessNotification(req, notification)) return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid notification id' });
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (!canAccessNotification(req, notification)) return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
    Object.assign(notification, req.body);
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid notification id' });
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (!canAccessNotification(req, notification)) return res.status(403).json({ success: false, message: 'Not authorized to delete this notification' });
    await Notification.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
