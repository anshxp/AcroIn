import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import AuditLog from '../models/AuditLog.js';
import { syncStudentProfileByEmail } from '../utils/profileSync.js';
import { syncFacultyProfile } from '../utils/profileSync.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

const FACULTY_ADMIN_ROLES = new Set(['faculty', 'dept_admin', 'super_admin']);
const SYSTEM_ADMIN_ROLES = new Set(['admin', 'super_admin']);
const ASSIGNABLE_FACULTY_ROLES = new Set(['faculty', 'dept_admin']);
const REGISTER_ONLY_ROLES = new Set(['admin', 'super_admin']);

const normalizeRoles = (role) => {
  const roleList = Array.isArray(role) ? role : [role];
  return Array.from(new Set(roleList.map((item) => String(item || '').trim()).filter(Boolean)));
};

const normalizeFacultyRoles = (role) => {
  const roleList = normalizeRoles(role);
  return roleList.filter((item) => FACULTY_ADMIN_ROLES.has(item));
};

const getRequesterUser = async (req) => {
  if (!req.user?.id) return null;
  return User.findById(req.user.id).select('email role userType');
};

const getRequesterAccess = async (req) => {
  const user = await getRequesterUser(req);
  const roles = normalizeRoles(user?.role);
  const isSuperAdmin = roles.includes('super_admin');
  const isSystemAdmin = user?.userType === 'admin' || roles.some((role) => SYSTEM_ADMIN_ROLES.has(role));
  const isDepartmentAdmin = roles.includes('dept_admin');

  return {
    user,
    roles,
    isSuperAdmin,
    isSystemAdmin,
    isDepartmentAdmin,
    canCreateFaculty: isSystemAdmin || isDepartmentAdmin,
  };
};


// ✅ Get all admin users
router.get('/', async (req, res) => {
  try {
    const requester = await getRequesterAccess(req);
    if (!requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    const admins = await Admin.find().populate('user');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Create admin
router.post('/create', async (req, res) => {
  return res.status(403).json({
    message: 'Admin accounts can only be created through the registration flow.',
  });
});


// ✅ Create faculty or faculty admin
router.post('/faculty/create', async (req, res) => {
  try {
    const requester = await getRequesterAccess(req);
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

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedFirstname = String(firstname || '').trim();
    const normalizedLastName = String(lastName || '').trim();
    const normalizedDepartment = String(department || '').trim();
    const normalizedRoles = normalizeFacultyRoles(role || 'faculty');

    if (!normalizedFirstname || !normalizedLastName || !normalizedEmail || !String(password || '').trim()) {
      return res.status(400).json({ message: 'firstname, lastName, email, and password are required' });
    }

    if (!normalizedRoles.length) {
      return res.status(400).json({ message: 'A valid faculty role is required' });
    }

    if (normalizedRoles.includes('super_admin')) {
      return res.status(403).json({ message: 'super_admin role is registration-only and cannot be assigned here' });
    }

    const isCreatingLeadershipRole = normalizedRoles.includes('dept_admin');
    if (isCreatingLeadershipRole && !requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin access required to create departmental admins' });
    }

    if (!isCreatingLeadershipRole && !requester.canCreateFaculty) {
      return res.status(403).json({ message: 'Department admin or super admin access required to create faculty' });
    }

    if (normalizedRoles.some((item) => item === 'admin')) {
      return res.status(400).json({ message: 'Use the admin creation flow for admin accounts' });
    }

    const existingFaculty = await Faculty.findOne({ email: normalizedEmail });
    if (existingFaculty) {
      return res.status(409).json({ message: 'A faculty account with this email already exists.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
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
      role: normalizedRoles,
    });

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: `${normalizedFirstname} ${normalizedLastName}`.trim(),
      userType: 'faculty',
      role: normalizedRoles,
      department: normalizedDepartment,
      designation: String(designation || '').trim(),
    });

    await syncFacultyProfile({ user, faculty });

    const { password: _, ...facultyWithoutPassword } = faculty._doc;
    const { password: __, ...userWithoutPassword } = user._doc;

    res.status(201).json({
      success: true,
      message: 'Faculty account created',
      user: userWithoutPassword,
      faculty: facultyWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Assign role
router.post('/assign-role', async (req, res) => {
  try {
    const requester = await getRequesterAccess(req);
    if (!requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedRole = String(role || '').trim();
    if (!normalizedRole) {
      return res.status(400).json({ message: 'Role is required' });
    }

    if (REGISTER_ONLY_ROLES.has(normalizedRole)) {
      return res.status(403).json({ message: `${normalizedRole} role can only be set during registration` });
    }

    if (!ASSIGNABLE_FACULTY_ROLES.has(normalizedRole)) {
      return res.status(400).json({ message: 'Unsupported role' });
    }

    if (!user.role) user.role = [];
    if (!user.role.includes(normalizedRole)) user.role.push(normalizedRole);

    if (FACULTY_ADMIN_ROLES.has(normalizedRole)) {
      user.userType = 'faculty';
    }

    await user.save();

    if (FACULTY_ADMIN_ROLES.has(normalizedRole)) {
      const faculty = await Faculty.findOne({ email: user.email });
      if (faculty) {
        faculty.role = Array.from(new Set([...(faculty.role || []), normalizedRole]));
        await faculty.save();
        await syncFacultyProfile({ user, faculty });
      }
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Remove role
router.post('/remove-role', async (req, res) => {
  try {
    const requester = await getRequesterAccess(req);
    if (!requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    const { userId, role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (REGISTER_ONLY_ROLES.has(String(role || '').trim())) {
      return res.status(403).json({ message: `${role} role cannot be removed from this endpoint` });
    }

    user.role = (user.role || []).filter(r => r !== role);

    await user.save();

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Admin verification override
router.post('/students/:id/verification', async (req, res) => {
  try {
    const requester = await getRequesterAccess(req);
    if (!requester.isSuperAdmin) {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    const { status } = req.body || {};
    if (!['not_verified', 'verified', 'strongly_verified'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.verificationStatus = status;
    student.verifiedAt = status === 'not_verified' ? null : new Date();
    student.verifiedBy = null;

    await student.save();
    await syncStudentProfileByEmail(student.email);

    res.json({
      success: true,
      message: 'Student verification status updated',
      verificationStatus: student.verificationStatus,
      verifiedAt: student.verifiedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Recent audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const requester = await getRequesterAccess(req);
    if (!requester.isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Super admin access required' });
    }

    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const actorRole = String(req.query.actorRole || '').trim();
    const successParam = String(req.query.success || '').trim().toLowerCase();

    const filters = {};
    if (['student', 'faculty', 'dept_admin', 'admin', 'super_admin', 'system'].includes(actorRole)) {
      filters.actorRole = actorRole;
    }
    if (successParam === 'true' || successParam === 'false') {
      filters.success = successParam === 'true';
    }

    const logs = await AuditLog.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actorId', 'email userType name');

    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;