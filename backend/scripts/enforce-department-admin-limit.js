import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';

dotenv.config();

const normalize = (value) => String(value || '').trim().toLowerCase();

const run = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGO_URI or MONGODB_URI is required');

  await mongoose.connect(mongoUri);

  const admins = await Faculty.find({ role: 'dept_admin' }).sort({ createdAt: 1 });
  const byDepartment = new Map();
  for (const faculty of admins) {
    const key = normalize(faculty.department);
    if (!key) continue;
    if (!byDepartment.has(key)) byDepartment.set(key, []);
    byDepartment.get(key).push(faculty);
  }

  let demoted = 0;
  for (const [department, departmentAdmins] of byDepartment.entries()) {
    if (departmentAdmins.length <= 1) continue;

    const keeper = departmentAdmins[0];
    console.log(`Keeping ${keeper.email} as ${keeper.department} departmental admin.`);

    for (const duplicate of departmentAdmins.slice(1)) {
      duplicate.role = (duplicate.role || []).filter((role) => role !== 'dept_admin');
      if (!duplicate.role.includes('faculty')) duplicate.role.push('faculty');
      await duplicate.save();

      await User.updateOne(
        { email: duplicate.email },
        { $set: { role: ['faculty'], userType: 'faculty' } },
      );

      demoted += 1;
      console.log(`Demoted duplicate ${duplicate.email} in ${department} to faculty.`);
    }
  }

  console.log(`Department admin cleanup complete. Demoted ${demoted} duplicate account(s).`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
