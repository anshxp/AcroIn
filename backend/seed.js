

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Student from './src/models/Student.cjs';
import Faculty from './src/models/Faculty.cjs';
import User from './src/models/User.cjs';
import Competition from './src/models/Competition.cjs';
import Internship from './src/models/Internship.cjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function seed() {


  await mongoose.connect(process.env.MONGO_URI);

  // Clear collections to avoid duplicate key errors
  await Promise.all([
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    User.deleteMany({}),
    Competition.deleteMany({}),
    Internship.deleteMany({})
  ]);

  // Insert Student
  const hashedPassword = await bcrypt.hash('password123', 10);
  const student = await Student.create({
    name: 'Alice Johnson',
    roll: 'S1001',
    email: 'alice@college.edu',
    department: 'CSE',
    tech_stack: ['React', 'Node.js'],
    password: hashedPassword
  });

  // Insert Faculty
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const faculty = await Faculty.create({
    firstname: 'Dr.',
    lastName: 'Smith',
    email: 'drsmith@college.edu',
    department: 'CSE',
    designation: 'Professor',
    qualification: 'PhD',
    experience: 10,
    phone: '1234567890',
    password: facultyPassword
  });

  // Insert User for Student
  await User.create({
    email: student.email,
    password: hashedPassword,
    name: student.name,
    userType: 'student'
  });

  // Insert User for Faculty
  await User.create({
    email: faculty.email,
    password: facultyPassword,
    name: faculty.firstname + ' ' + faculty.lastName,
    userType: 'faculty'
  });

  // Insert Competition
  await Competition.create({
    name: 'Hackathon 2026',
    organizer: 'Tech Club',
    date: '2026-04-15',
    application_link: 'https://techclub.org/hackathon-2026/register',
    student: student._id
  });

  // Insert Internship
  await Internship.create({
    company: 'Tech Corp',
    position: 'Intern',
    duration: '3 months',
    application_link: 'https://jobs.techcorp.com/internships/apply',
    student: student._id
  });

  console.log('Seed data inserted!');
  process.exit();
}

seed();
