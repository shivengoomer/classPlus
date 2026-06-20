// src/components/layout/Sidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Settings, Sparkles, Home, Users, ClipboardList, Cpu, BookOpen, ChevronLeft, ChevronRight, TrendingUp, Archive } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { listAssignments, listLibraryItems, setGlobalToken } from '@/lib/api';
import { UserButton, useAuth } from '@clerk/nextjs';
import { useProfileStore } from '@/store/profileStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/shared/Logo';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export function Sidebar({ 
  isExpanded, 
  setIsExpanded
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { assignments, setAssignments } = useAssignmentStore();
  const { getToken } = useAuth();
  const { profile } = useProfileStore();

  const [libraryCount, setLibraryCount] = useState<number>(0);
  const isOpen = isExpanded;

  useEffect(() => {
    if (pathname.startsWith('/library')) {
      const fetchLibraryCount = async () => {
        try {
          const data = await listLibraryItems();
          setLibraryCount(data.length);
        } catch (err) {
          console.error('Failed to fetch library count for sidebar:', err);
        }
      };
      fetchLibraryCount();
    }
  }, [pathname]);

  useEffect(() => {
    const updateToken = async () => {
      try {
        const token = await getToken();
        setGlobalToken(token);
        // Once token is retrieved, fetch assignments if empty
        if (assignments.length === 0) {
          const data = await listAssignments();
          setAssignments(data);
        }
      } catch (err) {
        console.error('Failed to load assignments or fetch token:', err);
      }
    };
    updateToken();
    const interval = setInterval(updateToken, 50 * 1000);
    return () => clearInterval(interval);
  }, [getToken, assignments.length, setAssignments]);

  const navItems = [
    {
      label: 'Dashboard',
      path: '/home',
      icon: <Home className="w-4.5 h-4.5 flex-shrink-0" />
    },
    {
      label: 'Classrooms',
      path: '/groups',
      icon: <Users className="w-4.5 h-4.5 flex-shrink-0" />
    },
    {
      label: 'Assessments',
      path: '/assignments',
      icon: <ClipboardList className="w-4.5 h-4.5 flex-shrink-0" />
    },
    {
      label: 'Item Bank',
      path: '/bank',
      icon: <Archive className="w-4.5 h-4.5 flex-shrink-0" />
    },
    {
      label: 'Student Reports',
      path: '/reports',
      icon: <TrendingUp className="w-4.5 h-4.5 flex-shrink-0" />
    },
    {
      label: "AI Toolkit",
      path: '/toolkit',
      icon: <Cpu className="w-4.5 h-4.5 flex-shrink-0" />
    },
    {
      label: 'Library',
      path: '/library',
      icon: <BookOpen className="w-4.5 h-4.5 flex-shrink-0" />
    },
  ];

  return (
    <aside className="flex-shrink-0 flex flex-col justify-between h-full select-none w-full bg-transparent border-0 shadow-none p-0 relative">
      
      {/* Brand Header Pill */}
      <div className={`w-full bg-white/80 backdrop-blur-md border border-white/60 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-[50px] flex items-center justify-between ${isOpen ? 'px-4' : 'px-3'} flex-shrink-0 relative`}>
        <div className={`flex items-center gap-2.5 min-w-0 ${!isOpen ? 'mx-auto' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center shadow-sm flex-shrink-0">
            <Logo className="w-5 h-5" />
          </div>
          
          {/* Animated Brand Text */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-md font-black tracking-tight text-slate-900 font-sans leading-none">
                  classPlus
                </span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 whitespace-nowrap">SaaS Workspace</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating toggle button hanging off the right edge */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all z-50 cursor-pointer"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Navigation & Action Pill */}
      <div className={`w-full bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col ${isOpen ? 'p-3 gap-4' : 'p-2 gap-3 items-center'} flex-shrink-0`}>
        {/* Create Assessment Action Button */}
        <div className={`w-full ${!isOpen ? 'flex justify-center' : ''}`}>
          {isOpen ? (
            <button
              onClick={() => router.push('/create')}
              className="w-full bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs tracking-wide shadow-md shadow-[#10375C]/20 active:scale-95 transition-all rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Assessment</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/create')}
              className="w-10 h-10 bg-[#10375C] hover:bg-[#0d2f4f] text-white flex items-center justify-center shadow-md shadow-[#10375C]/20 active:scale-95 transition-all rounded-xl cursor-pointer border-0"
              title="Create Assessment"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className={`flex flex-col gap-1 w-full ${!isOpen ? 'items-center' : ''}`}>
          {navItems.map((item, idx) => {
            const isActive = pathname.startsWith(item.path);
            const hasBadge = (item.label === 'Assessments' && assignments.length > 0) || (item.label === 'Library' && libraryCount > 0);
            const badgeValue = item.label === 'Assessments' ? assignments.length : libraryCount;

            return (
              <Link
                key={idx}
                href={item.path}
                className={`flex items-center rounded-xl text-xs font-bold transition-all border relative ${
                  isActive
                    ? 'bg-[#10375C]/10 text-[#10375C] border-[#10375C]/15'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/40 border-transparent'
                } ${isOpen ? 'w-full py-2 px-3 justify-start gap-2.5' : 'w-10 h-10 justify-center'}`}
                title={isOpen ? undefined : item.label}
              >
                <span className={isActive ? 'text-[#10375C]' : 'text-slate-500'}>
                  {item.icon}
                </span>
                
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                
                {/* Count Badge */}
                {hasBadge && (
                  isOpen ? (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto text-white text-[9px] font-black bg-[#10375C] border border-[#10375C]/20 px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-sm"
                    >
                      {badgeValue}
                    </motion.span>
                  ) : (
                    /* Dot indicator when collapsed */
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10375C] border border-white" />
                  )
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings, Credits & Profile Pill */}
      <div className={`w-full bg-white/80 backdrop-blur-md border border-white/60 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col ${isOpen ? 'p-3 gap-3' : 'p-2 gap-2 items-center'} flex-shrink-0`}>
        
        {/* Settings Navigation */}
        <Link
          href="/settings"
          className={`flex items-center rounded-xl text-xs font-bold transition-all border ${
            pathname.startsWith('/settings')
              ? 'bg-[#10375C]/10 text-[#10375C] border-[#10375C]/15'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/40 border-transparent'
          } ${isOpen ? 'w-full py-2 px-3 gap-2.5 justify-start' : 'w-10 h-10 justify-center'}`}
          title={isOpen ? undefined : "Settings"}
        >
          <Settings className={`w-4.5 h-4.5 flex-shrink-0 ${pathname.startsWith('/settings') ? 'text-[#10375C]' : 'text-slate-500'}`} />
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Settings
            </motion.span>
          )}
        </Link>

        {/* AI Credit Progress Tracker Widget */}
        {profile && isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full bg-slate-100/30 border border-slate-200/40 rounded-xl p-2 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#10375C]" />
                <span>AI Credits</span>
              </span>
              <span>{profile.creditsUsed ?? 0}/{profile.creditsLimit ?? 10}</span>
            </div>
            <div className="w-full h-1 bg-slate-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#10375C] transition-all duration-500"
                style={{ width: `${Math.min(((profile.creditsUsed ?? 0) / (profile.creditsLimit ?? 10)) * 100, 100)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Glassmorphic Profile Card */}
        <div className={`flex items-center bg-white/50 border border-white/60 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.01)] w-full transition-all duration-300 ${isOpen ? 'p-1.5 gap-2.5' : 'w-10 h-10 p-0 justify-center'}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200/60 bg-slate-50/50 flex items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  rootBox: "w-full h-full",
                  userButtonTrigger: "w-full h-full focus:shadow-none focus:outline-none",
                  userButtonAvatarBox: "w-full h-full rounded-full",
                  userButtonAvatarImage: "w-full h-full rounded-full object-cover"
                }
              }}
            />
          </div>
          
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-w-0 flex-1 justify-center leading-none"
            >
              <span className="text-[11px] font-bold text-slate-800 truncate">
                {profile?.schoolName || 'Delhi Public School'}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">
                {profile?.schoolBranch || 'Bokaro Steel City'}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </aside>
  );
}
