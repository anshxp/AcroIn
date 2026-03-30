require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./src/models/Student.cjs');
const Faculty = require('./src/models/Faculty.cjs');
const User = require('./src/models/User.cjs');
const Competition = require('./src/models/Competition.cjs');
const Internship = require('./src/models/Internship.cjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

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
    student: student._id
  });

  // Insert Internship
  await Internship.create({
    company: 'Tech Corp',
    position: 'Intern',
    duration: '3 months',
    student: student._id
  });

  console.log('Seed data inserted!');
  process.exit();
}

seed();
