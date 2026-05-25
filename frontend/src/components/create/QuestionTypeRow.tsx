// src/components/create/QuestionTypeRow.tsx
'use client';

import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { QuestionType } from '@/types/question';

interface QuestionTypeRowProps {
  type: QuestionType;
  count: number;
  marks: number;
  onUpdate: (field: 'type' | 'count' | 'marks', value: QuestionType | number) => void;
  onRemove: () => void;
}

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Long Questions' },
  { value: 'truefalse', label: 'True or False' },
  { value: 'fillblank', label: 'Fill in the Blanks' }
];

export function QuestionTypeRow({
  type,
  count,
  marks,
  onUpdate,
  onRemove
}: QuestionTypeRowProps) {
  
  // Increment/Decrement helper
  const handleStep = (field: 'count' | 'marks', increment: boolean) => {
    const currentValue = field === 'count' ? count : marks;
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    if (newValue >= 1) {
      onUpdate(field, newValue);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full border-b border-gray-100 pb-3 sm:pb-0 sm:border-none">
      
      {/* Dropdown + Remove */}
      <div className="flex items-center gap-2 w-full sm:w-[60%]">
        
        {/* Dropdown */}
        <select
          value={type}
          onChange={(e) => onUpdate('type', e.target.value as QuestionType)}
          className="flex-1 bg-white border border-veda-card-border rounded-xl px-4 py-2.5 text-sm text-veda-text-primary outline-none focus:border-gray-400 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: '36px'
          }}
        >
          {QUESTION_TYPES.map((qt) => (
            <option key={qt.value} value={qt.value}>
              {qt.label}
            </option>
          ))}
        </select>

        {/* Remove Row Button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-veda-text-secondary hover:text-veda-orange-red hover:bg-red-50 rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Steppers */}
      <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-[40%]">
        
        {/* Counter: No. of Questions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleStep('count', false)}
            disabled={count <= 1}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center text-veda-text-primary disabled:opacity-50 disabled:pointer-events-none"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-8 text-center text-sm font-semibold text-veda-text-primary">
            {count}
          </span>
          
          <button
            type="button"
            onClick={() => handleStep('count', true)}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center text-veda-text-primary"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Counter: Marks */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleStep('marks', false)}
            disabled={marks <= 1}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center text-veda-text-primary disabled:opacity-50 disabled:pointer-events-none"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-8 text-center text-sm font-semibold text-veda-text-primary">
            {marks}
          </span>
          
          <button
            type="button"
            onClick={() => handleStep('marks', true)}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center text-veda-text-primary"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
