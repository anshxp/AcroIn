import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();

const canAccessNotification = (req, notification) => {
  if (!notification) return false;
  if (req.user?.userType === 'admin') return true;
  return notification.user?.toString() === req.user?.id;
};

// Get notifications for a user
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const isAdminUser = req.user?.userType === 'admin';
    const isSelf = req.user?.id === req.params.userId;
    if (!isAdminUser && !isSelf) {
      return res.status(403).json({ success: false, message: 'Not authorized to access these notifications' });
    }

    const notifications = await Notification.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send notification
router.post('/', verifyToken, isAdminOrFaculty, async (req, res) => {
  try {
    const { user, message, type } = req.body;
    const notification = new Notification({ user, message, type });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    if (!canAccessNotification(req, notification)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update notification
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    if (!canAccessNotification(req, notification)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this notification' });
    }

    Object.assign(notification, req.body);
    await notification.save();

    res.json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    if (!canAccessNotification(req, notification)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notification' });
    }

    await Notification.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
