// src/components/landing/Navbar.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { 
  Sparkles, BookOpen, MessageSquare, ClipboardList, BarChart3, Tag, Mail,
  Brain, FileSpreadsheet, ArrowRight, Star, Laptop, Phone,
  Compass, Award, RefreshCw, Layers
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

interface DropdownItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}

export default function Navbar() {
  const router = useRouter();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (tab: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredTab(tab);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
    }, 200);
  };

  const navItems = ['Features', 'AI Assistant', 'Assignments', 'Analytics', 'Pricing', 'Contact'];

  const dropdownData: Record<string, DropdownItem[]> = {
    Features: [
      { icon: <BookOpen className="w-5 h-5 text-orange-500" />, title: 'Smart Learning', desc: 'Curriculum-aligned paths for students' },
      { icon: <Brain className="w-5 h-5 text-purple-500" />, title: 'AI Tutor', desc: '24/7 personalized explanations & chat', badge: 'Popular' },
      { icon: <FileSpreadsheet className="w-5 h-5 text-blue-500" />, title: 'Assignment Gen', desc: 'Generate custom worksheets in seconds' },
      { icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, title: 'Performance Analytics', desc: 'Identify learning gaps instantly' }
    ],
    'AI Assistant': [
      { icon: <MessageSquare className="w-5 h-5 text-blue-500" />, title: 'Student Chat', desc: 'Interactive tutoring on any subject' },
      { icon: <Brain className="w-5 h-5 text-purple-500" />, title: 'Concept Explainer', desc: 'Breaks down topics into simple visuals' },
      { icon: <Award className="w-5 h-5 text-orange-500" />, title: 'Writing Coach', desc: 'AI editing, style & grammar tutor' },
      { icon: <Compass className="w-5 h-5 text-pink-500" />, title: 'Math Solver', desc: 'Step-by-step guidance for equations' }
    ],
    Assignments: [
      { icon: <RefreshCw className="w-5 h-5 text-rose-500" />, title: 'Automatic Grading', desc: 'Instant marks & qualitative feedback', badge: 'Hot' },
      { icon: <Layers className="w-5 h-5 text-indigo-500" />, title: 'CBSE & Board Prep', desc: 'Tailored to curriculum rules' },
      { icon: <ClipboardList className="w-5 h-5 text-teal-500" />, title: 'Multiple Formats', desc: 'MCQs, short answer, fill-blanks' },
      { icon: <Laptop className="w-5 h-5 text-amber-500" />, title: 'Export PDFs', desc: 'Download print-ready files' }
    ],
    Analytics: [
      { icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, title: 'Class Overview', desc: 'Visual statistics of class performance' },
      { icon: <Star className="w-5 h-5 text-yellow-500" />, title: 'Competency Mapping', desc: 'Track subject-wise skill mastery' },
      { icon: <Phone className="w-5 h-5 text-blue-500" />, title: 'Engagement Stats', desc: 'Assess study habits & activity' },
      { icon: <FileSpreadsheet className="w-5 h-5 text-indigo-500" />, title: 'Parent Reports', desc: 'Generate printable PDF metrics' }
    ],
    Pricing: [
      { icon: <Tag className="w-5 h-5 text-green-500" />, title: 'Free Tier', desc: 'Explore basic AI features for free' },
      { icon: <Sparkles className="w-5 h-5 text-orange-500" />, title: 'Teacher Pro', desc: 'Unlimited generation & advanced models', badge: 'Best Value' },
      { icon: <Laptop className="w-5 h-5 text-blue-500" />, title: 'School License', desc: 'Custom integrations & SSO' }
    ],
    Contact: [
      { icon: <Mail className="w-5 h-5 text-blue-500" />, title: 'Tech Support', desc: '24/7 dedicated helpdesk assistance' },
      { icon: <Award className="w-5 h-5 text-[#10375C]" />, title: 'School Partnership', desc: 'Pilot ClassPilot in your school district' },
      { icon: <MessageSquare className="w-5 h-5 text-purple-500" />, title: 'Schedule Demo', desc: '1-on-1 walkthrough with an expert' }
    ]
  };

  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 font-sans"
      onMouseLeave={handleMouseLeave}
    >
      <motion.nav 
        className="w-full rounded-[24px] border border-slate-200/60 bg-white/85 backdrop-blur-2xl shadow-xl shadow-slate-200/50 overflow-hidden"
        animate={{
          height: hoveredTab ? 'auto' : '64px'
        }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 32
        }}
      >
        <div className="px-6 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={() => router.push('/')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-[#10375C] transition-colors">
              ClassPilot
            </span>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item}
                onMouseEnter={() => handleMouseEnter(item)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  hoveredTab === item 
                    ? 'text-slate-950 bg-slate-100' 
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Auth elements */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <button 
                onClick={() => router.push('/sign-in')}
                className="hidden sm:block text-slate-600 hover:text-slate-950 text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/sign-up')}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#10375C] hover:bg-[#0d2f4f] text-white shadow-md shadow-[#10375C]/20 hover:shadow-[#10375C]/30 active:scale-95 transition-all"
              >
                Get Started Free
              </button>
            </SignedOut>

            <SignedIn>
              <button
                onClick={() => router.push('/home')}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Dropdown Menu Container */}
        <AnimatePresence>
          {hoveredTab && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="px-8 pb-8 pt-4 border-t border-slate-100 bg-white/95"
            >
              <div className="grid grid-cols-2 gap-4">
                {dropdownData[hoveredTab]?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100/60 hover:border-slate-200/80 transition-all cursor-pointer group flex items-start gap-4"
                  >
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 group-hover:scale-110 transition-transform shadow-sm">
                      {item.icon}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-[#10375C] transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-bold text-[#10375C] bg-[#10375C]/10 px-1.5 py-0.5 rounded-full border border-[#10375C]/20 uppercase tracking-wider">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-1 group-hover:text-slate-600 transition-colors">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
