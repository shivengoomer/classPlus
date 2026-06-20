// src/workers/grading.worker.ts
// Worker handles student submission AI grading in the background
// Processes grading tasks from BullMQ queue

import { Worker, Job } from 'bullmq';
import Groq from 'groq-sdk';
import { getRedisOptions } from '../config/redis';
import { StudentSubmission } from '../models/studentSubmission.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { Assignment } from '../models/assignment.model';
import { User } from '../models/user.model';
import { env } from '../config/env';
import { broadcastToJob } from '../websocket/socket';
import { log, logError } from '../utils/logger';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

interface GradingJobData {
  submissionId: string;
}

async function processGrading(job: Job<GradingJobData>) {
  const { submissionId } = job.data;
  log(`Grading worker processing submission: ${submissionId}`);

  try {
    const submission = await StudentSubmission.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Set status to grading
    submission.status = 'grading';
    await submission.save();

    const assigned = await AssignedAssignment.findById(submission.assignedAssignmentId)
      .populate<{ assignmentId: any }>('assignmentId');

    if (!assigned) {
      throw new Error(`AssignedAssignment ${submission.assignedAssignmentId} not found`);
    }

    const assignment = assigned.assignmentId;
    if (!assignment || !assignment.result) {
      throw new Error('Assignment results/sections not generated yet');
    }

    // Load teacher profile settings for customized AI grading rules
    const teacher = await User.findOne({ clerkId: assignment.userId });
    let gradingGuidelines = '';
    if (teacher) {
      gradingGuidelines += '\nFollow these teacher-configured evaluation directives:';
      if (teacher.aiStrictNCERT) {
        gradingGuidelines += '\n- Evaluate strictly based on the CBSE/NCERT curriculum alignment.';
      }
      if (teacher.aiIgnoreHandwriting) {
        gradingGuidelines += '\n- Ignore handwriting legibility, neatness, or style formats.';
      }
      if (teacher.aiStrictSpelling) {
        gradingGuidelines += '\n- Deduct 0.5 marks for spelling errors or grammatical mistakes.';
      }
      if (teacher.aiPartialFormulas) {
        gradingGuidelines += '\n- Award partial credit if the student provides correct formulas or steps, even if the final calculation is incorrect.';
      }
      if (teacher.aiCustomDirectives && teacher.aiCustomDirectives.length > 0) {
        teacher.aiCustomDirectives.forEach(rule => {
          gradingGuidelines += `\n- ${rule}`;
        });
      }
    }

    // Build lookup maps
    const answerKeyMap: Record<string, string> = {};
    const questionMap: Record<string, any> = {};

    for (const section of assignment.result.sections) {
      for (const q of section.questions) {
        questionMap[q.id] = q;
      }
    }
    for (const ak of assignment.result.answerKey || []) {
      answerKeyMap[ak.questionId] = ak.answer;
    }

    const totalMarks = assignment.result.totalMarks || 0;
    const gradedAnswers: any[] = [];

    // Grade each student answer sequentially to respect Groq API rate limits
    for (const ans of submission.answers) {
      const question = questionMap[ans.questionId];
      const correctAnswer = answerKeyMap[ans.questionId] || '';

      if (!question) {
        gradedAnswers.push({
          questionId: ans.questionId,
          answer: ans.answer,
          isCorrect: false,
          marks: 0,
          aiFeedback: 'Question not found.'
        });
        continue;
      }

      const studentAnswer = (ans.answer || '').trim();
      const qMarks = question.marks || 1;

      // MCQ / True-False / Fill-in-blank: exact match (case-insensitive)
      if (['mcq', 'truefalse', 'fillblank'].includes(question.type)) {
        const isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
        gradedAnswers.push({
          questionId: ans.questionId,
          answer: studentAnswer,
          isCorrect,
          marks: isCorrect ? qMarks : 0,
          aiFeedback: isCorrect
            ? `✅ Correct! ${correctAnswer}`
            : `❌ Incorrect. The correct answer was: ${correctAnswer}`,
        });
        continue;
      }

      // Short/Long answer: use Groq AI to grade
      if (!studentAnswer) {
        gradedAnswers.push({
          questionId: ans.questionId,
          answer: '',
          isCorrect: false,
          marks: 0,
          aiFeedback: 'No answer provided.',
        });
        continue;
      }

      try {
        const gradingPrompt = `You are a CBSE/NCERT teacher grading a student answer. Respond ONLY with JSON.

Question: "${question.text}"
Model Answer: "${correctAnswer}"
Student Answer: "${studentAnswer}"
Maximum Marks: ${qMarks}
${gradingGuidelines ? `\nTeacher Grading Directives:${gradingGuidelines}\n` : ''}
Grade the student answer strictly based on accuracy, completeness, and curriculum alignment.
Return JSON:
{
  "marks": <number between 0 and ${qMarks}>,
  "isCorrect": <true if marks >= ${Math.ceil(qMarks * 0.5)}>,
  "feedback": "<2-3 sentence constructive feedback explaining what was right, what was missing, and how to improve>"
}`;

        const response = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a strict CBSE/NCERT exam grader. Respond ONLY with valid JSON.' },
            { role: 'user', content: gradingPrompt },
          ],
          temperature: 0.1,
          max_tokens: 200,
        });

        const raw = response.choices[0]?.message?.content || '{}';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const grading = jsonMatch ? JSON.parse(jsonMatch[0]) : { marks: 0, isCorrect: false, feedback: '' };

        gradedAnswers.push({
          questionId: ans.questionId,
          answer: studentAnswer,
          isCorrect: grading.isCorrect || false,
          marks: Math.min(Math.max(grading.marks || 0, 0), qMarks),
          aiFeedback: grading.feedback || 'Answer reviewed.',
        });

        // Add a small sequential sleep delay (e.g. 200ms) to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (aiErr) {
        logError(`AI grading failed for question ${ans.questionId} in submission ${submissionId}`, aiErr);
        // Fallback: keyword-based partial credit
        const keywords = correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const studentWords = studentAnswer.toLowerCase();
        const matches = keywords.filter(k => studentWords.includes(k)).length;
        const ratio = keywords.length > 0 ? matches / keywords.length : 0;
        const marks = Math.round(ratio * qMarks);
        
        gradedAnswers.push({
          questionId: ans.questionId,
          answer: studentAnswer,
          isCorrect: ratio >= 0.5,
          marks,
          aiFeedback: `Answer partially reviewed (Fallback). Correct: ${correctAnswer.slice(0, 100)}...`,
        });
      }
    }

    const totalScore = gradedAnswers.reduce((sum, a) => sum + (a.marks || 0), 0);

    // Save final graded submission details
    submission.answers = gradedAnswers;
    submission.totalScore = totalScore;
    submission.totalMarks = totalMarks;
    submission.status = 'graded';
    await submission.save();

    log(`Submission ${submissionId} successfully graded. Score: ${totalScore}/${totalMarks}`);

    // Broadcast WebSocket notification to clients subscribed to submissionId
    broadcastToJob(submissionId, {
      type: 'grading:done',
      status: 'graded',
      submissionId,
      totalScore,
      totalMarks,
    });

    // Enqueue background plagiarism check
    try {
      const { addPlagiarismJob } = require('../queues/plagiarism.queue');
      await addPlagiarismJob(submissionId);
    } catch (plagErr) {
      logError(`Failed to queue plagiarism check for ${submissionId}`, plagErr);
    }

    // Trigger spaced repetition Concept Review checks if a registered student
    if (submission.studentId) {
      try {
        const { checkAndCreateReviewItems } = require('../services/review.service');
        await checkAndCreateReviewItems(submission.studentId.toString());
      } catch (revErr) {
        logError(`Failed to trigger spaced repetition for student ${submission.studentId}`, revErr);
      }
    }

  } catch (error: any) {
    logError(`Grading worker job ${submissionId} failed`, error);

    try {
      await StudentSubmission.findByIdAndUpdate(submissionId, { status: 'failed' });
    } catch (dbErr) {
      logError('Failed to update submission status to failed', dbErr);
    }

    broadcastToJob(submissionId, {
      type: 'grading:failed',
      status: 'failed',
      submissionId,
      error: error.message || 'Failed to grade submission',
    });

    throw error;
  }
}

export function startGradingWorker() {
  const connection = getRedisOptions();

  const worker = new Worker('student-grading', processGrading, {
    connection,
    concurrency: 2, // process up to 2 submissions in parallel, sequential within submission
  });

  worker.on('completed', (job) => {
    log(`Grading job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logError(`Grading job ${job?.id} failed`, err);
  });

  log('AI Grading worker started and listening for submissions');

  return worker;
}
