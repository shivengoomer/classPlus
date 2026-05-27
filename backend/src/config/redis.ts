// src/config/redis.ts
// creates a shared redis connection config for BullMQ

import { env } from './env';

// BullMQ needs a redis connection object, not a client instance
// we just export the connection options so queues and workers can use them
export const redisConnection = {
  url: env.REDIS_URL,
};

// helper to parse the redis URL into host/port for BullMQ
export function getRedisOptions() {
  const url = new URL(env.REDIS_URL);
  const options: any = {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    password: url.password || undefined,
    maxRetriesPerRequest: null,
  };

  // Upstash and other production Redis hosts using rediss:// require TLS configuration
  if (url.protocol === 'rediss:') {
    options.tls = {};
  }

  return options;
}
