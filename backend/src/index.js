const certificateRoutes = require('../routes/certificate');
app.use('/api/certificates', certificateRoutes);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


const authRoutes = require('../routes/auth');
const studentRoutes = require('../routes/student');
const facultyRoutes = require('../routes/faculty');
const postRoutes = require('../routes/post');
const notificationRoutes = require('../routes/notification');
const adminRoutes = require('../routes/admin');
const competitionRoutes = require('../routes/competition');
const internshipRoutes = require('../routes/internship');
const chatRoutes = require('../routes/chat');

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "https://acro-in.vercel.app",
    credentials: true,
  })
);
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/faculty', facultyRoutes);
app.use('/posts', postRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/competitions', competitionRoutes);
app.use('/internships', internshipRoutes);
app.use('/chats', chatRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error(err));
