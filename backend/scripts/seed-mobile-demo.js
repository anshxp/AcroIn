/**
 * Seeds local MongoDB with demo feed + searchable students.
 * Does NOT wipe existing accounts — upserts by email/roll.
 *
 * Usage: node scripts/seed-mobile-demo.js
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Post from '../models/Post.js';
import Opportunity from '../models/Opportunity.js';

dotenv.config();

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/AcroIn';

const DEMO_PASSWORD = 'Lavish@262';

const upsertUser = async ({ email, name, userType, passwordHash, extras = {} }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    existing.password = passwordHash;
    existing.name = name;
    existing.userType = userType;
    Object.assign(existing, extras);
    await existing.save();
    return existing;
  }
  return User.create({
    email,
    password: passwordHash,
    name,
    userType,
    ...extras,
  });
};

const upsertStudent = async (payload) => {
  const existing = await Student.findOne({
    $or: [{ email: payload.email }, { roll: payload.roll }],
  });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Student.create(payload);
};

const upsertFaculty = async (payload) => {
  const existing = await Faculty.findOne({ email: payload.email });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Faculty.create(payload);
};

async function run() {
  await mongoose.connect(mongoUri);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Primary test accounts (college + gmail alias for the credentials you use)
  const primaryStudent = await upsertStudent({
    name: 'Lavish Jangid',
    roll: '0812CS221045',
    email: 'lavishjangid230719@acropolis.in',
    department: 'CSE',
    year: '4th Year',
    semester: '8th Semester',
    phone: '9876543210',
    birthday: '2003-07-23',
    address: 'Indore, MP',
    location: 'Indore',
    bio: 'Full-stack developer and AcroIn contributor.',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
    tech_stack: ['React Native', 'Node.js', 'MongoDB', 'TypeScript'],
    skills: [
      { category: 'Framework', name: 'React Native', level: 'Advanced', verified: true, progress: 90, endorsements: 3 },
      { category: 'Programming', name: 'TypeScript', level: 'Advanced', verified: true, progress: 85, endorsements: 2 },
      { category: 'Framework', name: 'Node.js', level: 'Intermediate', verified: false, progress: 70, endorsements: 1 },
    ],
    verificationStatus: 'verified',
    password: passwordHash,
    profileCompleteness: 80,
  });

  await upsertUser({
    email: primaryStudent.email,
    name: primaryStudent.name,
    userType: 'student',
    passwordHash,
  });

  // Optional gmail login alias (same password) — separate student row for discovery
  const gmailStudent = await upsertStudent({
    name: 'Lavish Jangid',
    roll: '0812CS221099',
    email: 'lavishjnagid682@gmail.com',
    department: 'CSE',
    year: '4th Year',
    semester: '8th Semester',
    phone: '9876543210',
    birthday: '2003-07-23',
    address: 'Indore, MP',
    location: 'Indore',
    bio: 'Mobile app test account.',
    tech_stack: ['React Native', 'Expo', 'Express'],
    skills: [
      { category: 'Framework', name: 'React Native', level: 'Advanced', verified: true, progress: 88, endorsements: 2 },
      { category: 'Programming', name: 'JavaScript', level: 'Advanced', verified: true, progress: 90, endorsements: 4 },
    ],
    verificationStatus: 'verified',
    password: passwordHash,
    profileCompleteness: 75,
  });

  await upsertUser({
    email: gmailStudent.email,
    name: gmailStudent.name,
    userType: 'student',
    passwordHash,
  });

  const faculty = await upsertFaculty({
    firstname: 'Sandeep',
    lastName: 'Sharma',
    email: 'sandeep.sharma@acropolis.in',
    department: 'CSE',
    designation: 'Professor & HOD',
    qualification: 'PhD',
    experience: 12,
    phone: '9123456780',
    role: ['faculty', 'dept_admin'],
    subjects: ['DBMS', 'OS'],
    skills: ['Teaching', 'Mentoring'],
    techstacks: ['Python', 'SQL'],
    password: passwordHash,
  });

  const facultyUser = await upsertUser({
    email: faculty.email,
    name: `${faculty.firstname} ${faculty.lastName}`,
    userType: 'faculty',
    passwordHash,
    extras: {
      firstname: faculty.firstname,
      lastName: faculty.lastName,
      department: faculty.department,
      designation: faculty.designation,
      role: faculty.role,
    },
  });

  // Extra verified students so Smart Search has results
  const peers = [
    {
      name: 'Aman Vyas',
      roll: '0812CS221008',
      email: 'aman.vyas@acropolis.in',
      department: 'CSE',
      tech_stack: ['Python', 'TensorFlow', 'SQL'],
      skills: [
        { category: 'Programming', name: 'Python', level: 'Advanced', verified: true, progress: 92, endorsements: 5 },
        { category: 'Other', name: 'Machine Learning', level: 'Intermediate', verified: false, progress: 70, endorsements: 1 },
      ],
    },
    {
      name: 'Divya Sharma',
      roll: '0812IT221012',
      email: 'divya.sharma@acropolis.in',
      department: 'IT',
      tech_stack: ['UI/UX', 'Figma', 'React'],
      skills: [
        { category: 'Design', name: 'UI/UX Design', level: 'Advanced', verified: true, progress: 95, endorsements: 6 },
        { category: 'Design', name: 'Figma', level: 'Advanced', verified: true, progress: 90, endorsements: 4 },
      ],
    },
    {
      name: 'Rahul Joshi',
      roll: '0812CS221033',
      email: 'rahul.joshi@acropolis.in',
      department: 'CSE',
      tech_stack: ['Java', 'Spring Boot', 'MySQL'],
      skills: [
        { category: 'Programming', name: 'Java', level: 'Advanced', verified: true, progress: 88, endorsements: 3 },
      ],
    },
  ];

  for (const peer of peers) {
    const student = await upsertStudent({
      ...peer,
      year: '3rd Year',
      semester: '6th Semester',
      location: 'Indore',
      address: 'Indore, MP',
      birthday: '2004-01-15',
      verificationStatus: 'verified',
      password: passwordHash,
      profileCompleteness: 70,
    });
    await upsertUser({
      email: student.email,
      name: student.name,
      userType: 'student',
      passwordHash,
    });
  }

  // Opportunities
  const existingOpp = await Opportunity.findOne({ title: 'Software Development Engineer - Intern' });
  if (!existingOpp) {
    await Opportunity.create({
      title: 'Software Development Engineer - Intern',
      type: 'internship',
      company: 'Amazon India',
      location: 'Bangalore (Hybrid)',
      deadline: new Date(Date.now() + 864000000),
      description: 'Join the Core Logistics team building scalable TypeScript microservices.',
      requirements: ['Java', 'TypeScript', 'SQL'],
      application_link: 'https://amazon.jobs',
      status: 'APPROVED',
      isActive: true,
      createdBy: facultyUser._id,
      createdByRole: 'faculty',
      approvedBy: faculty._id,
      approvedAt: new Date(),
    });
  }

  // Posts (feed) — replace empty feed only if none exist from this faculty
  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    await Post.insertMany([
      {
        author: {
          _id: facultyUser._id,
          name: `${faculty.firstname} ${faculty.lastName}`,
          designation: faculty.designation,
          department: faculty.department,
          userType: 'faculty',
        },
        content:
          'CDC ANNOUNCEMENT: Microsoft Winter Internship Drive 2026 is open for CS/IT 3rd Year students. CGPA cutoff 8.5+. Apply by Monday evening.',
        scope: 'campus',
        likes: [],
        comments: [],
        images: [],
      },
      {
        author: {
          _id: facultyUser._id,
          name: `${faculty.firstname} ${faculty.lastName}`,
          designation: faculty.designation,
          department: faculty.department,
          userType: 'faculty',
        },
        content:
          'Congratulations to CSE students who won 1st Prize in the Inter-College Web3 Hackathon at IIT Indore! Super proud of your innovation.',
        scope: 'department',
        visibleToDepartments: ['CSE'],
        likes: [],
        comments: [],
        images: [],
      },
      {
        author: {
          _id: facultyUser._id,
          name: `${faculty.firstname} ${faculty.lastName}`,
          designation: faculty.designation,
          department: faculty.department,
          userType: 'faculty',
        },
        content:
          'Reminder: Final year project abstracts are due this Friday. Upload on AcroIn under Projects and request faculty verification.',
        scope: 'campus',
        likes: [],
        comments: [],
        images: [],
      },
    ]);
  }

  const summary = {
    users: await User.countDocuments(),
    students: await Student.countDocuments(),
    faculties: await Faculty.countDocuments(),
    posts: await Post.countDocuments(),
    opportunities: await Opportunity.countDocuments(),
    loginWith: [
      { email: 'lavishjnagid682@gmail.com', password: DEMO_PASSWORD },
      { email: 'lavishjangid230719@acropolis.in', password: DEMO_PASSWORD },
      { email: 'sandeep.sharma@acropolis.in', password: DEMO_PASSWORD, role: 'faculty' },
    ],
  };

  console.log(JSON.stringify({ success: true, summary }, null, 2));
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
