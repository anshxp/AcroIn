// Update notification
router.put('/:id', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(notification);
});

// Delete notification
router.delete('/:id', async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ message: 'Notification deleted' });
});
import express from 'express';
import Notification from '../models/Notification.js';
const router = express.Router();

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  const notifications = await Notification.find({ user: req.params.userId }).sort({ createdAt: -1 });
  res.json(notifications);
});

// Send notification
router.post('/', async (req, res) => {
  const { user, message, type } = req.body;
  const notification = new Notification({ user, message, type });
  await notification.save();
  res.status(201).json(notification);
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(notification);
});

export default router;
