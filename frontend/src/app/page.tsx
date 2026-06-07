// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { 
  Sparkles, Play, ArrowRight, Star, X 
} from 'lucide-react';

import BackgroundMesh from '@/components/landing/BackgroundMesh';
import Navbar from '@/components/landing/Navbar';
import DeviceShowcase from '@/components/landing/DeviceShowcase';
import BentoGrid from '@/components/landing/BentoGrid';
import FeaturesExplorer from '@/components/landing/FeaturesExplorer';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';

import ShapeGrid from '@/components/ShapeGrid';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Stats / Social Proof data
  const teachers = [
    { avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
    { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="min-h-screen bg-[#EEF2F8] text-slate-800 selection:bg-[#10375C]/20 selection:text-[#10375C] font-sans overflow-x-hidden relative flex flex-col justify-between">
      
      {/* ============= LAYERED AESTHETIC BACKGROUND ============= */}
      {/* 1. Base warm-cool gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#EAF0F8] via-[#EEF2F8] to-[#E6ECF5]" />

      {/* 2. Large soft navy orb — top-left */}
      <div className="fixed top-[-25%] left-[-15%] w-[65vw] h-[65vw] rounded-full bg-[#10375C]/[0.065] blur-[130px] pointer-events-none z-0" />

      {/* 3. Soft indigo orb — top-right */}
      <div className="fixed top-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-300/[0.07] blur-[110px] pointer-events-none z-0" />

      {/* 4. Subtle slate orb — bottom center */}
      <div className="fixed bottom-[-15%] left-[15%] w-[70vw] h-[45vw] rounded-full bg-slate-300/[0.05] blur-[150px] pointer-events-none z-0" />

      {/* 5. Vignette — softens harsh edges */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 35%, #EAF0F8 100%)' }}
      />

      {/* 6. BackgroundMesh (existing subtle animated lines) */}
      <BackgroundMesh />

      {/* 2. FLOATING HEADER */}
      <Navbar />

      {/* 3. HERO SECTION */}
      <main className="flex-1 w-full pt-28 pb-12 px-6 relative z-10 overflow-x-hidden">
        {/* ShapeGrid — hexagon pattern with navy hover accent, sits at z-0 inside hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ShapeGrid
            borderColor="rgba(148, 163, 184, 0.45)"
            hoverFillColor="rgba(16, 55, 92, 0.08)"
            gradientColor="#EEF2F8"
            shape="hexagon"
            squareSize={44}
            speed={0.35}
            hoverTrailAmount={5}
          />
          {/* Bottom fade so grid doesn't bleed into bento section */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#EEF2F8] to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[calc(100vh-160px)] relative z-10">

          {/* ── LEFT: Hero Content ── */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8 text-left relative">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="self-start px-4 py-1.5 rounded-full border border-[#10375C]/20 bg-[#10375C]/5 text-[#10375C] text-xs font-semibold tracking-wide flex items-center gap-2 shadow-[0_2px_12px_rgba(16,55,92,0.06)] backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#10375C] animate-pulse" />
              <span>AI-Powered Education Platform</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            >
              Learn Smarter with{' '}
              <span className="text-[#10375C]">
                ClassPilot
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="text-slate-600 text-sm md:text-base leading-relaxed font-sans max-w-lg"
            >
              Transform classrooms with AI-powered assignments, intelligent learning paths, real-time analytics, automated grading, and personalized education experiences.
            </motion.p>

            {/* CTA Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mt-2"
            >
              <SignedOut>
                <button
                  onClick={() => router.push('/sign-up')}
                  className="px-6 py-3.5 rounded-2xl text-xs font-semibold bg-[#10375C] hover:bg-[#0d2f4f] text-white shadow-lg shadow-[#10375C]/20 active:scale-95 flex items-center gap-2 transition-all group"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignedOut>

              <SignedIn>
                <button
                  onClick={() => router.push('/home')}
                  className="px-6 py-3.5 rounded-2xl text-xs font-semibold bg-[#10375C] hover:bg-[#0d2f4f] text-white shadow-lg shadow-[#10375C]/20 active:scale-95 flex items-center gap-2 transition-all group"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignedIn>

              <button
                onClick={() => setShowDemoModal(true)}
                className="px-6 py-3.5 rounded-2xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm active:scale-95 flex items-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-[#10375C] fill-[#10375C]/20" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Trust Badges & Avatars */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              className="flex items-center gap-4 mt-4 border-t border-slate-200/70 pt-6 font-sans"
            >
              <div className="flex -space-x-3.5">
                {teachers.map((t, idx) => (
                  <img
                    key={idx}
                    src={t.avatar}
                    alt="Educator avatar"
                    className="w-9 h-9 rounded-full border-2 border-[#EEF2F8] object-cover shadow-sm"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-4">
                <div className="flex items-center gap-1">
                  <span className="text-slate-900 font-bold text-sm">10k+ Students</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-900 font-bold text-sm">500+ Teachers</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span>Trusted by leading CBSE schools</span>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT: Device Showcase — strictly contained ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="hidden lg:flex lg:col-span-7 relative items-center justify-center overflow-hidden"
            style={{ height: '600px' }}
          >
            <DeviceShowcase />
          </motion.div>

        </div>
      </main>

      {/* 4. BENTO GRID FEATURES */}
      <BentoGrid />

      {/* 4.5. INTERACTIVE FEATURE SUITE EXPLORER */}
      <FeaturesExplorer />

      {/* 5. PRICING SEGMENT */}
      <PricingSection />

      {/* 6. PLATFORM FOOTER */}
      <Footer />

      {/* ================= DEMO VIDEO MODAL ================= */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-3xl rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xl z-50 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Demo video simulation placeholder screen */}
              <div className="w-full aspect-video bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden font-sans">
                {/* Visual ambient rings */}
                <div className="absolute w-[80%] h-[80%] rounded-full border border-[#10375C]/10 animate-pulse pointer-events-none" />
                <div className="absolute w-[60%] h-[60%] rounded-full border border-[#10375C]/10 animate-pulse pointer-events-none" />
                
                <div className="p-4 rounded-full bg-[#10375C] text-white mb-4 relative z-10 shadow-md shadow-[#10375C]/20">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 relative z-10">ClassPilot Platform Walkthrough</h3>
                <p className="text-slate-500 text-xs max-w-sm mt-2 relative z-10">
                  Watch how teachers create curriculum-aligned questions, generate worksheets, and auto-evaluate student works in 2 minutes.
                </p>

                <div className="mt-8 flex gap-3 relative z-10">
                  <button 
                    onClick={() => {
                      setShowDemoModal(false);
                      router.push(isSignedIn ? '/home' : '/sign-up');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Try ClassPilot Now
                  </button>
                  <button 
                    onClick={() => setShowDemoModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-sm transition-all"
                  >
                    Close Walkthrough
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
