// src/app/student/assignment/[id]/page.tsx — Interactive Test Taking
'use client';import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle2, GraduationCap, ClipboardList, FileText, Award, ArrowRight } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { getStudentAssignment, submitAnswers } from '@/lib/studentApi';
import type { StudentAssignmentDetail } from '@/lib/studentApi';

function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  const isUrgent = seconds < 300; // < 5 min
  return (
    <span className={`font-mono font-black text-sm tabular-nums ${isUrgent ? 'text-red-500 animate-pulse' : 'text-slate-705'}`}>
      {m}:{s}
    </span>
  );
}

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { studentName, _hasHydrated } = useStudentStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [assignment, setAssignment] = useState<StudentAssignmentDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-submit on timer expiry
  const doSubmit = useCallback(async (auto = false) => {
    if (!assignment || !studentName || submitting || submitted) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const result = await submitAnswers(id, studentName, answersArr);
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      router.push(`/student/results/${id}?studentName=${encodeURIComponent(studentName)}`);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      setSubmitting(false);
    }
  }, [assignment, studentName, answers, id, submitting, submitted, router]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!studentName) { router.push('/student'); return; }
    getStudentAssignment(id, studentName)
      .then(data => {
        setAssignment(data);
        if (data.durationMinutes) {
          const secs = data.durationMinutes * 60;
          setTimeLeft(secs);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, studentName, router, _hasHydrated]);

  // Countdown timer
  useEffect(() => {
    if (!hasStarted || timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current!);
          doSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [hasStarted, timeLeft, doSubmit]);

  if (!_hasHydrated || loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#10375C]/30 border-t-[#10375C] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading assignment…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center flex flex-col gap-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Unable to Load</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={() => router.push('/student/dashboard')} className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
  if (!assignment) return null;

  const sections = assignment.sections;
  const currentSection = sections[currentSectionIdx];
  const totalAnswered = Object.values(answers).filter(v => v.trim()).length;
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const progress = Math.round((totalAnswered / totalQuestions) * 100);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-indigo-100 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 p-8 relative z-10 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#10375C] flex items-center justify-center shadow-xl shadow-[#10375C]/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Ready to Start
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-2 tracking-tight">
                {assignment.title}
              </h1>
              <p className="text-slate-550 text-xs mt-1">
                {assignment.subject} • Grade {assignment.grade}
              </p>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Sections', value: sections.length, icon: <ClipboardList className="w-4 h-4 text-indigo-500" /> },
              { label: 'Questions', value: totalQuestions, icon: <FileText className="w-4 h-4 text-emerald-500" /> },
              { label: 'Time Allowed', value: assignment.durationMinutes ? `${assignment.durationMinutes} mins` : 'No Limit', icon: <Clock className="w-4 h-4 text-amber-500" /> },
              { label: 'Total Marks', value: `${assignment.totalMarks} M`, icon: <Award className="w-4 h-4 text-rose-500" /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col items-center text-center gap-1">
                <div className="p-1 rounded bg-white border border-slate-100 shadow-sm">
                  {stat.icon}
                </div>
                <span className="text-sm md:text-base font-extrabold text-slate-800 mt-1">{stat.value}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Guidelines / Instructions */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-500" /> Assessment Guidelines
            </h3>
            <ul className="text-xs text-blue-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-550 font-extrabold mt-0.5">•</span>
                <span>Ensure your workspace is quiet and you have a stable internet connection.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-550 font-extrabold mt-0.5">•</span>
                <span>Once you click <strong>Start Assessment</strong>, the timer begins and cannot be paused.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-550 font-extrabold mt-0.5">•</span>
                <span>Do not reload the browser page or navigate away, as it may result in loss of progress.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-550 font-extrabold mt-0.5">•</span>
                <span>The assessment will auto-submit when the timer expires.</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => router.push('/student/dashboard')}
              className="flex-1 py-3 rounded-2xl border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-slate-650 font-bold text-xs transition-all text-center"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setHasStarted(true)}
              className="flex-1 py-3 rounded-2xl bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#10375C]/15 transition-all active:scale-[0.98]"
            >
              Start Assessment <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 font-sans flex flex-col">
      {/* Sticky Top Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm md:text-base font-extrabold text-slate-805 truncate leading-snug">{assignment.title}</h1>
            <p className="text-[10px] text-slate-400 font-semibold">{assignment.subject} • {assignment.totalMarks} Marks</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full shadow-sm transition-colors ${
                timeLeft < 300
                  ? 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-707'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${timeLeft < 300 ? 'text-rose-500' : 'text-slate-400'}`} />
                <TimerDisplay seconds={timeLeft} />
              </div>
            )}
            <div className="text-xs text-slate-500 font-extrabold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm">
              {totalAnswered} / {totalQuestions} done
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100">
          <motion.div
            className="h-full bg-[#10375C]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-5 py-8 flex-1 flex flex-col gap-6">
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200/60 scrollbar-none">
          {sections.map((section, idx) => {
            const isActive = currentSectionIdx === idx;
            return (
              <button
                key={section.id}
                onClick={() => setCurrentSectionIdx(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#10375C] text-white shadow-sm shadow-[#10375C]/10 scale-[1.02]'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-750 hover:border-slate-300'
                }`}
              >
                {section.label}: {section.title}
              </button>
            );
          })}
        </div>

        {/* Section Info instruction block */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4.5 text-xs text-indigo-850 flex items-start gap-2.5 shadow-sm">
          <ClipboardList className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-indigo-900 uppercase tracking-wider">{currentSection.label} ({currentSection.totalMarks} marks)</span>
            <p className="mt-1 text-indigo-700/90 font-medium leading-relaxed">{currentSection.instruction}</p>
          </div>
        </div>

        {/* Questions List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSectionIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {currentSection.questions.map((q, qIdx) => {
              const answered = !!answers[q.id]?.trim();
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl border p-6 flex flex-col gap-4 transition-all duration-200 shadow-sm ${
                    answered ? 'border-emerald-250 bg-emerald-50/5 shadow-emerald-100/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border transition-all ${
                      answered
                        ? 'bg-emerald-55 border-emerald-200 text-emerald-600'
                        : 'bg-slate-50 border-slate-200/80 text-slate-550'
                    }`}>
                      {qIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base text-slate-800 leading-relaxed font-bold">{q.text}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center text-[9px] bg-slate-50 border border-slate-200/80 text-slate-500 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wide">{q.type}</span>
                        <span className="inline-flex items-center text-[9px] bg-slate-50 border border-slate-200/80 text-slate-550 px-2.5 py-0.5 rounded-md font-bold">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        {q.conceptTag && <span className="inline-flex items-center text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-650 px-2.5 py-0.5 rounded-md font-bold">{q.conceptTag}</span>}
                        {answered && <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-55 border border-emerald-200 text-emerald-705 px-2.5 py-0.5 rounded-md font-extrabold"><CheckCircle2 className="w-2.5 h-2.5" /> Answered</span>}
                      </div>
                    </div>
                  </div>

                  {/* Input Rendering based on Question Type */}
                  {(q.type === 'mcq' || q.type === 'truefalse') && q.options.length > 0 ? (
                    <div className="flex flex-col gap-2.5 pl-0 md:pl-11 mt-1">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                              isSelected
                                ? 'border-[#10375C] bg-[#10375C]/5 text-[#10375C] font-extrabold shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white hover:bg-slate-50/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={isSelected}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              className="accent-[#10375C] w-4 h-4 flex-shrink-0"
                            />
                            <span className="text-xs md:text-sm font-semibold">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : q.type === 'fillblank' ? (
                    <div className="pl-0 md:pl-11 mt-1">
                      <input
                        type="text"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Type your answer here…"
                        className="w-full border-2 border-slate-200 focus:border-[#10375C] rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors bg-white font-medium"
                      />
                    </div>
                  ) : (
                    /* Short / Long text area answers */
                    <div className="pl-0 md:pl-11 mt-1">
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Write your answer here…"
                        rows={q.type === 'long' ? 6 : 3}
                        className="w-full border-2 border-slate-200 focus:border-[#10375C] rounded-2xl px-4 py-3 text-sm outline-none transition-colors resize-none leading-relaxed bg-white font-medium shadow-inner"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Navigation + Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-2">
          <button
            onClick={() => setCurrentSectionIdx(i => Math.max(0, i - 1))}
            disabled={currentSectionIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm font-bold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Section
          </button>

          {currentSectionIdx < sections.length - 1 ? (
            <button
              onClick={() => setCurrentSectionIdx(i => Math.min(sections.length - 1, i + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#10375C] hover:bg-[#0d2f4f] text-white text-xs md:text-sm font-bold transition-all shadow-md shadow-[#10375C]/10"
            >
              Next Section <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <motion.button
              onClick={() => doSubmit(false)}
              disabled={submitting}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-505 hover:bg-emerald-605 disabled:bg-slate-300 text-white text-xs md:text-sm font-bold transition-colors shadow-md shadow-emerald-500/10 active:scale-[0.98]"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /> Submit Paper</>
              )}
            </motion.button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-650 flex items-center gap-2 mt-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
