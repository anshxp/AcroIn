import express from 'express';
import mongoose from 'mongoose';
import Competition from '../models/Competition.js';
const router = express.Router();

// Get all competitions
router.get('/', async (req, res) => {
  try {
    const competitions = await Competition.find();
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create competition
router.post('/', async (req, res) => {
  try {
    const competition = new Competition(req.body);
    await competition.save();
    res.status(201).json(competition);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Apply to competition
router.post('/:id/apply', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }
    const { studentId } = req.body;
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ success: false, message: 'Competition not found' });
    if (!competition.students) competition.students = [];
    if (studentId && !competition.students.includes(studentId)) competition.students.push(studentId);
    await competition.save();
    res.json(competition);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update competition
router.put('/:id', async (req, res) => {
  try {
    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    res.json(competition);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Delete competition
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid competition id' });
    }
    const deleted = await Competition.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Competition not found' });
    res.json({ success: true, message: 'Competition deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
