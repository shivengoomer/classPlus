// src/utils/logger.ts
// simple console logger with timestamps, nothing fancy

export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

export function logError(message: string, error?: unknown) {
  console.error(`[${new Date().toISOString()}] ❌ ${message}`, error || '');
}
