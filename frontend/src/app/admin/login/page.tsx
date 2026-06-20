// src/app/admin/login/page.tsx — Premium Standalone Admin Onboarding & Login Portal
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, KeyRound, AlertCircle, CheckCircle, ArrowLeft,
  ShieldCheck, User, PlusCircle, LogIn, Mail, Eye, EyeOff, Building2
} from 'lucide-react';
import { loginAdminUser, registerAdminSchool, claimAdminRole, getAdminStats } from '@/lib/api';
import { useRouter } from 'next/navigation';

type TabType = 'signin' | 'register' | 'claim';

export default function AdminLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Tab-specific loading/error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register school specific states
  const [schoolName, setSchoolName] = useState('');
  const [schoolBranch, setSchoolBranch] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolBoard, setSchoolBoard] = useState('CBSE');

  // Claim role specific states
  const [setupToken, setSetupToken] = useState('');

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('classplus_admin_token');
      if (token) {
        try {
          await getAdminStats();
          // If succeeds, user is logged in
          router.push('/admin');
          return;
        } catch {
          localStorage.removeItem('classplus_admin_token');
        }
      }
      setChecking(false);
    }
    checkAuth();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await loginAdminUser({
        email: email.trim(),
        password
      });
      localStorage.setItem('classplus_admin_token', res.token);
      setSuccessMessage('Logged in successfully. Redirecting to your administrative console...');
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await registerAdminSchool({
        name: schoolName.trim(),
        branch: schoolBranch.trim(),
        board: schoolBoard,
        schoolCode: schoolCode.trim(),
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      localStorage.setItem('classplus_admin_token', res.token);
      setSuccessMessage(`School "${schoolName}" registered successfully! Admin account created.`);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register school.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupToken.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await claimAdminRole({
        setupToken: setupToken.trim(),
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      localStorage.setItem('classplus_admin_token', res.token);
      setSuccessMessage('Setup token verified! Admin privileges claimed successfully.');
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to claim role. Verify setup token.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setError('');
    // Keep credentials cached but clear setup token and school profile inputs
    setSetupToken('');
    setSchoolName('');
    setSchoolBranch('');
    setSchoolCode('');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center relative overflow-hidden font-inter">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Source+Code+Pro:wght@400;500;600&display=swap');
        `}</style>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[40%] left-[30%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px]" />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Securing connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Font Loader */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&family=Source+Code+Pro:wght@400;500;600&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'Source Code Pro', monospace; }
      `}</style>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] opacity-80" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px] opacity-70" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 sm:p-8 shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07),0px_2px_4px_-2px_rgba(24,24,27,0.05)] relative z-10 flex flex-col gap-6"
      >
        {!success ? (
          <>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center mx-auto mb-3 border border-[#4F46E5]/20">
                <School className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#18181B] tracking-tight font-outfit">classPlus ERP Console</h2>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[340px] mx-auto leading-relaxed font-inter">
                Decentralized Institution Administrators management. Log in with your email or onboard a new institution.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E4E4E7] font-inter">
              <button
                type="button"
                onClick={() => switchTab('signin')}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center ${
                  activeTab === 'signin'
                    ? 'text-[#4F46E5] border-[#4F46E5]'
                    : 'text-[#71717A] border-transparent hover:text-[#18181B]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchTab('register')}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center ${
                  activeTab === 'register'
                    ? 'text-[#4F46E5] border-[#4F46E5]'
                    : 'text-[#71717A] border-transparent hover:text-[#18181B]'
                }`}
              >
                Register School
              </button>
              <button
                type="button"
                onClick={() => switchTab('claim')}
                className={`flex-1 pb-2.5 text-xs font-bold transition-all border-b-2 text-center ${
                  activeTab === 'claim'
                    ? 'text-[#4F46E5] border-[#4F46E5]'
                    : 'text-[#71717A] border-transparent hover:text-[#18181B]'
                }`}
              >
                Claim Admin Token
              </button>
            </div>

            <form
              onSubmit={
                activeTab === 'signin'
                  ? handleSignIn
                  : activeTab === 'register'
                  ? handleRegisterSchool
                  : handleClaimRole
              }
              className="flex flex-col gap-4 font-inter"
            >
              {/* Institutional Registration fields */}
              {activeTab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]"
                >
                  <div className="flex items-center gap-2 mb-1 border-b border-[#E4E4E7] pb-2">
                    <Building2 className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-[10px] font-bold uppercase text-[#71717A] tracking-wider">Institution Profile</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">
                      School / College Name
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={e => setSchoolName(e.target.value)}
                      placeholder="e.g. Delhi Public School"
                      className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">
                        Branch / Location
                      </label>
                      <input
                        type="text"
                        value={schoolBranch}
                        onChange={e => setSchoolBranch(e.target.value)}
                        placeholder="e.g. Dwarka Sec 12"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">
                        Affiliation Board
                      </label>
                      <select
                        value={schoolBoard}
                        onChange={e => setSchoolBoard(e.target.value)}
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] transition-colors"
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="IB">IB</option>
                        <option value="State Board">State Board</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">
                      CBSE Affiliation / School Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={e => setSchoolCode(e.target.value)}
                      placeholder="e.g. CBSE-3430015"
                      className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* Claim Role specific fields */}
              {activeTab === 'claim' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]"
                >
                  <div className="flex items-center gap-2 mb-1 border-b border-[#E4E4E7] pb-2">
                    <KeyRound className="w-4 h-4 text-[#4F46E5]" />
                    <span className="text-[10px] font-bold uppercase text-[#71717A] tracking-wider">Claim Verification</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">
                      Admin Setup Token
                    </label>
                    <input
                      type="password"
                      required
                      value={setupToken}
                      onChange={e => setSetupToken(e.target.value)}
                      placeholder="Enter secure platform setup token"
                      className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors font-mono"
                    />
                  </div>
                </motion.div>
              )}

              {/* Shared Admin Credentials fields */}
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7]">
                <div className="flex items-center gap-2 mb-1 border-b border-[#E4E4E7] pb-2">
                  <User className="w-4 h-4 text-[#4F46E5]" />
                  <span className="text-[10px] font-bold uppercase text-[#71717A] tracking-wider">Admin Credentials</span>
                </div>

                {activeTab !== 'signin' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#4F46E5]" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@school.com"
                    className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-[10px] font-bold text-[#3F3F46] uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-[#FFFFFF] border border-[#E4E4E7] focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/12 rounded-lg px-4 py-2.5 pr-10 outline-none text-[#18181B] placeholder-[#A1A1AA] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] rounded-md flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] active:scale-[0.98] text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0px_4px_6px_-1px_rgba(24,24,27,0.07)] disabled:bg-[#FAFAFA] disabled:border disabled:border-[#E4E4E7] disabled:text-slate-400 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {activeTab === 'signin' ? (
                      <>
                        <LogIn className="w-4 h-4" /> Sign In to ERP Console
                      </>
                    ) : activeTab === 'register' ? (
                      <>
                        <PlusCircle className="w-4 h-4" /> Register Institution & Claim
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Verify & Elevate Role
                      </>
                    )}
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#E4E4E7] font-inter">
              <a href="/dashboard" className="text-xs text-slate-500 hover:text-[#18181B] font-bold transition-colors inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Teacher Space
              </a>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center flex flex-col gap-5 py-4 font-inter"
          >
            <div className="w-12 h-12 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center mx-auto mb-1 shadow-md animate-pulse">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#18181B] tracking-tight font-outfit">Access Elevating...</h2>
              <p className="text-xs text-[#71717A] mt-2 leading-relaxed">
                {successMessage}
              </p>
            </div>

            <div className="w-full bg-[#FAFAFA] border border-[#E4E4E7] h-1.5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5 }}
                className="h-full bg-[#4F46E5] rounded-full"
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

