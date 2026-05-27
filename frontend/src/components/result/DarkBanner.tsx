// src/components/result/DarkBanner.tsx
'use client';

import React, { useState } from 'react';
import { FileDown, Loader2, Check } from 'lucide-react';
import { exportAssignmentPDF } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

interface DarkBannerProps {
  assignmentId: string;
  aiMessage: string;
  pdfUrl?: string;
}

export function DarkBanner({ assignmentId, aiMessage, pdfUrl }: DarkBannerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const { addToast } = useToastStore();

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      if (pdfUrl) {
        // Open UploadThing URL directly in new tab (bypasses CORS restrictions)
        window.open(pdfUrl, '_blank');
      } else {
        // Fallback: Generate on-the-fly from the backend API
        const blob = await exportAssignmentPDF(assignmentId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VedaAI_Assessment_${assignmentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      addToast('Error exporting PDF paper. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
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

    </div>
  );
}
