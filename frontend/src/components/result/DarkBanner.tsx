// src/components/result/DarkBanner.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, Loader2, Check, ChevronDown, RefreshCw } from 'lucide-react';
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
      className="flex flex-col justify-center items-start md:items-center gap-4 md:gap-6 self-stretch rounded-[24px] md:rounded-[32px] bg-[#303030] md:bg-black/80 text-white shadow-lg border border-white/5 p-5 md:p-8"
    >
      {/* AI Message */}
      <p className="text-[14px] md:text-[20px] font-bold leading-relaxed md:leading-8 text-white font-sans max-w-4xl text-left md:text-center">
        {aiMessage}
      </p>

      {/* Button Actions Layout */}
      <div className="flex items-center justify-center gap-3 w-full md:w-auto">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center bg-white/10 md:bg-white text-white md:text-[#303030] hover:bg-white/20 md:hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 rounded-full w-10 md:w-auto h-10 md:h-[44px] md:px-6 text-[16px] font-semibold transition-all flex-shrink-0 active:scale-95 shadow-sm"
        >
          {isDownloading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : downloadSuccess ? (
            <Check className="w-5 h-5 text-green-500 md:text-green-600" />
          ) : (
            <FileDown className="w-5 h-5" />
          )}
          <span className="hidden md:inline ml-2">
            {isDownloading ? 'Downloading...' : downloadSuccess ? 'Downloaded' : 'Download as PDF'}
          </span>
        </button>

        {/* Regenerate Dropdown Button */}
        <div className="relative inline-block text-left">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isRegenerating}
            className="flex items-center justify-center bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 rounded-full w-10 md:w-auto h-10 md:h-[44px] md:px-6 text-[16px] font-semibold transition-all flex-shrink-0 active:scale-95 border border-white/10"
          >
            {isRegenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="hidden md:inline ml-2">Regenerate</span>
            <ChevronDown className="hidden md:inline w-4 h-4 ml-1.5" />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close the dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#303030] border border-white/10 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleRegenerate('easier')}
                  className="w-full text-left px-4 py-2.5 text-[14px] text-white hover:bg-white/10 transition-colors font-sans"
                >
                  Regenerate (Easier)
                </button>
                <button
                  onClick={() => handleRegenerate('harder')}
                  className="w-full text-left px-4 py-2.5 text-[14px] text-white hover:bg-white/10 transition-colors font-sans"
                >
                  Regenerate (Harder)
                </button>
                <button
                  onClick={() => handleRegenerate('same')}
                  className="w-full text-left px-4 py-2.5 text-[14px] text-white hover:bg-white/10 transition-colors font-sans"
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
