const express = require('express');
const User = require('../src/models/User.cjs');
const Admin = require('../src/models/Admin');
const router = express.Router();

// Get all admin users
router.get('/', async (req, res) => {
  const admins = await Admin.find().populate('user');
  res.json(admins);
});

// Assign role
router.post('/assign-role', async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findById(userId);
  if (!user.role.includes(role)) user.role.push(role);
  await user.save();
  res.json(user);
});

// Remove role
router.post('/remove-role', async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findById(userId);
  user.role = user.role.filter(r => r !== role);
  await user.save();
  res.json(user);
});

module.exports = router;
