// src/components/layout/AuthLayout.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, BarChart3, Star } from 'lucide-react';
import BackgroundMesh from '@/components/landing/BackgroundMesh';
import ShapeGrid from '@/components/ShapeGrid';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  // Anim-variants for list elements
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F3F4F6] text-slate-800 font-sans overflow-hidden relative">
      
      {/* LEFT SIDE PANEL - Desktop Only (45% Width) */}
      <div className="hidden lg:flex relative lg:w-[45%] xl:w-[50%] h-screen flex-col justify-between p-12 overflow-hidden z-10 select-none">
        
        {/* Animated Background Mesh + ShapeGrid */}
        <div className="absolute inset-0 z-0">
          <BackgroundMesh />
          <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay">
            <ShapeGrid 
              borderColor="rgba(249, 115, 22, 0.2)" 
              hoverFillColor="rgba(249, 115, 22, 0.15)" 
              gradientColor="#F3F4F6"
              shape="hexagon"
              squareSize={56}
              speed={0.3}
              hoverTrailAmount={4}
            />
          </div>
          {/* Smooth linear fade to block-out hard edges at the right border */}
          <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-[#F3F4F6] to-transparent pointer-events-none" />
        </div>

        {/* Brand Header & Return navigation */}
        <div className="relative z-10 flex flex-col gap-6">
          <Link 
            href="/" 
            className="group self-start flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/75 backdrop-blur-md text-xs font-semibold text-slate-600 hover:text-orange-600 hover:border-orange-500/20 hover:bg-orange-50/50 shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to website</span>
          </Link>

          {/* VedAI Logo Branding */}
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                Ved<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Assessments Redefined</p>
            </div>
          </div>
        </div>

        {/* Core Value Props */}
        <div className="relative z-10 max-w-lg my-auto pt-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
              {title}
            </h1>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Curriculum-Aligned Assessments</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Generate curriculum-mapped worksheets, tests, and homework sheets for any grade levels in seconds.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Intelligent Auto-Grading</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Save hours on manual checks. Get automated grading with detailed, actionable feedback tailored for students.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="flex gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Performance Analytics</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pinpoint learning gaps, track student progression, and adjust your lesson plans using dashboard statistics.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Social Proof / Testimonial */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 max-w-lg mt-auto border-t border-slate-200/60 pt-6"
        >
          <div className="backdrop-blur-xl bg-white/50 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex text-yellow-500 gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs italic text-slate-600 leading-relaxed font-medium">
              &quot;VedAI has revolutionized our worksheet preparation. What used to take hours now takes minutes. The students love the responsive hints!&quot;
            </p>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" 
                alt="Teacher avatar" 
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sarah Jenkins</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Science Educator @ Pinecrest Academy</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* RIGHT SIDE PANEL - Forms (55% Width / 100% Mobile) */}
      <div className="w-full lg:w-[55%] xl:w-[50%] min-h-screen flex flex-col justify-center items-center p-6 relative bg-[#FAFAFA] z-10">
        
        {/* Subtle decorative background detail for the form screen */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,0.03),transparent_40%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(168,85,247,0.03),transparent_40%)] pointer-events-none" />
        
        {/* Mobile Header Branding (hidden on large screens) */}
        <div className="lg:hidden absolute top-8 left-8 right-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/10">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900">VedAI</span>
          </div>
          <Link 
            href="/" 
            className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md flex justify-center py-10"
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
}
