// src/components/create/DueDatePicker.tsx
'use client';

import React, { useRef } from 'react';

interface DueDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    try {
      dateInputRef.current?.showPicker();
    } catch {
      dateInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label 
        style={{
          color: '#303030',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          lineHeight: '140%',
          letterSpacing: '-0.64px',
        }}
      >
        Due Date
      </label>
      
      <div 
        className="relative flex items-center w-full bg-white rounded-full transition-all group"
        style={{ 
          height: '44px',
          outline: '1.25px #DADADA solid', 
          outlineOffset: '-1.25px' 
        }}
      >
        <input
          ref={dateInputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full pl-6 pr-12 bg-transparent text-[16px] font-medium text-[#303030] placeholder-black/40 outline-none cursor-pointer font-sans appearance-none"
        />
        
        {/* Calendar Icon Button */}
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute right-4 p-1 text-black/40 group-hover:text-black transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14V18M10 16H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
