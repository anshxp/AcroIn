import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

const router = express.Router();

const registerStudent = async (req, res) => {
  try {
    const { name, roll, email, password, department } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ roll }, { email }] });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: existingStudent.roll === roll
          ? 'A student with this roll number already exists.'
          : 'A student with this email already exists.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, roll, email, password: hashedPassword, department });
    await student.save();
    const user = new User({ email, password: hashedPassword, name, userType: 'student' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...studentWithoutPassword } = student._doc;
    res.status(201).json({
      success: true,
      message: 'Student registered',
      token,
      user: studentWithoutPassword,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const registerFaculty = async (req, res) => {
  try {
    const { firstname, lastName, email, password, department, designation, qualification, experience, phone } = req.body;

    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: 'A faculty account with this email already exists.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({ firstname, lastName, email, password: hashedPassword, department, designation, qualification, experience, phone });
    await faculty.save();
    const user = new User({ email, password: hashedPassword, name: firstname + ' ' + lastName, userType: 'faculty' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...facultyWithoutPassword } = faculty._doc;
    res.status(201).json({
      success: true,
      message: 'Faculty registered',
      token,
      user: facultyWithoutPassword,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user._doc;
    res.json({success: true,token,user: userWithoutPassword});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Register Student
router.post('/register/student', registerStudent);
router.post('/student/register', registerStudent);

// Register Faculty
router.post('/register/faculty', registerFaculty);
router.post('/faculty/register', registerFaculty);

// Login
router.post('/login', loginUser);
router.post('/student/login', loginUser);
router.post('/faculty/login', loginUser);

export default router;
