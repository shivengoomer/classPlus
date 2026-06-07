// src/components/result/ExamPaper.tsx
'use client';

import React, { useMemo } from 'react';
import { Assignment } from '@/types/assignment';
import { StudentInfoBlock } from './StudentInfoBlock';
import { SectionBlock } from './SectionBlock';
import { AnswerKey } from './AnswerKey';
import { useProfileStore } from '@/store/profileStore';

interface ExamPaperProps {
  assignment: Assignment;
}

export function ExamPaper({ assignment }: ExamPaperProps) {
  const result = assignment.result;
  const { profile } = useProfileStore();

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

  const displaySchoolName = useMemo(() => {
    if (profile?.schoolName) {
      let name = profile.schoolName;
      if (profile.schoolBranch) {
        name += `, ${profile.schoolBranch}`;
      }
      return name;
    }
    return result?.schoolName || 'Delhi Public School, Sector-4, Bokaro';
  }, [profile, result?.schoolName]);

  if (!result) return null;

  // Keep track of question number offsets for sections
  let currentStartNum = 1;

  return (
    <div 
      className="flex flex-col items-center self-stretch bg-white border border-slate-200 shadow-md hover:shadow-xl text-slate-800 font-sans relative overflow-y-auto no-scrollbar h-auto md:min-h-[1400px] p-6 md:p-12 gap-6 rounded-3xl w-full transition-all duration-305"
    >
      
      {/* Figma Title Header block */}
      <div className="flex flex-col items-center text-center gap-2 pb-6 border-b-2 border-slate-800 w-full">
        <h2 className="text-slate-900 text-2xl md:text-3xl font-black tracking-tight uppercase">
          {displaySchoolName}
        </h2>
        <div className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
          Subject: {result.subject} &nbsp;•&nbsp; Class: {result.grade}
        </div>
      </div>

      {/* Info Row: Time & Marks */}
      <div className="flex items-center justify-between text-xs md:text-sm text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 pb-3 w-full">
        <span>Time Allowed: {result.timeAllowed || '45 minutes'}</span>
        <span>Maximum Marks: {result.totalMarks || assignment.totalMarks}</span>
      </div>

      {/* General Instruction Box */}
      <div className="text-xs md:text-sm text-slate-600 font-bold w-full uppercase tracking-wider bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl">
        General Instructions: All questions are compulsory. Keep answers clear and legible.
      </div>

      {/* Student Info Block */}
      <StudentInfoBlock grade={result.grade} />

      {/* Exam Sections */}
      <div className="flex flex-col gap-6 mt-4 w-full">
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

      {/* End of Question Paper Footer */}
      <div className="text-center font-bold text-xs uppercase tracking-widest text-gray-400 mt-12 pt-4 border-t border-gray-100 w-full">
        - End of Question Paper -
      </div>

      {/* Answer Key */}
      <AnswerKey 
        answers={result.answerKey} 
        questionMapping={questionMapping} 
      />

    </div>
  );
}
