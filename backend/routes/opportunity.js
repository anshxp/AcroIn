import express from 'express';
import mongoose from 'mongoose';
import Opportunity from '../models/Opportunity.js';
import { verifyToken, isAdminOrFaculty } from '../middleware/authMiddleware.js';

const router = express.Router();

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
router.post('/', verifyToken, isAdminOrFaculty, async (req, res) => {
  try {
    const { title, type, company, location, deadline, description, requirements, application_link } = req.body;

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
      deadline: deadline ? new Date(deadline) : null,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      application_link,
      createdBy: req.user?.id,
      createdByRole: req.user?.userType
    });

    await opportunity.save();
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
