// src/app/ai-assistant/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Brain, Award, Compass, CheckCircle2, ArrowRight, Sparkles,
  Send, Cpu, User, Check, RefreshCw, PenTool, Layout
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BackgroundMesh from '@/components/landing/BackgroundMesh';

export default function AIAssistantPage() {
  const router = useRouter();

  // State triggers for mockups
  const [activeStep, setActiveStep] = useState(1);
  const [hoveredReviewId, setHoveredReviewId] = useState<number | null>(null);

  const conceptSteps = [
    { id: 1, label: 'Reactants Node', desc: 'Zinc metal (Zn) interacts with copper ions (Cu²⁺)' },
    { id: 2, label: 'Electron Handshake', desc: 'Zn transfers 2 electrons to Cu²⁺' },
    { id: 3, label: 'Oxidation Phase', desc: 'Zn loses electrons, turning into Zn²⁺ (Oxidized)' },
    { id: 4, label: 'Reduction Phase', desc: 'Cu²⁺ gains electrons, turning into solid Cu (Reduced)' }
  ];

  const essayReviews = [
    { id: 1, text: 'The atmosphere of the text is really sad', feedback: 'Tone Improvement: consider using "melancholic atmosphere" or "somber tone" to enhance academic style.', type: 'style' },
    { id: 2, text: 'which impacts the character significantly', feedback: 'Argument Expansion: elaborate on *how* it impacts their decisions. Add details about their conflict.', type: 'argument' }
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
              <Sparkles className="w-3.5 h-3.5" /> AI Assistant Suite
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Interactive AI Tutor
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-medium"
            >
              Explore how our cognitive coaching models answer equations, evaluate essay layouts, and compose visuals to optimize student home learning.
            </motion.p>
          </div>

          <div className="flex flex-col gap-24">

            {/* ASSISTANT 1: Interactive Student Chat */}
            <div id="student-chat" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-500 shadow-sm">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Interactive Student Chat</h2>
                    <p className="text-blue-500 text-xs font-semibold mt-0.5">Conversational subject coaching mapped to school syllabi</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Our interactive student chat does not simply print standard definitions. Instead, it engages students with guided follow-up questions, interactive analogies, and step-by-step logic, mirroring the scaffolding approach of a live educator.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Syllabus-bounded academic safety filters',
                    'Qualitative dialogue progress tracking',
                    'Interactive concept check quizzes'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Interactive home companion. Students check reading comprehension logic, math formulas, and concept thresholds dynamically.
                </div>
              </div>

              {/* Visual Representation Area: Phone Simulator */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-[300px] h-[540px] bg-black rounded-[45px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden">
                  
                  {/* Phone Header */}
                  <div className="w-full pt-4 pb-2 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-900 text-white rounded-t-[35px] relative z-10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#10375C] border border-[#10375C]/20 flex items-center justify-center">
                        <Cpu className="w-3.5 h-3.5 text-white animate-pulse" />
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[9px] font-black">ClassPilot Tutor</span>
                        <span className="text-[7px] text-emerald-500 font-bold mt-0.5">Online Helper</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat logs */}
                  <div className="flex-1 bg-slate-50 p-3.5 flex flex-col gap-3.5 overflow-hidden justify-end">
                    <div className="self-end bg-[#10375C] text-white rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[80%] text-[9px] leading-relaxed shadow-sm">
                      What is dynamic equilibrium? ⚖️
                    </div>
                    <div className="self-start bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 max-w-[90%] shadow-sm flex flex-col gap-1 text-[9px] text-slate-700 leading-relaxed">
                      <span className="text-[7px] font-black uppercase text-purple-600 tracking-wider">AI tutor</span>
                      Imagine walking **up** a downward escalator. If your speed matches the escalator's speed:
                      <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[8px] leading-relaxed mt-1 text-slate-500 font-semibold italic">
                        "To an outside observer, you appear stationary, but active energy is moving in both directions."
                      </div>
                    </div>
                    <div className="self-end bg-[#10375C] text-white rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[80%] text-[9px] leading-relaxed shadow-sm">
                      Ah, so react rates are equal? 😮
                    </div>
                    <div className="self-start bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3 py-1.5 max-w-[85%] text-[9px] shadow-sm text-slate-700">
                      Exactly! ✅ Forward and reverse rates match.
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="p-2.5 bg-slate-950 border-t border-slate-900 flex items-center gap-2 rounded-b-[35px]">
                    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-[8px] text-slate-500">
                      Type dynamic equilibrium query...
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#10375C] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <Send className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ASSISTANT 2: Concept Explainer */}
            <div id="concept-explainer" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area (Left for alternate balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Visual Deconstruction Diagram</span>
                  <span className="text-[10px] font-bold bg-purple-50 border border-purple-100 text-purple-600 px-2 py-0.5 rounded">Explainer Nodes</span>
                </div>

                {/* Concept explainer interactive step list */}
                <div className="flex-1 flex flex-col gap-4 relative z-10 justify-center">
                  <div className="flex items-center justify-between px-2 text-[10px] font-black text-[#10375C] uppercase tracking-wider">
                    <span>Topic: Redox Reaction</span>
                    <span>Step {activeStep} of 4</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {conceptSteps.map((step) => (
                      <button 
                        key={step.id} 
                        onClick={() => setActiveStep(step.id)}
                        className={`py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                          activeStep === step.id 
                            ? 'bg-[#10375C] border-[#10375C] text-white shadow-md' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Node {step.id}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeStep}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#10375C]/5 border border-[#10375C]/15 rounded-2xl p-4 min-h-[100px] flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{conceptSteps[activeStep - 1].label}</h4>
                        <p className="text-[10px] text-slate-650 mt-1 leading-relaxed">{conceptSteps[activeStep - 1].desc}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase text-[#10375C] tracking-wider block text-right mt-3">Concept Check Active</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-500 shadow-sm">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Concept Explainer</h2>
                    <p className="text-purple-500 text-xs font-semibold mt-0.5">Visual concept breakdown templates</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  The Concept Explainer is optimized to break down complex formulas, biological processes, or grammar rules. Using HSL-tailored visual components, it walks students from ground-level rules to complex relationships, helping visual and structural learners.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Visual deconstruction roadmap cards',
                    'Interactive concept analogy compositions',
                    'Comprehensive diagram summaries'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Breaking down photosynthesis steps. Rather than reading textbook paragraphs, students tap through animated, structured step nodes.
                </div>
              </div>
            </div>

            {/* ASSISTANT 3: Writing Coach */}
            <div id="writing-coach" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-500 shadow-sm">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Writing Coach & Editor</h2>
                    <p className="text-orange-500 text-xs font-semibold mt-0.5">Qualitative checks on arguments, vocabulary, and style</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Writing Coach acts as an AI editor for drafts. It checks thesis strength, grammatical correctness, and structure while providing suggestions to improve clarity and style without rewriting the essay for the student.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Qualitative critique on flows and thesis layouts',
                    'Academic sentence variety suggestions',
                    'Checklist checks matching CBSE marking boards'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  English literature practice. Students draft paragraph summaries, receive grammar and vocabulary score reviews, and polish drafts.
                </div>
              </div>

              {/* Visual Representation Area: Mock Editor with Highlights */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Writing critique editor</span>
                  <span className="text-[10px] font-bold bg-orange-50 border border-orange-100 text-orange-500 px-2 py-0.5 rounded">Style Analysis</span>
                </div>

                {/* Essay text editor view */}
                <div className="flex-1 flex flex-col gap-4 relative z-10">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[10px] text-slate-700 leading-relaxed font-semibold font-serif">
                    "In the second chapter, <span 
                      onMouseEnter={() => setHoveredReviewId(1)}
                      onMouseLeave={() => setHoveredReviewId(null)}
                      className="bg-yellow-100 border-b-2 border-yellow-400 cursor-help px-0.5 rounded"
                    >the atmosphere of the text is really sad</span>, which instantly signals the protagonist's upcoming tragedy, <span 
                      onMouseEnter={() => setHoveredReviewId(2)}
                      onMouseLeave={() => setHoveredReviewId(null)}
                      className="bg-blue-100 border-b-2 border-blue-400 cursor-help px-0.5 rounded"
                    >which impacts the character significantly</span> as they journey westward..."
                  </div>

                  <div className="h-16 relative">
                    <AnimatePresence>
                      {hoveredReviewId && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className={`absolute inset-x-0 p-3 rounded-xl border text-[9px] font-semibold leading-relaxed shadow-sm ${
                            hoveredReviewId === 1 
                              ? 'bg-yellow-50/90 border-yellow-200 text-yellow-800' 
                              : 'bg-blue-50/90 border-blue-200 text-blue-800'
                          }`}
                        >
                          {essayReviews.find(r => r.id === hoveredReviewId)?.feedback}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!hoveredReviewId && (
                      <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest block text-center mt-3 animate-pulse">
                        Hover over highlighted text above to inspect AI feedback
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ASSISTANT 4: Math Solver */}
            <div id="math-solver" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Visual Representation Area (Left for alternate balance) */}
              <div className="lg:col-span-6 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-lg relative min-h-[340px] flex flex-col justify-between overflow-hidden order-last lg:order-first">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Step solver notepad</span>
                  <span className="text-[10px] font-bold bg-pink-50 border border-pink-100 text-pink-600 px-2 py-0.5 rounded">Math Proofs</span>
                </div>

                {/* Math solver proof checklist */}
                <div className="flex-1 flex flex-col gap-3.5 relative z-10 justify-center font-mono text-[9px] text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                    <span className="font-bold text-slate-900">Equation: x² - 5x + 6 = 0</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Solved
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 pl-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-slate-400">Step 1:</span>
                      <div>
                        <span>Split middle term: x² - 2x - 3x + 6 = 0</span>
                        <span className="text-[7.5px] font-sans font-bold text-emerald-600 block mt-0.5">✓ Step validated: arithmetic checks out</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-slate-400">Step 2:</span>
                      <div>
                        <span>Factor terms: x(x - 2) - 3(x - 2) = 0</span>
                        <span className="text-[7.5px] font-sans font-bold text-emerald-600 block mt-0.5">✓ Step validated: factored terms match</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-slate-400">Step 3:</span>
                      <div>
                        <span>Group components: (x - 2)(x - 3) = 0</span>
                        <span className="text-[7.5px] font-sans font-bold text-[#10375C] block mt-0.5">💡 Rule: product equals zero if either factor is zero</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="lg:col-span-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-pink-50 border border-pink-100 text-pink-500 shadow-sm">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Active Math Solver</h2>
                    <p className="text-pink-500 text-xs font-semibold mt-0.5">Detailed algebraic guidance diagrams</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  The Math Solver guides students step-by-step through algebraic equations, geometry theorems, and calculus problems. It flags where arithmetic steps go wrong and explains the logic of mathematical transformations.
                </p>

                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    'Equation structure parser grids',
                    'Algebraic transformation proofs checks',
                    'Interactive geometry helper modules'
                  ].map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-slate-600 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-4 text-xs font-medium">
                  <span className="text-[#10375C] font-black uppercase text-[10px] tracking-wider block mb-1">Primary Use Case</span>
                  Self-paced practice. When completing math homework reviews, students check their steps to catch transcription errors.
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
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Experience Interactive AI Tutoring</h2>
              <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
                Empower your students with curriculum-guided tutoring that acts as a teacher-aligned copilot.
              </p>
              <button
                onClick={() => router.push('/sign-up')}
                className="mt-4 px-6 py-3 rounded-full text-xs font-bold bg-white text-[#10375C] hover:bg-slate-50 shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Try AI Assistant Free</span>
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
