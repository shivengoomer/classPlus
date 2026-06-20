// src/queues/plagiarism.queue.ts
// BullMQ queue for background plagiarism and similarity checks of submissions

import { Queue } from 'bullmq';
import { getRedisOptions } from '../config/redis';
import { log } from '../utils/logger';

const connection = getRedisOptions();

export const plagiarismQueue = new Queue('plagiarism-check', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Add a new plagiarism job to the queue
export async function addPlagiarismJob(submissionId: string) {
  log(`Adding submission ${submissionId} to the plagiarism check queue`);
  await plagiarismQueue.add(
    'check-plagiarism',
    { submissionId },
    { jobId: submissionId }
  );
}
