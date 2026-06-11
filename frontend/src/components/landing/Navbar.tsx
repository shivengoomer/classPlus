// src/components/landing/Navbar.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { 
  Sparkles, BookOpen, MessageSquare, ClipboardList, BarChart3, Tag, Mail,
  Brain, FileSpreadsheet, ArrowRight, Star, Laptop, Phone,
  Compass, Award, RefreshCw, Layers, Menu, X, ChevronDown
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

interface DropdownItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
  href: string;
}

export default function Navbar() {
  const router = useRouter();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
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

  const routeMap: Record<string, string> = {
    Features: '/features',
    'AI Assistant': '/ai-assistant',
    Assignments: '/assignments-suite',
    Analytics: '/analytics',
    Pricing: '/pricing',
    Contact: '/contact'
  };

  const dropdownData: Record<string, DropdownItem[]> = {
    Features: [
      { icon: <BookOpen className="w-5 h-5 text-orange-500" />, title: 'Smart Learning', desc: 'Curriculum-aligned paths for students', href: '/features#smart-learning' },
      { icon: <Brain className="w-5 h-5 text-purple-500" />, title: 'AI Tutor', desc: '24/7 personalized explanations & chat', badge: 'Popular', href: '/features#ai-tutor' },
      { icon: <FileSpreadsheet className="w-5 h-5 text-blue-500" />, title: 'Assignment Gen', desc: 'Generate custom worksheets in seconds', href: '/features#assignment-gen' },
      { icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, title: 'Performance Analytics', desc: 'Identify learning gaps instantly', href: '/features#analytics' }
    ],
    'AI Assistant': [
      { icon: <MessageSquare className="w-5 h-5 text-blue-500" />, title: 'Student Chat', desc: 'Interactive tutoring on any subject', href: '/ai-assistant#student-chat' },
      { icon: <Brain className="w-5 h-5 text-purple-500" />, title: 'Concept Explainer', desc: 'Breaks down topics into simple visuals', href: '/ai-assistant#concept-explainer' },
      { icon: <Award className="w-5 h-5 text-orange-500" />, title: 'Writing Coach', desc: 'AI editing, style & grammar tutor', href: '/ai-assistant#writing-coach' },
      { icon: <Compass className="w-5 h-5 text-pink-500" />, title: 'Math Solver', desc: 'Step-by-step guidance for equations', href: '/ai-assistant#math-solver' }
    ],
    Assignments: [
      { icon: <RefreshCw className="w-5 h-5 text-rose-500" />, title: 'Automatic Grading', desc: 'Instant marks & qualitative feedback', badge: 'Hot', href: '/assignments-suite#automatic-grading' },
      { icon: <Layers className="w-5 h-5 text-indigo-500" />, title: 'CBSE & Board Prep', desc: 'Tailored to curriculum rules', href: '/assignments-suite#cbse-board-prep' },
      { icon: <ClipboardList className="w-5 h-5 text-teal-500" />, title: 'Multiple Formats', desc: 'MCQs, short answer, fill-blanks', href: '/assignments-suite#multiple-formats' },
      { icon: <Laptop className="w-5 h-5 text-amber-500" />, title: 'Export PDFs', desc: 'Download print-ready files', href: '/assignments-suite#export-pdfs' }
    ],
    Analytics: [
      { icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, title: 'Class Overview', desc: 'Visual statistics of class performance', href: '/analytics#class-overview' },
      { icon: <Star className="w-5 h-5 text-yellow-500" />, title: 'Competency Mapping', desc: 'Track subject-wise skill mastery', href: '/analytics#competency-mapping' },
      { icon: <Phone className="w-5 h-5 text-blue-500" />, title: 'Engagement Stats', desc: 'Assess study habits & activity', href: '/analytics#engagement-stats' },
      { icon: <FileSpreadsheet className="w-5 h-5 text-indigo-500" />, title: 'Parent Reports', desc: 'Generate printable PDF metrics', href: '/analytics#parent-reports' }
    ],
    Pricing: [
      { icon: <Tag className="w-5 h-5 text-green-500" />, title: 'Free Tier', desc: 'Explore basic AI features for free', href: '/pricing#free' },
      { icon: <Sparkles className="w-5 h-5 text-orange-500" />, title: 'Teacher Pro', desc: 'Unlimited generation & advanced models', badge: 'Best Value', href: '/pricing#pro' },
      { icon: <Laptop className="w-5 h-5 text-blue-500" />, title: 'School License', desc: 'Custom integrations & SSO', href: '/pricing#school' }
    ],
    Contact: [
      { icon: <Mail className="w-5 h-5 text-blue-500" />, title: 'Tech Support', desc: '24/7 dedicated helpdesk assistance', href: '/contact' },
      { icon: <Award className="w-5 h-5 text-[#10375C]" />, title: 'School Partnership', desc: 'Pilot classPlus in your school district', href: '/contact' },
      { icon: <MessageSquare className="w-5 h-5 text-purple-500" />, title: 'Schedule Demo', desc: '1-on-1 walkthrough with an expert', href: '/contact' }
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
          height: isMobileMenuOpen ? 'auto' : (hoveredTab ? 'auto' : '64px')
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
            onClick={() => {
              setIsMobileMenuOpen(false);
              router.push('/');
            }} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-[#10375C] transition-colors">
              classPlus
            </span>
          </div>

          {/* Navigation links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item}
                onMouseEnter={() => handleMouseEnter(item)}
                onClick={() => {
                  setHoveredTab(null);
                  router.push(routeMap[item]);
                }}
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

          {/* Auth elements (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <button 
                onClick={() => router.push('/sign-in')}
                className="hidden sm:block text-slate-600 hover:text-slate-950 text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/sign-in')}
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

          {/* Mobile Actions & Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <SignedOut>
              <button
                onClick={() => router.push('/sign-in')}
                className="hidden sm:block text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/sign-in')}
                className="px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-[#10375C] hover:bg-[#0d2f4f] text-white shadow-sm transition-all active:scale-95"
              >
                Get Started
              </button>
            </SignedOut>

            <SignedIn>
              <button
                onClick={() => router.push('/home')}
                className="px-3.5 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-all active:scale-95"
              >
                Dashboard
              </button>
            </SignedIn>

            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setActiveMobileSubmenu(null);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-800" />
              ) : (
                <Menu className="w-6 h-6 text-slate-800" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Dropdown Menu Container */}
        <AnimatePresence>
          {hoveredTab && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="hidden md:block px-8 pb-8 pt-4 border-t border-slate-100 bg-white/95"
            >
              <div className="grid grid-cols-2 gap-4">
                {dropdownData[hoveredTab]?.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setHoveredTab(null);
                      router.push(item.href);
                    }}
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

        {/* Mobile Drawer Menu Container */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="px-6 pb-6 pt-2 border-t border-slate-100 md:hidden bg-white/95 max-h-[calc(100vh-120px)] overflow-y-auto"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const hasDropdown = !!dropdownData[item];
                  const isExpanded = activeMobileSubmenu === item;

                  return (
                    <div key={item} className="border-b border-slate-100/60 py-1 last:border-0">
                      <button
                        onClick={() => {
                          if (hasDropdown) {
                            setActiveMobileSubmenu(isExpanded ? null : item);
                          } else {
                            setIsMobileMenuOpen(false);
                            router.push(routeMap[item]);
                          }
                        }}
                        className="w-full py-2.5 flex items-center justify-between text-slate-800 hover:text-[#10375C] transition-colors text-left"
                      >
                        <span className="text-sm font-bold tracking-tight">{item}</span>
                        {hasDropdown && (
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-slate-400"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        )}
                      </button>

                      {hasDropdown && (
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-2 pr-2 flex flex-col gap-2 pt-1 pb-3"
                            >
                              {dropdownData[item].map((subItem, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    router.push(subItem.href);
                                  }}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 active:bg-slate-100/80 border border-slate-100/50 hover:border-slate-200/60 transition-colors cursor-pointer group"
                                >
                                  <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:scale-105 transition-transform shadow-sm flex-shrink-0">
                                    {subItem.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-semibold text-slate-800 group-hover:text-[#10375C] transition-colors">
                                        {subItem.title}
                                      </span>
                                      {subItem.badge && (
                                        <span className="text-[8px] font-bold text-[#10375C] bg-[#10375C]/10 px-1 py-0.5 rounded-full border border-[#10375C]/20 uppercase tracking-wide">
                                          {subItem.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                      {subItem.desc}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 my-4" />

              {/* Auth section */}
              <div className="flex flex-col gap-3">
                <SignedOut>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/sign-in');
                    }}
                    className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/sign-in');
                    }}
                    className="w-full py-3 rounded-xl bg-[#10375C] hover:bg-[#0d2f4f] text-white font-semibold text-xs shadow-md shadow-[#10375C]/20 transition-colors text-center"
                  >
                    Get Started Free
                  </button>
                </SignedOut>

                <SignedIn>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/home');
                    }}
                    className="w-full py-3 rounded-xl bg-[#10375C] hover:bg-[#0d2f4f] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#10375C]/20"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  {/* Styled user info row */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100/80 mt-1">
                    <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 bg-white">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">Your Account</span>
                      <span className="text-[9px] text-slate-500 leading-tight">Manage profile & sign out</span>
                    </div>
                  </div>
                </SignedIn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
