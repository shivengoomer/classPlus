// src/app/student/results/[id]/page.tsx — AI-Graded Results
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Brain, ArrowLeft, Trophy, Download, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { getStudentResults } from '@/lib/studentApi';
import type { StudentResults } from '@/lib/studentApi';

function gradeInfo(pct: number) {
  if (pct >= 90) return { letter: 'A+', label: 'Outstanding!', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-300' };
  if (pct >= 80) return { letter: 'A', label: 'Excellent!', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-200' };
  if (pct >= 70) return { letter: 'B', label: 'Good Work', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-200' };
  if (pct >= 60) return { letter: 'C', label: 'Keep Going', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-200' };
  return { letter: 'D', label: 'Needs Improvement', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-200' };
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { studentName, _hasHydrated } = useStudentStore();

  const [results, setResults] = useState<StudentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!_hasHydrated) return;
    const name = searchParams.get('studentName') || studentName || '';
    if (!name) { router.push('/student'); return; }
    getStudentResults(id, name)
      .then(setResults)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, searchParams, studentName, router, _hasHydrated]);

  const toggleExpand = (qId: string) => {
    setExpandedIds(prev => {
      const s = new Set(prev);
      if (s.has(qId)) {
        s.delete(qId);
      } else {
        s.add(qId);
      }
      return s;
    });
  };

  const handlePrint = () => window.print();

  if (!_hasHydrated || loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#10375C]/30 border-t-[#10375C] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading your results…</p>
      </div>
    </div>
  );

  if (error || !results) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center">
        <p className="text-sm text-red-500">{error || 'Results not found'}</p>
        <button onClick={() => router.push('/student/dashboard')} className="mt-4 py-2 px-4 rounded-xl bg-slate-100 text-sm font-semibold hover:bg-slate-200 transition-colors">
          ← Back
        </button>
      </div>
    </div>
  );

  const grade = gradeInfo(results.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20 font-sans print:bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <button onClick={() => router.push('/student/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={() => router.push('/student/tutor')}
              className="flex items-center gap-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
            >
              <Brain className="w-3.5 h-3.5" /> Ask AI Tutor
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-8">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center gap-6"
        >
          <div className={`w-24 h-24 rounded-full border-4 ring-4 ${grade.ring} ${grade.border} ${grade.bg} flex flex-col items-center justify-center`}>
            <span className={`text-2xl font-black ${grade.color}`}>{grade.letter}</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-800">{grade.label}</h1>
            <p className="text-slate-500 text-sm mt-1">{results.studentName} • {results.assignmentTitle}</p>
          </div>
          <div className="flex gap-8 divide-x divide-slate-200">
            <div className="text-center pr-8">
              <p className="text-3xl font-black text-slate-900">{results.totalScore}</p>
              <p className="text-xs text-slate-400 mt-0.5">out of {results.totalMarks}</p>
            </div>
            <div className="text-center px-8">
              <p className="text-3xl font-black text-slate-900">{results.percentage}%</p>
              <p className="text-xs text-slate-400 mt-0.5">percentage</p>
            </div>
            <div className="text-center pl-8">
              <p className="text-3xl font-black text-slate-900">{results.answers.filter(a => a.isCorrect).length}</p>
              <p className="text-xs text-slate-400 mt-0.5">correct</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${results.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${results.percentage >= 70 ? 'bg-emerald-400' : results.percentage >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
            />
          </div>
        </motion.div>

        {/* Per-Question Breakdown */}
        <section>
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-indigo-500" />
            Question-by-Question Breakdown
          </h2>
          <div className="flex flex-col gap-3">
            {results.answers.map((ans, idx) => {
              const expanded = expandedIds.has(ans.questionId);
              return (
                <motion.div
                  key={ans.questionId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`bg-white rounded-2xl border overflow-hidden ${ans.isCorrect ? 'border-emerald-200' : 'border-red-200/70'}`}
                >
                  {/* Question header */}
                  <button
                    onClick={() => toggleExpand(ans.questionId)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {ans.isCorrect
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{ans.questionText}</p>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">{ans.questionType}</span>
                          {ans.conceptTag && <span className="text-[10px] text-indigo-400">{ans.conceptTag}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className={`text-xs font-bold ${ans.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                        {ans.marksAwarded}/{ans.questionMarks}
                      </span>
                      {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t border-slate-100 p-4 flex flex-col gap-3"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your Answer</p>
                        <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                          {ans.studentAnswer || <span className="text-slate-400 italic">No answer provided</span>}
                        </p>
                      </div>
                      {!ans.isCorrect && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Answer</p>
                          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-2.5 border border-emerald-200">
                            {ans.correctAnswer}
                          </p>
                        </div>
                      )}
                      {ans.aiFeedback && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-2">
                          <Brain className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mb-0.5">AI Feedback</p>
                            <p className="text-xs text-indigo-700 leading-relaxed">{ans.aiFeedback}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* AI Tutor Suggestion */}
        <div
          onClick={() => router.push('/student/tutor')}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white cursor-pointer flex items-center gap-4 hover:shadow-xl hover:shadow-indigo-200/50 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-sm">Need help understanding the concepts?</h3>
            <p className="text-indigo-100 text-xs mt-0.5">Ask our AI Tutor to explain any topic from this assignment</p>
          </div>
          <BookOpen className="w-5 h-5 text-white/70 flex-shrink-0" />
        </div>
      </main>
    </div>
  );
}
