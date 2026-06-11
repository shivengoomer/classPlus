// src/app/(workspace)/groups/page.tsx — Real API Groups Page
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { PillButton } from '@/components/shared/PillButton';
import {
  Folder, Users, Plus, ShieldCheck, User, X, Search, Trash2, ChevronDown,
  CheckCircle2, Copy, ClipboardCheck, AlertCircle, Loader2, CalendarDays,
  Brain, Trophy, XCircle, Upload, Edit3, BookOpen, FileText, Check, ChevronUp
} from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import {
  listGroups, createGroup, updateGroup, deleteGroup,
  listAssignments, listAssigned, createAssigned, deleteAssigned,
  listSubmissions, updateSubmission,
  type Group, type AssignedAssignment
} from '@/lib/api';

const RUBRICS = [
  'NCERT CBSE Rubric v2.1',
  'Primary Grammar Guide',
  'Algebra Evaluation Key',
  'NCERT CBSE Rubric v1.0',
  'Science Lab Assessment',
  'Board Exam Prep Rubric',
];

const GRADES = ['5th','6th','7th','8th','9th','10th','11th','12th'];
const SUBJECTS = ['Science','Mathematics','English','History','Physics','Chemistry','Biology'];

export default function GroupsPage() {
  const router = useRouter();
  const { setSubject, setGrade, setTitle, setInstructions } = useFormStore();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Group Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGrade, setNewGroupGrade] = useState('8th');
  const [newGroupSubject, setNewGroupSubject] = useState('Science');
  const [newGroupRubric, setNewGroupRubric] = useState(RUBRICS[0]);
  const [newGroupStudents, setNewGroupStudents] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Student
  const [newStudentName, setNewStudentName] = useState('');

  // Rubric dropdown
  const [showRubricDropdown, setShowRubricDropdown] = useState(false);

  // Assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Copy class code
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Phase 5 States
  const [allAssigned, setAllAssigned] = useState<AssignedAssignment[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [activeAssigned, setActiveAssigned] = useState<AssignedAssignment | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState<any | null>(null);
  const [gradingAnswers, setGradingAnswers] = useState<Record<string, { marks: number; isCorrect: boolean; aiFeedback: string; answer?: string }>>({});
  const [gradingTotalScore, setGradingTotalScore] = useState<number | null>(null);
  const [savingGrade, setSavingGrade] = useState(false);
  const [teacherUploadingName, setTeacherUploadingName] = useState<string | null>(null);
  const [uploadingPaper, setUploadingPaper] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listGroups();
      setGroups(data);
      if (data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
      }
    } catch (err: any) {
      setError('Failed to load class groups. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  const fetchAssigned = useCallback(async () => {
    setAssignedLoading(true);
    try {
      const data = await listAssigned();
      setAllAssigned(data);
    } catch (err) {
      console.error('Failed to load assigned assignments', err);
    } finally {
      setAssignedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchAssigned();
  }, [fetchGroups, fetchAssigned]);

  const fetchSubmissions = async (assignedId: string) => {
    setSubmissionsLoading(true);
    try {
      const data = await listSubmissions(assignedId);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOpenSubmissions = (assigned: AssignedAssignment) => {
    setActiveAssigned(assigned);
    setShowSubmissionsModal(true);
    setSelectedStudentSubmission(null);
    fetchSubmissions(assigned._id);
  };

  const handleOpenGrading = async (studentName: string) => {
    // Check if there is an existing submission
    const sub = submissions.find(s => s.studentName === studentName);
    if (sub) {
      // Fetch detailed results using studentResults endpoint
      try {
        setSubmissionsLoading(true);
        const res = await fetch(`http://localhost:4000/api/student/results/${activeAssigned?._id}?studentName=${encodeURIComponent(studentName)}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        const detailed = await res.json();
        
        setSelectedStudentSubmission(detailed);
        setGradingTotalScore(detailed.totalScore);
        const answersMap: Record<string, any> = {};
        for (const ans of detailed.answers || []) {
          answersMap[ans.questionId] = {
            marks: ans.marksAwarded !== undefined ? ans.marksAwarded : ans.marks,
            isCorrect: ans.isCorrect,
            aiFeedback: ans.aiFeedback,
            answer: ans.studentAnswer !== undefined ? ans.studentAnswer : ans.answer,
          };
        }
        setGradingAnswers(answersMap);
      } catch (err) {
        console.error('Failed to load detailed submission', err);
        // Fallback to simple list view data
        setSelectedStudentSubmission({
          studentName,
          totalScore: sub.totalScore,
          totalMarks: sub.totalMarks || activeAssigned?.assignmentId?.totalMarks || 10,
          answers: sub.answers || [],
        });
      } finally {
        setSubmissionsLoading(false);
      }
    } else {
      // Create new manual template for grading
      setSelectedStudentSubmission({
        studentName,
        totalScore: 0,
        totalMarks: activeAssigned?.assignmentId?.totalMarks || 10,
        answers: [],
      });
      setGradingTotalScore(0);
      setGradingAnswers({});
    }
  };

  const handleSaveGrade = async () => {
    if (!activeAssigned || !selectedStudentSubmission) return;
    setSavingGrade(true);
    try {
      const answersList = Object.entries(gradingAnswers).map(([qId, val]) => ({
        questionId: qId,
        marks: val.marks,
        isCorrect: val.isCorrect,
        aiFeedback: val.aiFeedback,
        answer: val.answer || '',
      }));

      const finalTotalScore = gradingTotalScore !== null ? gradingTotalScore : answersList.reduce((sum, a) => sum + (a.marks || 0), 0);

      const updated = await updateSubmission(activeAssigned._id, selectedStudentSubmission.studentName, {
        totalScore: finalTotalScore,
        answers: answersList,
        totalMarks: selectedStudentSubmission.totalMarks,
      });

      // Refresh submissions list
      await fetchSubmissions(activeAssigned._id);

      // Re-trigger grading layout load
      handleOpenGrading(selectedStudentSubmission.studentName);

      alert('Grade saved successfully!');
    } catch (err) {
      console.error('Failed to save grade', err);
      alert('Failed to save grade. Please try again.');
    } finally {
      setSavingGrade(false);
    }
  };

  const handleTeacherUpload = async (e: React.ChangeEvent<HTMLInputElement>, studentName: string) => {
    if (!e.target.files || !e.target.files[0] || !activeAssigned) return;
    setUploadingPaper(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('studentName', studentName);
      formData.append('paper', file);

      const res = await fetch(`http://localhost:4000/api/student/upload/${activeAssigned._id}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      alert('Paper uploaded successfully! You can now grade it manually.');
      fetchSubmissions(activeAssigned._id);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload paper.');
    } finally {
      setUploadingPaper(false);
    }
  };

  const handleUnassign = async (id: string) => {
    if (!confirm('Unassign this assessment? Students will lose access.')) return;
    try {
      await deleteAssigned(id);
      fetchAssigned();
    } catch (err) {
      console.error('Failed to unassign', err);
    }
  };

  // Fetch assignments when assign modal opens
  useEffect(() => {
    if (showAssignModal) {
      listAssignments()
        .then(data => setAssignments(data.filter(a => a.status === 'done')))
        .catch(() => {});
    }
  }, [showAssignModal]);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const studentList = newGroupStudents.split(',').map(s => s.trim()).filter(Boolean);
      const newGroup = await createGroup({
        name: newGroupName,
        grade: newGroupGrade,
        subject: newGroupSubject,
        rubric: newGroupRubric,
        students: studentList,
      });
      setGroups(prev => [newGroup, ...prev]);
      setSelectedGroup(newGroup);
      setShowCreateModal(false);
      setNewGroupName(''); setNewGroupStudents('');
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !selectedGroup) return;
    const updated = [...selectedGroup.students, newStudentName.trim()];
    try {
      const result = await updateGroup(selectedGroup._id, { students: updated });
      setGroups(prev => prev.map(g => g._id === result._id ? result : g));
      setSelectedGroup(result);
      setNewStudentName('');
    } catch {}
  };

  const handleRemoveStudent = async (student: string) => {
    if (!selectedGroup) return;
    const updated = selectedGroup.students.filter(s => s !== student);
    try {
      const result = await updateGroup(selectedGroup._id, { students: updated });
      setGroups(prev => prev.map(g => g._id === result._id ? result : g));
      setSelectedGroup(result);
    } catch {}
  };

  const handleChangeRubric = async (rubric: string) => {
    if (!selectedGroup) return;
    try {
      const result = await updateGroup(selectedGroup._id, { rubric });
      setGroups(prev => prev.map(g => g._id === result._id ? result : g));
      setSelectedGroup(result);
      setShowRubricDropdown(false);
    } catch {}
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this class group?')) return;
    try {
      await deleteGroup(id);
      const updated = groups.filter(g => g._id !== id);
      setGroups(updated);
      if (selectedGroup?._id === id) setSelectedGroup(updated[0] ?? null);
    } catch {}
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAssignToGroup = async () => {
    if (!selectedAssignmentId || !assignDueDate || !selectedGroup) return;
    setAssigning(true);
    setAssignError('');
    try {
      await createAssigned({
        assignmentId: selectedAssignmentId,
        groupId: selectedGroup._id,
        dueDate: assignDueDate,
      });
      setAssignSuccess(true);
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess(false);
        setSelectedAssignmentId('');
        setAssignDueDate('');
      }, 1500);
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign. Try again.');
    } finally {
      setAssigning(false);
    }
  };

  const handleComposerRedirect = () => {
    if (!selectedGroup) return;
    setSubject(selectedGroup.subject);
    setGrade(selectedGroup.grade);
    setTitle(`${selectedGroup.subject} Assessment — ${selectedGroup.name}`);
    setInstructions(`Create a balanced assessment for ${selectedGroup.name}. ${selectedGroup.students.length} students, grade ${selectedGroup.grade}.`);
    router.push('/create');
  };

  return (
    <AppShell>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 px-[2px] relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-bold text-veda-text-primary flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-600" />
              <span>My Class Groups</span>
            </h2>
            <p className="text-[13px] text-veda-text-secondary">
              Manage students, rubrics, and assign assessments to your classes.
            </p>
          </div>
          <PillButton
            variant="primary"
            icon={<Plus className="w-4 h-4 text-white" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Class Group
          </PillButton>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white border border-veda-card-border rounded-xl p-3 shadow-sm w-full flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search class groups by name, subject, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm outline-none text-veda-text-primary placeholder-veda-text-hint bg-transparent font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Group Cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="bg-white border border-veda-card-border rounded-xl p-8 text-center text-sm text-veda-text-secondary">
                {groups.length === 0 ? 'No class groups yet. Create one to get started!' : 'No groups match your search.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((g, i) => {
                  const isSelected = selectedGroup?._id === g._id;
                  return (
                    <motion.div
                      key={g._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedGroup(g)}
                      className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-4 hover:scale-[1.01] ${
                        isSelected
                          ? 'border-indigo-500 ring-1 ring-indigo-400/30 shadow-md'
                          : 'border-veda-card-border hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-600">
                            <Users className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-veda-text-primary">{g.name}</span>
                            <p className="text-[11px] text-veda-text-secondary mt-0.5">{g.subject} • CBSE Grade {g.grade}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g._id); }}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2 border-t border-gray-50 pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Students</span>
                          <span className="font-semibold text-veda-text-primary">{g.students.length} enrolled</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Rubric</span>
                          <span className="font-semibold text-indigo-600 truncate max-w-[140px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {(g.rubric || 'NCERT CBSE').replace('NCERT CBSE ', '')}
                          </span>
                        </div>
                        {/* Class Code */}
                        <div className="flex justify-between text-xs items-center mt-0.5">
                          <span className="text-gray-400">Class Code</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyCode(g.classCode); }}
                            className="flex items-center gap-1 font-black text-[#10375C] hover:text-indigo-700 transition-colors tracking-widest"
                          >
                            {g.classCode}
                            {copiedCode === g.classCode
                              ? <ClipboardCheck className="w-3 h-3 text-emerald-500" />
                              : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {selectedGroup ? (
                <motion.div
                  key={selectedGroup._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white border border-veda-card-border rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 p-5 border-b border-veda-card-border">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Class Overview</span>
                    <h3 className="text-[16px] font-bold text-veda-text-primary mt-2">{selectedGroup.name}</h3>

                    {/* Share code */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-gray-400">Share with students:</span>
                      <button
                        onClick={() => handleCopyCode(selectedGroup.classCode)}
                        className="flex items-center gap-1 text-xs font-black tracking-[0.2em] text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/20 px-2 py-0.5 rounded hover:bg-[#10375C]/10 transition-colors"
                      >
                        {selectedGroup.classCode}
                        {copiedCode === selectedGroup.classCode
                          ? <ClipboardCheck className="w-3 h-3 text-emerald-500" />
                          : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Rubric Selector */}
                    <div className="relative mt-2">
                      <button
                        onClick={() => setShowRubricDropdown(!showRubricDropdown)}
                        className="flex items-center gap-1 text-[11px] text-veda-text-secondary hover:text-indigo-600 transition-colors"
                      >
                        Rubric: <strong className="text-gray-700 ml-1">{(selectedGroup.rubric || 'NCERT CBSE').replace('NCERT CBSE ', '')}</strong>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showRubricDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showRubricDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute left-0 top-7 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex flex-col gap-1 w-64"
                          >
                            {RUBRICS.map(r => (
                              <button
                                key={r}
                                onClick={() => handleChangeRubric(r)}
                                className={`text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                                  selectedGroup.rubric === r ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-4">
                    <span className="text-xs font-bold text-veda-text-primary tracking-wider uppercase">
                      Roster ({selectedGroup.students.length})
                    </span>

                    <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto pr-1">
                      {selectedGroup.students.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No students yet. Add one below.</p>
                      ) : (
                        selectedGroup.students.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 px-2.5 rounded hover:bg-gray-50 transition-colors text-xs group">
                            <div className="flex items-center gap-2 text-veda-text-primary">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-medium">{s}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(s)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Student */}
                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      <input
                        type="text"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                        placeholder="Add student name..."
                        className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 font-sans"
                      />
                      <button
                        onClick={handleAddStudent}
                        className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Active Assessments */}
                    <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
                      <span className="text-xs font-bold text-veda-text-primary tracking-wider uppercase mb-1">
                        Active Assessments
                      </span>
                      {assignedLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        </div>
                      ) : (() => {
                        const groupAssigned = allAssigned.filter(
                          (a) => a.groupId?._id === selectedGroup._id || a.groupId === selectedGroup._id
                        );
                        if (groupAssigned.length === 0) {
                          return <p className="text-xs text-slate-400 text-center py-4">No assessments assigned yet.</p>;
                        }
                        return (
                          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {groupAssigned.map((a) => {
                              const title = a.assignmentId?.title || 'Untitled Assessment';
                              const total = selectedGroup.students.length;
                              const submitted = (a as any).submissionCount || 0;
                              const dueDateStr = a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
                              return (
                                <div key={a._id} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-2 hover:bg-slate-100/40 transition-colors">
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-slate-850 truncate">{title}</h4>
                                      <p className="text-[10px] text-slate-400 mt-0.5">Due: {dueDateStr}</p>
                                    </div>
                                    <button
                                      onClick={() => handleUnassign(a._id)}
                                      className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 p-0.5"
                                      title="Unassign"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 gap-4">
                                    <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                      <div
                                        className="bg-emerald-500 h-full rounded-full"
                                        style={{ width: `${total > 0 ? (submitted / total) * 100 : 0}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                      {submitted}/{total} Sub
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleOpenSubmissions(a)}
                                    className="w-full mt-1 py-1.5 text-[10px] font-bold text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/15 rounded-lg hover:bg-[#10375C]/10 transition-colors text-center"
                                  >
                                    Submissions & Grading
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-1">
                      <motion.button
                        onClick={() => setShowAssignModal(true)}
                        whileTap={{ scale: 0.97 }}
                        className="w-full text-xs py-2.5 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4" />
                        Assign Existing Assessment
                      </motion.button>
                      <motion.button
                        onClick={handleComposerRedirect}
                        whileTap={{ scale: 0.97 }}
                        className="w-full text-xs py-2.5 rounded-xl font-semibold bg-[#10375C] hover:bg-[#0d2f4f] text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Assessment
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border border-veda-card-border rounded-xl p-8 text-center text-xs text-veda-text-secondary">
                  Select a group to view roster and actions.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create Class Group</h3>
                    <p className="text-xs text-slate-500">A class code will be auto-generated</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Class Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="e.g. Grade 8 Science - Sec A"
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 font-sans"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Grade</label>
                    <select value={newGroupGrade} onChange={e => setNewGroupGrade(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 bg-white cursor-pointer">
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                    <select value={newGroupSubject} onChange={e => setNewGroupSubject(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 bg-white cursor-pointer">
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Evaluation Rubric</label>
                  <select value={newGroupRubric} onChange={e => setNewGroupRubric(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 bg-white cursor-pointer">
                    {RUBRICS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Student Roster (comma-separated)</label>
                  <textarea
                    value={newGroupStudents}
                    onChange={e => setNewGroupStudents(e.target.value)}
                    placeholder="Aarav Sharma, Aditi Verma, Rahul Singh..."
                    rows={3}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 font-sans resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{newGroupStudents.split(',').filter(s => s.trim()).length} students added</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700">Cancel</button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || creating}
                  className="flex-1 py-2.5 text-xs font-semibold bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-300 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  {creating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : 'Create Group'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Assessment Modal */}
      <AnimatePresence>
        {showAssignModal && selectedGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign Assessment</h3>
                  <p className="text-xs text-slate-500">Assigning to: <strong>{selectedGroup.name}</strong></p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {assignSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  <p className="text-sm font-bold text-slate-800">Assigned Successfully!</p>
                  <p className="text-xs text-slate-500">Students can now see this in their dashboard using class code: <strong>{selectedGroup.classCode}</strong></p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Assessment</label>
                      <select
                        value={selectedAssignmentId}
                        onChange={e => setSelectedAssignmentId(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer"
                      >
                        <option value="">-- Choose a completed assessment --</option>
                        {assignments.map(a => (
                          <option key={a._id} value={a._id}>{a.title} • {a.subject}</option>
                        ))}
                      </select>
                      {assignments.length === 0 && (
                        <p className="text-[10px] text-amber-500 mt-1">No generated assessments found. Create one first in the Assessments tab.</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Due Date</label>
                      <input
                        type="date"
                        value={assignDueDate}
                        onChange={e => setAssignDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-400 bg-white cursor-pointer"
                      />
                    </div>
                    {assignError && (
                      <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">{assignError}</div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700">Cancel</button>
                    <button
                      onClick={handleAssignToGroup}
                      disabled={!selectedAssignmentId || !assignDueDate || assigning}
                      className="flex-1 py-2.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      {assigning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning…</> : <><CalendarDays className="w-3.5 h-3.5" /> Assign</>}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Submissions & Grading Modal */}
    <AnimatePresence>
      {showSubmissionsModal && activeAssigned && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowSubmissionsModal(false);
            setSelectedStudentSubmission(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[550px] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Student Roster List */}
            <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col max-h-[35vh] md:max-h-none overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-sm font-black text-slate-800 tracking-tight">Student Submissions</h3>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {activeAssigned.assignmentId?.title || 'Untitled Assessment'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {selectedGroup?.students.map((studentName) => {
                  const sub = submissions.find(s => s.studentName.toLowerCase() === studentName.toLowerCase());
                  const isSelected = selectedStudentSubmission?.studentName.toLowerCase() === studentName.toLowerCase();
                  const hasSubmitted = !!sub;

                  return (
                    <button
                      key={studentName}
                      onClick={() => handleOpenGrading(studentName)}
                      className={`text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#10375C] border-[#10375C] text-white shadow-lg shadow-[#10375C]/10'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{studentName}</p>
                        {hasSubmitted ? (
                          <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-indigo-250' : 'text-slate-400'}`}>
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        ) : (
                          <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`}>
                            Pending
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasSubmitted ? (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-55 text-emerald-600 border border-emerald-100'
                          }`}>
                            {sub.totalScore}/{sub.totalMarks || activeAssigned.assignmentId?.totalMarks || 10}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                            —
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Submission Grading Console */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {submissionsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  <p className="text-xs text-slate-500">Loading student submission...</p>
                </div>
              ) : selectedStudentSubmission ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/20">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{selectedStudentSubmission.studentName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Grade Override Console • Maximum Marks: {selectedStudentSubmission.totalMarks}
                      </p>
                    </div>
                    
                    {/* Overall Score display */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Overall Score:</span>
                      <input
                        type="number"
                        value={gradingTotalScore ?? 0}
                        onChange={(e) => setGradingTotalScore(Number(e.target.value))}
                        className="w-16 text-center text-sm font-black border-2 border-slate-200 rounded-lg px-2 py-1 focus:border-[#10375C] outline-none"
                      />
                      <span className="text-xs font-bold text-slate-400">/ {selectedStudentSubmission.totalMarks}</span>
                    </div>
                  </div>

                  {/* Content Scroll */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    
                    {/* Hand-written Scanned Paper Upload section */}
                    {selectedStudentSubmission.answers?.length === 1 && selectedStudentSubmission.answers[0].questionId === 'upload' ? (
                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                          <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-indigo-800">Scanned Submission Paper</h5>
                            <p className="text-[11px] text-indigo-600 mt-1">This student submitted their work as a scanned document.</p>
                            <a
                              href={`http://localhost:4000${selectedStudentSubmission.answers[0].studentAnswer}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 mt-2.5 text-xs font-black text-[#10375C] hover:underline"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              View Uploaded Document
                            </a>
                          </div>
                        </div>
                        
                        {/* Manual entry for grading paper */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
                          <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">Evaluation Comments</h5>
                          <textarea
                            rows={4}
                            value={gradingAnswers['upload']?.aiFeedback || ''}
                            onChange={(e) => setGradingAnswers({
                              ...gradingAnswers,
                              'upload': { marks: gradingTotalScore ?? 0, isCorrect: (gradingTotalScore ?? 0) >= (selectedStudentSubmission.totalMarks * 0.5), aiFeedback: e.target.value, answer: selectedStudentSubmission.answers[0].studentAnswer }
                            })}
                            placeholder="Write feedback/remarks for the student's paper..."
                            className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-[#10375C] font-sans resize-none bg-white"
                          />
                        </div>
                      </div>
                    ) : selectedStudentSubmission.answers?.length > 0 ? (
                      /* Question details (Digital MCQ & Short Answers) */
                      <div className="flex flex-col gap-4">
                        <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-[#10375C]" />
                          Graded Question Breakdown
                        </h5>

                        {selectedStudentSubmission.answers.map((ans: any, idx: number) => {
                          const localGrading = gradingAnswers[ans.questionId] || { marks: ans.marksAwarded, isCorrect: ans.isCorrect, aiFeedback: ans.aiFeedback };
                          return (
                            <div key={ans.questionId} className={`border rounded-2xl overflow-hidden p-4 flex flex-col gap-3.5 ${
                              localGrading.isCorrect ? 'border-emerald-100 bg-emerald-50/10' : 'border-red-100 bg-rose-50/5'
                            }`}>
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className="text-xs font-bold text-slate-400 flex-shrink-0 mt-0.5">Q{idx + 1}.</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{ans.questionText}</p>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{ans.questionType}</span>
                                      {ans.conceptTag && <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">{ans.conceptTag}</span>}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Score adjustment */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <input
                                    type="number"
                                    value={localGrading.marks}
                                    max={ans.questionMarks}
                                    min={0}
                                    step={0.5}
                                    onChange={(e) => {
                                      const newMarks = Math.min(Math.max(Number(e.target.value), 0), ans.questionMarks);
                                      const isCorrect = newMarks >= (ans.questionMarks * 0.5);
                                      const updatedAnswers = {
                                        ...gradingAnswers,
                                        [ans.questionId]: { ...localGrading, marks: newMarks, isCorrect }
                                      };
                                      setGradingAnswers(updatedAnswers);
                                      const sum = Object.values(updatedAnswers).reduce((acc: number, item: any) => acc + (item.marks || 0), 0);
                                      setGradingTotalScore(sum);
                                    }}
                                    className="w-12 text-center text-xs font-bold border border-slate-300 rounded px-1.5 py-0.5 focus:border-[#10375C] outline-none bg-white"
                                  />
                                  <span className="text-[10px] font-bold text-slate-400">/ {ans.questionMarks}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                                <div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Student's Answer</span>
                                  <p className="text-xs text-slate-700 bg-white border border-slate-200/80 rounded-lg p-2 mt-1 min-h-[40px]">
                                    {ans.studentAnswer || <span className="text-slate-350 italic">No answer provided</span>}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">Model Answer</span>
                                  <p className="text-xs text-emerald-800 bg-emerald-50/50 border border-emerald-100/60 rounded-lg p-2 mt-1 min-h-[40px]">
                                    {ans.correctAnswer || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Feedback block */}
                              <div className="mt-1 bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex gap-2">
                                <Brain className="w-3.5 h-3.5 text-indigo-505 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide">Evaluation remarks</span>
                                  <textarea
                                    rows={2}
                                    value={localGrading.aiFeedback || ''}
                                    onChange={(e) => setGradingAnswers({
                                      ...gradingAnswers,
                                      [ans.questionId]: { ...localGrading, aiFeedback: e.target.value }
                                    })}
                                    className="w-full mt-1 text-xs border-0 outline-none bg-transparent p-0 resize-none font-sans text-slate-700 focus:ring-0 focus:outline-none"
                                    placeholder="Leave remarks or corrections..."
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Not submitted yet - actions: manual entry or scanned upload */
                      <div className="flex flex-col gap-6 py-4">
                        <div className="p-8 border border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center gap-4 bg-slate-50/20">
                          <div className="w-12 h-12 bg-[#10375C]/5 text-[#10375C] rounded-2xl flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-slate-800">Upload Student's Test Sheet</h5>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              If this student submitted a physical, written test paper, you can scan it and upload it here on their behalf.
                            </p>
                          </div>
                          
                          <label className="cursor-pointer py-2.5 px-5 text-xs font-bold text-white bg-[#10375C] hover:bg-[#0c2e4f] rounded-xl transition-all shadow-sm">
                            {uploadingPaper ? 'Uploading...' : 'Select scanned paper (PDF/JPG)'}
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              disabled={uploadingPaper}
                              onChange={(e) => handleTeacherUpload(e, selectedStudentSubmission.studentName)}
                            />
                          </label>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col gap-4">
                          <h5 className="text-xs font-black text-slate-750 uppercase tracking-wider">Manual Score Entry</h5>
                          <p className="text-[11px] text-slate-400">
                            Alternatively, grade the paper directly and key in the final marks and feedback below.
                          </p>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">General Evaluation Remarks</label>
                            <textarea
                              rows={3}
                              value={gradingAnswers['upload']?.aiFeedback || ''}
                              onChange={(e) => setGradingAnswers({
                                ...gradingAnswers,
                                'upload': { marks: gradingTotalScore ?? 0, isCorrect: (gradingTotalScore ?? 0) >= (selectedStudentSubmission.totalMarks * 0.5), aiFeedback: e.target.value }
                              })}
                              placeholder="Excellent performance, good understanding of chapter 4..."
                              className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-[#10375C] font-sans bg-white resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedStudentSubmission(null)}
                      className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Back to roster
                    </button>
                    <button
                      onClick={handleSaveGrade}
                      disabled={savingGrade}
                      className="py-2.5 px-6 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      {savingGrade ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Save Grade Override
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-center text-slate-400">
                  <User className="w-12 h-12 text-slate-300 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-slate-500">Grading Console</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Select a student from the class roster on the left to grade, review AI marks, or upload scanned sheets.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </AppShell>
);
}
