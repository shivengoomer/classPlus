// src/components/landing/DeviceShowcase.tsx
'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, ChevronRight, BarChart3, Send,
  Cpu, Award, ClipboardCheck, GraduationCap, Calendar, TrendingUp
} from 'lucide-react';
import { PhoneFrame, LaptopFrame } from '@/components/shared/DeviceFrames';
import { Logo } from '@/components/shared/Logo';

export default function DeviceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXSpring = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), { stiffness: 80, damping: 22 });
  const rotateYSpring = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), { stiffness: 80, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        className="flex flex-row items-center justify-center w-full h-full gap-1 px-2"
      >
        {/* ===== LAPTOP ===== */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', flexShrink: 0 }}
          className="scale-[0.5] xl:scale-[0.62] origin-center"
        >
          <LaptopFrame>
            <div className="flex w-full h-full bg-[#F8FAFC] text-slate-800 font-sans">
              
              {/* Sidebar */}
              <div className="w-[22%] bg-white border-r border-slate-200 p-3 flex flex-col gap-3">
                <div className="flex items-center gap-1.5 px-1 py-1 mb-1">
                  <div className="w-5 h-5 rounded-md bg-slate-100/80 border border-slate-200/50 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Logo className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 leading-tight">ClassPilot</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-6 rounded-lg bg-[#10375C]/10 text-[#10375C] text-[9px] font-bold flex items-center gap-1.5 px-2 border border-[#10375C]/15">
                    <BarChart3 className="w-2.5 h-2.5 flex-shrink-0" /> Dashboard
                  </div>
                  <div className="h-6 rounded-lg text-slate-400 text-[9px] font-semibold flex items-center gap-1.5 px-2">
                    <ClipboardCheck className="w-2.5 h-2.5 flex-shrink-0" /> Assessments
                  </div>
                  <div className="h-6 rounded-lg text-slate-400 text-[9px] font-semibold flex items-center gap-1.5 px-2">
                    <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" /> Students
                  </div>
                  <div className="h-6 rounded-lg text-slate-400 text-[9px] font-semibold flex items-center gap-1.5 px-2">
                    <Calendar className="w-2.5 h-2.5 flex-shrink-0" /> Schedule
                  </div>
                </div>
                {/* Mini AI Credits */}
                <div className="mt-auto bg-[#10375C]/5 border border-[#10375C]/10 rounded-lg p-2">
                  <p className="text-[7px] font-bold text-[#10375C] uppercase tracking-wider">AI Credits</p>
                  <div className="w-full bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                    <div className="bg-[#10375C] h-full w-[62%] rounded-full" />
                  </div>
                  <p className="text-[7px] text-slate-400 mt-1 font-semibold">6/10 used</p>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                      Grade 8 Science <ChevronRight className="w-2.5 h-2.5 text-slate-300" /> Chemistry
                    </h4>
                    <p className="text-[8px] text-slate-400 mt-0.5">32 Students • Section A</p>
                  </div>
                  <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
                    <p className="text-[7px] text-slate-400 font-semibold uppercase tracking-wider">Avg Score</p>
                    <p className="text-[15px] font-black text-slate-900 mt-0.5">84%</p>
                    <p className="text-[7px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                      <TrendingUp className="w-2 h-2" /> +3.2%
                    </p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
                    <p className="text-[7px] text-slate-400 font-semibold uppercase tracking-wider">Submitted</p>
                    <p className="text-[15px] font-black text-slate-900 mt-0.5">28</p>
                    <p className="text-[7px] text-slate-400 font-semibold mt-0.5">of 32</p>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
                    <p className="text-[7px] text-slate-400 font-semibold uppercase tracking-wider">AI Grade</p>
                    <p className="text-[15px] font-black text-[#10375C] mt-0.5">A-</p>
                    <p className="text-[7px] text-slate-400 font-semibold mt-0.5">Class avg</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-slate-700">Grade Trend</span>
                    <span className="text-[7px] text-slate-400">Last 4 weeks</span>
                  </div>
                  <div className="w-full h-14 relative">
                    <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10375C" stopOpacity="0.15"/>
                          <stop offset="100%" stopColor="#10375C" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="10" x2="200" y2="10" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,4" />
                      <line x1="0" y1="22" x2="200" y2="22" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,4" />
                      <line x1="0" y1="34" x2="200" y2="34" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="4,4" />
                      <path d="M 0,32 L 0,26 C 40,18 60,28 80,16 C 100,6 120,12 150,8 L 200,4 L 200,40 Z" fill="url(#areaGrad)" />
                      <motion.path
                        d="M 0,26 C 40,18 60,28 80,16 C 100,6 120,12 150,8 L 200,4"
                        fill="none" stroke="#10375C" strokeWidth="1.5" strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.5, ease: 'easeOut' }}
                      />
                      <circle cx="80" cy="16" r="2.5" fill="#10375C" />
                      <circle cx="150" cy="8" r="2.5" fill="#10375C" />
                      <circle cx="200" cy="4" r="2.5" fill="#10375C" />
                    </svg>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="bg-[#10375C]/5 border border-[#10375C]/15 rounded-xl p-2.5 flex items-start gap-2">
                  <Cpu className="w-3 h-3 text-[#10375C] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[7.5px] font-black text-[#10375C] uppercase tracking-wider block mb-0.5">AI Insight</span>
                    <div className="flex items-start gap-1.5 text-[7.5px] text-slate-600">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span><strong>85%</strong> mastered Redox. Combustion gaps flagged.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </LaptopFrame>
        </motion.div>

        {/* ===== PHONE — sits right of laptop, slightly elevated ===== */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          style={{ transformStyle: 'preserve-3d', translateZ: '40px', flexShrink: 0, marginTop: '-40px' }}
          className="scale-[0.72] xl:scale-[0.80] origin-center"
        >
          <PhoneFrame disableScale={true}>
            <div className="flex flex-col w-full h-full bg-[#F8FAFC]">
              {/* Phone Header */}
              <div className="w-full pt-6 pb-2.5 bg-white border-b border-slate-100 px-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#10375C] flex items-center justify-center shadow-sm flex-shrink-0">
                    <Cpu className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-black text-slate-900">ClassPilot AI</span>
                    <span className="text-[7px] text-emerald-600 flex items-center gap-0.5 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Online
                    </span>
                  </div>
                </div>
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </div>

              {/* Chat body */}
              <div className="flex-1 bg-[#F8FAFC] p-3 flex flex-col gap-2.5 font-sans overflow-hidden">
                <div className="self-end bg-[#10375C] text-white rounded-2xl rounded-tr-none px-3 py-2 max-w-[85%] text-[8px] leading-relaxed shadow-sm">
                  Explain Redox reactions simply? 🧪
                </div>
                <div className="self-start bg-white border border-slate-200 rounded-2xl rounded-tl-none p-2.5 max-w-[90%] shadow-sm flex flex-col gap-1.5">
                  <div className="text-[7px] font-black text-[#10375C] uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-2 h-2" /> AI Tutor
                  </div>
                  <p className="text-[8px] text-slate-700 leading-relaxed">Think of it as a <strong>handshake</strong> — one gives, one takes electrons.</p>
                  <ul className="list-disc pl-3 text-[7.5px] text-slate-500 flex flex-col gap-0.5">
                    <li><strong>Oxidation</strong> → loses e⁻</li>
                    <li><strong>Reduction</strong> → gains e⁻</li>
                  </ul>
                  <p className="text-[7px] text-slate-400 mt-1 border-t border-slate-100 pt-1 font-mono">Zn + Cu²⁺ → Zn²⁺ + Cu</p>
                </div>
                <div className="self-end bg-[#10375C] text-white rounded-2xl rounded-tr-none px-3 py-2 max-w-[75%] text-[8px] leading-relaxed shadow-sm">
                  So one gives, one takes? 😮
                </div>
                <div className="self-start bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                  <p className="text-[8px] text-slate-700">Exactly! ✅ You&apos;ve got it.</p>
                </div>
              </div>

              {/* Input bar */}
              <div className="p-2.5 border-t border-slate-100 bg-white flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[7.5px] text-slate-400">
                  Ask anything...
                </div>
                <div className="w-6 h-6 rounded-full bg-[#10375C] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Send className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </PhoneFrame>
        </motion.div>
      </motion.div>
    </div>
  );
}
