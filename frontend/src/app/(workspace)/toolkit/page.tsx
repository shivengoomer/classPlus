// src/app/toolkit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { useProfileStore } from '@/store/profileStore';
import { useTemplateStore } from '@/store/templateStore';
import { useToastStore } from '@/store/toastStore';
import { exploreSyllabus, SyllabusExploreResult } from '@/lib/api';
import {
  Cpu, Sparkle, Plus, Minus, Scale, CheckSquare, Settings, CheckCircle2,
  AlertCircle, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';

type ActiveTool = 'syllabus' | 'grading' | 'blueprint';

// ── Syllabus Mapper Tool ──────────────────────────────────
function SyllabusMapperPanel() {
  const grades = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'History', 'Civics', 'Geography'];
  const [grade, setGrade] = useState('Grade 8');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<SyllabusExploreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const { addToast } = useToastStore();

  const handleCheck = async () => {
    if (!topic.trim()) {
      addToast('Please enter a topic to search', 'info');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await exploreSyllabus(grade, subject, topic);
      setResult(data);
      addToast('CBSE alignment mapping completed!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to explore syllabus: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Grade Level</label>
          <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-emerald-400 cursor-pointer font-sans">
            {grades.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-emerald-400 cursor-pointer font-sans">
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Topic / Question Prompt</label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. Newton's Laws of Motion, Chemical Bonding..."
          className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2.5 outline-none focus:border-emerald-400 font-sans"
        />
      </div>
      <PillButton variant="primary" className="w-full justify-center text-xs !py-2.5" onClick={handleCheck} disabled={loading}>
        {loading ? 'Checking Alignment...' : 'Check NCERT Alignment'}
      </PillButton>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${result.alignmentScore >= 80 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`text-2xl font-black shrink-0 ${result.alignmentScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{result.alignmentScore}%</div>
              <div>
                <span className={`text-xs font-bold ${result.alignmentScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>Alignment Score</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Chapter: {result.chapterName} • {result.alignmentScore >= 80 ? 'Well-aligned with NCERT curriculum.' : 'Review flagged areas below.'}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-650 bg-slate-50 border border-slate-100 p-3 rounded-xl italic font-sans leading-relaxed">
              &ldquo;{result.curriculumContext}&rdquo;
            </div>

            {/* Concepts */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NCERT Core Concepts</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {result.keyConcepts.map((concept, i) => (
                  <span key={i} className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg">
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Learning Outcomes</span>
              <div className="flex flex-col gap-1.5">
                {result.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-650 font-sans">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Notes */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Competency Study Summary</span>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans mt-1 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                {result.quickStudyNotes}
              </p>
            </div>

            {/* Board questions prototype */}
            {result.boardExamQuestions && result.boardExamQuestions.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CBSE Board Exam Prototypes</span>
                {result.boardExamQuestions.map((bq, idx) => (
                  <div key={bq.id || idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(expandedQuestionId === bq.id ? null : bq.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 pr-2">
                        <span className="text-[11px] font-bold text-slate-700 block">{bq.question}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 inline-block">{bq.marks} Marks</span>
                      </div>
                      {expandedQuestionId === bq.id ? <ChevronUp className="w-3.5 h-3.5 text-slate-450" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-450" />}
                    </button>
                    {expandedQuestionId === bq.id && (
                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10.5px] font-sans text-slate-655 leading-relaxed">
                        <strong className="text-emerald-700 block">Model Marking Scheme:</strong>
                        <p className="mt-1 font-mono bg-white p-2 border border-slate-200 rounded">{bq.modelAnswer}</p>
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
  );
}

// ── Grading Guidelines Tool ─────────────────────────────────
function GradingGuidelinesPanel() {
  const { profile, updateProfile } = useProfileStore();
  const { addToast } = useToastStore();

  const [ignoreHandwriting, setIgnoreHandwriting] = useState(true);
  const [strictSpelling, setStrictSpelling] = useState(false);
  const [partialFormulas, setPartialFormulas] = useState(true);
  const [penaltyPct, setPenaltyPct] = useState(10);
  const [customRule, setCustomRule] = useState('');
  const [rules, setRules] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.aiIgnoreHandwriting !== undefined) setIgnoreHandwriting(profile.aiIgnoreHandwriting);
      if (profile.aiStrictSpelling !== undefined) setStrictSpelling(profile.aiStrictSpelling);
      if (profile.aiPartialFormulas !== undefined) setPartialFormulas(profile.aiPartialFormulas);
      if (profile.aiLatePenalty !== undefined) setPenaltyPct(profile.aiLatePenalty);
      if (profile.aiCustomDirectives !== undefined) setRules(profile.aiCustomDirectives);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        aiIgnoreHandwriting: ignoreHandwriting,
        aiStrictSpelling: strictSpelling,
        aiPartialFormulas: partialFormulas,
        aiLatePenalty: penaltyPct,
        aiCustomDirectives: rules
      });
      setSaved(true);
      addToast('Grading guidelines saved to profile!', 'success');
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      addToast('Failed to save guidelines: ' + err.message, 'error');
    }
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-classplus-text-primary font-medium">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#10375C]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 border border-classplus-card-border rounded-xl p-4 flex flex-col">
        <Toggle checked={ignoreHandwriting} onChange={setIgnoreHandwriting} label="Ignore handwriting legibility issues" />
        <Toggle checked={strictSpelling} onChange={setStrictSpelling} label="Strict spelling deductions (−0.5 per error)" />
        <Toggle checked={partialFormulas} onChange={setPartialFormulas} label="Award partial marks for correct formula" />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Late Submission Penalty: {penaltyPct}%
        </label>
        <input
          type="range" min={0} max={50} step={5}
          value={penaltyPct}
          onChange={e => setPenaltyPct(Number(e.target.value))}
          className="w-full accent-[#10375C] cursor-pointer"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Custom AI Directive</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customRule}
            onChange={e => setCustomRule(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && customRule.trim()) {
                e.preventDefault();
                setRules(prev => [...prev, customRule.trim()]);
                setCustomRule('');
              }
            }}
            placeholder="e.g. Reward innovative solutions..."
            className="flex-1 text-xs border border-classplus-card-border rounded-lg px-3 py-2 outline-none focus:border-indigo-400 font-sans cursor-text bg-white"
          />
          <button
            type="button"
            onClick={() => {
              if (customRule.trim()) { setRules(prev => [...prev, customRule.trim()]); setCustomRule(''); }
            }}
            className="px-3 py-2 bg-[#10375C] text-white rounded-lg text-xs font-bold hover:bg-[#0d2f4f] transition-colors active:scale-95 flex items-center justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {rules.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-3 select-none">
            {rules.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-650 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                <span className="flex-1 font-sans">{r}</span>
                <button type="button" onClick={() => setRules(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-650 transition-colors">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <motion.button
        type="button"
        onClick={handleSave}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#10375C] hover:bg-[#0d2f4f] text-white'}`}
      >
        {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Guidelines Saved!</> : 'Save Grading Guidelines'}
      </motion.button>
    </div>
  );
}

// ── Blueprint Creator Tool ──────────────────────────────────
function BlueprintPanel() {
  const { saveTemplate } = useTemplateStore();
  const { addToast } = useToastStore();

  const [blueprintName, setBlueprintName] = useState('');
  const [blueprintDesc, setBlueprintDesc] = useState('');
  const [grade, setGrade] = useState('Grade 8');
  const [subject, setSubject] = useState('Science');

  const [sections, setSections] = useState([
    { type: 'mcq', label: 'MCQ (1 Mark)', count: 10, marksEach: 1 },
    { type: 'short', label: 'Short Answer (3 Marks)', count: 5, marksEach: 3 },
    { type: 'long', label: 'Long Answer (5 Marks)', count: 2, marksEach: 5 },
  ]);
  const [saved, setSaved] = useState(false);

  const totalMarks = sections.reduce((acc, s) => acc + s.count * s.marksEach, 0);
  const totalQuestions = sections.reduce((acc, s) => acc + s.count, 0);

  const update = (i: number, field: 'count' | 'marksEach', delta: number) => {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: Math.max(0, s[field] + delta) } : s));
  };

  const handleExport = async () => {
    if (!blueprintName.trim()) {
      addToast('Please enter a template blueprint name', 'info');
      return;
    }
    try {
      await saveTemplate({
        name: blueprintName,
        description: blueprintDesc || 'Assessment Blueprint Creator Preset',
        grade,
        subject,
        blueprint: {
          sections: sections.map(s => ({
            type: s.type,
            count: s.count,
            marks: s.marksEach
          }))
        }
      });
      setSaved(true);
      addToast(`Template blueprint "${blueprintName}" saved!`, 'success');
      setBlueprintName('');
      setBlueprintDesc('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      addToast('Failed to save blueprint: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans">
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Template Name</label>
          <input
            type="text"
            value={blueprintName}
            onChange={e => setBlueprintName(e.target.value)}
            placeholder="e.g. CBSE 8th Grade Science Paper"
            className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
          <input
            type="text"
            value={blueprintDesc}
            onChange={e => setBlueprintDesc(e.target.value)}
            placeholder="e.g. Standard layout for Term 1 exams"
            className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Grade Level</label>
          <input
            type="text"
            value={grade}
            onChange={e => setGrade(e.target.value)}
            className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full text-xs border border-classplus-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-bold text-classplus-text-primary">Section Breakdowns</span>
        <div className="flex gap-2">
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-600">{totalQuestions} Qs</span>
          <span className="text-[10px] bg-[#10375C]/10 border border-[#10375C]/20 px-2 py-0.5 rounded font-bold text-[#10375C]">{totalMarks} Marks</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((s, i) => (
          <div key={i} className="bg-gray-50 border border-classplus-card-border rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-classplus-text-primary capitalize">{s.label}</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Questions</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <button type="button" onClick={() => update(i, 'count', -1)} className="text-slate-400 hover:text-slate-700"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-bold text-classplus-text-primary w-6 text-center">{s.count}</span>
                  <button type="button" onClick={() => update(i, 'count', 1)} className="text-slate-400 hover:text-slate-700"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Marks Each</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <button type="button" onClick={() => update(i, 'marksEach', -1)} className="text-slate-400 hover:text-slate-700"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-bold text-classplus-text-primary w-6 text-center">{s.marksEach}</span>
                  <button type="button" onClick={() => update(i, 'marksEach', 1)} className="text-slate-400 hover:text-slate-700"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-550">
              <span>Subtotal</span>
              <span className="font-bold text-classplus-text-primary">
                {s.count * s.marksEach} marks ({Math.round((s.count * s.marksEach / Math.max(totalMarks, 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-[#10375C] h-full rounded-full"
                animate={{ width: `${Math.round((s.count * s.marksEach / Math.max(totalMarks, 1)) * 100)}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={handleExport}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#10375C] hover:bg-[#0d2f4f] text-white'}`}
      >
        {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Blueprint Saved!</> : 'Export Blueprint to Template Library'}
      </motion.button>
    </div>
  );
}

// ── Main Toolkit Page ──────────────────────────────────────
export default function ToolkitPage() {
  const { fetchProfile } = useProfileStore();
  const [activeTool, setActiveTool] = useState<ActiveTool>('syllabus');

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toolkits = [
    {
      id: 'syllabus' as ActiveTool,
      title: 'CBSE Syllabus Mapper',
      desc: 'Verify that questions align perfectly with recent NCERT Chapter Guidelines.',
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      activeColor: 'bg-emerald-500',
    },
    {
      id: 'grading' as ActiveTool,
      title: 'Grading Assistant Guidelines',
      desc: 'Formulate instructions for AI to ignore handwriting but penalize spelling errors.',
      icon: <Scale className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      activeColor: 'bg-indigo-500',
    },
    {
      id: 'blueprint' as ActiveTool,
      title: 'Assessment Blueprint Creator',
      desc: 'Structure section counts, weights, marks, and question formats before generation.',
      icon: <Settings className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      activeColor: 'bg-amber-500',
    }
  ];

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-bold text-classplus-text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5 text-classplus-orange" />
              <span>AI Teacher&apos;s Toolkit</span>
            </h2>
            <p className="text-[13px] text-classplus-text-secondary">
              Interactive utility tools to check syllabus alignments, configure AI grading guidelines, and design assessment blueprints.
            </p>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Main Widget Panel (Col span 2) */}
          <div className="lg:col-span-2 bg-white border border-classplus-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">

            {/* Sidebar tabs (on small screens) */}
            <div className="flex gap-2 p-4 border-b border-classplus-card-border lg:hidden overflow-x-auto">
              {toolkits.map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${activeTool === t.id ? 'bg-[#10375C] text-white' : 'bg-slate-100 text-slate-655 hover:bg-slate-250'}`}
                >
                  {t.title.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTool === 'syllabus' && (
                <motion.div
                  key="syllabus"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-50 p-5 border-b border-classplus-card-border flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-classplus-text-primary">CBSE Syllabus Mapper</h3>
                  </div>
                  <div className="p-5">
                    <SyllabusMapperPanel />
                  </div>
                </motion.div>
              )}

              {activeTool === 'grading' && (
                <motion.div
                  key="grading"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-50 p-5 border-b border-classplus-card-border flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-classplus-text-primary">Grading Assistant Guidelines</h3>
                  </div>
                  <div className="p-5">
                    <GradingGuidelinesPanel />
                  </div>
                </motion.div>
              )}

              {activeTool === 'blueprint' && (
                <motion.div
                  key="blueprint"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-50 p-5 border-b border-classplus-card-border flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-classplus-text-primary">Assessment Blueprint Creator</h3>
                  </div>
                  <div className="p-5">
                    <BlueprintPanel />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other Tools Sidebar */}
          <div className="flex flex-col gap-4 select-none">
            <h3 className="text-sm font-bold text-classplus-text-primary uppercase tracking-wider font-sans">Other AI Tools</h3>

            {toolkits.map((tool) => (
              <div
                key={tool.id}
                className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-3 group cursor-pointer transition-all ${
                  activeTool === tool.id
                    ? `border-[#10375C] ring-1 ring-[#10375C]/20`
                    : 'border-classplus-card-border hover:border-gray-300'
                }`}
                onClick={() => setActiveTool(tool.id)}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-8 h-8 rounded-lg ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                    {tool.icon}
                  </div>
                  {activeTool === tool.id ? (
                    <span className="text-[10px] text-[#10375C] bg-[#10375C]/10 px-2 py-0.5 rounded font-bold border border-[#10375C]/20 font-sans">Active</span>
                  ) : (
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold font-sans">Ready</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 mt-1 font-sans">
                  <h4 className={`text-sm font-bold transition-colors ${activeTool === tool.id ? 'text-[#10375C]' : 'text-classplus-text-primary group-hover:text-[#10375C]'}`}>
                    {tool.title}
                  </h4>
                  <p className="text-[12px] text-classplus-text-secondary leading-relaxed font-sans mt-0.5">
                    {tool.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
