import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import facultyRoutes from './routes/faculty.js';
import postRoutes from './routes/post.js';
import certificateRoutes from './routes/certificate.js';
import competitionRoutes from './routes/competition.js';
import internshipRoutes from './routes/internship.js';
import opportunityRoutes from './routes/opportunity.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import landingRoutes from './routes/landing.js';
import projectRoutes from './routes/project.js';
import uiRoutes from './routes/ui.js';
import { auditLogger } from './middleware/auditLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();
const app=express();

const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...envOrigins,
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(auditLogger);

// Serve uploads folder statically (fallback for local storage if Cloudinary not configured)
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Backend is reachable' });
});

app.use('/students', studentRoutes);
app.use('/faculty', facultyRoutes);
app.use('/posts', postRoutes);
app.use('/certificates', certificateRoutes);
app.use('/competitions', competitionRoutes);
app.use('/internships', internshipRoutes);
app.use('/opportunities', opportunityRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/chats', chatRoutes);
app.use('/auth', authRoutes);
app.use('/landing', landingRoutes);
app.use('/projects', projectRoutes);
app.use('/ui', uiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
