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
      className="bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative group"
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
      {/* Top Row: Title, Metadata & Action menu */}
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h4 className="text-[#303030] text-[20px] md:text-[22px] font-extrabold leading-[26px] md:leading-[28px] truncate font-sans">
            {assignment.title}
          </h4>
          
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-bold text-veda-orange bg-orange-50 px-2 py-0.5 rounded-[6px]">
              {assignment.subject}
            </span>
            <span className="text-[11px] font-semibold text-gray-500">
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

      {/* Bottom Row: Assigned Date & Due Date */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1 text-[14px] md:text-[16px] text-[#303030]">
          <span className="font-extrabold">Assigned on</span>
          <span className="text-gray-400 font-medium">: {assignedDate}</span>
        </div>
        <div className="flex items-center gap-1 text-[14px] md:text-[16px] text-[#303030]">
          <span className="font-extrabold">Due</span>
          <span className="text-gray-400 font-medium">: {dueDate}</span>
        </div>
      </div>
    </div>
  );
}
