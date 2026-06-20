// src/app/admin/page.tsx — Premium ERP Admin Portal
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Users, BookOpen, ShieldAlert, Settings, PlusCircle,
  TrendingUp, Activity, Search, AlertCircle, RefreshCw, KeyRound, CheckCircle, Mail, School, ArrowLeft,
  Copy, Check, Sparkles, LogOut, UserPlus
} from 'lucide-react';
import {
  getAdminStats,
  listAdminTeachers,
  addAdminTeacher,
  listAdminGroups,
  getAdminAuditLogs,
  AdminStats,
  AdminTeacher,
  AdminAuditLog,
  Group
} from '@/lib/api';
import { useRouter } from 'next/navigation';

type AdminTab = 'overview' | 'teachers' | 'classes' | 'audit' | 'settings';

export default function AdminPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [classes, setClasses] = useState<Group[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Teacher form
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Search filter & UI feedback
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsData = await getAdminStats();
      setStats(statsData);

      // Fetch other admin sub-resources
      try {
        const [teachersData, classesData, auditData] = await Promise.all([
          listAdminTeachers(),
          listAdminGroups(),
          getAdminAuditLogs()
        ]);
        setTeachers(teachersData);
        setClasses(classesData);
        setAuditLogs(auditData);
      } catch (err: any) {
        console.warn('Sub-resource fetch failed, user may not have Admin permissions yet:', err);
      }
    } catch (err: any) {
      if (
        err.message === 'FORBIDDEN' ||
        err.message.includes('403') ||
        err.message.includes('Forbidden') ||
        err.message.includes('401') ||
        err.message === 'Unauthorized'
      ) {
        localStorage.removeItem('classplus_admin_token');
        router.push('/admin/login');
      } else {
        setError(err.message || 'Failed to connect to ERP API. Make sure you are signed in.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('classplus_admin_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      loadAllData();
    }
  }, []);

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setInviteLoading(true);
    setInviteError('');
    try {
      const added = await addAdminTeacher({
        email: newEmail.trim(),
        firstName: newFirstName.trim(),
        lastName: newLastName.trim()
      });
      setTeachers(prev => [added, ...prev]);
      setInviteModalOpen(false);
      setNewEmail('');
      setNewFirstName('');
      setNewLastName('');
      loadAllData(); // reload stats
    } catch (err: any) {
      setInviteError(err.message || 'Failed to add teacher.');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center relative overflow-hidden font-inter">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Source+Code+Pro:wght@400;500;600&display=swap');
        `}</style>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[40%] left-[30%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px]" />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-650 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Loading ERP Portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] font-inter flex items-center justify-center p-4 relative overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap');
          .font-outfit { font-family: 'Outfit', sans-serif; }
        `}</style>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-red-500/5 rounded-full blur-[100px] opacity-45" />
          <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-rose-500/5 rounded-full blur-[120px] opacity-45" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 sm:p-8 shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07)] relative z-10 flex flex-col gap-6 text-center"
        >
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#18181B] tracking-tight font-outfit">ERP Access Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[290px] mx-auto">
              Your account does not have administrator privileges. Please contact your system administrator or switch to an authorized workspace.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex flex-col gap-2">
            <a
              href="/dashboard"
              className="py-2.5 px-6 rounded-lg bg-[#4F46E5] text-[#FFFFFF] font-bold text-xs hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go back to Teacher Space
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const creditPercentage = stats ? Math.min(100, Math.round((stats.creditsUsed / stats.creditsLimit) * 100)) : 0;

  // Custom SVG Line Chart coordinates calculation
  const trendData = [
    { label: 'Mon', val: 180 },
    { label: 'Tue', val: 420 },
    { label: 'Wed', val: 290 },
    { label: 'Thu', val: 650 },
    { label: 'Fri', val: 510 },
    { label: 'Sat', val: 910 },
    { label: 'Sun', val: stats ? stats.creditsUsed : 800 }
  ];

  const maxVal = Math.max(...trendData.map(d => d.val), 1000);
  const chartPoints = trendData.map((d, idx) => {
    const x = 50 + idx * 70; // 50 to 470
    const y = 160 - (d.val / maxVal) * 120; // 160 to 40
    return { x, y, label: d.label, val: d.val };
  });

  const pathD = chartPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${chartPoints[chartPoints.length - 1].x} 160 L ${chartPoints[0].x} 160 Z`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] font-sans flex flex-col relative overflow-hidden">
      {/* Google Fonts link & typography custom styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Source+Code+Pro:wght@400;500;600&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'Source Code Pro', monospace; }
      `}</style>

      {/* Background ambient mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[130px]" />
      </div>

      {/* Header */}
      <header className="bg-[#FFFFFF] border-b border-[#E4E4E7] sticky top-0 z-30 shadow-[0px_1px_2px_rgba(24,24,27,0.05)] relative font-inter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center border border-[#4F46E5]/20 shadow-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-[#18181B] font-outfit">classPlus <span className="text-[#4F46E5]">ERP</span></span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">{stats?.schoolName || 'School Dashboard'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] hover:bg-[#FAFAFA] transition-colors text-slate-600"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href="/dashboard"
              className="text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Teacher Space
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('classplus_admin_token');
                router.push('/admin/login');
              }}
              className="text-xs border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] font-semibold px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2 font-inter">
          {[
            { id: 'overview', label: 'School Overview', icon: <Activity className="w-4 h-4" /> },
            { id: 'teachers', label: 'Manage Teachers', icon: <Users className="w-4 h-4" /> },
            { id: 'classes', label: 'Class Groups', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'audit', label: 'ERP Audit Logs', icon: <ShieldAlert className="w-4 h-4" /> },
            { id: 'settings', label: 'School Profile', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-3 text-xs font-bold px-4 py-3 rounded-lg border transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-[#EEF2FF] border-[#E4E4E7] text-[#4F46E5] border-l-2 border-l-[#4F46E5]'
                  : 'bg-transparent border-transparent text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 flex flex-col gap-6 min-w-0 font-inter">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Teachers', value: stats.teachersCount, change: '+12%', color: 'text-[#06B6D4] bg-[#ECFEFF] border-[#CFFAFE]', icon: <Users className="w-5 h-5 text-[#4F46E5]" /> },
                    { label: 'Class Groups', value: stats.groupsCount, change: 'Active', color: 'text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]', icon: <BookOpen className="w-5 h-5 text-[#16A34A]" /> },
                    { label: 'Students Enrolled', value: stats.studentsCount, change: 'Verified', color: 'text-[#06B6D4] bg-[#ECFEFF] border-[#CFFAFE]', icon: <GraduationCap className="w-5 h-5 text-[#06B6D4]" /> },
                    { label: 'Plan Status', value: stats.planStatus.toUpperCase(), change: 'Enterprise', color: 'text-[#4F46E5] bg-[#EEF2FF] border-[#C7D2FE]', icon: <TrendingUp className="w-5 h-5 text-[#4F46E5]" /> },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-[#D4D4D8] transition-all shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07),0px_2px_4px_-2px_rgba(24,24,27,0.05)]">
                      <div className="flex justify-between items-center relative z-10">
                        <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-slate-700 w-fit">{stat.icon}</div>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-full ${stat.color}`}>{stat.change}</span>
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-inter">{stat.label}</p>
                        <p className="text-2xl font-bold text-[#18181B] mt-0.5 font-outfit">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Onboarding State (If 0 Teachers) */}
                {stats.teachersCount === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5]/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex flex-col gap-1.5 relative z-10 max-w-xl">
                      <h4 className="text-sm font-bold text-[#18181B] flex items-center gap-2 font-outfit">
                        <Sparkles className="w-4 h-4 text-[#F97316]" /> Initialize Faculty Directory
                      </h4>
                      <p className="text-xs text-slate-655 leading-relaxed font-inter">
                        To activate your ERP, invite your first teacher to the workspace. Teachers can generate AI assessments, organize classroom groups, and track student statistics.
                      </p>
                    </div>
                    <button
                      onClick={() => setInviteModalOpen(true)}
                      className="flex items-center gap-2 text-xs bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] active:scale-[0.98] text-[#FFFFFF] font-semibold px-5 py-3 rounded-lg shadow-sm transition-all shrink-0 relative z-10 font-inter"
                    >
                      <UserPlus className="w-4 h-4" /> Invite First Teacher
                    </button>
                  </motion.div>
                )}

                {/* Analytical Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Custom SVG Line/Area Chart */}
                  <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 flex flex-col gap-4 shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07),0px_2px_4px_-2px_rgba(24,24,27,0.05)]">
                    <div>
                      <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-outfit">AI credit utilization</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-inter">Assigned credit usage history and projections (last 7 days).</p>
                    </div>
                    
                    <div className="w-full aspect-[2.5/1] relative">
                      <svg width="100%" height="100%" viewBox="0 0 500 180" className="overflow-visible">
                        <defs>
                          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.10" />
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>
                        
                        {/* Horizontal Gridlines */}
                        <line x1="40" y1="40" x2="480" y2="40" stroke="#E4E4E7" strokeDasharray="3" />
                        <line x1="40" y1="100" x2="480" y2="100" stroke="#E4E4E7" strokeDasharray="3" />
                        <line x1="40" y1="160" x2="480" y2="160" stroke="#E4E4E7" strokeDasharray="3" />
                        
                        {/* Y axis labels */}
                        <text x="12" y="44" fill="#71717A" fontSize="8.5" fontWeight="bold" className="font-mono">{maxVal}</text>
                        <text x="12" y="104" fill="#71717A" fontSize="8.5" fontWeight="bold" className="font-mono">{Math.round(maxVal / 2)}</text>
                        <text x="22" y="164" fill="#71717A" fontSize="8.5" fontWeight="bold" className="font-mono">0</text>
                        
                        {/* Area Fill */}
                        <path d={areaD} fill="url(#areaGlow)" />
                        
                        {/* Line Stroke */}
                        <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                        
                        {/* Dots and Labels */}
                        {chartPoints.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2" className="cursor-pointer" />
                            <text x={p.x} y="175" fill="#71717A" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-inter">{p.label}</text>
                            <g className="opacity-0 hover:opacity-100 transition-opacity">
                              <rect x={p.x - 20} y={p.y - 25} width="40" height="15" rx="3" fill="#18181B" />
                              <text x={p.x} y={p.y - 15} fill="#FAFAFA" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono">{p.val}</text>
                            </g>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Doughnut Distribution Chart */}
                  <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 flex flex-col gap-4 shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07),0px_2px_4px_-2px_rgba(24,24,27,0.05)]">
                    <div>
                      <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-outfit">Subject Coverage</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-inter">Classes distribution by academic division.</p>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 py-2 flex-1">
                      <div className="w-28 h-28 relative flex items-center justify-center">
                        <svg width="100%" height="100%" viewBox="0 0 120 120" className="rotate-[-90deg]">
                          {/* Segment 1: Science (50%) */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="#4F46E5" strokeWidth="10" strokeDasharray="141.37 282.74" strokeDashoffset="0" strokeLinecap="round" />
                          {/* Segment 2: Math (30%) */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="#06B6D4" strokeWidth="10" strokeDasharray="84.82 282.74" strokeDashoffset="-141.37" strokeLinecap="round" />
                          {/* Segment 3: English (20%) */}
                          <circle cx="60" cy="60" r="45" fill="transparent" stroke="#F97316" strokeWidth="10" strokeDasharray="56.55 282.74" strokeDashoffset="-226.19" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-[#18181B] font-outfit">{stats.groupsCount}</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold font-inter">Groups</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="w-full flex flex-col gap-1.5 px-2 font-inter">
                        {[
                          { subject: 'Science & Physics', color: 'bg-[#4F46E5]', pct: '50%' },
                          { subject: 'Mathematics', color: 'bg-[#06B6D4]', pct: '30%' },
                          { subject: 'English & Grammar', color: 'bg-[#F97316]', pct: '20%' }
                        ].map(legend => (
                          <div key={legend.subject} className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${legend.color}`} />
                              <span className="text-slate-600 font-semibold">{legend.subject}</span>
                            </div>
                            <span className="font-bold text-[#18181B]">{legend.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Credit Limits Progress Ring / Bar */}
                <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07),0px_2px_4px_-2px_rgba(24,24,27,0.05)]">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-outfit">Credits Pool Utilization</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-inter">Accumulated AI engine request tokens for the billing cycle.</p>
                    </div>
                    <span className="text-xs font-bold text-[#4F46E5] font-mono">{stats.creditsUsed} / {stats.creditsLimit} used</span>
                  </div>
                  <div className="w-full bg-[#FAFAFA] border border-[#E4E4E7] h-3 rounded-md overflow-hidden p-[1px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${creditPercentage}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-[#4F46E5] rounded-[4px]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TEACHERS TAB */}
            {activeTab === 'teachers' && (
              <motion.div
                key="teachers"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 font-inter"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search teachers by email/name..."
                      className="w-full text-xs bg-white border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg pl-10 pr-4 py-2.5 outline-none transition-colors placeholder-slate-400"
                    />
                  </div>
                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center gap-2 text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Teacher
                  </button>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg overflow-hidden shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07)]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E4E4E7] bg-slate-50/50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email Contact</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Token Allocation</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E4E7] text-xs">
                      {teachers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-slate-500">No teachers registered in this school.</td>
                        </tr>
                      ) : teachers
                        .filter(t => !searchQuery || t.email.toLowerCase().includes(searchQuery.toLowerCase()) || `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(teacher => (
                          <tr key={teacher._id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-[#18181B]">
                              {teacher.firstName || teacher.lastName ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : 'Invited Member'}
                            </td>
                            <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                              <span className="flex items-center gap-2">
                                {teacher.email}
                                <button
                                  onClick={() => handleCopyEmail(teacher.email, teacher._id)}
                                  className="text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                  {copiedId === teacher._id ? <Check className="w-3 h-3 text-[#16A34A]" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-semibold">{teacher.role}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 max-w-[130px]">
                                <span className="font-bold text-[#4F46E5] text-[10px] font-mono">{teacher.creditsUsed} / {teacher.creditsLimit} credits</span>
                                <div className="w-full bg-[#FAFAFA] border border-[#E4E4E7] h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${Math.min(100, Math.round((teacher.creditsUsed / teacher.creditsLimit) * 100))}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
                                Active
                              </span>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* CLASSES TAB */}
            {activeTab === 'classes' && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter"
              >
                {classes.length === 0 ? (
                  <div className="col-span-2 bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-8 text-center text-xs text-slate-500 shadow-sm">No class groups created yet.</div>
                ) : classes.map(c => (
                  <div key={c._id} className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-5 flex flex-col gap-4 hover:border-[#D4D4D8] transition-colors shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[#18181B] tracking-wide">{c.name}</h4>
                        <span className="text-[10px] text-slate-550 mt-1 block">{c.grade} • {c.subject}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#FAFAFA] border border-[#E4E4E7] text-[#4F46E5] px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-[#06B6D4]" /> {c.classCode}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-[#E4E4E7] flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">Class Roster size</span>
                      <span className="font-bold text-[#18181B]">{c.students.length} students</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg overflow-hidden shadow-sm font-inter"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] bg-slate-50/50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4">Actor</th>
                      <th className="px-6 py-4">Action Code</th>
                      <th className="px-6 py-4">Transaction Details</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E4E7] text-xs">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-slate-500">No ERP audit logs generated. Critical modifications will appear here.</td>
                      </tr>
                    ) : auditLogs.map(log => (
                      <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-[#18181B]">
                          {log.actorName}
                          <span className="block text-[8px] text-slate-400 font-bold uppercase mt-0.5">{log.actorModel}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-[11px] truncate max-w-xs">{JSON.stringify(log.details)}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && stats && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 flex flex-col gap-6 shadow-sm font-inter"
              >
                <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-outfit">Institutional Config</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-inter">
                  {[
                    { label: 'School Name', value: stats.schoolName },
                    { label: 'School Code', value: stats.schoolCode || 'CBSE-3430015' },
                    { label: 'School Branch', value: stats.branch || 'Bokaro Steel City' },
                    { label: 'Affiliated Board', value: stats.board || 'CBSE' }
                  ].map(field => (
                    <div key={field.label} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{field.label}</label>
                      <input
                        type="text"
                        disabled
                        value={field.value}
                        className="w-full text-xs bg-[#FAFAFA] border border-[#E4E4E7] text-slate-500 rounded-md px-4 py-3 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-[#EEF2FF] border border-[#4F46E5]/15 rounded-lg p-4 flex gap-3 text-xs text-[#4F46E5] leading-relaxed mt-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#4F46E5]" />
                  <p>Institution profile edits are restricted. Contact School Enterprise Admin to update सीबीएसई affiliation registrations or credits allocations.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* INVITE TEACHER MODAL */}
      <AnimatePresence>
        {inviteModalOpen && (
          <div className="fixed inset-0 bg-[#18181B]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-md bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 shadow-[0px_20px_25px_-5px_rgba(24,24,27,0.12),0px_8px_10px_-6px_rgba(24,24,27,0.06)] relative font-inter"
            >
              <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2 mb-4 font-outfit">
                <Users className="w-5 h-5 text-[#4F46E5]" /> Register Teacher Account
              </h3>
              
              <form onSubmit={handleAddTeacherSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#4F46E5]" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="teacher@school.com"
                    className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-3 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={e => setNewFirstName(e.target.value)}
                      placeholder="Shiven"
                      className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-3 outline-none text-[#18181B] placeholder-[#A1A1AA]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={e => setNewLastName(e.target.value)}
                      placeholder="Goomer"
                      className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-3 outline-none text-[#18181B] placeholder-[#A1A1AA]"
                    />
                  </div>
                </div>

                {inviteError && (
                  <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] rounded-md flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {inviteError}
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4 font-inter">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="text-xs text-slate-500 px-4 py-2 border border-[#E4E4E7] rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex items-center gap-2 text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold px-5 py-2.5 rounded-lg shadow-sm disabled:bg-slate-300 transition-colors"
                  >
                    {inviteLoading ? <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin" /> : 'Confirm Register'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
