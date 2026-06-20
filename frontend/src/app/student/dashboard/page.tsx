// src/app/student/dashboard/page.tsx — Complete Student Portal
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, ClipboardList, CheckCircle2, Clock, Brain, ArrowRight,
  BookOpen, LogOut, Trophy, Upload, Star, Search, Sparkles, AlertCircle,
  RefreshCw, Check, X, FileText, ChevronRight, MessageSquare, History,
  Play, Send, Trash2, PlusCircle, Calendar, Award, Home, BarChart2,
  TrendingUp, TrendingDown, Zap, Target, BookMarked, Flame, Bell,
  ChevronDown, ChevronUp, Filter, SortAsc, Eye, EyeOff, Lightbulb,
  CheckSquare, Circle, Minus, AlertTriangle, Info
} from 'lucide-react';
import { useStudentStore, StudentGroup } from '@/store/studentStore';
import {
  StudentAssignmentItem,
  getStudentSession,
  generatePracticeQuiz,
  submitPracticeQuiz,
  getPracticeHistory,
  exploreSyllabus,
  tutorChat,
  joinClassGroup,
  PracticeQuiz,
  GradedPracticeAnswer,
  SyllabusExplorerResponse,
  getGroupAnnouncements,
  Announcement
} from '@/lib/studentApi';
import { getSyllabusChapters } from '@/lib/syllabusData';

type TabType = 'home' | 'assignments' | 'progress' | 'practice' | 'syllabus' | 'tutor';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeFromPct(pct: number) {
  if (pct >= 90) return { letter: 'A+', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (pct >= 80) return { letter: 'A',  color: 'text-emerald-500 bg-emerald-50 border-emerald-200' };
  if (pct >= 70) return { letter: 'B',  color: 'text-blue-500 bg-blue-50 border-blue-200' };
  if (pct >= 60) return { letter: 'C',  color: 'text-amber-500 bg-amber-50 border-amber-200' };
  return { letter: 'D', color: 'text-red-500 bg-red-50 border-red-200' };
}

function formatDueDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

function getDueDateProximity(dateStr: string): 'overdue' | 'urgent' | 'warning' | 'normal' {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'normal';
    const diffDays = Math.ceil((d.getTime() - Date.now()) / 86400000);
    if (diffDays <= 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'warning';
    return 'normal';
  } catch { return 'normal'; }
}

function getDaysUntilDue(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    return Math.ceil((d.getTime() - Date.now()) / 86400000);
  } catch { return 99; }
}

function formatSubmittedAt(dateStr: string | null) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStudyStreak(quizHistory: PracticeQuiz[]): number {
  if (!quizHistory.length) return 0;
  const dates = quizHistory
    .map(q => new Date(q.submittedAt || q.createdAt).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const d of dates) {
    const dObj = new Date(d);
    dObj.setHours(0, 0, 0, 0);
    const diff = Math.round((checkDate.getTime() - dObj.getTime()) / 86400000);
    if (diff === 0 || diff === 1) { streak++; checkDate = dObj; }
    else break;
  }
  return streak;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StudyNote {
  id: string;
  subject: string;
  content: string;
  createdAt: string;
  color: string;
}

const NOTE_COLORS = [
  'bg-yellow-50 border-yellow-200',
  'bg-blue-50 border-blue-200',
  'bg-green-50 border-green-200',
  'bg-purple-50 border-purple-200',
  'bg-pink-50 border-pink-200',
];

const SUGGESTED_QUESTIONS = [
  "Explain Newton's Laws of Motion with examples",
  "What is photosynthesis and how does it work?",
  "How do you solve quadratic equations?",
  "What causes seasons on Earth?",
  "Explain the water cycle",
  "What is the difference between acids and bases?",
];

// ─── Countdown Timer Component ─────────────────────────────────────────────
function Countdown({ dueDate }: { dueDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    function update() {
      const diff = new Date(dueDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Overdue'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setTimeLeft(`${d}d ${h}h left`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m left`);
      else setTimeLeft(`${m}m left`);
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [dueDate]);

  const prox = getDueDateProximity(dueDate);
  const cls = prox === 'overdue' ? 'text-red-600' : prox === 'urgent' ? 'text-amber-600 font-bold' : prox === 'warning' ? 'text-yellow-700' : 'text-slate-500';
  return <span className={`text-[10px] font-semibold ${cls}`}>{timeLeft}</span>;
}

// ─── Subject Progress Bar ────────────────────────────────────────────────────
function SubjectBar({ subject, score, max, color }: { subject: string; score: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-700">{subject}</span>
        <span className="text-xs font-bold text-slate-800">{pct}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-[10px] text-slate-400">{score} / {max} marks</span>
    </div>
  );
}

// ─── Mini Score Badge ────────────────────────────────────────────────────────
function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const { letter, color } = gradeFromPct(pct);
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${color}`}>
      {letter} · {pct}%
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const router = useRouter();
  const { studentName, studentEmail, groups, setSession, clearSession, _hasHydrated } = useStudentStore();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState<string>('all');

  // Join Class
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinClassCode, setJoinClassCode] = useState('');
  const [joinRosterName, setJoinRosterName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Assignments
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [assignmentSort, setAssignmentSort] = useState<'dueDate' | 'subject' | 'marks'>('dueDate');

  // Practice Lab
  const [practiceHistory, setPracticeHistory] = useState<PracticeQuiz[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState('');
  const [practiceNumQuestions, setPracticeNumQuestions] = useState(5);
  const [practiceType, setPracticeType] = useState('Mixed');
  const [activeQuiz, setActiveQuiz] = useState<PracticeQuiz | null>(null);
  const [activeQuizAnswers, setActiveQuizAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [viewHistoryQuiz, setViewHistoryQuiz] = useState<PracticeQuiz | null>(null);

  // Syllabus
  const [syllabusTopic, setSyllabusTopic] = useState('');
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusResult, setSyllabusResult] = useState<SyllabusExplorerResponse | null>(null);
  const [syllabusError, setSyllabusError] = useState('');
  const [expandedBqId, setExpandedBqId] = useState<string | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  // Announcements Feed
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // AI Tutor
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState('');
  const tutorBottomRef = useRef<HTMLDivElement>(null);
  const tutorInputRef = useRef<HTMLInputElement>(null);

  // Study Notes (localStorage)
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Notifications (derived)
  const [showNotifications, setShowNotifications] = useState(false);

  // ── Session load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!studentName || !studentEmail) { router.push('/student'); return; }

    let mounted = true;
    setLoading(true);

    getStudentSession(studentEmail)
      .then(data => {
        if (!mounted) return;
        setSession(data.student, data.email, data.groups, data.token);
        setAssignments(data.assignments);
        sessionStorage.setItem('student_assignments', JSON.stringify(data.assignments));
      })
      .catch((err) => {
        console.error('Failed to restore student session:', err);
        if (mounted) {
          clearSession();
          sessionStorage.removeItem('student_assignments');
          router.push('/student');
        }
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [_hasHydrated, studentName, studentEmail, router, setSession]);

  // ── Load announcements feed ──────────────────────────────────────────────
  useEffect(() => {
    if (!_hasHydrated || !studentEmail) return;
    let mounted = true;
    setSelectedChapterIndex(0); // Reset chapter selection when student switches classes

    if (activeGroupId !== 'all') {
      setAnnouncementsLoading(true);
      getGroupAnnouncements(activeGroupId)
        .then(data => {
          if (mounted) setAnnouncements(data);
        })
        .catch(() => {
          if (mounted) setAnnouncements([]);
        })
        .finally(() => {
          if (mounted) setAnnouncementsLoading(false);
        });
    } else {
      if (groups.length > 0) {
        setAnnouncementsLoading(true);
        Promise.all(groups.map(g => getGroupAnnouncements(g._id).catch(() => [])))
          .then(results => {
            if (mounted) {
              const all = results
                .flat()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setAnnouncements(all);
            }
          })
          .catch(() => {
            if (mounted) setAnnouncements([]);
          })
          .finally(() => {
            if (mounted) setAnnouncementsLoading(false);
          });
      } else {
        setAnnouncements([]);
      }
    }

    return () => { mounted = false; };
  }, [activeGroupId, groups, _hasHydrated, studentEmail]);

  // ── Load practice history when switching tabs ────────────────────────────
  useEffect(() => {
    if ((activeTab === 'practice' || activeTab === 'progress' || activeTab === 'home') && studentEmail) {
      loadPracticeHistory();
    }
  }, [activeTab]);

  // ── Load tutor history ───────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'tutor') {
      const saved = sessionStorage.getItem('tutor_history');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTutorMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } catch {}
      }
    }
  }, [activeTab]);

  // ── Load notes ───────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`study_notes_${studentEmail}`);
      if (saved) setNotes(JSON.parse(saved));
    } catch {}
  }, [studentEmail]);

  // ── Scroll tutor ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'tutor' && tutorMessages.length > 0) {
      tutorBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, activeTab]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeGroup = groups.find(g => g._id === activeGroupId) || null;

  const filteredAssignments = assignments.filter(item => {
    if (activeGroupId !== 'all' && item.groupId !== activeGroupId) return false;
    return true;
  });

  const pending   = filteredAssignments.filter(a => !a.submission?.submittedAt && a.assignment.status === 'done');
  const completed = filteredAssignments.filter(a => !!a.submission?.submittedAt);

  const sortedPending = [...pending].sort((a, b) => {
    if (assignmentSort === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (assignmentSort === 'subject') return a.assignment.subject.localeCompare(b.assignment.subject);
    if (assignmentSort === 'marks') return b.assignment.totalMarks - a.assignment.totalMarks;
    return 0;
  });

  const avgScore = completed.length
    ? Math.round(completed.reduce((s, a) => {
        const pct = a.submission!.totalMarks > 0 ? (a.submission!.totalScore / a.submission!.totalMarks) * 100 : 0;
        return s + pct;
      }, 0) / completed.length)
    : 0;

  const studyStreak = getStudyStreak(practiceHistory);

  // ── Subject-wise performance ─────────────────────────────────────────────
  const subjectPerformance = React.useMemo(() => {
    const map: Record<string, { score: number; total: number; count: number }> = {};
    completed.forEach(a => {
      const sub = a.assignment.subject;
      if (!map[sub]) map[sub] = { score: 0, total: 0, count: 0 };
      map[sub].score += a.submission!.totalScore;
      map[sub].total += a.submission!.totalMarks;
      map[sub].count += 1;
    });
    return Object.entries(map).map(([subject, v]) => ({ subject, ...v }));
  }, [completed]);

  // ── Upcoming deadlines (next 7 days) ─────────────────────────────────────
  const upcomingDeadlines = pending
    .filter(a => getDaysUntilDue(a.dueDate) <= 7)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifications = [
    ...upcomingDeadlines.map(a => ({
      id: a._id,
      type: getDaysUntilDue(a.dueDate) <= 1 ? 'urgent' : 'info',
      message: getDaysUntilDue(a.dueDate) <= 0
        ? `"${a.assignment.title}" is overdue!`
        : `"${a.assignment.title}" due in ${getDaysUntilDue(a.dueDate)} day(s)`,
    })),
    ...(studyStreak >= 3 ? [{ id: 'streak', type: 'success', message: `🔥 ${studyStreak}-day study streak! Keep it up!` }] : []),
  ];

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    clearSession();
    sessionStorage.removeItem('student_assignments');
    sessionStorage.removeItem('tutor_history');
    router.push('/student');
  };

  const loadPracticeHistory = async () => {
    if (!studentEmail) return;
    setPracticeLoading(true);
    try {
      const h = await getPracticeHistory(studentEmail);
      setPracticeHistory(h);
    } catch {}
    finally { setPracticeLoading(false); }
  };

  const handleJoinClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinClassCode.trim() || !joinRosterName.trim() || !studentEmail) return;
    setJoinLoading(true); setJoinError('');
    try {
      const data = await joinClassGroup(studentEmail, joinClassCode.trim(), joinRosterName.trim());
      setSession(data.student, data.email, data.groups, data.token);
      setAssignments(data.assignments);
      sessionStorage.setItem('student_assignments', JSON.stringify(data.assignments));
      const nj = data.groups.find((g: any) => g.classCode === joinClassCode.toUpperCase().trim());
      if (nj) setActiveGroupId(nj._id);
      setJoinModalOpen(false); setJoinClassCode(''); setJoinRosterName('');
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join class. Verify code and roster name.');
    } finally { setJoinLoading(false); }
  };

  const handleGeneratePracticeQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTopic.trim() || !studentName || !studentEmail) return;
    const subject = activeGroup?.subject || 'General Science';
    const grade = activeGroup?.grade || '8th';
    setPracticeLoading(true);
    try {
      const quiz = await generatePracticeQuiz({
        studentEmail, studentName,
        classCode: activeGroup?.classCode,
        subject, grade,
        topic: practiceTopic.trim(),
        numQuestions: practiceNumQuestions,
        type: practiceType,
      });
      setActiveQuiz(quiz);
      setActiveQuizAnswers({});
      setCurrentQuestionIdx(0);
      setQuizResult(null);
      setViewHistoryQuiz(null);
    } catch (err: any) {
      alert(err.message || 'Failed to generate practice test.');
    } finally { setPracticeLoading(false); }
  };

  const handleAnswerChange = (qId: string, value: string) =>
    setActiveQuizAnswers(prev => ({ ...prev, [qId]: value }));

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    setQuizSubmitting(true);
    try {
      const answersList = Object.entries(activeQuizAnswers).map(([questionId, answer]) => ({ questionId, answer }));
      const result = await submitPracticeQuiz(activeQuiz._id, answersList);
      setQuizResult(result);
      loadPracticeHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to submit practice test.');
    } finally { setQuizSubmitting(false); }
  };

  const selectSyllabusTopicAndQuery = async (topic: string) => {
    setSyllabusTopic(topic);
    setSyllabusLoading(true); setSyllabusError(''); setSyllabusResult(null);
    try {
      const result = await exploreSyllabus({
        grade: activeGroup?.grade || '8th',
        subject: activeGroup?.subject || 'Science',
        topic: topic.trim(),
      });
      setSyllabusResult(result);
    } catch (err: any) {
      setSyllabusError(err.message || 'Syllabus mapping failed. Please try again.');
    } finally { setSyllabusLoading(false); }
  };

  const handleSyllabusExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusTopic.trim()) return;
    await selectSyllabusTopicAndQuery(syllabusTopic);
  };

  const handleSendTutorMessage = async (text: string) => {
    if (!text.trim() || tutorLoading) return;
    setTutorInput(''); setTutorError('');
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setTutorMessages(prev => [...prev, userMsg]);
    setTutorLoading(true);
    try {
      const history = tutorMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { reply } = await tutorChat(text, history, activeGroup?.subject, activeGroup?.grade);
      const aMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: new Date() };
      setTutorMessages(prev => {
        const updated = [...prev, aMsg];
        sessionStorage.setItem('tutor_history', JSON.stringify(updated));
        return updated;
      });
    } catch {
      setTutorError('AI tutor is temporarily unavailable. Please try again.');
      setTutorMessages(prev => prev.slice(0, -1));
    } finally {
      setTutorLoading(false);
      setTimeout(() => tutorInputRef.current?.focus(), 100);
    }
  };

  const clearTutorHistory = () => { setTutorMessages([]); sessionStorage.removeItem('tutor_history'); };

  // Study Notes
  const saveNote = () => {
    if (!newNoteContent.trim()) return;
    const note: StudyNote = {
      id: Date.now().toString(),
      subject: newNoteSubject || (activeGroup?.subject || 'General'),
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      color: NOTE_COLORS[notes.length % NOTE_COLORS.length],
    };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem(`study_notes_${studentEmail}`, JSON.stringify(updated));
    setNewNoteContent(''); setNewNoteSubject(''); setShowNoteForm(false);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`study_notes_${studentEmail}`, JSON.stringify(updated));
  };

  const SUBJECT_BAR_COLORS = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-violet-500',
  ];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#10375C]/20 border-t-[#10375C] rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // ── Tabs config ───────────────────────────────────────────────────────────
  const TABS = [
    { id: 'home',        label: 'Home',       icon: <Home className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'progress',   label: 'Progress',    icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'practice',   label: 'Practice Lab',icon: <Trophy className="w-4 h-4" /> },
    { id: 'syllabus',   label: 'Syllabus',    icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tutor',      label: 'AI Tutor',    icon: <Brain className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#10375C] flex items-center justify-center shadow-md">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black text-slate-900 tracking-tight">classPlus</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">Student Portal</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-white text-[#10375C] shadow-sm'
                    : 'text-slate-500 hover:text-[#10375C]'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'assignments' && pending.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {pending.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Class selector */}
            {groups.length > 0 && (
              <select
                value={activeGroupId}
                onChange={e => setActiveGroupId(e.target.value)}
                className="hidden sm:block text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none cursor-pointer font-semibold"
              >
                <option value="all">All Classes</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id}>{g.grade} {g.subject}</option>
                ))}
              </select>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(p => !p)}
                className="relative w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <Bell className="w-3.5 h-3.5 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 flex items-start gap-3 ${n.type === 'urgent' ? 'bg-red-50' : n.type === 'success' ? 'bg-green-50' : 'bg-white'}`}>
                          {n.type === 'urgent' ? <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                           : n.type === 'success' ? <Flame className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                           : <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
                          <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{studentName}</span>
              <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{studentEmail}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex overflow-x-auto gap-1 border-t border-slate-100 p-1.5 bg-slate-50 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 relative ${
                activeTab === tab.id
                  ? 'bg-[#10375C] text-white'
                  : 'text-slate-500 bg-white border border-slate-200 hover:text-[#10375C]'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'assignments' && pending.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">{pending.length}</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col gap-6">
        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1 — HOME / OVERVIEW
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">

              {/* Greeting Banner */}
              <div className="bg-[#10375C] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden shadow-xl shadow-[#10375C]/20">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-xl">
                    👋
                  </div>
                  <div>
                    <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">{getGreeting()}</p>
                    <h1 className="text-xl font-black tracking-tight">{studentName?.split(' ')[0] || studentName}</h1>
                    <p className="text-blue-100/80 text-xs mt-0.5">
                      {groups.length} class{groups.length !== 1 ? 'es' : ''} enrolled
                      {studyStreak > 0 && <span className="ml-2">· 🔥 {studyStreak}-day streak</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative">
                  {groups.length > 0 && (
                    <select
                      value={activeGroupId}
                      onChange={e => setActiveGroupId(e.target.value)}
                      className="text-xs bg-white/15 border border-white/25 rounded-xl px-3 py-2 text-white outline-none cursor-pointer font-bold"
                    >
                      <option value="all" className="bg-[#10375C]">All Classes</option>
                      {groups.map(g => (
                        <option key={g._id} value={g._id} className="bg-[#10375C]">{g.grade} {g.subject}</option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => setJoinModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl transition-all shadow-md"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Join Class
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Pending', value: pending.length, sub: 'assignments', icon: <Clock className="w-5 h-5" />, bg: 'bg-amber-50', border: 'border-amber-100', icon_color: 'text-amber-500', val_color: 'text-amber-700', action: () => setActiveTab('assignments') },
                  { label: 'Completed', value: completed.length, sub: 'submitted', icon: <CheckCircle2 className="w-5 h-5" />, bg: 'bg-emerald-50', border: 'border-emerald-100', icon_color: 'text-emerald-500', val_color: 'text-emerald-700', action: () => setActiveTab('assignments') },
                  { label: 'Avg Score', value: `${avgScore}%`, sub: 'overall', icon: <Trophy className="w-5 h-5" />, bg: 'bg-indigo-50', border: 'border-indigo-100', icon_color: 'text-indigo-500', val_color: 'text-indigo-700', action: () => setActiveTab('progress') },
                  { label: 'Practice Tests', value: practiceHistory.length, sub: 'completed', icon: <Zap className="w-5 h-5" />, bg: 'bg-violet-50', border: 'border-violet-100', icon_color: 'text-violet-500', val_color: 'text-violet-700', action: () => setActiveTab('practice') },
                ].map(stat => (
                  <button
                    key={stat.label}
                    onClick={stat.action}
                    className={`${stat.bg} border ${stat.border} rounded-2xl p-4 flex flex-col gap-2 text-left hover:shadow-md transition-all group`}
                  >
                    <div className={`${stat.icon_color}`}>{stat.icon}</div>
                    <div>
                      <p className={`text-xl font-black ${stat.val_color}`}>{stat.value}</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-[10px] text-slate-400">{stat.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT — Upcoming Deadlines & Announcements */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Upcoming Deadlines */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Upcoming Deadlines
                      </h2>
                      <button onClick={() => setActiveTab('assignments')} className="text-xs text-[#10375C] font-bold hover:underline flex items-center gap-0.5">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {upcomingDeadlines.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-600">All caught up!</p>
                          <p className="text-xs text-slate-400 mt-1">No deadlines in the next 7 days.</p>
                        </div>
                      ) : upcomingDeadlines.map(item => {
                        const prox = getDueDateProximity(item.dueDate);
                        return (
                          <div key={item._id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-2 h-8 rounded-full flex-shrink-0 ${prox === 'overdue' ? 'bg-red-500' : prox === 'urgent' ? 'bg-amber-500' : prox === 'warning' ? 'bg-yellow-400' : 'bg-indigo-400'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.assignment.title}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{item.assignment.subject} · {item.assignment.totalMarks} marks</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Countdown dueDate={item.dueDate} />
                              <button
                                onClick={() => router.push(`/student/assignment/${item._id}`)}
                                className="text-[11px] font-bold bg-[#10375C] text-white px-3 py-1.5 rounded-lg hover:bg-[#0d2f4f] transition-colors"
                              >
                                Start
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Class Announcements */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-500" />
                        Class Announcements
                      </h2>
                    </div>
                    <div className="p-5 flex flex-col gap-4">
                      {announcementsLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                          <div className="w-4 h-4 border-2 border-indigo-550 border-t-indigo-500 rounded-full animate-spin" />
                          <span className="text-xs text-slate-400">Loading announcements...</span>
                        </div>
                      ) : announcements.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No announcements posted in your class groups.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {announcements.map((ann) => (
                            <div key={ann._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-slate-800">{ann.title}</h4>
                                <span className="text-[9px] text-slate-400 font-semibold">{new Date(ann.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-slate-650 mt-1.5 leading-relaxed whitespace-pre-line">{ann.content}</p>
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                <div className="w-4 h-4 rounded-full bg-[#10375C] text-white flex items-center justify-center text-[8px] font-bold">
                                  {ann.teacherName.charAt(0)}
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold">{ann.teacherName} (Teacher)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Quick Actions + My Classes */}
                <div className="flex flex-col gap-4">

                  {/* Quick Actions */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: 'New Practice Quiz', icon: <Sparkles className="w-4 h-4 text-violet-500" />, action: () => setActiveTab('practice'), bg: 'bg-violet-50 hover:bg-violet-100' },
                        { label: 'Ask AI Tutor', icon: <Brain className="w-4 h-4 text-indigo-500" />, action: () => setActiveTab('tutor'), bg: 'bg-indigo-50 hover:bg-indigo-100' },
                        { label: 'Explore Syllabus', icon: <BookOpen className="w-4 h-4 text-emerald-500" />, action: () => setActiveTab('syllabus'), bg: 'bg-emerald-50 hover:bg-emerald-100' },
                        { label: 'View Progress', icon: <TrendingUp className="w-4 h-4 text-amber-500" />, action: () => setActiveTab('progress'), bg: 'bg-amber-50 hover:bg-amber-100' },
                      ].map(qa => (
                        <button
                          key={qa.label}
                          onClick={qa.action}
                          className={`${qa.bg} rounded-xl p-3 flex items-center gap-3 transition-colors text-left`}
                        >
                          {qa.icon}
                          <span className="text-xs font-bold text-slate-700">{qa.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* My Classes */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Classes</h3>
                      <button onClick={() => setJoinModalOpen(true)} className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5">
                        <PlusCircle className="w-3 h-3" /> Join
                      </button>
                    </div>
                    {groups.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-slate-400">No classes yet. Join one!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {groups.map((g, i) => (
                          <button
                            key={g._id}
                            onClick={() => { setActiveGroupId(g._id); setActiveTab('assignments'); }}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 ${['bg-indigo-500','bg-emerald-500','bg-amber-500','bg-pink-500','bg-cyan-500'][i % 5]}`}>
                              {g.subject.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{g.grade} {g.subject}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{g.classCode}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Study Notes */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    My Study Notes
                  </h2>
                  <button
                    onClick={() => setShowNoteForm(p => !p)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#10375C] bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Note
                  </button>
                </div>

                {/* Note form */}
                <AnimatePresence>
                  {showNoteForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-slate-100 bg-slate-50"
                    >
                      <div className="px-5 py-4 flex flex-col gap-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newNoteSubject}
                            onChange={e => setNewNoteSubject(e.target.value)}
                            placeholder={`Subject (e.g. ${activeGroup?.subject || 'Science'})`}
                            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none bg-white"
                          />
                        </div>
                        <textarea
                          value={newNoteContent}
                          onChange={e => setNewNoteContent(e.target.value)}
                          placeholder="Write your study note, key formula, or revision point..."
                          rows={3}
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none bg-white resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setShowNoteForm(false)} className="text-xs text-slate-500 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
                          <button onClick={saveNote} className="text-xs font-bold text-white bg-[#10375C] px-4 py-1.5 rounded-lg hover:bg-[#0d2f4f] transition-colors">Save Note</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {notes.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No notes yet. Add your first study note!</p>
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {notes.map(note => (
                      <div key={note.id} className={`${note.color} border rounded-xl p-3.5 flex flex-col gap-2 relative group`}>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{note.subject}</span>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{note.content}</p>
                        <p className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2 — ASSIGNMENTS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'assignments' && (
            <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Pending', value: pending.length, icon: <Clock className="w-4 h-4 text-amber-500" />, color: 'bg-amber-50 border-amber-100 text-amber-700' },
                  { label: 'Submitted', value: completed.length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                  { label: 'Avg Score', value: `${avgScore}%`, icon: <Trophy className="w-4 h-4 text-[#10375C]" />, color: 'bg-indigo-50 border-indigo-100 text-[#10375C]' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.color.split(' ')[0]} border ${stat.color.split(' ')[1]} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color.split(' ')[0]} border ${stat.color.split(' ')[1]}`}>{stat.icon}</div>
                    <div>
                      <p className="text-lg font-black text-slate-800">{stat.value}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters & Sort */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1">
                  {(['all', 'pending', 'completed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setAssignmentFilter(f)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all capitalize ${assignmentFilter === f ? 'bg-white text-[#10375C] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-slate-400 font-semibold">Sort:</span>
                  {(['dueDate', 'subject', 'marks'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setAssignmentSort(s)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${assignmentSort === s ? 'border-[#10375C] text-[#10375C] bg-indigo-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {s === 'dueDate' ? 'Due Date' : s === 'subject' ? 'Subject' : 'Marks'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pending Assignments */}
              {(assignmentFilter === 'all' || assignmentFilter === 'pending') && (
                <section>
                  <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    Pending ({pending.length})
                  </h2>
                  {sortedPending.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600">No pending assignments!</p>
                      <p className="text-xs text-slate-400 mt-1">You're all caught up. Great work! 🎉</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {sortedPending.map((item, i) => {
                        const prox = getDueDateProximity(item.dueDate);
                        const borderMap = { overdue: 'border-l-red-500', urgent: 'border-l-amber-500', warning: 'border-l-yellow-400', normal: 'border-l-indigo-400' };
                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`bg-white border border-slate-200 border-l-4 ${borderMap[prox]} rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all shadow-sm`}
                          >
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-indigo-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold text-slate-800 truncate">{item.assignment.title}</h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{item.assignment.subject} · {item.assignment.grade}</span>
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1"><Award className="w-3 h-3" />{item.assignment.totalMarks} Marks</span>
                                  {(() => {
                                    const days = getDaysUntilDue(item.dueDate);
                                    const colorMap = { overdue: 'text-red-700 bg-red-50 border-red-200', urgent: 'text-amber-700 bg-amber-50 border-amber-200', warning: 'text-yellow-700 bg-yellow-50 border-yellow-200', normal: 'text-slate-600 bg-slate-50 border-slate-200' };
                                    return (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${colorMap[prox]}`}>
                                        <Calendar className="w-3 h-3" />
                                        {prox === 'overdue' ? `Overdue: ${formatDueDate(item.dueDate)}` : `Due: ${formatDueDate(item.dueDate)}`}
                                      </span>
                                    );
                                  })()}
                                  {item.durationMinutes && (
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1"><Clock className="w-3 h-3" />{item.durationMinutes} min</span>
                                  )}
                                </div>
                                <div className="mt-1.5">
                                  <Countdown dueDate={item.dueDate} />
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2.5 items-center">
                              <button onClick={() => router.push(`/student/upload/${item._id}`)} className="flex items-center gap-1.5 text-xs border border-slate-200 hover:border-slate-300 text-slate-600 px-3.5 py-2 rounded-xl font-bold transition-all hover:bg-slate-50">
                                <Upload className="w-3.5 h-3.5" /> Upload
                              </button>
                              <button onClick={() => router.push(`/student/assignment/${item._id}`)} className="flex items-center gap-1.5 text-xs bg-[#10375C] hover:bg-[#0d2f4f] text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md shadow-[#10375C]/15">
                                Start <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* Completed Assignments */}
              {(assignmentFilter === 'all' || assignmentFilter === 'completed') && completed.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Completed ({completed.length})
                  </h2>
                  <div className="flex flex-col gap-3">
                    {completed.map(item => {
                      const pct = item.submission!.totalMarks > 0 ? Math.round((item.submission!.totalScore / item.submission!.totalMarks) * 100) : 0;
                      const { letter, color } = gradeFromPct(pct);
                      return (
                        <div key={item._id} className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 text-sm font-black shadow-sm ${color}`}>{letter}</div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-slate-800 truncate">{item.assignment.title}</h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{item.assignment.subject}</span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  {item.submission!.totalScore}/{item.submission!.totalMarks} ({pct}%)
                                </span>
                                {item.submission?.submittedAt && (
                                  <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />{formatSubmittedAt(item.submission.submittedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => router.push(`/student/results/${item._id}`)} className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl font-bold transition-all">
                            <Star className="w-3.5 h-3.5" /> Review Scorecard
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3 — PROGRESS / ANALYTICS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">

              <div className="bg-[#10375C] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-[#10375C]/20">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Learning Analytics</p>
                <h2 className="text-xl font-black mt-1">Your Progress Report</h2>
                <p className="text-blue-100/70 text-xs mt-1">Based on {completed.length} submitted assignments & {practiceHistory.length} practice quizzes</p>
              </div>

              {/* Top KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Overall Average', value: `${avgScore}%`, icon: <Target className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50 border-indigo-100', change: avgScore >= 70 ? '+Good' : 'Needs work', up: avgScore >= 70 },
                  { label: 'Study Streak', value: `${studyStreak} days`, icon: <Flame className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50 border-orange-100', change: studyStreak > 0 ? 'Active' : 'Start today!', up: studyStreak > 0 },
                  { label: 'Quizzes Taken', value: practiceHistory.length, icon: <Zap className="w-5 h-5 text-violet-500" />, bg: 'bg-violet-50 border-violet-100', change: 'Practice = Mastery', up: true },
                  { label: 'Assignments Done', value: `${completed.length}/${assignments.length}`, icon: <CheckSquare className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50 border-emerald-100', change: assignments.length > 0 ? `${Math.round((completed.length / assignments.length) * 100)}% complete` : 'No assignments yet', up: true },
                ].map(kpi => (
                  <div key={kpi.label} className={`${kpi.bg} border rounded-2xl p-4 shadow-sm`}>
                    <div className="flex items-start justify-between mb-3">
                      {kpi.icon}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpi.up ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                        {kpi.change}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{kpi.value}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-wider">{kpi.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Subject-wise Performance */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-500" />
                    Subject Performance
                  </h3>
                  {subjectPerformance.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">Submit assignments to see subject-wise performance.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {subjectPerformance.map((sp, i) => (
                        <SubjectBar key={sp.subject} subject={sp.subject} score={sp.score} max={sp.total} color={SUBJECT_BAR_COLORS[i % SUBJECT_BAR_COLORS.length]} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Practice Quiz History Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Practice Quiz Trend
                  </h3>
                  {practiceHistory.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">No practice history yet. Take a quiz to track your trend!</p>
                      <button onClick={() => setActiveTab('practice')} className="mt-3 text-xs font-bold text-[#10375C] hover:underline">Start Practice →</button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Mini bar chart - last 8 quizzes */}
                      <div className="flex items-end gap-2 h-28 pt-2">
                        {practiceHistory.slice(-8).map((q, i) => {
                          const pct = q.totalMarks && q.totalMarks > 0 ? Math.round(((q.score || 0) / q.totalMarks) * 100) : 0;
                          const { letter } = gradeFromPct(pct);
                          return (
                            <div key={q._id} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-600">{pct}%</span>
                              <div className="w-full relative rounded-t-md overflow-hidden bg-slate-100" style={{ height: '80px' }}>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.05 }}
                                  className={`absolute bottom-0 w-full rounded-t-md ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold">{letter}</span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">Last {Math.min(8, practiceHistory.length)} quizzes</p>

                      {/* Recent quiz list */}
                      <div className="flex flex-col gap-2 mt-2">
                        {practiceHistory.slice(0, 4).map(q => {
                          const pct = q.totalMarks && q.totalMarks > 0 ? Math.round(((q.score || 0) / q.totalMarks) * 100) : 0;
                          return (
                            <div key={q._id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">{q.topic}</p>
                                <p className="text-[10px] text-slate-400">{q.subject}</p>
                              </div>
                              <ScoreBadge score={q.score || 0} total={q.totalMarks || 1} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Performance Table */}
              {completed.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />Assignment Scorecard</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assignment</th>
                          <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                          <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</th>
                          <th className="text-center px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                          <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {completed.map(item => {
                          const pct = item.submission!.totalMarks > 0 ? Math.round((item.submission!.totalScore / item.submission!.totalMarks) * 100) : 0;
                          const { letter, color } = gradeFromPct(pct);
                          return (
                            <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5">
                                <button onClick={() => router.push(`/student/results/${item._id}`)} className="text-xs font-semibold text-slate-800 hover:text-[#10375C] hover:underline text-left truncate max-w-[200px] block">
                                  {item.assignment.title}
                                </button>
                              </td>
                              <td className="px-4 py-3.5"><span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{item.assignment.subject}</span></td>
                              <td className="px-4 py-3.5 text-center">
                                <span className="text-xs font-bold text-slate-800">{item.submission!.totalScore}/{item.submission!.totalMarks}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`text-[11px] font-black px-2 py-0.5 rounded border ${color}`}>{letter}</span>
                              </td>
                              <td className="px-5 py-3.5 text-right text-[10px] text-slate-400">{formatSubmittedAt(item.submission?.submittedAt || null)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Strength & Weakness Analysis */}
              {subjectPerformance.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4" />Strongest Subject</h4>
                    {(() => {
                      const best = [...subjectPerformance].sort((a, b) => (b.score / b.total) - (a.score / a.total))[0];
                      return best ? (
                        <div>
                          <p className="text-lg font-black text-emerald-700">{best.subject}</p>
                          <p className="text-sm text-emerald-600">{Math.round((best.score / best.total) * 100)}% average</p>
                          <p className="text-xs text-emerald-500 mt-1">Keep up the great work!</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2 mb-3"><TrendingDown className="w-4 h-4" />Needs More Attention</h4>
                    {(() => {
                      const worst = [...subjectPerformance].sort((a, b) => (a.score / a.total) - (b.score / b.total))[0];
                      return worst ? (
                        <div>
                          <p className="text-lg font-black text-red-700">{worst.subject}</p>
                          <p className="text-sm text-red-600">{Math.round((worst.score / worst.total) * 100)}% average</p>
                          <button onClick={() => { setActiveTab('practice'); setPracticeTopic(worst.subject); }} className="text-xs font-bold text-red-700 underline mt-1">Practice {worst.subject} now →</button>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 4 — AI PRACTICE LAB
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">

              {/* Active Quiz View */}
              {activeQuiz && !quizResult && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-[#10375C] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">Self-Study Practice</span>
                      <h2 className="text-base font-black text-slate-800 mt-1">{activeQuiz.topic}</h2>
                      <p className="text-xs text-slate-400">{activeQuiz.subject} · Grade {activeQuiz.grade}</p>
                    </div>
                    <button onClick={() => { if (confirm('Cancel quiz? Progress will be lost.')) setActiveQuiz(null); }} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"><X className="w-3.5 h-3.5" />Cancel</button>
                  </div>

                  {/* Progress */}
                  <div className="flex flex-col gap-2">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#10375C] h-full transition-all duration-300 rounded-full" style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                      <span>{activeQuiz.questions[currentQuestionIdx].marks} mark{activeQuiz.questions[currentQuestionIdx].marks !== 1 ? 's' : ''}</span>
                    </div>
                    {/* Question dots */}
                    <div className="flex gap-1 flex-wrap">
                      {activeQuiz.questions.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuestionIdx(idx)}
                          className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${idx === currentQuestionIdx ? 'bg-[#10375C] text-white' : activeQuizAnswers[activeQuiz.questions[idx].id] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{activeQuiz.questions[currentQuestionIdx].text}</p>

                    {activeQuiz.questions[currentQuestionIdx].type === 'mcq' && (
                      <div className="flex flex-col gap-2.5">
                        {(activeQuiz.questions[currentQuestionIdx].options || []).map(opt => {
                          const isSelected = activeQuizAnswers[activeQuiz.questions[currentQuestionIdx].id] === opt;
                          return (
                            <button key={opt} onClick={() => handleAnswerChange(activeQuiz.questions[currentQuestionIdx].id, opt)}
                              className={`text-left text-sm p-3.5 rounded-xl border-2 transition-all font-medium ${isSelected ? 'bg-[#10375C] border-[#10375C] text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {activeQuiz.questions[currentQuestionIdx].type === 'truefalse' && (
                      <div className="flex gap-3">
                        {['True', 'False'].map(val => {
                          const isSelected = activeQuizAnswers[activeQuiz.questions[currentQuestionIdx].id] === val;
                          return (
                            <button key={val} onClick={() => handleAnswerChange(activeQuiz.questions[currentQuestionIdx].id, val)}
                              className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${isSelected ? 'bg-[#10375C] border-[#10375C] text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(activeQuiz.questions[currentQuestionIdx].type === 'short' || activeQuiz.questions[currentQuestionIdx].type === 'fillblank') && (
                      <textarea
                        value={activeQuizAnswers[activeQuiz.questions[currentQuestionIdx].id] || ''}
                        onChange={e => handleAnswerChange(activeQuiz.questions[currentQuestionIdx].id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={3}
                        className="w-full text-sm border-2 border-slate-200 focus:border-indigo-400 rounded-xl p-3 outline-none bg-white text-slate-800 transition-colors resize-none"
                      />
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button disabled={currentQuestionIdx === 0} onClick={() => setCurrentQuestionIdx(p => p - 1)} className="text-xs font-bold text-slate-500 disabled:text-slate-300 border border-slate-200 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 disabled:hover:bg-transparent">
                      ← Previous
                    </button>
                    <span className="text-xs text-slate-400">{Object.keys(activeQuizAnswers).length} / {activeQuiz.questions.length} answered</span>
                    {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                      <button onClick={() => setCurrentQuestionIdx(p => p + 1)} className="text-xs font-bold bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-all">
                        Next →
                      </button>
                    ) : (
                      <button disabled={quizSubmitting} onClick={handleQuizSubmit} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-60">
                        {quizSubmitting ? (<><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Grading...</>) : (<><Check className="w-3.5 h-3.5" />Submit Quiz</>)}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Result */}
              {quizResult && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
                  <div className="text-center border-b border-slate-100 pb-4 flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h2 className="text-base font-black text-slate-800">Quiz Evaluated!</h2>
                    <p className="text-xs text-slate-400">Topic: {activeQuiz?.topic}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-slate-50 rounded-2xl p-5 text-center">
                    <p className="text-3xl font-black text-emerald-600">{quizResult.score} <span className="text-slate-400 text-xl">/ {quizResult.totalMarks}</span></p>
                    <ScoreBadge score={quizResult.score} total={quizResult.totalMarks} />
                    <p className="text-xs font-semibold text-slate-600 max-w-md mt-1">{quizResult.feedback}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Review</h3>
                    {quizResult.answers.map((ans: GradedPracticeAnswer, idx: number) => (
                      <div key={ans.questionId} className={`border rounded-xl p-4 flex flex-col gap-3 ${ans.isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/20'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-bold text-slate-700">Q{idx + 1}. {ans.questionText}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black border flex items-center gap-0.5 flex-shrink-0 ${ans.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-500'}`}>
                            {ans.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {ans.marksAwarded}M
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/60 rounded-lg p-2 border border-slate-200">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Answer</span>
                            <p className="text-slate-700">{ans.studentAnswer || '(No answer)'}</p>
                          </div>
                          <div className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Correct Answer</span>
                            <p className="text-emerald-700">{ans.correctAnswer}</p>
                          </div>
                        </div>
                        <div className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-3 text-xs">
                          <span className="font-bold text-indigo-700 text-[10px] uppercase tracking-wider">AI Feedback: </span>
                          <span className="text-slate-600">{ans.aiFeedback}</span>
                          {ans.explanation && <p className="text-slate-500 mt-1.5 border-t border-indigo-100 pt-1.5">{ans.explanation}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setActiveQuiz(null); setQuizResult(null); }} className="w-full py-3 bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs rounded-xl transition-all shadow-md">
                    ← Back to Practice Suite
                  </button>
                </div>
              )}

              {/* History detail popup */}
              {viewHistoryQuiz && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-sm font-black text-slate-800">Past Quiz Review</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Topic: {viewHistoryQuiz.topic} · {viewHistoryQuiz.subject}</p>
                    </div>
                    <button onClick={() => setViewHistoryQuiz(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"><X className="w-3.5 h-3.5" />Close</button>
                  </div>
                  <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center gap-2">
                    <span className="text-2xl font-black text-emerald-600">{viewHistoryQuiz.score} / {viewHistoryQuiz.totalMarks}</span>
                    <ScoreBadge score={viewHistoryQuiz.score || 0} total={viewHistoryQuiz.totalMarks || 1} />
                    <p className="text-xs text-slate-500">{viewHistoryQuiz.feedback}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {(viewHistoryQuiz.answers || []).map((ans, idx) => (
                      <div key={ans.questionId} className={`border rounded-xl p-3.5 flex flex-col gap-2 ${ans.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/10'}`}>
                        <div className="flex justify-between gap-3">
                          <span className="text-xs font-bold text-slate-700">Q{idx + 1}. {ans.questionText}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border flex items-center gap-0.5 flex-shrink-0 ${ans.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-500'}`}>
                            {ans.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {ans.marksAwarded}M
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 bg-white/60 border border-slate-200 rounded-lg p-2">{ans.studentAnswer || '(No answer)'}</p>
                        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2">{ans.correctAnswer}</p>
                        {ans.aiFeedback && <p className="text-[11px] text-slate-500 italic">{ans.aiFeedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Lab Home */}
              {!activeQuiz && !viewHistoryQuiz && !quizResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Generator panel */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4 h-fit">
                    <div>
                      <h3 className="text-sm font-bold text-[#10375C] flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4 text-violet-500" /> Generate Quiz
                      </h3>
                      <p className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 py-1.5 font-semibold">
                        Target: <span className="font-bold">{activeGroup ? `${activeGroup.grade} ${activeGroup.subject}` : 'Grade 8 Science'}</span>
                      </p>
                    </div>
                    <form onSubmit={handleGeneratePracticeQuiz} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Topic</label>
                        <input
                          type="text" required value={practiceTopic}
                          onChange={e => setPracticeTopic(e.target.value)}
                          placeholder="e.g. Chemical bonding, Cell division"
                          className="w-full text-xs border border-slate-200 focus:border-indigo-400 rounded-lg px-3 py-2.5 outline-none bg-slate-50 text-slate-800 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</label>
                          <select value={practiceNumQuestions} onChange={e => setPracticeNumQuestions(Number(e.target.value))} className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 outline-none cursor-pointer text-slate-800">
                            <option value={5}>5</option><option value={10}>10</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Style</label>
                          <select value={practiceType} onChange={e => setPracticeType(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 outline-none cursor-pointer text-slate-800">
                            <option value="Mixed">Mixed</option><option value="MCQ">MCQs</option><option value="Short">Short Answer</option>
                          </select>
                        </div>
                      </div>

                      {/* Topic suggestions */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Topics</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Newton\'s Laws', 'Fractions', 'Cell Biology', 'Chemical Reactions', 'Pythagoras Theorem'].map(t => (
                            <button key={t} type="button" onClick={() => setPracticeTopic(t)} className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors">
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button type="submit" disabled={practiceLoading || !practiceTopic.trim()} className="w-full py-2.5 bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5">
                        {practiceLoading ? (<><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>) : (<><Play className="w-3.5 h-3.5" />Start Practice Test</>)}
                      </button>
                    </form>
                  </div>

                  {/* History panel */}
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><History className="w-4 h-4 text-slate-400" />Quiz History</h3>
                      {practiceHistory.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span className="font-bold">{studyStreak}-day streak</span>
                        </div>
                      )}
                    </div>

                    {practiceLoading && practiceHistory.length === 0 ? (
                      <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-slate-200 border-t-[#10375C] rounded-full animate-spin" /></div>
                    ) : practiceHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-slate-200 rounded-2xl">
                        <Trophy className="w-8 h-8 text-slate-200" />
                        <p className="text-xs text-slate-400 text-center">No quizzes yet. Generate one to start your self-study!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                        {practiceHistory.map(item => {
                          const pct = item.totalMarks && item.totalMarks > 0 ? Math.round(((item.score || 0) / item.totalMarks) * 100) : 0;
                          return (
                            <div key={item._id} className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 hover:border-indigo-200 transition-all shadow-sm">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}>
                                  {pct}%
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 truncate">{item.topic}</h4>
                                  <p className="text-[10px] text-slate-400">{item.subject} · {new Date(item.submittedAt || item.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <ScoreBadge score={item.score || 0} total={item.totalMarks || 1} />
                                <button onClick={() => setViewHistoryQuiz(item)} className="text-xs font-bold text-[#10375C] hover:underline flex items-center gap-0.5">
                                  Review <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 5 — SYLLABUS EXPLORER
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'syllabus' && (() => {
            const activeGrade = activeGroup?.grade || 'Grade 8';
            const activeSubject = activeGroup?.subject || 'Science';
            const syllabusChapters = getSyllabusChapters(activeGrade, activeSubject);
            const currentChapter = syllabusChapters[selectedChapterIndex] || syllabusChapters[0];

            return (
              <motion.div key="syllabus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">

                {/* Main Dashboard Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#10375C] flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#10375C]" />
                        <span>CBSE Syllabus Mapper & Coach</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Select NCERT chapters and official topics to map alignment, view board scoring schemes, and generate concept summaries.
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/15 rounded-xl px-3 py-1.5 self-start md:self-auto uppercase">
                      CURRICULUM: {activeGrade} {activeSubject} {activeGroup ? `(${activeGroup.name})` : '(Sample)'}
                    </span>
                  </div>

                  {/* Split Grid: Chapters Index on Left, Clickable Topics on Right */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-2">
                    
                    {/* Left Panel: NCERT Chapter Index (Col span 5) */}
                    <div className="md:col-span-5 flex flex-col gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        NCERT Chapter Index
                      </span>
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 select-none no-scrollbar border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
                        {syllabusChapters.map((ch, idx) => {
                          const isSelected = selectedChapterIndex === idx;
                          return (
                            <button
                              key={ch.chapterName}
                              type="button"
                              onClick={() => setSelectedChapterIndex(idx)}
                              className={`text-left text-xs p-3 rounded-xl border transition-all flex justify-between items-center gap-3 ${
                                isSelected
                                  ? 'bg-white border-[#10375C]/30 text-[#10375C] shadow-sm ring-1 ring-[#10375C]/10 font-bold'
                                  : 'bg-white/40 border-slate-200/60 text-slate-600 hover:bg-white hover:text-slate-800'
                              }`}
                            >
                              <span className="line-clamp-1">{ch.chapterName}</span>
                              <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-[#10375C]' : 'text-slate-400'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Panel: Chapter Topics & AI Explorer (Col span 7) */}
                    <div className="md:col-span-7 flex flex-col gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Official Syllabus Topics
                      </span>
                      
                      <div className="border border-slate-200/75 rounded-2xl p-5 bg-slate-50/30 min-h-[300px] flex flex-col justify-between gap-5">
                        <div className="flex flex-col gap-4">
                          <div className="border-b border-slate-150 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Currently Viewing:</span>
                            <span className="text-xs font-bold text-[#10375C] leading-snug mt-0.5 block">{currentChapter?.chapterName}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {currentChapter?.topics.map(topic => (
                              <button
                                key={topic}
                                type="button"
                                onClick={() => selectSyllabusTopicAndQuery(topic)}
                                className="text-[10px] font-bold text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/15 hover:bg-[#10375C]/10 hover:border-[#10375C]/20 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-[0_2px_8px_rgba(16,55,92,0.02)] active:scale-95 group"
                              >
                                <Sparkles className="w-3 h-3 text-[#10375C] group-hover:animate-pulse" />
                                <span>{topic}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-400 italic">
                          * Click any topic chip above to load structured NCERT Revision Notes & CBSE Practice Problems dynamically.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Manual Search Bar below */}
                  <div className="border-t border-slate-100 pt-5 mt-2 flex flex-col gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                      Search Custom Curriculum Topic
                    </span>
                    <form onSubmit={handleSyllabusExplore} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text" required value={syllabusTopic}
                          onChange={e => setSyllabusTopic(e.target.value)}
                          placeholder="Or type a custom topic to analyze: e.g. Lens Formula, Ohm's law, Valency..."
                          className="w-full text-xs border border-slate-200 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3.5 outline-none bg-slate-50 text-slate-800 transition-colors"
                        />
                      </div>
                      <button type="submit" disabled={syllabusLoading || !syllabusTopic.trim()} className="bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-200 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                        {syllabusLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Mapping...</> : <>Analyze Alignment</>}
                      </button>
                    </form>
                  </div>
                </div>

                {syllabusError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{syllabusError}</span>
                  </div>
                )}

                {syllabusResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col gap-4">
                      {/* Alignment score */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4 text-center">
                        <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${syllabusResult.aligned ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-red-50 border-red-500 text-red-500'}`}>
                          <span className="text-xl font-black">{syllabusResult.alignmentScore}%</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider">Match</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">NCERT Chapter:</h4>
                          <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-full font-bold mt-1">{syllabusResult.chapterName}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic max-w-[200px] leading-relaxed">{syllabusResult.curriculumContext}</p>
                      </div>
                      {/* Learning objectives */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Learning Objectives</h4>
                        {syllabusResult.learningObjectives.map((obj, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>{obj}</span>
                          </div>
                        ))}
                      </div>
                      {/* Practice this topic button */}
                      <button
                        onClick={() => { setPracticeTopic(syllabusTopic); setActiveTab('practice'); }}
                        className="w-full py-3 bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#10375C]/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Practice This Topic
                      </button>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-4">
                      {/* Study notes */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-[#10375C] uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#10375C]" />Concept Coach Revision Notes</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">{syllabusResult.quickStudyNotes}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {syllabusResult.keyConcepts.map((c, i) => (
                            <span key={i} className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] px-2.5 py-0.5 rounded font-bold">#{c}</span>
                          ))}
                        </div>
                        {/* Save as note button */}
                        <button
                          onClick={() => { setNewNoteSubject(activeGroup?.subject || 'General'); setNewNoteContent(syllabusTopic + '\n\n' + syllabusResult!.quickStudyNotes); saveNote(); setActiveTab('home'); }}
                          className="text-xs font-bold text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-all w-fit"
                        >
                          <FileText className="w-3.5 h-3.5" /> Save as Study Note
                        </button>
                      </div>

                      {/* Board Exam Questions */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">CBSE Board Exam Sample Problems</h4>
                        {syllabusResult.boardExamQuestions.map(bq => {
                          const isExpanded = expandedBqId === bq.id;
                          return (
                            <div key={bq.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-white transition-all shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-xs font-bold text-slate-700">Q. {bq.question}</span>
                                <span className="text-[10px] bg-slate-250 text-slate-600 px-2 py-0.5 rounded font-black flex-shrink-0">{bq.marks} Marks</span>
                              </div>
                              <button onClick={() => setExpandedBqId(isExpanded ? null : bq.id)} className="text-xs text-[#10375C] font-bold hover:underline mt-3 flex items-center gap-0.5">
                                {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" />Hide Model Answer</> : <><ChevronDown className="w-3.5 h-3.5" />Reveal Model Answer</>}
                              </button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3 border-t border-slate-200 pt-3 text-xs">
                                    <span className="font-bold text-emerald-600 text-[10px] uppercase tracking-wider block">CBSE Marking Scheme:</span>
                                    <p className="text-slate-600 leading-relaxed mt-1 bg-emerald-50/25 border border-emerald-100 p-3 rounded-xl">{bq.modelAnswer}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}

          {/* ════════════════════════════════════════════════════════════════
              TAB 6 — AI TUTOR
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'tutor' && (
            <motion.div key="tutor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex flex-col border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden"
              style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
            >
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Brain className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800">Personal AI Study Companion</h3>
                    <p className="text-[9px] text-slate-400">{activeGroup ? `${activeGroup.subject} Coach · Grade ${activeGroup.grade}` : 'NCERT-aligned curriculum coach'}</p>
                  </div>
                  <span className="ml-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />Online
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {tutorMessages.length > 0 && (
                    <button onClick={clearTutorHistory} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 transition-colors font-bold">
                      <Trash2 className="w-3.5 h-3.5" />Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                {tutorMessages.length === 0 && !tutorLoading && (
                  <div className="flex flex-col items-center gap-5 py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Hi, {studentName?.split(' ')[0]}! Ready to study?</h4>
                      <p className="text-slate-400 text-xs mt-1 max-w-[300px]">Ask me anything — formulas, concepts, homework, exam prep. I'm tuned to your NCERT curriculum!</p>
                    </div>
                    <div className="w-full max-w-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested questions:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {SUGGESTED_QUESTIONS.map((q, i) => (
                          <button key={i} onClick={() => handleSendTutorMessage(q)} className="text-[11px] bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 text-slate-600 px-3 py-1.5 rounded-xl font-semibold transition-all">
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tutorMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#10375C] text-white rounded-tr-sm shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-slate-400">{msg.timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-[#10375C]/10 border border-[#10375C]/20 flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-black text-[#10375C]">
                        {studentName?.[0]?.toUpperCase() || 'S'}
                      </div>
                    )}
                  </div>
                ))}

                {tutorLoading && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <Brain className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  </div>
                )}

                {tutorError && (
                  <div className="text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2 justify-center">
                    <AlertCircle className="w-4 h-4" />{tutorError}
                  </div>
                )}
                <div ref={tutorBottomRef} />
              </div>

              {/* Input */}
              <div className="bg-slate-50 border-t border-slate-200 p-3 flex-shrink-0">
                <form onSubmit={e => { e.preventDefault(); handleSendTutorMessage(tutorInput); }} className="flex items-center gap-2.5 bg-white border-2 border-slate-200 focus-within:border-indigo-400 rounded-xl px-4 py-2.5 transition-colors shadow-inner">
                  <input
                    ref={tutorInputRef}
                    type="text"
                    value={tutorInput}
                    onChange={e => setTutorInput(e.target.value)}
                    placeholder="Ask anything about your curriculum..."
                    disabled={tutorLoading}
                    className="flex-1 bg-transparent text-xs outline-none text-slate-800 placeholder-slate-400"
                  />
                  <button type="submit" disabled={!tutorInput.trim() || tutorLoading} className="w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-all flex-shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
                <p className="text-[9px] text-slate-400 text-center mt-1.5">AI responses may not always be accurate. Always verify with your teacher.</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── JOIN CLASS MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {joinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setJoinModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-200 shadow-2xl relative z-10">
              <h3 className="text-sm font-bold text-[#10375C] mb-1.5 flex items-center gap-1.5"><PlusCircle className="w-4 h-4 text-emerald-500" />Join a Class</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Enter the class code and your roster name to enroll in a classroom.</p>
              <form onSubmit={handleJoinClassSubmit} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class Code</label>
                  <input type="text" required value={joinClassCode} onChange={e => setJoinClassCode(e.target.value.toUpperCase())} placeholder="e.g. B2CDA3" maxLength={10}
                    className="w-full text-center text-sm font-black tracking-widest border border-slate-200 focus:border-indigo-400 rounded-xl px-3 py-2.5 outline-none bg-slate-50 text-slate-800 transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roster Name</label>
                  <input type="text" required value={joinRosterName} onChange={e => setJoinRosterName(e.target.value)} placeholder="Your name as on class roster"
                    className="w-full text-xs border border-slate-200 focus:border-indigo-400 rounded-xl px-3 py-2.5 outline-none bg-slate-50 text-slate-800 transition-colors" />
                  <p className="text-[9px] text-slate-400">Must match the name your teacher added.</p>
                </div>
                {joinError && <div className="text-[11px] text-red-500 bg-red-50 border border-red-200 rounded-xl p-2.5 text-center font-semibold">{joinError}</div>}
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setJoinModalOpen(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" disabled={joinLoading || !joinClassCode.trim() || !joinRosterName.trim()} className="flex-1 py-2.5 bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5">
                    {joinLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Joining...</> : 'Join Class'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
