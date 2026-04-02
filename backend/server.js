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
import certificateRoutes from './routes/certificate.js';
import competitionRoutes from './routes/competition.js';
import internshipRoutes from './routes/internship.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

dotenv.config();
const app=express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.options('*', cors());
app.use(express.json());

app.use('/students', studentRoutes);
app.use('/faculty', facultyRoutes);
app.use('/posts', postRoutes);
app.use('/certificates', certificateRoutes);
app.use('/competitions', competitionRoutes);
app.use('/internships', internshipRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/chats', chatRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
