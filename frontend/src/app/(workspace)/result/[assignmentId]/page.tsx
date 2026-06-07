// src/app/result/[assignmentId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ExamPaper } from '@/components/result/ExamPaper';
import { getAssignment, exportAssignmentPDF, regenerateWithDifficulty } from '@/lib/api';
import { Assignment } from '@/types/assignment';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useToastStore } from '@/store/toastStore';
import { FileText, ChevronRight, Monitor, Laptop, Smartphone, FileDown, Loader2, Check, ChevronDown, RefreshCw } from 'lucide-react';
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

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { addToast } = useToastStore();

  const handleDownload = async () => {
    if (!assignment) return;
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const fileName = assignment.title 
        ? `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf`
        : `ClassPilot_Assessment_${assignmentId}.pdf`;

      const blob = await exportAssignmentPDF(assignmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      addToast('Error exporting PDF paper. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = async (difficulty: 'easier' | 'same' | 'harder') => {
    setIsDropdownOpen(false);
    setIsRegenerating(true);
    try {
      addToast(`Initiating regeneration (${difficulty})...`, 'success');
      const res = await regenerateWithDifficulty(assignmentId, difficulty);
      router.push(`/status/${res.jobId}`);
    } catch (err) {
      console.error('Failed to regenerate assignment:', err);
      addToast('Error regenerating assignment. Please try again.', 'error');
      setIsRegenerating(false);
    }
  };

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
          className="flex flex-col items-center mx-auto w-full bg-white/45 backdrop-blur-xl border border-white/55 p-5 md:p-[24px] gap-3 md:gap-6 rounded-[32px] md:rounded-[40px] md:max-w-[1100px] shadow-xl"
        >
          {/* Top Control Bar: Switchers on Left, Actions on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full border-b border-slate-100 pb-4">
            
            {/* Device Preview Switcher (Desktop, Laptop, Phone) */}
            <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-full gap-1 border border-slate-200/50 shadow-sm">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-[#10375C] text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Printable Sheet</span>
              </button>
              <button
                onClick={() => setViewMode('laptop')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  viewMode === 'laptop'
                    ? 'bg-[#10375C] text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptop View</span>
              </button>
              <button
                onClick={() => setViewMode('phone')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  viewMode === 'phone'
                    ? 'bg-[#10375C] text-white shadow-md scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile View</span>
              </button>
            </div>

            {/* Action Buttons: Download & Regenerate */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto relative z-20">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center gap-1.5 bg-[#10375C] hover:bg-[#0c2e4f] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-full h-[40px] px-5 text-xs md:text-sm font-semibold tracking-wide transition-all active:scale-95 shadow-md hover:shadow-lg hover:shadow-slate-200 cursor-pointer font-sans select-none"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : downloadSuccess ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>

              {/* Regenerate Dropdown Button */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isRegenerating}
                  className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-[#10375C] rounded-full h-[40px] px-5 text-xs md:text-sm font-semibold tracking-wide transition-all border border-slate-200 shadow-sm hover:border-[#10375C]/35 active:scale-95 cursor-pointer font-sans select-none"
                >
                  {isRegenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Regenerate</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#10375C]/70" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => handleRegenerate('easier')}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-slate-700 hover:text-[#10375C] hover:bg-slate-50 rounded-xl transition-all font-semibold font-sans cursor-pointer"
                      >
                        <span>Regenerate (Easier)</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </button>
                      <button
                        onClick={() => handleRegenerate('harder')}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-slate-700 hover:text-[#10375C] hover:bg-slate-50 rounded-xl transition-all font-semibold font-sans cursor-pointer"
                      >
                        <span>Regenerate (Harder)</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      </button>
                      <button
                        onClick={() => handleRegenerate('same')}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs md:text-sm text-slate-700 hover:text-[#10375C] hover:bg-slate-50 rounded-xl transition-all font-semibold font-sans cursor-pointer"
                      >
                        <span>Regenerate (Same)</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

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
