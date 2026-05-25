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
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-24 md:pb-16 relative">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {/* Live Indicator green dot */}
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block animate-pulse" />
          <h2 className="text-[20px] font-bold text-veda-text-primary">
            Assignments
          </h2>
        </div>
        <p className="text-[13px] text-veda-text-secondary">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-veda-card-border shadow-sm w-full relative z-20">
        
        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
              selectedSubject 
                ? 'text-veda-orange bg-orange-50' 
                : 'text-veda-text-primary hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
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
                  selectedSubject === null ? 'font-bold text-veda-orange' : 'text-veda-text-primary'
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
                    selectedSubject === sub ? 'font-bold text-veda-orange' : 'text-veda-text-primary'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-veda-text-hint">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search Assignment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-veda-card-border rounded-full outline-none focus:bg-white focus:border-gray-400 transition-all text-veda-text-primary placeholder-veda-text-hint"
          />
        </div>
      </div>

      {/* Grid of Assignment Cards */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-veda-card-border rounded-xl p-8 text-center text-veda-text-secondary text-sm">
          No assignments match your filter/search criteria.
        </div>
      )}

      {/* Bottom Sticky Action Bar (Desktop only, when assignments exist) */}
      <div className="hidden md:flex fixed bottom-6 left-[280px] right-0 items-center justify-center pointer-events-none z-10">
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
