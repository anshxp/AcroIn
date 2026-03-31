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
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
