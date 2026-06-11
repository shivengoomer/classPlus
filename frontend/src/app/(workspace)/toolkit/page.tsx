// src/app/toolkit/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { Cpu, Sparkle, Plus, Minus, Scale, CheckSquare, Settings, CheckCircle2, AlertCircle, BookOpen, SlidersHorizontal } from 'lucide-react';

interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
}

type ActiveTool = 'rubric' | 'syllabus' | 'grading' | 'blueprint';

// ── Syllabus Mapper Tool ──────────────────────────────────
function SyllabusMapperPanel() {
  const grades = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'History'];
  const [grade, setGrade] = useState('Grade 8');
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<null | { score: number; items: { label: string; ok: boolean }[] }>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const items = [
        { label: `${topic} covered in ${grade} NCERT Chapter`, ok: true },
        { label: `Terminology aligns with ${subject} syllabus`, ok: true },
        { label: `Marks distribution within board guidelines`, ok: Math.random() > 0.3 },
        { label: `Learning outcomes mapped to competency rubric`, ok: Math.random() > 0.2 },
        { label: `No out-of-syllabus content detected`, ok: Math.random() > 0.15 },
      ];
      const score = Math.round((items.filter(i => i.ok).length / items.length) * 100);
      setResult({ score, items });
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Grade Level</label>
          <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full text-xs border border-veda-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-emerald-400 cursor-pointer font-sans">
            {grades.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full text-xs border border-veda-card-border rounded-lg px-3 py-2 bg-white outline-none focus:border-emerald-400 cursor-pointer font-sans">
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
          className="w-full text-xs border border-veda-card-border rounded-lg px-3 py-2.5 outline-none focus:border-emerald-400 font-sans"
        />
      </div>
      <PillButton variant="primary" className="w-full justify-center text-xs !py-2.5" onClick={handleCheck}>
        {loading ? 'Checking Alignment...' : 'Check NCERT Alignment'}
      </PillButton>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${result.score >= 80 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className={`text-2xl font-black ${result.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{result.score}%</div>
              <div>
                <span className={`text-xs font-bold ${result.score >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>Alignment Score</span>
                <p className="text-[10px] text-slate-500 mt-0.5">{result.score >= 80 ? 'Well-aligned with NCERT curriculum.' : 'Review flagged areas below.'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  {item.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  <span className={item.ok ? 'text-slate-700' : 'text-amber-700'}>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Grading Guidelines Tool ───────────────────────────────
function GradingGuidelinesPanel() {
  const [ignoreHandwriting, setIgnoreHandwriting] = useState(true);
  const [strictSpelling, setStrictSpelling] = useState(false);
  const [partialFormulas, setPartialFormulas] = useState(true);
  const [penaltyPct, setPenaltyPct] = useState(10);
  const [customRule, setCustomRule] = useState('');
  const [rules, setRules] = useState<string[]>(['Penalize off-topic answers by 50%.']);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-veda-text-primary font-medium">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#10375C]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 border border-veda-card-border rounded-xl p-4 flex flex-col">
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
                setRules(prev => [...prev, customRule.trim()]);
                setCustomRule('');
              }
            }}
            placeholder="e.g. Reward innovative solutions..."
            className="flex-1 text-xs border border-veda-card-border rounded-lg px-3 py-2 outline-none focus:border-indigo-400 font-sans"
          />
          <button
            onClick={() => {
              if (customRule.trim()) { setRules(prev => [...prev, customRule.trim()]); setCustomRule(''); }
            }}
            className="px-3 py-2 bg-[#10375C] text-white rounded-lg text-xs font-bold hover:bg-[#0d2f4f] transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {rules.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-3">
            {rules.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                <span className="flex-1">{r}</span>
                <button onClick={() => setRules(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 transition-colors">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <motion.button
        onClick={handleSave}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#10375C] hover:bg-[#0d2f4f] text-white'}`}
      >
        {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Guidelines Saved!</> : 'Save Grading Guidelines'}
      </motion.button>
    </div>
  );
}

// ── Blueprint Creator Tool ────────────────────────────────
function BlueprintPanel() {
  const [sections, setSections] = useState([
    { type: 'MCQ', count: 10, marksEach: 1 },
    { type: 'Short Answer', count: 5, marksEach: 3 },
    { type: 'Long Answer', count: 2, marksEach: 8 },
  ]);
  const [saved, setSaved] = useState(false);

  const totalMarks = sections.reduce((acc, s) => acc + s.count * s.marksEach, 0);
  const totalQuestions = sections.reduce((acc, s) => acc + s.count, 0);

  const update = (i: number, field: 'count' | 'marksEach', delta: number) => {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: Math.max(0, s[field] + delta) } : s));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-veda-text-primary">Assessment Blueprint</span>
        <div className="flex gap-2">
          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-600">{totalQuestions} Qs</span>
          <span className="text-[10px] bg-[#10375C]/10 border border-[#10375C]/20 px-2 py-0.5 rounded font-bold text-[#10375C]">{totalMarks} Marks</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((s, i) => (
          <div key={i} className="bg-gray-50 border border-veda-card-border rounded-xl p-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-veda-text-primary">{s.type}</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Questions</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <button onClick={() => update(i, 'count', -1)} className="text-slate-400 hover:text-slate-700"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-bold text-veda-text-primary w-6 text-center">{s.count}</span>
                  <button onClick={() => update(i, 'count', 1)} className="text-slate-400 hover:text-slate-700"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Marks Each</label>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <button onClick={() => update(i, 'marksEach', -1)} className="text-slate-400 hover:text-slate-700"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-bold text-veda-text-primary w-6 text-center">{s.marksEach}</span>
                  <button onClick={() => update(i, 'marksEach', 1)} className="text-slate-400 hover:text-slate-700"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Subtotal</span>
              <span className="font-bold text-veda-text-primary">{s.count * s.marksEach} marks ({Math.round((s.count * s.marksEach / Math.max(totalMarks, 1)) * 100)}%)</span>
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
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#10375C] hover:bg-[#0d2f4f] text-white'}`}
      >
        {saved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Blueprint Saved!</> : 'Export Blueprint'}
      </motion.button>
    </div>
  );
}

// ── Main Toolkit Page ─────────────────────────────────────
export default function ToolkitPage() {
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    { id: 'crit-1', name: 'NCERT Syllabus Accuracy', weight: 40, description: 'Accurate facts, terminology, and alignment with textbook chapters.' },
    { id: 'crit-2', name: 'Conceptual Clarity', weight: 30, description: 'Shows detailed step-by-step thinking or descriptive reasoning.' },
    { id: 'crit-3', name: 'Formula & Calculations', weight: 30, description: 'Correct formula selection, execution, and unit representation.' }
  ]);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(20);
  const [rubricSaved, setRubricSaved] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>('rubric');

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const handleAddCriterion = () => {
    if (!newCritName) return;
    const item: RubricCriterion = {
      id: `crit-${Date.now()}`,
      name: newCritName,
      weight: newCritWeight,
      description: newCritDesc || 'No description provided.'
    };
    setCriteria([...criteria, item]);
    setNewCritName('');
    setNewCritDesc('');
    setNewCritWeight(20);
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const handleWeightChange = (id: string, delta: number) => {
    setCriteria(criteria.map(c => {
      if (c.id === id) {
        const val = Math.max(5, c.weight + delta);
        return { ...c, weight: val };
      }
      return c;
    }));
  };

  const handleSaveRubric = () => {
    setRubricSaved(true);
    setTimeout(() => setRubricSaved(false), 2500);
  };

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
            <h2 className="text-[20px] font-bold text-veda-text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5 text-veda-orange" />
              <span>AI Teacher&apos;s Toolkit</span>
            </h2>
            <p className="text-[13px] text-veda-text-secondary">
              Interactive utility tools to refine rubrics, check syllabus alignments, and configure marking blueprints.
            </p>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Main Rubric Builder Widget (Col span 2) — shown when activeTool is 'rubric' */}
          <div className="lg:col-span-2 bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">

            {/* Sidebar tool selector tabs (inline above when on small screen, hidden on desktop) */}
            <div className="flex gap-2 p-4 border-b border-veda-card-border lg:hidden overflow-x-auto">
              <button
                onClick={() => setActiveTool('rubric')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${activeTool === 'rubric' ? 'bg-[#10375C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <SlidersHorizontal className="w-3 h-3 inline mr-1" />Rubric Builder
              </button>
              {toolkits.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${activeTool === t.id ? 'bg-[#10375C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t.title.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTool === 'rubric' && (
                <motion.div
                  key="rubric"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Widget Title */}
                  <div className="bg-gray-50 p-5 border-b border-veda-card-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-5 h-5 text-veda-orange fill-veda-orange animate-pulse" />
                      <h3 className="text-sm font-bold text-veda-text-primary">
                        Interactive Assessment Rubric Builder
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        totalWeight === 100
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        Weight: {totalWeight}% {totalWeight === 100 ? '✓ Balanced' : '(Needs 100%)'}
                      </span>
                    </div>
                  </div>

                  {/* Criteria List */}
                  <div className="p-5 flex flex-col gap-4 font-sans">
                    <div className="flex flex-col gap-3">
                      {criteria.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 border border-veda-card-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col gap-1 max-w-md">
                            <span className="text-sm font-bold text-veda-text-primary">{c.name}</span>
                            <p className="text-xs text-veda-text-secondary leading-relaxed">{c.description}</p>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                            {/* Weight Controller */}
                            <div className="flex items-center gap-3 bg-white border border-veda-card-border rounded-lg px-2 py-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => handleWeightChange(c.id, -5)}
                                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-veda-text-primary"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-veda-text-primary w-8 text-center">{c.weight}%</span>
                              <button
                                type="button"
                                onClick={() => handleWeightChange(c.id, 5)}
                                className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-veda-text-primary"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Weight bar */}
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <motion.div
                                className="bg-[#10375C] h-full rounded-full"
                                animate={{ width: `${Math.min(c.weight, 100)}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(c.id)}
                              className="text-xs text-red-500 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Criterion Form */}
                    <div className="border-t border-gray-100 pt-5 mt-2 flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-veda-text-primary uppercase tracking-wider">
                        Add Custom Grading Criterion
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Criterion Name (e.g. Vocabulary)"
                          value={newCritName}
                          onChange={(e) => setNewCritName(e.target.value)}
                          className="md:col-span-2 text-xs border border-veda-card-border p-2.5 rounded-lg outline-none focus:border-gray-400"
                        />
                        <div className="flex items-center justify-between border border-veda-card-border px-3 rounded-lg bg-gray-50">
                          <span className="text-[11px] text-gray-500">Weighting:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setNewCritWeight(Math.max(5, newCritWeight - 5))}
                              className="p-0.5 rounded text-gray-500 hover:bg-gray-250"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-veda-text-primary">{newCritWeight}%</span>
                            <button
                              type="button"
                              onClick={() => setNewCritWeight(Math.min(100, newCritWeight + 5))}
                              className="p-0.5 rounded text-gray-500 hover:bg-gray-250"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Criterion description (e.g. Assessment of grammar patterns...)"
                        value={newCritDesc}
                        onChange={(e) => setNewCritDesc(e.target.value)}
                        className="text-xs border border-veda-card-border p-2.5 rounded-lg outline-none focus:border-gray-400 w-full"
                      />
                      <div className="flex justify-end gap-3 mt-1">
                        <PillButton
                          variant="primary"
                          className="text-xs !py-2"
                          onClick={handleAddCriterion}
                        >
                          Add Criterion
                        </PillButton>
                      </div>
                    </div>

                    {/* Save Rubric */}
                    <motion.button
                      onClick={handleSaveRubric}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                        totalWeight === 100
                          ? rubricSaved
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-[#10375C] hover:bg-[#0d2f4f] text-white border-[#10375C]'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                      disabled={totalWeight !== 100}
                    >
                      {rubricSaved ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Rubric Configuration Saved!</>
                      ) : (
                        <><CheckSquare className="w-3.5 h-3.5" /> {totalWeight === 100 ? 'Save Rubric Configuration' : `Adjust to 100% to save (${totalWeight}% now)`}</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTool === 'syllabus' && (
                <motion.div
                  key="syllabus"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-gray-50 p-5 border-b border-veda-card-border flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-veda-text-primary">CBSE Syllabus Mapper</h3>
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
                  <div className="bg-gray-50 p-5 border-b border-veda-card-border flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-veda-text-primary">Grading Assistant Guidelines</h3>
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
                  <div className="bg-gray-50 p-5 border-b border-veda-card-border flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-bold text-veda-text-primary">Assessment Blueprint Creator</h3>
                  </div>
                  <div className="p-5">
                    <BlueprintPanel />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other Tools Sidebar */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-veda-text-primary uppercase tracking-wider">Other AI Tools</h3>

            {/* Rubric Builder button */}
            <div
              onClick={() => setActiveTool('rubric')}
              className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-3 group cursor-pointer transition-all ${
                activeTool === 'rubric'
                  ? 'border-[#10375C] ring-1 ring-[#10375C]/20'
                  : 'border-veda-card-border hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                </div>
                {activeTool === 'rubric' && (
                  <span className="text-[10px] text-[#10375C] bg-[#10375C]/10 px-2 py-0.5 rounded font-bold border border-[#10375C]/20">Active</span>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <h4 className={`text-sm font-bold transition-colors ${activeTool === 'rubric' ? 'text-[#10375C]' : 'text-veda-text-primary group-hover:text-[#10375C]'}`}>
                  Rubric Builder
                </h4>
                <p className="text-[12px] text-veda-text-secondary leading-relaxed font-sans mt-0.5">
                  Build and balance custom grading rubrics for any assignment type.
                </p>
              </div>
            </div>

            {toolkits.map((tool) => (
              <div
                key={tool.id}
                className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-3 group cursor-pointer transition-all ${
                  activeTool === tool.id
                    ? `border-[#10375C] ring-1 ring-[#10375C]/20`
                    : 'border-veda-card-border hover:border-gray-300'
                }`}
                onClick={() => setActiveTool(tool.id)}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-8 h-8 rounded-lg ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                    {tool.icon}
                  </div>
                  {activeTool === tool.id ? (
                    <span className="text-[10px] text-[#10375C] bg-[#10375C]/10 px-2 py-0.5 rounded font-bold border border-[#10375C]/20">Active</span>
                  ) : (
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">Ready</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <h4 className={`text-sm font-bold transition-colors ${activeTool === tool.id ? 'text-[#10375C]' : 'text-veda-text-primary group-hover:text-[#10375C]'}`}>
                    {tool.title}
                  </h4>
                  <p className="text-[12px] text-veda-text-secondary leading-relaxed font-sans mt-0.5">
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
