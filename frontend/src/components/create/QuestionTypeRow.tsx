// src/components/create/QuestionTypeRow.tsx
'use client';

import React, { useState } from 'react';
import { X, Wand2, Loader2 } from 'lucide-react';
import { QuestionType } from '@/types/question';
import { generateRubric } from '@/lib/api';
import { useFormStore } from '@/store/formStore';
import { useToastStore } from '@/store/toastStore';

interface QuestionTypeRowProps {
  type: QuestionType;
  count: number;
  marks: number;
  rubric?: { label: string; marks: number; description: string }[];
  onUpdate: (field: 'type' | 'count' | 'marks' | 'rubric', value: any) => void;
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
  rubric,
  onUpdate,
  onRemove
}: QuestionTypeRowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToastStore();

  // Access the parent form state for subject & grade context to give AI better prompting details
  const subject = useFormStore((state) => state.subject);
  const grade = useFormStore((state) => state.grade);

  // Increment/Decrement helper
  const handleStep = (field: 'count' | 'marks', increment: boolean) => {
    const currentValue = field === 'count' ? count : marks;
    const newValue = increment ? currentValue + 1 : currentValue - 1;
    if (newValue >= 1) {
      onUpdate(field, newValue);
    }
  };

  const [isWandModalOpen, setIsWandModalOpen] = useState(false);
  const [wandInput, setWandInput] = useState('');

  const handleWandClick = () => {
    setWandInput('');
    setIsWandModalOpen(true);
  };

  const handleGenerateFromWand = async () => {
    if (!wandInput.trim()) return;
    setIsWandModalOpen(false);
    setIsGenerating(true);
    try {
      addToast('Generating rubric with AI...', 'success');
      const response = await generateRubric(wandInput, marks, subject || undefined, grade || undefined);
      onUpdate('rubric', response);
      addToast('Rubric generated successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to generate rubric. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateCriterion = (cIdx: number, field: string, value: any) => {
    const updated = [...(rubric || [])];
    updated[cIdx] = { ...updated[cIdx], [field]: value };
    onUpdate('rubric', updated);
  };

  const handleDeleteCriterion = (cIdx: number) => {
    const updated = (rubric || []).filter((_, i) => i !== cIdx);
    onUpdate('rubric', updated.length > 0 ? updated : undefined);
  };

  const handleAddCriterion = () => {
    const updated = [...(rubric || []), { label: 'New Criterion', marks: 1, description: 'Demonstrate...' }];
    onUpdate('rubric', updated);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full bg-white/50 border border-gray-150/40 rounded-[28px] p-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Desktop Row View */}
      <div className="hidden md:flex items-center justify-between w-full gap-4">
        {/* Left Side: Select Dropdown, Remove & Wand Button */}
        <div className="flex-1 flex items-center gap-3.5 min-w-[200px]">
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
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

          {/* Wand Icon for Rubric Auto-Builder */}
          {['short', 'long'].includes(type) && (
            <button
              type="button"
              onClick={handleWandClick}
              disabled={isGenerating}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-purple-50 text-purple-650 hover:bg-purple-100 disabled:opacity-50 transition-all border border-purple-200/50 flex-shrink-0 active:scale-95 shadow-sm"
              title="Auto-generate rubric with AI"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </button>
          )}
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
      <div className="w-full flex flex-col gap-4 md:hidden">
        {/* Top Row: Dropdown Select & Remove Button & Wand */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 flex items-center justify-between h-[44px] px-4 bg-white rounded-full border border-[#DADADA] relative">
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
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

          {['short', 'long'].includes(type) && (
            <button
              type="button"
              onClick={handleWandClick}
              disabled={isGenerating}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-purple-50 text-purple-650 hover:bg-purple-100 border border-purple-200/50 flex-shrink-0 active:scale-95 shadow-sm"
              title="Auto-generate rubric with AI"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </button>
          )}
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

      {/* Rubric Auto-Builder Inline Table Editor */}
      {rubric && rubric.length > 0 && (
        <div className="w-full mt-2 pl-4 border-l-2 border-purple-400 py-1 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-purple-700 tracking-wide uppercase font-sans">
              Marking Rubric ({rubric.reduce((sum, c) => sum + c.marks, 0)} / {marks} Marks)
            </span>
            <button
              type="button"
              onClick={() => onUpdate('rubric', undefined)}
              className="text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors font-sans"
            >
              Clear Rubric
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-gray-50/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100/80 border-b border-gray-200 text-[12px] font-bold text-[#303030]">
                  <th className="px-4 py-2 font-sans w-1/4">Criterion</th>
                  <th className="px-4 py-2 font-sans w-20 text-center">Marks</th>
                  <th className="px-4 py-2 font-sans">Description</th>
                  <th className="px-2 py-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250/30 text-[13px]">
                {rubric.map((criterion, cIdx) => (
                  <tr key={cIdx} className="hover:bg-white transition-colors">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={criterion.label}
                        onChange={(e) => handleUpdateCriterion(cIdx, 'label', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-purple-400 rounded outline-none font-semibold text-[#303030] font-sans"
                        placeholder="Criterion"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        value={criterion.marks}
                        onChange={(e) => handleUpdateCriterion(cIdx, 'marks', parseInt(e.target.value) || 0)}
                        className="w-12 px-1 py-1 text-center bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-purple-400 rounded outline-none font-bold text-[#303030] font-sans"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={criterion.description}
                        onChange={(e) => handleUpdateCriterion(cIdx, 'description', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-purple-400 rounded outline-none text-[#5E5E5E] font-sans"
                        placeholder="Criteria description"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteCriterion(cIdx)}
                        className="text-red-400 hover:text-red-650 transition-colors text-[16px]"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleAddCriterion}
              className="text-[12px] font-bold text-purple-600 hover:text-purple-800 transition-colors font-sans"
            >
              + Add Criterion
            </button>
          </div>
          {rubric.reduce((sum, c) => sum + c.marks, 0) !== marks && (
            <p className="mt-1.5 text-[11px] text-amber-600 font-medium font-sans">
              ⚠️ Warning: Sum of criteria marks ({rubric.reduce((sum, c) => sum + c.marks, 0)}) does not equal total marks ({marks}).
            </p>
          )}
        </div>
      )}
      {/* Rubric Generation Custom Prompt Modal */}
      {isWandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsWandModalOpen(false)}
          />
          {/* Modal Box */}
          <div className="relative bg-white border border-gray-200/80 rounded-[32px] w-full max-w-[450px] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Wand2 className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-[18px] font-bold text-[#303030] font-sans">Generate Rubric</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsWandModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[13px] text-gray-500 font-sans mb-3.5 leading-relaxed">
              Enter a brief description of what this {type === 'short' ? 'short-answer' : 'long-answer'} question will test to align the marking criteria:
            </p>
            
            <textarea
              className="w-full p-4 text-[14px] text-[#303030] bg-gray-50 border border-gray-200 rounded-[20px] outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 font-sans resize-none h-24 mb-4 transition-all"
              placeholder="e.g. Describe the carbon cycle and the role of photosynthesis and respiration..."
              value={wandInput}
              onChange={(e) => setWandInput(e.target.value)}
              autoFocus
            />
            
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsWandModalOpen(false)}
                className="px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-black transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateFromWand}
                disabled={!wandInput.trim() || isGenerating}
                className="px-5 py-2 text-[14px] font-bold text-white bg-[#181818] hover:bg-black disabled:opacity-50 rounded-full transition-all font-sans active:scale-95 shadow-md flex items-center gap-1.5"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
