// src/app/home/page.tsx
'use client';

import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight, ClipboardCheck, Clock, Cpu, Users, Award, Beaker, Book, Calculator } from 'lucide-react';
import { useFormStore, QuestionConfigRow } from '@/store/formStore';
import { listAssignments } from '@/lib/api';
import { useUser } from '@clerk/nextjs';
import { useProfileStore } from '@/store/profileStore';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const assignments = useAssignmentStore((state) => state.assignments);
  const setAssignments = useAssignmentStore((state) => state.setAssignments);
  const { user: clerkUser } = useUser();
  const { profile: userProfile, fetchProfile } = useProfileStore();

  // fetch assignments from backend on page load
  useEffect(() => {
    listAssignments()
      .then((data) => setAssignments(data))
      .catch((err) => console.error('Failed to load assignments:', err));
  }, [setAssignments]);

  // fetch user profile
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Statistics derived dynamically
  const activeCount = assignments.filter((a) => a.status === 'done').length;
  const pendingCount = assignments.filter((a) => a.status === 'pending' || a.status === 'processing').length;

  const quickStarts = [
    {
      title: 'CBSE Grade 8 Science Quiz',
      prompt: 'NCERT Chapter 14: Chemical Effects of Electric Current',
      subject: 'Science',
      grade: '8th',
      rows: [
        { type: 'short', count: 3, marks: 2 },
        { type: 'mcq', count: 4, marks: 1 }
      ]
    },
    {
      title: 'CBSE Grade 5 English Prepositions',
      prompt: 'Fill in the blanks and MCQ section on prepositions',
      subject: 'English',
      grade: '5th',
      rows: [
        { type: 'fillblank', count: 5, marks: 1 },
        { type: 'short', count: 2, marks: 2 }
      ]
    },
    {
      title: 'Mathematics Algebra test',
      prompt: 'Polynomial division and linear equation systems',
      subject: 'Mathematics',
      grade: '9th',
      rows: [
        { type: 'short', count: 3, marks: 3 },
        { type: 'long', count: 1, marks: 5 }
      ]
    }
  ];

  const handleQuickStart = (qs: typeof quickStarts[0]) => {
    useFormStore.setState({
      title: qs.title,
      subject: qs.subject,
      grade: qs.grade,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      questionRows: qs.rows as unknown as QuestionConfigRow[],
      additionalInstructions: qs.prompt,
      file: null
    });
    router.push('/create');
  };

  const getSubjectStyles = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'science':
        return {
          tag: 'text-emerald-600 bg-emerald-50/70 border-emerald-100',
          hoverBorder: 'hover:border-emerald-500/30',
          hoverGlow: 'hover:shadow-emerald-500/5',
          hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-emerald-50/10',
          icon: <Beaker className="w-3.5 h-3.5 text-emerald-500" />
        };
      case 'english':
        return {
          tag: 'text-indigo-600 bg-indigo-50/70 border-indigo-100',
          hoverBorder: 'hover:border-indigo-500/30',
          hoverGlow: 'hover:shadow-indigo-500/5',
          hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-indigo-50/10',
          icon: <Book className="w-3.5 h-3.5 text-indigo-500" />
        };
      case 'mathematics':
      case 'math':
        return {
          tag: 'text-sky-655 bg-sky-50/70 border-sky-100',
          hoverBorder: 'hover:border-sky-500/30',
          hoverGlow: 'hover:shadow-sky-500/5',
          hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-sky-50/10',
          icon: <Calculator className="w-3.5 h-3.5 text-sky-500" />
        };
      default:
        return {
          tag: 'text-amber-600 bg-amber-50/70 border-amber-100',
          hoverBorder: 'hover:border-amber-500/30',
          hoverGlow: 'hover:shadow-amber-500/5',
          hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-amber-50/10',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        };
    }
  };

  const getRowTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'MCQ';
      case 'short': return 'Short';
      case 'long': return 'Long';
      case 'fillblank': return 'Fill Blank';
      case 'truefalse': return 'True/False';
      default: return type.toUpperCase();
    }
  };

  const formatEventTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Recently';
    }
  };

  // Stagger variants for metrics & lists
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } }
  };

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
        
        {/* Minimalist Overview Header Row */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-bricolage), "Bricolage Grotesque", sans-serif' }}>
              Overview
            </h1>
            <p className="text-xs text-slate-500 font-sans font-medium">
              Welcome back, <span className="font-bold text-slate-800">{userProfile?.firstName || clerkUser?.firstName || 'Teacher'}</span>. 
              You have <span className="font-bold text-slate-800">{activeCount}</span> active assessments across <span className="font-bold text-slate-800">4</span> class groups.
            </p>
          </div>
          <div>
            <PillButton
              variant="gradient-border"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white border-0 shadow-md shadow-orange-500/10 active:scale-95 transition-all text-xs font-black px-5 py-3 rounded-2xl cursor-pointer flex items-center gap-2"
              onClick={() => router.push('/create')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Assessment</span>
            </PillButton>
          </div>
        </motion.div>

        {/* Grouped Metrics Block */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="backdrop-blur-md bg-white/70 border border-white/60 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)]"
        >
          {/* Stat 1: Active Assessments */}
          <motion.div 
            variants={itemVariants}
            onClick={() => router.push('/assignments')}
            className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group px-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Assessments</span>
              <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-slate-900 leading-none">{activeCount}</span>
              <span className="text-[9px] text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md font-bold uppercase">Active</span>
            </div>
          </motion.div>

          {/* Stat 2: Active Classes */}
          <motion.div 
            variants={itemVariants}
            onClick={() => router.push('/groups')}
            className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group px-2 border-l border-slate-200/60 pl-4 md:pl-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Class Groups</span>
              <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-slate-900 leading-none">4</span>
              <span className="text-[9px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-bold uppercase">Grades 5-9</span>
            </div>
          </motion.div>

          {/* Stat 3: AI Credits */}
          <motion.div 
            variants={itemVariants}
            onClick={() => router.push('/billing')}
            className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group px-2 border-t border-slate-200/60 pt-6 md:pt-0 md:border-t-0 md:border-l md:pl-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">AI Credits Used</span>
              <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-slate-900 leading-none">
                {userProfile?.creditsUsed ?? activeCount}
                <span className="text-sm font-normal text-slate-400">/{userProfile?.creditsLimit ?? 10}</span>
              </span>
              <span className="text-[9px] text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md font-bold uppercase">
                {userProfile ? `${Math.round(((userProfile.creditsUsed ?? 0) / (userProfile.creditsLimit ?? 10)) * 100)}% Limit` : '—'}
              </span>
            </div>
          </motion.div>

          {/* Stat 4: Processing Jobs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.01] active:scale-[0.99] group px-2 border-t border-l border-slate-200/60 pt-6 pl-4 md:pt-0 md:border-t-0 md:border-l md:pl-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Processing Jobs</span>
              <div className="w-7 h-7 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-4">
              <span className="text-3xl font-black text-slate-900 leading-none">{pendingCount}</span>
              {pendingCount > 0 ? (
                <span className="text-[9px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-bold uppercase animate-pulse">Running</span>
              ) : (
                <span className="text-[9px] text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-bold uppercase">All Clear</span>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* SaaS Bento Grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-2">
          
          {/* Quick Starts (Col span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
              <Cpu className="w-4 h-4 text-orange-500" />
              <span>AI Quick-Start Templates</span>
            </h3>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {quickStarts.map((qs, idx) => {
                const styles = getSubjectStyles(qs.subject);
                return (
                  <motion.div 
                    variants={itemVariants}
                    key={idx}
                    onClick={() => handleQuickStart(qs)}
                    className={`backdrop-blur-md bg-white/70 hover:bg-white border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all cursor-pointer flex flex-col justify-between gap-4 group ${styles.hoverBorder} ${styles.hoverGlow} ${styles.hoverBg} hover:-translate-y-0.5 duration-300`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                            {styles.icon}
                          </div>
                          <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-full uppercase tracking-wide ${styles.tag}`}>
                            {qs.subject} • {qs.grade}
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                      <h4 className="text-sm font-black text-slate-850 tracking-tight mt-1.5">
                        {qs.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-2">
                        {qs.prompt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 select-none">
                      <div className="flex flex-wrap gap-1">
                        {qs.rows.map((row, rIdx) => (
                          <span key={rIdx} className="text-[9px] font-black text-slate-505 bg-slate-100/70 border border-slate-200/50 px-2 py-0.5 rounded-md uppercase">
                            {row.count}×{getRowTypeLabel(row.type)}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold font-sans flex items-center gap-1.5">
                        <span>{qs.rows.reduce((acc, r) => acc + r.count, 0)} Qs</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full animate-pulse" />
                        <span>{qs.rows.reduce((acc, r) => acc + (r.count * r.marks), 0)} Marks</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Custom AI Generation Card */}
              <motion.div
                variants={itemVariants}
                onClick={() => router.push('/create')}
                className="hidden md:flex backdrop-blur-md bg-gradient-to-br from-orange-500/5 to-purple-500/5 border border-dashed border-orange-500/20 hover:border-orange-500/40 rounded-3xl p-5 shadow-sm transition-all cursor-pointer flex-col justify-center items-center gap-2 group hover:-translate-y-0.5 duration-300"
              >
                <div className="p-3 rounded-full bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-slate-800 mt-2">Custom AI Generation</h4>
                <p className="text-[10px] text-slate-400 text-center max-w-[180px] font-sans font-medium">
                  Write custom instructions to generate highly tailored worksheets.
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Activity Event Feed timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 pl-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recent Activity Feed</span>
            </h3>
            
            <div className="backdrop-blur-md bg-white/70 border border-white/60 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col gap-5 relative overflow-hidden min-h-[300px]">
              {/* Vertical timeline line */}
              {assignments.length > 0 && (
                <div className="absolute left-[27px] top-6 bottom-6 w-[1.5px] bg-slate-200/50" />
              )}
              
              {assignments.length > 0 ? (
                assignments.slice(-4).reverse().map((item) => {
                  let statusDotClass = 'bg-green-500 border-green-200';
                  let statusText = 'Generated';
                  if (item.status === 'pending' || item.status === 'processing') {
                    statusDotClass = 'bg-blue-500 border-blue-200 animate-pulse';
                    statusText = 'Processing';
                  } else if (item.status === 'failed') {
                    statusDotClass = 'bg-red-500 border-red-200';
                    statusText = 'Failed';
                  }
                  
                  return (
                    <div 
                      key={item._id}
                      onClick={() => {
                        if (item.status === 'done') {
                          router.push(`/result/${item._id}`);
                        } else if (item.jobId) {
                          router.push(`/status/${item.jobId}`);
                        } else {
                          router.push('/assignments');
                        }
                      }}
                      className="flex gap-3 relative items-start group cursor-pointer"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 flex items-center justify-center w-4 h-4 mt-2.5 flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 ${statusDotClass}`} />
                      </div>

                      {/* Timeline Card */}
                      <div className="flex-1 bg-white/40 group-hover:bg-white/80 border border-slate-100 hover:border-orange-500/10 p-3 rounded-2xl transition-all shadow-sm flex flex-col gap-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-orange-650 transition-colors line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 whitespace-nowrap">
                            {formatEventTime(item.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans mt-0.5">
                          <span>{item.subject} • Class {item.grade}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider ${
                            item.status === 'done' ? 'text-green-600' : item.status === 'failed' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-bold font-sans my-auto">
                  No activity logs yet. Get started by generating an assessment.
                </div>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </AppShell>
  );
}
