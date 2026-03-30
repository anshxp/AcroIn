import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

const router = express.Router();

// Register Student
router.post('/register/student', async (req, res) => {
  try {
    const { name, roll, email, password, department } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, roll, email, password: hashedPassword, department });
    await student.save();
    const user = new User({ email, password: hashedPassword, name, userType: 'student' });
    await user.save();
    res.status(201).json({ success: true, message: 'Student registered' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Register Faculty
router.post('/register/faculty', async (req, res) => {
  try {
    const { firstname, lastName, email, password, department, designation, qualification, experience, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({ firstname, lastName, email, password: hashedPassword, department, designation, qualification, experience, phone });
    await faculty.save();
    const user = new User({ email, password: hashedPassword, name: firstname + ' ' + lastName, userType: 'faculty' });
    await user.save();
    res.status(201).json({ success: true, message: 'Faculty registered' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
