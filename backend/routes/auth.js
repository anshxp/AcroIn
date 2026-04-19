import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Admin from '../models/Admin.js';
import Profile from '../models/Profile.js';
import { syncFacultyProfile, syncStudentProfile } from '../utils/profileSync.js';

dotenv.config();

const router = express.Router();

const isCollegeEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  return /^[a-z0-9._%+-]+@acropolis\.in$/i.test(normalized);
};

const registerBootstrapAdmin = async (req, res) => {
  try {
    if (String(process.env.ADMIN_BOOTSTRAP_ENABLED || '').toLowerCase() !== 'true') {
      return res.status(404).json({ success: false, message: 'Bootstrap disabled' });
    }

    const bootstrapKey = String(req.headers['x-bootstrap-key'] || '').trim();
    const expectedKey = String(process.env.ADMIN_BOOTSTRAP_KEY || '').trim();
    if (!expectedKey || bootstrapKey !== expectedKey) {
      return res.status(403).json({ success: false, message: 'Invalid bootstrap key' });
    }

    const { name, email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedPassword = String(password || '');

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and password are required',
      });
    }

    if (!isCollegeEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid college email address',
      });
    }

    if (normalizedPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const maxAdmins = Math.max(1, Number(process.env.ADMIN_MAX_COUNT || 2));
    const adminCount = await User.countDocuments({ userType: 'admin' });
    if (adminCount >= maxAdmins) {
      return res.status(409).json({
        success: false,
        message: `Admin limit reached (${maxAdmins})`,
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: normalizedName,
      userType: 'admin',
      role: ['super_admin'],
    });

    await Admin.create({
      user: user._id,
      permissions: ['all'],
    });

    await Profile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          userType: 'admin',
          displayName: normalizedName,
          email: normalizedEmail,
          department: 'Administration',
          designation: 'System Administrator',
          location: '',
          skills: [],
          tags: ['admin'],
          profileCompleteness: 100,
          verificationStatus: 'verified',
          isActive: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user._doc;

    return res.status(201).json({
      success: true,
      message: 'Admin account created',
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const registerStudent = async (req, res) => {
  try {
    const { name, roll, email, password, department } = req.body;

    if (!isCollegeEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid college email address',
      });
    }

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
    await syncStudentProfile({ user, student });

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

    if (!isCollegeEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please use a valid college email address',
      });
    }

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
    await syncFacultyProfile({ user, faculty });

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

const loginUser = async (req, res, expectedUserType) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (expectedUserType && user.userType !== expectedUserType) {
      return res.status(403).json({ success: false, message: `Please use ${user.userType} login endpoint` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user._doc;
    res.json({ success: true, token, user: userWithoutPassword });
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
router.post('/login', (req, res) => loginUser(req, res));
router.post('/student/login', (req, res) => loginUser(req, res, 'student'));
router.post('/faculty/login', (req, res) => loginUser(req, res, 'faculty'));
router.post('/internal/admin-bootstrap', registerBootstrapAdmin);

export default router;
