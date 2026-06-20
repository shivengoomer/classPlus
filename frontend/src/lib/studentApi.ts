// src/lib/studentApi.ts
// JWT-authenticated API client for the student portal
import { useStudentStore } from '@/store/studentStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function studentFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useStudentStore.getState().token;
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
  });
}

export interface StudentLoginResponse {
  student: string;
  email: string;
  groups: {
    _id: string;
    name: string;
    grade: string;
    subject: string;
    classCode: string;
  }[];
  assignments: StudentAssignmentItem[];
  token: string;
}

export interface StudentAssignmentItem {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    subject: string;
    grade: string;
    totalMarks: number;
    pdfUrl?: string;
    status: string;
  };
  groupId: string;
  dueDate: string;
  hintsEnabled: boolean;
  durationMinutes: number | null;
  submission: {
    totalScore: number;
    totalMarks: number;
    submittedAt: string | null;
    autoSubmitted: boolean;
  } | null;
}

export interface VerifyStudentResponse {
  status: 'needs_setup' | 'needs_passcode';
  message: string;
}

export interface Announcement {
  _id: string;
  groupId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export async function verifyStudentSession(email: string): Promise<VerifyStudentResponse> {
  const res = await studentFetch(`${BASE_URL}/student/login/verify`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Verification failed');
  }
  return res.json();
}

export async function getStudentSession(email: string): Promise<StudentLoginResponse> {
  const res = await studentFetch(`${BASE_URL}/student/session`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch student session');
  }
  return res.json();
}

export async function studentRegister(
  classCode: string,
  studentName: string,
  email: string,
  passcode: string
): Promise<StudentLoginResponse> {
  const res = await studentFetch(`${BASE_URL}/student/register`, {
    method: 'POST',
    body: JSON.stringify({ classCode, studentName, email, passcode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function studentLogin(
  email: string,
  passcode: string
): Promise<StudentLoginResponse> {
  const res = await studentFetch(`${BASE_URL}/student/login`, {
    method: 'POST',
    body: JSON.stringify({ email, passcode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function joinClassGroup(
  email: string,
  classCode: string,
  studentName: string
): Promise<StudentLoginResponse> {
  const res = await studentFetch(`${BASE_URL}/student/join-class`, {
    method: 'POST',
    body: JSON.stringify({ classCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to join class group');
  }
  return res.json();
}

export interface StudentAssignmentDetail {
  assignedId: string;
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  timeAllowed: string;
  durationMinutes: number | null;
  hintsEnabled: boolean;
  dueDate: string;
  sections: {
    id: string;
    label: string;
    title: string;
    instruction: string;
    totalMarks: number;
    questions: {
      id: string;
      text: string;
      type: string;
      difficulty: string;
      marks: number;
      options: string[];
      conceptTag?: string;
    }[];
  }[];
}

export async function getStudentAssignment(assignedId: string, studentName: string): Promise<StudentAssignmentDetail> {
  const res = await studentFetch(`${BASE_URL}/student/assignment/${assignedId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load assignment');
  }
  return res.json();
}

export async function submitAnswers(
  assignedId: string,
  studentName: string,
  answers: { questionId: string; answer: string }[]
): Promise<{ submissionId: string; totalScore: number; totalMarks: number; percentage: number }> {
  const res = await studentFetch(`${BASE_URL}/student/submit/${assignedId}`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Submission failed');
  }
  return res.json();
}

export async function uploadPaper(assignedId: string, studentName: string, file: File): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append('paper', file);
  const res = await studentFetch(`${BASE_URL}/student/upload/${assignedId}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

export interface StudentResults {
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  subject: string;
  grade: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  status?: string;
  submittedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    questionType: string;
    conceptTag: string;
    questionMarks: number;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marksAwarded: number;
    aiFeedback: string;
  }[];
}

export async function getStudentResults(assignedId: string, studentName: string): Promise<StudentResults> {
  const res = await studentFetch(`${BASE_URL}/student/results/${assignedId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load results');
  }
  return res.json();
}

export async function tutorChat(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  subject?: string,
  grade?: string
): Promise<{ reply: string }> {
  const res = await studentFetch(`${BASE_URL}/student/tutor/chat`, {
    method: 'POST',
    body: JSON.stringify({ message, history, subject, grade }),
  });
  if (!res.ok) throw new Error('AI tutor unavailable');
  return res.json();
}

export interface PracticeQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'short' | 'truefalse' | 'fillblank';
  options?: string[];
  correctAnswer?: string;
  marks: number;
  explanation: string;
}

export interface GradedPracticeAnswer {
  questionId: string;
  questionText: string;
  type: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  explanation: string;
  aiFeedback: string;
}

export interface PracticeQuiz {
  _id: string;
  studentName: string;
  classCode: string;
  subject: string;
  grade: string;
  topic: string;
  questions: PracticeQuestion[];
  answers?: GradedPracticeAnswer[];
  score?: number;
  totalMarks?: number;
  feedback?: string;
  submittedAt?: string;
  createdAt: string;
}

export async function generatePracticeQuiz(params: {
  studentEmail: string;
  studentName: string;
  classCode?: string;
  subject: string;
  grade: string;
  topic: string;
  numQuestions?: number;
  type?: string;
}): Promise<PracticeQuiz> {
  const res = await studentFetch(`${BASE_URL}/student/practice/generate`, {
    method: 'POST',
    body: JSON.stringify({
      classCode: params.classCode,
      subject: params.subject,
      grade: params.grade,
      topic: params.topic,
      numQuestions: params.numQuestions,
      type: params.type,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate practice quiz');
  }
  return res.json();
}

export async function submitPracticeQuiz(
  practiceId: string,
  answers: { questionId: string; answer: string }[]
): Promise<{
  practiceId: string;
  score: number;
  totalMarks: number;
  feedback: string;
  answers: GradedPracticeAnswer[];
}> {
  const res = await studentFetch(`${BASE_URL}/student/practice/submit/${practiceId}`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit practice quiz');
  }
  return res.json();
}

export async function getPracticeHistory(studentEmail: string): Promise<PracticeQuiz[]> {
  const res = await studentFetch(`${BASE_URL}/student/practice/history`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to retrieve practice history');
  }
  return res.json();
}

export interface SyllabusExplorerResponse {
  aligned: boolean;
  alignmentScore: number;
  chapterName: string;
  curriculumContext: string;
  keyConcepts: string[];
  learningObjectives: string[];
  quickStudyNotes: string;
  boardExamQuestions: {
    id: string;
    question: string;
    marks: number;
    modelAnswer: string;
  }[];
}

export async function exploreSyllabus(params: {
  grade: string;
  subject: string;
  topic: string;
}): Promise<SyllabusExplorerResponse> {
  const res = await studentFetch(`${BASE_URL}/student/syllabus/explore`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to explore syllabus');
  }
  return res.json();
}

export async function getGroupAnnouncements(groupId: string): Promise<Announcement[]> {
  const res = await studentFetch(`${BASE_URL}/announcements/group/${groupId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to retrieve announcements');
  }
  return res.json();
}

// ==========================================
// Spaced Repetition Review Queue Endpoints
// ==========================================

export interface ReviewItem {
  _id: string;
  studentId: string;
  conceptTag: string;
  sourceQuestionId?: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  createdAt: string;
}

export async function studentGetDueReviews(): Promise<ReviewItem[]> {
  const res = await studentFetch(`${BASE_URL}/student/reviews/due`);
  if (!res.ok) throw new Error('Failed to fetch due reviews');
  return res.json();
}

export async function studentGenerateReviewQuestion(reviewId: string): Promise<{
  reviewId: string;
  conceptTag: string;
  question: {
    text: string;
    type: 'mcq' | 'short' | 'truefalse' | 'fillblank';
    options?: string[];
    correctAnswer?: string;
    explanation: string;
  };
}> {
  const res = await studentFetch(`${BASE_URL}/student/reviews/${reviewId}/generate`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate review question');
  }
  return res.json();
}

export async function studentSubmitReview(
  reviewId: string,
  answer: string,
  question: any
): Promise<{
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  aiFeedback: string;
  nextReviewDate: string;
}> {
  const res = await studentFetch(`${BASE_URL}/student/reviews/${reviewId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answer, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit review');
  }
  return res.json();
}

