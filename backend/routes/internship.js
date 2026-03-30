// Update internship
router.put('/:id', async (req, res) => {
  const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(internship);
});

// Delete internship
router.delete('/:id', async (req, res) => {
  await Internship.findByIdAndDelete(req.params.id);
  res.json({ message: 'Internship deleted' });
});
import express from 'express';
import Internship from '../models/Internship.js';
const router = express.Router();

// Get all internships
router.get('/', async (req, res) => {
  const internships = await Internship.find();
  res.json(internships);
});

// Create internship
router.post('/', async (req, res) => {
  const internship = new Internship(req.body);
  await internship.save();
  res.status(201).json(internship);
});

// Apply to internship
router.post('/:id/apply', async (req, res) => {
  const { studentId } = req.body;
  const internship = await Internship.findById(req.params.id);
  if (!internship.students) internship.students = [];
  if (!internship.students.includes(studentId)) internship.students.push(studentId);
  await internship.save();
  res.json(internship);
});

export default router;
