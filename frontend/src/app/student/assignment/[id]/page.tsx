// src/app/student/assignment/[id]/page.tsx — Interactive Test Taking
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle2, GraduationCap } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { getStudentAssignment, submitAnswers } from '@/lib/studentApi';
import type { StudentAssignmentDetail } from '@/lib/studentApi';

function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  const isUrgent = seconds < 300; // < 5 min
  return (
    <span className={`font-mono font-black text-sm tabular-nums ${isUrgent ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
      {m}:{s}
    </span>
  );
}

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { studentName } = useStudentStore();

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
  }, [id, studentName, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
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
  }, [timeLeft !== null]); // Only start once

  if (loading) return (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 font-sans">
      {/* Sticky Top Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold text-slate-800 truncate">{assignment.title}</h1>
            <p className="text-[10px] text-slate-400">{assignment.subject} • {assignment.totalMarks} Marks</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {timeLeft !== null && (
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <TimerDisplay seconds={timeLeft} />
              </div>
            )}
            <div className="text-xs text-slate-500 font-semibold whitespace-nowrap">
              {totalAnswered}/{totalQuestions} done
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

      <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6">
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => setCurrentSectionIdx(idx)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                currentSectionIdx === idx
                  ? 'bg-[#10375C] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {section.label}: {section.title}
            </button>
          ))}
        </div>

        {/* Section Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          <strong>{currentSection.label}</strong> — {currentSection.instruction}
          <span className="ml-2 text-blue-500 text-xs">({currentSection.totalMarks} marks)</span>
        </div>

        {/* Questions */}
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
                  className={`bg-white rounded-2xl border p-6 flex flex-col gap-4 transition-colors ${
                    answered ? 'border-emerald-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black flex-shrink-0">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 leading-relaxed font-medium">{q.text}</p>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold uppercase tracking-wide">{q.type}</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                        {q.conceptTag && <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded text-indigo-500 font-semibold">{q.conceptTag}</span>}
                        {answered && <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" /> Answered</span>}
                      </div>
                    </div>
                  </div>

                  {/* MCQ / True-False */}
                  {(q.type === 'mcq' || q.type === 'truefalse') && q.options.length > 0 ? (
                    <div className="flex flex-col gap-2 pl-10">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                            answers[q.id] === opt
                              ? 'border-[#10375C] bg-[#10375C]/5 text-[#10375C] font-semibold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="accent-[#10375C]"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'fillblank' ? (
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer here…"
                      className="ml-10 w-full border-2 border-slate-200 focus:border-[#10375C] rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                    />
                  ) : (
                    /* Short / Long answer textarea */
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Write your answer here…"
                      rows={q.type === 'long' ? 6 : 3}
                      className="ml-10 w-full border-2 border-slate-200 focus:border-[#10375C] rounded-xl px-3 py-2 text-sm outline-none transition-colors resize-none leading-relaxed"
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Navigation + Submit */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentSectionIdx(i => Math.max(0, i - 1))}
            disabled={currentSectionIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentSectionIdx < sections.length - 1 ? (
            <button
              onClick={() => setCurrentSectionIdx(i => Math.min(sections.length - 1, i + 1))}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10375C] text-white text-sm font-semibold hover:bg-[#0d2f4f] transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <motion.button
              onClick={() => doSubmit(false)}
              disabled={submitting}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-bold transition-colors shadow-md shadow-emerald-200"
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
