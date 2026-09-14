import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { syncStudentProfileByEmail, syncFacultyProfile } from '../utils/profileSync.js';

const router = express.Router();
router.use(verifyToken);

const normalize = (value) => String(value || '').trim().toLowerCase();

const getRequester = async (req) => {
  if (!req.user?.id) return null;
  return User.findById(req.user.id).select('email name role userType department designation');
};

const getDepartmentAdmin = async (user) => {
  if (!user?.email) return null;
  return Faculty.findOne({ email: normalize(user.email), role: 'dept_admin' });
};

// Admin -> create exactly one departmental admin per department.
// Departmental admins cannot create another departmental admin.
router.post('/faculty/create', async (req, res) => {
  try {
    const requester = await getRequester(req);
    const isAdmin = requester?.userType === 'admin';
    const requesterFaculty = await getDepartmentAdmin(requester);
    const isDepartmentAdmin = Boolean(requesterFaculty);

    if (!isAdmin && !isDepartmentAdmin) {
      return res.status(403).json({ success: false, message: 'Admin or departmental admin access required' });
    }

    const {
      firstname,
      lastName,
      email,
      password,
      department,
      designation,
      qualification,
      experience,
      phone,
      role,
      subjects,
      skills,
      techstacks,
      headof,
    } = req.body || {};

    const normalizedEmail = normalize(email);
    const normalizedFirstname = String(firstname || '').trim();
    const normalizedLastName = String(lastName || '').trim();
    const normalizedDepartment = String(department || '').trim();
    const requestedRole = normalize(role || 'faculty');

    if (!normalizedFirstname || !normalizedLastName || !normalizedEmail || !String(password || '').trim() || !normalizedDepartment) {
      return res.status(400).json({ success: false, message: 'firstname, lastName, email, password, and department are required' });
    }

    if (!['faculty', 'dept_admin'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'Only faculty or dept_admin can be created here' });
    }

    if (isDepartmentAdmin) {
      if (requestedRole !== 'faculty') {
        return res.status(403).json({ success: false, message: 'Departmental admins cannot create another departmental admin' });
      }
      if (normalize(requesterFaculty.department) !== normalize(normalizedDepartment)) {
        return res.status(403).json({ success: false, message: 'Departmental admins can create faculty only in their own department' });
      }
    }

    if (isAdmin && requestedRole !== 'dept_admin') {
      return res.status(403).json({ success: false, message: 'Admins create departmental admins; departmental admins create faculty' });
    }

    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }
    if (await Faculty.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'A faculty account with this email already exists.' });
    }

    if (requestedRole === 'dept_admin') {
      const existingDepartmentAdmin = await Faculty.findOne({ department: normalizedDepartment, role: 'dept_admin' }).select('_id email firstname lastName');
      if (existingDepartmentAdmin) {
        return res.status(409).json({
          success: false,
          message: `Department ${normalizedDepartment} already has a departmental admin. Only one is allowed per department.`,
          existingDepartmentAdmin,
        });
      }
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const faculty = await Faculty.create({
      firstname: normalizedFirstname,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      department: normalizedDepartment,
      designation: String(designation || '').trim(),
      qualification: String(qualification || '').trim(),
      experience: Number.isFinite(Number(experience)) ? Number(experience) : undefined,
      phone: String(phone || '').trim(),
      subjects: Array.isArray(subjects) ? subjects : [],
      skills: Array.isArray(skills) ? skills : [],
      techstacks: Array.isArray(techstacks) ? techstacks : [],
      headof: Array.isArray(headof) ? headof : [],
      role: [requestedRole],
    });

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: `${normalizedFirstname} ${normalizedLastName}`.trim(),
      userType: 'faculty',
      role: [requestedRole],
      department: normalizedDepartment,
      designation: String(designation || '').trim(),
    });

    await syncFacultyProfile({ user, faculty });

    const { password: _facultyPassword, ...facultyWithoutPassword } = faculty.toObject();
    const { password: _userPassword, ...userWithoutPassword } = user.toObject();

    return res.status(201).json({
      success: true,
      message: requestedRole === 'dept_admin' ? 'Departmental admin created' : 'Faculty account created',
      user: userWithoutPassword,
      faculty: facultyWithoutPassword,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Departmental admin -> verify students only in their own department.
router.post('/students/:id/verification', async (req, res) => {
  try {
    const requester = await getRequester(req);
    const faculty = await getDepartmentAdmin(requester);

    if (!faculty) {
      return res.status(403).json({ success: false, message: 'Departmental admin access required' });
    }

    const { status } = req.body || {};
    if (!['not_verified', 'verified', 'strongly_verified'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (normalize(student.department) !== normalize(faculty.department)) {
      return res.status(403).json({ success: false, message: 'You can verify students only from your department' });
    }

    student.verificationStatus = status;
    student.verifiedAt = status === 'not_verified' ? null : new Date();
    student.verifiedBy = status === 'not_verified' ? null : faculty._id;

    await student.save();
    await syncStudentProfileByEmail(student.email);

    return res.json({
      success: true,
      message: 'Student verification status updated',
      verificationStatus: student.verificationStatus,
      verifiedBy: student.verifiedBy,
      verifiedAt: student.verifiedAt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
