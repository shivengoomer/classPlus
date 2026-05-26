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
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-36 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Search/Filter Bar Skeleton */}
          <div className="h-14 bg-white border border-veda-card-border rounded-xl w-full animate-pulse" />

          {/* 2-column Grid Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-[24px] shadow-sm"
                style={{
                  display: 'flex',
                  padding: '24px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  gap: '48px',
                  flex: '1 0 0',
                  alignSelf: 'stretch'
                }}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="flex flex-col gap-2 w-3/4">
                    <div className="h-5 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-150 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between items-center w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
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
