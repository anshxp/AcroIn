import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import Faculty from './models/Faculty.js';
import User from './models/User.js';
import { syncFacultyProfile, syncStudentProfile } from './utils/profileSync.js';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const [students, faculties] = await Promise.all([
    Student.find().select('email'),
    Faculty.find().select('email'),
  ]);

  let studentSynced = 0;
  let facultySynced = 0;

  for (const studentStub of students) {
    const [student, user] = await Promise.all([
      Student.findById(studentStub._id),
      User.findOne({ email: studentStub.email }).select('_id email name userType'),
    ]);

    if (!student || !user) continue;
    await syncStudentProfile({ user, student });
    studentSynced += 1;
  }

  for (const facultyStub of faculties) {
    const [faculty, user] = await Promise.all([
      Faculty.findById(facultyStub._id),
      User.findOne({ email: facultyStub.email }).select('_id email name userType'),
    ]);

    if (!faculty || !user) continue;
    await syncFacultyProfile({ user, faculty });
    facultySynced += 1;
  }

  console.log(`Profiles synced. Students: ${studentSynced}, Faculty: ${facultySynced}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Profile sync failed:', error);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});
