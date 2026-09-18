import 'dotenv/config';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is required');
const topics = ['Research collaboration opportunity', 'Department seminar update', 'Project showcase', 'Academic workshop announcement', 'Student achievement', 'Faculty guidance session', 'Hackathon preparation', 'Technical discussion session', 'Open source contribution drive', 'Innovation club update'];
const buildContent = (index) => `[DEMO POST ${String(index + 1).padStart(3, '0')}] ${topics[index % topics.length]}. This is seeded demonstration content for the AcroIn home feed. Students can open the post owner profile from the author name.`;

try {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({ userType: 'faculty' }).select('_id name email designation department').lean();
  if (!users.length) throw new Error('No faculty users found. Create faculty accounts before seeding posts.');
  const facultyByEmail = new Map((await Faculty.find({ email: { $in: users.map((user) => user.email).filter(Boolean) } }).select('_id email department profilepic').lean()).map((faculty) => [faculty.email, faculty]));
  await Post.deleteMany({ content: /^\[DEMO POST \d{3}\]/ });

  const posts = Array.from({ length: 100 }, (_, index) => {
    const user = users[index % users.length];
    const faculty = user.email ? facultyByEmail.get(user.email) : null;
    return {
      author: {
        _id: user._id,
        profileId: faculty?._id || null,
        name: user.name || 'Faculty',
        designation: user.designation || 'Faculty',
        department: faculty?.department || user.department || 'Acropolis Institute',
        profileImage: faculty?.profilepic || undefined,
        userType: 'faculty',
      },
      content: buildContent(index), images: [], likes: [], comments: [], scope: 'campus', visibleToDepartments: [],
    };
  });
  await Post.insertMany(posts);
  console.log(`Seeded ${posts.length} demo posts.`);
} finally {
  await mongoose.disconnect();
}
