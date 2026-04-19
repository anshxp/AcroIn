import express from 'express';
import mongoose from 'mongoose';
import Opportunity from '../models/Opportunity.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { createAnnouncementNotifications } from '../utils/announcementNotifications.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';
import { postUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const toAbsoluteUploadUrl = (req, filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${req.protocol}://${req.get('host')}${normalized}`;
};

const getAuthorFromUser = async (userId) => {
  const user = await User.findById(userId).select('name userType designation department');
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    designation: user.designation,
    department: user.department,
    userType: user.userType,
  };
};

const buildOpportunityPostContent = (opportunity) => {
  const lines = [
    `New ${opportunity.type} opportunity: ${opportunity.title}`,
  ];

  if (opportunity.company) {
    lines.push(`Company: ${opportunity.company}`);
  }
  if (opportunity.location) {
    lines.push(`Venue: ${opportunity.location}`);
  }
  if (opportunity.eventDate) {
    lines.push(`Date: ${new Date(opportunity.eventDate).toLocaleDateString()}`);
  }
  if (opportunity.deadline) {
    lines.push(`Deadline: ${new Date(opportunity.deadline).toLocaleDateString()}`);
  }
  if (opportunity.description) {
    lines.push(`Details: ${opportunity.description}`);
  }
  if (Array.isArray(opportunity.requirements) && opportunity.requirements.length > 0) {
    lines.push(`Requirements: ${opportunity.requirements.join(', ')}`);
  }
  if (opportunity.application_link) {
    lines.push(`Apply: ${opportunity.application_link}`);
  }

  return lines.join('\n');
};

// Get all opportunities
router.get('/', async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get opportunity by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create opportunity (admin/faculty only)
router.post('/', verifyToken, isAdminOrFaculty, postUpload.array('files', 4), async (req, res) => {
  try {
    const { title, type, company, location, eventDate, deadline, description, requirements, application_link } = req.body;
    const uploadedAttachments = Array.isArray(req.files)
      ? req.files
          .map((file) => toAbsoluteUploadUrl(req, file.path || `/uploads/${file.filename}`))
          .filter(Boolean)
      : [];
    const normalizedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === 'string' && requirements.trim()
        ? [requirements.trim()]
        : [];

    if (!title || !application_link) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and application link are required' 
      });
    }

    // Validate URL
    try {
      new URL(application_link);
    } catch {
      return res.status(400).json({ 
        success: false, 
        message: 'Application link must be a valid URL' 
      });
    }

    const opportunity = new Opportunity({
      title,
      type: type || 'internship',
      company,
      location,
      eventDate: eventDate ? new Date(eventDate) : null,
      deadline: deadline ? new Date(deadline) : null,
      description,
      requirements: normalizedRequirements,
      application_link,
      attachments: uploadedAttachments,
      createdBy: req.user?.id,
      createdByRole: req.user?.userType
    });

    await opportunity.save();

    const author = await getAuthorFromUser(req.user?.id);
    let createdPost = null;
    if (author) {
      createdPost = await Post.create({
        author,
        content: buildOpportunityPostContent(opportunity),
        images: uploadedAttachments,
      });
    }

    await createAnnouncementNotifications({
      req,
      payload: {
        title: opportunity.title,
        description: opportunity.description,
        company: opportunity.company,
        location: opportunity.location,
        type: opportunity.type,
        requirements: opportunity.requirements,
      },
      announcementType: 'opportunity',
      sourceId: opportunity._id,
      title: opportunity.title,
      actionPath: createdPost ? `/home?post=${createdPost._id}` : '/home',
    });

    res.status(201).json(opportunity);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update opportunity (creator or admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    // Only creator or admin can update
    if (opportunity.createdBy.toString() !== req.user?.id && req.user?.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this opportunity' });
    }

    const updateData = { ...req.body };
    if (updateData.application_link) {
      try {
        new URL(updateData.application_link);
      } catch {
        return res.status(400).json({ 
          success: false, 
          message: 'Application link must be a valid URL' 
        });
      }
    }

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete opportunity (creator or admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id' });
    }

    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    // Only creator or admin can delete
    if (opportunity.createdBy.toString() !== req.user?.id && req.user?.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this opportunity' });
    }

    await Opportunity.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
