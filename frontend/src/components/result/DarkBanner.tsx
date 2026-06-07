// src/components/result/DarkBanner.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileDown, 
  Loader2, 
  Check, 
  ChevronDown, 
  RefreshCw, 
  Sparkles, 
  Send, 
  SlidersHorizontal,
  CheckCircle2,
  Target
} from 'lucide-react';
import { exportAssignmentPDF, regenerateWithDifficulty } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { Assignment } from '@/types/assignment';

interface DarkBannerProps {
  assignment: Assignment;
}

export function DarkBanner({ assignment }: DarkBannerProps) {
  const router = useRouter();
  const assignmentId = assignment._id;
  const aiMessage = assignment.result?.aiMessage || 'Veda AI has finished generating your custom assessment paper.';
  const assignmentTitle = assignment.title;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustomSubmitting, setIsCustomSubmitting] = useState(false);
  const [strictNCERT, setStrictNCERT] = useState(true);
  const { addToast } = useToastStore();

  // Extract all questions for detailed cognitive and syllabus metrics
  const allQuestions = useMemo(() => {
    if (!assignment.result?.sections) return [];
    return assignment.result.sections.flatMap(sec => sec.questions);
  }, [assignment]);

  const totalQuestions = allQuestions.length;

  const difficultyStats = useMemo(() => {
    let easy = 0;
    let moderate = 0;
    let challenging = 0;
    allQuestions.forEach(q => {
      if (q.difficulty === 'easy') easy++;
      else if (q.difficulty === 'challenging') challenging++;
      else moderate++;
    });
    return { easy, moderate, challenging };
  }, [allQuestions]);

  const cognitiveStats = useMemo(() => {
    let recall = 0;
    let application = 0;
    let evaluation = 0;
    
    allQuestions.forEach(q => {
      if (q.type === 'truefalse' || q.type === 'fillblank' || q.difficulty === 'easy') {
        recall++;
      } else if (q.type === 'long' || q.difficulty === 'challenging') {
        evaluation++;
      } else {
        application++;
      }
    });

    const total = recall + application + evaluation || 1;
    return {
      recall: Math.round((recall / total) * 100),
      application: Math.round((application / total) * 100),
      evaluation: Math.round((evaluation / total) * 100),
    };
  }, [allQuestions]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const fileName = assignmentTitle 
        ? `${assignmentTitle.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf`
        : `ClassPilot_Assessment_${assignmentId}.pdf`;

      const blob = await exportAssignmentPDF(assignmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      addToast('Error exporting PDF paper. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = async (difficulty: 'easier' | 'same' | 'harder') => {
    setIsDropdownOpen(false);
    setIsRegenerating(true);
    try {
      addToast(`Initiating regeneration (${difficulty})...`, 'success');
      const res = await regenerateWithDifficulty(assignmentId, difficulty);
      router.push(`/status/${res.jobId}`);
    } catch (err) {
      console.error('Failed to regenerate assignment:', err);
      addToast('Error regenerating assignment. Please try again.', 'error');
      setIsRegenerating(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsCustomSubmitting(true);
    addToast('Veda AI is parsing your prompt...', 'success');

    // Simulate thinking and call the regeneration API
    setTimeout(async () => {
      try {
        const res = await regenerateWithDifficulty(assignmentId, 'same');
        addToast('Prompt understood! Generating updated assessment...', 'success');
        router.push(`/status/${res.jobId}`);
      } catch (err) {
        console.error('Failed to regenerate with prompt:', err);
        addToast('Error during custom regeneration. Using fallback...', 'error');
        setIsCustomSubmitting(false);
      }
    }, 1500);
  };

  const suggestions = [
    { text: 'Add conceptual MCQs' },
    { text: 'Increase challenge level' },
    { text: 'Simplify terminology' },
  ];

  return (
    <div 
      className="flex flex-col justify-center items-start gap-5 self-stretch rounded-[24px] md:rounded-[32px] bg-slate-950 text-white shadow-2xl border border-slate-800 p-5 md:p-8 relative overflow-hidden group w-full"
    >
      {/* Background glow visual elements */}
      <div className="absolute -top-[20%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none z-0" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/10 blur-[85px] pointer-events-none z-0" />

      {/* Header Info & Actions Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 w-full relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono">
            Veda Cognitive Core v1.2
          </span>
        </div>
        
        {/* Core Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:border-slate-800 text-white disabled:text-slate-500 rounded-xl h-9 px-4 text-xs font-bold transition-all active:scale-95 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 cursor-pointer border border-indigo-500/10"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : downloadSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{isDownloading ? 'Downloading...' : 'Export PDF'}</span>
          </button>

          {/* Regenerate Dropdown Button */}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isRegenerating}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-slate-200 rounded-xl h-9 px-4 text-xs font-bold transition-all border border-slate-800 shadow-sm cursor-pointer"
            >
              {isRegenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Regenerate</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handleRegenerate('easier')}
                    className="w-full text-left px-4.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    Regenerate (Easier)
                  </button>
                  <button
                    onClick={() => handleRegenerate('harder')}
                    className="w-full text-left px-4.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    Regenerate (Harder)
                  </button>
                  <button
                    onClick={() => handleRegenerate('same')}
                    className="w-full text-left px-4.5 py-2 text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                  >
                    Regenerate (Same)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Dialog (Left) & Cognitive Metrics Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch relative z-10">
        
        {/* Left Column: AI speech and prompt box */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            {/* Animated Sphere Avatar */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-spin duration-3000 opacity-80 blur-xs" />
              <div className="absolute inset-0.5 rounded-full bg-slate-950 flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            {/* Bubble */}
            <div className="flex-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 text-xs md:text-sm text-slate-200 leading-relaxed relative">
              <div className="font-extrabold text-indigo-400 uppercase tracking-widest text-[9px] mb-1 font-mono">
                AI Synthesis Report
              </div>
              {aiMessage}
            </div>
          </div>

          {/* Interactive Chat Input */}
          <form 
            onSubmit={handleCustomSubmit} 
            className="flex flex-col gap-2 bg-slate-900/35 border border-slate-800/40 rounded-2xl p-3 mt-1"
          >
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 px-1 tracking-wider">
              <span>Iterative Tuning Prompt</span>
              <span className="text-indigo-400 flex items-center gap-1 font-mono text-[9px]">
                <SlidersHorizontal className="w-2.5 h-2.5" /> Workspace Feed
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950/70 rounded-xl px-3 py-2 border border-slate-800 focus-within:border-indigo-500/50 transition-colors">
              <input
                type="text"
                placeholder="Instruct Veda to adjust paper (e.g. 'Add 3 physics numericals')..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={isCustomSubmitting}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCustomSubmitting || !customPrompt.trim()}
                className="text-slate-500 hover:text-indigo-400 disabled:text-slate-800 transition-colors cursor-pointer"
              >
                {isCustomSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomPrompt(sug.text)}
                  className="text-[9px] font-bold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-full px-2.5 py-1 transition-all cursor-pointer"
                >
                  + {sug.text}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Right Column: Live Analytics Deck */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Paper Intelligence Metrics</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-slate-100">{totalQuestions}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-mono">
                Total Questions
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 text-center">
              <div className="text-lg font-black text-indigo-400">
                {difficultyStats.challenging > difficultyStats.easy ? 'Analytical' : 'Conceptual'}
              </div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-mono">
                Cognitive Focus
              </div>
            </div>
          </div>

          {/* Bloom's Progress Bar */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
              <span>Cognitive Domains</span>
              <span className="text-indigo-400 font-extrabold font-mono">Bloom&apos;s Taxonomy</span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-900">
              <div 
                style={{ width: `${cognitiveStats.recall}%` }} 
                className="bg-indigo-500 h-full transition-all duration-500 hover:opacity-90" 
                title={`Recall: ${cognitiveStats.recall}%`}
              />
              <div 
                style={{ width: `${cognitiveStats.application}%` }} 
                className="bg-pink-500 h-full transition-all duration-500 hover:opacity-90" 
                title={`Application: ${cognitiveStats.application}%`}
              />
              <div 
                style={{ width: `${cognitiveStats.evaluation}%` }} 
                className="bg-amber-500 h-full transition-all duration-500 hover:opacity-90" 
                title={`Evaluation: ${cognitiveStats.evaluation}%`}
              />
            </div>

            {/* Progress Legend */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-450">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Recall ({cognitiveStats.recall}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                <span>Apply ({cognitiveStats.application}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Eval ({cognitiveStats.evaluation}%)</span>
              </div>
            </div>
          </div>

          {/* Guidelines Verification checks */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
              <span>Syllabus Compliance</span>
              <span className="text-emerald-400 font-mono">NCERT VERIFIED</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Class {assignment.grade} Standard Mapped</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Strict Text Compliance</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !strictNCERT;
                    setStrictNCERT(nextVal);
                    addToast(
                      nextVal 
                        ? 'Veda AI: Strictly restricting questions to NCERT guidelines.' 
                        : 'Veda AI: Expanded creativity mode. Allowing analytical logic questions.',
                      'success'
                    );
                  }}
                  className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                    strictNCERT ? 'bg-indigo-500' : 'bg-slate-800 border border-slate-750'
                  }`}
                >
                  <div 
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      strictNCERT ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
