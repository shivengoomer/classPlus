// src/workers/plagiarism.worker.ts
// Worker handles plagiarism check (similarity check) in the background

import { Worker, Job } from 'bullmq';
import { getRedisOptions } from '../config/redis';
import { StudentSubmission } from '../models/studentSubmission.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { log, logError } from '../utils/logger';

// Clean text and calculate cosine similarity based on word frequency
export function calculateCosineSimilarity(str1: string, str2: string): number {
  const clean1 = (str1 || '').trim().toLowerCase();
  const clean2 = (str2 || '').trim().toLowerCase();
  if (!clean1 || !clean2) return 0;

  const getWords = (str: string) => {
    return str
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0);
  };
  
  const words1 = getWords(clean1);
  const words2 = getWords(clean2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const freqMap1: Record<string, number> = {};
  const freqMap2: Record<string, number> = {};
  const allWords = new Set<string>();
  
  for (const w of words1) {
    freqMap1[w] = (freqMap1[w] || 0) + 1;
    allWords.add(w);
  }
  
  for (const w of words2) {
    freqMap2[w] = (freqMap2[w] || 0) + 1;
    allWords.add(w);
  }
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (const w of allWords) {
    const val1 = freqMap1[w] || 0;
    const val2 = freqMap2[w] || 0;
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

interface PlagiarismJobData {
  submissionId: string;
}

async function processPlagiarismCheck(job: Job<PlagiarismJobData>) {
  const { submissionId } = job.data;
  log(`Plagiarism worker checking submission: ${submissionId}`);

  try {
    const submission = await StudentSubmission.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    const assigned = await AssignedAssignment.findById(submission.assignedAssignmentId)
      .populate<{ assignmentId: any }>('assignmentId');

    if (!assigned || !assigned.assignmentId) {
      throw new Error(`AssignedAssignment or Assignment not found for submission ${submissionId}`);
    }

    const assignment = assigned.assignmentId;
    if (!assignment.result || !assignment.result.sections) {
      log(`No assignment sections found. Skipping plagiarism check.`);
      return;
    }

    // Build set of descriptive question IDs (short/long answers)
    const descriptiveQuestionIds = new Set<string>();
    for (const section of assignment.result.sections) {
      for (const q of section.questions) {
        if (['short', 'long'].includes(q.type)) {
          descriptiveQuestionIds.add(q.id);
        }
      }
    }

    if (descriptiveQuestionIds.size === 0) {
      log(`No descriptive questions in assignment. Skipping plagiarism check.`);
      return;
    }

    // Find other submissions for the same assignment that are graded or grading
    const otherSubmissions = await StudentSubmission.find({
      assignedAssignmentId: submission.assignedAssignmentId,
      _id: { $ne: submission._id }
    });

    let maxSimilarity = 0;
    const flaggedWith = new Set<string>();
    const SIMILARITY_THRESHOLD = 0.8; // 80% similarity threshold

    for (const other of otherSubmissions) {
      let otherMaxSim = 0;
      let comparedCount = 0;

      for (const currentAns of submission.answers) {
        if (!descriptiveQuestionIds.has(currentAns.questionId)) continue;
        
        const otherAns = other.answers.find(a => a.questionId === currentAns.questionId);
        if (!otherAns || !otherAns.answer) continue;

        const sim = calculateCosineSimilarity(currentAns.answer, otherAns.answer);
        comparedCount++;
        if (sim > otherMaxSim) {
          otherMaxSim = sim;
        }
      }

      if (comparedCount > 0) {
        if (otherMaxSim > maxSimilarity) {
          maxSimilarity = otherMaxSim;
        }
        if (otherMaxSim >= SIMILARITY_THRESHOLD) {
          flaggedWith.add(other._id.toString());

          // Update other submission symmetrically
          let otherUpdated = false;
          if (!other.similarityFlaggedWith) {
            other.similarityFlaggedWith = [];
          }
          const otherFlaggedWith = other.similarityFlaggedWith!;
          const otherFlaggedIds = otherFlaggedWith.map(id => id.toString());
          if (!otherFlaggedIds.includes(submission._id.toString())) {
            otherFlaggedWith.push(submission._id as any);
            otherUpdated = true;
          }
          if (other.similarityScore === undefined || otherMaxSim > (other.similarityScore || 0)) {
            other.similarityScore = otherMaxSim;
            otherUpdated = true;
          }
          if (otherUpdated) {
            await other.save();
          }
        }
      }
    }

    submission.similarityScore = maxSimilarity;
    submission.similarityFlaggedWith = Array.from(flaggedWith).map(id => id as any);
    await submission.save();

    log(`Plagiarism check completed for submission ${submissionId}. Max similarity: ${maxSimilarity.toFixed(2)}. Flagged with ${flaggedWith.size} submissions.`);

  } catch (error) {
    logError(`Plagiarism check job ${submissionId} failed`, error);
    throw error;
  }
}

export function startPlagiarismWorker() {
  const connection = getRedisOptions();
  const worker = new Worker('plagiarism-check', processPlagiarismCheck, {
    connection,
    concurrency: 2,
  });

  worker.on('completed', (job) => {
    log(`Plagiarism job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logError(`Plagiarism job ${job?.id} failed`, err);
  });

  log('Plagiarism worker started and listening');
  return worker;
}
