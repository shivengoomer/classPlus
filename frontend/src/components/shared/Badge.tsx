// src/components/shared/Badge.tsx
import React from 'react';

interface BadgeProps {
  count?: number;
  dot?: boolean;
  className?: string;
}

export function Badge({ count, dot = false, className = '' }: BadgeProps) {
  if (dot) {
    return (
      <span className={`inline-block w-2.5 h-2.5 bg-veda-orange-red rounded-full ring-2 ring-white animate-pulse ${className}`} />
    );
  }

  if (count === undefined || count <= 0) return null;

  return (
    <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-semibold text-white bg-veda-orange rounded-full leading-none ${className}`}>
      {count}
    </span>
  );
}
