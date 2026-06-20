// src/app/(workspace)/bank/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { listBankQuestions, deleteFromBank } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { 
  Search, Filter, Trash2, BookOpen, Loader2, Award, ClipboardList, 
  HelpCircle, ChevronRight, Tag 
} from 'lucide-react';

const SUBJECTS = ['All', 'Science', 'Mathematics', 'Social Science', 'English'];
const GRADES = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function BankPage() {
  const { addToast } = useToastStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [grade, setGrade] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (subject !== 'All') filters.subject = subject;
      if (grade !== 'All') filters.grade = grade;
      if (difficulty !== 'All') filters.difficulty = difficulty;
      if (search.trim()) filters.search = search.trim();

      const data = await listBankQuestions(filters);
      setQuestions(data);
      if (data.length > 0) {
        setSelectedQuestion(data[0]);
      } else {
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error('Failed to load bank questions', err);
      addToast('Failed to fetch bank questions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subject, grade, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this question from your Item Bank?')) return;

    try {
      await deleteFromBank(id);
      addToast('Question removed from bank.', 'success');
      // Refresh list
      setQuestions(prev => prev.filter(q => q._id !== id));
      if (selectedQuestion?._id === id) {
        setSelectedQuestion(questions.find(q => q._id !== id) || null);
      }
    } catch (err) {
      console.error('Failed to delete question', err);
      addToast('Failed to delete question from bank.', 'error');
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full font-sans pb-12">
        {/* Page Title Banner */}
        <div className="bg-[#10375C] text-white rounded-[32px] p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Question Item Bank</h2>
              <p className="text-xs text-indigo-200 mt-0.5">Manage and reuse CBSE/NCERT curriculum questions across custom assessments</p>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search question text…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#10375C] bg-slate-50 font-medium"
              />
            </div>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#10375C] hover:bg-[#0d2f4f] text-white text-xs font-bold transition-all border-0 shadow-sm cursor-pointer select-none">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Subject */}
            <div className="flex flex-col min-w-[120px] flex-1 sm:flex-initial">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white cursor-pointer select-none outline-none">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Grade */}
            <div className="flex flex-col min-w-[120px] flex-1 sm:flex-initial">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Grade</label>
              <select value={grade} onChange={e => setGrade(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white cursor-pointer select-none outline-none">
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col min-w-[120px] flex-1 sm:flex-initial">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white cursor-pointer select-none outline-none">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Core Layout Split screen */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
          {/* Left panel: list of questions */}
          <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm max-h-[750px] overflow-y-auto pr-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Saved Questions ({questions.length})</h3>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <HelpCircle className="w-10 h-10 text-slate-300 animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-slate-700">No questions found</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Try adjusting filters or saving questions from assessments</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {questions.map((q) => {
                  const isSelected = selectedQuestion?._id === q._id;
                  return (
                    <div
                      key={q._id}
                      onClick={() => setSelectedQuestion(q)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative group flex justify-between gap-4 ${
                        isSelected 
                          ? 'border-[#10375C] bg-[#10375C]/5 shadow-sm shadow-[#10375C]/5' 
                          : 'border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            q.difficulty === 'Easy' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            'bg-rose-50 border-rose-100 text-rose-700'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-wide">
                            {q.subject} · {q.grade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed truncate max-w-lg mt-0.5">{q.questionText}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDelete(q._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl border-0 bg-transparent cursor-pointer"
                          title="Delete from bank"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: preview of selected question */}
          <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm self-start flex flex-col gap-5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Question Preview</span>
            </h3>

            {selectedQuestion ? (
              <div className="flex flex-col gap-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5">
                    <p className="text-[8px] text-slate-400">Difficulty</p>
                    <p className="text-slate-800 mt-0.5">{selectedQuestion.difficulty}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5">
                    <p className="text-[8px] text-slate-400">Type</p>
                    <p className="text-slate-800 mt-0.5 uppercase">{selectedQuestion.type}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5">
                    <p className="text-[8px] text-slate-400">Subject</p>
                    <p className="text-slate-800 mt-0.5 truncate">{selectedQuestion.subject}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-2.5">
                    <p className="text-[8px] text-slate-400">Grade</p>
                    <p className="text-slate-800 mt-0.5">{selectedQuestion.grade}</p>
                  </div>
                </div>

                {/* Text */}
                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 mt-2">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Question Text</h4>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{selectedQuestion.questionText}</p>
                </div>

                {/* MCQ Options */}
                {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                  <div className="flex flex-col gap-2 pl-2">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Answer Options</h4>
                    {selectedQuestion.options.map((option: string, idx: number) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-slate-900 font-bold">{letter}.</span>
                          <span className="leading-snug">{option}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Correct Answer */}
                {selectedQuestion.correctAnswer && (
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                    <h4 className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Correct Answer</h4>
                    <p className="text-xs font-bold text-emerald-800 leading-normal">{selectedQuestion.correctAnswer}</p>
                  </div>
                )}

                {/* Explanation */}
                {selectedQuestion.bloomLevel && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Bloom Level: {selectedQuestion.bloomLevel}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Select a question on the left to preview details.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
