import Project from '../models/Project.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { resolveStudentId } from '../utils/resolveStudentId.js';

const resolveRequesterStudentId = async (req) => {
  if (req.user?.userType !== 'student' || !req.user?.id) {
    return null;
  }

  const userRecord = await User.findById(req.user.id).select('email');
  if (!userRecord?.email) {
    return null;
  }

  const student = await Student.findOne({ email: userRecord.email }).select('_id');
  return student?._id || null;
};

const canMutateProject = async (req, project) => {
  if (req.user?.userType === 'admin') {
    return true;
  }

  if (req.user?.userType !== 'student') {
    return false;
  }

  const requesterStudentId = await resolveRequesterStudentId(req);
  if (!requesterStudentId) {
    return false;
  }

  return project?.student?.toString() === requesterStudentId.toString();
};

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

    if (req.user?.userType === 'student') {
      const requesterStudentId = await resolveRequesterStudentId(req);
      if (!requesterStudentId) {
        return res.status(403).json({ success: false, message: 'Student profile not found for authenticated user' });
      }

      if (payload.student && payload.student.toString() !== requesterStudentId.toString()) {
        return res.status(403).json({ success: false, message: 'Students can only create projects for themselves' });
      }

      payload.student = requesterStudentId;
    }

    if (!payload.student) {
      return res.status(400).json({ success: false, message: 'Student is required for project creation' });
    }

    const project = await Project.create(payload);
    
    // Add project ID to student's projects array
    await Student.findByIdAndUpdate(
      project.student,
      { $addToSet: { projects: project._id } },
      { new: true }
    );
    
    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const allowed = await canMutateProject(req, project);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    const payload = { ...(req.body || {}) };
    if (payload.student) {
      payload.student = await resolveStudentId(payload.student);
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, data: updatedProject });
  } catch (error) {
    return next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const allowed = await canMutateProject(req, project);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await Project.deleteOne({ _id: req.params.id });

    return res.json({ success: true, data: { id: project._id } });
  } catch (error) {
    return next(error);
  }
};
