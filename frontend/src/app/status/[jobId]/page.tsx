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
import { GenerationStepper } from '@/components/shared/GenerationStepper';

export default function JobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // Subscribe to the WebSocket socket updates
  useJobSocket(jobId);

  // Read job details from Zustand
  const { status, message, assignmentId, stage, sectionIndex, totalSections } = useJobStore();
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

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto px-4 py-8">
        
        {/* Granular progress stepper component */}
        <div className="w-full mb-6">
          <GenerationStepper
            currentStage={stage || (status === 'processing' ? 'generating' : (status as any))}
            currentMessage={message}
            sectionIndex={sectionIndex}
            totalSections={totalSections}
          />
        </div>

        {/* Failed Action Footer */}
        {status === 'failed' && (
          <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
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
          <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5 animate-pulse mt-4">
            <Sparkles className="w-4 h-4 text-veda-orange animate-pulse" />
            <span>Redirecting to paper view...</span>
          </p>
        )}

      </div>
    </AppShell>
  );
}
