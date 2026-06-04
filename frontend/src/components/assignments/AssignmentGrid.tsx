// src/components/assignments/AssignmentGrid.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Assignment } from '@/types/assignment';
import { Search, Plus, ArrowLeft, ClipboardCheck, Trash, Eye, Loader2 } from 'lucide-react';
import { PillButton } from '../shared/PillButton';
import { useAssignmentStore } from '@/store/assignmentStore';
import { deleteAssignment as apiDeleteAssignment } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { motion } from 'framer-motion';

interface AssignmentGridProps {
  assignments: Assignment[];
}

export function AssignmentGrid({ assignments }: AssignmentGridProps) {
  const router = useRouter();
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);
  const { addConfirmToast, addToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique subjects for the filter tabs
  const subjects = useMemo(() => {
    const set = new Set(assignments.map(a => a.subject));
    return Array.from(set);
  }, [assignments]);

  // Filter assignments based on search and selected subject
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.grade.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject ? a.subject === selectedSubject : true;
      
      return matchesSearch && matchesSubject;
    });
  }, [assignments, searchQuery, selectedSubject]);

  // Format dates helper: from YYYY-MM-DD or ISO string to DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr.split('T')[0];
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  const handleDelete = (id: string, title: string) => {
    addConfirmToast(
      `Delete assessment "${title}"? This action cannot be undone.`,
      async () => {
        setDeletingId(id);
        try {
          await apiDeleteAssignment(id);
          deleteAssignment(id);
          addToast(`"${title}" deleted successfully.`, 'success');
        } catch (err) {
          console.error('Failed to delete assignment:', err);
          addToast('Failed to delete assignment. Please try again.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    );
  };

  const handleRowClick = (item: Assignment) => {
    if (item.status === 'done') {
      router.push(`/result/${item._id}`);
    } else if (item.jobId) {
      router.push(`/status/${item.jobId}`);
    }
  };

  // Variants for staggered lists
  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
      
      {/* Page Header (Desktop) */}
      <div className="hidden md:flex flex-col gap-1 pl-2 relative z-10 select-none">
        <h2 className="text-[20px] font-bold text-slate-800 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block flex-shrink-0 animate-pulse" />
          <span>Assessments</span>
        </h2>
        <p className="text-[13px] text-slate-500 font-sans leading-tight">
          Manage and review assignments created for your classes.
        </p>
      </div>

      {/* Mobile Page Header */}
      <div className="flex md:hidden w-full items-center justify-between relative z-10 px-3">
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="w-10 h-10 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all text-slate-600 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <h2 className="text-sm font-black text-slate-900 font-sans">Assessments</h2>
        <div className="w-10 h-10 flex-shrink-0" />
      </div>

      {/* Subject Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 md:p-3 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        
        {/* Category Subject Tabs */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedSubject === null
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/40 border-transparent'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedSubject === sub
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/40 border-transparent'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-100/50 outline-none focus:bg-white transition-all font-sans text-slate-800 custom-search-bar border border-slate-200/50"
          />
        </div>
      </div>

      {/* Table Directory Container */}
      <div className="backdrop-blur-md bg-white/70 border border-white/60 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col font-sans relative">
        
        {/* Table Headers */}
        <div className="p-4 border-b border-slate-200/50 bg-slate-50/50 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_auto] md:grid-cols-[1fr_140px_120px_100px] gap-4 items-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
          <span className="pl-2">Assessment Name</span>
          <span className="hidden sm:inline-block w-36">Subject & Grade</span>
          <span className="hidden md:inline-block w-28">Due Date</span>
          <span className="w-24 text-right pr-4">Actions</span>
        </div>

        {/* Table Rows list */}
        <motion.div 
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col divide-y divide-slate-150/40"
        >
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => {
              const isDeleting = deletingId === assignment._id;
              const isDone = assignment.status === 'done';
              const isProcessing = assignment.status === 'pending' || assignment.status === 'processing';
              const dateCreated = formatDate(assignment.createdAt);
              const dateDue = formatDate(assignment.dueDate);

              return (
                <motion.div
                  variants={rowVariants}
                  key={assignment._id}
                  className="p-4 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_auto] md:grid-cols-[1fr_140px_120px_100px] gap-4 items-center hover:bg-white/80 transition-colors text-xs text-slate-800"
                >
                  {/* Name column */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <ClipboardCheck className="w-4.5 h-4.5 text-orange-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => handleRowClick(assignment)}
                          className="font-bold truncate hover:text-orange-500 cursor-pointer"
                        >
                          {assignment.title}
                        </span>
                        
                        {/* Compact Status Indicator Badge */}
                        {isDone ? (
                          <span className="flex-shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 tracking-wider">
                            Active
                          </span>
                        ) : isProcessing ? (
                          <span className="flex-shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 tracking-wider animate-pulse">
                            Processing
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 tracking-wider">
                            Failed
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Created {dateCreated}
                      </span>
                    </div>
                  </div>

                  {/* Subject & Grade Column */}
                  <div className="hidden sm:flex items-center gap-2 w-36">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100/50">
                      {assignment.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Grade {assignment.grade}
                    </span>
                  </div>

                  {/* Due Date Column */}
                  <span className="hidden md:inline-block w-28 text-slate-400 font-bold">
                    {dateDue}
                  </span>

                  {/* Action Buttons Column */}
                  <div className="flex items-center justify-end gap-3 w-24 pr-4">
                    {/* View/Eye Button */}
                    {(isDone || isProcessing) && (
                      <button
                        onClick={() => handleRowClick(assignment)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 transition-colors border-0 cursor-pointer"
                        title="View Assessment"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    <button
                      disabled={isDeleting}
                      onClick={() => handleDelete(assignment._id, assignment.title)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors border-0 cursor-pointer disabled:opacity-50"
                      title="Delete Assessment"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-50/20">
              <ClipboardCheck className="w-8 h-8 text-slate-300" />
              <div className="flex flex-col gap-0.5">
                <span className="font-black text-slate-500">No assessments found</span>
                <span className="text-slate-400 text-[11px] font-semibold">Try creating an assessment to get started!</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Sticky Action Bar (Desktop only) */}
      <div 
        className="hidden md:flex fixed bottom-0 right-0 items-center justify-center pointer-events-none z-20 transition-all duration-300 ease-in-out"
        style={{
          left: 'var(--sidebar-width, 260px)',
        }}
      >
        <div 
          className="pointer-events-auto w-full flex justify-center py-5 pr-[24px]"
          style={{
            background: 'linear-gradient(to top, #F3F4F6 60%, transparent 100%)',
          }}
        >
          <PillButton
            variant="primary"
            icon={<Plus className="w-4 h-4 text-white" />}
            onClick={() => router.push('/create')}
            className="shadow-lg hover:scale-105 active:scale-95 transition-transform bg-gradient-to-r from-orange-500 to-amber-500 border-0 rounded-2xl px-6 py-3.5 text-xs font-bold text-white cursor-pointer"
          >
            Create Assessment
          </PillButton>
        </div>
      </div>

    </div>
  );
}
