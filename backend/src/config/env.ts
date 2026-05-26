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
  console.log('✅ Environment variables loaded');
}
