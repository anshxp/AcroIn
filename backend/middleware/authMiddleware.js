import jwt from 'jsonwebtoken';

const JWT_ALGORITHMS = ['HS256'];

export const verifyToken = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const verifyOptions = { algorithms: JWT_ALGORITHMS };
    const issuer = process.env.JWT_ISSUER?.trim();
    const audience = process.env.JWT_AUDIENCE?.trim();
    if (issuer) verifyOptions.issuer = issuer;
    if (audience) verifyOptions.audience = audience;

    const decoded = jwt.verify(token, process.env.JWT_SECRET, verifyOptions);
    if (!decoded?.id || !['student', 'faculty', 'admin'].includes(decoded?.userType)) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.userType !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

export const isFaculty = (req, res, next) => {
  if (req.user?.userType !== 'faculty') return res.status(403).json({ success: false, message: 'Faculty access required' });
  next();
};

export const isAdminOrFaculty = (req, res, next) => {
  if (req.user?.userType !== 'admin' && req.user?.userType !== 'faculty') return res.status(403).json({ success: false, message: 'Admin or Faculty access required' });
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user?.userType !== 'student') return res.status(403).json({ success: false, message: 'Student access required' });
  next();
};

export const extractUserInfo = (req, res, next) => {
  if (!req.user) req.user = {};
  next();
};

export const isDepartmentAdmin = async (req, res, next) => {
  try {
    if (req.user?.userType !== 'faculty') return res.status(403).json({ success: false, message: 'Faculty access required' });
    const Faculty = (await import('../models/Faculty.js')).default;
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id);
    if (!user?.email) return res.status(403).json({ success: false, message: 'User email not found' });
    const faculty = await Faculty.findOne({ email: user.email });
    if (!faculty) return res.status(403).json({ success: false, message: 'Faculty profile not found' });
    const isDeptAdmin = Array.isArray(faculty.role) && faculty.role.some(r => r === 'dept_admin');
    if (!isDeptAdmin) return res.status(403).json({ success: false, message: 'Department admin access required' });
    req.faculty = faculty;
    next();
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

export const canApproveOpportunities = async (req, res, next) => {
  try {
    if (req.user?.userType !== 'faculty') return res.status(403).json({ success: false, message: 'Faculty access required' });
    const Faculty = (await import('../models/Faculty.js')).default;
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id);
    if (!user?.email) return res.status(403).json({ success: false, message: 'User email not found' });
    const faculty = await Faculty.findOne({ email: user.email });
    if (!faculty) return res.status(403).json({ success: false, message: 'Faculty profile not found' });
    const isDeptAdmin = Array.isArray(faculty.role) && faculty.role.some(r => r === 'dept_admin');
    if (!isDeptAdmin) return res.status(403).json({ success: false, message: 'Only department admin can approve opportunities' });
    req.faculty = faculty;
    next();
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

export const preventStudentApproval = (req, res, next) => {
  if (req.user?.userType === 'student') return res.status(403).json({ success: false, message: 'Students cannot approve opportunities' });
  next();
};

export const checkParentInfoLock = async (req, res, next) => {
  try {
    if (req.user?.userType !== 'student' || !req.body.parentInfo) return next();
    const Student = (await import('../models/Student.js')).default;
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user.id);
    const student = await Student.findOne({ email: user?.email });
    if (student?.parentInfo?.isParentInfoLocked) {
      return res.status(403).json({ success: false, message: 'Parent information is locked. Contact department admin for modifications.' });
    }
    next();
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};
