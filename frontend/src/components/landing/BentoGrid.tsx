// src/components/landing/BentoGrid.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, BarChart3, Brain, ClipboardList,
  ArrowUpRight, Zap, Target
} from 'lucide-react';

export default function BentoGrid() {
  const [activeQuestionType, setActiveQuestionType] = useState('MCQ');
  const gradingProgress = 78;

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto z-10 relative font-sans">
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-4 mb-16">
        <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-orange-600" /> Core Capabilities
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Supercharge the Way You Teach
        </h2>
        <p className="text-slate-500 max-w-xl text-sm md:text-base leading-relaxed">
          VedAI integrates class creation, intelligent question templates, auto-evaluation, and gap mapping in a single workspace.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Intelligent Assignment Generator (Col Span 2) */}
        <div className="md:col-span-2 rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between hover:border-orange-500/30 shadow-md shadow-slate-100/50 transition-all group relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-[10%] -left-[10%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all" />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 rounded">
                AI Generator
              </span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                Smart Assessment Composer <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-2 leading-relaxed max-w-md">
                Design custom, curriculum-aligned homework sheets, assessments, and quizzes. Select Grade, Subject, and prompt AI to write balanced worksheets.
              </p>
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="mt-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-4 flex flex-col gap-4 relative z-10">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Grade Level</label>
                <div className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-800 font-semibold shadow-sm">
                  Grade 8 (CBSE)
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Subject</label>
                <div className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-800 font-semibold shadow-sm">
                  Physics (Forces)
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Topic Prompt</label>
                <div className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-600 truncate shadow-sm">
                  Newton&apos;s Laws of Motion...
                </div>
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
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20' 
                        : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button className="px-3 py-1 rounded bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-[9px] flex items-center gap-1 transition-all active:scale-95 shadow-sm shadow-orange-500/10">
                <Sparkles className="w-2.5 h-2.5" /> Generate Worksheet
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Automatic Grading Engine (Col Span 1) */}
        <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/80 p-6 md:p-8 flex flex-col justify-between hover:border-orange-500/30 shadow-md shadow-slate-100/50 transition-all group relative overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all" />

          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 self-start">
              <Zap className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
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
              <span className="text-[9px] font-bold text-orange-600">78% Complete</span>
            </div>
            <div className="w-full bg-slate-100 border border-slate-200/50 h-2.5 rounded-full p-0.5 overflow-hidden shadow-inner">
              <motion.div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full"
                animate={{ width: `${gradingProgress}%` }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>
            <div className="flex items-start gap-2 bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 text-[8px]">
                <span className="font-bold text-slate-700">Grade: 18/20 (A-)</span>
                <span className="text-slate-500">Feedback: Excellent proof of Pythagorean theory, minor rounding mistake.</span>
              </div>
            </div>
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

          {/* Interactive Chat dialog mockup */}
          <div className="mt-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3 flex flex-col gap-2 relative z-10">
            <div className="bg-white rounded-lg p-2 text-[8px] leading-relaxed border border-slate-200 shadow-sm text-slate-700">
              <span className="font-bold text-pink-600">Tutor:</span> What is the capital of France? 🇫🇷
            </div>
            <div className="bg-orange-500 rounded-lg p-2 text-[8px] leading-relaxed text-white self-end shadow-sm shadow-orange-500/10">
              It&apos;s Paris!
            </div>
            <div className="bg-white rounded-lg p-2 text-[8px] leading-relaxed border border-slate-200 shadow-sm text-slate-700">
              <span className="font-bold text-pink-600">Tutor:</span> Correct! Paris has been the capital since 508 AD. Excellent!
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
              <div>
                <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                  <span>Chemical Bonding</span>
                  <span className="text-slate-750 font-bold">88% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full p-0.5 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full w-[88%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                  <span>Force & Friction</span>
                  <span className="text-slate-750 font-bold">64% Mastery (Action Required)</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full p-0.5 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full w-[64%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] text-slate-500 mb-1">
                  <span>Algebraic Identities</span>
                  <span className="text-slate-750 font-bold">92% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200/50 h-2 rounded-full p-0.5 overflow-hidden shadow-inner">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
