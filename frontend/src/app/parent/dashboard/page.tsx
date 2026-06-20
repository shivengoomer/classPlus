// src/app/parent/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { 
  Users, CheckCircle2, AlertCircle, Calendar, Megaphone, Plus, 
  Loader2, LogOut, Check, ArrowRight, BookOpen, GraduationCap 
} from 'lucide-react';
import { parentLinkChild, parentGetChildren, parentGetDashboard } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

export default function ParentDashboard() {
  const { user, isLoaded } = useUser();
  const { addToast } = useToastStore();

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<any>(null);

  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Link child form state
  const [inviteCode, setInviteCode] = useState('');
  const [relationship, setRelationship] = useState('Guardian');
  const [linking, setLinking] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Load parent's linked children at startup
  const fetchChildren = async (autoSelectId?: string) => {
    setLoadingChildren(true);
    try {
      const data = await parentGetChildren();
      setChildren(data);
      if (data.length > 0) {
        // Auto-select first child if no child selected or specifically requested
        const targetId = autoSelectId || data[0]._id;
        setSelectedChildId(targetId);
      } else {
        setSelectedChildId('');
        setDashboardData(null);
      }
    } catch (err) {
      console.error('Failed to load children', err);
      addToast('Could not load children roster.', 'error');
    } finally {
      setLoadingChildren(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchChildren();
    }
  }, [isLoaded, user]);

  // Load selected child's details (dashboard data)
  useEffect(() => {
    if (!selectedChildId) return;

    const loadDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const data = await parentGetDashboard(selectedChildId);
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load child details', err);
        addToast('Failed to load child learning details.', 'error');
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboard();
  }, [selectedChildId]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLinking(true);
    try {
      const res = await parentLinkChild(inviteCode.trim(), relationship);
      addToast(res.message || 'Child linked successfully!', 'success');
      setInviteCode('');
      setShowLinkModal(false);
      // Refresh children list and auto-select newly linked child
      await fetchChildren(res.student?._id);
    } catch (err: any) {
      addToast(err.message || 'Failed to link child. Check code.', 'error');
    } finally {
      setLinking(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'K';
  };

  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEventTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#10375C]" />
      </div>
    );
  }

  // Segment tasks into upcoming / overdue
  const assignments = dashboardData?.assignments || [];
  const upcomingAssignments = assignments.filter((a: any) => {
    const isSubmitted = !!a.submission;
    const isOverdue = new Date(a.dueDate).getTime() < Date.now();
    return !isSubmitted && !isOverdue;
  });
  const overdueAssignments = assignments.filter((a: any) => {
    const isSubmitted = !!a.submission;
    const isOverdue = new Date(a.dueDate).getTime() < Date.now();
    return !isSubmitted && isOverdue;
  });
  const completedAssignments = assignments.filter((a: any) => !!a.submission);

  const selectedChildName = children.find(c => c._id === selectedChildId)?.studentName || 'Student';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans">
      {/* Top Premium Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#10375C] flex items-center justify-center text-white">
            <GraduationCap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">classPlus Portal</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Parent/Guardian Space</p>
          </div>
        </div>

        {/* Profile info / Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
            <p className="text-[9px] text-[#22C55E] font-bold uppercase tracking-wider">Role: Parent</p>
          </div>
          <SignOutButton>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Child Selector & Quick Actions Banner */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            
            <div className="text-center sm:text-left w-full sm:w-auto">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Child</label>
              {loadingChildren ? (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-xs text-slate-500 font-semibold">Loading roster…</span>
                </div>
              ) : children.length === 0 ? (
                <span className="text-xs font-bold text-slate-500">No children linked yet.</span>
              ) : (
                <select
                  value={selectedChildId}
                  onChange={e => setSelectedChildId(e.target.value)}
                  className="text-sm font-black text-slate-800 border-2 border-slate-200 rounded-xl px-4 py-2 bg-white cursor-pointer focus:border-[#10375C] outline-none transition-colors w-full sm:w-64"
                >
                  {children.map(c => (
                    <option key={c._id} value={c._id}>{c.studentName} ({c.email})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowLinkModal(true)}
            className="flex items-center justify-center gap-1.5 bg-[#10375C] hover:bg-[#0d2f4f] text-white text-xs font-bold px-4 py-3 rounded-2xl transition-colors cursor-pointer border-0 shadow-sm shadow-[#10375C]/15 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Link Child (Code)</span>
          </button>
        </section>

        {loadingDashboard ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#10375C]" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing child dashboard details…</p>
          </div>
        ) : children.length === 0 ? (
          /* Empty linking state */
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Welcome to Portal!</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                To view your child&apos;s educational performance, grades, and announcement feed, you must link their student account first.
              </p>
            </div>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1 bg-[#10375C] hover:bg-[#0d2f4f] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer border-0 shadow-md mt-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : !dashboardData ? (
          <div className="text-center py-10">
            <p className="text-xs text-slate-500 font-bold">Select a child from the dropdown to load workspace details.</p>
          </div>
        ) : (
          /* Real Data Layout Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left and Middle Columns (Main Feed) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Classes/Groups Grid */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Enrolled Classes</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dashboardData.groups?.map((g: any) => (
                    <div key={g._id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-1.5 hover:border-[#10375C]/25 transition-all">
                      <span className="text-[9px] font-black uppercase bg-[#10375C]/10 text-[#10375C] px-2 py-0.5 rounded-full w-max">
                        {g.subject}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 mt-1">{g.name}</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-2 pt-2 border-t border-slate-200/50">
                        <span>{g.grade}</span>
                        <span>Code: {g.classCode}</span>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData.groups || dashboardData.groups.length === 0) && (
                    <p className="text-xs text-slate-400 font-medium py-4">No active class groups found.</p>
                  )}
                </div>
              </section>

              {/* Grades / Marks Grid */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  <span>Academic Grades Tracker</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4">Subject & Assessment</th>
                        <th className="py-3 px-4 text-center">Score Awarded</th>
                        <th className="py-3 px-4 text-center">Percentage</th>
                        <th className="py-3 px-4 text-right">Submitted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedAssignments.map((a: any) => {
                        const pct = a.submission.totalMarks > 0 
                          ? Math.round((a.submission.totalScore / a.submission.totalMarks) * 100)
                          : 0;
                        return (
                          <tr key={a._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-black text-slate-800 truncate max-w-xs">{a.assignment?.title || 'Assessment'}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{a.assignment?.subject || 'Science'}</p>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-bold text-slate-800">
                                {a.submission.totalScore}
                              </span>
                              <span className="text-slate-400">/{a.submission.totalMarks}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                pct >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                pct >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400 text-[10px] font-bold">
                              {formatEventDate(a.submission.submittedAt)}
                            </td>
                          </tr>
                        );
                      })}
                      {completedAssignments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                            No graded assessments found for {selectedChildName}.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column (Tasks & Announcements) */}
            <div className="flex flex-col gap-6">
              
              {/* Task Deadlines Card */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Deadlines Tracker</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {/* Overdue Tasks */}
                  {overdueAssignments.map((a: any) => (
                    <div key={a._id} className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-800 leading-snug truncate">{a.assignment?.title}</h4>
                        <p className="text-[10px] text-red-500 font-bold mt-1">
                          Overdue · Due {formatEventDate(a.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Upcoming Tasks */}
                  {upcomingAssignments.map((a: any) => (
                    <div key={a._id} className="p-3.5 bg-amber-50/20 border border-amber-100/50 rounded-2xl flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-800 leading-snug truncate">{a.assignment?.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                          Due {formatEventDate(a.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {upcomingAssignments.length === 0 && overdueAssignments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 gap-1.5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <p className="text-xs font-semibold text-slate-500">All tasks submitted! No pending deadlines.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Announcements Feed Card */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-slate-500" />
                  <span>Class Announcements</span>
                </h3>

                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {dashboardData.announcements?.map((ann: any) => (
                    <div key={ann._id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-1.5 relative">
                      <h4 className="text-xs font-black text-slate-800 leading-tight pr-4">{ann.title}</h4>
                      <p className="text-[9px] text-slate-400 font-bold">
                        Posted by {ann.teacherName} · {formatEventTime(ann.createdAt)}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1 whitespace-pre-line">
                        {ann.content}
                      </p>
                    </div>
                  ))}
                  {(!dashboardData.announcements || dashboardData.announcements.length === 0) && (
                    <p className="text-xs text-slate-400 font-medium py-4 text-center">No announcements posted for these classes.</p>
                  )}
                </div>
              </section>

            </div>

          </div>
        )}
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#10375C]" />
                <h3 className="text-base font-black text-slate-900">Link Child Account</h3>
              </div>
              <button 
                onClick={() => setShowLinkModal(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-50 cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkChild} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the 6-character alphanumeric parent invite code generated by your child&apos;s teacher/admin.
              </p>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Parent Invite Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, ''))}
                  placeholder="e.g. A3F9BC"
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#10375C]/50 bg-slate-50 tracking-wider text-center"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full text-sm font-bold border border-slate-200 rounded-xl px-4 py-2.5 bg-white cursor-pointer focus:border-[#10375C]/50 outline-none"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian / Other</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking || inviteCode.length < 6}
                  className="flex-1 py-2.5 text-xs font-bold bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-350 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-sm"
                >
                  {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Link Child</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
