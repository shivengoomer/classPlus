// src/config/env.ts
// loads and validates environment variables at startup

import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN || '',
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  ADMIN_SETUP_TOKEN: process.env.ADMIN_SETUP_TOKEN || 'classPlus_erp_admin_secret_9988',
};

// basic check so we don't start with missing config
export function validateEnv() {
  if (!env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is required in .env');
    process.exit(1);
  }
  if (!env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is required in .env');
    process.exit(1);
  }
  if (!env.CLERK_PUBLISHABLE_KEY || !env.CLERK_SECRET_KEY) {
    console.warn('⚠️  CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is missing in .env. Clerk Auth will require these variables.');
  }
  console.log('✅ Environment variables loaded');
}
