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

const requireAdmin = (req, res, next) => {
  if (req.user?.userType === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

router.get('/admin/settings', verifyToken, requireAdmin, getAdminSettingsView);
router.put('/admin/settings', verifyToken, requireAdmin, updateAdminSettingsView);

export default router;
