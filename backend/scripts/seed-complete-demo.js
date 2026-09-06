/**
 * Seed a complete AcroIn development dataset.
 *
 * Creates/upserts:
 *   - 10 students in each of the 12 supported departments (120 total)
 *   - 5 faculty in each department (60 total)
 *   - 1 departmental-admin faculty account (CSE)
 *
 * Existing records are not deleted. Demo records are identified by their
 * deterministic email/roll values and are safely upserted.
 *
 * Usage:
 *   node scripts/seed-complete-demo.js
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/AcroIn';
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD || 'AcroIn@2026';

const departments = [
  'CSE', 'AIML', 'DS', 'CSIT', 'CYBER', 'ECE', 'EEE', 'VLSI', 'ME', 'CE', 'IT', 'IL',
];

const firstNames = [
  'Aarav', 'Aditya', 'Akash', 'Aman', 'Ananya', 'Arjun', 'Ayush', 'Diya', 'Isha', 'Kavya',
  'Karan', 'Meera', 'Neha', 'Nikhil', 'Pooja', 'Rahul', 'Riya', 'Rohan', 'Sakshi', 'Simran',
];
const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Jain', 'Joshi', 'Singh', 'Gupta', 'Yadav', 'Mehta', 'Mishra',
  'Khan', 'Saxena', 'Chouhan', 'Tiwari', 'Agarwal', 'Bansal', 'Soni', 'Dubey', 'Rathore', 'Vyas',
];
const facultyFirstNames = ['Sandeep', 'Priya', 'Vivek', 'Neeraj', 'Pallavi'];
const facultyLastNames = ['Sharma', 'Verma', 'Patel', 'Joshi', 'Mehta'];

const hash = await bcrypt.hash(DEMO_PASSWORD, 12);

const upsertUser = async ({ email, name, userType, extras = {} }) => {
  return User.findOneAndUpdate(
    { email },
    { $set: { email, password: hash, name, userType, ...extras } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const upsertStudent = async (payload) => {
  const student = await Student.findOneAndUpdate(
    { email: payload.email },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await upsertUser({
    email: student.email,
    name: student.name,
    userType: 'student',
  });
  return student;
};

const upsertFaculty = async (payload) => {
  const faculty = await Faculty.findOneAndUpdate(
    { email: payload.email },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await upsertUser({
    email: faculty.email,
    name: `${faculty.firstname} ${faculty.lastName}`,
    userType: 'faculty',
    extras: {
      firstname: faculty.firstname,
      lastName: faculty.lastName,
      department: faculty.department,
      designation: faculty.designation,
      role: faculty.role,
    },
  });
  return faculty;
};

const makeStudent = (department, index, globalIndex) => {
  const first = firstNames[(globalIndex - 1) % firstNames.length];
  const last = lastNames[Math.floor((globalIndex - 1) / firstNames.length) % lastNames.length];
  const roll = `ACR-${department}-${String(index).padStart(2, '0')}`;
  const email = `demo.student.${department.toLowerCase()}.${String(index).padStart(2, '0')}@acropolis.in`;
  const semester = index % 2 === 0 ? '6th Semester' : '4th Semester';
  const year = semester === '6th Semester' ? '3rd Year' : '2nd Year';

  return {
    name: `${first} ${last}`,
    roll,
    email,
    department,
    year,
    semester,
    phone: `90000${String(10000 + globalIndex).slice(-5)}`,
    birthday: `200${index % 5 + 1}-${String(index % 12 + 1).padStart(2, '0')}-${String(index % 27 + 1).padStart(2, '0')}`,
    address: 'Indore, Madhya Pradesh',
    location: 'Indore',
    bio: `Demo student for ${department} department.`,
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    tech_stack: ['JavaScript', 'Python', 'SQL'],
    skills: [
      { category: 'Programming', name: 'JavaScript', level: 'Intermediate', verified: false, progress: 65, endorsements: 0 },
      { category: 'Programming', name: 'Python', level: 'Intermediate', verified: false, progress: 60, endorsements: 0 },
    ],
    verificationStatus: 'not_verified',
    faceVerificationStatus: 'none',
    password: hash,
    profileCompleteness: 55,
  };
};

const makeFaculty = (department, index) => {
  const first = facultyFirstNames[index - 1];
  const last = facultyLastNames[index - 1];
  const isDeptAdmin = department === 'CSE' && index === 1;
  return {
    firstname: first,
    lastName: last,
    email: `demo.faculty.${department.toLowerCase()}.${index}@acropolis.in`,
    department,
    designation: isDeptAdmin ? 'Department Administrator' : 'Assistant Professor',
    qualification: 'M.Tech',
    experience: 5 + index,
    subjects: ['Core Subjects', 'Project Guidance'],
    skills: ['Teaching', 'Mentoring'],
    techstacks: ['Python', 'SQL'],
    phone: `91000${String(20000 + departments.indexOf(department) * 5 + index).slice(-5)}`,
    role: isDeptAdmin ? ['faculty', 'dept_admin'] : ['faculty'],
    password: hash,
  };
};

try {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB. Seeding ${departments.length} departments.`);

  let studentCount = 0;
  let facultyCount = 0;

  for (const department of departments) {
    for (let index = 1; index <= 10; index += 1) {
      await upsertStudent(makeStudent(department, index, studentCount + 1));
      studentCount += 1;
    }

    for (let index = 1; index <= 5; index += 1) {
      await upsertFaculty(makeFaculty(department, index));
      facultyCount += 1;
    }
  }

  console.log(`Seed complete: ${studentCount} students, ${facultyCount} faculty.`);
  console.log(`Departmental admin: demo.faculty.cse.1@acropolis.in`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
