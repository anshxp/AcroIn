import express from 'express';
import { getLandingContent, getLandingStats } from '../controllers/landingController.js';

const router = express.Router();

router.get('/content', getLandingContent);
router.get('/stats', getLandingStats);

export default router;
