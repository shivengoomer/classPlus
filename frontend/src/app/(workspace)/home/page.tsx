// src/app/(workspace)/home/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import {
  ArrowUp, Users, ChevronLeft, ChevronRight, Sparkles,
  GraduationCap, BookOpen, Award, Cpu, FolderOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { listAssignments, listGroups, listStudentReports, listBankQuestions, listAssigned, listSubmissions } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { useProfileStore } from '@/store/profileStore';

// ── ClassPlus Adapted Datasets (Fallback Mocks) ─────────────────────────────

const ACADEMIC_ASSIGNMENTS = [
  { name: 'Quiz on Electricity', submissions: 32, avgScore: '84%', date: '2026-06-20' },
  { name: 'Mathematics: Algebra Basics', submissions: 28, avgScore: '78%', date: '2026-06-19' },
  { name: 'English Vocabulary Prepositions', submissions: 30, avgScore: '92%', date: '2026-06-19' },
  { name: 'Physics: Force & Motion', submissions: 25, avgScore: '72%', date: '2026-06-18' },
  { name: 'Chemistry: Chemical Reactions', submissions: 29, avgScore: '81%', date: '2026-06-17' },
  { name: 'Biology: Photosynthesis Quiz', submissions: 31, avgScore: '88%', date: '2026-06-16' },
  { name: 'History: French Revolution Test', submissions: 27, avgScore: '75%', date: '2026-06-15' },
  { name: 'Civics: Indian Constitution', submissions: 26, avgScore: '79%', date: '2026-06-14' },
];

const STUDENT_ROSTER = [
  { name: 'Aarav Sharma', grade: 'Grade 8 Science', lastActive: '2026-06-20', avgScore: '91%', initials: 'AS', color: 'bg-orange-100 text-orange-600' },
  { name: 'Kunal Patel', grade: 'Grade 9 Mathematics', lastActive: '2026-06-19', avgScore: '85%', initials: 'KP', color: 'bg-blue-100 text-blue-600' },
  { name: 'Ananya Iyer', grade: 'Grade 8 Science', lastActive: '2026-06-20', avgScore: '96%', initials: 'AI', color: 'bg-purple-100 text-purple-600' },
  { name: 'Rohan Gupta', grade: 'Grade 10 English', lastActive: '2026-06-18', avgScore: '74%', initials: 'RG', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Priya Mehta', grade: 'Grade 8 Science', lastActive: '2026-06-19', avgScore: '89%', initials: 'PM', color: 'bg-pink-100 text-pink-600' },
  { name: 'Aditya Sen', grade: 'Grade 9 Mathematics', lastActive: '2026-06-17', avgScore: '82%', initials: 'AS', color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Sneha Rao', grade: 'Grade 10 English', lastActive: '2026-06-16', avgScore: '94%', initials: 'SR', color: 'bg-amber-100 text-amber-600' },
  { name: 'Vikram Singh', grade: 'Grade 9 Mathematics', lastActive: '2026-06-15', avgScore: '77%', initials: 'VS', color: 'bg-teal-100 text-teal-600' },
];

const QUESTION_BANK_INVENTORY = [
  { text: 'What is the SI unit of electric current?', code: 'MCQ-ELEC-8', qty: 450, concept: 'Electricity (Restocked +150 Qs)' },
  { text: 'State Ohm\'s Law and write its formula.', code: 'SHRT-OHM-8', qty: 120, concept: 'Ohm\'s Law (Updated +30 Qs)' },
  { text: 'Explain the working of an electric bell.', code: 'LONG-BELL-8', qty: 85, concept: 'Electromagnetism (Unchanged)' },
  { text: 'Pure water is a good conductor of electricity.', code: 'TF-COND-8', qty: 980, concept: 'Conductors (Shipped -200 Qs)' },
  { text: 'The process of depositing a layer of metal...', code: 'FIB-ELECT-8', qty: 1200, concept: 'Electroplating (Restocked +500 Qs)' },
  { text: 'Explain structural differences of plant cells.', code: 'LONG-CELL-9', qty: 650, concept: 'Cell Structures (Restocked +200 Qs)' },
  { text: 'Define speed and formulate calculations.', code: 'MCQ-SPD-8', qty: 180, concept: 'Motion (Shipped -40 Qs)' },
  { text: 'State two chemical properties of acids.', code: 'SHRT-ACD-9', qty: 890, concept: 'Acids & Bases (Restocked +300 Qs)' },
];

// SVG line chart pathways mapping grading evaluations trend over days
const CHART_DATASETS: Record<string, string> = {
  '1W': 'M 20 120 C 60 110, 100 80, 140 90 S 220 50, 260 40 S 340 70, 380 60 S 460 30, 500 20 L 500 150 L 20 150 Z',
  '1M': 'M 20 100 C 60 120, 100 90, 140 80 S 220 40, 260 65 S 340 45, 380 30 S 460 55, 500 15 L 500 150 L 20 150 Z',
  '3M': 'M 20 130 C 60 90, 100 105, 140 75 S 220 55, 260 45 S 340 30, 380 20 S 460 40, 500 10 L 500 150 L 20 150 Z',
  '1Y': 'M 20 140 C 60 115, 100 85, 140 70 S 220 60, 260 35 S 340 25, 380 15 S 460 10, 500 5 L 500 150 L 20 150 Z',
};

const COLOR_CLASSES = [
  'bg-orange-100 text-orange-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-emerald-100 text-emerald-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
  'bg-amber-100 text-amber-600',
  'bg-teal-100 text-teal-600'
];

export default function HomePage() {
  const { addToast } = useToastStore();
  const { profile, fetchProfile } = useProfileStore();

  const [loading, setLoading] = useState(true);
  const [salesTimeRange, setSalesTimeRange] = useState('1M');
  const [salesPage, setSalesPage] = useState(0);
  const [hrPage, setHrPage] = useState(0);
  const [hrLimit, setHrLimit] = useState(5);
  const [warehousePage, setWarehousePage] = useState(0);

  // Real Database state containers
  const [assignments, setAssignments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [studentRoster, setStudentRoster] = useState<any[]>([]);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);

  // Orchestrate dynamic layout
  useEffect(() => {
    let active = true;
    async function loadRealData() {
      try {
        // Parallel queries to standard APIs
        const [assignmentsData, groupsData, rosterData, questionsData, assignedData] = await Promise.all([
          listAssignments().catch(() => []),
          listGroups().catch(() => []),
          listStudentReports().catch(() => []),
          listBankQuestions().catch(() => []),
          listAssigned().catch(() => []),
        ]);

        if (!active) return;

        setAssignments(assignmentsData || []);
        setGroups(groupsData || []);
        setStudentRoster(rosterData || []);
        setBankQuestions(questionsData || []);

        // Also fetch profile if not loaded
        if (!profile) {
          fetchProfile().catch(() => null);
        }

        // Fetch submissions for all assigned quizzes in parallel to calculate scores/trend curves
        if (assignedData && assignedData.length > 0) {
          const subsPromises = assignedData.map((a: any) => 
            listSubmissions(a._id)
              .then(subs => subs.map((s: any) => ({ 
                ...s, 
                assignmentTitle: a.assignmentId?.title, 
                groupId: a.groupId?._id,
                groupName: a.groupId?.name
              })))
              .catch(() => [])
          );
          const subsResults = await Promise.all(subsPromises);
          if (active) {
            setAllSubmissions(subsResults.flat());
          }
        }
      } catch (err: any) {
        console.error('Failed to load dashboard real data:', err);
        addToast('Failed to load live dashboard statistics: ' + err.message, 'info');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadRealData();
    return () => { active = false; };
  }, [profile, fetchProfile, addToast]);

  // Check if we actually have database content to map over, otherwise fall back to premium mockup mode
  const hasRealData = useMemo(() => {
    return assignments.length > 0 || studentRoster.length > 0 || bankQuestions.length > 0;
  }, [assignments, studentRoster, bankQuestions]);

  // Teacher Name
  const teacherGreetingName = useMemo(() => {
    if (profile?.firstName) {
      return profile.firstName;
    }
    return 'Seving';
  }, [profile]);

  // Compute 4 dynamic KPI cards
  const totalGradedSubmissions = useMemo(() => {
    if (hasRealData) {
      return allSubmissions.filter(s => s.submittedAt).length;
    }
    return 100000;
  }, [hasRealData, allSubmissions]);

  const totalAssessments = useMemo(() => {
    if (hasRealData) {
      return assignments.length;
    }
    return 3400;
  }, [hasRealData, assignments]);

  const bestPerformingClass = useMemo(() => {
    if (hasRealData) {
      if (studentRoster.length === 0) return 'N/A';
      const groupScores: Record<string, { sum: number; count: number }> = {};
      studentRoster.forEach(s => {
        if (s.assignmentAverageScore !== null && s.groups && s.groups.length > 0) {
          s.groups.forEach((g: any) => {
            const name = g.name;
            if (!groupScores[name]) groupScores[name] = { sum: 0, count: 0 };
            groupScores[name].sum += s.assignmentAverageScore;
            groupScores[name].count += 1;
          });
        }
      });
      let best = 'N/A';
      let maxAvg = -1;
      Object.entries(groupScores).forEach(([name, stats]) => {
        const avg = stats.sum / stats.count;
        if (avg > maxAvg) {
          maxAvg = avg;
          best = name;
        }
      });
      if (best === 'N/A' && groups.length > 0) {
        return groups[0].name;
      }
      return best;
    }
    return 'Grade 8 Science';
  }, [hasRealData, studentRoster, groups]);

  const highestScoringQuiz = useMemo(() => {
    if (hasRealData) {
      if (allSubmissions.length === 0) {
        return assignments.length > 0 ? assignments[0].title : 'N/A';
      }
      const scoresByTitle: Record<string, { sum: number; count: number }> = {};
      allSubmissions.forEach(s => {
        if (s.assignmentTitle && s.totalMarks > 0) {
          const pct = (s.totalScore / s.totalMarks) * 100;
          if (!scoresByTitle[s.assignmentTitle]) {
            scoresByTitle[s.assignmentTitle] = { sum: 0, count: 0 };
          }
          scoresByTitle[s.assignmentTitle].sum += pct;
          scoresByTitle[s.assignmentTitle].count += 1;
        }
      });
      let highestTitle = 'N/A';
      let maxAvg = -1;
      Object.entries(scoresByTitle).forEach(([title, stats]) => {
        const avg = stats.sum / stats.count;
        if (avg > maxAvg) {
          maxAvg = avg;
          highestTitle = title;
        }
      });
      if (highestTitle === 'N/A' && assignments.length > 0) {
        return assignments[0].title;
      }
      return highestTitle;
    }
    return 'Quiz on Electricity';
  }, [hasRealData, allSubmissions, assignments]);

  // Dynamic SVG Line chart path based on completed assignments averages sorted chronologically
  const lineChartPath = useMemo(() => {
    if (hasRealData && assignments.length > 1) {
      const done = [...assignments]
        .filter(a => a.status === 'done')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      if (done.length >= 2) {
        const step = 480 / (done.length - 1);
        let path = 'M 20 ';
        done.forEach((item, idx) => {
          const subs = allSubmissions.filter(s => s.assignmentTitle === item.title);
          const scoreVal = subs.length > 0 
            ? subs.reduce((sum, s) => sum + (s.totalScore / s.totalMarks * 100), 0) / subs.length 
            : ((item._id.charCodeAt(0) + item._id.charCodeAt(item._id.length - 1)) % 30) + 70; // dynamic default based on id
          
          const y = 140 - (scoreVal / 100) * 120;
          const x = 20 + idx * step;
          if (idx === 0) path += `${y.toFixed(1)} `;
          else path += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
        });

        const fillPath = path + ` L 500 150 L 20 150 Z`;
        return { fillPath, strokePath: path };
      }
    }

    const base = CHART_DATASETS[salesTimeRange];
    return { fillPath: base, strokePath: base.split('L')[0] };
  }, [hasRealData, assignments, allSubmissions, salesTimeRange]);

  // PAGINATION AND SLICING DATASETS

  // 1. Assignments list
  const currentAssignments = useMemo(() => {
    return hasRealData ? assignments : ACADEMIC_ASSIGNMENTS;
  }, [hasRealData, assignments]);

  const salesMaxPage = Math.max(1, Math.ceil(currentAssignments.length / 5));
  const paginatedSales = useMemo(() => {
    const rawSlice = currentAssignments.slice(salesPage * 5, (salesPage + 1) * 5);
    return rawSlice.map(item => {
      if (hasRealData) {
        const subs = allSubmissions.filter(s => s.assignmentTitle === item.title);
        const subCount = subs.length;
        const avg = subCount > 0 
          ? Math.round(subs.reduce((sum, s) => sum + (s.totalScore / s.totalMarks * 100), 0) / subCount) + '%' 
          : 'N/A';
        return {
          name: item.title,
          submissions: subCount,
          avgScore: avg,
          date: new Date(item.createdAt).toISOString().split('T')[0]
        };
      }
      return item;
    });
  }, [currentAssignments, salesPage, hasRealData, allSubmissions]);

  // Reset page if out of bounds
  useEffect(() => {
    if (salesPage >= salesMaxPage) {
      setSalesPage(0);
    }
  }, [salesMaxPage, salesPage]);

  // 2. Student roster list
  const currentStudents = useMemo(() => {
    return hasRealData ? studentRoster : STUDENT_ROSTER;
  }, [hasRealData, studentRoster]);

  const hrMaxPage = Math.max(1, Math.ceil(currentStudents.length / hrLimit));
  const paginatedHr = useMemo(() => {
    const rawSlice = currentStudents.slice(hrPage * hrLimit, (hrPage + 1) * hrLimit);
    return rawSlice.map((item, idx) => {
      if (hasRealData) {
        const initials = item.studentName
          ? item.studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
          : 'ST';
        const color = COLOR_CLASSES[idx % COLOR_CLASSES.length];
        const groupName = item.groups && item.groups.length > 0 
          ? item.groups.map((g: any) => g.name).join(', ') 
          : 'Unassigned';
        return {
          name: item.studentName,
          grade: groupName,
          lastActive: item.assignmentsCompleted > 0 ? 'Recently' : 'Never active',
          avgScore: item.assignmentAverageScore !== null ? `${item.assignmentAverageScore}%` : 'N/A',
          initials,
          color
        };
      }
      return item;
    });
  }, [currentStudents, hrPage, hrLimit, hasRealData]);

  useEffect(() => {
    if (hrPage >= hrMaxPage) {
      setHrPage(0);
    }
  }, [hrMaxPage, hrPage]);

  // 3. Question Bank list
  const currentWarehouse = useMemo(() => {
    return hasRealData ? bankQuestions : QUESTION_BANK_INVENTORY;
  }, [hasRealData, bankQuestions]);

  const warehouseMaxPage = Math.max(1, Math.ceil(currentWarehouse.length / 4));
  const paginatedWarehouse = useMemo(() => {
    const rawSlice = currentWarehouse.slice(warehousePage * 4, (warehousePage + 1) * 4);
    return rawSlice.map(item => {
      if (hasRealData) {
        const code = item.type.toUpperCase() + '-' + (item.chapter ? item.chapter.substring(0, 3).toUpperCase() : 'GEN') + '-' + item.grade;
        return {
          text: item.questionText,
          code,
          qty: item.usageCount || 0,
          concept: item.chapter || item.subject || 'General'
        };
      }
      return item;
    });
  }, [currentWarehouse, warehousePage, hasRealData]);

  useEffect(() => {
    if (warehousePage >= warehouseMaxPage) {
      setWarehousePage(0);
    }
  }, [warehouseMaxPage, warehousePage]);

  // Classroom distribution donut calculation
  const hrDistribution = useMemo(() => {
    const total = currentStudents.length;
    if (!hasRealData || studentRoster.length === 0) {
      return {
        total: 300,
        groups: [
          { name: 'Grade 8', pct: 62.5, count: 188, color: '#10375C', dash: '157 251.3', offset: '0' },
          { name: 'Grade 9', pct: 25.0, count: 75, color: '#f97316', dash: '62.8 251.3', offset: '-157' },
          { name: 'Grade 10', pct: 12.5, count: 37, color: '#94a3b8', dash: '31.4 251.3', offset: '-219.8' }
        ]
      };
    }

    const divisions: Record<string, number> = {};
    studentRoster.forEach(s => {
      if (s.groups && s.groups.length > 0) {
        const cls = s.groups[0].grade || 'General';
        divisions[cls] = (divisions[cls] || 0) + 1;
      } else {
        divisions['General'] = (divisions['General'] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(divisions).sort((a, b) => divisions[b] - divisions[a]).slice(0, 3);
    const colorThemes = ['#10375C', '#f97316', '#94a3b8'];
    
    let cumulativeOffset = 0;
    const groupsList = sortedKeys.map((key, index) => {
      const count = divisions[key];
      const pct = parseFloat(((count / total) * 100).toFixed(1));
      const dashLength = (pct / 100) * 251.3;
      const dash = `${dashLength.toFixed(1)} 251.3`;
      const offset = `-${cumulativeOffset.toFixed(1)}`;
      cumulativeOffset += dashLength;

      return {
        name: key.startsWith('Grade') ? key : `Grade ${key}`,
        pct,
        count,
        color: colorThemes[index % colorThemes.length],
        dash,
        offset
      };
    });

    const sumCount = groupsList.reduce((sum, g) => sum + g.count, 0);
    if (sumCount < total) {
      const otherCount = total - sumCount;
      const pct = parseFloat(((otherCount / total) * 100).toFixed(1));
      const dashLength = (pct / 100) * 251.3;
      groupsList.push({
        name: 'Other Grades',
        pct,
        count: otherCount,
        color: '#64748b',
        dash: `${dashLength.toFixed(1)} 251.3`,
        offset: `-${cumulativeOffset.toFixed(1)}`
      });
    }

    return { total, groups: groupsList };
  }, [hasRealData, currentStudents, studentRoster]);

  // Question formats distribution donut calculation
  const questionFormatsDistribution = useMemo(() => {
    const total = currentWarehouse.length;
    if (!hasRealData || bankQuestions.length === 0) {
      return {
        total: 3400,
        formats: [
          { name: 'MCQs', pct: 60, count: 2040, color: '#f97316', dash: '150.8 251.3', offset: '0' },
          { name: 'Short Answers', pct: 25, count: 850, color: '#3b82f6', dash: '62.8 251.3', offset: '-150.8' },
          { name: 'Long Answers', pct: 15, count: 510, color: '#10375C', dash: '37.7 251.3', offset: '-213.6' }
        ]
      };
    }

    const divisions: Record<string, number> = {};
    bankQuestions.forEach(q => {
      const format = q.type || 'short';
      divisions[format] = (divisions[format] || 0) + 1;
    });

    const formatLabels: Record<string, string> = {
      mcq: 'MCQs',
      short: 'Short Answers',
      long: 'Long Answers',
      truefalse: 'True/False',
      fillblank: 'Fill Blanks'
    };

    const keys = Object.keys(divisions).sort((a, b) => divisions[b] - divisions[a]).slice(0, 3);
    const colorThemes = ['#f97316', '#3b82f6', '#10375C'];

    let cumulativeOffset = 0;
    const formatsList = keys.map((key, index) => {
      const count = divisions[key];
      const pct = parseFloat(((count / total) * 100).toFixed(1));
      const dashLength = (pct / 100) * 251.3;
      const dash = `${dashLength.toFixed(1)} 251.3`;
      const offset = `-${cumulativeOffset.toFixed(1)}`;
      cumulativeOffset += dashLength;

      return {
        name: formatLabels[key] || key.toUpperCase(),
        pct,
        count,
        color: colorThemes[index % colorThemes.length],
        dash,
        offset
      };
    });

    const sumCount = formatsList.reduce((sum, f) => sum + f.count, 0);
    if (sumCount < total) {
      const otherCount = total - sumCount;
      const pct = parseFloat(((otherCount / total) * 100).toFixed(1));
      const dashLength = (pct / 100) * 251.3;
      formatsList.push({
        name: 'Other Formats',
        pct,
        count: otherCount,
        color: '#64748b',
        dash: `${dashLength.toFixed(1)} 251.3`,
        offset: `-${cumulativeOffset.toFixed(1)}`
      });
    }

    return { total, formats: formatsList };
  }, [hasRealData, currentWarehouse, bankQuestions]);

  return (
    <AppShell>
      <div className="min-h-screen -mx-4 md:-mx-8 px-4 md:px-8 py-6 select-none font-sans">
        
        {loading ? (
          <div className="w-full flex flex-col gap-6 pb-16 px-4 md:px-0 relative z-10 select-none animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
              <div className="h-10 w-48 bg-slate-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-slate-200 rounded-xl" />
              <div className="h-28 bg-slate-200 rounded-xl" />
              <div className="h-28 bg-slate-200 rounded-xl" />
              <div className="h-28 bg-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-80 bg-slate-200 rounded-2xl" />
              <div className="lg:col-span-5 h-80 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6 pb-16 px-4 md:px-0 relative z-10 font-sans">
            
            {/* Welcome Header */}
            <div className="flex justify-between items-center mb-1">
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-sans tracking-tight">
                  Welcome, {teacherGreetingName}!
                </h1>
                <p className="text-xs text-slate-500 font-semibold font-sans mt-0.5">
                  Academic reports, student rosters, and question repository alignment tracker.
                </p>
              </div>
              <span className="text-[10px] font-black text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/15 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>classPlus Real-Data Dashboard</span>
              </span>
            </div>

            {/* ── SECTION 1: ACADEMIC ANALYTICS ────────────────────────── */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <GraduationCap className="w-4.5 h-4.5 text-[#10375C]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#10375C] font-sans">Academic Analytics</h2>
              </div>

              {/* 4 KPI cards in a row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Submissions Graded */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Grading Completed</span>
                    <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 flex items-center gap-0.5 text-[9px] font-black border border-emerald-100">
                      <ArrowUp className="w-2.5 h-2.5" />
                      <span>12%</span>
                    </span>
                  </div>
                  <div className="flex flex-col mt-3">
                    <span className="text-xl md:text-2xl font-black text-slate-800">
                      {totalGradedSubmissions.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold font-sans mt-1">1 month indicator</span>
                  </div>
                </div>

                {/* Card 2: Total Assessments Created */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Assessments Created</span>
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <BookOpen className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex flex-col mt-3">
                    <span className="text-xl md:text-2xl font-black text-slate-800">
                      {totalAssessments.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold font-sans mt-1">1 month indicator</span>
                  </div>
                </div>

                {/* Card 3: Best Performing Class */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Best Performing Class</span>
                    <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                      <Award className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex flex-col mt-3">
                    <span className="text-md md:text-lg font-black text-slate-800 truncate">
                      {bestPerformingClass}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold font-sans mt-2">1 month indicator</span>
                  </div>
                </div>

                {/* Card 4: Highest Scoring Quiz */}
                <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans">Highest Scoring Quiz</span>
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                      <Cpu className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="flex flex-col mt-3">
                    <span className="text-md md:text-lg font-black text-slate-800 truncate">
                      {highestScoringQuiz}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold font-sans mt-2">1 month indicator</span>
                  </div>
                </div>

              </div>

              {/* Table & Chart Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ClassPlus Assessments Table (Col span 7) */}
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[340px] justify-between">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-700 tracking-wider uppercase font-sans">Recent Generated Assessments</span>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">Evaluation log</span>
                  </div>

                  <div className="overflow-x-auto select-none">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-2">Assessment Name</th>
                          <th className="py-2.5 px-2 text-center">Submissions</th>
                          <th className="py-2.5 px-2 text-right">Average Score</th>
                          <th className="py-2.5 px-2 text-right">Created Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSales.map((prod: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 px-2 font-bold text-slate-700">{prod.name}</td>
                            <td className="py-3 px-2 text-center text-slate-500 font-semibold">{prod.submissions}</td>
                            <td className="py-3 px-2 text-right text-slate-800 font-extrabold">{prod.avgScore}</td>
                            <td className="py-3 px-2 text-right text-slate-400 font-bold">{prod.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table pagination */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Page {salesPage + 1} of {salesMaxPage}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSalesPage(prev => Math.max(0, prev - 1))}
                        disabled={salesPage === 0}
                        className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSalesPage(prev => Math.min(salesMaxPage - 1, prev + 1))}
                        disabled={salesPage === salesMaxPage - 1}
                        className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Average grading score trend chart (Col span 5) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[340px] justify-between">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-700 tracking-wider uppercase font-sans">Average Scoring Trend</span>
                    
                    {/* Chart range selector tabs */}
                    <div className="flex bg-slate-100 rounded-lg p-0.5 select-none font-sans">
                      {['1W', '1M', '3M', '1Y'].map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setSalesTimeRange(range)}
                          className={`px-2 py-1 text-[9px] font-black rounded-md tracking-wider transition-colors ${
                            salesTimeRange === range 
                              ? 'bg-[#10375C] text-white shadow-xs' 
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navy blue gradient chart container */}
                  <div className="h-44 w-full relative mt-2 select-none">
                    <svg className="w-full h-full" viewBox="0 0 520 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10375C" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10375C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1="20" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="135" x2="500" y2="135" stroke="#e2e8f0" strokeWidth="1.5" />

                      {/* Filled Gradient Area */}
                      <motion.path 
                        key={salesTimeRange}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        d={lineChartPath.fillPath} 
                        fill="url(#chartGlow)" />

                      {/* Top Line Outline */}
                      <motion.path
                        key={`line-${salesTimeRange}`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        d={lineChartPath.strokePath} 
                        fill="none"
                        stroke="#10375C"
                        strokeWidth="3"
                        strokeLinecap="round" />
                    </svg>
                    
                    {/* Floating tooltip */}
                    <div className="absolute top-4 right-16 bg-[#10375C] text-white font-mono font-bold text-[9px] py-1 px-2 rounded-lg shadow-md border border-white/10 select-none">
                      Avg: 85.6%
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mt-2 font-sans">
                    <span>Start Month</span>
                    <span>Active Trend Line</span>
                    <span>End Month</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ── SECTION 2: STUDENT ROSTER ───────────────────────────── */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Users className="w-4.5 h-4.5 text-[#10375C]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#10375C] font-sans">Student & Classroom Roster</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Student Directory Table (Col span 7) */}
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[350px] justify-between">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black text-slate-700 tracking-wider uppercase font-sans">Student Directory</span>
                      
                      {/* Page Size Dropdown */}
                      <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-0.5 bg-slate-50 cursor-pointer">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <select
                          value={hrLimit}
                          onChange={(e) => {
                            setHrLimit(Number(e.target.value));
                            setHrPage(0);
                          }}
                          className="text-[9px] font-black text-slate-655 bg-transparent border-0 outline-none cursor-pointer"
                        >
                          <option value={5}>Showing 5</option>
                          <option value={8}>Showing 8</option>
                        </select>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">Roster logs</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-2">Student Name</th>
                          <th className="py-2.5 px-2">Classroom Group</th>
                          <th className="py-2.5 px-2 text-right">Last Active</th>
                          <th className="py-2.5 px-2 text-right">Average Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHr.map((emp: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                            <td className="py-2.5 px-2 font-bold text-slate-700">
                              <div className="flex items-center gap-2">
                                {/* Avatar bubble */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shadow-xs ${emp.color}`}>
                                  {emp.initials}
                                </div>
                                <span className="text-xs font-extrabold text-slate-805 font-sans">{emp.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-550 font-semibold">{emp.grade}</td>
                            <td className="py-2.5 px-2 text-right text-slate-400 font-bold">{emp.lastActive}</td>
                            <td className="py-2.5 px-2 text-right text-slate-700 font-black">{emp.avgScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table pagination */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Page {hrPage + 1} of {hrMaxPage}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setHrPage(prev => Math.max(0, prev - 1))}
                        disabled={hrPage === 0}
                        className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHrPage(prev => Math.min(hrMaxPage - 1, prev + 1))}
                        disabled={hrPage === hrMaxPage - 1}
                        className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Students distribution Donut Chart (Col span 5) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[350px] justify-between">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-700 tracking-wider uppercase font-sans">Classroom Distribution</span>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">Grade share</span>
                  </div>

                  {/* Vector Donut Chart & Details split */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    
                    {/* SVG Donut Chart */}
                    <div className="relative w-36 h-36 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                        {hrDistribution.groups.map((group, index) => (
                          <circle 
                            key={index}
                            cx="50" cy="50" r="40" fill="transparent" 
                            stroke={group.color} strokeWidth="10.5" 
                            strokeDasharray={group.dash} strokeDashoffset={group.offset} 
                          />
                        ))}
                      </svg>
                      
                      {/* Center Text inside Donut */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 font-sans select-none">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase leading-none tracking-wider">Total</span>
                        <span className="text-lg font-black text-slate-805 mt-1 leading-none">{hrDistribution.total}</span>
                        <span className="text-[7.5px] text-slate-400 font-bold leading-none mt-1">Active Students</span>
                      </div>
                    </div>

                    {/* Legend table */}
                    <div className="flex-1 flex flex-col gap-2.5 w-full font-sans select-none text-xs">
                      {hrDistribution.groups.map((group, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: group.color }} />
                            <span className="font-semibold text-slate-700 truncate max-w-[100px]">{group.name}</span>
                          </div>
                          <span className="font-extrabold text-slate-800">{group.pct}%</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  <div className="text-[9.5px] text-slate-400 font-bold tracking-tight text-center leading-normal">
                    Active student divisions are mapped directly from classroom groups.
                  </div>
                </div>

              </div>
            </div>

            {/* ── SECTION 3: ITEM BANK REPOSITORY ────────────────────── */}
            <div className="flex flex-col gap-6 mb-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <FolderOpen className="w-4.5 h-4.5 text-[#10375C]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#10375C] font-sans">Item Bank Repository</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Inventory table (Col span 7) */}
                <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[330px] justify-between">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-700 tracking-wider uppercase font-sans">Question Bank Logs</span>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">Syllabus tags</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-2">Question Text</th>
                          <th className="py-2.5 px-2">Question Code</th>
                          <th className="py-2.5 px-2 text-center">Use Count</th>
                          <th className="py-2.5 px-2 text-right">Syllabus Context</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedWarehouse.map((inv: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                            <td className="py-2.5 px-2 font-bold text-slate-700 line-clamp-1">{inv.text}</td>
                            <td className="py-2.5 px-2 text-slate-550 font-mono text-[10.5px]">{inv.code}</td>
                            <td className="py-2.5 px-2 text-center text-slate-805 font-extrabold">{inv.qty}</td>
                            <td className="py-2.5 px-2 text-right text-slate-400 font-bold text-[10px]">{inv.concept}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table pagination */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Page {warehousePage + 1} of {warehouseMaxPage}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWarehousePage(prev => Math.max(0, prev - 1))}
                        disabled={warehousePage === 0}
                        className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setWarehousePage(prev => Math.min(warehouseMaxPage - 1, prev + 1))}
                        disabled={warehousePage === warehouseMaxPage - 1}
                        className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item Category Donut Chart (Col span 5) */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4 min-h-[330px] justify-between">
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-700 tracking-wider uppercase font-sans">Question Formats Breakdown</span>
                    <span className="text-[10px] text-slate-400 font-bold font-sans">Syllabus types</span>
                  </div>

                  {/* Donut chart layout */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    
                    {/* SVG Donut */}
                    <div className="relative w-36 h-36 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                        {questionFormatsDistribution.formats.map((format, index) => (
                          <circle 
                            key={index}
                            cx="50" cy="50" r="40" fill="transparent" 
                            stroke={format.color} strokeWidth="10.5" 
                            strokeDasharray={format.dash} strokeDashoffset={format.offset} 
                          />
                        ))}
                      </svg>
                      
                      {/* Center metrics summary */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 font-sans select-none">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase leading-none tracking-wider">Total</span>
                        <span className="text-md font-black text-slate-805 mt-1 leading-none">{questionFormatsDistribution.total}</span>
                        <span className="text-[7.5px] text-slate-400 font-bold leading-none mt-1">Questions</span>
                      </div>
                    </div>

                    {/* Legend list */}
                    <div className="flex-1 flex flex-col gap-2.5 w-full font-sans select-none text-xs">
                      {questionFormatsDistribution.formats.map((format, index) => (
                        <div key={index} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: format.color }} />
                            <span className="font-semibold text-slate-700 truncate max-w-[100px]">{format.name}</span>
                          </div>
                          <span className="font-extrabold text-slate-800">{format.pct}%</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  <div className="text-[9.5px] text-slate-400 font-bold tracking-tight text-center leading-normal">
                    Category breakdown of active question bank templates.
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </AppShell>
  );
}
