import express from 'express';
import {
  createProject,
  deleteProject,
  listProjects,
  listProjectsByStudent,
  updateProject,
} from '../controllers/projectController.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, isAdminOrFaculty, listProjects);
router.get('/student/:studentId', verifyToken, listProjectsByStudent);
router.post('/', verifyToken, createProject);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

export default router;
