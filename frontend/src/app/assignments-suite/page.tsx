// src/app/assignments-suite/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Layers, ClipboardList, Laptop, CheckCircle2, ArrowRight, Sparkles,
  FileText, Award, Star, ListChecks, Printer
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackgroundMesh from '@/components/landing/BackgroundMesh';

export default function AssignmentsSuitePage() {
  const router = useRouter();

  // State triggers for mockups
  const [activeFormat, setActiveFormat] = useState('MCQ');
  const [selectedMCQOption, setSelectedMCQOption] = useState<string | null>(null);
  const [blankAnswer, setBlankAnswer] = useState('');

  return (
    <div className="min-h-screen bg-[#EEF2F8] text-slate-800 selection:bg-[#10375C]/20 selection:text-[#10375C] font-sans overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Background elements */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#EAF0F8] via-[#EEF2F8] to-[#E6ECF5]" />
      <div className="fixed top-[-25%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-[#10375C]/[0.065] blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-300/[0.07] blur-[110px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] left-[15%] w-[70vw] h-[45vw] rounded-full bg-slate-300/[0.05] blur-[150px] pointer-events-none z-0" />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 35%, #EAF0F8 100%)' }} />
      <BackgroundMesh />

      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full pt-32 pb-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#10375C]/20 bg-[#10375C]/5 text-[#10375C] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Assignments Suite
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Assignments Suite
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-medium"
            >
              Explore our grading automation engines, CBSE worksheet compositions, formats builder, and paper PDF print systems.
            </motion.p>
          </div>

          <div className="flex flex-col gap-24">

            {/* ASSIGNMENT 1: Automatic Grading */}
            <div id="automatic-grading" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 shadow-sm">
                    <RefreshCw className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Automatic Grading</h2>
                    <p className="text-rose-500 text-xs font-semibold mt-0.5">Instant scoring diagnostics & qualitative teacher reviews</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Our Auto-Grading Engine parses submitted student worksheets, evaluating equations, proof steps, spelling, and grammar rules. It assigns instant marks and suggests custom qualitative steps to help student learning.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Instant multi-format submission check loops',
                    'Frictionless qualitative critique mapping',
                    'Teacher review and manual marks override'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Short-response homework checks. AI grades submissions instantly, saving hours while letting teachers adjust marks manually if needed.
                </div>
              </div>

              {/* Visual Representation Area: Graded Paper Script */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Student Paper Grading View</span>
                  <span className="text-[10px] font-bold bg-rose-50 border border-rose-100 text-rose-500 px-2 py-0.5 rounded">Auto Mark Sheet</span>
                </div>

                {/* Graded script content */}
                <div className="flex-1 flex flex-col justify-center gap-4 relative z-10 font-serif">
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-3 rounded-2xl shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-sans font-bold text-slate-900">Student: Aarav Mehta</span>
                      <span className="text-[8px] font-sans text-slate-400 font-semibold mt-0.5">Dynamics worksheet #3</span>
                    </div>
                    <div className="w-11 h-11 rounded-full border-2 border-dashed border-rose-500 flex flex-col items-center justify-center text-[11px] font-sans font-black text-rose-600 shadow-inner">
                      <span>18/20</span>
                      <span className="text-[6px] tracking-wider uppercase font-bold">A- Grade</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-2 shadow-sm font-serif text-[10px]">
                    <p className="text-slate-800 leading-relaxed font-semibold">
                      "Question: State Newton's Second Law. <br />
                      Answer: The force on an object is equal to its mass times its acceleration, written as F = ma."
                    </p>
                    <div className="border-t border-slate-100 pt-2.5 mt-1 flex items-start gap-2.5 font-sans">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5 text-[9px]">
                        <span className="font-bold text-slate-800">Grade: 2/2 (Correct)</span>
                        <span className="text-slate-550 font-medium">Feedback: Clear, concise formula matching physical law guidelines.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ASSIGNMENT 2: CBSE Board Prep */}
            <div id="cbse-board-prep" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area (Left for alternate balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CBSE Syllabus Template Mockup</span>
                  <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded">Board Specs</span>
                </div>

                {/* CBSE template mock */}
                <div className="flex-1 flex flex-col justify-center gap-4 relative z-10 font-sans">
                  <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start border-b border-slate-250 pb-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-900 uppercase">Board Exam Prep Section</span>
                        <span className="text-[8px] text-slate-450 mt-0.5">NCERT Chapter-wise matching</span>
                      </div>
                      <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">CBSE Grade 10</span>
                    </div>

                    <div className="flex flex-col gap-2 text-[9px] text-slate-650 font-semibold leading-relaxed">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <span>Section A: 10 MCQ Competency Checks</span>
                        <span className="text-[#10375C] font-black">Mapped</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <span>Section B: 5 Short Explanation Queries</span>
                        <span className="text-[#10375C] font-black">Mapped</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <span>Section C: 3 Long Proof Equations</span>
                        <span className="text-rose-500 font-black flex items-center gap-0.5">Missing Gaps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 shadow-sm">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">CBSE & Board Prep</h2>
                    <p className="text-indigo-500 text-xs font-semibold mt-0.5">CBSE standard curriculum templates mapping</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  ClassPilot maps directly to CBSE curriculum rules and textbooks. Generate worksheets containing chapter-aligned queries, competency review questions, and exam-pattern assessments.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'CBSE board syllabus mapping option settings',
                    'Exam-pattern template matching controls',
                    'NCERT chapter-wise question repositories'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Final test compositions. Compose school pre-board exam practice papers that replicate structural marking guidelines.
                </div>
              </div>
            </div>

            {/* ASSIGNMENT 3: Multiple Formats */}
            <div id="multiple-formats" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-500 shadow-sm">
                    <ClipboardList className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Multiple Assessment Formats</h2>
                    <p className="text-teal-500 text-xs font-semibold mt-0.5">Composite worksheets featuring MCQ, short, and long questions</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Design composite worksheets. Include multiple-choice questions, fill-in-the-blanks, matching columns, short-response prompts, and detailed proof questions in a single assessment composer.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'MCQ, Short, and Long subjective questions options',
                    'Custom fill-in-the-blanks blocks',
                    'Adjustable template format weights'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Bi-weekly unit checks. Create composite quizzes containing short-definition fields and complex proof challenges.
                </div>
              </div>

              {/* Visual Representation Area: Format Selector Tabs */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interactive Format Previews</span>
                  <div className="flex gap-1">
                    {['MCQ', 'Blanks'].map((fmt) => (
                      <button 
                        key={fmt} 
                        onClick={() => setActiveFormat(fmt)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all border ${
                          activeFormat === fmt 
                            ? 'bg-teal-50 border-teal-150 text-teal-600' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom interactive format mock content */}
                <div className="flex-1 flex flex-col justify-center relative z-10">
                  <AnimatePresence mode="wait">
                    {activeFormat === 'MCQ' ? (
                      <motion.div 
                        key="mcq"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex flex-col gap-3 text-xs"
                      >
                        <span className="font-bold text-slate-900">Q: What represents the rate of velocity change?</span>
                        <div className="flex flex-col gap-2">
                          {[
                            { key: 'A', text: 'Speed' },
                            { key: 'B', text: 'Acceleration' },
                            { key: 'C', text: 'Displacement' }
                          ].map((opt) => {
                            const isSelected = selectedMCQOption === opt.key;
                            return (
                              <button 
                                key={opt.key}
                                onClick={() => setSelectedMCQOption(opt.key)}
                                className={`p-2.5 rounded-xl border text-[10px] font-semibold text-left transition-all ${
                                  isSelected 
                                    ? 'bg-[#10375C] border-[#10375C] text-white' 
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="font-bold mr-2">{opt.key}.</span> {opt.text}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="blanks"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex flex-col gap-4 text-xs font-semibold"
                      >
                        <span className="font-bold text-slate-900">Q: Fill in the blank with correct terms:</span>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3">
                          <p className="text-[10px] text-slate-700 leading-relaxed font-serif">
                            "The element zinc acts as the <span className="bg-yellow-50 border border-yellow-200 px-1 py-0.5 rounded text-yellow-800 text-[9px] font-sans font-bold">reducing agent</span> in a standard copper-zinc redox reaction."
                          </p>
                          <div className="flex flex-col gap-1 mt-1 font-sans">
                            <label className="text-[8px] uppercase tracking-wider text-slate-450">Type answer check</label>
                            <input 
                              type="text" 
                              value={blankAnswer}
                              onChange={(e) => setBlankAnswer(e.target.value)}
                              placeholder="reducing agent" 
                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-800 focus:outline-none focus:border-teal-500 shadow-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ASSIGNMENT 4: Export PDFs */}
            <div id="export-pdfs" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area: Tilted 3D Paper (Left for alternate balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PDF Print layout</span>
                  <span className="text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-600 px-2 py-0.5 rounded">A4 Sheet</span>
                </div>

                {/* 3D-like tilted paper representation */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                  <div className="w-[180px] h-[250px] bg-white border border-slate-350 shadow-2xl rounded p-3 flex flex-col gap-2 transform rotate-2 hover:rotate-0 transition-transform cursor-pointer relative overflow-hidden">
                    {/* Header elements */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <div className="flex flex-col">
                        <span className="text-[6px] font-black text-slate-900 uppercase tracking-tight">ClassPilot Academy</span>
                        <span className="text-[4px] text-slate-400 font-semibold">Weekly Dynamics Quiz</span>
                      </div>
                      <Printer className="w-2.5 h-2.5 text-slate-450" />
                    </div>

                    {/* Question lines */}
                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[5px] font-extrabold text-slate-800">1. State Newton's Third Law.</span>
                        <div className="border-b border-slate-150 h-2 mt-1" />
                        <div className="border-b border-slate-150 h-2" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[5px] font-extrabold text-slate-800">2. Solve friction coefficient for mass M.</span>
                        <div className="border-b border-slate-150 h-2 mt-1" />
                        <div className="border-b border-slate-150 h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 shadow-sm">
                    <Laptop className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Export PDFs</h2>
                    <p className="text-amber-500 text-xs font-semibold mt-0.5">Custom margin layouts for printed assessments</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Download generated worksheets as clean, print-ready PDFs. Features custom page alignments, school headers, student marking blanks, and teacher key templates for offline use.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Print-ready, custom margin templates',
                    'Custom header logo slots',
                    'Separate answer key sheet builders'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  In-class paper testing. Generate quiz documents, print them for students, and download separate solution key sheets.
                </div>
              </div>
            </div>

          </div>

          {/* CTA Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-28 text-center bg-[#10375C] rounded-3xl p-8 md:p-14 text-white shadow-xl shadow-[#10375C]/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#10375C] via-[#0d2f4f] to-[#10375C]" />
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-4">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Streamline Assessment Grading</h2>
              <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
                Unlock CBSE test composer pipelines, automate marking steps, and export print-ready PDFs.
              </p>
              <button
                onClick={() => router.push('/sign-up')}
                className="mt-4 px-6 py-3 rounded-full text-xs font-bold bg-white text-[#10375C] hover:bg-slate-50 shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Compose Assignments Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
