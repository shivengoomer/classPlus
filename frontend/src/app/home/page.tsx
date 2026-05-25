// src/app/home/page.tsx
'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useRouter } from 'next/navigation';
import { Sparkle, ChevronRight, ClipboardCheck, Clock, Cpu } from 'lucide-react';
import { useFormStore, QuestionConfigRow } from '@/store/formStore';

export default function HomePage() {
  const router = useRouter();
  const assignments = useAssignmentStore((state) => state.assignments);

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

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-16">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 md:p-8 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-bold tracking-tight">Welcome Back, John Doe</span>
              <Sparkle className="w-5 h-5 text-veda-orange fill-veda-orange animate-pulse" />
            </div>
            <p className="text-xs md:text-sm text-gray-300 max-w-md leading-relaxed font-sans">
              Create curriculum-aligned assessments, manage grading schemes, and let AI structure your worksheets.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0">
            <PillButton
              variant="gradient-border"
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
              onClick={() => router.push('/create')}
            >
              Create Assessment
            </PillButton>
          </div>
          {/* Subtle design element */}
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4 select-none pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
              <polygon points="50,10 90,80 10,80" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Dashboard Grid Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Stat 1: Active Assessments */}
          <div className="bg-white border border-veda-card-border p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-veda-text-secondary">Assessments</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-extrabold text-veda-text-primary">{activeCount}</span>
              <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-bold">Active</span>
            </div>
          </div>

          {/* Stat 2: Active Classes */}
          <div className="bg-white border border-veda-card-border p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-veda-text-secondary">Class Groups</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-extrabold text-veda-text-primary">4</span>
              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-bold">Grades 5-9</span>
            </div>
          </div>

          {/* Stat 3: AI Credits */}
          <div className="bg-white border border-veda-card-border p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-veda-text-secondary">AI Credits Used</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-extrabold text-veda-text-primary">85<span className="text-sm font-normal text-gray-400">/100</span></span>
              <span className="text-[10px] text-veda-orange bg-orange-50 px-1.5 py-0.5 rounded font-bold">85% Limit</span>
            </div>
          </div>

          {/* Stat 4: Pending Generations */}
          <div className="bg-white border border-veda-card-border p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[110px]">
            <span className="text-xs font-semibold text-veda-text-secondary">Processing Jobs</span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-extrabold text-veda-text-primary">{pendingCount}</span>
              {pendingCount > 0 ? (
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold animate-pulse">Running</span>
              ) : (
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">All Clear</span>
              )}
            </div>
          </div>

        </div>

        {/* Quick starts & Recent Activity row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Quick Starts (Col span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-veda-text-primary flex items-center gap-2">
                <Cpu className="w-5 h-5 text-veda-orange" />
                <span>AI Quick-Start Templates</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickStarts.map((qs, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleQuickStart(qs)}
                  className="bg-white hover:bg-gray-50 border border-veda-card-border hover:border-gray-300 rounded-xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-veda-orange bg-orange-50 px-2 py-0.5 rounded">
                        {qs.subject} • {qs.grade}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <h4 className="text-sm font-bold text-veda-text-primary mt-1">
                      {qs.title}
                    </h4>
                    <p className="text-[12px] text-veda-text-secondary leading-relaxed font-sans line-clamp-2">
                      {qs.prompt}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-gray-500 font-sans border-t border-gray-100 pt-3">
                    <span>{qs.rows.reduce((acc, r) => acc + r.count, 0)} Questions</span>
                    <span>{qs.rows.reduce((acc, r) => acc + (r.count * r.marks), 0)} Total Marks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity List (Col span 1) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-veda-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>Recent Assessments</span>
            </h3>
            
            <div className="bg-white border border-veda-card-border rounded-xl shadow-sm flex flex-col divide-y divide-gray-100 overflow-hidden">
              {assignments.length > 0 ? (
                assignments.slice(-4).reverse().map((item) => (
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
                    className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-veda-orange flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-veda-text-primary truncate group-hover:text-veda-orange transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-veda-text-secondary truncate mt-0.5">
                          {item.subject} • Class {item.grade}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === 'done' ? (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      ) : item.status === 'pending' || item.status === 'processing' ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-veda-text-secondary font-sans">
                  No assignments yet. Get started by clicking &quot;Create Assessment&quot;.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
