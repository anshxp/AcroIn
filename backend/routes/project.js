import express from 'express';
import {
  createProject,
  deleteProject,
  listProjects,
  listProjectsByStudent,
  updateProject,
} from '../controllers/projectController.js';

const router = express.Router();

router.get('/', listProjects);
router.get('/student/:studentId', listProjectsByStudent);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
