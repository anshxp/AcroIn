import express from 'express';
import mongoose from 'mongoose';
import Certificate from '../models/Certificate.js';
const router = express.Router();

// Create certificate
router.post('/', async (req, res) => {
  try {
    // Guard invalid student ids early to avoid server crash
    if (req.body.student && !mongoose.Types.ObjectId.isValid(req.body.student)) {
      return res.status(400).json({ success: false, message: 'Invalid student id' });
    }

    const certificate = new Certificate(req.body);
    await certificate.save();
    res.status(201).json(certificate);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get certificate by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update certificate
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }
    if (req.body.student && !mongoose.Types.ObjectId.isValid(req.body.student)) {
      return res.status(400).json({ success: false, message: 'Invalid student id' });
    }
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json(certificate);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete certificate
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid certificate id' });
    }
    const deleted = await Certificate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
