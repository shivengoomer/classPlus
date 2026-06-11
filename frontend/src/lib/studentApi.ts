// src/lib/studentApi.ts
// No-auth API client for the student portal

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function studentFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
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

export async function verifyStudentSession(email: string): Promise<VerifyStudentResponse> {
  const res = await fetch(`${BASE_URL}/student/login/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Verification failed');
  }
  return res.json();
}

export async function getStudentSession(email: string): Promise<StudentLoginResponse> {
  const res = await fetch(`${BASE_URL}/student/session?email=${encodeURIComponent(email)}`);
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
  const res = await fetch(`${BASE_URL}/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${BASE_URL}/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${BASE_URL}/student/join-class`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, classCode, studentName }),
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
  const res = await fetch(`${BASE_URL}/student/assignment/${assignedId}?studentName=${encodeURIComponent(studentName)}`);
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
  const res = await fetch(`${BASE_URL}/student/submit/${assignedId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentName, answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Submission failed');
  }
  return res.json();
}

export async function uploadPaper(assignedId: string, studentName: string, file: File): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append('studentName', studentName);
  formData.append('paper', file);
  const res = await fetch(`${BASE_URL}/student/upload/${assignedId}`, {
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
  const res = await fetch(`${BASE_URL}/student/results/${assignedId}?studentName=${encodeURIComponent(studentName)}`);
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
  const res = await fetch(`${BASE_URL}/student/tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${BASE_URL}/student/practice/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
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
  const res = await fetch(`${BASE_URL}/student/practice/submit/${practiceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit practice quiz');
  }
  return res.json();
}

export async function getPracticeHistory(studentEmail: string): Promise<PracticeQuiz[]> {
  const res = await fetch(
    `${BASE_URL}/student/practice/history?studentEmail=${encodeURIComponent(studentEmail)}`
  );
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
  const res = await fetch(`${BASE_URL}/student/syllabus/explore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to explore syllabus');
  }
  return res.json();
}

