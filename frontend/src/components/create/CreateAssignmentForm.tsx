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
import { validateAssignmentForm, ValidationError } from '@/lib/validators';
import { createAssignment } from '@/lib/api';
import { Sparkles, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { TemplateModal } from './TemplateModal';
import { useTemplateStore } from '@/store/templateStore';
import { Template } from '@/types/group';

export function CreateAssignmentForm() {
  const router = useRouter();
  const addAssignment = useAssignmentStore((state) => state.addAssignment);
  const { addToast } = useToastStore();
  const saveTemplate = useTemplateStore((state) => state.saveTemplate);

  // Template states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Validation errors modal state
  const [isValidationErrorModalOpen, setIsValidationErrorModalOpen] = useState(false);

  // Save Template popup modal state
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [tempTemplateName, setTempTemplateName] = useState('');
  const [tempTemplateDescription, setTempTemplateDescription] = useState('');

  // Zustand form state
  const {
    title,
    subject,
    grade,
    file,
    fileUrl,
    dueDate,
    questionRows,
    additionalInstructions,
    setTitle,
    setSubject,
    setGrade,
    setFile,
    setFileUrl,
    setDueDate,
    addRow,
    removeRow,
    updateRow,
    setInstructions,
    reset,
    setQuestionRows
  } = useFormStore();

  const handleSelectTemplate = (template: Template) => {
    setTitle(template.name);
    if (template.subject) setSubject(template.subject);
    if (template.grade) setGrade(template.grade);
    if (template.additionalInstructions) setInstructions(template.additionalInstructions);
    
    if (template.blueprint?.sections) {
      setQuestionRows(
        template.blueprint.sections.map((sec) => ({
          type: sec.type as any,
          count: sec.count,
          marks: sec.marks,
        }))
      );
    }
    
    setIsTemplateModalOpen(false);
    addToast(`Loaded blueprint template: ${template.name}`, 'success');
  };

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
    if (file !== null || fileUrl !== null || additionalInstructions.trim() !== '') score += 20;
    return score;
  }, [title, subject, grade, dueDate, file, fileUrl, additionalInstructions]);

  // Question calculations from current rows
  const totalQuestions = useMemo(() => {
    return questionRows.reduce((acc, row) => acc + row.count, 0);
  }, [questionRows]);

  const totalMarks = useMemo(() => {
    return questionRows.reduce((acc, row) => acc + (row.count * row.marks), 0);
  }, [questionRows]);

  // Form submission handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setErrors([]);

    const payload = {
      title,
      subject,
      grade,
      dueDate,
      questionRows,
      additionalInstructions,
      file,
      fileUrl: fileUrl || undefined,
    };

    const validationErrors = validateAssignmentForm(payload);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsValidationErrorModalOpen(true);
      addToast('Form validation failed. Please resolve all errors.', 'error');
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
      if (saveAsTemplate) {
        if (!templateName.trim()) {
          setTempTemplateName('');
          setTempTemplateDescription('');
          setIsSaveTemplateModalOpen(true);
          setIsSubmitting(false);
          addToast('Please enter a template name', 'error');
          return;
        }
        await saveTemplate({
          name: templateName,
          description: templateDescription || `Custom template for ${subject}`,
          subject,
          grade,
          additionalInstructions,
          blueprint: {
            sections: questionRows.map((r) => ({
              type: r.type,
              count: r.count,
              marks: r.marks,
            })),
          },
        });
      }

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
      addToast('Error initiating assignment creation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean, standard mobile onClick handlers allowing normal Next.js event propagation
  const handleMobileNext = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMobileStep(2);
    window.scrollTo(0, 0);
  };

  const handleMobileCancel = () => {
    router.push('/assignments');
  };

  const handleMobilePrevious = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMobileStep(1);
    window.scrollTo(0, 0);
  };

  const handleMobileGenerate = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    handleSubmit();
  };

  const handleMobileBack = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (mobileStep === 2) {
      setMobileStep(1);
    } else {
      router.push('/assignments');
    }
  };

  const getErrorForField = (field: string) => {
    return errors.find(err => err.field === field)?.message;
  };

  return (
    <div>
      <div className="hidden md:flex flex-col gap-1">
        <div className="pl-2 flex items-center gap-3">
          {/* Glowing Green Live Indicator dot */}
          <div
            className="w-3 h-3 bg-[#4BC26D] rounded-full inline-block flex-shrink-0"
            style={{
              boxShadow: '0px 32px 48px rgba(0, 0, 0, 0.20), 0px 16px 48px rgba(0, 0, 0, 0.12)',
              outline: '4px rgba(75.15, 193.95, 108.81, 0.40) solid'
            }}
          />
          <h2 className="text-[20px] font-bold text-[#303030] font-sans">
            Create Assignment
          </h2>
        </div>
        <p
          style={{
            color: 'rgba(94, 94, 94, 0.80)',
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '140%',
            letterSpacing: '-0.56px',
            marginLeft: '28px'
          }}
        >
          Basic information about your assignment
        </p>
      </div>
      <div className="w-full max-w-[810px] mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">

        {/* Page Header (Desktop vs Mobile Figma match) */}
        <div className="md:flex flex-col gap-1 hidden pl-2">

        </div>

        {/* Mobile Figma Header */}
        <div 
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
          }}
          className="flex md:hidden w-full px-4 py-2"
        >
          <button
            type="button"
            onClick={handleMobileBack}
            style={{
              display: 'flex',
              width: '48px',
              height: '48px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              aspectRatio: '1/1',
              borderRadius: '100px',
              background: 'var(--Background-white-25, rgba(255, 255, 255, 0.25))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            className="active:scale-95 transition-all text-[#303030] border border-gray-200/50 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <h2
            style={{
              color: 'var(--Text-Primary, #303030)',
              textAlign: 'center',
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '140%',
              letterSpacing: '-0.64px',
            }}
            className="flex-1"
          >
            Create Assignment
          </h2>

          {/* Spacer to center the heading */}
          <div className="w-12 h-12 flex-shrink-0" />
        </div>

        {/* Form Completion Progress Bar */}
        <div className="px-2 -mt-4 -mb-2">
          <ProgressBar progress={progressPercent} />
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-md border border-veda-card-border shadow-sm p-4 sm:p-6 md:p-8 flex flex-col gap-6 md:gap-8 w-full"
          style={{
            borderRadius: '32px',
            background: 'rgba(255, 255, 255, 0.50)'
          }}
        >

          {/* Validation errors are now presented in a premium modal overlay */}

          {/* --- STEP 1: Basic Info & File (Visible always on Desktop, Step 1 on Mobile) --- */}
          <div className={`${mobileStep === 1 ? 'flex' : 'hidden'} md:flex flex-col gap-8`}>

            {/* Section: Basic Details */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1 items-center w-full border-b border-gray-150/50 pb-4">
                <h3
                  style={{
                    color: '#303030',
                    textAlign: 'center',
                    fontFamily: '"Bricolage Grotesque", sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: '140%',
                    letterSpacing: '-0.8px',
                  }}
                >
                  Assignment Details
                </h3>
                <p
                  style={{
                    color: 'rgba(94, 94, 94, 0.55)',
                    textAlign: 'center',
                    fontFamily: '"Bricolage Grotesque", sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '140%',
                    letterSpacing: '-0.56px',
                  }}
                >
                  Set up a new assignment for your students
                </p>
              </div>

              {/* Template Library Button */}
              <div className="flex justify-end -mb-2">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-[14px] font-bold text-purple-650 hover:text-purple-800 transition-all bg-purple-50 hover:bg-purple-100/80 rounded-full font-sans border border-purple-200/50 shadow-sm active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                  <span>Start from Template</span>
                </button>
              </div>

              {/* Title Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[16px] font-bold text-[#303030] font-sans">
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quiz on Electricity"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-[44px] px-6 text-[16px] font-medium text-[#303030] bg-white placeholder-black/40 rounded-full outline-none transition-all font-sans"
                  style={{
                    outline: '1.25px #DADADA solid',
                    outlineOffset: '-1.25px'
                  }}
                />
                {getErrorForField('title') && (
                  <span className="text-xs text-veda-orange-red">{getErrorForField('title')}</span>
                )}
              </div>

              {/* Subject & Grade Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-[16px] font-bold text-[#303030] font-sans">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-[44px] px-6 text-[16px] font-medium text-[#303030] bg-white placeholder-black/40 rounded-full outline-none transition-all font-sans"
                    style={{
                      outline: '1.25px #DADADA solid',
                      outlineOffset: '-1.25px'
                    }}
                  />
                  {getErrorForField('subject') && (
                    <span className="text-xs text-veda-orange-red">{getErrorForField('subject')}</span>
                  )}
                </div>

                {/* Class/Grade */}
                <div className="flex flex-col gap-2">
                  <label className="text-[16px] font-bold text-[#303030] font-sans">
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8th"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full h-[44px] px-6 text-[16px] font-medium text-[#303030] bg-white placeholder-black/40 rounded-full outline-none transition-all font-sans"
                    style={{
                      outline: '1.25px #DADADA solid',
                      outlineOffset: '-1.25px'
                    }}
                  />
                  {getErrorForField('grade') && (
                    <span className="text-xs text-veda-orange-red">{getErrorForField('grade')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 1 – File Upload */}
            <div className="flex flex-col gap-4">
              <FileUploadZone
                selectedFile={file}
                onFileSelect={setFile}
                selectedFileUrl={fileUrl}
                onFileUrlSelect={setFileUrl}
              />
            </div>

            {/* Section 2 – Due Date */}
            <DueDatePicker
              value={dueDate}
              onChange={setDueDate}
            />
            {getErrorForField('dueDate') && (
              <span className="text-xs text-veda-orange-red -mt-6">{getErrorForField('dueDate')}</span>
            )}

          </div>

          {/* --- STEP 2: Questions & Instructions (Visible always on Desktop, Step 2 on Mobile) --- */}
          <div className={`${mobileStep === 2 ? 'flex' : 'hidden'} md:flex flex-col gap-8`}>

            {/* Section 3 – Question Type Table */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[18px] font-bold text-[#303030] font-sans">
                Question Type Table
              </h3>
              <QuestionTypeTable
                rows={questionRows}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                onUpdateRow={updateRow}
              />
              {getErrorForField('questionRows') && (
                <span className="text-xs text-veda-orange-red">{getErrorForField('questionRows')}</span>
              )}

              {/* Totals Summary */}
              <div className="flex flex-col items-end gap-1 w-full mt-2">
                <div className="text-[16px] font-semibold text-[#303030] font-sans">
                  Total Questions :  {totalQuestions}
                </div>
                <div className="text-[16px] font-semibold text-[#303030] font-sans">
                  Total Marks :  {totalMarks}
                </div>
              </div>
            </div>

            {/* Section 4 – Additional Information */}
            <div className="flex flex-col gap-3">
              <label className="text-[16px] font-bold text-[#303030] font-sans">
                Additional Information (For better output)
              </label>

              <div
                className="w-full p-6 bg-white rounded-[24px] flex flex-col justify-between items-end transition-all relative"
                style={{
                  minHeight: '140px',
                  outline: '1.25px #DADADA solid',
                  outlineOffset: '-1.25px'
                }}
              >
                <textarea
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  maxLength={500}
                  value={additionalInstructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-transparent text-[16px] font-medium text-[#303030] placeholder-black/40 outline-none resize-none font-sans"
                  style={{ height: '80px' }}
                />

                {/* Microphone Icon Button */}
                <div
                  className="w-10 h-10 bg-[#F0F0F0] rounded-full flex items-center justify-center text-black/40 hover:text-black cursor-pointer transition-all shadow-sm"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Template Option */}
            <div className="flex flex-col gap-4 p-5 bg-purple-50/20 border border-purple-250/20 rounded-[28px]">
              <div className="flex items-start gap-3.5 pt-4 border-t border-gray-150/40">
                <div className="flex items-center h-5">
                  <input
                    id="saveAsTemplate"
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSaveAsTemplate(checked);
                      if (checked) {
                        setTempTemplateName(templateName);
                        setTempTemplateDescription(templateDescription);
                        setIsSaveTemplateModalOpen(true);
                      }
                    }}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="saveAsTemplate" className="text-[15px] font-bold text-[#303030] font-sans cursor-pointer flex items-center flex-wrap gap-x-2">
                    <span>Save blueprint as reusable template</span>
                    {saveAsTemplate && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempTemplateName(templateName);
                          setTempTemplateDescription(templateDescription);
                          setIsSaveTemplateModalOpen(true);
                        }}
                        className="text-[12.5px] font-bold text-purple-650 hover:text-purple-800 underline transition-colors font-sans"
                      >
                        (Configure template{templateName ? `: ${templateName}` : ''})
                      </button>
                    )}
                  </label>
                  <span className="text-[12px] text-gray-500 font-sans mt-0.5">
                    Save this blueprint configuration to your library for future assignments
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* --- FOOTER NAVIGATION / SUBMIT ACTIONS --- */}

          {/* Mobile View Navigation Buttons (Step 1 vs Step 2) */}
          <div className="flex md:hidden items-center justify-center gap-3 border-t border-gray-150/50 pt-4 mt-2">
            {mobileStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleMobileCancel}
                  className="px-6 py-3 text-[16px] font-medium text-[#303030] bg-white rounded-[48px] border border-gray-200 shadow-sm active:scale-95 transition-all font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMobileNext}
                  className="px-6 py-3 text-[16px] font-medium text-white bg-[#181818] rounded-[48px] active:scale-95 transition-all font-sans"
                  style={{ outline: '1.50px white solid', outlineOffset: '-1.50px' }}
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleMobilePrevious}
                  className="px-6 py-3 text-[16px] font-medium text-[#303030] bg-white rounded-[48px] border border-gray-200 shadow-sm active:scale-95 transition-all font-sans"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleMobileGenerate}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-[16px] font-medium text-white bg-[#181818] rounded-[48px] active:scale-95 transition-all disabled:opacity-50 font-sans"
                  style={{ outline: '1.50px white solid', outlineOffset: '-1.50px' }}
                >
                  {isSubmitting ? 'Generating...' : 'Generate'}
                </button>
              </>
            )}
          </div>

          {/* Desktop View Buttons (Right Aligned) */}
          <div className="hidden md:flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => router.push('/assignments')}
              className="px-6 py-3 text-[16px] font-bold text-gray-500 hover:text-black transition-all font-sans"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-[16px] font-bold text-white bg-[#181818] rounded-full shadow-lg hover:shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center gap-2"
            >
              {isSubmitting ? 'Generating...' : 'Generate Assignment'}
              {!isSubmitting && <Sparkles className="w-4 h-4 text-veda-orange animate-pulse" />}
            </button>
          </div>

        </form>

        {/* Template Selection Library Modal */}
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Validation Errors Modal Overlay */}
        {isValidationErrorModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsValidationErrorModalOpen(false)}
            />
            {/* Modal Box */}
            <div className="relative bg-white border border-gray-200/80 rounded-[32px] w-full max-w-[450px] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#303030] font-sans">Form Validation Errors</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsValidationErrorModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-[13px] text-gray-505 font-sans mb-3.5 leading-relaxed">
                Please resolve the following issue(s) before generating the assignment:
              </p>
              
              <div className="flex flex-col gap-2 mb-6 max-h-[200px] overflow-y-auto pr-1">
                {errors.map((err, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[13px] text-slate-700 font-sans font-medium">
                    <span className="text-red-500 shrink-0 mt-0.5">•</span>
                    <span>{err.message}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsValidationErrorModalOpen(false)}
                  className="px-6 py-2.5 text-[14px] font-bold text-white bg-[#181818] hover:bg-black rounded-full transition-all font-sans active:scale-95 shadow-md w-full text-center"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Modal Overlay */}
        {isSaveTemplateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => {
                if (!templateName) {
                  setSaveAsTemplate(false);
                }
                setIsSaveTemplateModalOpen(false);
              }}
            />
            {/* Modal Box */}
            <div className="relative bg-white border border-gray-250/80 rounded-[32px] w-full max-w-[450px] p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-650">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#303030] font-sans">Save Blueprint Template</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!templateName) {
                      setSaveAsTemplate(false);
                    }
                    setIsSaveTemplateModalOpen(false);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-[13px] text-gray-505 font-sans mb-4 leading-relaxed">
                Define a name and description to save this blueprint layout for quick use in future assignments.
              </p>
              
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#303030] font-sans">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CBSE Term 1 Science Exam"
                    value={tempTemplateName}
                    onChange={(e) => setTempTemplateName(e.target.value)}
                    className="w-full h-[40px] px-4 text-[14px] font-semibold text-[#303030] bg-gray-50 border border-gray-200 rounded-[20px] outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 font-sans transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[#303030] font-sans">
                    Template Description
                  </label>
                  <textarea
                    placeholder="e.g. Standard pattern with 5 MCQs and 3 short answers"
                    value={tempTemplateDescription}
                    onChange={(e) => setTempTemplateDescription(e.target.value)}
                    className="w-full p-4 text-[14px] font-medium text-[#303030] bg-gray-50 border border-gray-200 rounded-[20px] outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 font-sans resize-none h-20 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (!templateName) {
                      setSaveAsTemplate(false);
                    }
                    setIsSaveTemplateModalOpen(false);
                  }}
                  className="px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-black transition-colors font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!tempTemplateName.trim()) {
                      addToast('Please enter a template name', 'error');
                      return;
                    }
                    setTemplateName(tempTemplateName);
                    setTemplateDescription(tempTemplateDescription);
                    setIsSaveTemplateModalOpen(false);
                    addToast(`Template config saved: "${tempTemplateName}"`, 'success');
                  }}
                  className="px-5 py-2.5 text-[14px] font-bold text-white bg-[#181818] hover:bg-black rounded-full transition-all font-sans active:scale-95 shadow-md"
                >
                  Apply Blueprint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
