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
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/chats', chatRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error(err));
