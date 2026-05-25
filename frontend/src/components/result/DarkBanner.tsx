// src/components/result/DarkBanner.tsx
'use client';

import React, { useState } from 'react';
import { FileDown, Loader2, Check } from 'lucide-react';
import { exportAssignmentPDF } from '@/lib/api';

interface DarkBannerProps {
  assignmentId: string;
  aiMessage: string;
}

export function DarkBanner({ assignmentId, aiMessage }: DarkBannerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const blob = await exportAssignmentPDF(assignmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VedaAI_Assessment_${assignmentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Error exporting PDF paper. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full bg-veda-dark-banner text-white p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
      
      {/* AI Message */}
      <p className="text-sm md:text-base font-medium leading-relaxed max-w-2xl">
        {aiMessage}
      </p>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-2 bg-white text-veda-btn-primary hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 rounded-full px-5 py-2.5 text-sm font-bold transition-all flex-shrink-0 active:scale-95 self-stretch md:self-auto shadow-sm"
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin text-veda-btn-primary" />
        ) : downloadSuccess ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <FileDown className="w-4 h-4 text-veda-btn-primary" />
        )}
        
        {/* Hide text on mobile, show only icon */}
        <span className="hidden sm:inline">
          {isDownloading ? 'Downloading...' : downloadSuccess ? 'Downloaded' : 'Download as PDF'}
        </span>
      </button>

    </div>
  );
}
