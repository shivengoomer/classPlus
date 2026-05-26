// src/components/assignments/AssignmentGrid.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Assignment } from '@/types/assignment';
import { AssignmentCard } from './AssignmentCard';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { PillButton } from '../shared/PillButton';

interface AssignmentGridProps {
  assignments: Assignment[];
}

export function AssignmentGrid({ assignments }: AssignmentGridProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Extract unique subjects for the filter
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-24 md:pb-16 relative z-10">
      {/* Background blur bubble (Figma decorative detail) */}
      <div 
        className="absolute w-[1113px] h-[428px] pointer-events-none rounded-full select-none z-0 hidden md:block" 
        style={{ 
          left: '327px', 
          top: '560px', 
          background: 'rgba(76.25, 76.25, 76.25, 0.12)', 
          filter: 'blur(200px)' 
        }} 
      />

      {/* Page Header */}
      <div className="flex flex-col gap-1 pl-2 relative z-10">
        <div className="flex items-center gap-3">
          {/* Glowing Green Live Indicator dot */}
          <div 
            className="w-3 h-3 bg-[#4BC26D] rounded-full inline-block flex-shrink-0"
            style={{ 
              boxShadow: '0px 32px 48px rgba(0, 0, 0, 0.20), 0px 16px 48px rgba(0, 0, 0, 0.12)',
              outline: '4px rgba(75.15, 193.95, 108.81, 0.40) solid' 
            }}
          />
          <h2 className="text-[20px] font-bold text-[#303030] font-sans">
            Assignments
          </h2>
        </div>
        <p className="text-[14px] text-gray-500/80 font-sans leading-tight pl-[24px]">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white h-16 px-4 rounded-[20px] border border-veda-card-border shadow-sm w-full relative z-20">
        
        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 text-[14px] font-extrabold text-[#A9A9A9] hover:text-[#303030] transition-colors font-sans py-2 px-1"
          >
            <SlidersHorizontal className="w-5 h-5 text-[#A9A9A9]" />
            <span>
              {selectedSubject ? `Filter: ${selectedSubject}` : 'Filter By'}
            </span>
          </button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-veda-card-border rounded-xl shadow-lg py-1.5 z-30">
              <button
                onClick={() => {
                  setSelectedSubject(null);
                  setShowFilterDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                  selectedSubject === null ? 'font-bold text-veda-orange' : 'text-[#303030]'
                }`}
              >
                All Subjects
              </button>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                    selectedSubject === sub ? 'font-bold text-veda-orange' : 'text-[#303030]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-[380px] h-[44px] flex items-center gap-3 px-4 rounded-full border border-black/20 bg-gray-50 focus-within:bg-white focus-within:border-black/40 transition-all">
          <Search className="w-5 h-5 text-[#A9A9A9] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full text-[14px] font-bold text-[#303030] placeholder-[#A9A9A9] bg-transparent outline-none font-sans"
          />
        </div>
      </div>

      {/* Grid of Assignment Cards */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-veda-card-border rounded-xl p-8 text-center text-veda-text-secondary text-sm relative z-10">
          No assignments match your filter/search criteria.
        </div>
      )}

      {/* Bottom Sticky Action Bar (Desktop only, when assignments exist) */}
      <div className="hidden md:flex fixed bottom-6 left-[254px] right-0 items-center justify-center pointer-events-none z-10">
        <div className="pointer-events-auto">
          <PillButton
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => router.push('/create')}
            className="shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Create Assignment
          </PillButton>
        </div>
      </div>

    </div>
  );
}
