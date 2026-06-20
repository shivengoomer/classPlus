// src/queues/grading.queue.ts
// BullMQ queue for background AI grading of student submissions

import { Queue } from 'bullmq';
import { getRedisOptions } from '../config/redis';
import { log } from '../utils/logger';

const connection = getRedisOptions();

export const gradingQueue = new Queue('student-grading', {
  connection,
  defaultJobOptions: {
    attempts: 3, // retry up to 2 times (3 total attempts) if Groq fails
    backoff: {
      type: 'exponential',
      delay: 5000, // wait 5 seconds before retrying to respect Groq rate limits
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Add a new grading job to the queue
export async function addGradingJob(submissionId: string) {
  log(`Adding submission ${submissionId} to the AI grading queue`);
  await gradingQueue.add(
    'grade-submission', // job name
    { submissionId }, // job data
    { jobId: submissionId } // use submissionId as the BullMQ job ID
  );
}
