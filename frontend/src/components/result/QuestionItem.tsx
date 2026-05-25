// src/components/result/QuestionItem.tsx
'use client';

import React from 'react';
import { Question } from '@/types/question';

interface QuestionItemProps {
  number: number;
  question: Question;
}

export function QuestionItem({ number, question }: QuestionItemProps) {
  // Format difficulty text
  const difficultyLabel = 
    question.difficulty === 'easy' ? '[Easy]' : 
    question.difficulty === 'moderate' ? '[Moderate]' : 
    '[Challenging]';

  return (
    <div className="flex flex-col gap-2 text-sm text-black leading-relaxed">
      
      {/* Question Text Line */}
      <div>
        <span className="font-semibold mr-1.5">{number}.</span>
        <span className="font-normal mr-1.5">{difficultyLabel}</span>
        <span className="font-normal">{question.text}</span>
        <span className="font-semibold ml-2">[{question.marks} Mark{question.marks > 1 ? 's' : ''}]</span>
      </div>

      {/* Render Options for MCQs if available */}
      {question.options && question.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-6 mt-1 text-black font-normal">
          {question.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-semibold">{letter}.</span>
                <span>{option}</span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
