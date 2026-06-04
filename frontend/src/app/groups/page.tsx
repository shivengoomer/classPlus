// src/app/groups/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import { Folder, Users, Plus, ShieldCheck, User } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  grade: string;
  subject: string;
  studentCount: number;
  activeRubric: string;
  avatarBg: string;
  students: string[];
}

const MOCK_GROUPS: Group[] = [
  {
    id: 'grp-1',
    name: 'Grade 8 Science - Sec A',
    grade: '8th',
    subject: 'Science',
    studentCount: 36,
    activeRubric: 'NCERT CBSE Rubric v2.1',
    avatarBg: 'bg-emerald-50 text-emerald-600',
    students: ['Aarav Sharma', 'Aditi Verma', 'Amit Kumar', 'Anjali Gupta', 'Deepak Roy', 'Ishaan Sen', 'Karan Mehta', 'Neha Patel', 'Pooja Joshi', 'Rahul Singh']
  },
  {
    id: 'grp-2',
    name: 'Grade 5 English - Sec B',
    grade: '5th',
    subject: 'English',
    studentCount: 28,
    activeRubric: 'Primary Grammar Guide',
    avatarBg: 'bg-indigo-50 text-indigo-600',
    students: ['Aryan Jha', 'Bhavna Das', 'Chirag Seth', 'Divya Iyer', 'Esha Rao', 'Gaurav Gill', 'Jaya Nair', 'Manish Goel', 'Nikhil Sethi', 'Ritu Malhotra']
  },
  {
    id: 'grp-3',
    name: 'Grade 9 Maths - Sec C',
    grade: '9th',
    subject: 'Mathematics',
    studentCount: 42,
    activeRubric: 'Algebra Evaluation Key',
    avatarBg: 'bg-amber-50 text-amber-600',
    students: ['Abhishek Vyas', 'Arjun Saxena', 'Komal Pandey', 'Meera Kapoor', 'Pranav Mishra', 'Rohan Dutta', 'Sanjay Dutt', 'Sneha Reddy', 'Vikas Dubey', 'Yash Gupta']
  },
  {
    id: 'grp-4',
    name: 'Grade 7 Science - Sec B',
    grade: '7th',
    subject: 'Science',
    studentCount: 34,
    activeRubric: 'NCERT CBSE Rubric v1.0',
    avatarBg: 'bg-rose-50 text-rose-600',
    students: ['Alok Mishra', 'Geeta Johri', 'Harish Rao', 'Jyoti Prasad', 'Kiran Bedi', 'Mukul Dev', 'Narendra Sen', 'Prachi Desai', 'Sameer Kohli', 'Tanvi Shah']
  }
];

export default function GroupsPage() {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(MOCK_GROUPS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = MOCK_GROUPS.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">
        <div className="relative w-full min-h-[550px]">
          {/* Blurry original content */}
          <div className="blur-[5px] select-none pointer-events-none opacity-40 flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-bold text-veda-text-primary flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600" />
                <span>My Class Groups</span>
              </h2>
              <p className="text-[13px] text-veda-text-secondary">
                Organize your students, view evaluation rubrics, and inspect class records.
              </p>
            </div>
            <PillButton
              variant="primary"
              icon={<Plus className="w-4 h-4 text-white" />}
              onClick={() => {}}
            >
              Create Class Group
            </PillButton>
          </div>

          {/* Search Bar */}
          <div className="bg-white border border-veda-card-border rounded-xl p-3 shadow-sm w-full flex items-center">
            <input
              type="text"
              placeholder="Search class groups by name, subject, or grade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm outline-none px-2 text-veda-text-primary placeholder-veda-text-hint bg-transparent font-sans"
            />
          </div>

          {/* Core Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* List of Groups */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGroups.map((g) => {
                    const isSelected = selectedGroup?.id === g.id;
                    return (
                      <div 
                        key={g.id}
                        onClick={() => setSelectedGroup(g)}
                        className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-6 hover:scale-[1.01] ${
                          isSelected 
                            ? 'border-veda-orange ring-1 ring-veda-orange shadow-md' 
                            : 'border-veda-card-border hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${g.avatarBg}`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-veda-text-primary truncate">
                              {g.name}
                            </span>
                            <span className="text-[11px] text-veda-text-secondary mt-0.5">
                              {g.subject} • CBSE Grade {g.grade}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 font-sans border-t border-gray-50 pt-4">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Total Students</span>
                            <span className="font-semibold text-veda-text-primary">{g.studentCount} pupils</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Active Rubric</span>
                            <span className="font-semibold text-indigo-600 truncate max-w-[140px] flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {g.activeRubric.replace('NCERT CBSE ', '')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-veda-card-border rounded-xl p-8 text-center text-sm text-veda-text-secondary">
                  No class groups match your search queries.
                </div>
              )}
            </div>

            {/* Group Details Sidebar (Selected Group) */}
            <div className="flex flex-col gap-4">
              {selectedGroup ? (
                <div className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-gray-50 p-5 border-b border-veda-card-border flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-max">
                      Class Overview
                    </span>
                    <h3 className="text-[16px] font-bold text-veda-text-primary mt-1">
                      {selectedGroup.name}
                    </h3>
                    <p className="text-[12px] text-veda-text-secondary leading-relaxed font-sans">
                      Currently linked rubric: <strong className="text-gray-700">{selectedGroup.activeRubric}</strong>
                    </p>
                  </div>

                  {/* Pupil List */}
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-veda-text-primary tracking-wider uppercase">
                        Student Roster ({selectedGroup.studentCount})
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto font-sans pr-1">
                      {selectedGroup.students.map((student, sIdx) => (
                        <div 
                          key={sIdx}
                          className="flex items-center justify-between py-2 px-2.5 rounded hover:bg-gray-50 transition-all text-xs"
                        >
                          <div className="flex items-center gap-2.5 text-veda-text-primary">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium">{student}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">Roll #{100 + sIdx}</span>
                        </div>
                      ))}
                    </div>

                    <PillButton
                      variant="primary"
                      className="w-full justify-center text-xs mt-2"
                      onClick={() => {}}
                    >
                      Assign Assessment
                    </PillButton>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-veda-card-border rounded-xl p-8 text-center text-xs text-veda-text-secondary font-sans">
                  Select a class group card to inspect roster and rubrics.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Premium Coming Soon Card */}
        <div className="absolute inset-0 flex items-start justify-center p-4 pt-16 md:pt-24 z-20">
          <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col items-center text-center gap-6 border-gray-100">
            {/* Tag badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-veda-orange to-red-500 shadow-md shadow-orange-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Coming Soon</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center justify-center text-veda-orange shadow-inner">
              <Users className="w-8 h-8 text-veda-orange" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-[#303030] font-sans tracking-tight">
                Class Groups Integration
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans px-2">
                We are building a robust class manager where you can sync Google Classroom, manage student rosters, and instantly assign AI-generated assessments to entire classes.
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#181818] rounded-full shadow-lg hover:bg-black active:scale-95 transition-all font-sans"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
}
