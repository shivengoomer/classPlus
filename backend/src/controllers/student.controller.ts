// src/controllers/student.controller.ts
// All student-facing API logic — no Clerk auth required

import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Groq from 'groq-sdk';
import crypto from 'crypto';
import { Group } from '../models/group.model';
import { AssignedAssignment } from '../models/assignedAssignment.model';
import { StudentSubmission } from '../models/studentSubmission.model';
import { Assignment } from '../models/assignment.model';
import { StudentCredential } from '../models/studentCredential.model';
import { StudentPractice } from '../models/studentPractice.model';
import { addGradingJob } from '../queues/grading.queue';
import { env } from '../config/env';
import { log, logError } from '../utils/logger';
import { signStudentToken } from '../utils/jwt';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// POST /api/student/login/verify
// body: { email }
// Checks if student account exists and returns status
export async function verifyStudentSession(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const credential = await StudentCredential.findOne({ email: normalizedEmail });

    if (!credential) {
      return res.json({
        status: 'needs_setup',
        message: 'No account found with this email. Join a class with a Class Code to register.',
      });
    }

    return res.json({
      status: 'needs_passcode',
      message: 'Please enter your 4-digit PIN to access your student portal.',
    });
  } catch (err) {
    logError('verifyStudentSession failed', err);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}

// Helper to fetch consolidated student session details (groups + assignments)
async function fetchStudentSession(credential: any, res: Response, token: string) {
  // Find all groups the student is enrolled in
  const groups = await Group.find({ _id: { $in: credential.groupIds } });

  // Fetch all assigned assignments for all these groups
  const assigned = await AssignedAssignment.find({ groupId: { $in: credential.groupIds } })
    .populate('assignmentId', 'title subject grade totalMarks pdfUrl status')
    .sort({ createdAt: -1 });

  // For each assigned assignment, check if this student has a submission (using their credential ID or roster name)
  const assignedWithStatus = await Promise.all(
    assigned.map(async (a) => {
      const submission = await StudentSubmission.findOne({
        assignedAssignmentId: a._id,
        $or: [
          { studentId: credential._id },
          { studentName: credential.studentName }
        ]
      }).select('totalScore totalMarks submittedAt autoSubmitted');

      return {
        _id: a._id,
        assignment: a.assignmentId,
        groupId: a.groupId,
        dueDate: a.dueDate,
        hintsEnabled: a.hintsEnabled,
        durationMinutes: a.durationMinutes,
        submission: submission || null,
      };
    })
  );

  return res.json({
    studentId: credential._id,
    student: credential.studentName,
    email: credential.email,
    groups: groups.map(g => ({
      _id: g._id,
      name: g.name,
      grade: g.grade,
      subject: g.subject,
      classCode: g.classCode,
    })),
    assignments: assignedWithStatus,
    token,
  });
}

// POST /api/student/register
// body: { classCode, studentName, email, passcode }
// Registers a student with their name, email and secure 4-digit PIN
export async function studentRegister(req: Request, res: Response) {
  try {
    const { classCode, studentName, email, passcode } = req.body;
    if (!classCode || !studentName || !email || !passcode) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (passcode.length !== 4) {
      return res.status(400).json({ error: 'A 4-digit PIN is required.' });
    }

    const group = await Group.findOne({ classCode: classCode.toUpperCase().trim() });
    if (!group) {
      return res.status(404).json({ error: 'Class code not found. Please verify with your teacher.' });
    }

    const normalizedName = studentName.trim();
    if (!group.students.map(s => s.toLowerCase()).includes(normalizedName.toLowerCase())) {
      return res.status(403).json({ error: `Student "${normalizedName}" is not enrolled in this class roster. Ask your teacher to add you.` });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await StudentCredential.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered. Please login directly.' });
    }

    // Salt PIN using email to prevent rainbow table attacks
    const salt = normalizedEmail;
    const hashed = crypto.createHash('sha256').update(passcode + salt).digest('hex');
    
    const credential = await StudentCredential.create({
      studentName: normalizedName,
      email: normalizedEmail,
      groupIds: [group._id],
      hashedPasscode: hashed,
      institutionId: group.institutionId,
    });

    log(`Student registered: ${normalizedName} (${normalizedEmail}) in group ${group.classCode}`);

    const token = signStudentToken({
      studentId: credential._id.toString(),
      email: credential.email,
      studentName: credential.studentName,
      groupIds: [group._id.toString()],
      role: 'Student',
    });

    return await fetchStudentSession(credential, res, token);
  } catch (err) {
    logError('studentRegister failed', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

// POST /api/student/login
// body: { email, passcode }
// Authenticates student using email + PIN
export async function studentLogin(req: Request, res: Response) {
  try {
    const { email, passcode } = req.body;
    if (!email || !passcode) {
      return res.status(400).json({ error: 'Email and passcode are required.' });
    }
    if (passcode.length !== 4) {
      return res.status(400).json({ error: 'A 4-digit PIN is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const credential = await StudentCredential.findOne({ email: normalizedEmail });
    if (!credential) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }

    const salt = normalizedEmail;
    const hashed = crypto.createHash('sha256').update(passcode + salt).digest('hex');
    const unsalted = crypto.createHash('sha256').update(passcode).digest('hex');

    if (credential.hashedPasscode !== hashed && credential.hashedPasscode !== unsalted) {
      return res.status(401).json({ error: 'Incorrect PIN code. Please try again.' });
    }

    // Upgrade existing unsalted hashes to salted ones
    if (credential.hashedPasscode === unsalted) {
      credential.hashedPasscode = hashed;
      await credential.save();
      log(`Upgraded PIN to salted hash for ${normalizedEmail}`);
    }

    const token = signStudentToken({
      studentId: credential._id.toString(),
      email: credential.email,
      studentName: credential.studentName,
      groupIds: credential.groupIds.map(id => id.toString()),
      role: 'Student',
    });

    return await fetchStudentSession(credential, res, token);
  } catch (err) {
    logError('studentLogin failed', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// POST /api/student/join-class
// body: { classCode }
// Enrolls student in an additional class group
export async function joinClassGroup(req: Request, res: Response) {
  try {
    const studentPayload = (req as any).student;
    const { classCode } = req.body;
    if (!classCode) {
      return res.status(400).json({ error: 'Class code is required.' });
    }

    let credential;
    if (studentPayload.studentId) {
      credential = await StudentCredential.findById(studentPayload.studentId);
    }
    if (!credential) {
      credential = await StudentCredential.findOne({ email: studentPayload.email });
    }

    if (!credential) {
      return res.status(404).json({ error: 'Student account not found.' });
    }

    const group = await Group.findOne({ classCode: classCode.toUpperCase().trim() });
    if (!group) {
      return res.status(404).json({ error: 'Class code not found. Please verify with your teacher.' });
    }

    // Verify student is in this group's roster
    if (!group.students.map(s => s.toLowerCase()).includes(credential.studentName.toLowerCase())) {
      return res.status(403).json({ error: `Student "${credential.studentName}" is not enrolled in this class roster. Ask your teacher to add you.` });
    }

    const hasGroup = credential.groupIds.some(id => id.toString() === group._id.toString());
    if (!hasGroup) {
      credential.groupIds.push(group._id as any);
      if (group.institutionId) {
        credential.institutionId = group.institutionId;
      }
      await credential.save();
      log(`Student ${credential.studentName} joined new class ${group.classCode}`);
    } else if (!credential.institutionId && group.institutionId) {
      credential.institutionId = group.institutionId;
      await credential.save();
    }

    const token = signStudentToken({
      studentId: credential._id.toString(),
      email: credential.email,
      studentName: credential.studentName,
      groupIds: credential.groupIds.map(id => id.toString()),
      role: 'Student',
    });

    return await fetchStudentSession(credential, res, token);
  } catch (err) {
    logError('joinClassGroup failed', err);
    return res.status(500).json({ error: 'Failed to join class. Please try again.' });
  }
}

// GET /api/student/session
// Retrieves student details using token
export async function getStudentSession(req: Request, res: Response) {
  try {
    const studentPayload = (req as any).student;
    let credential;
    if (studentPayload.studentId) {
      credential = await StudentCredential.findById(studentPayload.studentId);
    }
    if (!credential) {
      credential = await StudentCredential.findOne({ email: studentPayload.email });
    }

    if (!credential) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const token = signStudentToken({
      studentId: credential._id.toString(),
      email: credential.email,
      studentName: credential.studentName,
      groupIds: credential.groupIds.map(id => id.toString()),
      role: 'Student',
    });

    return await fetchStudentSession(credential, res, token);
  } catch (err) {
    logError('getStudentSession failed', err);
    return res.status(500).json({ error: 'Failed to retrieve session details.' });
  }
}



// GET /api/student/assignment/:assignedId
// Returns questions WITHOUT answer key or correct answers
export async function getStudentAssignment(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const studentName = student.studentName;

    const assigned = await AssignedAssignment.findById(req.params.assignedId)
      .populate<{ assignmentId: any; groupId: any }>('assignmentId groupId');

    if (!assigned) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify student is enrolled in this group/class
    const isEnrolled = student.groupIds.includes(assigned.groupId._id.toString());
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Access denied. You are not enrolled in this class.' });
    }

    const assignment: any = assigned.assignmentId;
    if (!assignment?.result) {
      return res.status(400).json({ error: 'Assignment is not yet generated. Please wait.' });
    }

    // Check for existing submission
    const existingSubmission = await StudentSubmission.findOne({
      assignedAssignmentId: assigned._id,
      $or: [
        ...(student.studentId ? [{ studentId: student.studentId }] : []),
        { studentName: studentName }
      ]
    });

    if (existingSubmission?.submittedAt) {
      return res.status(409).json({ error: 'You have already submitted this assignment.', submissionId: existingSubmission._id });
    }

    // Return sections WITHOUT answers (strip the answer field from questions)
    const sanitizedSections = assignment.result.sections.map((section: any) => ({
      ...section,
      questions: section.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        difficulty: q.difficulty,
        marks: q.marks,
        options: q.options || [],
        conceptTag: q.conceptTag,
        // answer is intentionally omitted
      })),
    }));

    return res.json({
      assignedId: assigned._id,
      title: assignment.title,
      subject: assignment.result.subject,
      grade: assignment.result.grade,
      totalMarks: assignment.result.totalMarks,
      timeAllowed: assignment.result.timeAllowed,
      durationMinutes: assigned.durationMinutes,
      hintsEnabled: assigned.hintsEnabled,
      dueDate: assigned.dueDate,
      sections: sanitizedSections,
    });
  } catch (err) {
    logError('getStudentAssignment failed', err);
    return res.status(500).json({ error: 'Failed to load assignment' });
  }
}

// POST /api/student/submit/:assignedId
// body: { answers: [{ questionId, answer }] }
// AI auto-grades each answer and saves StudentSubmission
export async function submitStudentAnswers(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const studentName = student.studentName;
    const { answers } = req.body;
    const assignedId = req.params.assignedId;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers array is required' });
    }

    const assigned = await AssignedAssignment.findById(assignedId)
      .populate<{ assignmentId: any; groupId: any }>('assignmentId groupId');

    if (!assigned) return res.status(404).json({ error: 'Assignment not found' });

    // Verify student is enrolled in this group/class
    const isEnrolled = student.groupIds.includes(assigned.groupId._id.toString());
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Access denied. You are not enrolled in this class.' });
    }

    const assignment: any = assigned.assignmentId;
    if (!assignment?.result) return res.status(400).json({ error: 'Assignment not generated yet' });

    // Verify student not already submitted
    const existing = await StudentSubmission.findOne({
      assignedAssignmentId: assigned._id,
      $or: [
        ...(student.studentId ? [{ studentId: student.studentId }] : []),
        { studentName: studentName }
      ]
    });
    if (existing?.submittedAt) {
      return res.status(409).json({ error: 'Already submitted', submissionId: existing._id });
    }

    // Build lookup maps from assignment result
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

    // Check if there are any short or long descriptive questions
    let hasDescriptiveQuestions = false;
    for (const ans of answers) {
      const q = questionMap[ans.questionId];
      if (q && ['short', 'long'].includes(q.type)) {
        hasDescriptiveQuestions = true;
        break;
      }
    }

    if (hasDescriptiveQuestions) {
      // 1. Asynchronous background grading route
      const initialAnswers = answers.map((ans: { questionId: string; answer: string }) => {
        const question = questionMap[ans.questionId];
        return {
          questionId: ans.questionId,
          answer: (ans.answer || '').trim(),
          isCorrect: false,
          marks: 0,
          aiFeedback: question && ['mcq', 'truefalse', 'fillblank'].includes(question.type)
            ? 'Awaiting grading...'
            : 'Awaiting AI grading...'
        };
      });

      let submission = existing;
      if (!submission) {
        submission = new StudentSubmission({
          assignedAssignmentId: assigned._id,
          studentId: student.studentId || undefined,
          studentName: studentName.trim(),
          answers: initialAnswers,
          totalScore: 0,
          totalMarks,
          status: 'grading',
          submittedAt: new Date(),
          startedAt: new Date(),
        });
      } else {
        submission.studentId = student.studentId || submission.studentId;
        submission.studentName = studentName.trim();
        submission.answers = initialAnswers;
        submission.totalScore = 0;
        submission.totalMarks = totalMarks;
        submission.status = 'grading';
        submission.submittedAt = new Date();
      }
      await submission.save();

      log(`Submission enqueued for background AI grading: ${submission._id} for student "${studentName}"`);

      // Add to background grading queue
      await addGradingJob(submission._id.toString());

      return res.status(202).json({
        submissionId: submission._id,
        status: 'grading',
        totalScore: 0,
        totalMarks,
        percentage: 0,
        message: 'Submission enqueued for background AI grading.'
      });
    }

    // 2. Synchronous grading route (MCQs/True-False/Fill-in-blank only)
    const gradedAnswers = answers.map((ans: { questionId: string; answer: string }) => {
      const question = questionMap[ans.questionId];
      const correctAnswer = answerKeyMap[ans.questionId] || '';

      if (!question) {
        return { questionId: ans.questionId, answer: ans.answer, isCorrect: false, marks: 0, aiFeedback: 'Question not found.' };
      }

      const studentAnswer = (ans.answer || '').trim();
      const qMarks = question.marks || 1;

      const isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
      return {
        questionId: ans.questionId,
        answer: studentAnswer,
        isCorrect,
        marks: isCorrect ? qMarks : 0,
        aiFeedback: isCorrect
          ? `✅ Correct! ${correctAnswer}`
          : `❌ Incorrect. The correct answer was: ${correctAnswer}`,
      };
    });

    const totalScore = gradedAnswers.reduce((sum, a) => sum + (a.marks || 0), 0);

    let submission = existing;
    if (!submission) {
      submission = new StudentSubmission({
        assignedAssignmentId: assigned._id,
        studentId: student.studentId || undefined,
        studentName: studentName.trim(),
        answers: gradedAnswers,
        totalScore,
        totalMarks,
        status: 'graded',
        submittedAt: new Date(),
        startedAt: new Date(),
      });
    } else {
      submission.studentId = student.studentId || submission.studentId;
      submission.studentName = studentName.trim();
      submission.answers = gradedAnswers;
      submission.totalScore = totalScore;
      submission.totalMarks = totalMarks;
      submission.status = 'graded';
      submission.submittedAt = new Date();
    }
    await submission.save();

    log(`Submission saved (Sync MCQ): ${submission._id} for student "${studentName}" — Score: ${totalScore}/${totalMarks}`);

    // Trigger spaced repetition Concept Review check if registered student
    if (student?.studentId) {
      try {
        const { checkAndCreateReviewItems } = require('../services/review.service');
        await checkAndCreateReviewItems(student.studentId);
      } catch (revErr) {
        logError('Failed to trigger spaced repetition on sync submission', revErr);
      }
    }

    return res.status(201).json({
      submissionId: submission._id,
      status: 'graded',
      totalScore,
      totalMarks,
      percentage: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
    });
  } catch (err) {
    logError('submitStudentAnswers failed', err);
    return res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
}

// POST /api/student/upload/:assignedId
// Accepts a scanned paper upload (multer) — stores fileUrl on submission
export async function uploadStudentPaper(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const studentName = student.studentName;
    const assignedId = req.params.assignedId;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const assigned = await AssignedAssignment.findById(assignedId);
    if (!assigned) return res.status(404).json({ error: 'Assignment not found' });

    // Verify student is enrolled in this group/class
    const isEnrolled = student.groupIds.includes(assigned.groupId.toString());
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Access denied. You are not enrolled in this class.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    let submission = await StudentSubmission.findOne({
      assignedAssignmentId: assigned._id,
      $or: [
        ...(student.studentId ? [{ studentId: student.studentId }] : []),
        { studentName: studentName.trim() }
      ]
    });

    if (!submission) {
      submission = new StudentSubmission({
        assignedAssignmentId: assigned._id,
        studentId: student.studentId || undefined,
        studentName: studentName.trim(),
        submittedAt: new Date(),
        startedAt: new Date(),
        totalScore: 0,
        totalMarks: 0,
        answers: [{ questionId: 'upload', answer: fileUrl, isCorrect: false, marks: 0, aiFeedback: 'Paper uploaded. Awaiting teacher review.' }],
      });
    } else {
      submission.studentId = student.studentId || submission.studentId;
      submission.studentName = studentName.trim();
      submission.submittedAt = new Date();
      submission.answers = [{ questionId: 'upload', answer: fileUrl, isCorrect: false, marks: 0, aiFeedback: 'Paper uploaded. Awaiting teacher review.' }];
    }
    await submission.save();

    log(`Paper uploaded for student "${studentName}": ${req.file.filename}`);
    return res.json({ message: 'Paper uploaded successfully', fileUrl });
  } catch (err) {
    logError('uploadStudentPaper failed', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

// GET /api/student/results/:assignedId
export async function getStudentResults(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const studentName = student.studentName;
    const assignedId = req.params.assignedId;

    const submission = await StudentSubmission.findOne({
      assignedAssignmentId: assignedId,
      $or: [
        ...(student.studentId ? [{ studentId: student.studentId }] : []),
        { studentName: studentName }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'No submission found' });
    }

    const assigned = await AssignedAssignment.findById(assignedId)
      .populate<{ assignmentId: any }>('assignmentId', 'title subject grade result');

    if (!assigned) return res.status(404).json({ error: 'Assignment not found' });

    const assignment: any = assigned.assignmentId;

    if (submission.status === 'grading') {
      return res.json({
        submissionId: submission._id,
        studentName: submission.studentName,
        assignmentTitle: assignment?.title || '',
        subject: assignment?.result?.subject || '',
        grade: assignment?.result?.grade || '',
        totalScore: 0,
        totalMarks: submission.totalMarks,
        percentage: 0,
        status: 'grading',
        submittedAt: submission.submittedAt,
        answers: [],
      });
    }

    // Build question text map for results display
    const questionTextMap: Record<string, { text: string; marks: number; type: string; conceptTag?: string }> = {};
    if (assignment?.result?.sections) {
      for (const section of assignment.result.sections) {
        for (const q of section.questions) {
          questionTextMap[q.id] = { text: q.text, marks: q.marks, type: q.type, conceptTag: q.conceptTag };
        }
      }
    }

    const answerKeyMap: Record<string, string> = {};
    for (const ak of assignment?.result?.answerKey || []) {
      answerKeyMap[ak.questionId] = ak.answer;
    }

    const detailedAnswers = submission.answers.map((a) => ({
      questionId: a.questionId,
      questionText: questionTextMap[a.questionId]?.text || '',
      questionType: questionTextMap[a.questionId]?.type || '',
      conceptTag: questionTextMap[a.questionId]?.conceptTag || '',
      questionMarks: questionTextMap[a.questionId]?.marks || 0,
      studentAnswer: a.answer,
      correctAnswer: answerKeyMap[a.questionId] || '',
      isCorrect: a.isCorrect,
      marksAwarded: a.marks,
      aiFeedback: a.aiFeedback || '',
    }));

    return res.json({
      submissionId: submission._id,
      studentName: submission.studentName,
      assignmentTitle: assignment?.title || '',
      subject: assignment?.result?.subject || '',
      grade: assignment?.result?.grade || '',
      totalScore: submission.totalScore,
      totalMarks: submission.totalMarks,
      percentage: submission.totalMarks > 0 ? Math.round((submission.totalScore / submission.totalMarks) * 100) : 0,
      status: submission.status || 'graded',
      submittedAt: submission.submittedAt,
      answers: detailedAnswers,
    });
  } catch (err) {
    logError('getStudentResults failed', err);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
}

// POST /api/student/tutor/chat
// body: { message, history: [{ role, content }], subject?, grade? }
export async function studentTutorChat(req: Request, res: Response) {
  try {
    const { message, history = [], subject, grade } = req.body;

    if (!message) return res.status(400).json({ error: 'message is required' });

    const systemPrompt = `You are a friendly, encouraging AI study tutor for school students${grade ? ` in Grade ${grade}` : ''}${subject ? ` studying ${subject}` : ''}.
Your role is to help students understand concepts from their CBSE/NCERT curriculum.

Guidelines:
- Explain concepts in simple, easy-to-understand language appropriate for school students
- Use relatable examples and analogies from everyday life
- Break down complex topics into smaller steps
- Encourage the student and be positive in your feedback
- When solving problems, show step-by-step working
- Reference NCERT textbook concepts where relevant
- Keep responses concise (3-5 sentences unless a step-by-step solution is needed)
- Use emojis sparingly to make learning fun 🎯`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-10).map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message },
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const reply = response.choices[0]?.message?.content || 'I\'m here to help! Could you rephrase your question?';

    return res.json({ reply });
  } catch (err) {
    logError('studentTutorChat failed', err);
    return res.status(500).json({ error: 'AI tutor unavailable. Please try again.' });
  }
}

// POST /api/student/practice/generate
// body: { classCode, subject, grade, topic, numQuestions, type }
export async function generatePracticeWorksheet(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const studentEmail = student.email;
    const studentName = student.studentName;
    
    const { classCode, subject, grade, topic, numQuestions = 5, type = 'Mixed' } = req.body;

    if (!subject || !grade || !topic) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify student is enrolled in this group/class if classCode is specified
    if (classCode) {
      const group = await Group.findOne({ classCode: classCode.toUpperCase().trim() });
      if (group && !student.groupIds.includes(group._id.toString())) {
        return res.status(403).json({ error: 'Access denied. You are not enrolled in this class.' });
      }
    }

    log(`Generating practice quiz for student ${studentName} (${studentEmail}): Grade ${grade} ${subject} on "${topic}"`);

    const practicePrompt = `You are a CBSE and NCERT syllabus-aligned learning coach.
Generate a ${numQuestions}-question study quiz for Grade ${grade} students on the topic: "${topic}" in the subject "${subject}".
The question type style is: "${type}" (can be MCQ, short answer, true/false, or mixed).

Return a JSON object in EXACTLY the following structure. Do not wrap in markdown, code blocks, or include any extra text:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here...",
      "type": "mcq", // can be: 'mcq', 'short', 'truefalse', 'fillblank'
      "options": ["Option A", "Option B", "Option C", "Option D"], // ONLY for mcq, leave empty/omit for other types
      "correctAnswer": "Option A or correct answer value",
      "marks": 1,
      "explanation": "Brief explanation of why this answer is correct and the underlying NCERT concept."
    }
  ]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an educational AI assistant that responds ONLY with valid, raw JSON.' },
        { role: 'user', content: practicePrompt }
      ],
      temperature: 0.6,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response JSON');
    }

    const data = JSON.parse(jsonMatch[0]);
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('AI returned invalid quiz questions');
    }

    // Save practice test (unsubmitted/initialized) in database
    const practiceQuiz = await StudentPractice.create({
      studentEmail: studentEmail.toLowerCase().trim(),
      studentName,
      classCode,
      subject,
      grade,
      topic,
      questions: data.questions,
    });

    return res.status(201).json(practiceQuiz);
  } catch (err) {
    logError('generatePracticeWorksheet failed', err);
    return res.status(500).json({ error: 'Failed to generate practice quiz. Please try again.' });
  }
}

// POST /api/student/practice/submit/:practiceId
// body: { answers: [{ questionId, answer }] }
export async function submitPracticeWorksheet(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const { answers } = req.body;
    const { practiceId } = req.params;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    const practice = await StudentPractice.findById(practiceId);
    if (!practice) {
      return res.status(404).json({ error: 'Practice quiz not found' });
    }

    if (practice.submittedAt) {
      return res.status(400).json({ error: 'Practice quiz already submitted' });
    }

    let totalScore = 0;
    let totalMarks = 0;

    const gradedAnswers = await Promise.all(
      practice.questions.map(async (q) => {
        const studentAnsObj = answers.find((a) => a.questionId === q.id);
        const studentAns = (studentAnsObj?.answer || '').trim();
        const qMarks = q.marks || 1;
        totalMarks += qMarks;

        // For objective types (MCQ, True/False, Fill blank), do case-insensitive exact check
        if (['mcq', 'truefalse', 'fillblank'].includes(q.type)) {
          const isCorrect = studentAns.toLowerCase() === (q.correctAnswer || '').toLowerCase();
          const marks = isCorrect ? qMarks : 0;
          totalScore += marks;

          return {
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            studentAnswer: studentAns,
            correctAnswer: q.correctAnswer,
            isCorrect,
            marksAwarded: marks,
            explanation: q.explanation,
            aiFeedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${q.correctAnswer}`,
          };
        }

        if (!studentAns) {
          return {
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            studentAnswer: '',
            correctAnswer: q.correctAnswer,
            isCorrect: false,
            marksAwarded: 0,
            explanation: q.explanation,
            aiFeedback: 'No answer provided.',
          };
        }

        // Short Answer grading via Groq (very fast, low temp)
        try {
          const gradingPrompt = `You are a CBSE teacher grading a practice short answer. Respond ONLY with JSON.
Question: "${q.text}"
Correct Answer Reference: "${q.correctAnswer}"
Student Answer: "${studentAns}"
Maximum Marks: ${qMarks}

Grade the answer. Return JSON:
{
  "marks": <number between 0 and ${qMarks}>,
  "isCorrect": <true if marks >= ${Math.ceil(qMarks * 0.5)}>,
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
          const grading = jsonMatch ? JSON.parse(jsonMatch[0]) : { marks: 0, isCorrect: false, feedback: '' };

          const marks = Math.min(Math.max(grading.marks || 0, 0), qMarks);
          totalScore += marks;

          return {
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            studentAnswer: studentAns,
            correctAnswer: q.correctAnswer,
            isCorrect: grading.isCorrect || false,
            marksAwarded: marks,
            explanation: q.explanation,
            aiFeedback: grading.feedback || 'Answer reviewed.',
          };
        } catch (gradErr) {
          logError('Practice AI grading failed for question ' + q.id, gradErr);
          const isCorrect = studentAns.toLowerCase().includes((q.correctAnswer || '').toLowerCase());
          const marks = isCorrect ? qMarks : 0;
          totalScore += marks;

          return {
            questionId: q.id,
            questionText: q.text,
            type: q.type,
            studentAnswer: studentAns,
            correctAnswer: q.correctAnswer,
            isCorrect,
            marksAwarded: marks,
            explanation: q.explanation,
            aiFeedback: 'Graded via backup match. Verify answer explanation.',
          };
        }
      })
    );

    // AI summary feedback for the whole practice test
    let overallFeedback = 'Keep practicing to master these concepts!';
    try {
      const summaryPrompt = `Give a 1-sentence encouraging study feedback for a student who scored ${totalScore} out of ${totalMarks} on a practice quiz about "${practice.topic}". Make it encouraging and highlight key focus areas.`;
      const summaryResp = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: summaryPrompt }],
        temperature: 0.7,
        max_tokens: 60,
      });
      overallFeedback = summaryResp.choices[0]?.message?.content?.trim() || overallFeedback;
    } catch {}

    // Update practice model
    practice.answers = gradedAnswers;
    practice.score = totalScore;
    practice.totalMarks = totalMarks;
    practice.feedback = overallFeedback;
    practice.submittedAt = new Date();
    await practice.save();

    // Trigger spaced repetition Concept Review check
    if (student?.studentId) {
      try {
        const { checkAndCreateReviewItems } = require('../services/review.service');
        await checkAndCreateReviewItems(student.studentId);
      } catch (revErr) {
        logError('Failed to trigger spaced repetition on practice submission', revErr);
      }
    }

    return res.json({
      practiceId: practice._id,
      score: totalScore,
      totalMarks,
      feedback: overallFeedback,
      answers: gradedAnswers,
    });
  } catch (err) {
    logError('submitPracticeWorksheet failed', err);
    return res.status(500).json({ error: 'Failed to submit practice quiz.' });
  }
}

// GET /api/student/practice/history
// Retrieves practice history for the authenticated student
export async function getPracticeHistory(req: Request, res: Response) {
  try {
    const student = (req as any).student;
    const studentEmail = student.email;

    const history = await StudentPractice.find({
      studentEmail: studentEmail.toLowerCase().trim(),
      submittedAt: { $ne: null },
    }).sort({ submittedAt: -1 });

    return res.json(history);
  } catch (err) {
    logError('getPracticeHistory failed', err);
    return res.status(500).json({ error: 'Failed to retrieve practice history.' });
  }
}

// POST /api/student/syllabus/explore
// body: { grade, subject, topic }
export async function exploreCbsesyllabus(req: Request, res: Response) {
  try {
    const { grade, subject, topic } = req.body;
    if (!grade || !subject || !topic) {
      return res.status(400).json({ error: 'grade, subject, and topic are required' });
    }

    log(`Syllabus explore requested: Grade ${grade} ${subject} Topic: "${topic}"`);

    const explorerPrompt = `You are a senior CBSE/NCERT curriculum expert.
Analyze the alignment of the topic "${topic}" with the official NCERT syllabus for ${grade} in the subject of "${subject}".
Return a JSON object with the following fields (strictly valid JSON, no surrounding markdown, no explanations outside the JSON):
{
  "aligned": <true or false>,
  "alignmentScore": <percentage integer from 0 to 100 representing how central/relevant this topic is to the Grade NCERT curriculum>,
  "chapterName": "Name of the NCERT Chapter containing this topic (or 'Out of Syllabus' if not aligned)",
  "curriculumContext": "A brief explanation (2-3 sentences) detailing where this fits in the curriculum and its board relevance.",
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3"], // 3-4 core concepts the student must master for this topic
  "learningObjectives": ["Learning Objective 1", "Learning Objective 2"], // 2-3 specific learning outcomes from NCERT guidelines
  "quickStudyNotes": "An engaging, clear, and high-value revision summary (100-150 words) that explains the core scientific/mathematical principle behind the topic. Write it in a direct, easy-to-understand tone suitable for a school student, highlighting any important formulas or definitions.",
  "boardExamQuestions": [
    {
      "id": "bq1",
      "question": "A typical CBSE Board Exam question for this topic...",
      "marks": 3,
      "modelAnswer": "Clear step-by-step model answer conforming to CBSE marking scheme."
    },
    {
      "id": "bq2",
      "question": "Another Board Exam question of a different marks value...",
      "marks": 5,
      "modelAnswer": "Model answer showing calculation or structured points."
    }
  ]
}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an educational AI assistant that responds ONLY with valid, raw JSON.' },
        { role: 'user', content: explorerPrompt }
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI syllabus explorer response JSON');
    }

    const data = JSON.parse(jsonMatch[0]);
    return res.json(data);
  } catch (err) {
    logError('exploreCbsesyllabus failed', err);
    return res.status(500).json({ error: 'Failed to explore syllabus. Please try again.' });
  }
}

