import express from 'express';
import mongoose from 'mongoose';
import Internship from '../models/Internship.js';
const router = express.Router();

// Get all internships
router.get('/', async (req, res) => {
  try {
    const internships = await Internship.find();
    res.json(internships);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create internship
router.post('/', async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json(internship);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Apply to internship
router.post('/:id/apply', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }
    const { studentId } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
    if (!internship.students) internship.students = [];
    if (studentId && !internship.students.includes(studentId)) internship.students.push(studentId);
    await internship.save();
    res.json(internship);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update internship
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });
    res.json(internship);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete internship
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid internship id' });
    }
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Internship not found' });
    res.json({ success: true, message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
