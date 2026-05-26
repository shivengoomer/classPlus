// src/app/status/[jobId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useJobStore } from '@/store/jobStore';
import { useJobSocket } from '@/hooks/useJobSocket';
import { regenerateAssignment } from '@/lib/api';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { PillButton } from '@/components/shared/PillButton';
import { useToastStore } from '@/store/toastStore';

export default function JobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // Subscribe to the WebSocket socket updates
  useJobSocket(jobId);

  // Read job details from Zustand
  const { status, progress, message, assignmentId } = useJobStore();
  const [retrying, setRetrying] = useState(false);
  const { addToast } = useToastStore();

  // Auto-redirect to the result page on 'done'
  useEffect(() => {
    if (status === 'done' && assignmentId) {
      const timeout = setTimeout(() => {
        router.push(`/result/${assignmentId}`);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [status, assignmentId, router]);

  // Retry logic
  const handleRetry = async () => {
    if (!assignmentId) {
      router.push('/create');
      return;
    }
    
    setRetrying(true);
    try {
      const res = await regenerateAssignment(assignmentId);
      router.push(`/status/${res.jobId}`);
    } catch (e) {
      console.error(e);
      addToast('Failed to restart generation. Redirecting to create form.', 'error');
      router.push('/create');
    } finally {
      setRetrying(false);
    }
  };

  // Status mapping to user-friendly titles
  const statusTitles = {
    idle: 'Preparing generation...',
    queued: 'Queued in pipeline',
    processing: 'Generating your question paper...',
    done: 'Question paper generated!',
    failed: 'Generation failed'
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
        
        {/* Animated Visual Box */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          {/* Progress Circle Border */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-gray-200"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-veda-orange transition-all duration-300"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Icon or Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {status === 'failed' ? (
              <AlertCircle className="w-10 h-10 text-veda-orange-red" />
            ) : status === 'done' ? (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-veda-text-primary">
                  {progress}%
                </span>
                <span className="text-[10px] text-veda-text-secondary uppercase tracking-wider font-semibold animate-pulse">
                  AI Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <h3 className="text-lg font-bold text-veda-text-primary mb-2">
          {statusTitles[status] || 'Processing...'}
        </h3>
        
        <p className="text-sm text-veda-text-secondary min-h-[40px] leading-relaxed mb-8 px-4">
          {message || 'Connecting to generation queue...'}
        </p>

        {/* Failed Action Footer */}
        {status === 'failed' && (
          <div className="flex flex-col gap-2 w-full">
            <PillButton
              variant="primary"
              disabled={retrying}
              onClick={handleRetry}
              className="w-full justify-center"
            >
              {retrying ? 'Retrying...' : 'Retry Generation'}
            </PillButton>
            
            <button
              onClick={() => router.push('/create')}
              className="text-xs font-semibold text-veda-text-secondary hover:text-veda-text-primary py-1.5 transition-colors"
            >
              Go Back to Form
            </button>
          </div>
        )}

        {/* Done Action Redirect Info */}
        {status === 'done' && (
          <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-4 h-4 text-veda-orange" />
            <span>Redirecting to paper view...</span>
          </p>
        )}

      </div>
    </AppShell>
  );
}
