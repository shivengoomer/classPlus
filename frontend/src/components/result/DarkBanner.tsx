// src/components/result/DarkBanner.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, Loader2, Check, ChevronDown, RefreshCw, Sparkles } from 'lucide-react';
import { exportAssignmentPDF, regenerateWithDifficulty } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

interface DarkBannerProps {
  assignmentId: string;
  aiMessage: string;
  assignmentTitle?: string;
}

export function DarkBanner({ assignmentId, aiMessage, assignmentTitle }: DarkBannerProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { addToast } = useToastStore();

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const fileName = assignmentTitle 
        ? `${assignmentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf`
        : `ClassPilot_Assessment_${assignmentId}.pdf`;

      // Always generate on-the-fly from the backend API so it reflects any user settings updates (e.g. school name) dynamically
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

  return (
    <div 
      className="flex flex-col justify-center items-start md:items-center gap-4 md:gap-6 self-stretch rounded-[24px] md:rounded-[32px] bg-gradient-to-r from-[#10375C] via-[#0d2f4f] to-[#10375C] text-white shadow-xl border border-white/10 p-6 md:p-8 relative overflow-hidden group"
    >
      {/* Background visual elements */}
      <div className="absolute -top-[20%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none z-0" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#F97316]/5 blur-[70px] pointer-events-none z-0" />

      {/* AI Message */}
      <p className="text-[14px] md:text-[18px] font-bold leading-relaxed md:leading-8 text-slate-100 font-sans max-w-4xl text-left md:text-center relative z-10 flex items-start md:items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1 md:mt-0 animate-pulse" />
        <span>{aiMessage}</span>
      </p>

      {/* Button Actions Layout */}
      <div className="flex items-center justify-center gap-3 w-full md:w-auto relative z-10">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center bg-white hover:bg-slate-50 disabled:bg-slate-200 text-[#10375C] disabled:text-slate-400 rounded-full h-[42px] px-6 text-[14px] font-bold transition-all flex-shrink-0 active:scale-95 shadow-md shadow-black/10 hover:shadow-black/15 cursor-pointer"
        >
          {isDownloading ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : downloadSuccess ? (
            <Check className="w-4.5 h-4.5 text-green-600" />
          ) : (
            <FileDown className="w-4.5 h-4.5" />
          )}
          <span className="ml-2">
            {isDownloading ? 'Downloading...' : downloadSuccess ? 'Downloaded' : 'Download PDF'}
          </span>
        </button>

        {/* Regenerate Dropdown Button */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isRegenerating}
            className="flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-full h-[42px] px-6 text-[14px] font-bold transition-all flex-shrink-0 active:scale-95 border border-white/15 shadow-sm cursor-pointer"
          >
            {isRegenerating ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Regenerate</span>
            <ChevronDown className="w-4 h-4 ml-1.5" />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close the dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0d2f4f] border border-white/10 shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleRegenerate('easier')}
                  className="w-full text-left px-4 py-2 text-[13px] text-slate-100 hover:text-white hover:bg-white/10 transition-colors font-bold font-sans cursor-pointer"
                >
                  Regenerate (Easier)
                </button>
                <button
                  onClick={() => handleRegenerate('harder')}
                  className="w-full text-left px-4 py-2 text-[13px] text-slate-100 hover:text-white hover:bg-white/10 transition-colors font-bold font-sans cursor-pointer"
                >
                  Regenerate (Harder)
                </button>
                <button
                  onClick={() => handleRegenerate('same')}
                  className="w-full text-left px-4 py-2 text-[13px] text-slate-100 hover:text-white hover:bg-white/10 transition-colors font-bold font-sans cursor-pointer"
                >
                  Regenerate (Same difficulty)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
