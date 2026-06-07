// src/app/result/[assignmentId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DarkBanner } from '@/components/result/DarkBanner';
import { ExamPaper } from '@/components/result/ExamPaper';
import { getAssignment } from '@/lib/api';
import { Assignment } from '@/types/assignment';
import { useAssignmentStore } from '@/store/assignmentStore';
import { FileText, ChevronRight, Monitor, Laptop, Smartphone } from 'lucide-react';
import { PhoneFrame, LaptopFrame } from '@/components/shared/DeviceFrames';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'laptop' | 'phone'>('desktop');
  const setCurrentAssignment = useAssignmentStore((state) => state.setCurrentAssignment);

  useEffect(() => {
    async function loadAssignment() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAssignment(assignmentId);
        setAssignment(data);
        setCurrentAssignment(data);
      } catch (err) {
        console.error('Failed to load assignment details:', err);
        const errMsg = err instanceof Error ? err.message : 'Failed to load assignment.';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    }
    loadAssignment();
  }, [assignmentId, setCurrentAssignment]);

  return (
    <AppShell>
      {loading ? (
        // Premium Document Skeleton Loader
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
          {/* Banner Skeleton */}
          <div className="h-24 bg-veda-dark-banner rounded-2xl w-full animate-pulse" />

          {/* Exam Paper Card Skeleton */}
          <div className="bg-white border border-veda-card-border rounded-xl p-8 md:p-12 w-full min-h-[50vh] flex flex-col gap-6 shadow-sm">
            {/* Centered School Name */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
            
            {/* Info Row */}
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>

            {/* Student Info Block */}
            <div className="h-24 bg-gray-50 rounded-xl w-full border border-dashed border-gray-200 animate-pulse" />

            {/* Questions list */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 mt-4">
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : error || !assignment ? (
        // Error State
        <div className="w-full max-w-md mx-auto text-center py-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-veda-orange-red mb-2">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-veda-text-primary">
            Failed to load assignment
          </h3>
          <p className="text-sm text-veda-text-secondary leading-relaxed">
            We couldn&apos;t retrieve the details for this assignment. It might have been deleted or there could be a connection issue.
          </p>
          <button
            onClick={() => router.push('/assignments')}
            className="text-sm font-semibold text-veda-orange flex items-center gap-1 hover:underline"
          >
            <span>Back to Assignments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Content Loaded State
        <div 
          className="flex flex-col items-center mx-auto w-full bg-[var(--Background-bg-dark,#5E5E5E)] p-5 md:p-[24px] gap-3 md:gap-6 rounded-[32px] md:rounded-[40px] md:max-w-[1100px] shadow-md"
        >
          {/* AI Response Message Banner */}
          {assignment.result && (
            <DarkBanner 
              assignmentId={assignment._id} 
              aiMessage={assignment.result.aiMessage} 
              assignmentTitle={assignment.title}
            />
          )}

          {/* Device Preview Switcher (Desktop, Laptop, Phone) */}
          <div className="flex items-center bg-[#1A1A1A]/80 backdrop-blur-md p-1 rounded-full gap-1 border border-white/5 shadow-inner">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-[#1A1A1A] shadow-md scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Printable Sheet</span>
            </button>
            <button
              onClick={() => setViewMode('laptop')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                viewMode === 'laptop'
                  ? 'bg-white text-[#1A1A1A] shadow-md scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Laptop View</span>
            </button>
            <button
              onClick={() => setViewMode('phone')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                viewMode === 'phone'
                  ? 'bg-white text-[#1A1A1A] shadow-md scale-105'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile View</span>
            </button>
          </div>

          {/* Main Content Area based on View Mode */}
          <div className="w-full flex justify-center items-center py-6 overflow-hidden min-h-[600px] md:min-h-[640px]">
            {viewMode === 'desktop' && (
              <ExamPaper assignment={assignment} />
            )}
            {viewMode === 'laptop' && (
              <div className="scale-110 sm:scale-125 md:scale-135 lg:scale-145 transition-all duration-300 origin-center">
                <LaptopFrame>
                  <ExamPaper assignment={assignment} />
                </LaptopFrame>
              </div>
            )}
            {viewMode === 'phone' && (
              <div className="scale-105 sm:scale-110 md:scale-115 lg:scale-120 transition-all duration-300 origin-center">
                <PhoneFrame>
                  <ExamPaper assignment={assignment} />
                </PhoneFrame>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
