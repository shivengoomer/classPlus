// src/components/result/AnswerKey.tsx
'use client';

import React from 'react';

interface AnswerKeyProps {
  answers: { questionId: string; answer: string }[];
  questionMapping: Record<string, number>; // maps questionId to its global display index number
}

export function AnswerKey({ answers, questionMapping }: AnswerKeyProps) {
  if (!answers || answers.length === 0) return null;

  return (
    <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-8">
      <h3 className="text-base font-bold text-black mb-4 uppercase tracking-wider">
        Answer Key
      </h3>

      <div className="flex flex-col gap-3 pl-1 text-sm text-gray-800 leading-relaxed font-normal">
        {answers.map((item, idx) => {
          const number = questionMapping[item.questionId] || (idx + 1);
          return (
            <div key={item.questionId} className="flex gap-2">
              <span className="font-semibold text-black">{number}.</span>
              <p className="flex-1">{item.answer}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
