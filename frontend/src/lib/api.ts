// src/lib/api.ts
import { Assignment, CreateAssignmentDTO } from '@/types/assignment';
import { Template } from '@/types/group';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let globalToken: string | null = null;

export function setGlobalToken(token: string | null) {
  globalToken = token;
}

/**
 * Waits for a Clerk token to be set (up to maxWaitMs).
 * This resolves the race condition where API calls fire before
 * ClerkTokenProvider finishes getting the JWT.
 */
async function waitForToken(maxWaitMs = 5000): Promise<string | null> {
  if (globalToken) return globalToken;

  // Try directly from Clerk session as fallback
  if (typeof window !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const directToken = await (window as any).Clerk?.session?.getToken();
      if (directToken) {
        globalToken = directToken;
        return directToken;
      }
    } catch {}
  }

  // Poll until token is available or timeout
  const start = Date.now();
  while (!globalToken && Date.now() - start < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (globalToken) return globalToken;

    // Try Clerk session on each poll
    if (typeof window !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = await (window as any).Clerk?.session?.getToken();
        if (t) {
          globalToken = t;
          return t;
        }
      } catch {}
    }
  }

  return globalToken;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {};
  const token = await waitForToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}

// Assignment API methods
export async function createAssignment(data: CreateAssignmentDTO): Promise<{ assignmentId: string; jobId: string }> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('subject', data.subject);
  formData.append('grade', data.grade);
  formData.append('dueDate', data.dueDate);
  formData.append('questionRows', JSON.stringify(data.questionRows));
  if (data.additionalInstructions) {
    formData.append('additionalInstructions', data.additionalInstructions);
  }
  if (data.file) {
    formData.append('file', data.file);
  }
  if (data.fileUrl) {
    formData.append('fileUrl', data.fileUrl);
  }

  const res = await authFetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create assignment');
  return res.json();
}

export async function listAssignments(): Promise<Assignment[]> {
  const res = await authFetch(`${BASE_URL}/assignments`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function getAssignment(id: string): Promise<Assignment> {
  const res = await authFetch(`${BASE_URL}/assignments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch assignment details');
  return res.json();
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/assignments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete assignment');
}

export async function regenerateAssignment(id: string): Promise<{ jobId: string }> {
  const res = await authFetch(`${BASE_URL}/assignments/${id}/regenerate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to regenerate assignment');
  return res.json();
}

export async function regenerateWithDifficulty(id: string, targetDifficulty: 'easier' | 'same' | 'harder'): Promise<{ assignmentId: string; jobId: string }> {
  const res = await authFetch(`${BASE_URL}/assignments/${id}/regenerate-difficulty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetDifficulty }),
  });
  if (!res.ok) throw new Error('Failed to regenerate assignment with difficulty');
  return res.json();
}

export async function exportAssignmentPDF(id: string): Promise<Blob> {
  const res = await authFetch(`${BASE_URL}/assignments/${id}/export-pdf`);
  if (!res.ok) throw new Error('Failed to export PDF');
  return res.blob();
}

// Library API methods
export interface LibraryItem {
  _id: string;
  name: string;
  type: 'folder' | 'pdf' | 'doc';
  size?: string;
  category: string;
  url?: string;
  source: 'upload' | 'export' | 'browse';
  updatedAt: string;
}

export async function listLibraryItems(): Promise<LibraryItem[]> {
  const res = await authFetch(`${BASE_URL}/library`);
  if (!res.ok) throw new Error('Failed to fetch library items');
  return res.json();
}

export async function uploadLibraryItem(file: File, category: string): Promise<LibraryItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const res = await authFetch(`${BASE_URL}/library`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload library item');
  return res.json();
}

export async function createLibraryFolder(name: string, category: string): Promise<LibraryItem> {
  const res = await authFetch(`${BASE_URL}/library/folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, category }),
  });
  if (!res.ok) throw new Error('Failed to create library folder');
  return res.json();
}

export async function deleteLibraryItem(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/library/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete library item');
}

// Notifications API methods
export async function listNotifications() {
  const res = await authFetch(`${BASE_URL}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationAsRead(id: string) {
  const res = await authFetch(`${BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function markAllNotificationsAsRead() {
  const res = await authFetch(`${BASE_URL}/notifications/mark-all-read`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
  return res.json();
}

export async function deleteNotification(id: string) {
  const res = await authFetch(`${BASE_URL}/notifications/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete notification');
  return res.json();
}

export async function clearAllNotifications() {
  const res = await authFetch(`${BASE_URL}/notifications/clear-all`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to clear notifications');
  return res.json();
}

// User Profile & Settings API methods
export interface UserProfile {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role?: string;
  schoolName?: string;
  schoolBranch?: string;
  schoolCode?: string;
  aiModel?: string;
  aiStrictNCERT?: boolean;
  aiCreativity?: number;
  plan?: string;
  planStatus?: string;
  creditsUsed?: number;
  creditsLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await authFetch(`${BASE_URL}/users/profile`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await authFetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}

export async function upgradeUserPlan(plan: string): Promise<UserProfile> {
  const res = await authFetch(`${BASE_URL}/users/billing/upgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error('Failed to upgrade plan');
  return res.json();
}

export async function generateRubric(
  questionText: string,
  totalMarks: number,
  subject?: string,
  grade?: string
): Promise<{ label: string; marks: number; description: string }[]> {
  const res = await authFetch(`${BASE_URL}/rubrics/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionText, totalMarks, subject, grade }),
  });
  if (!res.ok) throw new Error('Failed to generate rubric');
  return res.json();
}

export async function listTemplates(): Promise<Template[]> {
  const res = await authFetch(`${BASE_URL}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function createTemplate(data: Partial<Template>): Promise<Template> {
  const res = await authFetch(`${BASE_URL}/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/templates/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete template');
}

// ── Groups API ─────────────────────────────────────────────────────────────

export interface Group {
  _id: string;
  name: string;
  grade: string;
  subject: string;
  students: string[];
  rubric?: string;
  classCode: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function listGroups(): Promise<Group[]> {
  const res = await authFetch(`${BASE_URL}/groups`);
  if (!res.ok) throw new Error('Failed to fetch groups');
  return res.json();
}

export async function createGroup(data: {
  name: string;
  grade: string;
  subject: string;
  rubric?: string;
  students?: string[];
}): Promise<Group> {
  const res = await authFetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create group');
  return res.json();
}

export async function updateGroup(id: string, data: Partial<Group>): Promise<Group> {
  const res = await authFetch(`${BASE_URL}/groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update group');
  return res.json();
}

export async function deleteGroup(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/groups/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete group');
}

// ── Assigned Assignments API ───────────────────────────────────────────────

export interface AssignedAssignment {
  _id: string;
  assignmentId: any; // populated Assignment
  groupId: any;       // populated Group
  dueDate: string;
  hintsEnabled: boolean;
  durationMinutes: number | null;
  createdAt: string;
}

export async function listAssigned(): Promise<AssignedAssignment[]> {
  const res = await authFetch(`${BASE_URL}/assigned`);
  if (!res.ok) throw new Error('Failed to fetch assigned assignments');
  return res.json();
}

export async function createAssigned(data: {
  assignmentId: string;
  groupId: string;
  dueDate: string;
  hintsEnabled?: boolean;
  durationMinutes?: number | null;
}): Promise<AssignedAssignment> {
  const res = await authFetch(`${BASE_URL}/assigned`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to assign assessment');
  }
  return res.json();
}

export async function deleteAssigned(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/assigned/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete assigned assignment');
}

export async function listSubmissions(assignedId: string): Promise<any[]> {
  const res = await authFetch(`${BASE_URL}/assigned/${assignedId}/submissions`);
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
}

export async function updateSubmission(
  assignedId: string,
  studentName: string,
  data: { totalScore?: number; totalMarks?: number; answers?: any[] }
): Promise<any> {
  const res = await authFetch(`${BASE_URL}/assigned/${assignedId}/submissions/${encodeURIComponent(studentName)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update submission');
  return res.json();
}

// ── Reports API ─────────────────────────────────────────────────────────────

export interface StudentReportSummary {
  studentName: string;
  email: string | null;
  isRegistered: boolean;
  groups: { id: string; name: string; grade: string; subject: string }[];
  assignmentsAssigned: number;
  assignmentsCompleted: number;
  assignmentAverageScore: number | null;
  practicesCount: number;
  practicesAverageScore: number | null;
}

export interface DetailedStudentReport {
  studentName: string;
  email: string | null;
  isRegistered: boolean;
  groups: { id: string; name: string; grade: string; subject: string }[];
  weakTopics: { topic: string; accuracy: number; totalMarks: number; source: 'assignment' | 'practice' | 'both' }[];
  strongTopics: { topic: string; accuracy: number; totalMarks: number; source: 'assignment' | 'practice' | 'both' }[];
  timeline: { type: 'assignment' | 'practice'; title: string; score: number; totalMarks: number; percentage: number; date: string }[];
  struggleNotes: { type: 'assignment' | 'practice'; topic: string; scoreText: string; questionText?: string; feedback: string; date: string }[];
  logs: {
    assignments: {
      title: string;
      subject: string;
      dueDate: string;
      score: number;
      totalMarks: number;
      percentage: number | null;
      submittedAt: string | null;
      autoSubmitted: boolean;
    }[];
    practices: {
      topic: string;
      subject: string;
      score: number;
      totalMarks: number;
      percentage: number | null;
      submittedAt: string;
    }[];
  };
}

export async function listStudentReports(): Promise<StudentReportSummary[]> {
  const res = await authFetch(`${BASE_URL}/reports/students`);
  if (!res.ok) throw new Error('Failed to fetch student reports');
  return res.json();
}

export async function getDetailedStudentReport(email: string): Promise<DetailedStudentReport> {
  const res = await authFetch(`${BASE_URL}/reports/student/${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error('Failed to fetch detailed student report');
  return res.json();
}
