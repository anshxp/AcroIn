import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
const router = express.Router();

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const notifications = await Notification.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Send notification
router.post('/', async (req, res) => {
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
router.patch('/:id/read', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update notification
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
