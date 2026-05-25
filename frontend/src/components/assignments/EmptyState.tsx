// src/components/assignments/EmptyState.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PillButton } from '../shared/PillButton';

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Custom Inline SVG Illustration: Document + Magnifying Glass + Red X */}
      <div className="relative mb-6">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          {/* Document Sheet */}
          <rect x="25" y="15" width="55" height="75" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="3" />
          <line x1="37" y1="33" x2="68" y2="33" stroke="#F3F4F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="37" y1="45" x2="60" y2="45" stroke="#F3F4F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="37" y1="57" x2="52" y2="57" stroke="#F3F4F6" strokeWidth="3" strokeLinecap="round" />
          
          {/* Magnifying Glass */}
          <circle cx="70" cy="75" r="20" fill="white" stroke="#6B7280" strokeWidth="3" />
          <line x1="84" y1="89" x2="98" y2="103" stroke="#6B7280" strokeWidth="4" strokeLinecap="round" />
          
          {/* Red X inside Magnifying Glass */}
          <path d="M64 69L76 81" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
          <path d="M76 69L64 81" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="text-[18px] font-bold text-veda-text-primary mb-2">
        No assignments yet
      </h3>

      {/* Subtext */}
      <p className="text-[14px] text-veda-text-secondary leading-relaxed max-w-[420px] mb-6">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      {/* CTA Button */}
      <PillButton
        variant="primary"
        icon={<PlusIcon className="w-4 h-4" />}
        onClick={() => router.push('/create')}
      >
        Create Your First Assignment
      </PillButton>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
