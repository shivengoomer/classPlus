import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/user.model';
import { env } from './config/env';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  const admins = await User.find({ role: 'Admin' });
  console.log("=== ADMINS IN DATABASE ===");
  admins.forEach(admin => {
    console.log(JSON.stringify(admin.toObject(), null, 2));
    console.log(`------------------------`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
