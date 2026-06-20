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
  aiIgnoreHandwriting?: boolean;
  aiStrictSpelling?: boolean;
  aiPartialFormulas?: boolean;
  aiLatePenalty?: number;
  aiCustomDirectives?: string[];
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

// ── Admin API Methods ─────────────────────────────────────────────────────────

export interface AdminStats {
  schoolName: string;
  branch?: string;
  schoolCode?: string;
  board?: string;
  planStatus: string;
  creditsLimit: number;
  creditsUsed: number;
  teachersCount: number;
  groupsCount: number;
  studentsCount: number;
}

export interface AdminTeacher {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  creditsLimit: number;
  creditsUsed: number;
  createdAt: string;
}

export interface AdminAuditLog {
  _id: string;
  actorId: string;
  actorModel: string;
  actorName: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('classplus_admin_token') || '' : '';
  const headers = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await adminFetch(`${BASE_URL}/admin/stats`);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Failed to fetch admin stats');
  }
  return res.json();
}

export async function listAdminTeachers(): Promise<AdminTeacher[]> {
  const res = await adminFetch(`${BASE_URL}/admin/teachers`);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Failed to fetch teachers');
  }
  return res.json();
}

export async function addAdminTeacher(data: { email: string; firstName?: string; lastName?: string }): Promise<AdminTeacher> {
  const res = await adminFetch(`${BASE_URL}/admin/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('FORBIDDEN');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add teacher');
  }
  return res.json();
}

export async function listAdminGroups(): Promise<Group[]> {
  const res = await adminFetch(`${BASE_URL}/admin/groups`);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Failed to fetch school groups');
  }
  return res.json();
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const res = await adminFetch(`${BASE_URL}/admin/audit-logs`);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Failed to fetch audit logs');
  }
  return res.json();
}

export async function loginAdminUser(data: {
  email: string;
  password: string;
}): Promise<{ message: string; token: string; user: any }> {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to login admin');
  }
  return res.json();
}

export async function claimAdminRole(data: {
  setupToken: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ message: string; token: string; role: string; institutionId: string; user: any }> {
  const res = await fetch(`${BASE_URL}/admin/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to claim Admin role');
  }
  return res.json();
}

export async function registerAdminSchool(data: {
  name: string;
  branch?: string;
  board?: string;
  address?: string;
  schoolCode?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ message: string; token: string; role: string; institutionId: string; user: any }> {
  const res = await fetch(`${BASE_URL}/admin/register-school`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to register school');
  }
  return res.json();
}

/**
 * Helper to fetch Super Admin endpoints using x-superadmin-token
 */
export async function superAdminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const secretKey = typeof window !== 'undefined' ? localStorage.getItem('classplus_superadmin_secret') || '' : '';
  const headers = {
    'Content-Type': 'application/json',
    'x-superadmin-token': secretKey,
    ...options.headers,
  };
  return fetch(url, {
    ...options,
    headers,
  });
}

export interface SuperAdminInstitution {
  _id: string;
  name: string;
  address?: string;
  board?: string;
  branch?: string;
  schoolCode?: string;
  creditsLimit: number;
  creditsUsed: number;
  planStatus: string;
  teachersCount: number;
  adminsCount: number;
  admins: string[];
  createdAt: string;
}

export interface SuperAdminPaginatedInstitutions {
  docs: SuperAdminInstitution[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  stats?: {
    globalCount: number;
    totalCreditsLimit: number;
    totalCreditsUsed: number;
  };
}

export interface SuperAdminInstitutionDetail {
  institution: SuperAdminInstitution;
  teachers: any[];
  admins: any[];
  groups: any[];
  students: any[];
  auditLogs: any[];
}

export async function superAdminListInstitutions(
  page?: number,
  limit?: number,
  search?: string
): Promise<SuperAdminPaginatedInstitutions> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (search) params.append('search', search);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions${queryString}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch institutions list');
  }
  return res.json();
}

export async function superAdminCreateInstitution(data: Partial<SuperAdminInstitution> & {
  adminEmail?: string;
  adminPassword?: string;
  adminFirstName?: string;
  adminLastName?: string;
}): Promise<SuperAdminInstitution> {
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create institution');
  }
  return res.json();
}

export async function superAdminUpdateInstitution(id: string, data: Partial<SuperAdminInstitution>): Promise<SuperAdminInstitution> {
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update institution');
  }
  return res.json();
}

export async function superAdminDeleteInstitution(id: string): Promise<{ message: string }> {
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete institution');
  }
  return res.json();
}

export async function superAdminGetInstitutionDetail(id: string): Promise<SuperAdminInstitutionDetail> {
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions/${id}/detail`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch institution details');
  }
  return res.json();
}

export async function superAdminCreateAdmin(id: string, data: any): Promise<any> {
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions/${id}/admins`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create admin account');
  }
  return res.json();
}

export async function superAdminDeleteAdmin(id: string, adminId: string): Promise<any> {
  const res = await superAdminFetch(`${BASE_URL}/superadmin/institutions/${id}/admins/${adminId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete admin account');
  }
  return res.json();
}


// ── Announcements API ────────────────────────────────────────────────────────

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

export async function listAnnouncements(groupId: string): Promise<Announcement[]> {
  const res = await authFetch(`${BASE_URL}/announcements/group/${groupId}`);
  if (!res.ok) throw new Error('Failed to fetch announcements');
  return res.json();
}

export async function createAnnouncement(data: {
  groupId: string;
  title: string;
  content: string;
  attachments?: string[];
}): Promise<Announcement> {
  const res = await authFetch(`${BASE_URL}/announcements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create announcement');
  }
  return res.json();
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/announcements/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete announcement');
}

// ==========================================
// Parent Portal Endpoints
// ==========================================

export async function parentLinkChild(inviteCode: string, relationship = 'Guardian'): Promise<any> {
  const res = await authFetch(`${BASE_URL}/parent/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inviteCode, relationship }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to link child');
  }
  return res.json();
}

export async function parentGetChildren(): Promise<any[]> {
  const res = await authFetch(`${BASE_URL}/parent/children`);
  if (!res.ok) throw new Error('Failed to fetch linked children');
  return res.json();
}

export async function parentGetDashboard(studentId: string): Promise<any> {
  const res = await authFetch(`${BASE_URL}/parent/children/${studentId}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch child dashboard details');
  return res.json();
}

export async function generateParentInvite(groupId: string, studentId: string): Promise<{ inviteCode: string }> {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}/students/${studentId}/parent-invite`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate parent invite code');
  }
  return res.json();
}

// ==========================================
// Item Bank Endpoints
// ==========================================

export async function saveToBank(questionData: any): Promise<any> {
  const res = await authFetch(`${BASE_URL}/bank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save question to Item Bank');
  }
  return res.json();
}

export async function listBankQuestions(filters: any = {}): Promise<any[]> {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      params.append(key, filters[key]);
    }
  });

  const queryString = params.toString();
  const url = `${BASE_URL}/bank${queryString ? `?${queryString}` : ''}`;
  
  const res = await authFetch(url);
  if (!res.ok) throw new Error('Failed to fetch bank questions');
  return res.json();
}

export async function deleteFromBank(id: string): Promise<void> {
  const res = await authFetch(`${BASE_URL}/bank/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete question from Item Bank');
}

export async function getGroupRoster(groupId: string): Promise<any[]> {
  const res = await authFetch(`${BASE_URL}/groups/${groupId}/roster`);
  if (!res.ok) throw new Error('Failed to fetch group roster');
  return res.json();
}

export interface SyllabusExploreResult {
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

export async function exploreSyllabus(
  grade: string,
  subject: string,
  topic: string
): Promise<SyllabusExploreResult> {
  const res = await authFetch(`${BASE_URL}/templates/syllabus/explore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grade, subject, topic }),
  });
  if (!res.ok) throw new Error('Failed to explore syllabus');
  return res.json();
}


