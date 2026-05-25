// src/components/result/SectionBlock.tsx
'use client';

import React from 'react';
import { Section } from '@/types/question';
import { QuestionItem } from './QuestionItem';

interface SectionBlockProps {
  section: Section;
  questionNumberStart: number;
}

export function SectionBlock({ section, questionNumberStart }: SectionBlockProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 mb-2">
      
      {/* Centered Section Label */}
      <div className="text-center font-bold text-base tracking-wider text-black">
        {section.label}
      </div>

      {/* Title & Instructions */}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-sm font-bold text-black uppercase">
          {section.title}
        </h4>
        <p className="text-xs italic text-gray-700">
          {section.instruction}
        </p>
      </div>

      {/* Numbered Questions List */}
      <div className="flex flex-col gap-4 pl-1">
        {section.questions.map((q, index) => (
          <QuestionItem
            key={q.id}
            number={questionNumberStart + index}
            question={q}
          />
        ))}
      </div>

    </div>
  );
}
