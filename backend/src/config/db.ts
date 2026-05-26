// src/config/db.ts
// connects to MongoDB Atlas using mongoose

import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}
