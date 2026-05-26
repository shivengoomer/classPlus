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
      style={{
        display: 'flex',
        height: '1465px',
        padding: '32px',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        alignSelf: 'stretch',
        borderRadius: '32px',
        background: '#FFF',
      }}
      className="bg-white shadow-sm text-[#303030] font-sans relative overflow-y-auto no-scrollbar"
    >
      
      {/* Figma Title Header block */}
      <div className="flex flex-col items-center text-center gap-1.5 pb-4">
        <h2 className="text-[#303030] text-[28px] md:text-[32px] font-bold leading-tight font-sans">
          {result.schoolName || 'Delhi Public School, Sector-4, Bokaro'}
        </h2>
        <div className="text-[20px] md:text-[24px] text-[#303030] font-semibold mt-1 font-sans">
          Subject: {result.subject} &nbsp;|&nbsp; Class: {result.grade}
        </div>
      </div>

      {/* Info Row: Time & Marks */}
      <div className="flex items-center justify-between text-[16px] md:text-[18px] text-[#303030] font-semibold border-b border-gray-200 pb-3 w-full">
        <span>Time Allowed: {result.timeAllowed || '45 minutes'}</span>
        <span>Maximum Marks: {result.totalMarks || assignment.totalMarks}</span>
      </div>

      {/* General Instruction Box */}
      <div className="text-[16px] md:text-[18px] text-[#303030] font-semibold pl-1 py-0.5 w-full">
        All questions are compulsory unless stated otherwise.
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
