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
import { env } from '../config/env';
import { log, logError } from '../utils/logger';

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
async function fetchStudentSession(credential: any, res: Response) {
  // Find all groups the student is enrolled in
  const groups = await Group.find({ _id: { $in: credential.groupIds } });

  // Fetch all assigned assignments for all these groups
  const assigned = await AssignedAssignment.find({ groupId: { $in: credential.groupIds } })
    .populate('assignmentId', 'title subject grade totalMarks pdfUrl status')
    .sort({ createdAt: -1 });

  // For each assigned assignment, check if this student has a submission (using their roster name in that group or global name)
  const assignedWithStatus = await Promise.all(
    assigned.map(async (a) => {
      const submission = await StudentSubmission.findOne({
        assignedAssignmentId: a._id,
        studentName: credential.studentName,
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

    const hashed = crypto.createHash('sha256').update(passcode).digest('hex');
    const credential = await StudentCredential.create({
      studentName: normalizedName,
      email: normalizedEmail,
      groupIds: [group._id],
      hashedPasscode: hashed,
    });

    log(`Student registered: ${normalizedName} (${normalizedEmail}) in group ${group.classCode}`);

    return await fetchStudentSession(credential, res);
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

    const hashed = crypto.createHash('sha256').update(passcode).digest('hex');
    if (credential.hashedPasscode !== hashed) {
      return res.status(401).json({ error: 'Incorrect PIN code. Please try again.' });
    }

    return await fetchStudentSession(credential, res);
  } catch (err) {
    logError('studentLogin failed', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

// POST /api/student/join-class
// body: { email, classCode, studentName }
// Enrolls student in an additional class group
export async function joinClassGroup(req: Request, res: Response) {
  try {
    const { email, classCode, studentName } = req.body;
    if (!email || !classCode || !studentName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const credential = await StudentCredential.findOne({ email: normalizedEmail });
    if (!credential) {
      return res.status(404).json({ error: 'Student account not found.' });
    }

    const group = await Group.findOne({ classCode: classCode.toUpperCase().trim() });
    if (!group) {
      return res.status(404).json({ error: 'Class code not found. Please verify with your teacher.' });
    }

    const normalizedName = studentName.trim();
    if (credential.studentName.toLowerCase() !== normalizedName.toLowerCase()) {
      return res.status(400).json({ error: `Your account name is registered as "${credential.studentName}". To join this class, you must be enrolled in the roster with this name.` });
    }

    if (!group.students.map(s => s.toLowerCase()).includes(normalizedName.toLowerCase())) {
      return res.status(403).json({ error: `Student "${normalizedName}" is not enrolled in this class roster. Ask your teacher to add you.` });
    }

    const hasGroup = credential.groupIds.some(id => id.toString() === group._id.toString());
    if (!hasGroup) {
      credential.groupIds.push(group._id as any);
      await credential.save();
      log(`Student ${credential.studentName} joined new class ${group.classCode}`);
    }

    return await fetchStudentSession(credential, res);
  } catch (err) {
    logError('joinClassGroup failed', err);
    return res.status(500).json({ error: 'Failed to join class. Please try again.' });
  }
}

// GET /api/student/session
// query: { email }
// Retrieves student name, groups, and assignments by email without needing passcode verification
export async function getStudentSession(req: Request, res: Response) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();
    const credential = await StudentCredential.findOne({ email: normalizedEmail });

    if (!credential) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return await fetchStudentSession(credential, res);
  } catch (err) {
    logError('getStudentSession failed', err);
    return res.status(500).json({ error: 'Failed to retrieve session details.' });
  }
}



// GET /api/student/assignment/:assignedId
// Returns questions WITHOUT answer key or correct answers
export async function getStudentAssignment(req: Request, res: Response) {
  try {
    const { studentName } = req.query;
    if (!studentName) {
      return res.status(400).json({ error: 'studentName query param required' });
    }

    const assigned = await AssignedAssignment.findById(req.params.assignedId)
      .populate<{ assignmentId: any; groupId: any }>('assignmentId groupId');

    if (!assigned) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignment: any = assigned.assignmentId;
    if (!assignment?.result) {
      return res.status(400).json({ error: 'Assignment is not yet generated. Please wait.' });
    }

    // Verify student is in this group
    const group: any = assigned.groupId;
    const isEnrolled = group.students.map((s: string) => s.toLowerCase()).includes((studentName as string).toLowerCase());
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Student not enrolled in this class' });
    }

    // Check for existing submission
    const existingSubmission = await StudentSubmission.findOne({
      assignedAssignmentId: assigned._id,
      studentName: studentName as string,
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
// body: { studentName, answers: [{ questionId, answer }] }
// AI auto-grades each answer and saves StudentSubmission
export async function submitStudentAnswers(req: Request, res: Response) {
  try {
    const { studentName, answers } = req.body;
    const assignedId = req.params.assignedId;

    if (!studentName || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'studentName and answers array are required' });
    }

    const assigned = await AssignedAssignment.findById(assignedId)
      .populate<{ assignmentId: any; groupId: any }>('assignmentId groupId');

    if (!assigned) return res.status(404).json({ error: 'Assignment not found' });

    const assignment: any = assigned.assignmentId;
    if (!assignment?.result) return res.status(400).json({ error: 'Assignment not generated yet' });

    // Verify student not already submitted
    const existing = await StudentSubmission.findOne({
      assignedAssignmentId: assigned._id,
      studentName: studentName.trim(),
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

    // Grade each answer using AI for short/long answers, direct match for MCQ/fillblank/truefalse
    const gradedAnswers = await Promise.all(
      answers.map(async (ans: { questionId: string; answer: string }) => {
        const question = questionMap[ans.questionId];
        const correctAnswer = answerKeyMap[ans.questionId] || '';

        if (!question) {
          return { questionId: ans.questionId, answer: ans.answer, isCorrect: false, marks: 0, aiFeedback: 'Question not found.' };
        }

        const studentAnswer = (ans.answer || '').trim();
        const qMarks = question.marks || 1;

        // MCQ / True-False / Fill-in-blank: exact match (case-insensitive)
        if (['mcq', 'truefalse', 'fillblank'].includes(question.type)) {
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
        }

        // Short/Long answer: use Groq AI to grade and provide feedback
        if (!studentAnswer) {
          return {
            questionId: ans.questionId,
            answer: '',
            isCorrect: false,
            marks: 0,
            aiFeedback: 'No answer provided.',
          };
        }

        try {
          const gradingPrompt = `You are a CBSE/NCERT teacher grading a student answer. Respond ONLY with JSON.

Question: "${question.text}"
Model Answer: "${correctAnswer}"
Student Answer: "${studentAnswer}"
Maximum Marks: ${qMarks}

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
          // Extract JSON from potential markdown wrapping
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          const grading = jsonMatch ? JSON.parse(jsonMatch[0]) : { marks: 0, isCorrect: false, feedback: '' };

          return {
            questionId: ans.questionId,
            answer: studentAnswer,
            isCorrect: grading.isCorrect || false,
            marks: Math.min(Math.max(grading.marks || 0, 0), qMarks),
            aiFeedback: grading.feedback || 'Answer reviewed.',
          };
        } catch (aiErr) {
          logError('AI grading failed for question ' + ans.questionId, aiErr);
          // Fallback: keyword-based partial credit
          const keywords = correctAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const studentWords = studentAnswer.toLowerCase();
          const matches = keywords.filter(k => studentWords.includes(k)).length;
          const ratio = keywords.length > 0 ? matches / keywords.length : 0;
          const marks = Math.round(ratio * qMarks);
          return {
            questionId: ans.questionId,
            answer: studentAnswer,
            isCorrect: ratio >= 0.5,
            marks,
            aiFeedback: `Answer partially reviewed. Consider checking: ${correctAnswer.slice(0, 100)}...`,
          };
        }
      })
    );

    const totalScore = gradedAnswers.reduce((sum, a) => sum + (a.marks || 0), 0);

    // Upsert submission
    const submission = await StudentSubmission.findOneAndUpdate(
      { assignedAssignmentId: assigned._id, studentName: studentName.trim() },
      {
        $set: {
          answers: gradedAnswers,
          totalScore,
          totalMarks,
          submittedAt: new Date(),
          startedAt: existing?.startedAt || new Date(),
        },
      },
      { upsert: true, new: true }
    );

    log(`Submission saved: ${submission._id} for student "${studentName}" — Score: ${totalScore}/${totalMarks}`);

    return res.status(201).json({
      submissionId: submission._id,
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
    const { studentName } = req.body;
    const assignedId = req.params.assignedId;

    if (!studentName) return res.status(400).json({ error: 'studentName is required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const assigned = await AssignedAssignment.findById(assignedId);
    if (!assigned) return res.status(404).json({ error: 'Assignment not found' });

    const fileUrl = `/uploads/${req.file.filename}`;

    await StudentSubmission.findOneAndUpdate(
      { assignedAssignmentId: assigned._id, studentName: studentName.trim() },
      {
        $set: {
          submittedAt: new Date(),
          startedAt: new Date(),
          // Store upload path in aiFeedback of first answer as a placeholder
        },
        $setOnInsert: {
          totalScore: 0,
          totalMarks: 0,
          answers: [{ questionId: 'upload', answer: fileUrl, isCorrect: false, marks: 0, aiFeedback: 'Paper uploaded. Awaiting teacher review.' }],
        },
      },
      { upsert: true, new: true }
    );

    log(`Paper uploaded for student "${studentName}": ${req.file.filename}`);
    return res.json({ message: 'Paper uploaded successfully', fileUrl });
  } catch (err) {
    logError('uploadStudentPaper failed', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

// GET /api/student/results/:assignedId?studentName=
export async function getStudentResults(req: Request, res: Response) {
  try {
    const { studentName } = req.query;
    const assignedId = req.params.assignedId;

    if (!studentName) return res.status(400).json({ error: 'studentName query param required' });

    const submission = await StudentSubmission.findOne({
      assignedAssignmentId: assignedId,
      studentName: studentName as string,
    });

    if (!submission) {
      return res.status(404).json({ error: 'No submission found' });
    }

    const assigned = await AssignedAssignment.findById(assignedId)
      .populate<{ assignmentId: any }>('assignmentId', 'title subject grade result');

    if (!assigned) return res.status(404).json({ error: 'Assignment not found' });

    const assignment: any = assigned.assignmentId;

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
// body: { studentEmail, studentName, classCode, subject, grade, topic, numQuestions, type }
export async function generatePracticeWorksheet(req: Request, res: Response) {
  try {
    const { studentEmail, studentName, classCode, subject, grade, topic, numQuestions = 5, type = 'Mixed' } = req.body;

    if (!studentEmail || !studentName || !subject || !grade || !topic) {
      return res.status(400).json({ error: 'Missing required parameters' });
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
// query: { studentEmail }
export async function getPracticeHistory(req: Request, res: Response) {
  try {
    const { studentEmail } = req.query;
    if (!studentEmail) {
      return res.status(400).json({ error: 'studentEmail required' });
    }

    const history = await StudentPractice.find({
      studentEmail: (studentEmail as string).toLowerCase().trim(),
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

