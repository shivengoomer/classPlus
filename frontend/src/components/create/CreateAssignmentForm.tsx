// src/components/create/CreateAssignmentForm.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '@/store/formStore';
import { useAssignmentStore } from '@/store/assignmentStore';
import { FileUploadZone } from './FileUploadZone';
import { DueDatePicker } from './DueDatePicker';
import { QuestionTypeTable } from './QuestionTypeTable';
import { ProgressBar } from '../shared/ProgressBar';
import { validateAssignmentForm, ValidationError } from '@/lib/validators';
import { createAssignment, exploreSyllabus, SyllabusExploreResult } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { TemplateModal } from './TemplateModal';
import { useTemplateStore } from '@/store/templateStore';
import { useProfileStore } from '@/store/profileStore';
import { Template } from '@/types/group';
import {
  Sparkles, ArrowLeft, AlertCircle, X, Cpu, Scale, CheckSquare,
  BookOpen, Settings, SlidersHorizontal, Plus, Minus, CheckCircle2,
  ChevronDown, ChevronUp, Info, Trash2, Calendar, FileText
} from 'lucide-react';

export function CreateAssignmentForm() {
  const router = useRouter();
  const addAssignment = useAssignmentStore((state) => state.addAssignment);
  const { addToast } = useToastStore();
  const saveTemplate = useTemplateStore((state) => state.saveTemplate);
  const { profile, fetchProfile, updateProfile } = useProfileStore();

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

  // Syllabus alignment state
  const [syllabusTopic, setSyllabusTopic] = useState('');
  const [checkingSyllabus, setCheckingSyllabus] = useState(false);
  const [syllabusResult, setSyllabusResult] = useState<SyllabusExploreResult | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // AI Grader preferences states
  const [ignoreHandwriting, setIgnoreHandwriting] = useState(true);
  const [strictSpelling, setStrictSpelling] = useState(false);
  const [partialFormulas, setPartialFormulas] = useState(true);
  const [penaltyPct, setPenaltyPct] = useState(10);
  const [customRule, setCustomRule] = useState('');
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [isSavingGrader, setIsSavingGrader] = useState(false);

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

  // Load User profile & grading settings on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync states from loaded profile
  useEffect(() => {
    if (profile) {
      if (profile.aiIgnoreHandwriting !== undefined) setIgnoreHandwriting(profile.aiIgnoreHandwriting);
      if (profile.aiStrictSpelling !== undefined) setStrictSpelling(profile.aiStrictSpelling);
      if (profile.aiPartialFormulas !== undefined) setPartialFormulas(profile.aiPartialFormulas);
      if (profile.aiLatePenalty !== undefined) setPenaltyPct(profile.aiLatePenalty);
      if (profile.aiCustomDirectives !== undefined) setCustomRules(profile.aiCustomDirectives);
    }
  }, [profile]);

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

  // Mobile step tracker (Step 1: Details & Syllabus; Step 2: Blueprint & AI Settings)
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

  // Sync grading choices with user profile in DB
  const handleSaveGraderPreferences = async (updatedFields: any) => {
    setIsSavingGrader(true);
    try {
      await updateProfile(updatedFields);
      addToast('AI grading settings synced successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to sync grading rules: ' + err.message, 'error');
    } finally {
      setIsSavingGrader(false);
    }
  };

  // Syllabus alignment search trigger
  const handleCheckSyllabusAlignment = async () => {
    const activeTopic = syllabusTopic.trim() || title.trim();
    if (!activeTopic) {
      addToast('Please input a topic or set an assignment title to verify alignment.', 'error');
      return;
    }
    const activeSubject = subject.trim() || 'Science';
    const activeGrade = grade.trim() || 'Grade 8';

    setCheckingSyllabus(true);
    setSyllabusResult(null);
    try {
      const data = await exploreSyllabus(activeGrade, activeSubject, activeTopic);
      setSyllabusResult(data);
      addToast('Syllabus analysis retrieved!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to explore CBSE syllabus: ' + err.message, 'error');
    } finally {
      setCheckingSyllabus(false);
    }
  };

  // Add custom directive helper
  const handleAddCustomDirective = () => {
    if (!customRule.trim()) return;
    const updatedRules = [...customRules, customRule.trim()];
    setCustomRules(updatedRules);
    setCustomRule('');
    handleSaveGraderPreferences({ aiCustomDirectives: updatedRules });
  };

  // Remove custom directive helper
  const handleRemoveCustomDirective = (index: number) => {
    const updatedRules = customRules.filter((_, idx) => idx !== index);
    setCustomRules(updatedRules);
    handleSaveGraderPreferences({ aiCustomDirectives: updatedRules });
  };

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

      if (result.jobId.startsWith('job-')) {
        const saved = localStorage.getItem('classplus_assignments');
        if (saved) {
          const list = JSON.parse(saved);
          const pendingItem = list.find((a: any) => a._id === result.assignmentId);
          if (pendingItem) {
            addAssignment(pendingItem);
          }
        }
      }

      reset();
      router.push(`/status/${result.jobId}`);
    } catch (err) {
      console.error(err);
      addToast('Error initiating assignment creation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorForField = (field: string) => {
    return errors.find(err => err.field === field)?.message;
  };

  // Toggle helper
  const ToggleRow = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-700 font-semibold font-sans">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#10375C]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse"
              style={{
                boxShadow: '0 0 10px 2px rgba(16, 185, 129, 0.5)'
              }}
            />
            <h2 className="text-[20px] font-black text-slate-800 font-sans tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-classplus-orange" />
              <span>Create AI Assessment</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-sans font-medium">
            Configure blueprints, verify CBSE curriculum alignments, and set background grading instructions in one workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/assignments')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-50 rounded-full border border-slate-200 shadow-sm active:scale-95 transition-all font-sans"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>
      </div>

      {/* Mobile Header */}
      <div className="flex lg:hidden justify-between items-center px-1 py-1 select-none">
        <button
          type="button"
          onClick={() => {
            if (mobileStep === 2) setMobileStep(1);
            else router.push('/assignments');
          }}
          className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <h2 className="text-md font-extrabold text-slate-800 font-sans text-center">
          {mobileStep === 1 ? '1. Details & Syllabus' : '2. Blueprint & AI Grader'}
        </h2>
        <div className="w-10 h-10" />
      </div>

      {/* Progress completion bar */}
      <div className="w-full">
        <ProgressBar progress={progressPercent} />
      </div>

      {/* Main split grid */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

          {/* COLUMN 1: Basic Info & Syllabus Alignments */}
          <div className={`${mobileStep === 1 ? 'flex' : 'hidden'} lg:flex lg:col-span-6 flex-col gap-6 w-full`}>
            
            {/* CARD 1.1: Core settings */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings className="w-4.5 h-4.5 text-[#10375C]" />
                <h3 className="text-[14px] font-black text-[#10375C] font-sans tracking-tight">1. Assessment Parameters</h3>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-sans">Assessment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Quiz on Electricity"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!syllabusTopic) setSyllabusTopic(e.target.value);
                  }}
                  className="w-full h-9 px-3 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#10375C] focus:border-[#10375C] transition-all font-sans"
                />
                {getErrorForField('title') && (
                  <span className="text-[10px] text-red-500 font-semibold font-sans">{getErrorForField('title')}</span>
                )}
              </div>

              {/* Subject & Class */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-sans">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#10375C] focus:border-[#10375C] transition-all font-sans"
                  />
                  {getErrorForField('subject') && (
                    <span className="text-[10px] text-red-500 font-semibold font-sans">{getErrorForField('subject')}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-sans">Class / Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. Grade 8"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-[#10375C] focus:border-[#10375C] transition-all font-sans"
                  />
                  {getErrorForField('grade') && (
                    <span className="text-[10px] text-red-500 font-semibold font-sans">{getErrorForField('grade')}</span>
                  )}
                </div>
              </div>

              {/* Reference materials file zone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 font-sans">Reference Chapters / Guidelines</label>
                <FileUploadZone
                  selectedFile={file}
                  onFileSelect={setFile}
                  selectedFileUrl={fileUrl}
                  onFileUrlSelect={setFileUrl}
                />
              </div>

              {/* Due Date picker */}
              <div className="flex flex-col gap-1.5">
                <DueDatePicker value={dueDate} onChange={setDueDate} />
                {getErrorForField('dueDate') && (
                  <span className="text-[10px] text-red-500 font-semibold font-sans">{getErrorForField('dueDate')}</span>
                )}
              </div>
            </div>

            {/* CARD 1.2: CBSE/NCERT Live Syllabus Mapper */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
                  <h3 className="text-[14px] font-black text-slate-800 font-sans tracking-tight">CBSE Syllabus Alignment Check</h3>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">Live AI Link</span>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[11px] text-slate-500 font-medium font-sans leading-relaxed mb-1">
                  Query the NCERT alignment agent to analyze curriculum score, key boards concepts, and retrieve sample board exam questions before paper generation.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Topic name (e.g. Friction, Chemical Reactions)"
                    value={syllabusTopic}
                    onChange={(e) => setSyllabusTopic(e.target.value)}
                    className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-sans bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCheckSyllabusAlignment}
                    disabled={checkingSyllabus}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md flex-shrink-0 disabled:opacity-50"
                  >
                    {checkingSyllabus ? 'Checking...' : 'Check NCERT'}
                  </button>
                </div>
              </div>

              {/* Syllabus mapper AI outputs */}
              <AnimatePresence>
                {syllabusResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-3 pt-2 overflow-hidden border-t border-slate-100"
                  >
                    <div className="flex items-center gap-3 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                      <div className="text-xl font-black text-emerald-700 shrink-0">{syllabusResult.alignmentScore}%</div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-emerald-800 font-sans">CBSE NCERT Alignment Match</div>
                        <div className="text-[10px] text-slate-500 font-semibold font-sans mt-0.5">
                          Chapter: {syllabusResult.chapterName} • {syllabusResult.aligned ? 'Fully Syllabus Aligned' : 'Flagged content detected'}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 leading-relaxed font-sans bg-slate-50 border border-slate-100 p-3 rounded-xl italic">
                      &ldquo;{syllabusResult.curriculumContext}&rdquo;
                    </div>

                    {/* Key concepts */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Key NCERT Syllabus Concepts</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {syllabusResult.keyConcepts.map((concept, i) => (
                          <span key={i} className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Study notes */}
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">CBSE Competency Study Notes</span>
                      <p className="text-[11.5px] text-slate-600 font-sans leading-relaxed mt-1 bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                        {syllabusResult.quickStudyNotes}
                      </p>
                    </div>

                    {/* Board Questions accordions */}
                    {syllabusResult.boardExamQuestions && syllabusResult.boardExamQuestions.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Seeded Board Exam Prototypes</span>
                        {syllabusResult.boardExamQuestions.map((bq, idx) => (
                          <div key={bq.id || idx} className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-xs">
                            <button
                              type="button"
                              onClick={() => setExpandedQuestionId(expandedQuestionId === bq.id ? null : bq.id)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex-1 pr-2">
                                <span className="text-[10.5px] font-bold text-slate-700 font-sans block">{bq.question}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 inline-block">{bq.marks} Mark Paper Question</span>
                              </div>
                              {expandedQuestionId === bq.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                            </button>
                            {expandedQuestionId === bq.id && (
                              <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] font-sans text-slate-600 leading-relaxed">
                                <strong className="text-emerald-700 font-bold font-sans">NCERT Model Answer guidelines:</strong>
                                <p className="mt-1 font-mono text-[10px] bg-white p-2 border border-slate-200 rounded">{bq.modelAnswer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLUMN 2: Blueprint, Rubrics & AI Grading Parameters */}
          <div className={`${mobileStep === 2 ? 'flex' : 'hidden'} lg:flex lg:col-span-6 flex-col gap-6 w-full`}>
            
            {/* CARD 2.1: Question types table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-[#10375C]" />
                  <h3 className="text-[14px] font-black text-[#10375C] font-sans tracking-tight">2. Exam Blueprint</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 border border-purple-250 bg-purple-50 px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                >
                  Load Template Preset
                </button>
              </div>

              {/* Totals Summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-3 rounded-2xl select-none font-sans text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Questions</span>
                  <span className="text-[16px] font-black text-[#10375C] mt-0.5 block">{totalQuestions} Qs</span>
                </div>
                <div className="border-l border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Marks</span>
                  <span className="text-[16px] font-black text-[#10375C] mt-0.5 block">{totalMarks} Marks</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <QuestionTypeTable
                  rows={questionRows}
                  onAddRow={addRow}
                  onRemoveRow={removeRow}
                  onUpdateRow={updateRow}
                />
                {getErrorForField('questionRows') && (
                  <span className="text-[10px] text-red-500 font-semibold font-sans">{getErrorForField('questionRows')}</span>
                )}
              </div>
            </div>

            {/* CARD 2.2: AI Grader Guidelines & Rubric Adjuster */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4.5 h-4.5 text-indigo-600" />
                  <h3 className="text-[14px] font-black text-slate-800 font-sans tracking-tight">3. AI Grader & CBSE NCERT Settings</h3>
                </div>
                {isSavingGrader && (
                  <span className="text-[9px] text-slate-400 animate-pulse font-bold">Syncing DB...</span>
                )}
              </div>

              {/* Toggle list */}
              <div className="bg-slate-50/50 border border-slate-150 p-3.5 rounded-2xl flex flex-col">
                <ToggleRow
                  checked={ignoreHandwriting}
                  onChange={(v) => {
                    setIgnoreHandwriting(v);
                    handleSaveGraderPreferences({ aiIgnoreHandwriting: v });
                  }}
                  label="Ignore student handwriting legibility"
                />
                <ToggleRow
                  checked={strictSpelling}
                  onChange={(v) => {
                    setStrictSpelling(v);
                    handleSaveGraderPreferences({ aiStrictSpelling: v });
                  }}
                  label="Strict spelling deductions (−0.5 per mistake)"
                />
                <ToggleRow
                  checked={partialFormulas}
                  onChange={(v) => {
                    setPartialFormulas(v);
                    handleSaveGraderPreferences({ aiPartialFormulas: v });
                  }}
                  label="Award partial marks for calculations/formulas"
                />
              </div>

              {/* Late penalty slider */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Late Penalty Deduction: {penaltyPct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={penaltyPct}
                  onChange={(e) => setPenaltyPct(Number(e.target.value))}
                  onMouseUp={() => handleSaveGraderPreferences({ aiLatePenalty: penaltyPct })}
                  onTouchEnd={() => handleSaveGraderPreferences({ aiLatePenalty: penaltyPct })}
                  className="w-full accent-[#10375C] cursor-pointer"
                />
              </div>

              {/* Custom directives */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Custom Grader Rules</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Strict CBSE board formatting required"
                    value={customRule}
                    onChange={(e) => setCustomRule(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomDirective();
                      }
                    }}
                    className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-sans bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDirective}
                    className="px-3 bg-indigo-650 hover:bg-indigo-850 text-white rounded-xl active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {customRules.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                    {customRules.map((rule, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-650 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                        <span>{rule}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomDirective(idx)}
                          className="text-red-400 hover:text-red-600 font-black"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2.3: Additional Prompts */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-3">
              <label className="text-xs font-black text-slate-700 font-sans tracking-tight">4. Additional Prompt Directives</label>
              <div className="w-full p-3.5 bg-slate-50 border border-slate-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-[#10375C] focus-within:border-[#10375C] rounded-2xl flex flex-col justify-between items-end transition-all min-h-[100px]">
                <textarea
                  placeholder="e.g. Include questions on Chapter 5 electricity calculations. Use strict board marking criteria."
                  maxLength={500}
                  value={additionalInstructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder-slate-400 outline-none resize-none font-sans h-12"
                />
                {/* Voice Dictation (Mocked for visual polish) */}
                <div
                  className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-all active:scale-90"
                  onClick={() => addToast('Voice dictation started (Simulated)', 'info')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Save Template configurations toggle */}
            <div className="bg-purple-50/15 border border-purple-100 rounded-2xl p-4 flex items-start gap-3 select-none">
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
                className="w-4 h-4 rounded text-purple-650 focus:ring-purple-500 border-slate-300 cursor-pointer mt-0.5"
              />
              <div className="flex flex-col gap-0.5">
                <label htmlFor="saveAsTemplate" className="text-xs font-bold text-slate-800 font-sans cursor-pointer flex items-center flex-wrap gap-x-1">
                  <span>Save configuration to template library</span>
                  {saveAsTemplate && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempTemplateName(templateName);
                        setTempTemplateDescription(templateDescription);
                        setIsSaveTemplateModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline font-sans ml-1"
                    >
                      (Rename: {templateName || 'Unset'})
                    </button>
                  )}
                </label>
                <span className="text-[10px] text-slate-400 font-sans font-medium">
                  Save this section counts blueprint layout for quick loading on next assignment.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions for Mobile view */}
        <div className="flex lg:hidden items-center justify-center gap-3 border-t border-slate-100 pt-4 mt-2">
          {mobileStep === 1 ? (
            <>
              <button
                type="button"
                onClick={() => router.push('/assignments')}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-full active:scale-95 transition-all font-sans flex-1 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setMobileStep(2)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#10375C] rounded-full active:scale-95 transition-all font-sans flex-1 text-center shadow-md shadow-[#10375C]/10"
              >
                Next (Grader & Blueprint)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMobileStep(1)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-full active:scale-95 transition-all font-sans flex-1 text-center"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#10375C] rounded-full active:scale-95 transition-all disabled:opacity-50 font-sans flex-1 text-center shadow-md shadow-[#10375C]/10"
              >
                {isSubmitting ? 'Generating...' : 'Generate Assignment'}
              </button>
            </>
          )}
        </div>

        {/* Footer action bar for Desktop view */}
        <div className="hidden lg:flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm select-none">
          <div className="flex flex-col font-sans">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Blueprint Summary</span>
            <span className="text-[13px] font-black text-slate-700 block mt-0.5">
              {totalQuestions} Questions • {totalMarks} Marks
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/assignments')}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all font-sans rounded-full"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#10375C] hover:bg-[#0c2e4f] rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center gap-1.5"
            >
              {isSubmitting ? 'Generating Paper...' : 'Generate Assignment'}
              {!isSubmitting && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            </button>
          </div>
        </div>
      </form>

      {/* Template selection modal overlay */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Validation Errors Modal */}
      {isValidationErrorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsValidationErrorModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 rounded-[28px] w-full max-w-[420px] p-5 shadow-xl z-10">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h4 className="text-md font-bold text-slate-800 font-sans">Form Validation Errors</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsValidationErrorModalOpen(false)}
                className="w-7 h-7 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mb-5 max-h-[180px] overflow-y-auto pr-1">
              {errors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-650 font-sans font-medium">
                  <span className="text-red-500 select-none">•</span>
                  <span>{err.message}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsValidationErrorModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#10375C] hover:bg-[#0c2e4f] rounded-full transition-all active:scale-95 shadow w-full text-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Save Template name config modal */}
      {isSaveTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => {
              if (!templateName) setSaveAsTemplate(false);
              setIsSaveTemplateModalOpen(false);
            }}
          />
          <div className="relative bg-white border border-slate-200 rounded-[28px] w-full max-w-[420px] p-5 shadow-xl z-10">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-purple-650" />
                <h4 className="text-md font-bold text-slate-800 font-sans">Save Blueprint Template</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!templateName) setSaveAsTemplate(false);
                  setIsSaveTemplateModalOpen(false);
                }}
                className="w-7 h-7 hover:bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4.5 mb-5 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Template Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Chemistry Test - Grade 8"
                  value={tempTemplateName}
                  onChange={(e) => setTempTemplateName(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  placeholder="e.g. CBSE Term 1 Science blueprint"
                  value={tempTemplateDescription}
                  onChange={(e) => setTempTemplateDescription(e.target.value)}
                  className="w-full p-3 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 h-16 resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!templateName) setSaveAsTemplate(false);
                  setIsSaveTemplateModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tempTemplateName.trim()) {
                    addToast('Template name is required.', 'error');
                    return;
                  }
                  setTemplateName(tempTemplateName);
                  setTemplateDescription(tempTemplateDescription);
                  setIsSaveTemplateModalOpen(false);
                  addToast(`Template configuration locked: "${tempTemplateName}"`, 'success');
                }}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#10375C] hover:bg-[#0c2e4f] rounded-full transition-all active:scale-95 shadow-md"
              >
                Lock Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
