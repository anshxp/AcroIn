import express from 'express';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// Create faculty
router.post('/', async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Get all faculty
router.get('/', async (req, res) => {
  const faculty = await Faculty.find();
  res.json(faculty);
});

// Get faculty by ID
router.get('/:id', async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
  res.json(faculty);
});

// Update faculty
router.put('/:id', async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(faculty);
});

// Delete faculty
router.delete('/:id', async (req, res) => {
  await Faculty.findByIdAndDelete(req.params.id);
  res.json({ message: 'Faculty deleted' });
});

export default router;
