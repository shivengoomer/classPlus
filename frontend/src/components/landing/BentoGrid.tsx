// src/components/landing/BentoGrid.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, BarChart3, Brain, ClipboardList,
  ArrowUpRight, Zap, Target, RefreshCw, Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';

const GRADING_SAMPLES = [
  {
    student: 'Aarav S.',
    grade: '18/20 (A-)',
    feedback: 'Excellent proof of Pythagorean theory, minor rounding mistake.',
    color: 'text-emerald-600',
    progress: 78
  },
  {
    student: 'Priya M.',
    grade: '14/20 (B)',
    feedback: 'Good reasoning but missed formula application in Q3.',
    color: 'text-amber-500',
    progress: 70
  },
  {
    student: 'Rohan D.',
    grade: '20/20 (A+)',
    feedback: 'Perfect! All steps shown, units correct throughout.',
    color: 'text-emerald-500',
    progress: 100
  },
];

const CHAT_PRESETS = [
  { q: "What is Newton's 1st Law?", a: "An object at rest stays at rest unless acted on by a force! 🏃‍♂️ This is called *inertia* — try sliding a book on a table to feel it." },
  { q: 'Explain photosynthesis.', a: 'Plants are food factories! 🌱 Sunlight + CO₂ + Water → Sugar + Oxygen. The sugar feeds the plant; the oxygen feeds us.' },
  { q: 'How do you solve x + 5 = 12?', a: 'Simple! Subtract 5 from both sides: x = 12 − 5 = **7** ✅. Always do the same thing to both sides.' },
];

const GRADES = ['Grade 6 (CBSE)', 'Grade 7 (CBSE)', 'Grade 8 (CBSE)', 'Grade 9 (CBSE)', 'Grade 10 (CBSE)', 'Grade 12 (JEE)'];
const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'History'];

export default function BentoGrid() {
  const router = useRouter();
  const { setSubject, setGrade, setTitle, setInstructions } = useFormStore();

  const [activeQuestionType, setActiveQuestionType] = useState('MCQ');
  const [gradingIdx, setGradingIdx] = useState(0);
  const [isCycling, setIsCycling] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('Grade 8 (CBSE)');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [activeChatIdx, setActiveChatIdx] = useState<number | null>(null);
  const [showAIReply, setShowAIReply] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const currentSample = GRADING_SAMPLES[gradingIdx];

  const handleCycleGrading = () => {
    setIsCycling(true);
    setTimeout(() => {
      setGradingIdx((prev) => (prev + 1) % GRADING_SAMPLES.length);
      setIsCycling(false);
    }, 400);
  };

  const handleGenerateWorksheet = () => {
    setGrade(selectedGrade.replace(' (CBSE)', '').replace(' (JEE)', ''));
    setSubject(selectedSubject);
    setTitle(`${selectedSubject} — ${activeQuestionType} Assessment`);
    setInstructions(`Auto-generated ${activeQuestionType} questions for ${selectedGrade}, ${selectedSubject}.`);
    router.push('/create');
  };

  const handleChatPreset = (idx: number) => {
    setActiveChatIdx(idx);
    setShowAIReply(false);
    setTimeout(() => setShowAIReply(true), 800);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setShowAIReply(false);
    setActiveChatIdx(null);
    setTimeout(() => {
      setActiveChatIdx(-1); // custom prompt
      setShowAIReply(true);
    }, 800);
    setChatInput('');
  };

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto z-10 relative font-sans">
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-4 mb-16">
        <div className="px-3 py-1 rounded-full bg-[#10375C]/10 text-[#10375C] border border-[#10375C]/20 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#10375C]" /> Core Capabilities
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Supercharge the Way You Teach
        </h2>
        <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed">
          classPlus integrates class creation, intelligent question templates, auto-evaluation, and gap mapping in a single workspace.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Intelligent Assignment Generator (Col Span 2) */}
        <div className="md:col-span-2 rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between hover:border-[#10375C]/30 shadow-md shadow-slate-100/50 transition-all group relative overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-[#10375C]/5 rounded-full blur-3xl group-hover:bg-[#10375C]/10 transition-all" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-[#10375C]/10 border border-[#10375C]/20 text-[#10375C]">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-[#10375C] uppercase tracking-widest bg-[#10375C]/15 border border-[#10375C]/20 px-2 py-0.5 rounded">
                AI Generator
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#10375C] transition-colors">
                Smart Assessment Composer <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#10375C] transition-colors" />
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-2 leading-relaxed max-w-md">
                Design custom, curriculum-aligned homework sheets, assessments, and quizzes. Select Grade, Subject, and prompt AI to write balanced worksheets.
              </p>
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="mt-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 flex flex-col gap-4 relative z-10">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Grade Level</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-800 font-semibold shadow-sm cursor-pointer focus:outline-none focus:border-[#10375C]"
                >
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-800 font-semibold shadow-sm cursor-pointer focus:outline-none focus:border-[#10375C]"
                >
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                {['MCQ', 'Short', 'Long'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveQuestionType(type)}
                    className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${
                      activeQuestionType === type 
                        ? 'bg-[#10375C] text-white shadow-sm shadow-[#10375C]/20' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateWorksheet}
                className="px-3 py-1 rounded bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-[9px] flex items-center gap-1 transition-all active:scale-95 shadow-sm shadow-[#10375C]/10"
              >
                <Sparkles className="w-2.5 h-2.5" /> Generate Worksheet
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Automatic Grading Engine (Col Span 1) */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between hover:border-[#10375C]/30 shadow-md shadow-slate-100/50 transition-all group relative overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#10375C]/5 rounded-full blur-3xl group-hover:bg-[#10375C]/10 transition-all" />

          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-[#10375C]/10 border border-[#10375C]/20 text-[#10375C] self-start">
              <Zap className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#10375C] transition-colors">
                Instant Auto-Grading
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-2 leading-relaxed">
                Evaluating papers becomes painless. AI instantly processes student inputs, awards marks, and adds suggestions.
              </p>
            </div>
          </div>

          {/* Interactive grading widget */}
          <div className="mt-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 flex flex-col gap-3 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[9px] text-slate-400 font-bold">Grading Progress</span>
              <span className="text-[9px] font-bold text-[#10375C]">{currentSample.progress}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200/50 h-2.5 rounded-full p-0.5 overflow-hidden shadow-inner">
              <motion.div 
                className="bg-[#10375C] h-full rounded-full"
                animate={{ width: `${currentSample.progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={gradingIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2 bg-white rounded-lg p-2 border border-slate-200 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-[8px]">
                  <span className={`font-bold ${currentSample.color}`}>{currentSample.student} — {currentSample.grade}</span>
                  <span className="text-slate-500">{currentSample.feedback}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={handleCycleGrading}
              disabled={isCycling}
              className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-bold transition-all active:scale-95 border border-slate-200"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isCycling ? 'animate-spin' : ''}`} />
              Next Student
            </button>
          </div>
        </div>

        {/* Card 3: AI Learning Companion Tutor (Col Span 1) */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between hover:border-pink-500/30 shadow-md shadow-slate-100/50 transition-all group relative overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-all" />

          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-600 self-start">
              <Brain className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                24/7 AI Companion
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-2 leading-relaxed">
                Students receive custom study assistance, interactive hints, and step-by-step guidance.
              </p>
            </div>
          </div>

          {/* Interactive Chat */}
          <div className="mt-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3 flex flex-col gap-2 relative z-10">
            {/* Preset chips */}
            <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-200">
              {CHAT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChatPreset(idx)}
                  className={`text-[8px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                    activeChatIdx === idx
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-600'
                  }`}
                >
                  {preset.q.slice(0, 18)}…
                </button>
              ))}
            </div>

            {/* Chat area */}
            <div className="flex flex-col gap-2 min-h-[80px]">
              {activeChatIdx !== null && (
                <div className="bg-[#10375C] rounded-lg p-2 text-[8px] leading-relaxed text-white self-end shadow-sm">
                  {activeChatIdx >= 0 ? CHAT_PRESETS[activeChatIdx]?.q : 'Custom question…'}
                </div>
              )}
              <AnimatePresence>
                {activeChatIdx !== null && showAIReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg p-2 text-[8px] leading-relaxed border border-slate-200 shadow-sm text-slate-700 self-start"
                  >
                    <span className="font-bold text-pink-600">Tutor: </span>
                    {activeChatIdx >= 0
                      ? CHAT_PRESETS[activeChatIdx]?.a
                      : 'Great question! Let me break that down step by step for you. 🎯'}
                  </motion.div>
                )}
                {activeChatIdx === null && (
                  <p className="text-[8px] text-slate-400 text-center py-4">Tap a question above to try the AI tutor!</p>
                )}
              </AnimatePresence>
            </div>

            {/* Input row */}
            <div className="flex items-center gap-2 border-t border-slate-200 pt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-white border border-slate-200 rounded-full px-2 py-1 text-[8px] focus:outline-none focus:border-pink-300"
              />
              <button
                onClick={handleChatSend}
                className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors active:scale-95"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Advanced Performance Analytics (Col Span 2) */}
        <div className="md:col-span-2 rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between hover:border-cyan-500/30 shadow-md shadow-slate-100/50 transition-all group relative overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest bg-cyan-500/15 border border-cyan-500/20 px-2 py-0.5 rounded">
                Analytics
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-cyan-600 transition-colors">
                Classroom Gaps & Dashboard <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-2 leading-relaxed max-w-md">
                Monitor student completion cycles, map core curriculum competencies, identify class strengths and weaknesses, and export reports for parents automatically.
              </p>
            </div>
          </div>

          {/* Interactive Chart widget */}
          <div className="mt-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 flex flex-col gap-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-700 font-bold">Chapter Gaps Analysis</span>
              <span className="text-[9px] text-emerald-600 flex items-center gap-1 font-semibold">
                <Target className="w-3 h-3" /> Updated 1m ago
              </span>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Chemical Bonding', pct: 88, color: 'bg-[#10375C]' },
                { label: 'Force & Friction', pct: 64, color: 'bg-amber-500' },
                { label: 'Algebraic Identities', pct: 92, color: 'bg-[#10375C]' },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                    <span>{label}</span>
                    <span className="text-slate-750 font-bold">{pct}% Mastery{pct < 70 ? ' (Action Required)' : ''}</span>
                  </div>
                  <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full p-0.5 overflow-hidden shadow-inner">
                    <motion.div
                      className={`${color} h-full rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
