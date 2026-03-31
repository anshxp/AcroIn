import express from 'express';
import bcrypt from 'bcryptjs';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// Create faculty
router.post('/', async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = new Faculty({
      ...rest,
      password: hashedPassword
    });

    await faculty.save();

    // remove password from response
    const { password: _, ...facultyData } = faculty._doc;

    res.status(201).json(facultyData);

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
  try {
    const updatedData = { ...req.body };

    // 🔐 If password is being updated → hash it
    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10);
    }

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ).select('-password'); // 🚫 remove password from response

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json(faculty);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete faculty
router.delete('/:id', async (req, res) => {
  await Faculty.findByIdAndDelete(req.params.id);
  res.json({ message: 'Faculty deleted' });
});

export default router;
