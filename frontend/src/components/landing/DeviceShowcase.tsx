// src/components/landing/DeviceShowcase.tsx
'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, ChevronRight, BarChart3, Send,
  Cpu, Award, ClipboardCheck, GraduationCap, Calendar
} from 'lucide-react';
import { PhoneFrame, LaptopFrame } from '@/components/shared/DeviceFrames';

export default function DeviceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax motion tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation
  const rotateXSpring = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 100, damping: 20 });
  const rotateYSpring = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
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
      className="relative w-full h-[580px] md:h-[650px] flex items-center justify-center perspective-[1000px] cursor-pointer"
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full max-w-[850px] h-[480px] md:h-[520px] transition-all duration-300 ease-out"
      >
        {/* ================= LAPTOP MOCKUP (MacBook) ================= */}
        <div className="absolute bottom-[10%] left-[4%] lg:left-[6%] z-10 origin-bottom-left scale-[0.7] sm:scale-[0.95] md:scale-[1.1] lg:scale-[1.2]">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
          <LaptopFrame>
            <div className="flex w-full h-full bg-[#F8FAFC] text-slate-800 font-sans">
              
              {/* Mock Dashboard Sidebar */}
              <div className="w-[20%] bg-white border-r border-slate-200 p-3 hidden sm:flex flex-col gap-4">
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900">VedAI Admin</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="h-6 rounded bg-orange-50 text-orange-600 text-[10px] font-semibold flex items-center gap-2 px-2 border border-orange-100">
                    <BarChart3 className="w-3 h-3" /> Dashboard
                  </div>
                  <div className="h-6 rounded text-slate-500 hover:text-slate-900 text-[10px] font-semibold flex items-center gap-2 px-2 transition-colors">
                    <ClipboardCheck className="w-3 h-3" /> Worksheets
                  </div>
                  <div className="h-6 rounded text-slate-500 hover:text-slate-900 text-[10px] font-semibold flex items-center gap-2 px-2 transition-colors">
                    <GraduationCap className="w-3 h-3" /> Students
                  </div>
                  <div className="h-6 rounded text-slate-500 hover:text-slate-900 text-[10px] font-semibold flex items-center gap-2 px-2 transition-colors">
                    <Calendar className="w-3 h-3" /> Schedule
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Main Body */}
              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                {/* Header stats */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-[12px] font-bold text-slate-900 flex items-center gap-1">
                      CBSE Grade 8 Science <ChevronRight className="w-3 h-3 text-slate-400" /> Chemistry
                    </h4>
                    <p className="text-[9px] text-slate-500 font-sans mt-0.5">Section A • 32 Registered Students</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                      Live Session
                    </span>
                  </div>
                </div>

                {/* Grid content */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Left block - class progress chart */}
                  <div className="col-span-2 rounded-xl bg-white border border-slate-200 p-3 flex flex-col justify-between shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-700">Class Grade Trend</span>
                      <span className="text-[9px] text-slate-500">Average: 84%</span>
                    </div>
                    
                    {/* SVG Line Chart */}
                    <div className="w-full h-24 mt-2 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 40">
                        <defs>
                          <linearGradient id="chartGlowLight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path 
                          d="M 0,38 L 0,25 Q 15,10 30,22 T 60,12 T 90,8 L 100,5 L 100,38 Z" 
                          fill="url(#chartGlowLight)"
                        />
                        {/* Line */}
                        <motion.path 
                          d="M 0,25 Q 15,10 30,22 T 60,12 T 90,8 L 100,5" 
                          fill="none" 
                          stroke="#f97316" 
                          strokeWidth="1.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                        />
                        {/* Circles */}
                        <circle cx="30" cy="22" r="1.5" fill="#f97316" />
                        <circle cx="60" cy="12" r="1.5" fill="#a855f7" />
                        <circle cx="90" cy="8" r="1.5" fill="#3b82f6" />
                      </svg>
                    </div>
                  </div>

                  {/* Right block - active tasks */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 flex flex-col gap-2.5 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-700">AI Generator</span>
                    <div className="flex-1 flex flex-col gap-1.5 justify-center">
                      <div className="rounded bg-slate-50 border border-slate-100 p-1.5">
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-700">
                          <span>Worksheet #14</span>
                          <span className="text-orange-600">92% Match</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full w-[92%]" />
                        </div>
                      </div>
                      <div className="rounded bg-slate-50/50 border border-slate-100 p-1.5">
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                          <span>CBSE Science Prep</span>
                          <span className="text-slate-400">Scheduled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lower row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* AI Insights (col span 2) */}
                  <div className="col-span-2 rounded-xl bg-white border border-slate-200 p-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Cpu className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">AI Co-Pilot Insights</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[9px] text-slate-600 leading-relaxed font-sans">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Metals Section:</strong> 85% of class mastered Redox reactions perfectly.</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[7px] flex-shrink-0 mt-0.5">!</span>
                        <span><strong>Critical Gap:</strong> 42% of students failed to balance combustion equations.</span>
                      </div>
                    </div>
                  </div>

                  {/* Grade mapping breakdown */}
                  <div className="rounded-xl bg-white border border-slate-200 p-3 flex flex-col gap-1.5 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-700">Grade Spread</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[8px]">
                        <span className="text-slate-500">A Grades (90%+)</span>
                        <span className="text-slate-800 font-bold">14 Students</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px]">
                        <span className="text-slate-500">B Grades (80%+)</span>
                        <span className="text-slate-800 font-bold">12 Students</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px]">
                        <span className="text-slate-500">C Grades (70%+)</span>
                        <span className="text-slate-800 font-bold">6 Students</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </LaptopFrame>
        </motion.div>
      </div>

      {/* ================= PHONE MOCKUP (iPhone) ================= */}
      <div className="absolute bottom-[13%] left-[55%] xs:left-[60%] sm:left-[63%] md:left-[66%] lg:left-[69%] z-20 origin-bottom-left scale-[0.45] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.75]">
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          style={{ transformStyle: 'preserve-3d', translateZ: '50px' }}
        >
          <PhoneFrame disableScale={true}>
            <div className="flex flex-col w-full h-full bg-[#F8FAFC]">
              {/* Phone Header */}
              <div className="w-full pt-6 pb-3 bg-white border-b border-slate-100 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                    <Cpu className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-800">VedAI Bot</span>
                    <span className="text-[7px] text-emerald-600 flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Active Tutor
                    </span>
                  </div>
                </div>
                <Award className="w-3.5 h-3.5 text-amber-500" />
              </div>

              {/* Phone Chat body */}
              <div className="flex-1 bg-[#F8FAFC] p-3 flex flex-col gap-3 font-sans overflow-hidden">
                {/* Student question */}
                <div className="self-end bg-orange-500 text-white rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[85%] text-[8px] leading-relaxed shadow-sm">
                  Can you explain what Redox reaction means in simple words? 🧪
                </div>

                {/* AI answer */}
                <div className="self-start bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none p-3 max-w-[90%] text-[8px] leading-relaxed shadow-sm flex flex-col gap-1.5">
                  <div className="font-bold text-orange-600 flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5" />
                    <span>AI Tutor Explainer</span>
                  </div>
                  <p className="text-slate-800">Think of it as a <strong>handshake:</strong></p>
                  <ul className="list-disc pl-3 flex flex-col gap-1 mt-0.5 text-slate-600">
                    <li><strong>Reduction:</strong> gaining electrons (Red).</li>
                    <li><strong>Oxidation:</strong> losing electrons (Ox).</li>
                  </ul>
                  <p className="text-[7px] text-slate-400 mt-1 border-t border-slate-100 pt-1 font-mono">
                    Formula: Zn + Cu²⁺ → Zn²⁺ + Cu
                  </p>
                </div>

                {/* Student feedback query */}
                <div className="self-end bg-orange-500 text-white rounded-2xl rounded-tr-none px-3 py-1.5 max-w-[85%] text-[8px] leading-relaxed shadow-sm">
                  Ah! So one gives and the other takes?
                </div>
              </div>

              {/* Phone Input Bar */}
              <div className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-[8px] text-slate-400 font-sans">
                  Ask your AI tutor anything...
                </div>
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/25">
                  <Send className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </PhoneFrame>
        </motion.div>
      </div>
    </motion.div>
  </div>
  );
}
