// src/app/features/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Brain, FileSpreadsheet, BarChart3, CheckCircle2, ArrowRight, Sparkles,
  Lock, ArrowDown, Send, Settings, ShieldCheck, Zap
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackgroundMesh from '@/components/landing/BackgroundMesh';

export default function FeaturesPage() {
  const router = useRouter();
  
  // Interactive states for mockups
  const [activeRoadmapNode, setActiveRoadmapNode] = useState(1);
  const [generatorGrade, setGeneratorGrade] = useState('Grade 8 (CBSE)');
  const [generatorSubject, setGeneratorSubject] = useState('Physics');
  const [composerOutputCount, setComposerOutputCount] = useState(15);
  
  const roadmapNodes = [
    { id: 1, title: 'Concept Introduction', status: 'Completed', details: 'Friction coefficients, normal force basics' },
    { id: 2, title: 'Friction Analysis', status: 'In Progress', details: 'Solving static vs kinetic friction systems' },
    { id: 3, title: 'Air Resistance', status: 'Locked', details: 'Terminal velocity and drag coefficients' },
    { id: 4, title: 'Exam Review Node', status: 'Locked', details: 'Unified dynamics problem assessment' }
  ];

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
              <Sparkles className="w-3.5 h-3.5" /> Product Suite
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Core Platform Features
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-medium"
            >
              Experience the visual, interactive suite designed to optimize classroom grading, curriculum tracking, and pupil comprehension.
            </motion.p>
          </div>

          <div className="flex flex-col gap-24">

            {/* FEATURE 1: Smart Learning Paths */}
            <div id="smart-learning" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-500 shadow-sm">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Smart Learning Paths</h2>
                    <p className="text-orange-500 text-xs font-semibold mt-0.5">Adaptive, curriculum-aligned pupil roadmaps</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Smart Learning Paths automatically trace curriculum rules, generating customized learning paths based on individual competency markers. Instead of one-size-fits-all, each student receives material optimized for their current level, ensuring deep core understanding before moving to advanced topics.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Curriculum-aligned mastery nodes',
                    'Automatic learning gap remediation',
                    'Adaptive pace tracking and adjustment'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Assign homework that tailors itself. Struggling students get foundational nodes, while excelling students unlock boards challenges automatically.
                </div>
              </div>

              {/* Visual Representation Area */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interactive Student Roadmap</span>
                  <span className="text-[10px] font-bold bg-orange-50 border border-orange-100 text-orange-500 px-2 py-0.5 rounded">Adaptive Graph</span>
                </div>

                {/* Animated Roadmap nodes */}
                <div className="flex flex-col gap-5 relative z-10">
                  {roadmapNodes.map((node) => {
                    const isActive = activeRoadmapNode === node.id;
                    const isCompleted = node.status === 'Completed';
                    const isLocked = node.status === 'Locked';
                    
                    return (
                      <div 
                        key={node.id} 
                        onClick={() => !isLocked && setActiveRoadmapNode(node.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isActive 
                            ? 'bg-white border-[#10375C] shadow-md shadow-[#10375C]/5' 
                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${
                            isCompleted 
                              ? 'bg-emerald-100 border border-emerald-200 text-emerald-600' 
                              : isActive 
                              ? 'bg-[#10375C] text-white' 
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : node.id}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{node.title}</span>
                            <span className="text-[9px] text-slate-400 mt-0.5 block line-clamp-1">{node.details}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              isCompleted 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-blue-50 text-blue-500 animate-pulse'
                            }`}>{node.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FEATURE 2: 24/7 Personal AI Tutor */}
            <div id="ai-tutor" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area (Left for alternate balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">classPlus Tutor Simulator</span>
                  <span className="text-[10px] font-bold bg-purple-50 border border-purple-100 text-purple-600 px-2 py-0.5 rounded">Scaffolding Dialogue</span>
                </div>

                {/* Animated Tutor dialog */}
                <div className="flex flex-col gap-4 relative z-10 flex-1 justify-end">
                  <div className="self-end bg-[#10375C] text-white rounded-2xl rounded-tr-none px-3 py-2 max-w-[80%] text-[10px] leading-relaxed shadow-sm">
                    How does gravity affect terminal velocity? 🌌
                  </div>
                  <div className="self-start bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 max-w-[90%] shadow-sm flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-purple-600 uppercase tracking-wider flex items-center gap-1">
                      <Brain className="w-2.5 h-2.5" /> AI Tutor
                    </span>
                    <p className="text-[10px] text-slate-700 leading-relaxed font-medium">
                      Think about **two competing forces** acting on a falling object:
                    </p>
                    <ul className="list-disc pl-4 text-[9px] text-slate-500 leading-relaxed flex flex-col gap-0.5">
                      <li>**Gravity** pulling it downwards (accelerating it).</li>
                      <li>**Air Resistance** pushing back upwards (resisting velocity).</li>
                    </ul>
                    <p className="text-[9px] text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-2 mt-1">
                      What happens to the drag force as the speed increases? Can you guess? 🤔
                    </p>
                  </div>
                  <div className="self-end bg-[#10375C]/10 text-[#10375C] border border-[#10375C]/20 rounded-2xl rounded-tr-none px-3 py-2 max-w-[70%] text-[10px] leading-relaxed font-semibold italic flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10375C] animate-pulse" /> Student typing reply...
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-500 shadow-sm">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">24/7 Personal AI Tutor</h2>
                    <p className="text-purple-500 text-xs font-semibold mt-0.5">Qualitative conversational tutoring copilot</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Our AI Tutor provides responsive, conversational help at any hour. Using structured pedagogy, it coaches students through math equations, science concepts, and essay drafting rather than simply providing answers, fostering critical thinking and active comprehension.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Conversational scaffolding technique (never copies answers)',
                    'Multi-step equation and math solver support',
                    'Qualitative reading and writing feedback cycles'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Late-night revision support. When students get stuck on homework equations, the AI Tutor guides them to solve them step-by-step.
                </div>
              </div>
            </div>

            {/* FEATURE 3: Intelligent Assignment Composer */}
            <div id="assignment-gen" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-500 shadow-sm">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Smart Assessment Composer</h2>
                    <p className="text-blue-500 text-xs font-semibold mt-0.5">Generate worksheets matching school curricula in seconds</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  The Assignment Generator allows educators to quickly generate customized assessments. Simply input the grade level, select the subject guidelines, and prompt the AI. In seconds, you have a balanced sheet with MCQs, short answers, and structured queries.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Composite MCQ, Blanks, and proof generator options',
                    'NCERT syllabus mapping tools',
                    'Print-ready PDF layout formatting'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Weekly quiz composition. Set syllabus guidelines, adjust question counts, download as a printable PDF.
                </div>
              </div>

              {/* Visual Representation Area */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Composer Settings Mockup</span>
                  <span className="text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded">Curriculum AI</span>
                </div>

                {/* Form elements */}
                <div className="flex flex-col gap-4 relative z-10 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Grade Level</label>
                      <select 
                        value={generatorGrade} 
                        onChange={(e) => setGeneratorGrade(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-800 font-bold focus:outline-none focus:border-[#10375C] cursor-pointer shadow-sm"
                      >
                        <option>Grade 8 (CBSE)</option>
                        <option>Grade 10 (CBSE)</option>
                        <option>Grade 12 (JEE)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Syllabus Topic</label>
                      <select 
                        value={generatorSubject} 
                        onChange={(e) => setGeneratorSubject(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-800 font-bold focus:outline-none focus:border-[#10375C] cursor-pointer shadow-sm"
                      >
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Mathematics</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-400 font-bold">
                      <span>Question Count</span>
                      <span className="text-[#10375C] font-black">{composerOutputCount} Items</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      value={composerOutputCount}
                      onChange={(e) => setComposerOutputCount(parseInt(e.target.value))}
                      className="w-full accent-[#10375C] h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col gap-1.5 mt-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">AI Compose Prompt</span>
                    <p className="text-[10px] text-slate-650 leading-relaxed font-semibold italic">
                      "Generate MCQ questions analyzing static friction coefficients and normal force components..."
                    </p>
                  </div>
                </div>

                <button className="w-full mt-4 py-2.5 bg-[#10375C] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#0d2f4f] transition-all flex items-center justify-center gap-1.5 active:scale-95">
                  <Sparkles className="w-4 h-4" /> Generate Practice Sheet
                </button>
              </div>
            </div>

            {/* FEATURE 4: Performance Analytics Engine */}
            <div id="analytics" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area (Left for alternate balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Diagnostics</span>
                  <span className="text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded">Gaps Matrix</span>
                </div>

                {/* Animated diagnostic metrics */}
                <div className="flex-1 flex flex-col justify-center gap-5 relative z-10">
                  <div className="flex items-center gap-6 bg-slate-50/50 p-4 border border-slate-200/50 rounded-2xl shadow-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <motion.path 
                          className="text-[#10375C]" 
                          strokeWidth="3.2" 
                          strokeDasharray="84, 100" 
                          strokeLinecap="round"
                          stroke="currentColor" 
                          fill="none" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                      </svg>
                      <span className="absolute text-[11px] font-black text-slate-900">84%</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Class Avg Competency</span>
                      <span className="text-[9px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> +2.8% vs last week
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-550 mb-1">
                        <span>Redox Balancing</span>
                        <span className="text-slate-800 font-black">92% Locked</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/50 h-2.5 rounded-full p-0.5 overflow-hidden shadow-inner">
                        <div className="bg-[#10375C] h-full rounded-full w-[92%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-550 mb-1">
                        <span>Force & Dynamics Gaps</span>
                        <span className="text-rose-500 font-black">62% (Needs Remediation)</span>
                      </div>
                      <div className="w-full bg-slate-100 border border-slate-200/50 h-2.5 rounded-full p-0.5 overflow-hidden shadow-inner">
                        <div className="bg-rose-500 h-full rounded-full w-[62%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 shadow-sm">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Diagnostics Analytics Engine</h2>
                    <p className="text-emerald-500 text-xs font-semibold mt-0.5">Real-time learning gap mapping</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  classPlus maps class activity, highlighting trends and topic mastery. Understand where your students are struggling before the exam, track completion rates, and extract comprehensive metrics instantly.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Syllabus competency mapping logs',
                    'Automated study engagement insights',
                    'Struggling student alerts and reports'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Term-end reviews. Flag conceptual gaps in physics so teachers can run targeted reinforcement classes before board exams.
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
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Ready to Transform Your Classroom?</h2>
              <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
                Join thousands of CBSE educators using classPlus to automate curriculum creation, assignment delivery, and instant analytics.
              </p>
              <button
                onClick={() => router.push('/sign-up')}
                className="mt-4 px-6 py-3 rounded-full text-xs font-bold bg-white text-[#10375C] hover:bg-slate-50 shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Get Started For Free</span>
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
