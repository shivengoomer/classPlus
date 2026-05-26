// src/components/create/QuestionTypeTable.tsx
'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { QuestionConfigRow } from '@/store/formStore';
import { QuestionTypeRow } from './QuestionTypeRow';
import { QuestionType } from '@/types/question';

interface QuestionTypeTableProps {
  rows: QuestionConfigRow[];
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onUpdateRow: (index: number, field: 'type' | 'count' | 'marks', value: QuestionType | number) => void;
}

export function QuestionTypeTable({
  rows,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}: QuestionTypeTableProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Table Header Labels */}
      <div className="hidden md:flex items-center justify-end w-full text-[14px] font-bold text-[#303030] font-sans pr-0 pb-1 border-b border-gray-150/50">
        <div className="w-[216px] flex justify-between">
          <span className="w-[100px] text-center">No. of Questions</span>
          <span className="w-[100px] text-center">Marks</span>
        </div>
      </div>

      {/* Table Rows list */}
      <div className="flex flex-col gap-3.5 mt-1">
        {rows.map((row, index) => (
          <QuestionTypeRow
            key={index}
            type={row.type}
            count={row.count}
            marks={row.marks}
            onUpdate={(field, value) => onUpdateRow(index, field, value)}
            onRemove={() => onRemoveRow(index)}
          />
        ))}
      </div>

      {/* Add Button matching Figma spec */}
      <div className="flex justify-start mt-2">
        <button
          type="button"
          onClick={onAddRow}
          className="flex items-center gap-3 text-[16px] font-bold text-[#303030] hover:opacity-85 active:scale-95 transition-all font-sans"
        >
          <div className="w-10 h-10 bg-[#181818] rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Plus className="w-5 h-5 stroke-[3]" />
          </div>
          <span>Add Question Type</span>
        </button>
      </div>
    </div>
  );
}
