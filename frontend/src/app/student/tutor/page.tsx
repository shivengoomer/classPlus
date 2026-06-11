// src/app/student/tutor/page.tsx — AI Study Companion (Real Groq)
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, ArrowLeft, Plus, Trash2, BookOpen, Sparkles } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { tutorChat } from '@/lib/studentApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Explain Newton's Laws of Motion with examples",
  "What is photosynthesis and how does it work?",
  "How do you solve quadratic equations?",
  "What causes seasons on Earth?",
  "Explain the water cycle",
  "What is the difference between acids and bases?",
  "How does the digestive system work?",
  "Explain the French Revolution",
];

export default function TutorPage() {
  const router = useRouter();
  const { studentName, groups, _hasHydrated } = useStudentStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [authLoading, setAuthLoading] = useState(true);

  const activeGroup = groups.find(g => g._id === selectedGroupId) || null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSelectedDefaultRef = useRef(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!studentName) {
      router.push('/student');
      return;
    }
    setAuthLoading(false);
  }, [_hasHydrated, studentName, router]);

  useEffect(() => {
    if (_hasHydrated && !hasSelectedDefaultRef.current) {
      hasSelectedDefaultRef.current = true;
      if (groups && groups.length > 0) {
        setSelectedGroupId(groups[0]._id);
      }
    }
  }, [_hasHydrated, groups]);

  // Load chat history from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('tutor_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {}
    }
  }, []);

  // Save to sessionStorage on every message change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('tutor_history', JSON.stringify(messages));
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!_hasHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#10375C]/30 border-t-[#10375C] rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading AI tutor workspace…</p>
        </div>
      </div>
    );
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    setError('');

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { reply } = await tutorChat(text, history, activeGroup?.subject, activeGroup?.grade);
      const assistantMsg: Message = { role: 'assistant', content: reply, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError('AI tutor is unavailable. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // remove the user message if failed
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    sessionStorage.removeItem('tutor_history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/student/dashboard')} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">AI Study Companion</h1>
              {groups && groups.length > 0 ? (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-350 rounded-lg px-2 py-0.5 mt-1 outline-none font-bold text-slate-600 cursor-pointer"
                >
                  <option value="all">All Subjects</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>
                      {g.grade} {g.subject} ({g.name})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[10px] text-slate-400">All subjects</p>
              )}
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col gap-4">
          
          {/* Empty state with suggested questions */}
          {messages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8 py-10"
            >
              <div className="text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Hello{studentName ? `, ${studentName.split(' ')[0]}` : ''}! 👋</h2>
                  <p className="text-slate-500 text-sm mt-1">I&apos;m your personal AI tutor. Ask me anything about your subjects!</p>
                </div>
              </div>

              <div className="w-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Suggested Questions</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendMessage(q)}
                      className="text-xs bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-3 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3" />
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#10375C] text-white rounded-tr-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {error && (
            <div className="text-center text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl p-2">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white/90 backdrop-blur-md border-t border-slate-200 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 focus-within:border-indigo-400 rounded-2xl px-4 py-2.5 transition-colors"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              disabled={loading}
              className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">Powered by Groq Llama AI • Responses may not always be 100% accurate</p>
        </div>
      </div>
    </div>
  );
}
