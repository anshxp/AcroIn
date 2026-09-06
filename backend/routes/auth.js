import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Profile from '../models/Profile.js';
import { syncStudentProfile } from '../utils/profileSync.js';
import { authRateLimiter } from '../middleware/security.js';

dotenv.config();

const router = express.Router();
router.use(authRateLimiter);

const isCollegeEmail = (email) => /^[a-z0-9._%+-]+@acropolis\.in$/i.test(String(email || '').trim());
const isStrongPassword = (password) => typeof password === 'string' && password.length >= 8 && password.length <= 128;

const loginUser = async (req, res, expectedUserType = null) => {
  try {
    const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!normalizedEmail || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (expectedUserType && user.userType !== expectedUserType) return res.status(403).json({ success: false, message: `Please log in as ${expectedUserType}` });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    const { password: _, ...userWithoutPassword } = user.toObject();

    if (user.userType === 'student') {
      const student = await Student.findOne({ email: normalizedEmail });
      if (student) {
        const { password: __, ...studentWithoutPassword } = student.toObject();
        return res.status(200).json({ success: true, token, user: { ...studentWithoutPassword, authUserId: user._id.toString(), userType: user.userType, role: user.role || [] } });
      }
    }
    return res.status(200).json({ success: true, token, user: { ...userWithoutPassword, authUserId: user._id.toString() } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const registerBootstrapAdmin = async (req, res) => {
  try {
    if (String(process.env.ADMIN_BOOTSTRAP_ENABLED || '').toLowerCase() !== 'true') return res.status(404).json({ success: false, message: 'Bootstrap disabled' });
    const bootstrapKey = String(req.headers['x-bootstrap-key'] || '').trim();
    const expectedKey = String(process.env.ADMIN_BOOTSTRAP_KEY || '').trim();
    if (!expectedKey || bootstrapKey !== expectedKey) return res.status(403).json({ success: false, message: 'Invalid bootstrap key' });

    const { name, email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedPassword = String(password || '');
    if (!normalizedName || !normalizedEmail || !normalizedPassword) return res.status(400).json({ success: false, message: 'name, email, and password are required' });
    if (!isCollegeEmail(normalizedEmail)) return res.status(400).json({ success: false, message: 'Please use a valid college email address' });
    if (!isStrongPassword(normalizedPassword)) return res.status(400).json({ success: false, message: 'Password must be 8-128 characters long' });

    const maxAdmins = Math.max(1, Number(process.env.ADMIN_MAX_COUNT || 2));
    if (await User.countDocuments({ userType: 'admin' }) >= maxAdmins) return res.status(409).json({ success: false, message: `Admin limit reached (${maxAdmins})` });
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);
    const user = await User.create({ email: normalizedEmail, password: hashedPassword, name: normalizedName, userType: 'admin', role: ['super_admin'] });
    await Admin.create({ user: user._id, permissions: ['all'] });
    await Profile.findOneAndUpdate({ user: user._id }, { $set: { userType: 'admin', displayName: normalizedName, email: normalizedEmail, department: 'Administration', designation: 'System Administrator', skills: [], tags: ['admin'], profileCompleteness: 100, verificationStatus: 'verified', isActive: true } }, { new: true, upsert: true, setDefaultsOnInsert: true });

    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(201).json({ success: true, message: 'Admin account created', token, user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Admin bootstrap failed' });
  }
};

const registerStudent = async (req, res) => {
  try {
    const { name, roll, email, password, department } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!name || !roll || !department || !isCollegeEmail(normalizedEmail)) return res.status(400).json({ success: false, message: 'Valid name, roll, department, and college email are required' });
    if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: 'Password must be 8-128 characters long' });

    const existingStudent = await Student.findOne({ $or: [{ roll }, { email: normalizedEmail }] });
    if (existingStudent) return res.status(409).json({ success: false, message: existingStudent.roll === roll ? 'A student with this roll number already exists.' : 'A student with this email already exists.' });
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'A user with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const student = await Student.create({ name: String(name).trim(), roll: String(roll).trim(), email: normalizedEmail, password: hashedPassword, department: String(department).trim() });
    const user = await User.create({ email: normalizedEmail, password: hashedPassword, name: String(name).trim(), userType: 'student' });
    await syncStudentProfile({ user, student });
    const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    const { password: _, ...studentWithoutPassword } = student.toObject();
    return res.status(201).json({ success: true, message: 'Student registered', token, user: { ...studentWithoutPassword, authUserId: user._id.toString(), userType: 'student' } });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Registration failed' });
  }
};

router.post('/register/student', registerStudent);
router.post('/student/register', registerStudent);
router.post('/login', (req, res) => loginUser(req, res));
router.post('/student/login', (req, res) => loginUser(req, res, 'student'));
router.post('/internal/admin-bootstrap', registerBootstrapAdmin);

export default router;
