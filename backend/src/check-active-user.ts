import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/user.model';
import { StudentCredential } from './models/studentCredential.model';
import { env } from './config/env';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  
  // Find the most recently updated teacher user
  const latestTeacher = await User.findOne({}).sort({ updatedAt: -1 });
  if (!latestTeacher) {
    console.log('No teachers found in the DB.');
    await mongoose.disconnect();
    return;
  }
  
  console.log(`LATEST ACTIVE TEACHER:`);
  console.log(`  Name: ${latestTeacher.firstName} ${latestTeacher.lastName}`);
  console.log(`  Email: ${latestTeacher.email}`);
  console.log(`  Clerk ID: ${latestTeacher.clerkId}`);
  
  // Print student credentials matching this teacher's clerk ID suffix
  const suffix = latestTeacher.clerkId.substring(latestTeacher.clerkId.length - 4);
  console.log(`  Expected student suffix: "${suffix}"`);
  
  const matchingStudents = await StudentCredential.find({
    email: { $regex: `_${suffix}@school.com$` }
  });
  
  console.log(`\nMATCHING SEEDED STUDENTS FOR THIS TEACHER:`);
  matchingStudents.forEach(c => {
    console.log(`  - Name: ${c.studentName}`);
    console.log(`    Email: ${c.email}`);
  });
  
  await mongoose.disconnect();
}

run().catch(console.error);
