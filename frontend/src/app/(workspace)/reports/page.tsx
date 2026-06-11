'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Loader2,
  Mail,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  getDetailedStudentReport,
  listStudentReports,
  type DetailedStudentReport,
  type StudentReportSummary,
} from '@/lib/api';

type LogTab = 'assignments' | 'practice';

function formatPercent(value: number | null | undefined) {
  return typeof value === 'number' ? `${value}%` : 'No data';
}

function formatDate(value?: string | null) {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pending';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scoreTone(value: number | null | undefined) {
  if (typeof value !== 'number') return 'text-slate-500 bg-slate-100 border-slate-200';
  if (value < 50) return 'text-red-700 bg-red-50 border-red-100';
  if (value < 65) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-emerald-700 bg-emerald-50 border-emerald-100';
}

function sourceLabel(source: 'assignment' | 'practice' | 'both') {
  if (source === 'assignment') return 'Homework';
  if (source === 'practice') return 'Practice';
  return 'Homework + Practice';
}

function GrowthChart({ timeline }: { timeline: DetailedStudentReport['timeline'] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const width = 720;
  const height = 240;
  const padding = { top: 20, right: 24, bottom: 34, left: 42 };
  const points = timeline.map((item, index) => {
    const x =
      timeline.length === 1
        ? width / 2
        : padding.left + (index / (timeline.length - 1)) * (width - padding.left - padding.right);
    const y = padding.top + ((100 - item.percentage) / 100) * (height - padding.top - padding.bottom);
    return { ...item, x, y };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  if (timeline.length === 0) {
    return (
      <div className="h-[240px] rounded-2xl border border-dashed border-slate-200 bg-white/60 flex items-center justify-center text-xs font-bold text-slate-400">
        No graded activity yet.
      </div>
    );
  }

  return (
    <div className="relative h-[260px] rounded-2xl bg-white/70 border border-white/70 overflow-hidden">
      {activePoint && (
        <div
          className="absolute z-10 w-48 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-xl pointer-events-none"
          style={{
            left: `min(calc(${(activePoint.x / width) * 100}% + 10px), calc(100% - 204px))`,
            top: Math.max(activePoint.y - 58, 10),
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {activePoint.type === 'assignment' ? 'Homework' : 'Practice'}
          </p>
          <p className="mt-0.5 truncate text-xs font-black text-slate-850">{activePoint.title}</p>
          <p className="mt-1 text-[11px] font-bold text-slate-500">
            {activePoint.score}/{activePoint.totalMarks} marks - {activePoint.percentage}%
          </p>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="img" aria-label="Student score growth timeline">
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padding.top + ((100 - tick) / 100) * (height - padding.top - padding.bottom);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 6" />
              <text x={18} y={y + 4} className="fill-slate-400 text-[10px] font-bold">
                {tick}
              </text>
            </g>
          );
        })}
        <path d={pathData} fill="none" stroke="#10375C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`${pathData} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`} fill="rgba(16,55,92,0.08)" />
        {points.map((point, index) => (
          <g key={`${point.title}-${point.date}-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={activeIndex === index ? 8 : 6}
              className="cursor-pointer transition-all"
              fill={point.type === 'assignment' ? '#10375C' : '#EA580C'}
              stroke="#FFFFFF"
              strokeWidth="3"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
            <title>{`${point.title}: ${point.percentage}%`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

function TopicMatrix({
  title,
  topics,
  emptyText,
  icon,
}: {
  title: string;
  topics: DetailedStudentReport['weakTopics'];
  emptyText: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{topics.length}</span>
      </div>
      {topics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-5 text-center text-xs font-bold text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic) => (
            <div key={`${title}-${topic.topic}`} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs font-black text-slate-800">{topic.topic}</span>
                <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${scoreTone(topic.accuracy)}`}>
                  {topic.accuracy}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${topic.accuracy < 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(topic.accuracy, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] font-bold text-slate-400">
                {sourceLabel(topic.source)} - {topic.totalMarks} marks tracked
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [students, setStudents] = useState<StudentReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentReportSummary | null>(null);
  const [detail, setDetail] = useState<DetailedStudentReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<LogTab>('assignments');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      setError('');
      try {
        const data = await listStudentReports();
        setStudents(data);
      } catch (err) {
        console.error('Failed to load student reports', err);
        setError('Student reports could not be loaded. Please refresh the workspace.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const filteredStudents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((student) => {
      const haystack = [
        student.studentName,
        student.email || '',
        ...student.groups.flatMap((group) => [group.name, group.subject, group.grade]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, students]);

  const totals = useMemo(() => {
    const registered = students.length;
    const avgAssignment = Math.round(
      students.reduce((sum, item) => sum + (item.assignmentAverageScore || 0), 0) /
        Math.max(students.filter((item) => typeof item.assignmentAverageScore === 'number').length, 1)
    );
    const avgPractice = Math.round(
      students.reduce((sum, item) => sum + (item.practicesAverageScore || 0), 0) /
        Math.max(students.filter((item) => typeof item.practicesAverageScore === 'number').length, 1)
    );
    const completed = students.reduce((sum, item) => sum + item.assignmentsCompleted, 0);
    return { registered, avgAssignment, avgPractice, completed };
  }, [students]);

  const openStudent = async (student: StudentReportSummary) => {
    if (!student.email) return;
    setSelectedStudent(student);
    setDetail(null);
    setDetailLoading(true);
    setActiveTab('assignments');
    try {
      const data = await getDetailedStudentReport(student.email);
      setDetail(data);
    } catch (err) {
      console.error('Failed to load detailed report', err);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-16">
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#10375C]">
              <TrendingUp className="h-3.5 w-3.5" />
              Student Reports
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Learning analytics</h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
              Review class group performance, practice habits, score growth, and topic-level confidence from graded activity.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by student, subject, group"
              className="h-11 w-full rounded-full border border-white/70 bg-white/80 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none shadow-sm transition focus:border-[#10375C]/30 focus:bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Registered students', value: totals.registered, icon: <UserRound className="h-4 w-4" /> },
            { label: 'Homework average', value: `${totals.avgAssignment}%`, icon: <ClipboardList className="h-4 w-4" /> },
            { label: 'Practice average', value: `${totals.avgPractice}%`, icon: <Target className="h-4 w-4" /> },
            { label: 'Completed grades', value: totals.completed, icon: <CheckCircle2 className="h-4 w-4" /> },
          ].map((stat) => (
            <div key={stat.label} className="min-h-[108px] rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10375C]/10 text-[#10375C]">{stat.icon}</span>
              </div>
              <p className="mt-5 text-2xl font-black tracking-tight text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/70 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
          {loading ? (
            <div className="flex h-72 items-center justify-center gap-2 text-xs font-black text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading student scorecards
            </div>
          ) : error ? (
            <div className="flex h-72 items-center justify-center text-center text-sm font-bold text-red-500">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
              <GraduationCap className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-black text-slate-700">No registered students found</p>
              <p className="text-xs font-medium text-slate-400">Students appear here after joining one of your class groups.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {filteredStudents.map((student) => {
                const completion =
                  student.assignmentsAssigned > 0
                    ? Math.round((student.assignmentsCompleted / student.assignmentsAssigned) * 100)
                    : null;

                return (
                  <button
                    key={student.email || student.studentName}
                    onClick={() => openStudent(student)}
                    className="group rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-[#10375C]/20 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-700">
                          {student.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-black text-slate-900">{student.studentName}</h2>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-bold text-slate-400">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:text-[#10375C]" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {student.groups.map((group) => (
                        <span key={group.id} className="rounded-full border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-500">
                          {group.name} - {group.subject}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: 'Groups', value: student.groups.length },
                        { label: 'Complete', value: formatPercent(completion), tone: scoreTone(completion) },
                        { label: 'Homework', value: formatPercent(student.assignmentAverageScore), tone: scoreTone(student.assignmentAverageScore) },
                        { label: 'Practice', value: student.practicesCount },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{item.label}</p>
                          <p className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black ${item.tone || 'border-transparent bg-white text-slate-800'}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      </AppShell>

      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-[#F8FAFC] shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/85 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#10375C]">Detailed report</p>
                  <h2 className="truncate text-xl font-black tracking-tight text-slate-900">{selectedStudent.studentName}</h2>
                  <p className="truncate text-xs font-bold text-slate-400">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
                  aria-label="Close report"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {detailLoading ? (
                <div className="flex h-[640px] items-center justify-center gap-2 text-sm font-black text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Building student analytics
                </div>
              ) : !detail ? (
                <div className="flex h-[640px] items-center justify-center text-sm font-bold text-red-500">
                  Detailed report could not be loaded.
                </div>
              ) : (
                <div className="max-h-[calc(92vh-77px)] overflow-y-auto p-4 md:p-5">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-3xl border border-white/70 bg-white/70 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Growth timeline</h3>
                          <p className="text-xs font-medium text-slate-400">Chronological homework and practice scores</p>
                        </div>
                        <Activity className="h-5 w-5 text-[#10375C]" />
                      </div>
                      <GrowthChart timeline={detail.timeline} />
                    </div>

                    <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        <h3 className="text-sm font-black text-slate-900">Struggle notes</h3>
                      </div>
                      <div className="flex max-h-[294px] flex-col gap-2 overflow-y-auto pr-1">
                        {detail.struggleNotes.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-center text-xs font-bold text-slate-400">
                            No AI struggle notes yet.
                          </div>
                        ) : (
                          detail.struggleNotes.slice(0, 8).map((note, index) => (
                            <div key={`${note.topic}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-xs font-black text-slate-800">{note.topic}</span>
                                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">{note.scoreText}</span>
                              </div>
                              {note.questionText && <p className="mt-2 line-clamp-2 text-[11px] font-bold text-slate-400">{note.questionText}</p>}
                              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{note.feedback}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <TopicMatrix
                      title="Weak topics"
                      topics={detail.weakTopics}
                      emptyText="No weak topics below 65%."
                      icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                    />
                    <TopicMatrix
                      title="Strong topics"
                      topics={detail.strongTopics}
                      emptyText="No strong topics yet."
                      icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    />

                    <div className="rounded-3xl border border-white/70 bg-white/70 p-4 lg:col-span-1">
                      <div className="mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#10375C]" />
                        <h3 className="text-sm font-black text-slate-900">Class groups</h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        {detail.groups.map((group) => (
                          <div key={group.id} className="rounded-2xl border border-slate-100 bg-white px-3 py-2.5">
                            <p className="text-xs font-black text-slate-800">{group.name}</p>
                            <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                              {group.grade} - {group.subject}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/70 bg-white/70 p-4 lg:col-span-3">
                      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">Concept logs</h3>
                          <p className="text-xs font-medium text-slate-400">Review graded homework and AI practice history</p>
                        </div>
                        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                          {[
                            { id: 'assignments' as LogTab, label: 'Homework', icon: <ClipboardList className="h-3.5 w-3.5" /> },
                            { id: 'practice' as LogTab, label: 'Practice', icon: <BarChart3 className="h-3.5 w-3.5" /> },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition ${
                                activeTab === tab.id ? 'bg-[#10375C] text-white' : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              {tab.icon}
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {activeTab === 'assignments' ? (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {detail.logs.assignments.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-center text-xs font-bold text-slate-400 md:col-span-2">
                              No homework grades yet.
                            </div>
                          ) : (
                            detail.logs.assignments.map((log, index) => (
                              <div key={`${log.title}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-black text-slate-850">{log.title}</p>
                                    <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                                      {log.subject || 'Assignment'} - due {formatDate(log.dueDate)}
                                    </p>
                                  </div>
                                  <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${scoreTone(log.percentage)}`}>
                                    {formatPercent(log.percentage)}
                                  </span>
                                </div>
                                <p className="mt-2 text-[11px] font-bold text-slate-500">
                                  {log.score}/{log.totalMarks} marks - submitted {formatDate(log.submittedAt)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {detail.logs.practices.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-center text-xs font-bold text-slate-400 md:col-span-2">
                              No AI practice grades yet.
                            </div>
                          ) : (
                            detail.logs.practices.map((log, index) => (
                              <div key={`${log.topic}-${index}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-black text-slate-850">{log.topic}</p>
                                    <p className="mt-0.5 text-[11px] font-bold text-slate-400">
                                      {log.subject} - {formatDate(log.submittedAt)}
                                    </p>
                                  </div>
                                  <span className={`rounded-full border px-2 py-1 text-[10px] font-black ${scoreTone(log.percentage)}`}>
                                    {formatPercent(log.percentage)}
                                  </span>
                                </div>
                                <p className="mt-2 text-[11px] font-bold text-slate-500">
                                  {log.score}/{log.totalMarks} marks
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
