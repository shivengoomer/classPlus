// src/components/create/DueDatePicker.tsx
'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface DueDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
}

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-veda-text-primary">
        Due Date
      </label>
      
      <div className="relative flex items-center w-full bg-white border border-veda-card-border rounded-xl focus-within:border-gray-400 transition-all shadow-sm">
        <input
          ref={dateInputRef}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-4 pr-12 py-3 bg-transparent text-sm text-veda-text-primary outline-none cursor-pointer"
        />
        
        {/* Calendar Icon Button */}
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute right-3 p-1.5 text-veda-text-secondary hover:text-veda-orange transition-colors"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
