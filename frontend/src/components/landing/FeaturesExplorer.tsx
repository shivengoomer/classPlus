// src/components/landing/FeaturesExplorer.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, MessageSquare, ClipboardList, BarChart3, Tag, Mail,
  Brain, FileSpreadsheet, ArrowRight, Star, Laptop, Phone,
  Compass, Award, RefreshCw, Layers, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  color: string;
  href: string;
}

export default function FeaturesExplorer() {
  const router = useRouter();
  const categories = ['Features', 'AI Assistant', 'Assignments', 'Analytics', 'Pricing', 'Contact'];
  const [activeCategory, setActiveCategory] = useState<string>('Features');

  const data: Record<string, FeatureItem[]> = {
    Features: [
      { icon: <BookOpen className="w-5 h-5" />, title: 'Smart Learning', desc: 'Curriculum-aligned paths tailored to students', color: 'text-orange-500 bg-orange-50 border-orange-100', href: '/features#smart-learning' },
      { icon: <Brain className="w-5 h-5" />, title: 'AI Tutor', desc: '24/7 personalized explanations & query support', badge: 'Popular', color: 'text-purple-500 bg-purple-50 border-purple-100', href: '/features#ai-tutor' },
      { icon: <FileSpreadsheet className="w-5 h-5" />, title: 'Assignment Gen', desc: 'Generate custom worksheets, homework & practice in seconds', color: 'text-blue-500 bg-blue-50 border-blue-100', href: '/features#assignment-gen' },
      { icon: <BarChart3 className="w-5 h-5" />, title: 'Performance Analytics', desc: 'Identify learning gaps, trace class cycles & weaknesses', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', href: '/features#analytics' }
    ],
    'AI Assistant': [
      { icon: <MessageSquare className="w-5 h-5" />, title: 'Student Chat', desc: 'Interactive tutoring dialogue on any academic subject', color: 'text-blue-500 bg-blue-50 border-blue-100', href: '/ai-assistant#student-chat' },
      { icon: <Brain className="w-5 h-5" />, title: 'Concept Explainer', desc: 'Breaks down complex topics into simple digestible visual steps', color: 'text-purple-500 bg-purple-50 border-purple-100', href: '/ai-assistant#concept-explainer' },
      { icon: <Award className="w-5 h-5" />, title: 'Writing Coach', desc: 'AI assistant for editing, style, structures & grammar coaching', color: 'text-orange-500 bg-orange-50 border-orange-100', href: '/ai-assistant#writing-coach' },
      { icon: <Compass className="w-5 h-5" />, title: 'Math Solver', desc: 'Detailed, step-by-step guidance for arithmetic and algebraic equations', color: 'text-pink-500 bg-pink-50 border-pink-100', href: '/ai-assistant#math-solver' }
    ],
    Assignments: [
      { icon: <RefreshCw className="w-5 h-5" />, title: 'Automatic Grading', desc: 'Instant grading and qualitative feedback on submissions', badge: 'Hot', color: 'text-rose-500 bg-rose-50 border-rose-100', href: '/assignments-suite#automatic-grading' },
      { icon: <Layers className="w-5 h-5" />, title: 'CBSE & Board Prep', desc: 'Worksheets tailored to CBSE regulations & marking formats', color: 'text-indigo-500 bg-indigo-50 border-indigo-100', href: '/assignments-suite#cbse-board-prep' },
      { icon: <ClipboardList className="w-5 h-5" />, title: 'Multiple Formats', desc: 'Easily compose MCQs, short answer, and fill-in-the-blanks', color: 'text-teal-500 bg-teal-50 border-teal-100', href: '/assignments-suite#multiple-formats' },
      { icon: <Laptop className="w-5 h-5" />, title: 'Export PDFs', desc: 'Download print-ready PDF formats of generated worksheets', color: 'text-amber-500 bg-amber-50 border-amber-100', href: '/assignments-suite#export-pdfs' }
    ],
    Analytics: [
      { icon: <BarChart3 className="w-5 h-5" />, title: 'Class Overview', desc: 'Visual statistics and completion metrics of class progress', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', href: '/analytics#class-overview' },
      { icon: <Star className="w-5 h-5" />, title: 'Competency Mapping', desc: 'Track subject-wise skill mastery, metrics and milestones', color: 'text-yellow-500 bg-yellow-50 border-yellow-100', href: '/analytics#competency-mapping' },
      { icon: <Phone className="w-5 h-5" />, title: 'Engagement Stats', desc: 'Assess student study habits, active cycles & logs', color: 'text-blue-500 bg-blue-50 border-blue-100', href: '/analytics#engagement-stats' },
      { icon: <FileSpreadsheet className="w-5 h-5" />, title: 'Parent Reports', desc: 'Automatically generate and print detailed competency reports', color: 'text-indigo-500 bg-indigo-50 border-indigo-100', href: '/analytics#parent-reports' }
    ],
    Pricing: [
      { icon: <Tag className="w-5 h-5" />, title: 'Free Tier', desc: 'Explore basic features, templates & limited credits for free', color: 'text-green-500 bg-green-50 border-green-100', href: '/pricing#free' },
      { icon: <Sparkles className="w-5 h-5" />, title: 'Teacher Pro', desc: 'Unlock unlimited generation, higher model speed & priority support', badge: 'Best Value', color: 'text-orange-500 bg-orange-50 border-orange-100', href: '/pricing#pro' },
      { icon: <Laptop className="w-5 h-5" />, title: 'School License', desc: 'Custom integrations, team sharing options, administrative dashboard & SSO', color: 'text-blue-500 bg-blue-50 border-blue-100', href: '/pricing#school' }
    ],
    Contact: [
      { icon: <Mail className="w-5 h-5" />, title: 'Tech Support', desc: '24/7 dedicated support desk assistance for schools & parents', color: 'text-blue-500 bg-blue-50 border-blue-100', href: '/contact' },
      { icon: <Award className="w-5 h-5" />, title: 'School Partnership', desc: 'Schedule standard pilot programs for your district classrooms', color: 'text-slate-800 bg-slate-50 border-slate-200', href: '/contact' },
      { icon: <MessageSquare className="w-5 h-5" />, title: 'Schedule Demo', desc: 'Book a 1-on-1 expert walkthrough to setup your school integration', color: 'text-purple-500 bg-purple-50 border-purple-100', href: '/contact' }
    ]
  };

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto z-10 relative font-sans">
      
      {/* Section Header */}
      <div className="text-center flex flex-col items-center gap-4 mb-14">
        <div className="px-3 py-1 rounded-full bg-[#10375C]/10 text-[#10375C] border border-[#10375C]/20 text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
          <Zap className="w-3 h-3 text-[#10375C]" /> Feature Hub
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Explore classPlus Capabilities
        </h2>
        <p className="text-slate-500 max-w-xl text-xs md:text-sm leading-relaxed">
          Unlock a comprehensive suite of curriculum tools, AI-guided learning, evaluation dashboards, and direct parent bridges.
        </p>
      </div>

      {/* Category selector Tab-bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="relative px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer"
              style={{
                color: isActive ? '#FFFFFF' : '#475569',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryBg"
                  className="absolute inset-0 bg-[#10375C] rounded-full shadow-lg shadow-[#10375C]/15"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </div>

      {/* Feature cards Grid */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data[activeCategory]?.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => router.push(item.href)}
                className="p-5 rounded-3xl bg-white/65 backdrop-blur-md border border-slate-200/80 hover:border-[#10375C]/20 shadow-md hover:shadow-xl hover:shadow-slate-200/60 transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer"
              >
                {/* Glow accent */}
                <div className="absolute -top-[10%] -left-[10%] w-[35%] h-[35%] bg-slate-100 rounded-full blur-3xl group-hover:bg-[#10375C]/5 transition-all" />

                <div className="flex flex-col gap-4 relative z-10 flex-1">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl border shadow-sm group-hover:scale-110 transition-transform ${item.color}`}>
                      {item.icon}
                    </div>
                    {item.badge && (
                      <span className="text-[8px] font-black text-[#10375C] bg-[#10375C]/10 border border-[#10375C]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5 mt-2">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#10375C] transition-colors flex items-center gap-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-[#10375C] transition-colors relative z-10">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

    </section>
  );
}
