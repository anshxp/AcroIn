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
