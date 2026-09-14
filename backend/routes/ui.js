import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getAdminSettingsView,
  getFacultyAnalyticsView,
  getLoginContent,
  getStudentProjectsView,
  updateAdminSettingsView,
} from '../controllers/uiController.js';

const router = express.Router();

router.get('/auth/login', getLoginContent);
router.get('/student/projects', verifyToken, getStudentProjectsView);
router.get('/faculty/analytics', verifyToken, getFacultyAnalyticsView);

const requireSuperAdmin = (req, res, next) => {
  const roles = Array.isArray(req.user?.role) ? req.user.role : [];
  if (roles.includes('super_admin')) return next();
  return res.status(403).json({ success: false, message: 'Super admin access required' });
};

router.get('/admin/settings', verifyToken, requireSuperAdmin, getAdminSettingsView);
router.put('/admin/settings', verifyToken, requireSuperAdmin, updateAdminSettingsView);

export default router;
