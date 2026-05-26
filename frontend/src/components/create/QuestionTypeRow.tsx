// src/components/create/QuestionTypeRow.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
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
    <>
      {/* Desktop Row View */}
      <div className="hidden md:flex items-center justify-between w-full gap-4">
        {/* Left Side: Select Dropdown & Remove Button */}
        <div className="flex items-center gap-2 w-[443px] flex-shrink-0">
          <div 
            className="flex-1 h-[44px] px-4 bg-white rounded-full flex items-center justify-between relative"
            style={{ 
              outline: '1.25px #DADADA solid', 
              outlineOffset: '-1.25px' 
            }}
          >
            <select
              value={type}
              onChange={(e) => onUpdate('type', e.target.value as QuestionType)}
              className="w-full h-full bg-transparent text-[16px] font-medium text-[#303030] outline-none cursor-pointer appearance-none pr-10 font-sans"
            >
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.value} value={qt.value}>
                  {qt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-10 pointer-events-none text-black/40">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            {/* Delete Row Button integrated into dropdown area */}
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-3 w-5 h-5 flex items-center justify-center text-black/20 hover:text-black transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: No. of Questions & Marks Steppers */}
        <div className="w-[216px] flex justify-between flex-shrink-0">
          {/* No. of Questions Counter */}
          <div 
            className="w-[100px] h-[44px] px-2 bg-white rounded-full flex items-center justify-between"
            style={{ 
              outline: '1.25px #DADADA solid', 
              outlineOffset: '-1.25px' 
            }}
          >
            <button
              type="button"
              onClick={() => handleStep('count', false)}
              disabled={count <= 1}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100 disabled:opacity-30 transition-all text-[20px] font-light"
            >
              −
            </button>
            <span className="text-[16px] font-bold text-[#303030] font-sans">
              {count}
            </span>
            <button
              type="button"
              onClick={() => handleStep('count', true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100 transition-all text-[20px] font-light"
            >
              +
            </button>
          </div>

          {/* Marks Counter */}
          <div 
            className="w-[100px] h-[44px] px-2 bg-white rounded-full flex items-center justify-between"
            style={{ 
              outline: '1.25px #DADADA solid', 
              outlineOffset: '-1.25px' 
            }}
          >
            <button
              type="button"
              onClick={() => handleStep('marks', false)}
              disabled={marks <= 1}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100 disabled:opacity-30 transition-all text-[20px] font-light"
            >
              −
            </button>
            <span className="text-[16px] font-bold text-[#303030] font-sans">
              {marks}
            </span>
            <button
              type="button"
              onClick={() => handleStep('marks', true)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#5E5E5E] hover:bg-gray-100 transition-all text-[20px] font-light"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card Row View */}
      <div className="w-full p-4 bg-white border border-[#DADADA] rounded-[24px] flex flex-col gap-4 shadow-sm md:hidden">
        {/* Top Row: Dropdown Select & Remove Button */}
        <div className="flex items-center justify-between w-full h-[44px] px-4 bg-white rounded-full border border-[#DADADA] relative">
          <select
            value={type}
            onChange={(e) => onUpdate('type', e.target.value as QuestionType)}
            className="w-full h-full bg-transparent text-[14px] font-bold text-[#303030] outline-none cursor-pointer appearance-none pr-10 font-sans"
          >
            {QUESTION_TYPES.map((qt) => (
              <option key={qt.value} value={qt.value}>
                {qt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-10 pointer-events-none text-black/40">
            <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-3 w-6 h-6 rounded-full flex items-center justify-center text-black/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Row: Steppers */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[12px] font-bold text-[#303030] font-sans">
              Questions
            </span>
            <div className="w-full h-[40px] px-3 bg-white rounded-full border border-[#DADADA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleStep('count', false)}
                disabled={count <= 1}
                className="text-[20px] font-light text-[#5E5E5E] disabled:opacity-30"
              >
                −
              </button>
              <span className="text-[15px] font-bold text-[#303030] font-sans">
                {count}
              </span>
              <button
                type="button"
                onClick={() => handleStep('count', true)}
                className="text-[20px] font-light text-[#5E5E5E]"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <span className="text-[12px] font-bold text-[#303030] font-sans">
              Marks
            </span>
            <div className="w-full h-[40px] px-3 bg-white rounded-full border border-[#DADADA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleStep('marks', false)}
                disabled={marks <= 1}
                className="text-[20px] font-light text-[#5E5E5E] disabled:opacity-30"
              >
                −
              </button>
              <span className="text-[15px] font-bold text-[#303030] font-sans">
                {marks}
              </span>
              <button
                type="button"
                onClick={() => handleStep('marks', true)}
                className="text-[20px] font-light text-[#5E5E5E]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
