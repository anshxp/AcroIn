import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const router = express.Router();


// ✅ Get all admin users
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find().populate('user');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Create admin
router.post('/create', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const admin = new Admin({ user: userId });
    await admin.save();

    res.status(201).json(admin);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Assign role
router.post('/assign-role', async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.role) user.role = [];
    if (!user.role.includes(role)) user.role.push(role);

    await user.save();

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Remove role
router.post('/remove-role', async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = (user.role || []).filter(r => r !== role);

    await user.save();

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;