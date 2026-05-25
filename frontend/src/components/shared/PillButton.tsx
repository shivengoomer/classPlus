// src/components/shared/PillButton.tsx
import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'gradient-border';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function PillButton({
  variant = 'primary',
  children,
  icon,
  className = '',
  ...props
}: PillButtonProps) {
  const baseStyles = 'px-6 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none';
  
  let variantStyles = '';

  if (variant === 'primary') {
    variantStyles = 'bg-veda-btn-primary text-white hover:bg-opacity-90 active:scale-95 shadow-sm';
  } else if (variant === 'outline') {
    variantStyles = 'border border-veda-card-border bg-white text-veda-text-primary hover:bg-gray-50 active:scale-95';
  } else if (variant === 'gradient-border') {
    // Gradient border trick:
    // Uses linear-gradient to fill black back, and border-transparent + linear-gradient border box.
    // Plus a small scale animation on hover.
    variantStyles = 'relative text-white font-medium hover:scale-[1.02] active:scale-95 shadow-md bg-transparent';
  }

  if (variant === 'gradient-border') {
    return (
      <button
        className={`${baseStyles} ${variantStyles} ${className}`}
        style={{
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(#303030, #303030), linear-gradient(135deg, #FF6B00, #FF3D00)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '0 4px 14px rgba(255, 107, 0, 0.25)',
        }}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
