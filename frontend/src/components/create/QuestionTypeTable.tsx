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
      {/* Table Header Labels (Hidden on Mobile) */}
      <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-veda-text-secondary uppercase tracking-wider px-1 pb-1 border-b border-gray-100">
        <span className="w-[60%]">Question Type</span>
        <span className="w-[20%] text-center pl-4">No. of Questions</span>
        <span className="w-[20%] text-center pl-6">Marks</span>
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

      {/* Add Button */}
      <div className="flex justify-start mt-1.5">
        <button
          type="button"
          onClick={onAddRow}
          className="flex items-center gap-1.5 text-sm font-semibold text-veda-orange hover:text-veda-orange-red transition-colors py-1 px-2 rounded-lg hover:bg-orange-50 -ml-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question Type</span>
        </button>
      </div>
    </div>
  );
}
