// src/components/create/CreateAssignmentForm.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { Assignment } from '@/types/assignment';
import { FileUploadZone } from './FileUploadZone';
import { DueDatePicker } from './DueDatePicker';
import { QuestionTypeTable } from './QuestionTypeTable';
import { ProgressBar } from '../shared/ProgressBar';
import { PillButton } from '../shared/PillButton';
import { validateAssignmentForm, ValidationError } from '@/lib/validators';
import { createAssignment } from '@/lib/api';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export function CreateAssignmentForm() {
  const router = useRouter();
  const addAssignment = useAssignmentStore((state) => state.addAssignment);
  
  // Zustand form state
  const {
    title,
    subject,
    grade,
    file,
    dueDate,
    questionRows,
    additionalInstructions,
    setTitle,
    setSubject,
    setGrade,
    setFile,
    setDueDate,
    addRow,
    removeRow,
    updateRow,
    setInstructions,
    reset
  } = useFormStore();

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mobile step tracker (Step 1: Basic Info & File; Step 2: Questions & Instructions)
  const [mobileStep, setMobileStep] = useState(1);

  // Calculate form completion progress bar percentage
  const progressPercent = useMemo(() => {
    let score = 0;
    if (title.trim() !== '') score += 20;
    if (subject.trim() !== '') score += 20;
    if (grade.trim() !== '') score += 20;
    if (dueDate !== '') score += 20;
    if (file !== null || additionalInstructions.trim() !== '') score += 20;
    return score;
  }, [title, subject, grade, dueDate, file, additionalInstructions]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const payload = {
      title,
      subject,
      grade,
      dueDate,
      questionRows,
      additionalInstructions,
      file
    };

    const validationErrors = validateAssignmentForm(payload);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // If there are errors in basic details and we are on mobile step 2, take them back to step 1
      const basicFields = ['title', 'subject', 'grade', 'dueDate'];
      const hasBasicError = validationErrors.some(err => basicFields.includes(err.field));
      if (hasBasicError && mobileStep === 2) {
        setMobileStep(1);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAssignment(payload);
      
      // If in simulated offline mode, it adds the pending item directly to assignments store
      if (result.jobId.startsWith('job-')) {
        // We'll read it from localStorage to sync the local Zustand assignment store
        const saved = localStorage.getItem('veda_assignments');
        if (saved) {
          const list: Assignment[] = JSON.parse(saved);
          const pendingItem = list.find((a) => a._id === result.assignmentId);
          if (pendingItem) {
            addAssignment(pendingItem);
          }
        }
      }

      // Reset form on success
      reset();
      
      // Redirect to generation status page
      router.push(`/status/${result.jobId}`);
    } catch (err) {
      console.error(err);
      alert('Error initiating assignment creation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorForField = (field: string) => {
    return errors.find(err => err.field === field)?.message;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[20px] font-bold text-veda-text-primary">
          ● Create Assignment
        </h2>
        <p className="text-[13px] text-veda-text-secondary">
          Set up a new assignment for your students.
        </p>
      </div>

      {/* Progress Bar (Thin, full width, dark, right below page header) */}
      <div className="w-full">
        <ProgressBar progress={progressPercent} className="h-1 bg-gray-200" />
      </div>

      {/* Form Container */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white border border-veda-card-border rounded-xl shadow-sm p-6 md:p-8 flex flex-col gap-6"
      >
        
        {/* Validation Errors Header Alert */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-veda-orange-red font-medium">
            Please correct the errors in the form before generating.
          </div>
        )}

        {/* --- STEP 1: Basic Info & File (Visible always on Desktop, Step 1 on Mobile) --- */}
        <div className={`${mobileStep === 1 ? 'flex' : 'hidden'} md:flex flex-col gap-6`}>
          
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-veda-text-primary">
              Assignment Details
            </h3>
            <p className="text-xs text-veda-text-secondary">
              Basic information about your assignment
            </p>
          </div>

          {/* Title Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-veda-text-primary">
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 text-sm bg-white border rounded-xl outline-none focus:border-gray-400 transition-all ${
                getErrorForField('title') ? 'border-veda-orange-red' : 'border-veda-card-border'
              }`}
            />
            {getErrorForField('title') && (
              <span className="text-xs text-veda-orange-red">{getErrorForField('title')}</span>
            )}
          </div>

          {/* Subject & Grade Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-veda-text-primary">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-4 py-3 text-sm bg-white border rounded-xl outline-none focus:border-gray-400 transition-all ${
                  getErrorForField('subject') ? 'border-veda-orange-red' : 'border-veda-card-border'
                }`}
              />
              {getErrorForField('subject') && (
                <span className="text-xs text-veda-orange-red">{getErrorForField('subject')}</span>
              )}
            </div>

            {/* Class/Grade */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-veda-text-primary">
                Class / Grade
              </label>
              <input
                type="text"
                placeholder="e.g. 8th"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`w-full px-4 py-3 text-sm bg-white border rounded-xl outline-none focus:border-gray-400 transition-all ${
                  getErrorForField('grade') ? 'border-veda-orange-red' : 'border-veda-card-border'
                }`}
              />
              {getErrorForField('grade') && (
                <span className="text-xs text-veda-orange-red">{getErrorForField('grade')}</span>
              )}
            </div>
          </div>

          {/* File Upload Zone */}
          <FileUploadZone 
            selectedFile={file} 
            onFileSelect={setFile} 
          />

          {/* Due Date Picker */}
          <DueDatePicker 
            value={dueDate} 
            onChange={setDueDate} 
          />
          {getErrorForField('dueDate') && (
            <span className="text-xs text-veda-orange-red -mt-4">{getErrorForField('dueDate')}</span>
          )}

        </div>

        {/* --- STEP 2: Questions & Instructions (Visible always on Desktop, Step 2 on Mobile) --- */}
        <div className={`${mobileStep === 2 ? 'flex' : 'hidden'} md:flex flex-col gap-6`}>
          
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-veda-text-primary">
              Question Configuration
            </h3>
            <p className="text-xs text-veda-text-secondary">
              Configure types, question count, and marks per question
            </p>
          </div>

          {/* Question Type Table */}
          <QuestionTypeTable
            rows={questionRows}
            onAddRow={addRow}
            onRemoveRow={removeRow}
            onUpdateRow={updateRow}
          />
          {getErrorForField('questionRows') && (
            <span className="text-xs text-veda-orange-red">{getErrorForField('questionRows')}</span>
          )}

          {/* Additional Instructions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-veda-text-primary">
                Additional Instructions
              </label>
              <span className="text-xs text-veda-text-hint">
                {additionalInstructions.length}/500 chars
              </span>
            </div>
            <textarea
              placeholder="Provide specific guidelines, e.g. Focus on electric current chemical reactions, exclude solar cells."
              rows={4}
              maxLength={500}
              value={additionalInstructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-veda-card-border rounded-xl outline-none focus:border-gray-400 transition-all resize-none"
            />
          </div>

        </div>

        {/* --- FOOTER NAVIGATION / SUBMIT ACTIONS --- */}
        
        {/* Mobile View Navigation Buttons (Step 1 vs Step 2) */}
        <div className="flex md:hidden items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-2">
          {mobileStep === 1 ? (
            <>
              <button
                type="button"
                onClick={() => router.push('/assignments')}
                className="px-5 py-2 text-sm font-semibold text-veda-text-secondary hover:text-veda-text-primary transition-all"
              >
                Cancel
              </button>
              <PillButton
                type="button"
                variant="primary"
                onClick={() => setMobileStep(2)}
                icon={<ArrowRight className="w-4 h-4" />}
                className="flex-row-reverse"
              >
                Next
              </PillButton>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMobileStep(1)}
                className="flex items-center gap-1 px-5 py-2 text-sm font-semibold text-veda-text-secondary hover:text-veda-text-primary transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <PillButton
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                icon={<Sparkles className="w-4 h-4 text-veda-orange" />}
              >
                {isSubmitting ? 'Generating...' : 'Generate'}
              </PillButton>
            </>
          )}
        </div>

        {/* Desktop View Buttons (Right Aligned) */}
        <div className="hidden md:flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-2">
          <button
            type="button"
            onClick={() => router.push('/assignments')}
            className="px-5 py-2.5 text-sm font-semibold text-veda-text-secondary hover:text-veda-text-primary rounded-full transition-all"
          >
            Cancel
          </button>
          
          <PillButton
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            icon={<Sparkles className="w-4 h-4 text-veda-orange animate-pulse" />}
          >
            {isSubmitting ? 'Generating Question Paper...' : 'Generate Question Paper →'}
          </PillButton>
        </div>

      </form>
    </div>
  );
}
