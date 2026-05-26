// src/queues/assignment.queue.ts
// BullMQ queue for background assignment generation

import { Queue } from 'bullmq';
import { getRedisOptions } from '../config/redis';
import { log } from '../utils/logger';

const connection = getRedisOptions();

export const assignmentQueue = new Queue('assignment-generation', {
  connection,
  defaultJobOptions: {
    attempts: 2, // retry once if it fails
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// add a new assignment job to the queue
export async function addAssignmentJob(assignmentId: string, jobId: string) {
  log(`Adding job ${jobId} for assignment ${assignmentId} to queue`);

  await assignmentQueue.add(
    'generate', // job name
    { assignmentId, jobId }, // job data
    { jobId } // use our jobId as the BullMQ job ID
  );
}
