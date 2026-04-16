import Project from '../models/Project.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';

export const listProjects = async (_req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: projects });
  } catch (error) {
    return next(error);
  }
};

export const listProjectsByStudent = async (req, res, next) => {
  try {
    const studentId = await resolveStudentId(req.params.studentId);
    if (!studentId) {
      return res.json({ success: true, data: [] });
    }

    const projects = await Project.find({ student: studentId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: projects });
  } catch (error) {
    return next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const payload = { ...(req.body || {}) };

    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    const project = await Project.create(payload);
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const payload = { ...(req.body || {}) };
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({ success: true, data: { id: project._id } });
  } catch (error) {
    return next(error);
  }
};
