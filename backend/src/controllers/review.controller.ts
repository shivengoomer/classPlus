// src/controllers/review.controller.ts
import { Request, Response } from 'express';
import { ReviewItem } from '../models/reviewItem.model';
import { StudentCredential } from '../models/studentCredential.model';
import Groq from 'groq-sdk';
import { env } from '../config/env';
import { log, logError } from '../utils/logger';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// GET /api/student/reviews/due
export async function listDueReviews(req: Request, res: Response) {
  try {
    const studentId = (req as any).student?.studentId;
    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const now = new Date();
    const reviews = await ReviewItem.find({
      studentId,
      nextReviewDate: { $lte: now },
    }).sort({ nextReviewDate: 1 });

    return res.json(reviews);
  } catch (err) {
    logError('listDueReviews failed', err);
    return res.status(500).json({ error: 'Failed to fetch review queue.' });
  }
}

// POST /api/student/reviews/:reviewId/generate
export async function generateReviewQuestion(req: Request, res: Response) {
  try {
    const studentId = (req as any).student?.studentId;
    const { reviewId } = req.params;

    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const review = await ReviewItem.findOne({ _id: reviewId, studentId });
    if (!review) {
      return res.status(404).json({ error: 'Review item not found.' });
    }

    const student = await StudentCredential.findById(studentId);
    const groups = student ? student.groupIds : [];
    // We can guess grade/subject from student profile or default to general science
    const subject = 'General Science';
    const grade = 'Class 8';

    const prompt = `You are a CBSE and NCERT syllabus learning coach.
Generate ONE high-quality review question testing the concept tag: "${review.conceptTag}" at a suitable difficulty.
Select a type of question (mcq, short, truefalse, or fillblank).

Return a JSON object in EXACTLY the following structure. Do not wrap in markdown or include extra text:
{
  "text": "Question text here...",
  "type": "mcq", // 'mcq', 'short', 'truefalse', 'fillblank'
  "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY for mcq, omit/leave empty for others
  "correctAnswer": "Option A or correct answer value",
  "explanation": "Brief explanation of the correct answer according to NCERT concepts."
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an educational AI assistant that responds ONLY with valid, raw JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response JSON');
    }

    const question = JSON.parse(jsonMatch[0]);

    return res.json({
      reviewId: review._id,
      conceptTag: review.conceptTag,
      question,
    });
  } catch (err) {
    logError('generateReviewQuestion failed', err);
    return res.status(500).json({ error: 'Failed to generate review question.' });
  }
}

// POST /api/student/reviews/:reviewId/submit
// body: { answer, question }
export async function submitReview(req: Request, res: Response) {
  try {
    const studentId = (req as any).student?.studentId;
    const { reviewId } = req.params;
    const { answer, question } = req.body;

    if (!studentId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!answer || !question) {
      return res.status(400).json({ error: 'answer and question details are required.' });
    }

    const review = await ReviewItem.findOne({ _id: reviewId, studentId });
    if (!review) {
      return res.status(404).json({ error: 'Review item not found.' });
    }

    const studentAnswer = (answer || '').trim();
    const correctAnswer = (question.correctAnswer || '').trim();
    let isCorrect = false;
    let aiFeedback = '';

    // 1. Grade the answer
    if (['mcq', 'truefalse', 'fillblank'].includes(question.type)) {
      isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
      aiFeedback = isCorrect ? 'Correct!' : `Incorrect. Correct answer: ${correctAnswer}`;
    } else {
      // Short Answer grading via Groq (very fast, low temp)
      try {
        const gradingPrompt = `You are a CBSE teacher grading a practice short answer. Respond ONLY with JSON.
Question: "${question.text}"
Correct Answer Reference: "${correctAnswer}"
Student Answer: "${studentAnswer}"

Grade the answer. Return JSON:
{
  "isCorrect": <true or false>,
  "feedback": "<1-2 sentence quick feedback>"
}`;

        const response = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a strict exam grader. Respond ONLY with valid JSON.' },
            { role: 'user', content: gradingPrompt }
          ],
          temperature: 0.1,
          max_tokens: 150,
        });

        const raw = response.choices[0]?.message?.content || '{}';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const grading = jsonMatch ? JSON.parse(jsonMatch[0]) : { isCorrect: false, feedback: '' };

        isCorrect = grading.isCorrect || false;
        aiFeedback = grading.feedback || 'Answer reviewed.';
      } catch (gradErr) {
        logError('Review AI grading failed', gradErr);
        isCorrect = studentAnswer.toLowerCase().includes(correctAnswer.toLowerCase());
        aiFeedback = 'Graded via backup match.';
      }
    }

    // 2. SM-2 Algorithm computation
    const q = isCorrect ? 5 : 1; // Quality 5 for correct, 1 for incorrect
    let { easeFactor, interval, repetitions } = review;

    if (q >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Save review updates
    review.easeFactor = easeFactor;
    review.interval = interval;
    review.repetitions = repetitions;
    review.nextReviewDate = nextReviewDate;
    await review.save();

    log(`Spaced repetition item for student ${studentId} concept "${review.conceptTag}" updated: interval=${interval}, nextReview=${nextReviewDate.toDateString()}`);

    return res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      aiFeedback,
      nextReviewDate,
    });
  } catch (err) {
    logError('submitReview failed', err);
    return res.status(500).json({ error: 'Failed to submit review answer.' });
  }
}
