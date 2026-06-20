// src/app/(workspace)/groups/page.tsx — Redesigned Groups Page
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import {
  Folder, Users, Plus, ShieldCheck, User, X, Search, Trash2, ChevronDown,
  CheckCircle2, Copy, ClipboardCheck, AlertCircle, Loader2, CalendarDays,
  Brain, Trophy, XCircle, Upload, Edit3, BookOpen, FileText, Check, ChevronUp,
  GraduationCap, Sparkles, Zap, MoreVertical, ArrowRight, ClipboardList,
  Hash, Star, TrendingUp, Badge, Info, Clock, Megaphone
} from 'lucide-react';
import { useFormStore } from '@/store/formStore';
import { useToastStore } from '@/store/toastStore';
import {
  listGroups, createGroup, updateGroup, deleteGroup,
  listAssignments, listAssigned, createAssigned, deleteAssigned,
  listSubmissions, updateSubmission,
  listAnnouncements, createAnnouncement, deleteAnnouncement,
  getGroupRoster, generateParentInvite,
  type Group, type AssignedAssignment, type Announcement
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

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Science: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Mathematics: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  English: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  History: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Physics: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  Chemistry: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  Biology: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
};

function getSubjectStyle(subject: string) {
  return SUBJECT_COLORS[subject] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' };
}

function formatEventTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch (err) {
    return dateStr;
  }
}

export default function GroupsPage() {
  const router = useRouter();
  const { setSubject, setGrade, setTitle, setInstructions } = useFormStore();
  const { addToast } = useToastStore();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'students' | 'assessments' | 'announcements' | 'actions'>('overview');

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

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [showComposeAnnouncement, setShowComposeAnnouncement] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

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
  const [uploadingPaper, setUploadingPaper] = useState(false);

  // Roster credentials and Parent Code States
  const [roster, setRoster] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [parentCodes, setParentCodes] = useState<Record<string, string>>({});
  const [generatingParentCode, setGeneratingParentCode] = useState<Record<string, boolean>>({});

  const fetchRosterData = useCallback(async (groupId: string) => {
    setRosterLoading(true);
    try {
      const data = await getGroupRoster(groupId);
      setRoster(data);
    } catch (err) {
      console.error('Failed to fetch roster details:', err);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchRosterData(selectedGroup._id);
    } else {
      setRoster([]);
    }
  }, [selectedGroup, fetchRosterData]);

  const handleGenerateParentCode = async (studentId: string, studentName: string) => {
    if (!selectedGroup) return;
    setGeneratingParentCode(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await generateParentInvite(selectedGroup._id, studentId);
      setParentCodes(prev => ({ ...prev, [studentId]: res.inviteCode }));
      addToast(`Generated Parent Code for ${studentName}: ${res.inviteCode}`, 'success');
      fetchRosterData(selectedGroup._id);
    } catch (err: any) {
      addToast(err.message || 'Failed to generate invite code', 'error');
    } finally {
      setGeneratingParentCode(prev => ({ ...prev, [studentId]: false }));
    }
  };


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

  const fetchGroupAnnouncements = useCallback(async (groupId: string) => {
    setAnnouncementsLoading(true);
    try {
      const data = await listAnnouncements(groupId);
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchAssigned();
  }, [fetchGroups, fetchAssigned]);

  useEffect(() => {
    if (selectedGroup && activeDetailTab === 'announcements') {
      fetchGroupAnnouncements(selectedGroup._id);
    }
  }, [selectedGroup, activeDetailTab, fetchGroupAnnouncements]);

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
    const sub = submissions.find(s => s.studentName === studentName);
    if (sub) {
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
      await updateSubmission(activeAssigned._id, selectedStudentSubmission.studentName, {
        totalScore: finalTotalScore,
        answers: answersList,
        totalMarks: selectedStudentSubmission.totalMarks,
      });
      await fetchSubmissions(activeAssigned._id);
      handleOpenGrading(selectedStudentSubmission.studentName);
      alert('Grade saved successfully!');
    } catch (err) {
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
      alert('Paper uploaded successfully!');
      fetchSubmissions(activeAssigned._id);
    } catch (err) {
      alert('Failed to upload paper.');
    } finally {
      setUploadingPaper(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !composeTitle.trim() || !composeContent.trim()) return;
    setPostingAnnouncement(true);
    try {
      await createAnnouncement({
        groupId: selectedGroup._id,
        title: composeTitle.trim(),
        content: composeContent.trim(),
      });
      setComposeTitle('');
      setComposeContent('');
      setShowComposeAnnouncement(false);
      fetchGroupAnnouncements(selectedGroup._id);
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement.');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      if (selectedGroup) {
        fetchGroupAnnouncements(selectedGroup._id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement.');
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
      fetchRosterData(selectedGroup._id);
    } catch {}
  };

  const handleRemoveStudent = async (student: string) => {
    if (!selectedGroup) return;
    const updated = selectedGroup.students.filter(s => s !== student);
    try {
      const result = await updateGroup(selectedGroup._id, { students: updated });
      setGroups(prev => prev.map(g => g._id === result._id ? result : g));
      setSelectedGroup(result);
      fetchRosterData(selectedGroup._id);
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
        fetchAssigned();
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

  const groupAssigned = selectedGroup
    ? allAssigned.filter(a => a.groupId?._id === selectedGroup._id || a.groupId === selectedGroup._id)
    : [];

  const subjectStyle = selectedGroup ? getSubjectStyle(selectedGroup.subject) : getSubjectStyle('');

  return (
    <AppShell>
      <div className="w-full h-full flex flex-col gap-4 relative z-10">

        {/* Page Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#10375C] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </span>
              My Class Groups
            </h1>
            <p className="text-xs text-slate-500 ml-9">
              {groups.length} {groups.length === 1 ? 'class' : 'classes'} · manage rosters, assessments & grading
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search classes…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs outline-none text-slate-700 placeholder-slate-400 bg-transparent font-sans"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-[#10375C] hover:bg-[#0d2f4f] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-[#10375C]/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              New Class
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex-shrink-0">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Main Two-Panel Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0">

          {/* LEFT: Class Cards Grid */}
          <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              {filteredGroups.length} class {filteredGroups.length === 1 ? 'group' : 'groups'}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 -mr-1">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Folder className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600">No classes yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">Create your first class group to get started</p>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-xs font-bold text-[#10375C] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Create Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  {filteredGroups.map((g, i) => {
                    const isSelected = selectedGroup?._id === g._id;
                    const style = getSubjectStyle(g.subject);
                    const assignedCount = allAssigned.filter(
                      a => a.groupId?._id === g._id || a.groupId === g._id
                    ).length;

                    return (
                      <motion.button
                        key={g._id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { setSelectedGroup(g); setActiveDetailTab('overview'); }}
                        className={`text-left w-full group relative bg-white border rounded-2xl p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#10375C] ring-2 ring-[#10375C]/10 shadow-md'
                            : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {/* Active indicator */}
                        {isSelected && (
                          <motion.div
                            layoutId="activeGroupIndicator"
                            className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-[#10375C]"
                          />
                        )}

                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg} border ${style.border}`}>
                            <GraduationCap className={`w-4.5 h-4.5 ${style.text}`} />
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteGroup(g._id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mb-3">
                          <h3 className="text-sm font-black text-slate-900 leading-tight">{g.name}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">CBSE · Grade {g.grade}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {g.subject}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <User className="w-3 h-3" />
                              {g.students.length}
                            </span>
                            {assignedCount > 0 && (
                              <span className="flex items-center gap-0.5">
                                <ClipboardList className="w-3 h-3" />
                                {assignedCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Class Code */}
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Code</span>
                          <button
                            onClick={e => { e.stopPropagation(); handleCopyCode(g.classCode); }}
                            className="flex items-center gap-1 font-black text-[11px] tracking-[0.15em] text-[#10375C] hover:text-indigo-700"
                          >
                            {g.classCode}
                            {copiedCode === g.classCode
                              ? <ClipboardCheck className="w-3 h-3 text-emerald-500" />
                              : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detail Panel */}
          <div className="lg:col-span-3 min-h-0">
            <AnimatePresence mode="wait">
              {selectedGroup ? (
                <motion.div
                  key={selectedGroup._id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="h-full bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden"
                >
                  {/* Panel Header */}
                  <div className={`px-5 pt-5 pb-0 border-b border-slate-100 flex-shrink-0`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${subjectStyle.bg} border ${subjectStyle.border}`}>
                          <GraduationCap className={`w-5 h-5 ${subjectStyle.text}`} />
                        </div>
                        <div>
                          <h2 className="text-base font-black text-slate-900">{selectedGroup.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subjectStyle.bg} ${subjectStyle.text} ${subjectStyle.border}`}>
                              {selectedGroup.subject}
                            </span>
                            <span className="text-[10px] text-slate-400">Grade {selectedGroup.grade}</span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[10px] text-slate-400">{selectedGroup.students.length} students</span>
                          </div>
                        </div>
                      </div>

                      {/* Copy Class Code */}
                      <button
                        onClick={() => handleCopyCode(selectedGroup.classCode)}
                        className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.18em] text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/15 px-2.5 py-1.5 rounded-lg hover:bg-[#10375C]/10 transition-colors flex-shrink-0"
                      >
                        {selectedGroup.classCode}
                        {copiedCode === selectedGroup.classCode
                          ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Tab Bar */}
                    <div className="flex items-center gap-0.5">
                      {([ 'overview', 'students', 'assessments', 'announcements', 'actions'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveDetailTab(tab)}
                          className={`relative px-3 py-2 text-xs font-bold capitalize transition-colors rounded-t-lg ${
                            activeDetailTab === tab
                              ? 'text-[#10375C]'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {tab}
                          {activeDetailTab === tab && (
                            <motion.div
                              layoutId="detailTabUnderline"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10375C] rounded-full"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">

                      {/* OVERVIEW TAB */}
                      {activeDetailTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-5 flex flex-col gap-5"
                        >
                          {/* Stats Row */}
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: 'Students', value: selectedGroup.students.length, icon: <Users className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                              { label: 'Assessments', value: groupAssigned.length, icon: <ClipboardList className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                              { label: 'Grade', value: selectedGroup.grade, icon: <GraduationCap className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                            ].map(stat => (
                              <div key={stat.label} className={`rounded-xl border p-3 flex flex-col gap-1.5 ${stat.color.split(' ').slice(1).join(' ')}`}>
                                <span className={`${stat.color.split(' ')[0]}`}>{stat.icon}</span>
                                <p className="text-lg font-black text-slate-900">{stat.value}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Info Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</span>
                              <span className="text-sm font-bold text-slate-800">{selectedGroup.subject}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Code</span>
                              <button
                                onClick={() => handleCopyCode(selectedGroup.classCode)}
                                className="text-sm font-black text-[#10375C] tracking-[0.12em] flex items-center gap-1.5 text-left"
                              >
                                {selectedGroup.classCode}
                                {copiedCode === selectedGroup.classCode
                                  ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          </div>

                          {/* Rubric */}
                          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Evaluation Rubric</span>
                              <div className="relative">
                                <button
                                  onClick={() => setShowRubricDropdown(!showRubricDropdown)}
                                  className="text-xs text-[#10375C] font-bold hover:underline flex items-center gap-1"
                                >
                                  Change <ChevronDown className={`w-3 h-3 transition-transform ${showRubricDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                  {showRubricDropdown && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -4 }}
                                      className="absolute right-0 top-7 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex flex-col gap-1 w-64"
                                    >
                                      {RUBRICS.map(r => (
                                        <button
                                          key={r}
                                          onClick={() => handleChangeRubric(r)}
                                          className={`text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                                            selectedGroup.rubric === r ? 'bg-[#10375C]/10 text-[#10375C] font-bold' : 'hover:bg-gray-50 text-gray-700'
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
                            <div className="flex items-center gap-2 mt-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#10375C] flex-shrink-0" />
                              <span className="text-sm font-bold text-slate-800">{selectedGroup.rubric || 'NCERT CBSE Rubric v2.1'}</span>
                            </div>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setActiveDetailTab('students')}
                              className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 hover:border-[#10375C]/30 hover:bg-[#10375C]/5 rounded-xl p-3 transition-all"
                            >
                              <Users className="w-4 h-4 text-slate-500" />
                              Manage Roster
                              <ArrowRight className="w-3 h-3 ml-auto" />
                            </button>
                            <button
                              onClick={() => setActiveDetailTab('assessments')}
                              className="flex items-center gap-2 text-xs font-bold text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl p-3 transition-all"
                            >
                              <ClipboardList className="w-4 h-4 text-slate-500" />
                              Assessments
                              <ArrowRight className="w-3 h-3 ml-auto" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* STUDENTS TAB */}
                      {activeDetailTab === 'students' && (
                        <motion.div
                          key="students"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-5 flex flex-col gap-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-black text-slate-900">Student Roster</h3>
                              <p className="text-xs text-slate-500">{selectedGroup.students.length} students enrolled</p>
                            </div>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                              {selectedGroup.students.length} / ∞
                            </span>
                          </div>

                          {/* Add Student Input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newStudentName}
                              onChange={e => setNewStudentName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
                              placeholder="Add student name and press Enter…"
                              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10375C]/50 font-sans bg-slate-50"
                            />
                            <button
                              onClick={handleAddStudent}
                              className="p-2.5 rounded-xl bg-[#10375C] hover:bg-[#0d2f4f] text-white transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Student List */}
                          <div className="flex flex-col gap-1">
                            {rosterLoading ? (
                              <div className="flex justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                              </div>
                            ) : roster.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-500 font-medium">No students yet. Add some above.</p>
                              </div>
                            ) : (
                              roster.map((s, idx) => {
                                const initials = s.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                                const isGen = generatingParentCode[s.studentId];
                                const code = parentCodes[s.studentId];
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 group transition-colors border border-transparent hover:border-slate-100"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 flex-shrink-0 border border-slate-200/60">
                                        {initials}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-slate-800 truncate">{s.name}</span>
                                        {s.isRegistered ? (
                                          <span className="text-[9px] text-emerald-500 font-bold">Registered ({s.email})</span>
                                        ) : (
                                          <span className="text-[9px] text-slate-400 font-semibold">Not registered</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {s.isRegistered && (
                                        code ? (
                                          <span className="text-[10px] font-mono font-black bg-indigo-50 text-[#4F46E5] border border-indigo-150/40 px-2 py-0.5 rounded-lg select-all">
                                            Parent Code: {code}
                                          </span>
                                        ) : (
                                          <button
                                            onClick={() => handleGenerateParentCode(s.studentId, s.name)}
                                            disabled={isGen}
                                            className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[#10375C] hover:underline flex items-center gap-1 border-0 bg-transparent cursor-pointer"
                                          >
                                            {isGen ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
                                            <span>Generate Parent Code</span>
                                          </button>
                                        )
                                      )}
                                      <button
                                        onClick={() => handleRemoveStudent(s.name)}
                                        className="opacity-0 group-hover:opacity-150 p-1 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 cursor-pointer border-0 bg-transparent"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* ASSESSMENTS TAB */}
                      {activeDetailTab === 'assessments' && (
                        <motion.div
                          key="assessments"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-5 flex flex-col gap-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-black text-slate-900">Active Assessments</h3>
                              <p className="text-xs text-slate-500">{groupAssigned.length} assigned to this class</p>
                            </div>
                            <button
                              onClick={() => setShowAssignModal(true)}
                              className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-2 rounded-xl transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Assign
                            </button>
                          </div>

                          {assignedLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                          ) : groupAssigned.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <ClipboardList className="w-6 h-6 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-600">No assessments assigned</p>
                                <p className="text-xs text-slate-400 mt-0.5">Assign an existing assessment or create a new one</p>
                              </div>
                              <button
                                onClick={() => setShowAssignModal(true)}
                                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Assign Assessment
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {groupAssigned.map(a => {
                                const title = a.assignmentId?.title || 'Untitled Assessment';
                                const total = selectedGroup.students.length;
                                const submitted = (a as any).submissionCount || 0;
                                const pct = total > 0 ? (submitted / total) * 100 : 0;
                                const dueDateStr = a.dueDate
                                  ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : 'No due date';

                                return (
                                  <div key={a._id} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col gap-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <h4 className="text-xs font-black text-slate-800 truncate">{title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Clock className="w-3 h-3 text-slate-400" />
                                          <span className="text-[10px] text-slate-400 font-semibold">Due {dueDateStr}</span>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleUnassign(a._id)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0"
                                        title="Unassign"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
                                        {submitted}/{total}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleOpenSubmissions(a)}
                                      className="w-full py-2 text-xs font-bold text-[#10375C] bg-[#10375C]/5 border border-[#10375C]/15 rounded-xl hover:bg-[#10375C]/10 transition-colors"
                                    >
                                      View Submissions & Grade
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* ANNOUNCEMENTS TAB */}
                      {activeDetailTab === 'announcements' && (
                        <motion.div
                          key="announcements"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-5 flex flex-col gap-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-black text-slate-900">Class Announcements</h3>
                              <p className="text-xs text-slate-500">Post announcements to the student feed</p>
                            </div>
                            <button
                              onClick={() => setShowComposeAnnouncement(!showComposeAnnouncement)}
                              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#10375C] hover:bg-[#0d2f4f] px-3 py-2 rounded-xl transition-colors cursor-pointer border-0 shadow-sm"
                            >
                              {showComposeAnnouncement ? 'Close Form' : 'Compose Announcement'}
                            </button>
                          </div>

                          {/* Expandable Compose Card */}
                          <AnimatePresence>
                            {showComposeAnnouncement && (
                              <motion.form
                                onSubmit={handlePostAnnouncement}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 overflow-hidden"
                              >
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={composeTitle}
                                    onChange={e => setComposeTitle(e.target.value)}
                                    placeholder="e.g. Bring scientific calculators tomorrow"
                                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#10375C]/50 bg-white font-sans text-slate-800"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Content</label>
                                  <textarea
                                    value={composeContent}
                                    onChange={e => setComposeContent(e.target.value)}
                                    placeholder="Write your announcement message here..."
                                    rows={3}
                                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#10375C]/50 bg-white font-sans text-slate-800 resize-none"
                                    required
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    type="submit"
                                    disabled={postingAnnouncement || !composeTitle.trim() || !composeContent.trim()}
                                    className="bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-350 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border-0 shadow-sm shadow-[#10375C]/10"
                                  >
                                    {postingAnnouncement ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-250 fill-amber-250 animate-pulse" />}
                                    <span>Post Announcement</span>
                                  </button>
                                </div>
                              </motion.form>
                            )}
                          </AnimatePresence>

                          {/* Announcements List Feed */}
                          {announcementsLoading ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                          ) : announcements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Megaphone className="w-6 h-6 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-600">No announcements posted</p>
                                <p className="text-xs text-slate-400 mt-0.5">Click Compose to post your first announcement</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              {announcements.map((ann) => (
                                <div key={ann._id} className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex flex-col gap-2 relative group">
                                  <div className="flex justify-between items-start">
                                    <div className="min-w-0 pr-6">
                                      <h4 className="text-xs font-black text-slate-800 leading-snug">{ann.title}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                        Posted by {ann.teacherName} · {formatEventTime(ann.createdAt)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteAnnouncement(ann._id)}
                                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 cursor-pointer border-0 bg-transparent"
                                      title="Delete Announcement"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium mt-1">
                                    {ann.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* ACTIONS TAB */}
                      {activeDetailTab === 'actions' && (
                        <motion.div
                          key="actions"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-5 flex flex-col gap-3"
                        >
                          <h3 className="text-sm font-black text-slate-900">Class Actions</h3>

                          <button
                            onClick={() => setShowAssignModal(true)}
                            className="flex items-center gap-3 w-full border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                              <CalendarDays className="w-4.5 h-4.5 text-emerald-600" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-800">Assign Existing Assessment</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Schedule a generated paper for this class</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                          </button>

                          <button
                            onClick={handleComposerRedirect}
                            className="flex items-center gap-3 w-full border border-slate-200 rounded-xl p-4 hover:border-[#10375C]/30 hover:bg-[#10375C]/5 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#10375C]/10 flex items-center justify-center group-hover:bg-[#10375C]/15 transition-colors">
                              <Sparkles className="w-4.5 h-4.5 text-[#10375C]" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-800">Create New Assessment</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">AI-generate a customized paper for this class</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                          </button>

                          <button
                            onClick={() => setActiveDetailTab('students')}
                            className="flex items-center gap-3 w-full border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Users className="w-4.5 h-4.5 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-800">Manage Student Roster</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Add or remove students from this class</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                          </button>

                          <div className="pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleDeleteGroup(selectedGroup._id)}
                              className="flex items-center gap-3 w-full border border-red-200 rounded-xl p-4 hover:bg-red-50 transition-all group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <Trash2 className="w-4.5 h-4.5 text-red-500" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black text-red-600">Delete Class Group</p>
                                <p className="text-[10px] text-red-400 mt-0.5">This action cannot be undone</p>
                              </div>
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full bg-white/60 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-4 text-center p-8"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Folder className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-600">No class selected</p>
                    <p className="text-xs text-slate-400 mt-1">Select a class from the left panel to view details</p>
                  </div>
                </motion.div>
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
                  <div className="w-9 h-9 rounded-2xl bg-[#10375C]/10 flex items-center justify-center text-[#10375C]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Create Class Group</h3>
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
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10375C]/50 font-sans"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Grade</label>
                    <select value={newGroupGrade} onChange={e => setNewGroupGrade(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10375C]/50 bg-white cursor-pointer">
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                    <select value={newGroupSubject} onChange={e => setNewGroupSubject(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10375C]/50 bg-white cursor-pointer">
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Evaluation Rubric</label>
                  <select value={newGroupRubric} onChange={e => setNewGroupRubric(e.target.value)} className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10375C]/50 bg-white cursor-pointer">
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
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#10375C]/50 font-sans resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{newGroupStudents.split(',').filter(s => s.trim()).length} students added</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700">Cancel</button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || creating}
                  className="flex-1 py-2.5 text-xs font-bold bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-300 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  {creating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : 'Create Class'}
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
                  <p className="text-xs text-slate-500 text-center">Students can now see this using class code: <strong>{selectedGroup.classCode}</strong></p>
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
                          <option key={a._id} value={a._id}>{a.title} · {a.subject}</option>
                        ))}
                      </select>
                      {assignments.length === 0 && (
                        <p className="text-[10px] text-amber-500 mt-1">No generated assessments found. Create one first.</p>
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
                      className="flex-1 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5"
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
            onClick={() => { setShowSubmissionsModal(false); setSelectedStudentSubmission(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[550px] max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Left Column */}
              <div className="w-full md:w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col max-h-[35vh] md:max-h-none overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">Student Submissions</h3>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    {activeAssigned.assignmentId?.title || 'Untitled Assessment'}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {selectedGroup?.students.map(studentName => {
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
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold truncate">{studentName}</span>
                            {hasSubmitted && sub.similarityScore !== undefined && sub.similarityScore >= 0.8 && (
                              <span
                                title={`High similarity flagged (${Math.round(sub.similarityScore * 100)}%)`}
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5 ${
                                  isSelected ? 'bg-red-500/50 text-white border border-red-400' : 'bg-red-50 text-red-600 border border-red-100'
                                }`}
                              >
                                ⚠️ {Math.round(sub.similarityScore * 100)}%
                              </span>
                            )}
                          </div>
                          {hasSubmitted ? (
                            <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          ) : (
                            <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-amber-200' : 'text-amber-500'}`}>Pending</p>
                          )}
                        </div>
                        {hasSubmitted ? (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'text-emerald-600 border border-emerald-100 bg-emerald-50'}`}>
                            {sub.totalScore}/{sub.totalMarks || activeAssigned.assignmentId?.totalMarks || 10}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>—</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {submissionsLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    <p className="text-xs text-slate-500">Loading submission...</p>
                  </div>
                ) : selectedStudentSubmission ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/20">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{selectedStudentSubmission.studentName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Grade Override · Max: {selectedStudentSubmission.totalMarks}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Score:</span>
                        <input
                          type="number"
                          value={gradingTotalScore ?? 0}
                          onChange={e => setGradingTotalScore(Number(e.target.value))}
                          className="w-16 text-center text-sm font-black border-2 border-slate-200 rounded-lg px-2 py-1 focus:border-[#10375C] outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">/ {selectedStudentSubmission.totalMarks}</span>
                      </div>
                    </div>

                    {selectedStudentSubmission.similarityScore !== undefined && selectedStudentSubmission.similarityScore >= 0.8 && (
                      <div className="bg-red-50 border-b border-red-100 px-5 py-3.5 flex items-start gap-3">
                        <span className="text-sm flex-shrink-0 mt-0.5">⚠️</span>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-red-800">
                            Potential Plagiarism / Copying Detected ({Math.round(selectedStudentSubmission.similarityScore * 100)}% Similarity)
                          </h5>
                          <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed">
                            This submission shares a high similarity score with other submissions in this group. Please review descriptive answers carefully.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                      {selectedStudentSubmission.answers?.length === 1 && selectedStudentSubmission.answers[0].questionId === 'upload' ? (
                        <div className="flex flex-col gap-4">
                          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                            <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-indigo-800">Scanned Submission Paper</h5>
                              <a
                                href={`http://localhost:4000${selectedStudentSubmission.answers[0].studentAnswer}`}
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs font-black text-[#10375C] hover:underline"
                              >
                                <Upload className="w-3.5 h-3.5" /> View Document
                              </a>
                            </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                            <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">Evaluation Comments</h5>
                            <textarea
                              rows={4}
                              value={gradingAnswers['upload']?.aiFeedback || ''}
                              onChange={e => setGradingAnswers({ ...gradingAnswers, 'upload': { marks: gradingTotalScore ?? 0, isCorrect: (gradingTotalScore ?? 0) >= (selectedStudentSubmission.totalMarks * 0.5), aiFeedback: e.target.value, answer: selectedStudentSubmission.answers[0].studentAnswer }})}
                              placeholder="Write feedback..."
                              className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:border-[#10375C] font-sans resize-none bg-white"
                            />
                          </div>
                        </div>
                      ) : selectedStudentSubmission.answers?.length > 0 ? (
                        <div className="flex flex-col gap-4">
                          {selectedStudentSubmission.answers.map((ans: any, idx: number) => {
                            const localGrading = gradingAnswers[ans.questionId] || { marks: ans.marksAwarded, isCorrect: ans.isCorrect, aiFeedback: ans.aiFeedback };
                            return (
                              <div key={ans.questionId} className={`border rounded-2xl overflow-hidden p-4 flex flex-col gap-3.5 ${localGrading.isCorrect ? 'border-emerald-100 bg-emerald-50/10' : 'border-red-100 bg-rose-50/5'}`}>
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <span className="text-xs font-bold text-slate-400 flex-shrink-0 mt-0.5">Q{idx + 1}.</span>
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{ans.questionText}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <input
                                      type="number"
                                      value={localGrading.marks}
                                      max={ans.questionMarks}
                                      min={0}
                                      step={0.5}
                                      onChange={e => {
                                        const newMarks = Math.min(Math.max(Number(e.target.value), 0), ans.questionMarks);
                                        const updatedAnswers = { ...gradingAnswers, [ans.questionId]: { ...localGrading, marks: newMarks, isCorrect: newMarks >= (ans.questionMarks * 0.5) } };
                                        setGradingAnswers(updatedAnswers);
                                        setGradingTotalScore(Object.values(updatedAnswers).reduce((acc: number, item: any) => acc + (item.marks || 0), 0));
                                      }}
                                      className="w-12 text-center text-xs font-bold border border-slate-300 rounded px-1.5 py-0.5 focus:border-[#10375C] outline-none bg-white"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400">/ {ans.questionMarks}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Student's Answer</span>
                                    <p className="text-xs text-slate-700 bg-white border border-slate-200/80 rounded-lg p-2 mt-1 min-h-[40px]">{ans.studentAnswer || <span className="text-slate-400 italic">No answer</span>}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">Model Answer</span>
                                    <p className="text-xs text-emerald-800 bg-emerald-50/50 border border-emerald-100/60 rounded-lg p-2 mt-1 min-h-[40px]">{ans.correctAnswer || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="mt-1 bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex gap-2">
                                  <Brain className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide">Remarks</span>
                                    <textarea
                                      rows={2}
                                      value={localGrading.aiFeedback || ''}
                                      onChange={e => setGradingAnswers({ ...gradingAnswers, [ans.questionId]: { ...localGrading, aiFeedback: e.target.value } })}
                                      className="w-full mt-1 text-xs border-0 outline-none bg-transparent p-0 resize-none font-sans text-slate-700"
                                      placeholder="Leave remarks..."
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 py-4">
                          <div className="p-8 border border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center gap-4 bg-slate-50/20">
                            <div className="w-12 h-12 bg-[#10375C]/5 text-[#10375C] rounded-2xl flex items-center justify-center">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">Upload Student's Test Sheet</h5>
                              <p className="text-xs text-slate-400 mt-1">Upload a scanned copy of the physical paper</p>
                            </div>
                            <label className="cursor-pointer py-2.5 px-5 text-xs font-bold text-white bg-[#10375C] hover:bg-[#0c2e4f] rounded-xl transition-all shadow-sm">
                              {uploadingPaper ? 'Uploading...' : 'Select File (PDF/JPG)'}
                              <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploadingPaper} onChange={e => handleTeacherUpload(e, selectedStudentSubmission.studentName)} />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                      <button onClick={() => setSelectedStudentSubmission(null)} className="py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        ← Back to roster
                      </button>
                      <button
                        onClick={handleSaveGrade}
                        disabled={savingGrade}
                        className="py-2.5 px-6 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        {savingGrade ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save Grade
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 text-center text-slate-400">
                    <User className="w-12 h-12 text-slate-300 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-slate-500">Grading Console</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Select a student from the roster to grade their submission</p>
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
