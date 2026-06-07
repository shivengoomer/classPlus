// src/app/toolkit/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { Cpu, Sparkle, Plus, Minus, Scale, CheckSquare, Settings } from 'lucide-react';

interface RubricCriterion {
  id: string;
  name: string;
  weight: number; // percentage
  description: string;
}

export default function ToolkitPage() {
  const router = useRouter();
  const [criteria, setCriteria] = useState<RubricCriterion[]>([
    { id: 'crit-1', name: 'NCERT Syllabus Accuracy', weight: 40, description: 'Accurate facts, terminology, and alignment with textbook chapters.' },
    { id: 'crit-2', name: 'Conceptual Clarity', weight: 30, description: 'Shows detailed step-by-step thinking or descriptive reasoning.' },
    { id: 'crit-3', name: 'Formula & Calculations', weight: 30, description: 'Correct formula selection, execution, and unit representation.' }
  ]);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(20);

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

  const toolkits = [
    {
      title: 'CBSE Syllabus Mapper',
      desc: 'Verify that questions align perfectly with recent NCERT Chapter Guidelines.',
      status: 'Ready',
      icon: <CheckSquare className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50'
    },
    {
      title: 'Grading Assistant Guidelines',
      desc: 'Formulate instructions for AI to ignore handwriting but penalize spelling errors.',
      status: 'Ready',
      icon: <Scale className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50'
    },
    {
      title: 'Assessment Blueprint Creator',
      desc: 'Structure section counts, weights, marks, and question formats before generation.',
      status: 'Ready',
      icon: <Settings className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50'
    }
  ];

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
        <div className="relative w-full min-h-[550px]">
          {/* Blurry original content */}
          <div className="blur-[5px] select-none pointer-events-none opacity-40 flex flex-col gap-6">
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
            
            {/* Main Rubric Builder Widget (Col span 2) */}
            <div className="lg:col-span-2 bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              
              {/* Widget Title */}
              <div className="bg-gray-50 p-5 border-b border-veda-card-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-veda-orange fill-veda-orange animate-pulse" />
                  <h3 className="text-sm font-bold text-veda-text-primary">
                    Interactive Assessment Rubric Builder
                  </h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  totalWeight === 100 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  Weight: {totalWeight}% {totalWeight === 100 ? '(Balanced)' : `(Needs 100%)`}
                </span>
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

                        {/* Remove Button */}
                        <button 
                          type="button"
                          onClick={() => handleRemoveCriterion(c.id)}
                          className="text-xs text-red-600 font-bold hover:underline"
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
                    placeholder="Criterion description (e.g. Assessment of grammar patterns, formatting, and structural checks.)"
                    value={newCritDesc}
                    onChange={(e) => setNewCritDesc(e.target.value)}
                    className="text-xs border border-veda-card-border p-2.5 rounded-lg outline-none focus:border-gray-400 w-full"
                  />
                  <div className="flex justify-end mt-1">
                    <PillButton
                      variant="primary"
                      className="text-xs !py-2"
                      onClick={handleAddCriterion}
                    >
                      Add Criterion
                    </PillButton>
                  </div>
                </div>

              </div>
            </div>

            {/* Other Tools Widgets Listing (Col span 1) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-veda-text-primary uppercase tracking-wider">
                Other AI Assits
              </h3>
              {toolkits.map((tool, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-veda-card-border rounded-xl p-5 shadow-sm flex flex-col gap-3 group hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => {}}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-lg ${tool.bg} flex items-center justify-center flex-shrink-0`}>
                      {tool.icon}
                    </div>
                    <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">
                      {tool.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <h4 className="text-sm font-bold text-veda-text-primary group-hover:text-veda-orange transition-colors">
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

        {/* Premium Coming Soon Card */}
        <div className="absolute inset-0 flex items-start justify-center p-4 pt-16 md:pt-24 z-20">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col items-center text-center gap-6 border-gray-100">
            {/* Tag badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-[#10375C] shadow-md shadow-[#10375C]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Coming Soon</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center justify-center text-veda-orange shadow-inner">
              <Cpu className="w-8 h-8 text-veda-orange" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-[#303030] font-sans tracking-tight">
                AI Teacher&apos;s Toolkit
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans px-2">
                We are building advanced tools to check syllabus alignments, design grading rubrics, inspect NCERT standards, and generate assessment guidelines.
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#181818] rounded-full shadow-lg hover:bg-black active:scale-95 transition-all font-sans"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
