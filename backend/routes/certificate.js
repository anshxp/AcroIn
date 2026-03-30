import express from 'express';
import Certificate from '../models/Certificate.js';
const router = express.Router();

// Create certificate
router.post('/', async (req, res) => {
  const certificate = new Certificate(req.body);
  await certificate.save();
  res.status(201).json(certificate);
});

// Get all certificates
router.get('/', async (req, res) => {
  const certificates = await Certificate.find();
  res.json(certificates);
});

// Get certificate by ID
router.get('/:id', async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) return res.status(404).json({ message: 'Certificate not found' });
  res.json(certificate);
});

// Update certificate
router.put('/:id', async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(certificate);
});

// Delete certificate
router.delete('/:id', async (req, res) => {
  await Certificate.findByIdAndDelete(req.params.id);
  res.json({ message: 'Certificate deleted' });
});

export default router;
