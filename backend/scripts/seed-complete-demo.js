import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Faculty from '../models/Faculty.js';
import Project from '../models/Project.js';
import Certificate from '../models/Certificate.js';
import Competition from '../models/Competition.js';
import Internship from '../models/Internship.js';
import Chat from '../models/Chat.js';

dotenv.config();
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/AcroIn';
const DEMO_PASSWORD = process.env.DEMO_SEED_PASSWORD || 'AcroIn@2026';
const departments = ['CSE','AIML','DS','CSIT','CYBER','ECE','EEE','VLSI','ME','CE','IT','IL'];
const firstNames = ['Aarav','Aditya','Akash','Aman','Ananya','Arjun','Ayush','Diya','Isha','Kavya','Karan','Meera','Neha','Nikhil','Pooja','Rahul','Riya','Rohan','Sakshi','Simran'];
const lastNames = ['Sharma','Verma','Patel','Jain','Joshi','Singh','Gupta','Yadav','Mehta','Mishra','Khan','Saxena','Chouhan','Tiwari','Agarwal','Bansal','Soni','Dubey','Rathore','Vyas'];
const facultyFirstNames = ['Sandeep','Priya','Vivek','Neeraj','Pallavi'];
const facultyLastNames = ['Sharma','Verma','Patel','Joshi','Mehta'];
const hash = await bcrypt.hash(DEMO_PASSWORD, 12);

const upsertUser = async ({ email, name, userType, extras = {} }) => User.findOneAndUpdate({ email }, { $set: { email, password: hash, name, userType, ...extras } }, { new: true, upsert: true, setDefaultsOnInsert: true });
const upsertStudent = async (payload) => {
  const student = await Student.findOneAndUpdate({ email: payload.email }, { $set: payload }, { new: true, upsert: true, setDefaultsOnInsert: true });
  await upsertUser({ email: student.email, name: student.name, userType: 'student' });
  return student;
};
const upsertFaculty = async (payload) => {
  const faculty = await Faculty.findOneAndUpdate({ email: payload.email }, { $set: payload }, { new: true, upsert: true, setDefaultsOnInsert: true });
  await upsertUser({ email: faculty.email, name: `${faculty.firstname} ${faculty.lastName}`, userType: 'faculty', extras: { firstname: faculty.firstname, lastName: faculty.lastName, department: faculty.department, designation: faculty.designation, role: faculty.role } });
  return faculty;
};
const upsertByKey = async (Model, filter, payload) => Model.findOneAndUpdate(filter, { $set: payload }, { new: true, upsert: true, setDefaultsOnInsert: true });

const makeStudent = (department, index, globalIndex) => {
  const first = firstNames[(globalIndex - 1) % firstNames.length];
  const last = lastNames[Math.floor((globalIndex - 1) / firstNames.length) % lastNames.length];
  const semester = index % 2 === 0 ? '6th Semester' : '4th Semester';
  return {
    name: `${first} ${last}`, roll: `ACR-${department}-${String(index).padStart(2,'0')}`,
    email: `demo.student.${department.toLowerCase()}.${String(index).padStart(2,'0')}@acropolis.in`,
    department, year: semester === '6th Semester' ? '3rd Year' : '2nd Year', semester,
    phone: `90000${String(10000 + globalIndex).slice(-5)}`, address: 'Indore, Madhya Pradesh', location: 'Indore',
    bio: `Demo student for ${department} department.`, tech_stack: ['JavaScript','Python','SQL'],
    skills: [{ category:'Programming', name:'JavaScript', level:'Intermediate', verified:false, progress:65, endorsements:0 }, { category:'Programming', name:'Python', level:'Intermediate', verified:false, progress:60, endorsements:0 }],
    verificationStatus:'not_verified', faceVerificationStatus:'none', password:hash, profileCompleteness:55,
  };
};
const makeFaculty = (department, index) => {
  const isDeptAdmin = department === 'CSE' && index === 1;
  return {
    firstname: facultyFirstNames[index-1], lastName: facultyLastNames[index-1], email:`demo.faculty.${department.toLowerCase()}.${index}@acropolis.in`,
    department, designation:isDeptAdmin ? 'Department Administrator' : 'Assistant Professor', qualification:'M.Tech', experience:5+index,
    subjects:['Core Subjects','Project Guidance'], skills:['Teaching','Mentoring'], techstacks:['Python','SQL'],
    phone:`91000${String(20000 + departments.indexOf(department)*5 + index).slice(-5)}`, role:isDeptAdmin ? ['faculty','dept_admin'] : ['faculty'], password:hash,
  };
};

try {
  await mongoose.connect(mongoUri);
  const students = [];
  const facultyByDepartment = new Map();
  let globalIndex = 0;

  for (const department of departments) {
    const deptFaculty = [];
    for (let i=1; i<=5; i++) deptFaculty.push(await upsertFaculty(makeFaculty(department,i)));
    facultyByDepartment.set(department, deptFaculty);
    for (let i=1; i<=10; i++) { globalIndex += 1; students.push(await upsertStudent(makeStudent(department,i,globalIndex))); }
  }

  // Give every demo student one record on each student profile page.
  for (const student of students) {
    await upsertByKey(Project, { student: student._id, title: `AcroIn ${student.department} Project` }, {
      title:`AcroIn ${student.department} Project`, description:`Demo portfolio project for ${student.name}.`, technologies:['React','Node.js','MongoDB'], github_link:'https://github.com/anshxp/AcroIn', student:student._id,
    });
    await upsertByKey(Certificate, { student: student._id, title: `Professional ${student.department} Certificate` }, {
      title:`Professional ${student.department} Certificate`, organization:'AcroIn Demo Academy', issue_date:'2026-08-15', certificate_link:'https://github.com/anshxp/AcroIn', student:student._id, verified:true,
    });
    await upsertByKey(Competition, { student: student._id, name:`AcroIn ${student.department} Hackathon` }, {
      name:`AcroIn ${student.department} Hackathon`, organizer:'AcroIn Demo Events', date:new Date('2026-10-15'), application_link:'https://github.com/anshxp/AcroIn', location:'Indore', student:student._id,
    });
    await upsertByKey(Internship, { student: student._id, company:'AcroIn Demo Labs', position:'Software Engineering Intern' }, {
      company:'AcroIn Demo Labs', position:'Software Engineering Intern', duration:'3 months', description:`Demo internship record for ${student.name}.`, application_link:'https://github.com/anshxp/AcroIn', location:'Indore / Hybrid', student:student._id,
    });

    const user = await User.findOne({ email: student.email }).select('_id');
    const deptFaculty = facultyByDepartment.get(student.department) || [];
    const faculty = deptFaculty[0];
    const facultyUser = faculty ? await User.findOne({ email: faculty.email }).select('_id') : null;
    if (user && facultyUser) {
      await upsertByKey(Chat, { participants: { $all:[user._id, facultyUser._id] }, messageType:'STUDENT_TO_FACULTY' }, {
        participants:[user._id, facultyUser._id], messageType:'STUDENT_TO_FACULTY', isActive:true,
        messages:[{ sender:facultyUser._id, content:`Hello ${student.name}. This is your demo faculty conversation.`, senderRole:'faculty', tag:'GENERAL', createdAt:new Date() }],
      });
    }
  }

  const counts = {
    students: await Student.countDocuments({ email:/^demo\.student\./ }),
    faculty: await Faculty.countDocuments({ email:/^demo\.faculty\./ }),
    users: await User.countDocuments({ email:/^demo\.(student|faculty)\./ }),
    projects: await Project.countDocuments({ title:/^AcroIn .* Project$/ }),
    certificates: await Certificate.countDocuments({ organization:'AcroIn Demo Academy' }),
    competitions: await Competition.countDocuments({ organizer:'AcroIn Demo Events' }),
    internships: await Internship.countDocuments({ company:'AcroIn Demo Labs' }),
    chats: await Chat.countDocuments({ messageType:'STUDENT_TO_FACULTY' }),
  };
  console.log(JSON.stringify({ success:true, counts, departmentalAdmin:'demo.faculty.cse.1@acropolis.in', password:DEMO_PASSWORD }, null, 2));
} catch (error) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
