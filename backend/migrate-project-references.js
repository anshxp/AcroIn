import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Student from './models/Student.js';
import Project from './models/Project.js';
import Internship from './models/Internship.js';
import Certificate from './models/Certificate.js';
import Competition from './models/Competition.js';

dotenv.config();

async function migrateReferences() {
  try {
    console.log('Starting migration to populate student references...');

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/AcroIn';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    console.log('Migrating projects...');
    const projects = await Project.find({ student: { $ne: null } });
    for (const project of projects) {
      await Student.findByIdAndUpdate(
        project.student,
        { $addToSet: { projects: project._id } },
        { new: true }
      );
    }
    console.log(`Migrated ${projects.length} projects`);

    console.log('Migrating internships...');
    const internships = await Internship.find({ student: { $ne: null } });
    for (const internship of internships) {
      await Student.findByIdAndUpdate(
        internship.student,
        { $addToSet: { internships: internship._id } },
        { new: true }
      );
    }
    console.log(`Migrated ${internships.length} internships`);

    console.log('Migrating certificates...');
    const certificates = await Certificate.find({ student: { $ne: null } });
    for (const certificate of certificates) {
      await Student.findByIdAndUpdate(
        certificate.student,
        { $addToSet: { certificates: certificate._id } },
        { new: true }
      );
    }
    console.log(`Migrated ${certificates.length} certificates`);

    console.log('Migrating competitions...');
    const competitions = await Competition.find({ student: { $ne: null } });
    for (const competition of competitions) {
      await Student.findByIdAndUpdate(
        competition.student,
        { $addToSet: { competitions: competition._id } },
        { new: true }
      );
    }
    console.log(`Migrated ${competitions.length} competitions`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateReferences();
