const axios = require('axios');

const API = 'http://localhost:5000/api';

async function seed() {
  // Create Student
  const studentRes = await axios.post(`${API}/students`, {
    name: 'Alice Johnson',
    roll: 'S1001',
    email: 'alice@college.edu',
    department: 'CSE',
    tech_stack: ['React', 'Node.js'],
    password: 'password123'
  });
  const student = studentRes.data;
  console.log('Student:', student);

  // Create Faculty
  const facultyRes = await axios.post(`${API}/faculty`, {
    firstname: 'Dr.',
    lastName: 'Smith',
    email: 'drsmith@college.edu',
    department: 'CSE',
    designation: 'Professor',
    qualification: 'PhD',
    experience: 10,
    phone: '1234567890',
    password: 'faculty123'
  });
  const faculty = facultyRes.data;
  console.log('Faculty:', faculty);

  // Create Certificate
  const certRes = await axios.post(`${API}/students/${student._id}/certificates`, {
    title: 'React Developer',
    organization: 'Meta',
    issue_date: '2026-03-30',
    certificate_link: 'https://certs.meta.com/react',
    student: student._id
  });
  console.log('Certificate:', certRes.data);

  // Create Internship
  const internRes = await axios.post(`${API}/internships`, {
    company: 'Tech Corp',
    position: 'Intern',
    duration: '3 months',
    student: student._id
  });
  console.log('Internship:', internRes.data);

  // Create Competition
  const compRes = await axios.post(`${API}/competitions`, {
    name: 'Hackathon 2026',
    organizer: 'Tech Club',
    date: '2026-04-15',
    student: student._id
  });
  console.log('Competition:', compRes.data);
}

seed().catch(err => {
  if (err.response) {
    console.error('Error:', err.response.data);
  } else {
    console.error(err);
  }
});
