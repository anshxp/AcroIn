import express from 'express';
import mongoose from 'mongoose';
import Opportunity from '../models/Opportunity.js';
import Faculty from '../models/Faculty.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { createAnnouncementNotifications } from '../utils/announcementNotifications.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';
import { postUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();
const DEPARTMENT_ADMIN_ROLES = new Set(['dept_admin', 'super_admin']);
const normalizeDepartment = (value) => String(value || '').trim().toLowerCase();

const toAbsoluteUploadUrl = (req, filePath) => {
  if (!filePath) return '';
  if (/^https?:\/\//i.test(filePath)) return filePath;
  return `${req.protocol}://${req.get('host')}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
};

const getAuthorFromUser = async (userId) => {
  const user = await User.findById(userId).select('name userType designation department email');
  if (!user) return null;
  let department = user.department;
  if (user.userType === 'faculty' && user.email) department = (await Faculty.findOne({ email: user.email }).select('department'))?.department || department;
  return { _id: user._id, name: user.name, designation: user.designation, department, userType: user.userType };
};

const getFacultyContext = async (req) => {
  if (req.user?.userType !== 'faculty' || !req.user?.id) return null;
  const user = await User.findById(req.user.id).select('email');
  if (!user?.email) return null;
  const faculty = await Faculty.findOne({ email: user.email }).select('_id department role');
  if (!faculty) return null;
  return { faculty, isDepartmentAdmin: Array.isArray(faculty.role) && faculty.role.some((role) => DEPARTMENT_ADMIN_ROLES.has(role)) };
};

const buildOpportunityPostContent = (opportunity) => {
  const lines = [`New ${opportunity.type} opportunity: ${opportunity.title}`];
  if (opportunity.company) lines.push(`Company: ${opportunity.company}`);
  if (opportunity.location) lines.push(`Venue: ${opportunity.location}`);
  if (opportunity.eventDate) lines.push(`Date: ${new Date(opportunity.eventDate).toLocaleDateString()}`);
  if (opportunity.deadline) lines.push(`Deadline: ${new Date(opportunity.deadline).toLocaleDateString()}`);
  if (opportunity.description) lines.push(`Details: ${opportunity.description}`);
  if (Array.isArray(opportunity.requirements) && opportunity.requirements.length) lines.push(`Requirements: ${opportunity.requirements.join(', ')}`);
  if (opportunity.application_link) lines.push(`Apply: ${opportunity.application_link}`);
  return lines.join('\n');
};

const publishApprovedOpportunity = async (req, opportunity) => {
  const author = await getAuthorFromUser(opportunity.createdBy);
  let createdPost = null;
  if (author) {
    createdPost = await Post.create({ author, content: buildOpportunityPostContent(opportunity), images: opportunity.attachments, linkedOpportunity: opportunity._id });
  }
  await createAnnouncementNotifications({
    req,
    payload: { title: opportunity.title, description: opportunity.description, company: opportunity.company, location: opportunity.location, type: opportunity.type, requirements: opportunity.requirements },
    announcementType: 'opportunity', sourceId: opportunity._id, title: opportunity.title,
    actionPath: createdPost ? `/home?post=${createdPost._id}` : '/home',
  });
  return createdPost;
};

router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.user?.userType === 'student') query.status = 'APPROVED';
    res.json(await Opportunity.find(query).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json(opportunity);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', verifyToken, isAdminOrFaculty, postUpload.array('files', 4), async (req, res) => {
  try {
    const { title, type, company, location, eventDate, deadline, description, requirements, application_link } = req.body;
    const uploadedAttachments = Array.isArray(req.files) ? req.files.map((file) => toAbsoluteUploadUrl(req, file.path || `/uploads/${file.filename}`)).filter(Boolean) : [];
    const normalizedRequirements = Array.isArray(requirements) ? requirements : typeof requirements === 'string' && requirements.trim() ? [requirements.trim()] : [];
    if (!title || !application_link) return res.status(400).json({ success: false, message: 'Title and application link are required' });
    try { new URL(application_link); } catch { return res.status(400).json({ success: false, message: 'Application link must be a valid URL' }); }

    const facultyContext = await getFacultyContext(req);
    const isFacultyAdmin = Boolean(facultyContext?.isDepartmentAdmin);
    const status = req.user?.userType === 'admin' || isFacultyAdmin ? 'APPROVED' : 'PENDING';

    const opportunity = new Opportunity({ title, type: type || 'internship', company, location, eventDate: eventDate ? new Date(eventDate) : null, deadline: deadline ? new Date(deadline) : null, description, requirements: normalizedRequirements, application_link, attachments: uploadedAttachments, createdBy: req.user?.id, createdByRole: req.user?.userType, status });
    if (status === 'APPROVED' && facultyContext?.faculty?._id) {
      opportunity.approvedBy = facultyContext.faculty._id;
      opportunity.approvedAt = new Date();
    }
    await opportunity.save();

    if (status === 'APPROVED') {
      await publishApprovedOpportunity(req, opportunity);
      return res.status(201).json(opportunity);
    }

    return res.status(201).json({ ...opportunity.toObject(), message: 'Opportunity submitted for department-admin approval', status: 'PENDING' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    if (opportunity.createdBy.toString() !== req.user?.id && req.user?.userType !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized to update this opportunity' });
    const updateData = { ...req.body };
    if (updateData.application_link) { try { new URL(updateData.application_link); } catch { return res.status(400).json({ success: false, message: 'Application link must be a valid URL' }); } }
    const updated = await Opportunity.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    if (opportunity.createdBy.toString() !== req.user?.id && req.user?.userType !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized to delete this opportunity' });
    await Opportunity.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

const getApprover = async (req) => {
  if (req.user?.userType !== 'faculty') return null;
  const user = await User.findById(req.user.id).select('email');
  if (!user?.email) return null;
  const faculty = await Faculty.findOne({ email: user.email }).select('_id department role');
  if (!faculty || !Array.isArray(faculty.role) || !faculty.role.some((role) => DEPARTMENT_ADMIN_ROLES.has(role))) return null;
  return faculty;
};

router.patch('/:id/approve', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    const faculty = await getApprover(req);
    if (!faculty) return res.status(403).json({ success: false, message: 'Only the department admin can approve opportunities' });
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    const creator = await getAuthorFromUser(opportunity.createdBy);
    if (!creator || normalizeDepartment(creator.department) !== normalizeDepartment(faculty.department)) return res.status(403).json({ success: false, message: 'You can approve only opportunities from your department' });
    if (opportunity.status !== 'PENDING') return res.status(400).json({ success: false, message: `Opportunity is already ${opportunity.status.toLowerCase()}` });
    opportunity.status = 'APPROVED'; opportunity.approvedBy = faculty._id; opportunity.approvedAt = new Date(); opportunity.rejectionReason = undefined;
    await opportunity.save();
    await publishApprovedOpportunity(req, opportunity);
    res.json({ success: true, message: 'Opportunity approved', opportunity });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.patch('/:id/reject', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    const faculty = await getApprover(req);
    if (!faculty) return res.status(403).json({ success: false, message: 'Only the department admin can reject opportunities' });
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    const creator = await getAuthorFromUser(opportunity.createdBy);
    if (!creator || normalizeDepartment(creator.department) !== normalizeDepartment(faculty.department)) return res.status(403).json({ success: false, message: 'You can reject only opportunities from your department' });
    opportunity.status = 'REJECTED'; opportunity.approvedBy = faculty._id; opportunity.approvedAt = new Date(); opportunity.rejectionReason = req.body?.reason || 'No reason provided';
    await opportunity.save();
    res.json({ success: true, message: 'Opportunity rejected', opportunity });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

router.get('/stats/pending', verifyToken, async (req, res) => {
  try {
    const faculty = await getApprover(req);
    if (!faculty) return res.status(403).json({ success: false, message: 'Only the department admin can view approval stats' });
    const [pending, approved, rejected] = await Promise.all([
      Opportunity.countDocuments({ status: 'PENDING', createdByRole: 'faculty' }),
      Opportunity.countDocuments({ status: 'APPROVED' }), Opportunity.countDocuments({ status: 'REJECTED' }),
    ]);
    res.json({ pending, approved, rejected });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
