// src/components/result/ExamPaper.tsx
'use client';

import React, { useMemo } from 'react';
import { Assignment } from '@/types/assignment';
import { StudentInfoBlock } from './StudentInfoBlock';
import { SectionBlock } from './SectionBlock';
import { AnswerKey } from './AnswerKey';

interface ExamPaperProps {
  assignment: Assignment;
}

export function ExamPaper({ assignment }: ExamPaperProps) {
  const result = assignment.result;

  // Build a map of questionId to global display numbers (1, 2, 3...)
  const questionMapping = useMemo(() => {
    if (!result) return {};
    const mapping: Record<string, number> = {};
    let globalIndex = 1;
    result.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        mapping[q.id] = globalIndex++;
      });
    });
    return mapping;
  }, [result]);

  if (!result) return null;

  // Keep track of question number offsets for sections
  let currentStartNum = 1;

  return (
    <div 
      className="bg-white border border-veda-card-border rounded-xl shadow-sm p-6 md:p-12 w-full max-w-4xl mx-auto flex flex-col gap-6 text-black font-sans relative"
      style={{ minHeight: '297mm' }} // Simulates A4 height proportion
    >
      
      {/* Centered Exam Header */}
      <div className="flex flex-col items-center text-center gap-1 border-b-2 border-black pb-4">
        <h2 className="text-[22px] font-bold tracking-tight text-black leading-tight uppercase">
          {result.schoolName || 'Delhi Public School, Sector-4, Bokaro'}
        </h2>
        <div className="flex flex-col sm:flex-row items-center sm:gap-6 text-[14px] text-gray-800 font-medium mt-1">
          <span>Subject: {result.subject}</span>
          <span className="hidden sm:inline">•</span>
          <span>Class: {result.grade} Grade</span>
        </div>
      </div>

      {/* Info Row: Time & Marks */}
      <div className="flex items-center justify-between text-sm text-black font-bold uppercase tracking-wider border-b border-gray-200 pb-2">
        <span>Time Allowed: {result.timeAllowed || '45 minutes'}</span>
        <span>Maximum Marks: {result.totalMarks || assignment.totalMarks}</span>
      </div>

      {/* General Instruction Box */}
      <div className="text-xs text-gray-800 border-l-4 border-gray-400 pl-3.5 py-1 my-1">
        <span className="font-bold uppercase block mb-0.5">General Instructions:</span>
        <p className="italic">All questions are compulsory unless stated otherwise. Write clearly and show workings where applicable.</p>
      </div>

      {/* Student Info Block */}
      <StudentInfoBlock grade={result.grade} />

      {/* Exam Sections */}
      <div className="flex flex-col gap-6 mt-4">
        {result.sections.map((section) => {
          const startNum = currentStartNum;
          // Increment offset by number of questions in current section
          currentStartNum += section.questions.length;
          
          return (
            <SectionBlock
              key={section.id}
              section={section}
              questionNumberStart={startNum}
            />
          );
        })}
      </div>

      {/* Answer Key */}
      <AnswerKey 
        answers={result.answerKey} 
        questionMapping={questionMapping} 
      />

      {/* End of Question Paper Footer */}
      <div className="text-center font-bold text-xs uppercase tracking-widest text-gray-400 mt-12 pt-4 border-t border-gray-100">
        - End of Question Paper -
      </div>

    </div>
  );
}
