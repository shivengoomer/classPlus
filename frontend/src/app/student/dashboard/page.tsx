// src/app/student/dashboard/page.tsx — Student Dashboard with AI Learning Suite
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, ClipboardList, CheckCircle2, Clock, Brain, ArrowRight,
  BookOpen, LogOut, Trophy, Upload, Star, Search, Sparkles, AlertCircle,
  RefreshCw, Check, X, FileText, ChevronRight, MessageSquare, History, Play, Send, Trash2, PlusCircle,
  Calendar, Award
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
  SyllabusExplorerResponse
} from '@/lib/studentApi';

type TabType = 'assignments' | 'practice' | 'syllabus' | 'tutor';

function gradeFromPct(pct: number) {
  if (pct >= 90) return { letter: 'A+', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (pct >= 80) return { letter: 'A', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' };
  if (pct >= 70) return { letter: 'B', color: 'text-blue-500 bg-blue-50 border-blue-200' };
  if (pct >= 60) return { letter: 'C', color: 'text-amber-500 bg-amber-50 border-amber-200' };
  return { letter: 'D', color: 'text-red-500 bg-red-50 border-red-200' };
}

function formatDueDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getDueDateProximity(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'normal';
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'overdue';
    if (diffDays <= 1) return 'urgent';
    if (diffDays <= 3) return 'warning';
    return 'normal';
  } catch {
    return 'normal';
  }
}

function getBorderColorClass(dateStr: string) {
  const prox = getDueDateProximity(dateStr);
  if (prox === 'overdue') return 'border-l-4 border-l-rose-500 hover:border-l-rose-600';
  if (prox === 'urgent') return 'border-l-4 border-l-amber-500 hover:border-l-amber-600';
  if (prox === 'warning') return 'border-l-4 border-l-yellow-500 hover:border-l-yellow-600';
  return 'border-l-4 border-l-indigo-500 hover:border-l-indigo-600';
}

function formatSubmittedAt(dateStr: string | null) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return 'Submitted ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Explain Newton's Laws of Motion with examples",
  "What is photosynthesis and how does it work?",
  "How do you solve quadratic equations?",
  "What causes seasons on Earth?",
  "Explain the water cycle",
  "What is the difference between acids and bases?",
];

export default function StudentDashboard() {
  const router = useRouter();
  const { studentName, studentEmail, groups, setSession, clearSession, _hasHydrated } = useStudentStore();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [loading, setLoading] = useState(true);

  // Active Class Filter
  const [activeGroupId, setActiveGroupId] = useState<string>('all');

  // Join Class Modal State
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinClassCode, setJoinClassCode] = useState('');
  const [joinRosterName, setJoinRosterName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Assignments State
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);

  // Practice Lab State
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

  // Syllabus Explorer State
  const [syllabusTopic, setSyllabusTopic] = useState('');
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusResult, setSyllabusResult] = useState<SyllabusExplorerResponse | null>(null);
  const [syllabusError, setSyllabusError] = useState('');
  const [expandedBqId, setExpandedBqId] = useState<string | null>(null);

  // AI Tutor State
  const [tutorMessages, setTutorMessages] = useState<ChatMessage[]>([]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState('');
  const tutorBottomRef = useRef<HTMLDivElement>(null);
  const tutorInputRef = useRef<HTMLInputElement>(null);

  // Session validation and load initial assignments
  useEffect(() => {
    if (!_hasHydrated) return;

    if (!studentName || !studentEmail) {
      router.push('/student');
      return;
    }

    let isMounted = true;
    setLoading(true);

    getStudentSession(studentEmail)
      .then((data) => {
        if (isMounted) {
          setSession(data.student, data.email, data.groups);
          setAssignments(data.assignments);
          sessionStorage.setItem('student_assignments', JSON.stringify(data.assignments));
        }
      })
      .catch((err) => {
        console.error('Failed to load fresh student session', err);
        // Fallback to cache if offline
        const stored = sessionStorage.getItem('student_assignments');
        if (stored && isMounted) {
          setAssignments(JSON.parse(stored));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [_hasHydrated, studentName, studentEmail, router, setSession]);

  // Load practice history when switching to practice tab
  useEffect(() => {
    if (activeTab === 'practice' && studentEmail) {
      loadPracticeHistory();
    }
  }, [activeTab]);

  // Load chat history from sessionStorage
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

  // Scroll tutor chat
  useEffect(() => {
    if (activeTab === 'tutor' && tutorMessages.length > 0) {
      tutorBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, activeTab]);

  // Computed Active Group Context
  const activeGroup = groups.find(g => g._id === activeGroupId) || null;

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
      const history = await getPracticeHistory(studentEmail);
      setPracticeHistory(history);
    } catch (err) {
      console.error('Failed to load practice history', err);
    } finally {
      setPracticeLoading(false);
    }
  };

  // Join Class code
  const handleJoinClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinClassCode.trim() || !joinRosterName.trim() || !studentEmail) return;
    setJoinLoading(true);
    setJoinError('');

    try {
      const data = await joinClassGroup(studentEmail, joinClassCode.trim(), joinRosterName.trim());
      // Update store and local context
      setSession(data.student, data.email, data.groups);
      setAssignments(data.assignments);
      sessionStorage.setItem('student_assignments', JSON.stringify(data.assignments));
      
      // Auto-set the newly joined class as active
      const newlyJoined = data.groups.find((g: any) => g.classCode === joinClassCode.toUpperCase().trim());
      if (newlyJoined) {
        setActiveGroupId(newlyJoined._id);
      }

      setJoinModalOpen(false);
      setJoinClassCode('');
      setJoinRosterName('');
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join class. Verify code and student roster name.');
    } finally {
      setJoinLoading(false);
    }
  };

  // Practice Quiz actions
  const handleGeneratePracticeQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTopic.trim() || !studentName || !studentEmail) return;
    
    // Fallbacks if no active group selected
    const subject = activeGroup?.subject || 'General Science';
    const grade = activeGroup?.grade || '8th';

    setPracticeLoading(true);
    try {
      const quiz = await generatePracticeQuiz({
        studentEmail,
        studentName,
        classCode: activeGroup?.classCode,
        subject,
        grade,
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
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleAnswerChange = (qId: string, value: string) => {
    setActiveQuizAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleQuizSubmit = async () => {
    if (!activeQuiz) return;
    setQuizSubmitting(true);
    try {
      const answersList = Object.entries(activeQuizAnswers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      const result = await submitPracticeQuiz(activeQuiz._id, answersList);
      setQuizResult(result);
      loadPracticeHistory();
    } catch (err: any) {
      alert(err.message || 'Failed to submit practice test.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Syllabus explore action
  const handleSyllabusExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusTopic.trim()) return;
    
    const subject = activeGroup?.subject || 'Science';
    const grade = activeGroup?.grade || '8th';

    setSyllabusLoading(true);
    setSyllabusError('');
    setSyllabusResult(null);
    try {
      const result = await exploreSyllabus({
        grade,
        subject,
        topic: syllabusTopic.trim(),
      });
      setSyllabusResult(result);
    } catch (err: any) {
      setSyllabusError(err.message || 'Syllabus alignment mapping failed. Please try again.');
    } finally {
      setSyllabusLoading(false);
    }
  };

  // AI Tutor message action
  const handleSendTutorMessage = async (text: string) => {
    if (!text.trim() || tutorLoading) return;
    setTutorInput('');
    setTutorError('');

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setTutorMessages(prev => [...prev, userMsg]);
    setTutorLoading(true);

    try {
      const history = tutorMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { reply } = await tutorChat(text, history, activeGroup?.subject, activeGroup?.grade);
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: new Date() };
      setTutorMessages(prev => {
        const updated = [...prev, assistantMsg];
        sessionStorage.setItem('tutor_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      setTutorError('AI study companion is temporarily unavailable. Please try again.');
      setTutorMessages(prev => prev.slice(0, -1)); // remove failed user message
    } finally {
      setTutorLoading(false);
      setTimeout(() => tutorInputRef.current?.focus(), 100);
    }
  };

  const clearTutorHistory = () => {
    setTutorMessages([]);
    sessionStorage.removeItem('tutor_history');
  };

  // Filtering Assignments by Active Group Selection
  const filteredAssignments = assignments.filter(item => {
    if (activeGroupId === 'all') return true;
    return item.groupId === activeGroupId;
  });

  const pending = filteredAssignments.filter(a => !a.submission?.submittedAt && a.assignment.status === 'done');
  const completed = filteredAssignments.filter(a => !!a.submission?.submittedAt);
  const avgScore = completed.length
    ? Math.round(completed.reduce((sum, a) => {
        const pct = a.submission!.totalMarks > 0
          ? (a.submission!.totalScore / a.submission!.totalMarks) * 100
          : 0;
        return sum + pct;
      }, 0) / completed.length)
    : 0;

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#10375C]/30 border-t-[#10375C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#10375C] flex items-center justify-center shadow-md">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="hidden xs:block">
              <span className="text-sm font-black text-slate-900 tracking-tight">classPlus</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">Student Portal</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {[
              { id: 'assignments', label: 'My Assignments', icon: <ClipboardList className="w-3.5 h-3.5" /> },
              { id: 'practice', label: 'AI Practice Lab', icon: <Trophy className="w-3.5 h-3.5" /> },
              { id: 'syllabus', label: 'Syllabus Explorer', icon: <Search className="w-3.5 h-3.5" /> },
              { id: 'tutor', label: 'AI Tutor', icon: <Brain className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#10375C] shadow-sm'
                    : 'text-slate-500 hover:text-[#10375C]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{studentName}</span>
              <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">{studentEmail}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors py-1.5 px-2 sm:px-3 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden flex overflow-x-auto gap-1 border-t border-slate-200/50 p-1.5 bg-slate-50/50 scrollbar-hide">
          {[
            { id: 'assignments', label: 'Assignments', icon: <ClipboardList className="w-3.5 h-3.5" /> },
            { id: 'practice', label: 'Practice', icon: <Trophy className="w-3.5 h-3.5" /> },
            { id: 'syllabus', label: 'Syllabus', icon: <Search className="w-3.5 h-3.5" /> },
            { id: 'tutor', label: 'AI Tutor', icon: <Brain className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#10375C] text-white shadow-sm'
                  : 'text-slate-500 bg-white/60 border border-slate-200/40 hover:text-[#10375C]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-5 py-4 sm:py-6 flex-1 flex flex-col gap-4 sm:gap-6">
        
        {/* Welcome Roster Info banner */}
        <div className="bg-[#10375C] rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xl shadow-[#10375C]/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">Unified Workspace</p>
              <h1 className="text-lg sm:text-xl font-black tracking-tight truncate max-w-[200px] sm:max-w-none">{studentName}</h1>
              <p className="text-blue-100/80 text-xs mt-0.5">Enrolled in {groups.length} class{groups.length !== 1 && 'es'}</p>
            </div>
          </div>
          
          {/* Class Select Dropdown & Join Button */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            {groups.length > 0 && (
              <select
                value={activeGroupId}
                onChange={(e) => setActiveGroupId(e.target.value)}
                className="text-xs bg-white/15 border border-white/25 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-white outline-none cursor-pointer font-bold focus:bg-[#10375C] max-w-[150px] sm:max-w-none"
              >
                <option value="all" className="bg-[#10375C] text-white">All Classes</option>
                {groups.map(g => (
                  <option key={g._id} value={g._id} className="bg-[#10375C] text-white">
                    {g.grade} {g.subject}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setJoinModalOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Join New Class</span>
              <span className="xs:hidden">Join</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* 1. ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <motion.div
                key="tab-assignments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { label: 'Pending', value: pending.length, icon: <Clock className="w-4 h-4 text-amber-500" />, color: 'bg-amber-50 border-amber-100 text-amber-700' },
                    { label: 'Completed', value: completed.length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                    { label: 'Avg Score', value: `${avgScore}%`, icon: <Trophy className="w-4 h-4 text-[#10375C]" />, color: 'bg-indigo-50 border-indigo-100 text-[#10375C]' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 shadow-sm">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color.split(' ')[0]} border ${stat.color.split(' ')[1]}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-black text-slate-800 leading-tight">{stat.value}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pending */}
                <section>
                  <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    Homework & Assessments ({pending.length})
                  </h2>
                  {pending.length === 0 ? (
                    <div className="bg-white/80 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs">
                      🎉 No pending homework or test papers for this selection! Enjoy your free time.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {pending.map((item, i) => {
                        const borderClass = getBorderColorClass(item.dueDate);
                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-indigo-350 hover:shadow-lg hover:shadow-indigo-500/5 transition-all shadow-sm duration-200 relative overflow-hidden ${borderClass}`}
                          >
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              <div className="w-11 h-11 rounded-2xl bg-indigo-55 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-slate-850 tracking-tight leading-snug truncate">
                                  {item.assignment.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                  <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                                    {item.assignment.subject} • {item.assignment.grade}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/70 px-2.5 py-0.5 rounded-md">
                                    <Award className="w-3 h-3 text-slate-400" /> {item.assignment.totalMarks} Marks
                                  </span>
                                  {(() => {
                                    const prox = getDueDateProximity(item.dueDate);
                                    const formatted = formatDueDate(item.dueDate);
                                    let colorClasses = "text-slate-650 bg-slate-50 border-slate-200/70";
                                    if (prox === 'overdue') {
                                      colorClasses = "text-rose-700 bg-rose-50 border-rose-200 font-extrabold animate-pulse";
                                    } else if (prox === 'urgent') {
                                      colorClasses = "text-amber-700 bg-amber-50 border-amber-205 font-extrabold";
                                    } else if (prox === 'warning') {
                                      colorClasses = "text-yellow-800 bg-yellow-50 border-yellow-200 font-bold";
                                    }
                                    return (
                                      <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-md border ${colorClasses}`}>
                                        <Calendar className="w-3 h-3 text-current" />
                                        {prox === 'overdue' ? `Overdue: ${formatted}` : `Due: ${formatted}`}
                                      </span>
                                    );
                                  })()}
                                  {item.durationMinutes && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-md font-bold">
                                      <Clock className="w-3 h-3 text-amber-500" /> {item.durationMinutes} mins
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 items-center self-stretch md:self-auto justify-end">
                              <button
                                onClick={() => router.push(`/student/upload/${item._id}`)}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 text-xs border border-slate-250 hover:border-slate-350 text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-xl font-bold transition-all hover:bg-slate-50 active:scale-[0.98]"
                              >
                                <Upload className="w-3.5 h-3.5" /> Upload Scan
                              </button>
                              <button
                                onClick={() => router.push(`/student/assignment/${item._id}`)}
                                className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 text-xs bg-[#10375C] hover:bg-[#0d2f4f] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#10375C]/15 active:scale-[0.98]"
                              >
                                Start <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Completed */}
                {completed.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Completed Assessments ({completed.length})
                    </h2>
                    <div className="flex flex-col gap-3">
                      {completed.map((item) => {
                        const pct = item.submission!.totalMarks > 0
                          ? Math.round((item.submission!.totalScore / item.submission!.totalMarks) * 100)
                          : 0;
                        const { letter, color } = gradeFromPct(pct);
                        return (
                          <div
                            key={item._id}
                            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm border-l-4 border-l-emerald-500 hover:border-l-emerald-600 transition-all duration-200"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 text-sm font-black shadow-sm ${color}`}>
                                {letter}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-slate-850 tracking-tight leading-snug truncate">
                                  {item.assignment.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                  <span className="inline-flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                                    {item.assignment.subject}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                    Score: {item.submission!.totalScore}/{item.submission!.totalMarks} ({pct}%)
                                  </span>
                                  {item.submission?.submittedAt && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200/70 px-2.5 py-0.5 rounded-md">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                      {formatSubmittedAt(item.submission.submittedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3 items-center self-stretch md:self-auto justify-end">
                              <button
                                onClick={() => router.push(`/student/results/${item._id}`)}
                                className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98]"
                              >
                                <Star className="w-3.5 h-3.5 text-emerald-600" /> Review Scorecard
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </motion.div>
            )}

            {/* 2. AI PRACTICE LAB */}
            {activeTab === 'practice' && (
              <motion.div
                key="tab-practice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* 2A. ACTIVE QUIZ TAKING VIEW */}
                {activeQuiz && !quizResult && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] text-[#10375C] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                          Self-Study Practice Quiz
                        </span>
                        <h2 className="text-base font-black text-slate-800 mt-1">{activeQuiz.topic}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{activeQuiz.subject} • Grade {activeQuiz.grade}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Cancel quiz? Your progress will be lost.')) {
                            setActiveQuiz(null);
                          }
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Progress tracker */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#10375C] h-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                      <span>Marks: {activeQuiz.questions[currentQuestionIdx].marks}</span>
                    </div>

                    {/* Active Question Panel */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 min-h-[140px] flex flex-col gap-4">
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {activeQuiz.questions[currentQuestionIdx].text}
                      </p>

                      {/* Question Answer Panel */}
                      {activeQuiz.questions[currentQuestionIdx].type === 'mcq' && (
                        <div className="flex flex-col gap-2.5 mt-2">
                          {(activeQuiz.questions[currentQuestionIdx].options || []).map((opt) => {
                            const isSelected = activeQuizAnswers[activeQuiz.questions[currentQuestionIdx].id] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleAnswerChange(activeQuiz.questions[currentQuestionIdx].id, opt)}
                                className={`text-left text-xs p-3.5 rounded-xl border-2 transition-all font-semibold ${
                                  isSelected
                                    ? 'bg-[#10375C] border-[#10375C] text-white'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {activeQuiz.questions[currentQuestionIdx].type === 'truefalse' && (
                        <div className="flex gap-3 mt-2">
                          {['True', 'False'].map((val) => {
                            const isSelected = activeQuizAnswers[activeQuiz.questions[currentQuestionIdx].id] === val;
                            return (
                              <button
                                key={val}
                                onClick={() => handleAnswerChange(activeQuiz.questions[currentQuestionIdx].id, val)}
                                className={`flex-1 text-center py-3 rounded-xl border-2 transition-all font-bold text-xs ${
                                  isSelected
                                    ? 'bg-[#10375C] border-[#10375C] text-white'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-350'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {(activeQuiz.questions[currentQuestionIdx].type === 'short' || activeQuiz.questions[currentQuestionIdx].type === 'fillblank') && (
                        <div className="mt-2">
                          <textarea
                            value={activeQuizAnswers[activeQuiz.questions[currentQuestionIdx].id] || ''}
                            onChange={(e) => handleAnswerChange(activeQuiz.questions[currentQuestionIdx].id, e.target.value)}
                            placeholder="Type your answer here..."
                            rows={3}
                            className="w-full text-xs border-2 border-slate-200 focus:border-indigo-400 rounded-xl p-3 outline-none bg-white text-slate-800 transition-colors"
                          />
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-2">
                      <button
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        className="text-xs font-bold text-slate-500 disabled:text-slate-300 border border-slate-200 px-4 py-2.5 rounded-xl transition-all"
                      >
                        Previous
                      </button>

                      {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                          className="text-xs font-bold bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all hover:bg-slate-700"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          disabled={quizSubmitting}
                          onClick={handleQuizSubmit}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
                        >
                          {quizSubmitting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              AI Grading...
                            </>
                          ) : (
                            <>Submit Quiz</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 2B. QUIZ RESULT CONSOLE */}
                {quizResult && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col gap-6">
                    {/* Header */}
                    <div className="text-center pb-4 border-b border-slate-100 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-slate-800">Practice Quiz Evaluated!</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Topic: {activeQuiz?.topic}</p>
                      </div>
                    </div>

                    {/* Score Wheel Banner */}
                    <div className="flex flex-col items-center gap-3 bg-slate-50 border border-slate-150 rounded-2xl p-5 text-center">
                      <div className="text-3xl font-black text-emerald-600">
                        {quizResult.score} <span className="text-slate-400 text-xl">/ {quizResult.totalMarks} Marks</span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 max-w-md">
                        {quizResult.feedback}
                      </div>
                    </div>

                    {/* Graded Answers Review list */}
                    <div className="flex flex-col gap-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Review</h3>
                      {quizResult.answers.map((ans: GradedPracticeAnswer, idx: number) => (
                        <div key={ans.questionId} className="border border-slate-150 rounded-xl p-4 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-xs font-bold text-slate-700">Q{idx + 1}. {ans.questionText}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black border flex items-center gap-0.5 ${
                              ans.isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-red-50 border-red-200 text-red-500'
                            }`}>
                              {ans.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {ans.marksAwarded} Marks
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Your Answer:</span>
                            <p className="text-slate-700 font-medium mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-150">{ans.studentAnswer || '(No answer)'}</p>
                          </div>

                          <div className="text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Correct Answer Key:</span>
                            <p className="text-emerald-700 font-medium mt-0.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">{ans.correctAnswer}</p>
                          </div>

                          <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-lg p-3 text-xs flex flex-col gap-1.5">
                            <div>
                              <span className="font-bold text-indigo-700 text-[10px] uppercase tracking-wider">AI Coach Feedback:</span>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">{ans.aiFeedback}</p>
                            </div>
                            {ans.explanation && (
                              <div className="border-t border-indigo-100/40 pt-1.5 mt-1">
                                <span className="font-bold text-indigo-700 text-[10px] uppercase tracking-wider">Concept Explanation:</span>
                                <p className="text-slate-500 mt-0.5 leading-relaxed font-sans">{ans.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setActiveQuiz(null);
                        setQuizResult(null);
                      }}
                      className="w-full py-3 bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      Back to Practice Suite
                    </button>
                  </div>
                )}

                {/* 2C. PAST HISTORY DETAIL POPUP */}
                {viewHistoryQuiz && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h2 className="text-base font-black text-slate-800">Historical Practice Quiz</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Topic: {viewHistoryQuiz.topic}</p>
                      </div>
                      <button
                        onClick={() => setViewHistoryQuiz(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        Close
                      </button>
                    </div>

                    {/* Score */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center flex flex-col gap-1.5">
                      <span className="text-2xl font-black text-emerald-600">{viewHistoryQuiz.score} / {viewHistoryQuiz.totalMarks} Marks</span>
                      <p className="text-xs text-slate-500 font-semibold">{viewHistoryQuiz.feedback}</p>
                    </div>

                    {/* List */}
                    <div className="flex flex-col gap-4">
                      {(viewHistoryQuiz.answers || []).map((ans, idx) => (
                        <div key={ans.questionId} className="border border-slate-150 rounded-xl p-4 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-xs font-bold text-slate-700">Q{idx + 1}. {ans.questionText}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black border flex items-center gap-0.5 ${
                              ans.isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-red-50 border-red-200 text-red-500'
                            }`}>
                              {ans.isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {ans.marksAwarded} Marks
                            </span>
                          </div>

                          <div className="text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Your Answer:</span>
                            <p className="text-slate-700 font-medium mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-150">{ans.studentAnswer || '(No answer)'}</p>
                          </div>

                          <div className="text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Correct Answer:</span>
                            <p className="text-emerald-700 font-medium mt-0.5 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">{ans.correctAnswer}</p>
                          </div>

                          <div className="bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs leading-relaxed">
                            <span className="font-bold text-[#10375C] text-[10px] uppercase tracking-wider">Evaluation & Notes:</span>
                            <p className="text-slate-600 mt-0.5">{ans.aiFeedback}</p>
                            {ans.explanation && (
                              <p className="text-slate-500 font-sans mt-1.5 pt-1.5 border-t border-slate-200">{ans.explanation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2D. PRACTICE FORM GENERATOR */}
                {!activeQuiz && !viewHistoryQuiz && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-fit">
                      <h3 className="text-sm font-bold text-[#10375C] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-500" /> New Practice Quiz
                      </h3>
                      <p className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100/60 rounded-xl px-2.5 py-1.5 mb-4 font-semibold font-sans">
                        Target: <span className="font-bold">{activeGroup ? `${activeGroup.grade} ${activeGroup.subject} (${activeGroup.name})` : 'Grade 8th Science (Default)'}</span>
                      </p>
                      <form onSubmit={handleGeneratePracticeQuiz} className="flex flex-col gap-4">
                        {/* Topic */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quiz Topic</label>
                          <input
                            type="text"
                            required
                            value={practiceTopic}
                            onChange={(e) => setPracticeTopic(e.target.value)}
                            placeholder="e.g. Chemical bonding, Cell division"
                            className="w-full text-xs border border-slate-200 focus:border-indigo-400 rounded-lg px-3.5 py-2.5 outline-none bg-slate-50 text-slate-800 transition-colors"
                          />
                        </div>

                        {/* Config */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</label>
                            <select
                              value={practiceNumQuestions}
                              onChange={(e) => setPracticeNumQuestions(Number(e.target.value))}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 outline-none cursor-pointer text-slate-800"
                            >
                              <option value={5}>5 Qs</option>
                              <option value={10}>10 Qs</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Style</label>
                            <select
                              value={practiceType}
                              onChange={(e) => setPracticeType(e.target.value)}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 bg-slate-50 outline-none cursor-pointer text-slate-800"
                            >
                              <option value="Mixed">Mixed</option>
                              <option value="MCQ">MCQs</option>
                              <option value="Short">Short Answer</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={practiceLoading || !practiceTopic.trim()}
                          className="w-full py-3 bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                        >
                          {practiceLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Generating Study Test...
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Start AI Practice Test
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* History panel */}
                    <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <History className="w-4 h-4 text-slate-500" /> Completed Quizzes History
                      </h3>

                      {practiceLoading && practiceHistory.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">Loading history...</div>
                      ) : practiceHistory.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-100 rounded-2xl">
                          📝 No practice history. Generate a quiz above to start your self-study practice!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                          {practiceHistory.map((item) => (
                            <div
                              key={item._id}
                              className="border border-slate-150 rounded-xl p-3.5 flex items-center justify-between gap-4 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                  {item.score}/{item.totalMarks}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{item.topic}</h4>
                                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                                    {item.subject} • {new Date(item.submittedAt || '').toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setViewHistoryQuiz(item)}
                                className="text-xs font-bold text-[#10375C] hover:underline flex items-center gap-0.5"
                              >
                                Review <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. CBSE SYLLABUS EXPLORER TAB */}
            {activeTab === 'syllabus' && (
              <motion.div
                key="tab-syllabus"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Search Bar */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[#10375C] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> CBSE Syllabus Mapper & Coach
                  </h3>
                  <p className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100/60 rounded-xl px-2.5 py-1.5 mb-4 font-semibold font-sans">
                    Searching within: <span className="font-bold">{activeGroup ? `${activeGroup.grade} ${activeGroup.subject} (${activeGroup.name})` : 'Grade 8th Science (Default)'}</span>
                  </p>
                  <form onSubmit={handleSyllabusExplore} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={syllabusTopic}
                        onChange={(e) => setSyllabusTopic(e.target.value)}
                        placeholder="Search topics: e.g. Newton's laws, Chemical reactions, Trigonometry..."
                        className="w-full text-xs border border-slate-200 focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 outline-none bg-slate-50 text-slate-800 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={syllabusLoading || !syllabusTopic.trim()}
                      className="bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-200 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {syllabusLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Mapping NCERT...
                        </>
                      ) : (
                        <>Analyze Topic</>
                      )}
                    </button>
                  </form>
                </div>

                {syllabusError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{syllabusError}</span>
                  </div>
                )}

                {/* Explorer Results Card */}
                {syllabusResult && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Alignment & Key Concepts Left Panel */}
                    <div className="md:col-span-1 flex flex-col gap-5">
                      
                      {/* Alignment Badge score */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col items-center gap-4 text-center">
                        <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center ${
                          syllabusResult.aligned
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : 'bg-red-50 border-red-500 text-red-500'
                        }`}>
                          <span className="text-lg font-black">{syllabusResult.alignmentScore}%</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider">Syllabus Match</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">NCERT Chapters:</h4>
                          <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-full font-bold mt-2 font-sans">
                            {syllabusResult.chapterName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic max-w-[200px] leading-relaxed">
                          {syllabusResult.curriculumContext}
                        </p>
                      </div>

                      {/* Learning Objectives Checklist */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Learning Objectives</h4>
                        <div className="flex flex-col gap-2">
                          {syllabusResult.learningObjectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-600 font-semibold leading-relaxed">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Revision Notes & Board Questions Panel */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                      
                      {/* Study Notes Card */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-[#10375C] uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-500" /> Concept coach revision summary
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans mt-0.5 whitespace-pre-line bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
                          {syllabusResult.quickStudyNotes}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {syllabusResult.keyConcepts.map((c, i) => (
                            <span key={i} className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] px-2.5 py-0.5 rounded font-bold font-sans">
                              #{c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Board Questions Section */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">CBSE Board Exam Sample Problems</h4>
                        <div className="flex flex-col gap-3 mt-1">
                          {syllabusResult.boardExamQuestions.map((bq) => {
                            const isExpanded = expandedBqId === bq.id;
                            return (
                              <div key={bq.id} className="border border-slate-150 rounded-2xl p-4 bg-slate-50/60 hover:bg-white transition-all shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                  <span className="text-xs font-bold text-slate-700">Q. {bq.question}</span>
                                  <span className="text-[10px] bg-slate-200 border border-slate-350 text-slate-600 px-2 py-0.5 rounded font-black flex-shrink-0">
                                    {bq.marks} Marks
                                  </span>
                                </div>
                                <button
                                  onClick={() => setExpandedBqId(isExpanded ? null : bq.id)}
                                  className="text-xs text-[#10375C] font-bold hover:underline mt-3 flex items-center gap-0.5"
                                >
                                  {isExpanded ? 'Hide Model Answer' : 'Reveal Model Answer'}
                                </button>
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden mt-3 border-t border-slate-200 pt-3 text-xs"
                                    >
                                      <span className="font-bold text-emerald-600 text-[10px] uppercase tracking-wider block">CBSE Marking Scheme Answer:</span>
                                      <p className="text-slate-600 leading-relaxed font-sans mt-1 bg-emerald-50/25 border border-emerald-100 p-3 rounded-xl">
                                        {bq.modelAnswer}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. AI TUTOR COMPANION TAB */}
            {activeTab === 'tutor' && (
              <motion.div
                key="tab-tutor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden h-[540px]"
              >
                {/* Chat Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800 leading-tight">Personal AI Study Companion</h3>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {activeGroup ? `${activeGroup.subject} Coach • Grade ${activeGroup.grade}` : 'Curriculum aligned coach'}
                      </p>
                    </div>
                  </div>
                  {tutorMessages.length > 0 && (
                    <button
                      onClick={clearTutorHistory}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 transition-colors font-bold uppercase tracking-wider"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Chat
                    </button>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                  {tutorMessages.length === 0 && !tutorLoading && (
                    <div className="flex flex-col items-center gap-6 py-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-150">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Hi, {studentName?.split(' ')[0]}! How can I help you study today?</h4>
                        <p className="text-slate-400 text-xs mt-1 max-w-[320px]">Ask questions about formulas, concepts, or homework topics. I have full NCERT alignment context!</p>
                      </div>

                      <div className="w-full">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Try asking these:</p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                          {SUGGESTED_QUESTIONS.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendTutorMessage(q)}
                              className="text-[11px] bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-3 py-1.5 rounded-xl font-bold transition-all"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {tutorMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-1 shadow-sm">
                          <Brain className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-sans ${
                          msg.role === 'user'
                            ? 'bg-[#10375C] text-white rounded-tr-sm shadow-md'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {tutorLoading && (
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <Brain className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm flex gap-1 items-center">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {tutorError && (
                    <div className="text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl p-2.5">
                      {tutorError}
                    </div>
                  )}

                  <div ref={tutorBottomRef} />
                </div>

                {/* Input Bar */}
                <div className="bg-slate-50 border-t border-slate-200 p-3">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendTutorMessage(tutorInput); }}
                    className="flex items-center gap-2.5 bg-white border-2 border-slate-200 focus-within:border-indigo-400 rounded-xl px-3.5 py-2 transition-colors shadow-inner"
                  >
                    <input
                      ref={tutorInputRef}
                      type="text"
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      placeholder="Type a query to ask your companion tutor..."
                      disabled={tutorLoading}
                      className="flex-1 bg-transparent text-xs outline-none text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!tutorInput.trim() || tutorLoading}
                      className="w-7.5 h-7.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* JOIN NEW CLASS MODAL */}
      <AnimatePresence>
        {joinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJoinModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-200 shadow-2xl relative z-10"
            >
              <h3 className="text-sm font-bold text-[#10375C] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-emerald-500" /> Join Class Group
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                Enter your class code and student name to link an additional classroom to your workspace.
              </p>

              <form onSubmit={handleJoinClassSubmit} className="flex flex-col gap-3.5">
                {/* Code */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class Code</label>
                  <input
                    type="text"
                    required
                    value={joinClassCode}
                    onChange={(e) => setJoinClassCode(e.target.value.toUpperCase())}
                    placeholder="e.g. B2CDA3"
                    maxLength={10}
                    className="w-full text-center text-sm font-black tracking-widest border border-slate-200 focus:border-indigo-400 rounded-xl px-3 py-2.5 outline-none bg-slate-50 text-slate-800 transition-colors"
                  />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Roster Name</label>
                  <input
                    type="text"
                    required
                    value={joinRosterName}
                    onChange={(e) => setJoinRosterName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full text-xs border border-slate-200 focus:border-indigo-400 rounded-xl px-3 py-2.5 outline-none bg-slate-50 text-slate-800 transition-colors"
                  />
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Must match the student list name added by your teacher.
                  </p>
                </div>

                {joinError && (
                  <div className="text-[11px] text-red-500 bg-red-50 border border-red-200 rounded-xl p-2.5 text-center font-semibold">
                    {joinError}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setJoinModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:border-slate-350 text-slate-500 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={joinLoading || !joinClassCode.trim() || !joinRosterName.trim()}
                    className="flex-1 py-2.5 bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    {joinLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>Join Class</>
                    )}
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
