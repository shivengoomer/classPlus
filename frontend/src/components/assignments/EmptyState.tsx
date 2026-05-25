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
      <div className="relative mb-6 flex items-center justify-center">
        <svg
          width="260"
          height="180"
          viewBox="0 0 260 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          {/* Curved swish decoration line */}
          <path d="M55 75C43 65 35 85 47 95C59 105 65 85 55 75Z" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

          {/* Document Sheet */}
          <rect x="90" y="35" width="70" height="96" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          {/* Header dark line block inside document */}
          <rect x="102" y="50" width="22" height="6" rx="1.5" fill="#1E293B" />
          {/* Horizontal body lines */}
          <rect x="102" y="65" width="46" height="4" rx="1" fill="#E5E7EB" />
          <rect x="102" y="77" width="46" height="4" rx="1" fill="#E5E7EB" />
          <rect x="102" y="89" width="46" height="4" rx="1" fill="#E5E7EB" />
          <rect x="102" y="101" width="30" height="4" rx="1" fill="#E5E7EB" />

          {/* Decorative Sparkle (Sparkle star) on bottom-left */}
          <path d="M100 145L102 150L107 152L102 154L100 159L98 154L93 152L98 150L100 145Z" fill="#1D4ED8" />

          {/* Top-Right Badge Container */}
          <rect x="170" y="45" width="36" height="24" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="2" />
          <circle cx="180" cy="57" r="3" fill="#A7F3D0" />
          <circle cx="193" cy="57" r="3" fill="#D1D5DB" />

          {/* Decorative blue dot on the right */}
          <circle cx="210" cy="120" r="4" fill="#1D4ED8" />

          {/* Magnifying Glass */}
          {/* Handle */}
          <line x1="178" y1="133" x2="200" y2="155" stroke="#C4B5FD" strokeWidth="6" strokeLinecap="round" />
          <line x1="178" y1="133" x2="200" y2="155" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
          {/* Lens Frame */}
          <circle cx="155" cy="105" r="28" fill="white" stroke="#C4B5FD" strokeWidth="4" />
          <circle cx="155" cy="105" r="28" fill="#F5F3FF" opacity="0.4" />
          {/* Red X */}
          <path d="M145 95L165 115" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
          <path d="M165 95L145 115" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
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
        icon={<PlusIcon className="w-4 h-4 text-white" />}
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
