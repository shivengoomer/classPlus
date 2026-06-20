// src/components/result/QuestionItem.tsx
'use client';

import React, { useState } from 'react';
import { Question } from '@/types/question';
import { saveToBank } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { Archive, Loader2, Check } from 'lucide-react';

interface QuestionItemProps {
  number: number;
  question: Question;
  subject?: string;
  grade?: string;
  sourceAssessmentId?: string;
}

export function QuestionItem({ 
  number, 
  question,
  subject,
  grade,
  sourceAssessmentId
}: QuestionItemProps) {
  const { addToast } = useToastStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveToBank = async () => {
    if (saved) return;
    setSaving(true);
    try {
      await saveToBank({
        questionText: question.text,
        type: question.type,
        options: question.options,
        correctAnswer: (question as any).correctAnswer || question.answer || '',
        subject: subject || 'Science',
        grade: grade || 'Class 8',
        difficulty: question.difficulty === 'easy' ? 'Easy' : question.difficulty === 'moderate' ? 'Medium' : 'Hard',
        tags: question.conceptTag ? [question.conceptTag] : [],
        bloomLevel: (question as any).bloomLevel || 'Remembering',
        sourceAssessmentId,
      });
      setSaved(true);
      addToast('Saved question to Item Bank!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to save question.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full text-left py-2 border-b border-slate-150/40 last:border-b-0">
      
      {/* Question Text Line */}
      <div className="flex items-start gap-3 w-full">
        <span className="text-slate-800 font-extrabold text-sm md:text-base flex-shrink-0 mt-0.5">
          {number}.
        </span>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="text-slate-800 text-sm md:text-base font-medium leading-relaxed flex-1">
            <span className={`inline-flex items-center text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mr-2 ${
              question.difficulty === 'easy' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : question.difficulty === 'moderate' 
                ? 'bg-amber-50 border-amber-100 text-amber-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              {question.difficulty || 'moderate'}
            </span>
            <span>{question.text}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            <button
              onClick={handleSaveToBank}
              disabled={saving || saved}
              className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none border-solid ${
                saved 
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-600' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {saving ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : saved ? (
                <Check className="w-2.5 h-2.5" />
              ) : (
                <Archive className="w-2.5 h-2.5" />
              )}
              <span>{saved ? 'Saved' : 'Save to Bank'}</span>
            </button>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
              {question.marks} Mark{question.marks > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Render Options for MCQs if available */}
      {question.options && question.options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-7 mt-1.5 w-full">
          {question.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <div key={idx} className="flex items-start gap-2 text-slate-700 text-xs md:text-sm font-semibold">
                <span className="text-slate-900 font-bold">{letter}.</span>
                <span className="leading-relaxed flex-1">{option}</span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
