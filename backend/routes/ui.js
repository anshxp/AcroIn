import express from 'express';
import {
  getAdminSettingsView,
  getFacultyAnalyticsView,
  getLoginContent,
  getStudentProjectsView,
  updateAdminSettingsView,
} from '../controllers/uiController.js';

const router = express.Router();

router.get('/auth/login', getLoginContent);
router.get('/student/projects', getStudentProjectsView);
router.get('/faculty/analytics', getFacultyAnalyticsView);
router.get('/admin/settings', getAdminSettingsView);
router.put('/admin/settings', updateAdminSettingsView);

export default router;
