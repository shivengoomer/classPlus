// src/app/assignments/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/assignments/EmptyState';
import { AssignmentGrid } from '@/components/assignments/AssignmentGrid';
import { useAssignmentStore } from '@/store/assignmentStore';
import { listAssignments } from '@/lib/api';

export default function AssignmentsPage() {
  const { assignments, setAssignments } = useAssignmentStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await listAssignments();
        setAssignments(data);
      } catch (err) {
        console.error('Failed to list assignments:', err);
      } finally {
        // Brief loading delay to showcase skeleton loaders beautifully
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    }
    loadData();
  }, [setAssignments]);

  return (
    <AppShell>
      {loading ? (
        // Premium Skeleton Loader
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-[2px] relative z-10 select-none">
          <div className="flex flex-col gap-1.5 pl-2">
            <div className="h-6 w-36 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Search/Filter Bar Skeleton */}
          <div className="h-14 bg-white/50 border border-white/60 rounded-2xl w-full animate-pulse" />

          {/* List Directory Skeleton */}
          <div className="backdrop-blur-md bg-white/70 border border-white/60 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200/50 bg-slate-50/50 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_auto] md:grid-cols-[1fr_140px_120px_100px] gap-4 items-center">
              <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
              <div className="hidden sm:block h-4 bg-slate-200 rounded w-20 animate-pulse animate-pulse" />
              <div className="hidden md:block h-4 bg-slate-200 rounded w-16 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-12 animate-pulse justify-self-end pr-2" />
            </div>
            <div className="flex flex-col divide-y divide-slate-100/50">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="p-4 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_auto] md:grid-cols-[1fr_140px_120px_100px] gap-4 items-center"
                >
                  <div className="flex items-center gap-3.5 w-full">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/80 animate-pulse flex-shrink-0" />
                    <div className="flex flex-col gap-2 w-1/2">
                      <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                      <div className="h-3 bg-slate-150 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 w-36">
                    <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                    <div className="h-4 bg-slate-150 rounded w-10 animate-pulse" />
                  </div>
                  <div className="hidden md:block w-28">
                    <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="flex justify-end gap-3 pr-4">
                    <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <AssignmentGrid assignments={assignments} />
      )}
    </AppShell>
  );
}
