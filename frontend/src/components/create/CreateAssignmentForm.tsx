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
    <div className="w-full flex flex-col gap-6">
      {/* Page Header (Desktop) */}
      <div className="hidden lg:flex items-center justify-between pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            {/* Glowing Green Live Indicator dot */}
            <div
              className="w-2.5 h-2.5 bg-[#4BC26D] rounded-full flex-shrink-0"
              style={{
                boxShadow: '0px 0px 12px 2px rgba(75, 194, 109, 0.60)',
                outline: '4px rgba(75, 194, 109, 0.25) solid'
              }}
            />
            <h2 className="text-[24px] font-black tracking-tight text-slate-900 font-sans" style={{ fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", sans-serif' }}>
              Create Assessment
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans font-medium">
            Upload reference materials and configure your exam blueprints to generate sheets instantly.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => router.push('/assignments')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-full border border-slate-200 shadow-sm active:scale-95 transition-all font-sans"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>
      </div>

      {/* Mobile Figma Header */}
      <div 
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          alignSelf: 'stretch',
        }}
        className="flex lg:hidden w-full px-2 py-1"
      >
        <button
          type="button"
          onClick={handleMobileBack}
          style={{
            display: 'flex',
            width: '42px',
            height: '42px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '100px',
            background: 'white',
          }}
          className="active:scale-95 transition-all text-slate-700 border border-slate-200/60 shadow-sm flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        <h2
          style={{
            color: '#111111',
            textAlign: 'center',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '17px',
            fontWeight: 800,
            lineHeight: '140%',
            letterSpacing: '-0.64px',
          }}
          className="flex-1"
        >
          {mobileStep === 1 ? '1. Details & Files' : '2. Question Blueprint'}
        </h2>

        {/* Spacer to center the heading */}
        <div className="w-10 h-10 flex-shrink-0" />
      </div>

      {/* Form Completion Progress Bar */}
      <div className="w-full">
        <ProgressBar progress={progressPercent} />
      </div>

      {/* Form Grid Container */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* --- COLUMN 1: Basic Info & File (Visible always on Desktop, Step 1 on Mobile) --- */}
          <div 
            className={`${mobileStep === 1 ? 'flex' : 'hidden'} lg:flex lg:col-span-5 flex-col gap-6 p-6 sm:p-7 md:p-8 bg-white border border-slate-200/85 rounded-[28px] shadow-sm w-full`}
          >
            {/* Section: Basic Details Header */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
              <h3 className="text-[16px] font-black text-[#10375C] font-sans tracking-tight">
                1. Assignment Settings
              </h3>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Set core syllabus info, grades, and reference files.
              </p>
            </div>

            {/* Template Library Quick Start */}
            <div className="flex flex-col gap-3 p-4 bg-gradient-to-br from-indigo-50/50 via-purple-50/20 to-white border border-purple-100/60 rounded-2xl">
              <div className="flex flex-col gap-1">
                <span className="text-[12.5px] font-bold text-slate-800 font-sans flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                  <span>Start with Blueprint Template</span>
                </span>
                <span className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Quick-load template presets for standard formats like CBSE term papers or quizzes.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="w-full py-2 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all rounded-xl font-sans shadow-md text-center"
              >
                Open Blueprint Library
              </button>
            </div>

            {/* Title Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-extrabold text-slate-800 font-sans">
                Assignment Title
              </label>
              <input
                type="text"
                placeholder="e.g. Quiz on Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-[40px] px-4 text-[14px] font-semibold text-slate-850 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#10375C] focus:border-[#10375C] transition-all font-sans"
              />
              {getErrorForField('title') && (
                <span className="text-xs text-red-500 font-medium font-sans">{getErrorForField('title')}</span>
              )}
            </div>

            {/* Subject & Grade Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-extrabold text-slate-800 font-sans">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-[40px] px-4 text-[14px] font-semibold text-slate-850 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#10375C] focus:border-[#10375C] transition-all font-sans"
                />
                {getErrorForField('subject') && (
                  <span className="text-xs text-red-500 font-medium font-sans">{getErrorForField('subject')}</span>
                )}
              </div>

              {/* Class/Grade */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-extrabold text-slate-800 font-sans">
                  Class / Grade
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8th"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-[40px] px-4 text-[14px] font-semibold text-slate-850 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#10375C] focus:border-[#10375C] transition-all font-sans"
                />
                {getErrorForField('grade') && (
                  <span className="text-xs text-red-500 font-medium font-sans">{getErrorForField('grade')}</span>
                )}
              </div>
            </div>

            {/* Section 1 – File Upload */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[14px] font-extrabold text-slate-800 font-sans">
                Reference Material <span className="text-xs text-slate-400 font-medium font-sans">(Optional)</span>
              </label>
              <FileUploadZone
                selectedFile={file}
                onFileSelect={setFile}
                selectedFileUrl={fileUrl}
                onFileUrlSelect={setFileUrl}
              />
            </div>

            {/* Section 2 – Due Date */}
            <div className="flex flex-col gap-1.5">
              <DueDatePicker
                value={dueDate}
                onChange={setDueDate}
              />
              {getErrorForField('dueDate') && (
                <span className="text-xs text-red-500 font-medium font-sans">{getErrorForField('dueDate')}</span>
              )}
            </div>
          </div>

          {/* --- COLUMN 2: Questions & Instructions (Visible always on Desktop, Step 2 on Mobile) --- */}
          <div 
            className={`${mobileStep === 2 ? 'flex' : 'hidden'} lg:flex lg:col-span-7 flex-col gap-6 p-6 sm:p-7 md:p-8 bg-white border border-slate-200/85 rounded-[28px] shadow-sm w-full`}
          >
            {/* Section: Blueprint Details Header */}
            <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-4">
              <h3 className="text-[16px] font-black text-[#10375C] font-sans tracking-tight">
                2. Assessment Blueprint
              </h3>
              <p className="text-[11px] text-slate-500 font-sans font-medium">
                Add sections, choose formats, and configure custom marking keys.
              </p>
            </div>

            {/* Totals Pill Summary Bar */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/40 rounded-2xl p-4 select-none font-sans text-sm">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Total Questions</span>
                <span className="text-[19px] font-black text-[#10375C] font-sans mt-0.5">{totalQuestions}</span>
              </div>
              <div className="w-[1.5px] h-8 bg-slate-200" />
              <div className="flex-1 flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Total Marks</span>
                <span className="text-[19px] font-black text-[#10375C] font-sans mt-0.5">{totalMarks} M</span>
              </div>
            </div>

            {/* Section 3 – Question Type Table */}
            <div className="flex flex-col gap-3">
              <QuestionTypeTable
                rows={questionRows}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                onUpdateRow={updateRow}
              />
              {getErrorForField('questionRows') && (
                <span className="text-xs text-red-500 font-medium font-sans">{getErrorForField('questionRows')}</span>
              )}
            </div>

            {/* Section 4 – Additional Information */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-[14px] font-extrabold text-slate-800 font-sans">
                Additional Prompt Instructions <span className="text-xs text-slate-400 font-medium font-sans">(Optional)</span>
              </label>

              <div
                className="w-full p-4 bg-slate-50 hover:bg-white border border-slate-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#10375C] focus-within:border-[#10375C] rounded-2xl flex flex-col justify-between items-end transition-all relative min-h-[120px]"
              >
                <textarea
                  placeholder="e.g. Include questions on CBSE Chapter 14, focus heavily on conductors. Keep tone academic."
                  maxLength={500}
                  value={additionalInstructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-transparent text-[14px] font-medium text-slate-800 placeholder-slate-400 outline-none resize-none font-sans h-16"
                />

                {/* Microphone Icon Button */}
                <div
                  className="w-8 h-8 bg-white hover:bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-all shadow-sm active:scale-95 flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Template Option */}
            <div className="flex flex-col gap-3 p-4 bg-purple-50/10 border border-purple-150/20 rounded-2xl mt-2 select-none">
              <div className="flex items-start gap-3">
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
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-350 cursor-pointer mt-1"
                />
                <div className="flex flex-col gap-0.5">
                  <label htmlFor="saveAsTemplate" className="text-[13.5px] font-bold text-slate-800 font-sans cursor-pointer flex items-center flex-wrap gap-x-1.5">
                    <span>Save configuration as template</span>
                    {saveAsTemplate && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempTemplateName(templateName);
                          setTempTemplateDescription(templateDescription);
                          setIsSaveTemplateModalOpen(true);
                        }}
                        className="text-[11.5px] font-bold text-purple-650 hover:text-purple-800 underline transition-colors font-sans"
                      >
                        (Configure Name{templateName ? `: ${templateName}` : ''})
                      </button>
                    )}
                  </label>
                  <span className="text-[11px] text-slate-500 font-sans leading-relaxed">
                    Save this blueprint layout to your template library for single-click loads.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- FOOTER NAVIGATION / SUBMIT ACTIONS --- */}

        {/* Mobile View Navigation Buttons (Step 1 vs Step 2) */}
        <div className="flex lg:hidden items-center justify-center gap-3 border-t border-slate-200/60 pt-4 mt-2 select-none">
          {mobileStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleMobileCancel}
                className="px-6 py-2.5 text-[14px] font-bold text-slate-700 bg-white rounded-full border border-slate-200 shadow-sm active:scale-95 transition-all font-sans flex-1 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMobileNext}
                className="px-6 py-2.5 text-[14px] font-bold text-white bg-[#10375C] hover:bg-[#0d2f4f] rounded-full active:scale-95 transition-all font-sans flex-1 text-center shadow-md shadow-[#10375C]/10"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleMobilePrevious}
                className="px-6 py-2.5 text-[14px] font-bold text-slate-700 bg-white rounded-full border border-slate-200 shadow-sm active:scale-95 transition-all font-sans flex-1 text-center"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleMobileGenerate}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-[14px] font-bold text-white bg-[#10375C] hover:bg-[#0d2f4f] rounded-full active:scale-95 transition-all disabled:opacity-50 font-sans flex-1 text-center shadow-md shadow-[#10375C]/10"
              >
                {isSubmitting ? 'Generating...' : 'Generate'}
              </button>
            </>
          )}
        </div>

        {/* Desktop View Action Bar (Right Aligned, Beautiful Card style spans whole width) */}
        <div className="hidden lg:flex items-center justify-between bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-sm select-none">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">Final Summary</span>
              <span className="text-[14px] font-black text-slate-800 font-sans mt-0.5">
                {totalQuestions} Questions • {totalMarks} Marks
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/assignments')}
              className="px-5 py-2.5 text-[14px] font-bold text-slate-505 hover:text-slate-800 hover:bg-slate-50 transition-all font-sans rounded-full active:scale-95"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 text-[14px] font-bold text-white bg-[#10375C] hover:bg-[#0d2f4f] rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center gap-2"
            >
              {isSubmitting ? 'Generating Paper...' : 'Generate Assignment'}
              {!isSubmitting && <Sparkles className="w-4 h-4 text-amber-350 animate-pulse" />}
            </button>
          </div>
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
  );
}
