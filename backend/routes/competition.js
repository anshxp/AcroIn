// Update competition
router.put('/:id', async (req, res) => {
  const competition = await Competition.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(competition);
});

// Delete competition
router.delete('/:id', async (req, res) => {
  await Competition.findByIdAndDelete(req.params.id);
  res.json({ message: 'Competition deleted' });
});
import express from 'express';
import Competition from '../models/Competition.js';
const router = express.Router();

// Get all competitions
router.get('/', async (req, res) => {
  const competitions = await Competition.find();
  res.json(competitions);
});

// Create competition
router.post('/', async (req, res) => {
  const competition = new Competition(req.body);
  await competition.save();
  res.status(201).json(competition);
});

// Apply to competition
router.post('/:id/apply', async (req, res) => {
  const { studentId } = req.body;
  const competition = await Competition.findById(req.params.id);
  if (!competition.students) competition.students = [];
  if (!competition.students.includes(studentId)) competition.students.push(studentId);
  await competition.save();
  res.json(competition);
});

export default router;
