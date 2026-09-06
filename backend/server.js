import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import facultyRoutes from './routes/faculty.js';
import recommendationRoutes from './routes/recommendation.js';
import postRoutes from './routes/post.js';
import certificateRoutes from './routes/certificate.js';
import competitionRoutes from './routes/competition.js';
import internshipRoutes from './routes/internship.js';
import opportunityRoutes from './routes/opportunity.js';
import interestRoutes from './routes/interest.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';
import landingRoutes from './routes/landing.js';
import projectRoutes from './routes/project.js';
import uiRoutes from './routes/ui.js';
import { auditLogger } from './middleware/auditLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimiter, requestId } from './middleware/security.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const requiredProductionEnv = [
  'MONGO_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'RECOMMENDATION_SERVICE_URL',
  'RECOMMENDATION_API_KEY',
];

if (isProduction) {
  const missing = requiredProductionEnv.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    console.error(`[backend] Missing required production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (process.env.JWT_SECRET.length < 32) {
    console.error('[backend] JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }
}

if (isProduction) app.set('trust proxy', 1);

const envOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);
const localOrigins = isProduction ? [] : [
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:4173', 'http://127.0.0.1:4173',
];
const allowedOrigins = new Set([...localOrigins, ...envOrigins]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed'));
  },
  credentials: true,
};

app.disable('x-powered-by');
app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URLENCODED_BODY_LIMIT || '1mb' }));
app.use(apiRateLimiter);
app.use(auditLogger);

app.use('/uploads', express.static('uploads', {
  index: false,
  dotfiles: 'deny',
  maxAge: isProduction ? '1d' : 0,
}));

app.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    status: dbReady ? 'healthy' : 'degraded',
    database: dbReady ? 'connected' : 'disconnected',
  });
});

app.get('/ready', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  return res.status(dbReady ? 200 : 503).json({ success: dbReady, status: dbReady ? 'ready' : 'not_ready' });
});

app.use('/students', studentRoutes);
app.use('/faculty/recommendations', recommendationRoutes);
app.use('/faculty', facultyRoutes);
app.use('/posts', postRoutes);
app.use('/certificates', certificateRoutes);
app.use('/competitions', competitionRoutes);
app.use('/internships', internshipRoutes);
app.use('/opportunities', opportunityRoutes);
app.use('/interests', interestRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/chats', chatRoutes);
app.use('/auth', authRoutes);
app.use('/landing', landingRoutes);
app.use('/projects', projectRoutes);
app.use('/ui', uiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('[backend] MONGO_URI or MONGODB_URI must be configured.');
  process.exit(1);
}

let server;
let shuttingDown = false;

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[backend] ${signal} received; shutting down gracefully.`);
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close(false);
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const start = async () => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 2),
  });
  server = app.listen(PORT, () => console.log(`[backend] listening on port ${PORT}`));
};

start().catch((error) => {
  console.error('[backend] startup failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
