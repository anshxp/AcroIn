import express from 'express';
import axios from 'axios';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const serviceUrl = (process.env.RECOMMENDATION_SERVICE_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');
const serviceApiKey = process.env.RECOMMENDATION_API_KEY || '';

router.post('/', verifyToken, async (req, res) => {
  if (req.user?.userType !== 'faculty' && req.user?.userType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Faculty or admin access required' });
  }

  try {
    const response = await axios.post(`${serviceUrl}/recommendations`, req.body, {
      timeout: 15000,
      headers: serviceApiKey ? { 'X-Recommendation-Api-Key': serviceApiKey } : undefined,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.detail || error.response.data?.message || 'Recommendation service rejected the request',
      });
    }

    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      return res.status(504).json({ success: false, message: 'Recommendation service timed out' });
    }

    return res.status(503).json({ success: false, message: 'Recommendation service is unavailable' });
  }
});

export default router;
