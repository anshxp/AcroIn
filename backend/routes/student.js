import express from 'express';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Project from '../models/Project.js';
import Internship from '../models/Internship.js';
import Competition from '../models/Competition.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

/// Create student
router.post('/', async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      ...rest,
      password: hashedPassword
    });

    await student.save();

    // remove password from response
    const { password: _, ...studentData } = student._doc;

    res.status(201).json(studentData);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  const students = await Student.find().populate('projects internships competitions certificates');
  res.json(students);
});

// Get student by ID
router.get('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id).populate('projects internships competitions certificates');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

// Update student
router.put('/:id', async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(student);
});

// Delete student
router.delete('/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Student deleted' });
});

export default router;
