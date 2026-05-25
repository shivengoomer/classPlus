// src/components/assignments/AssignmentCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Assignment } from '@/types/assignment';
import { AssignmentContextMenu } from './AssignmentContextMenu';
import { useAssignmentStore } from '@/store/assignmentStore';
import { deleteAssignment as apiDeleteAssignment } from '@/lib/api';


interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const router = useRouter();
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);

  // Format dates: from YYYY-MM-DD or ISO string to DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        // If YYYY-MM-DD
        if (parts[0].length === 4) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        // If already DD-MM-YYYY
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

  const assignedDate = formatDate(assignment.createdAt);
  const dueDate = formatDate(assignment.dueDate);

  const handleView = () => {
    if (assignment.status === 'done') {
      router.push(`/result/${assignment._id}`);
    } else if (assignment.jobId) {
      router.push(`/status/${assignment.jobId}`);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      try {
        await apiDeleteAssignment(assignment._id);
        deleteAssignment(assignment._id);
      } catch (err) {
        console.error('Failed to delete assignment:', err);
      }
    }
  };

  return (
    <div 
      onClick={handleView}
      className="bg-veda-card border border-veda-card-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px] relative group"
    >
      {/* Top row: Title & Action menu */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="text-[15px] font-bold text-veda-text-primary truncate underline underline-offset-[5px] decoration-[1.5px] decoration-gray-950 group-hover:decoration-black">
            {assignment.title}
          </h4>
          
          <div className="flex items-center gap-3">
            {/* Subject/Class badges */}
            <span className="text-[11px] font-semibold text-veda-orange bg-orange-50 px-2 py-0.5 rounded">
              {assignment.subject}
            </span>
            <span className="text-[11px] font-medium text-veda-text-secondary">
              Grade {assignment.grade}
            </span>
            {assignment.status !== 'done' && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                assignment.status === 'failed' 
                  ? 'bg-red-50 text-veda-orange-red' 
                  : 'bg-yellow-50 text-yellow-600 animate-pulse'
              }`}>
                {assignment.status}
              </span>
            )}
          </div>
        </div>

        {/* 3-dot dropdown menu */}
        <AssignmentContextMenu onView={handleView} onDelete={handleDelete} />
      </div>

      {/* Bottom row: Assigned Date & Due Date */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-[13px] text-veda-text-secondary">
        <div>
          <span className="font-bold text-veda-text-primary">Assigned on : </span>
          <span className="font-normal">{assignedDate}</span>
        </div>
        <div>
          <span className="font-bold text-veda-text-primary">Due : </span>
          <span className="font-normal">{dueDate}</span>
        </div>
      </div>
    </div>
  );
}
