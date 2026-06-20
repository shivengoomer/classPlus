// src/app/superadmin/page.tsx — Unified Super Admin Workspace (Aime Design System)
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Plus, Edit2, Trash2, Key, GraduationCap, Users, Database, Globe,
  CheckCircle, XCircle, Loader2, Eye, X, Activity, BookOpen, Clock, Mail, MapPin, Calendar, School, LogOut, Star
} from 'lucide-react';
import {
  superAdminListInstitutions,
  superAdminCreateInstitution,
  superAdminUpdateInstitution,
  superAdminDeleteInstitution,
  SuperAdminInstitution,
  superAdminGetInstitutionDetail,
  SuperAdminInstitutionDetail,
  superAdminCreateAdmin,
  superAdminDeleteAdmin
} from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [institutions, setInstitutions] = useState<SuperAdminInstitution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  // Global KPI statistics
  const [globalCount, setGlobalCount] = useState(0);
  const [totalCreditsLimit, setTotalCreditsLimit] = useState(0);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);

  // Unified dynamic selection state
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const [schoolDetailData, setSchoolDetailData] = useState<SuperAdminInstitutionDetail | null>(null);
  const [schoolDetailLoading, setSchoolDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'admins' | 'teachers' | 'groups' | 'students' | 'audit'>('overview');

  // New Admin creation states
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminCreatedCredentials, setAdminCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formBoard, setFormBoard] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formSchoolCode, setFormSchoolCode] = useState('');
  const [formCreditsLimit, setFormCreditsLimit] = useState(5000);
  const [formPlanStatus, setFormPlanStatus] = useState('active');

  // Primary Admin creation states
  const [formAdminFirstName, setFormAdminFirstName] = useState('');
  const [formAdminLastName, setFormAdminLastName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formAdminPassword, setFormAdminPassword] = useState('');

  const usagePercentage = schoolDetailData?.institution
    ? (schoolDetailData.institution.creditsLimit > 0
        ? Math.min(100, Math.round((schoolDetailData.institution.creditsUsed / schoolDetailData.institution.creditsLimit) * 100))
        : 0)
    : 0;


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('classplus_superadmin_secret');
      if (stored) {
        setSecretKey(stored);
        setAuthorized(true);
      } else {
        router.push('/superadmin/login');
      }
    }
  }, [router]);

  // Debounce search input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page to 1 when search filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Loader triggered on page change or debouncedSearch update
  useEffect(() => {
    if (authorized) {
      loadInstitutions(page, debouncedSearch);
    }
  }, [authorized, page, debouncedSearch]);

  const loadInstitutions = async (currentPage = page, currentSearch = debouncedSearch) => {
    setLoading(true);
    setError('');
    try {
      const res = await superAdminListInstitutions(currentPage, limit, currentSearch);
      setInstitutions(res.docs || []);
      setTotalPages(res.totalPages || 1);
      setTotalDocs(res.totalDocs || 0);
      setPage(res.page || 1);
      if (res.stats) {
        setGlobalCount(res.stats.globalCount || 0);
        setTotalCreditsLimit(res.stats.totalCreditsLimit || 0);
        setTotalCreditsUsed(res.stats.totalCreditsUsed || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve institutions');
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        setAuthorized(false);
        localStorage.removeItem('classplus_superadmin_secret');
        router.push('/superadmin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = async (id: string | null) => {
    setActiveSchoolId(id);
    if (id === null) {
      setSchoolDetailData(null);
      return;
    }
    setSchoolDetailLoading(true);
    setDetailTab('overview');
    try {
      const data = await superAdminGetInstitutionDetail(id);
      setSchoolDetailData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load school sub-information details.', 'error');
      setActiveSchoolId(null);
    } finally {
      setSchoolDetailLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormBranch('');
    setFormBoard('CBSE');
    setFormAddress('');
    setFormSchoolCode('');
    setFormCreditsLimit(5000);
    setFormPlanStatus('active');
    setFormAdminFirstName('');
    setFormAdminLastName('');
    setFormAdminEmail('');
    setFormAdminPassword('');
    setShowForm(true);
  };

  const handleOpenEdit = (inst: SuperAdminInstitution) => {
    setEditingId(inst._id);
    setFormName(inst.name);
    setFormBranch(inst.branch || '');
    setFormBoard(inst.board || 'CBSE');
    setFormAddress(inst.address || '');
    setFormSchoolCode(inst.schoolCode || '');
    setFormCreditsLimit(inst.creditsLimit);
    setFormPlanStatus(inst.planStatus);
    setFormAdminFirstName('');
    setFormAdminLastName('');
    setFormAdminEmail('');
    setFormAdminPassword('');
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Institution Name is required', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: formName,
        branch: formBranch,
        board: formBoard,
        address: formAddress,
        schoolCode: formSchoolCode,
        creditsLimit: Number(formCreditsLimit),
        planStatus: formPlanStatus,
      };

      if (!editingId) {
        payload.adminEmail = formAdminEmail;
        payload.adminPassword = formAdminPassword;
        payload.adminFirstName = formAdminFirstName;
        payload.adminLastName = formAdminLastName;
      }

      if (editingId) {
        await superAdminUpdateInstitution(editingId, payload);
        showToast('Institution updated successfully!');
      } else {
        await superAdminCreateInstitution(payload);
        showToast('School tenant and Primary Admin registered successfully!');
      }
      setShowForm(false);
      loadInstitutions(page, debouncedSearch);
      if (activeSchoolId && activeSchoolId === editingId) {
        handleSelectSchool(activeSchoolId);
      }
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? All linked teachers and data will be detached.`)) {
      return;
    }
    setLoading(true);
    try {
      await superAdminDeleteInstitution(id);
      showToast('Institution removed successfully.');
      if (activeSchoolId === id) {
        handleSelectSchool(null);
      }
      loadInstitutions(page, debouncedSearch);
    } catch (err: any) {
      showToast(err.message || 'Deletion failed', 'error');
      setLoading(false);
    }
  };

  const handleOpenCreateAdmin = () => {
    setAdminFirstName('');
    setAdminLastName('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminCreatedCredentials(null);
    setShowAdminForm(true);
  };

  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchoolId) return;
    if (!adminEmail.trim() || !adminPassword.trim()) {
      showToast('Email and Password are required', 'error');
      return;
    }
    setLoading(true);
    try {
      await superAdminCreateAdmin(activeSchoolId, {
        email: adminEmail,
        password: adminPassword,
        firstName: adminFirstName,
        lastName: adminLastName
      });
      setAdminCreatedCredentials({ email: adminEmail, password: adminPassword });
      showToast('Admin account registered successfully!');
      // Reload school details
      const data = await superAdminGetInstitutionDetail(activeSchoolId);
      setSchoolDetailData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to create admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, email: string) => {
    if (!activeSchoolId) return;
    if (!window.confirm(`Are you sure you want to delete admin "${email}"? They will lose access to log in.`)) {
      return;
    }
    setLoading(true);
    try {
      await superAdminDeleteAdmin(activeSchoolId, adminId);
      showToast('Admin deleted successfully.');
      // Reload school details
      const data = await superAdminGetInstitutionDetail(activeSchoolId);
      setSchoolDetailData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete admin', 'error');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('classplus_superadmin_secret');
    setSecretKey('');
    setAuthorized(true);
    router.push('/superadmin/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#f3f3f5] flex items-center justify-center relative overflow-hidden font-sans">
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-[#3dbf3d] rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f5] p-2 relative overflow-hidden font-sans select-none flex flex-col">
      {/* Google Fonts link & Aime typography custom styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Source+Code+Pro:wght@400;500;600&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'Source Code Pro', monospace; }
        
        body {
          background-color: #f3f3f5;
        }
        .aime-canvas {
          background-image: linear-gradient(rgba(91,100,117,0.14), rgba(91,100,117,0.14));
        }
      `}</style>

      {/* Floating Island Layout Shell */}
      <div className="flex-1 flex aime-canvas rounded-[20px] overflow-hidden drop-shadow-[0_2px_3px_rgba(0,0,0,0.05)] border border-[rgba(77,101,148,0.10)] relative">
        
        {/* COLUMN 1: BotList (76px fixed, transparent background) */}
        <aside className="w-[76px] flex-shrink-0 flex flex-col items-center justify-between py-6 px-2 border-r border-[rgba(77,101,148,0.10)]">
          <div className="flex flex-col items-center gap-6 w-full">
            {/* Global home dashboard button */}
            <button
              onClick={() => handleSelectSchool(null)}
              className={`w-[36px] h-[36px] rounded-lg flex items-center justify-center transition-all ${
                activeSchoolId === null
                  ? 'bg-white border border-[rgba(77,101,148,0.15)] text-[#3dbf3d] shadow-sm'
                  : 'text-slate-450 hover:bg-[rgba(91,100,117,0.06)]'
              }`}
              title="Global SaaS Overview"
            >
              <School className="w-5 h-5" />
            </button>

            {/* Onboard School button (plus/star contained inside dashed avatar) */}
            <button
              onClick={handleOpenCreate}
              className="w-[36px] h-[36px] rounded-full border border-dashed border-[rgba(77,101,148,0.32)] flex items-center justify-center text-[#747b8a] hover:text-[#3dbf3d] hover:border-[#3dbf3d] transition-all bg-transparent"
              title="Onboard School Tenant"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Reload current view */}
            <button
              onClick={() => {
                loadInstitutions(page, debouncedSearch);
                if (activeSchoolId) handleSelectSchool(activeSchoolId);
              }}
              className="w-[32px] h-[32px] rounded-lg bg-[rgba(91,100,117,0.14)] hover:bg-[rgba(91,100,117,0.22)] flex items-center justify-center text-[#444c5c] hover:text-[#060e1f] transition-all"
              title="Reload Dashboard"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom logout / lock button */}
          <button
            onClick={handleLogout}
            className="w-[32px] h-[32px] rounded-lg bg-[rgba(235,84,94,0.10)] hover:bg-[rgba(235,84,94,0.18)] text-[#eb545e] flex items-center justify-center transition-all border border-[rgba(235,84,94,0.22)]"
            title="Lock SaaS Panel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </aside>

        {/* COLUMN 2: Chat List (260px fixed width, cool gray background) */}
        <aside className="w-[260px] flex-shrink-0 bg-[#f3f3f5] border-r border-[rgba(77,101,148,0.10)] flex flex-col justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Header box (56px) */}
            <div className="h-[56px] px-3 flex items-center border-b border-[rgba(77,101,148,0.10)]">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:outline-none rounded-md pl-7 pr-6 py-1.5 text-xs text-[#232938] placeholder-slate-400 font-inter"
                />
                <span className="absolute left-2.5 top-2.5 text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* School listings */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
              {institutions.length === 0 && !loading ? (
                <div className="text-center py-8 text-[#747b8a] text-[11px] font-bold uppercase tracking-wider">
                  No tenants found
                </div>
              ) : (
                institutions.map((instItem) => {
                  const active = activeSchoolId === instItem._id;
                  let planBadgeColor = 'bg-[rgba(61,191,61,0.10)] text-[#3dbf3d]';
                  if (instItem.planStatus === 'trial') planBadgeColor = 'bg-[rgba(245,159,0,0.10)] text-[#f59f00]';
                  if (instItem.planStatus === 'suspended') planBadgeColor = 'bg-[rgba(235,84,94,0.10)] text-[#eb545e]';

                  return (
                    <button
                      key={instItem._id}
                      onClick={() => handleSelectSchool(instItem._id)}
                      className={`w-full text-left p-3 rounded-lg flex flex-col gap-1.5 border transition-all ${
                        active
                          ? 'bg-[#ffffff] border-[rgba(77,101,148,0.10)] text-[#060e1f] shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                          : 'bg-transparent border-transparent text-[#444c5c] hover:bg-[rgba(91,100,117,0.06)]'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-[13px] font-bold leading-none ${active ? 'text-[#060e1f]' : 'text-[#232938]'}`}>
                          {instItem.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${planBadgeColor}`}>
                          {instItem.planStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block leading-none">
                        {instItem.branch || 'Main Branch'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Navigation pagination controls */}
          {totalPages > 1 && (
            <div className="h-[48px] border-t border-[rgba(77,101,148,0.10)] px-3 flex items-center justify-between bg-slate-50/20 font-inter">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-[11px] text-slate-500 hover:text-[#060e1f] disabled:opacity-30 disabled:hover:text-slate-500 font-bold"
              >
                Prev
              </button>
              <span className="text-[10px] font-bold font-mono text-[#747b8a]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-[11px] text-slate-500 hover:text-[#060e1f] disabled:opacity-30 disabled:hover:text-slate-500 font-bold"
              >
                Next
              </button>
            </div>
          )}
        </aside>

        {/* COLUMN 3: Main Output Viewport (flexible, white bg, right-rounded) */}
        <main className="flex-1 bg-[#ffffff] flex flex-col min-w-0">
          <AnimatePresence mode="wait">
            {activeSchoolId === null ? (
              
              /* GLOBAL CONTROL CENTER VIEW */
              <motion.div
                key="global-center"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col min-h-0"
              >
                {/* Header (56px) */}
                <header className="h-[56px] border-b border-[rgba(77,101,148,0.10)] px-6 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-[20px] h-[20px] rounded bg-[rgba(61,191,61,0.10)] flex items-center justify-center text-[#3dbf3d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3dbf3d]" />
                    </div>
                    <h2 className="text-[14px] font-bold text-[#060e1f] font-outfit uppercase tracking-wider">Global SaaS Control Center</h2>
                  </div>
                </header>

                {/* Dashboard stats viewport */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  <div className="max-w-[760px] mx-auto space-y-6">
                    {/* KPI statistics cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Registered School Tenants', value: globalCount, icon: <GraduationCap className="w-4 h-4 text-[#060e1f]" /> },
                        { label: 'Global Allocated Capacity', value: totalCreditsLimit.toLocaleString(), icon: <Database className="w-4 h-4 text-[#060e1f]" /> },
                        { label: 'Consumed Credit Requests', value: totalCreditsUsed.toLocaleString(), icon: <Activity className="w-4 h-4 text-[#3dbf3d]" /> }
                      ].map(card => (
                        <div key={card.label} className="bg-white border border-[rgba(77,101,148,0.20)] p-4 rounded-lg flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                          <div className="p-2 rounded bg-[#f5f6f7] text-[#444c5c]">{card.icon}</div>
                          <div>
                            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block">{card.label}</span>
                            <span className="text-[14px] font-bold text-[#232938] font-mono mt-0.5 block">{card.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Split details alerts vs Diagnostics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Alerts list */}
                      <div className="bg-white border border-[rgba(77,101,148,0.20)] rounded-lg p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 border-b border-[rgba(77,101,148,0.10)] pb-2.5">
                          <ShieldAlert className="w-4 h-4 text-[#eb545e]" />
                          <h4 className="text-[12px] font-bold text-[#060e1f] uppercase tracking-wider font-outfit">SaaS Alerts Monitor</h4>
                        </div>

                        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                          {(() => {
                            const alerts: React.ReactNode[] = [];
                            institutions.forEach(instItem => {
                              if (instItem.planStatus === 'suspended') {
                                alerts.push(
                                  <div key={`susp-${instItem._id}`} className="bg-[rgba(235,84,94,0.10)] border-l-4 border-l-[#eb545e] p-3 rounded flex flex-col gap-1 text-[12px]">
                                    <span className="text-[#eb545e] font-bold">SUSPENDED TENANT</span>
                                    <p className="text-[#232938] font-bold">{instItem.name}</p>
                                    <span className="text-slate-500 text-[10px]">Access suspended. Renewal required.</span>
                                  </div>
                                );
                              }
                              const ratio = instItem.creditsLimit > 0 ? instItem.creditsUsed / instItem.creditsLimit : 0;
                              if (ratio >= 0.8 && instItem.planStatus !== 'suspended') {
                                alerts.push(
                                  <div key={`usage-${instItem._id}`} className="bg-[rgba(245,159,0,0.10)] border-l-4 border-l-[#f59f00] p-3 rounded flex flex-col gap-1 text-[12px]">
                                    <span className="text-[#f59f00] font-bold">LIMIT REACHING • {Math.round(ratio * 100)}%</span>
                                    <p className="text-[#232938] font-bold">{instItem.name}</p>
                                    <span className="text-slate-500 text-[10px]">Approaching token capability capacity.</span>
                                  </div>
                                );
                              }
                            });

                            if (alerts.length === 0) {
                              return (
                                <div className="bg-[#f5f6f7] border border-[rgba(77,101,148,0.10)] rounded-lg p-5 text-center text-xs text-[#747b8a] flex flex-col items-center justify-center gap-2">
                                  <CheckCircle className="w-6 h-6 text-[#3dbf3d]" />
                                  <span className="font-bold text-[#3dbf3d]">All Networks Operational</span>
                                  <p className="text-[10px] text-slate-500">No suspensions or limit thresholds triggered.</p>
                                </div>
                              );
                            }
                            return alerts;
                          })()}
                        </div>
                      </div>

                      {/* System diagnostics heartbeat logs */}
                      <div className="bg-white border border-[rgba(77,101,148,0.20)] rounded-lg p-5 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-2 border-b border-[rgba(77,101,148,0.10)] pb-2.5">
                          <Activity className="w-4 h-4 text-[#060e1f]" />
                          <h4 className="text-[12px] font-bold text-[#060e1f] uppercase tracking-wider font-outfit">SaaS Diagnostics</h4>
                        </div>

                        <div className="space-y-2.5 font-mono text-[11px] text-[#444c5c]">
                          <div className="bg-[#f5f6f7] p-2.5 rounded border border-[rgba(77,101,148,0.10)] flex items-start gap-2">
                            <span className="text-[#3dbf3d] font-bold">[NOMINAL]</span>
                            <div>
                              <p className="text-[#060e1f] font-bold font-inter">Websocket Active (Port 4000)</p>
                              <span className="text-[9px] text-slate-500 font-mono">Heartbeats listening on ws://localhost</span>
                            </div>
                          </div>
                          <div className="bg-[#f5f6f7] p-2.5 rounded border border-[rgba(77,101,148,0.10)] flex items-start gap-2">
                            <span className="text-[#3dbf3d] font-bold">[NOMINAL]</span>
                            <div>
                              <p className="text-[#060e1f] font-bold font-inter">BullMQ Workers Active</p>
                              <span className="text-[9px] text-slate-500 font-mono">Grading and assessments active</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              
              /* SCHOOL DETAILS VIEW */
              <motion.div
                key="school-details"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col min-h-0"
              >
                {/* Header (56px) */}
                <header className="h-[56px] border-b border-[rgba(77,101,148,0.10)] px-6 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-[20px] h-[20px] rounded bg-[rgba(61,191,61,0.10)] flex items-center justify-center text-[#3dbf3d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3dbf3d]" />
                    </div>
                    <h2 className="text-[14px] font-bold text-[#060e1f] font-outfit">{schoolDetailData?.institution.name || 'Loading details...'}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-400">
                      {schoolDetailData?.institution.branch || 'Branch'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {schoolDetailData && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(schoolDetailData.institution)}
                          className="p-2 rounded bg-white hover:bg-[#f5f6f7] border border-[rgba(77,101,148,0.20)] text-[#444c5c] hover:text-[#060e1f] transition-all"
                          title="Edit Tenant"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(schoolDetailData.institution._id, schoolDetailData.institution.name)}
                          className="p-2 rounded bg-[#FEF2F2] border border-[rgba(235,84,94,0.20)] text-[#eb545e] hover:bg-[#FEE2E2] transition-all"
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </header>

                {schoolDetailLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 text-[#3dbf3d] animate-spin" />
                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Aggregating school details...</p>
                  </div>
                ) : schoolDetailData ? (
                  <div className="flex-grow flex flex-col min-h-0">
                    
                    {/* Tab Navigation row */}
                    <div className="flex bg-slate-50 border-b border-[#E4E4E7] px-6 overflow-x-auto shrink-0 font-inter">
                      {[
                        { id: 'overview', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
                        { id: 'admins', label: `Admins (${schoolDetailData.admins?.length || 0})`, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                        { id: 'teachers', label: `Teachers (${schoolDetailData.teachers.length})`, icon: <Users className="w-3.5 h-3.5" /> },
                        { id: 'groups', label: `Classes (${schoolDetailData.groups.length})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
                        { id: 'students', label: `Students (${schoolDetailData.students.length})`, icon: <GraduationCap className="w-3.5 h-3.5" /> },
                        { id: 'audit', label: `Audit Logs (${schoolDetailData.auditLogs.length})`, icon: <Clock className="w-3.5 h-3.5" /> }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setDetailTab(t.id as any)}
                          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 shrink-0 ${
                            detailTab === t.id
                              ? 'text-[#3dbf3d] border-[#3dbf3d]'
                              : 'text-slate-500 border-transparent hover:text-slate-800'
                          }`}
                        >
                          {t.icon}
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable tab subcontent */}
                    <div className="flex-grow overflow-y-auto p-6">
                      <div className="max-w-[760px] mx-auto space-y-6">
                        
                        {/* OVERVIEW SUB-TAB */}
                        {detailTab === 'overview' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { label: 'CBSE Affiliation Code', value: schoolDetailData.institution.schoolCode || 'N/A', icon: <Key className="w-4 h-4 text-[#060e1f]" /> },
                                { label: 'Affiliated Board', value: schoolDetailData.institution.board || 'CBSE', icon: <Globe className="w-4 h-4 text-[#060e1f]" /> },
                                { label: 'Linked Admins Count', value: `${schoolDetailData.institution.adminsCount || 0} Admins`, icon: <Users className="w-4 h-4 text-[#060e1f]" /> },
                                { label: 'Onboarding Date', value: new Date(schoolDetailData.institution.createdAt).toLocaleDateString(), icon: <Calendar className="w-4 h-4 text-[#060e1f]" /> }
                              ].map(card => (
                                <div key={card.label} className="bg-white border border-[rgba(77,101,148,0.20)] p-4 rounded-lg flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                  <div className="p-2 rounded bg-[#f5f6f7] text-[#444c5c]">{card.icon}</div>
                                  <div>
                                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">
                                      {card.label}
                                    </span>
                                    <span className="text-[13px] font-bold text-[#232938] mt-0.5 block">
                                      {card.value}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Address panel */}
                            <div className="bg-[#f5f6f7] border border-[rgba(77,101,148,0.10)] rounded-lg p-5">
                              <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-[#747b8a] mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-[10px] text-[#747b8a] font-bold uppercase tracking-wider block">School Address</span>
                                  <p className="text-[13px] text-[#232938] mt-1 leading-relaxed">
                                    {schoolDetailData.institution.address || 'No physical address configured for this school.'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Token Quotas progress */}
                            <div className="bg-white border border-[rgba(77,101,148,0.20)] rounded-lg p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-[13px] font-bold text-[#060e1f]">AI Engine Request Quotas</h4>
                                  <p className="text-[11px] text-slate-400 mt-0.5">Assigned credit pool utilization metrics.</p>
                                </div>
                                <span className="text-[13px] font-bold text-[#3dbf3d] font-mono">
                                  {schoolDetailData.institution.creditsUsed} / {schoolDetailData.institution.creditsLimit} ({usagePercentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-[#f3f3f5] border border-[rgba(77,101,148,0.10)] h-2.5 rounded-full overflow-hidden p-[1px]">
                                <div
                                  className="h-full bg-[#3dbf3d] rounded-full transition-all duration-300"
                                  style={{ width: `${usagePercentage}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* ADMINS SUB-TAB */}
                        {detailTab === 'admins' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            <div className="flex justify-between items-center bg-[#f5f6f7] p-3 rounded-lg border border-[rgba(77,101,148,0.15)]">
                              <span className="text-xs text-slate-505 font-bold uppercase tracking-wider">Configure School Administrator Credentials</span>
                              <button
                                onClick={handleOpenCreateAdmin}
                                className="px-3.5 py-1.5 bg-[#3dbf3d] hover:bg-[#62d662] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer font-inter"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Administrator
                              </button>
                            </div>

                            <div className="border border-[rgba(77,101,148,0.15)] rounded-lg overflow-hidden shadow-sm">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[#f5f6f7] border-b border-[rgba(77,101,148,0.15)] text-[10px] font-bold text-[#5b6475] uppercase tracking-widest">
                                    <th className="px-5 py-3">Administrator Name</th>
                                    <th className="px-5 py-3">Email Contact</th>
                                    <th className="px-5 py-3">ERP Role</th>
                                    <th className="px-5 py-3">Created On</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgba(77,101,148,0.10)] text-[13px] text-[#232938]">
                                  {!schoolDetailData.admins || schoolDetailData.admins.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="text-center py-12 text-[#747b8a]">No dedicated administrators found. Add one above.</td>
                                    </tr>
                                  ) : (
                                    schoolDetailData.admins.map(admin => (
                                      <tr key={admin._id} className="hover:bg-[rgba(91,100,117,0.04)] transition-colors">
                                        <td className="px-5 py-3.5 font-bold">
                                          {admin.firstName || admin.lastName ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() : 'System Admin'}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-slate-550 text-[12px]">{admin.email}</td>
                                        <td className="px-5 py-3.5">
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10375C]/10 border border-[#10375C]/20 text-[#10375C] uppercase tracking-wider font-mono">
                                            {admin.role}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-[#747b8a] text-[12px]">{new Date(admin.createdAt).toLocaleDateString()}</td>
                                        <td className="px-5 py-3.5 text-right">
                                          <button
                                            onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                                            className="p-1.5 rounded bg-[#FEF2F2] border border-[rgba(235,84,94,0.20)] text-[#eb545e] hover:bg-[#FEE2E2] transition-all cursor-pointer"
                                            title="Delete Administrator"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}

                        {/* TEACHERS SUB-TAB */}
                        {detailTab === 'teachers' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-[rgba(77,101,148,0.15)] rounded-lg overflow-hidden shadow-sm"
                          >
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#f5f6f7] border-b border-[rgba(77,101,148,0.15)] text-[10px] font-bold text-[#5b6475] uppercase tracking-widest">
                                  <th className="px-5 py-3">Faculty Name</th>
                                  <th className="px-5 py-3">Email Contact</th>
                                  <th className="px-5 py-3">Credits Consumption</th>
                                  <th className="px-5 py-3">Onboard Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[rgba(77,101,148,0.10)] text-[13px] text-[#232938]">
                                {schoolDetailData.teachers.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="text-center py-12 text-[#747b8a]">No teacher records linked to this school workspace.</td>
                                  </tr>
                                ) : (
                                  schoolDetailData.teachers.map(teacher => (
                                    <tr key={teacher._id} className="hover:bg-[rgba(91,100,117,0.04)] transition-colors">
                                      <td className="px-5 py-3.5 font-bold">
                                        {teacher.firstName || teacher.lastName ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : 'Invited Member'}
                                      </td>
                                      <td className="px-5 py-3.5 font-mono text-slate-500 text-[12px]">{teacher.email}</td>
                                      <td className="px-5 py-3.5 font-mono">
                                        <span className="font-bold text-[#3dbf3d]">{teacher.creditsUsed}</span>
                                        <span className="text-slate-400"> / {teacher.creditsLimit}</span>
                                      </td>
                                      <td className="px-5 py-3.5 text-[#747b8a] text-[12px]">{new Date(teacher.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </motion.div>
                        )}

                        {/* CLASSES SUB-TAB */}
                        {detailTab === 'groups' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {schoolDetailData.groups.length === 0 ? (
                              <div className="text-center py-16 border border-[rgba(77,101,148,0.15)] rounded-lg text-slate-500 text-xs">
                                No classroom groups created by linked teachers.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {schoolDetailData.groups.map(group => (
                                  <div key={group._id} className="bg-white border border-[rgba(77,101,148,0.20)] rounded-lg p-4 flex flex-col justify-between hover:border-slate-350 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-[13px] font-bold text-[#232938] leading-snug">{group.name}</h4>
                                        <span className="text-[10px] text-[#747b8a] font-bold uppercase mt-1 block">{group.grade} • {group.subject}</span>
                                      </div>
                                      <span className="text-[10px] font-mono font-bold bg-[#f5f6f7] border border-[rgba(77,101,148,0.15)] text-[#060e1f] px-2 py-0.5 rounded">
                                        {group.classCode}
                                      </span>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[rgba(77,101,148,0.10)] flex justify-between items-center text-[11px]">
                                      <span className="text-slate-550"> Roster Size</span>
                                      <span className="font-bold text-[#232938]">{group.students?.length || 0} Students</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* STUDENTS SUB-TAB */}
                        {detailTab === 'students' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-[rgba(77,101,148,0.15)] rounded-lg overflow-hidden shadow-sm"
                          >
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#f5f6f7] border-b border-[rgba(77,101,148,0.15)] text-[10px] font-bold text-[#5b6475] uppercase tracking-widest">
                                  <th className="px-5 py-3">Student Name</th>
                                  <th className="px-5 py-3">Email Address</th>
                                  <th className="px-5 py-3">Access Passcode</th>
                                  <th className="px-5 py-3">Linked Groups</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[rgba(77,101,148,0.10)] text-[13px] text-[#232938]">
                                {schoolDetailData.students.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="text-center py-12 text-[#747b8a]">No student roster records found.</td>
                                  </tr>
                                ) : (
                                  schoolDetailData.students.map(student => (
                                    <tr key={student._id} className="hover:bg-[rgba(91,100,117,0.04)] transition-colors">
                                      <td className="px-5 py-3.5 font-bold">{student.studentName}</td>
                                      <td className="px-5 py-3.5 font-mono text-slate-550 text-[12px]">{student.email}</td>
                                      <td className="px-5 py-3.5 font-mono text-[12px] text-[#3dbf3d] font-bold">{student.hashedPasscode}</td>
                                      <td className="px-5 py-3.5 text-[#747b8a] text-[12px] font-semibold">{student.groupIds?.length || 0} Classes</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </motion.div>
                        )}

                        {/* AUDIT LOGS SUB-TAB */}
                        {detailTab === 'audit' && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-[rgba(77,101,148,0.15)] rounded-lg overflow-hidden shadow-sm"
                          >
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#f5f6f7] border-b border-[rgba(77,101,148,0.15)] text-[10px] font-bold text-[#5b6475] uppercase tracking-widest">
                                  <th className="px-5 py-3">Actor</th>
                                  <th className="px-5 py-3">Action</th>
                                  <th className="px-5 py-3">Details</th>
                                  <th className="px-5 py-3">Timestamp</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[rgba(77,101,148,0.10)] text-[13px] text-[#232938]">
                                {schoolDetailData.auditLogs.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="text-center py-12 text-[#747b8a]">No audit logs recorded for this school.</td>
                                  </tr>
                                ) : (
                                  schoolDetailData.auditLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-[rgba(91,100,117,0.04)] transition-colors">
                                      <td className="px-5 py-3.5 font-bold">
                                        {log.actorName}
                                        <span className="block text-[9px] text-[#747b8a] uppercase font-bold mt-0.5 font-inter">{log.actorModel}</span>
                                      </td>
                                      <td className="px-5 py-3.5">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[rgba(61,191,61,0.10)] border border-[rgba(61,191,61,0.22)] text-[#3dbf3d]">
                                          {log.action}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 truncate max-w-xs" title={JSON.stringify(log.details)}>
                                        {JSON.stringify(log.details)}
                                      </td>
                                      <td className="px-5 py-3.5 text-[#747b8a] text-[12px]">{new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </motion.div>
                        )}

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs font-semibold">Select a school tenant from the list to view database configurations.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      </div>

      {/* FORM MODAL (ONBOARD SCHOOL) */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 font-inter">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#FFFFFF] border border-slate-200 rounded-lg p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <h2 className="text-lg font-bold mb-4 text-[#060e1f] font-outfit shrink-0">
              {editingId ? 'Edit Institution Settings' : 'Onboard New School Tenant'}
            </h2>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:ring-3 focus:ring-indigo-650/5 rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Branch / Location
                  </label>
                  <input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="e.g. Bokaro Sec-4"
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:ring-3 focus:ring-indigo-650/5 rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Education Board
                  </label>
                  <input
                    type="text"
                    value={formBoard}
                    onChange={(e) => setFormBoard(e.target.value)}
                    placeholder="e.g. CBSE / ICSE"
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:ring-3 focus:ring-indigo-650/5 rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    School Code / Affiliation
                  </label>
                  <input
                    type="text"
                    value={formSchoolCode}
                    onChange={(e) => setFormSchoolCode(e.target.value)}
                    placeholder="e.g. CBSE-3430015"
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:ring-3 focus:ring-indigo-650/5 rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Full postal address..."
                  className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:ring-3 focus:ring-indigo-650/5 rounded px-3 py-2 text-sm outline-none text-[#232938]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    AI Credits Limit
                  </label>
                  <input
                    type="number"
                    value={formCreditsLimit}
                    onChange={(e) => setFormCreditsLimit(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] focus:ring-3 focus:ring-indigo-650/5 rounded px-3 py-2 text-sm outline-none text-[#232938] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Plan Billing Status
                  </label>
                  <select
                    value={formPlanStatus}
                    onChange={(e) => setFormPlanStatus(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  >
                    <option value="active">Active (Premium)</option>
                    <option value="trial">Free Trial</option>
                    <option value="suspended">Suspended / Past Due</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Primary Admin credentials creation (only on onboard new school) */}
              {!editingId && (
                <div className="bg-[#f5f6f7] border border-[rgba(77,101,148,0.10)] rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[rgba(77,101,148,0.10)] pb-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Primary Admin User Credentials</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-550 font-bold uppercase tracking-wider mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formAdminFirstName}
                        onChange={(e) => setFormAdminFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-1.5 text-xs outline-none text-[#232938]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-550 font-bold uppercase tracking-wider mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formAdminLastName}
                        onChange={(e) => setFormAdminLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-1.5 text-xs outline-none text-[#232938]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-550 font-bold uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formAdminEmail}
                        onChange={(e) => setFormAdminEmail(e.target.value)}
                        placeholder="admin@school.com"
                        className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-1.5 text-xs outline-none text-[#232938]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-550 font-bold uppercase tracking-wider mb-1">
                        Login Password
                      </label>
                      <input
                        type="password"
                        value={formAdminPassword}
                        onChange={(e) => setFormAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-1.5 text-xs outline-none text-[#232938]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 shrink-0 font-inter">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-md text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3dbf3d] hover:bg-[#62d662] text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Onboard Tenant'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* FORM MODAL (CREATE ADMIN) */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 font-inter">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#FFFFFF] border border-slate-200 rounded-lg p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-lg font-bold text-[#060e1f] font-outfit">
                Add Administrator Account
              </h2>
              <button onClick={() => setShowAdminForm(false)} className="text-slate-400 hover:text-slate-655 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminCreatedCredentials ? (
              <div className="space-y-4">
                <div className="p-4 bg-[rgba(61,191,61,0.08)] border border-[rgba(61,191,61,0.20)] rounded-lg text-xs space-y-2">
                  <span className="font-bold text-[#3dbf3d] flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Account Provisioned Successfully
                  </span>
                  <p className="text-slate-600">Please copy and share these login credentials with the school administrator:</p>
                  <div className="p-3 bg-white border border-slate-200 rounded font-mono select-text mt-2 space-y-1.5">
                    <div><span className="text-slate-400 font-sans font-bold">Email:</span> {adminCreatedCredentials.email}</div>
                    <div><span className="text-slate-400 font-sans font-bold">Password:</span> {adminCreatedCredentials.password}</div>
                  </div>
                  <p className="text-[10px] text-slate-455 italic mt-1">Note: Passwords are hashed and cannot be retrieved later.</p>
                </div>
                <button
                  onClick={() => setShowAdminForm(false)}
                  className="w-full py-2 bg-[#3dbf3d] text-white text-xs font-semibold rounded hover:bg-[#62d662] transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdminFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={adminFirstName}
                      onChange={(e) => setAdminFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-2 text-sm outline-none text-[#232938]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={adminLastName}
                      onChange={(e) => setAdminLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-2 text-sm outline-none text-[#232938]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@school.com"
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Login Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FFFFFF] border border-[rgba(77,101,148,0.20)] focus:border-[rgba(77,101,148,0.32)] rounded px-3 py-2 text-sm outline-none text-[#232938]"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 font-inter">
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#3dbf3d] hover:bg-[#62d662] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Create Admin
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
