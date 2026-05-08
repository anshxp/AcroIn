import jwt from 'jsonwebtoken';

// Check if user is authenticated
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user?.userType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Check if user is faculty
export const isFaculty = (req, res, next) => {
  if (req.user?.userType !== 'faculty') {
    return res.status(403).json({ success: false, message: 'Faculty access required' });
  }
  next();
};

// Check if user is admin or faculty
export const isAdminOrFaculty = (req, res, next) => {
  if (req.user?.userType !== 'admin' && req.user?.userType !== 'faculty') {
    return res.status(403).json({ success: false, message: 'Admin or Faculty access required' });
  }
  next();
};

// Check if user is student
export const isStudent = (req, res, next) => {
  if (req.user?.userType !== 'student') {
    return res.status(403).json({ success: false, message: 'Student access required' });
  }
  next();
};

// Attach user info from body (for requests that pass userId/email)
export const extractUserInfo = (req, res, next) => {
  if (!req.user) {
    req.user = {};
  }
  next();
};

// Check if user is department admin (faculty with dept_admin or super_admin role)
export const isDepartmentAdmin = async (req, res, next) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    // Import Faculty model
    const Faculty = (await import('../models/Faculty.js')).default;
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(req.user.id);
    if (!user?.email) {
      return res.status(403).json({ success: false, message: 'User email not found' });
    }

    const faculty = await Faculty.findOne({ email: user.email });
    if (!faculty) {
      return res.status(403).json({ success: false, message: 'Faculty profile not found' });
    }

    const isDeptAdmin = Array.isArray(faculty.role) && 
                       faculty.role.some(r => r === 'dept_admin' || r === 'super_admin');

    if (!isDeptAdmin) {
      return res.status(403).json({ success: false, message: 'Department admin access required' });
    }

    // Attach faculty to request for later use
    req.faculty = faculty;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check if user can approve opportunities (department admin only)
export const canApproveOpportunities = async (req, res, next) => {
  try {
    if (req.user?.userType !== 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty access required' });
    }

    const Faculty = (await import('../models/Faculty.js')).default;
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(req.user.id);
    if (!user?.email) {
      return res.status(403).json({ success: false, message: 'User email not found' });
    }

    const faculty = await Faculty.findOne({ email: user.email });
    if (!faculty) {
      return res.status(403).json({ success: false, message: 'Faculty profile not found' });
    }

    const isDeptAdmin = Array.isArray(faculty.role) && 
                       faculty.role.some(r => r === 'dept_admin' || r === 'super_admin');

    if (!isDeptAdmin) {
      return res.status(403).json({ success: false, message: 'Only department admin can approve opportunities' });
    }

    req.faculty = faculty;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Prevent students from approving opportunities
export const preventStudentApproval = (req, res, next) => {
  if (req.user?.userType === 'student') {
    return res.status(403).json({ success: false, message: 'Students cannot approve opportunities' });
  }
  next();
};

// Check if student's parent info is locked
export const checkParentInfoLock = async (req, res, next) => {
  try {
    if (req.user?.userType !== 'student') {
      return next(); // Skip for non-students
    }

    // Check if trying to edit parent info
    if (!req.body.parentInfo) {
      return next(); // Not editing parent info
    }

    const Student = (await import('../models/Student.js')).default;
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(req.user.id);
    const student = await Student.findOne({ email: user.email });

    if (student?.parentInfo?.isParentInfoLocked) {
      return res.status(403).json({ 
        success: false, 
        message: 'Parent information is locked. Contact department admin for modifications.' 
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
