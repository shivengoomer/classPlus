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
      style={{
        display: 'flex',
        padding: '24px 32px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        alignSelf: 'stretch',
        borderRadius: '32px',
        background: 'rgba(24, 24, 24, 0.80)',
      }}
      className="backdrop-blur-md text-white shadow-lg border border-white/5"
    >
      {/* AI Message */}
      <p className="text-[20px] font-bold leading-8 text-white font-sans max-w-4xl text-center">
        {aiMessage}
      </p>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-2 bg-white text-[#303030] hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 rounded-full px-6 h-[44px] text-[16px] font-semibold transition-all flex-shrink-0 active:scale-95 shadow-sm"
      >
        {isDownloading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#303030]" />
        ) : downloadSuccess ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <FileDown className="w-5 h-5 text-[#303030]" />
        )}
        <span>
          {isDownloading ? 'Downloading...' : downloadSuccess ? 'Downloaded' : 'Download as PDF'}
        </span>
      </button>

    </div>
  );
}
