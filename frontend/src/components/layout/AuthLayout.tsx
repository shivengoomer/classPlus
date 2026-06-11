// src/components/layout/AuthLayout.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft, Sparkles, Star, AlertCircle, Sparkle,
  Brain, TrendingUp, HelpCircle, CheckCircle
} from 'lucide-react';
import ShapeGrid from '@/components/ShapeGrid';
import { Logo } from '@/components/shared/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  portalType?: 'teacher' | 'student';
}

type TabType = 'ai-gen' | 'grading' | 'analytics';

// AI Generator Simulator sub-component
function AIGenSimulator() {
  const [step, setStep] = useState<'typing' | 'generating' | 'done'>('typing');
  const [text, setText] = useState('');
  const prompt = "Generate a CBSE Class 10 Math quiz on Quadratic Equations with interactive hints...";

  useEffect(() => {
    let active = true;
    setStep('typing');
    setText('');
    
    let index = 0;
    const typeInterval = setInterval(() => {
      if (!active) return;
      if (index < prompt.length) {
        setText(prev => prev + prompt.charAt(index));
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          if (active) {
            setStep('generating');
            setTimeout(() => {
              if (active) setStep('done');
            }, 1800);
          }
        }, 600);
      }
    }, 30);

    return () => {
      active = false;
      clearInterval(typeInterval);
    };
  }, []);

  return (
    <div className="w-full flex flex-col h-full bg-[#0d1222]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs text-slate-300">
      {/* simulated browser chrome header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121930] border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="px-3 py-0.5 rounded-md bg-[#090d1a] text-[10px] text-slate-500 border border-slate-800/40 select-none">
          classPlus.ai/generator
        </div>
        <div className="w-8" />
      </div>

      {/* Simulator workspace */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-orange-400 uppercase tracking-wider font-semibold mb-1">AI Prompt Assistant</div>
            <div className="bg-[#121930]/60 border border-slate-800/60 rounded-xl p-3 text-[11px] leading-relaxed relative text-slate-200">
              {text}
              {step === 'typing' && <span className="inline-block w-1.5 h-3.5 bg-orange-400 ml-0.5 animate-pulse" />}
            </div>
          </div>
        </div>

        {step === 'generating' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-3 py-2 bg-slate-900/40 border border-slate-800/40 rounded-xl text-slate-400 self-start"
          >
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-[10px] animate-pulse">classPlus AI generating CBSE-aligned worksheet...</span>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-3"
          >
            {/* Success indicator */}
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-2.5 py-1.5 self-start">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Worksheet Generated Successfully! (2 Questions)</span>
            </div>

            {/* Simulated Question Cards */}
            <div className="flex flex-col gap-2.5">
              <div className="bg-[#121930]/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">QUESTION 1 • MCQ</span>
                  <span className="text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20 font-sans">CBSE Standard</span>
                </div>
                <p className="text-[11px] font-sans font-semibold text-slate-100">Find the roots of the quadratic equation x² - 5x + 6 = 0.</p>
                <div className="grid grid-cols-2 gap-2 mt-1.5 font-sans">
                  <div className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#090d1a]/50 text-[10px] text-slate-400 hover:border-slate-700 transition-colors flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-slate-800 bg-[#121930] flex items-center justify-center text-[8px]">A</div>
                    <span>x = 1, x = 6</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/5 text-[10px] text-orange-200 transition-colors flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-orange-500 bg-orange-500 text-white flex items-center justify-center text-[8px]">✓</div>
                    <span>x = 2, x = 3</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#121930]/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">QUESTION 2 • SHORT ANSWER</span>
                  <span className="text-[#10375C] bg-[#10375C]/10 px-1.5 py-0.2 rounded border border-[#10375C]/20 font-sans">Hint Enabled</span>
                </div>
                <p className="text-[11px] font-sans font-semibold text-slate-100">Derive the quadratic formula using completing the square method.</p>
                <div className="mt-1 flex items-start gap-2 bg-[#090d1a]/40 border border-slate-800/40 rounded-lg p-2">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[9.5px] font-sans leading-normal text-slate-400 italic">
                    AI Student Hint: Start by dividing the entire equation by a, then transpose the constant term...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Auto Grading Simulator sub-component
function GradingSimulator() {
  const [step, setStep] = useState<'scan' | 'mark' | 'feedback'>('scan');

  useEffect(() => {
    let active = true;
    setStep('scan');

    const t1 = setTimeout(() => { if (active) setStep('mark'); }, 1500);
    const t2 = setTimeout(() => { if (active) setStep('feedback'); }, 3000);

    return () => {
      active = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="w-full flex flex-col h-full bg-[#0d1222]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs text-slate-300 relative">
      {/* simulated browser header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121930] border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="px-3 py-0.5 rounded-md bg-[#090d1a] text-[10px] text-slate-500 border border-slate-800/40 select-none">
          classPlus.ai/auto-grader
        </div>
        <div className="w-8" />
      </div>

      {/* Grading workspace */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto relative font-sans">
        {/* Student metadata */}
        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
          <div>
            <h4 className="text-[11px] font-bold text-slate-250">Student: Aarav Sharma</h4>
            <span className="text-[9px] text-slate-500">Grade 10-A • Biology Assessment</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-450 uppercase tracking-wider block">AI Graded</span>
            <span className="text-[11px] font-bold text-emerald-400">Status: Complete</span>
          </div>
        </div>

        {/* Answer section */}
        <div className="flex flex-col gap-1.5 relative bg-[#121930]/40 border border-slate-800/60 rounded-xl p-3.5">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-mono font-semibold">Student Submission</div>
          <p className="text-[11px] text-slate-200 leading-relaxed italic pr-10">
            &quot;Plants take in <span className={step !== 'scan' ? 'bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30' : ''}>water</span> from roots, <span className={step !== 'scan' ? 'bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30' : ''}>carbon dioxide</span> from the atmosphere, and absorb <span className={step !== 'scan' ? 'bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30' : ''}>sunlight</span> using chlorophyll. They use this energy to synthesize <span className={step !== 'scan' ? 'bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30' : ''}>glucose</span> and release <span className={step !== 'scan' ? 'bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/30' : ''}>oxygen</span>.&quot;
          </p>

          {/* Holographic scanning overlay */}
          {step === 'scan' && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_12px_#f97316] pointer-events-none"
            />
          )}

          {/* Score Badge */}
          {step !== 'scan' && (
            <motion.div 
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: -5 }}
              className="absolute right-3 top-3 w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-500/10 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10"
            >
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-tighter leading-none">Score</span>
              <span className="text-xs text-white font-black leading-none mt-0.5">5/5</span>
            </motion.div>
          )}
        </div>

        {/* AI Auto-feedback block */}
        <AnimatePresence>
          {step === 'feedback' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 flex gap-2.5 items-start text-left"
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 mt-0.5">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <h5 className="text-[10.5px] font-bold text-emerald-400">classPlus AI Grading Feedback</h5>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                  Excellent! The response correctly lists all necessary reactants (water, carbon dioxide, sunlight) and the primary product (glucose) as well as the byproduct (oxygen). High conceptual clarity.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Performance Analytics Simulator sub-component
function AnalyticsSimulator() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    return () => setAnimate(false);
  }, []);

  return (
    <div className="w-full flex flex-col h-full bg-[#0d1222]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs text-slate-300">
      {/* browser chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#121930] border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="px-3 py-0.5 rounded-md bg-[#090d1a] text-[10px] text-slate-500 border border-slate-800/40 select-none">
          classPlus.ai/analytics
        </div>
        <div className="w-8" />
      </div>

      {/* Analytics Dashboard */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto font-sans">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-slate-200">Analytics Overview: Grade 10 Math</h4>
          <span className="text-[9px] text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Active Term</span>
        </div>

        {/* Small stats cards grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#121930]/40 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-0.5">
            <span className="text-[9px] text-slate-500 uppercase font-semibold">Class Avg Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-100">84.5%</span>
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />
                +3.2%
              </span>
            </div>
          </div>
          <div className="bg-[#121930]/40 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-0.5">
            <span className="text-[9px] text-slate-500 uppercase font-semibold">Active Engagement</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-slate-100">92.8%</span>
              <span className="text-[9px] font-bold text-slate-500">Target 90%</span>
            </div>
          </div>
        </div>

        {/* Dynamic bar chart */}
        <div className="bg-[#121930]/40 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-3">
          <div className="text-[9.5px] uppercase font-semibold text-slate-500">Weekly Score Progression</div>
          <div className="h-24 flex items-end justify-between px-2 pt-2.5 border-b border-slate-800/80">
            {[45, 62, 58, 80, 84].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 w-[14%]">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: animate ? `${h}%` : 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`w-full rounded-t-md ${i === 4 ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.25)]' : 'bg-[#10375C]'}`}
                />
                <span className="text-[8px] text-slate-500 font-mono mt-1">W{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning gap alert */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-[10px] font-bold text-amber-500">Identified Learning Gap</h5>
            <p className="text-[9.5px] text-slate-400 leading-normal mt-0.5">
              42% of students struggled with Discriminant Calculation in quadratic equations. Recommended: Assign a 10-minute targeted review module.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children, title, subtitle, portalType }: AuthLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ai-gen');
  const [autoplay, setAutoplay] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-playing transitions
  useEffect(() => {
    if (!autoplay) return;

    autoplayTimerRef.current = setInterval(() => {
      setActiveTab(prev => {
        if (prev === 'ai-gen') return 'grading';
        if (prev === 'grading') return 'analytics';
        return 'ai-gen';
      });
    }, 5500);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [autoplay]);

  const handleTabClick = (tab: TabType) => {
    setAutoplay(false); // Stop autoplay once user clicks
    setActiveTab(tab);
  };

  // Dynamic testimonial matching active tab
  const testimonials = {
    'ai-gen': {
      quote: "The worksheet generator is sheer wizardry! What used to take me hours of searching textbooks now happens in 10 seconds. The interactive hints are a massive hit with my students.",
      author: "Sarah Jenkins",
      role: "Science Department Lead @ Oakridge Global",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
    },
    'grading': {
      quote: "classPlus grading is a total lifesaver. It doesn't just grade standard true/false; it reads handwritten student answers, highlights key concepts they missed, and generates personalized reports.",
      author: "David Miller",
      role: "Mathematics Educator @ Pinecrest Academy",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    'analytics': {
      quote: "The performance charts showed me that 40% of my class had a learning gap in quadratic equations. I adjusted my lesson plan the next morning, and test scores improved significantly.",
      author: "Priya Sharma",
      role: "CBSE Biology Teacher @ Delhi Public School",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    }
  };

  const currentTestimonial = testimonials[activeTab];

  return (
    <div className="min-h-screen w-full flex bg-[#F7F9FC] text-slate-800 font-sans overflow-hidden relative">
      
      {/* LEFT SIDE PANEL - Desktop Only (Interactive Workspace Showcase) */}
      <div className="hidden lg:flex relative lg:w-[48%] xl:w-[50%] h-screen flex-col justify-between p-12 overflow-hidden bg-[#070b19] text-slate-100 z-10 select-none border-r border-slate-900">
        
        {/* Neon Ambient Background Blur Orbs inside Left Column */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/[0.08] blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#10375C]/[0.15] blur-[120px] pointer-events-none" />
          <div className="absolute top-[30%] right-[-20%] w-[400px] h-[400px] rounded-full bg-indigo-500/[0.05] blur-[90px] pointer-events-none" />
          
          <div className="absolute inset-0 opacity-[0.25] pointer-events-none mix-blend-overlay">
            <ShapeGrid 
              borderColor="rgba(249, 115, 22, 0.15)" 
              hoverFillColor="rgba(249, 115, 22, 0.1)" 
              gradientColor="#070b19"
              shape="hexagon"
              squareSize={60}
              speed={0.25}
              hoverTrailAmount={4}
            />
          </div>
        </div>

        {/* Left Side Header */}
        <div className="relative z-10 flex flex-col gap-6">
          <Link 
            href="/" 
            className="group self-start flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 bg-[#0e1428]/80 text-xs font-semibold text-slate-400 hover:text-orange-400 hover:border-orange-500/30 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to website</span>
          </Link>

          {/* Logo Branding */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0e1428] border border-slate-800 flex items-center justify-center shadow-lg">
              <Logo className="w-6.5 h-6.5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
                classPlus
                <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-[9px] text-orange-400 border border-orange-500/20 uppercase font-semibold">AI v2.0</span>
              </span>
              <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Assessments Redefined</p>
            </div>
          </div>
        </div>

        {/* Core Showcase Area */}
        <div className="relative z-10 w-full max-w-lg my-auto pt-4 flex flex-col gap-6">
          
          {/* Title and description */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-orange-400 font-bold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Live Workspace Demonstration
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Assessments, Grading & Insights
            </h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Explore how classPlus supercharges educator workflows. Watch the live mock dashboard update in real time or select a tab to explore options.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex gap-1 p-1 bg-[#0c1125] border border-slate-850 rounded-2xl">
            {(['ai-gen', 'grading', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-2 rounded-xl text-[10.5px] font-bold transition-all relative flex items-center justify-center gap-1.5 ${
                  activeTab === tab 
                    ? 'text-white' 
                    : 'text-slate-550 hover:text-slate-300'
                }`}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#121932] border border-slate-800 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === 'ai-gen' && 'AI Generator'}
                  {tab === 'grading' && 'Auto Grading'}
                  {tab === 'analytics' && 'Performance insights'}
                </span>
              </button>
            ))}
          </div>

          {/* Simulated Screen Body Container */}
          <div className="w-full aspect-[4/3] relative z-10 flex-shrink-0" style={{ minHeight: '260px' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'ai-gen' && (
                <motion.div 
                  key="ai-gen"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <AIGenSimulator />
                </motion.div>
              )}
              {activeTab === 'grading' && (
                <motion.div 
                  key="grading"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <GradingSimulator />
                </motion.div>
              )}
              {activeTab === 'analytics' && (
                <motion.div 
                  key="analytics"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <AnalyticsSimulator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Testimonial Box */}
        <div className="relative z-10 w-full max-w-lg mt-auto pt-6 border-t border-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="backdrop-blur-xl bg-[#0e1428]/45 border border-slate-850 shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-2xl p-4.5 flex flex-col gap-2.5"
            >
              <div className="flex text-amber-500 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-[11px] italic text-slate-300 leading-relaxed font-medium">
                &quot;{currentTestimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={currentTestimonial.avatar} 
                  alt="Educator avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-slate-800 shadow-sm"
                />
                <div>
                  <h4 className="text-[10.5px] font-bold text-white leading-none">{currentTestimonial.author}</h4>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1 leading-none">{currentTestimonial.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* RIGHT SIDE PANEL - Auth Forms (Light Clean Aesthetics) */}
      <div className="w-full lg:w-[52%] xl:w-[50%] min-h-screen flex flex-col justify-center items-center p-6 relative bg-white z-10 overflow-y-auto">
        
        {/* Subtle decorative background detail for the form screen */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,0.03),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(16,55,92,0.02),transparent_40%)] pointer-events-none" />
        
        {/* Mobile Header Branding (hidden on desktop screens) */}
        <div className="lg:hidden absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center shadow-sm flex-shrink-0">
              <Logo className="w-5.5 h-5.5 text-[#10375C]" />
            </div>
            <span className="text-lg font-black text-slate-900">classPlus</span>
          </div>
          <Link 
            href="/" 
            className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Form Container Wrapper with colorful glowing backing */}
        <div className="relative w-full max-w-lg flex flex-col items-center justify-center py-10 z-10">
          
          {/* Subtle colored glow backing */}
          <div className="absolute w-[80%] h-[80%] -z-10 rounded-full bg-gradient-to-tr from-orange-500/5 to-[#10375C]/5 blur-[70px] pointer-events-none opacity-80" />

          {/* Form Header Info (Educator / School Portal Info) */}
          <div className="w-full text-center mb-2 select-none">
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/60 bg-slate-50 text-[10px] font-bold text-slate-500 mb-3.5">
              <Sparkle className="w-3 h-3 text-[#10375C] fill-[#10375C]/20" />
              <span>
                {portalType === 'teacher' ? '🎓 Teacher & School Portal' : portalType === 'student' ? '📚 Student Portal' : 'Official Educator & school Portal'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Child Clerk Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="w-full flex justify-center mt-3"
          >
            {children}
          </motion.div>
        </div>
      </div>

    </div>
  );
}
