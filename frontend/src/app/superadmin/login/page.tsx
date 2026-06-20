// src/app/superadmin/login/page.tsx — Premium SaaS Super Admin Authentication Portal
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Key, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { superAdminListInstitutions } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [secretKey, setSecretKey] = useState('');
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkExistingAuth() {
      const stored = localStorage.getItem('classplus_superadmin_secret');
      if (stored) {
        try {
          // Attempt to list institutions to check if the stored token is valid
          await superAdminListInstitutions();
          router.push('/superadmin');
          return;
        } catch (err) {
          // Stored token is invalid, clear it
          localStorage.removeItem('classplus_superadmin_secret');
        }
      }
      setChecking(false);
    }
    checkExistingAuth();
  }, [router]);

  const handleAuthorizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      // Temporarily store it so the API call reads it from localStorage
      localStorage.setItem('classplus_superadmin_secret', secretKey.trim());
      
      // Attempt verification call
      await superAdminListInstitutions();
      
      // Token is valid! Redirect to dashboard
      router.push('/superadmin');
    } catch (err: any) {
      // Clear token since it's invalid
      localStorage.removeItem('classplus_superadmin_secret');
      setError('Invalid or expired Super Admin secret token.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[40%] left-[30%] w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px]" />
        </div>
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-800 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#FFFFFF] border border-slate-200 p-8 rounded-2xl shadow-xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <ShieldAlert className="w-8 h-8 text-[#0891B2]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-center">
            ClassPlus SaaS Super Admin
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">
            Access the SaaS control center. Please authenticate using the global secret key.
          </p>
        </div>

        <form onSubmit={handleAuthorizeSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Secret Token
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter secret token..."
                required
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-slate-200 rounded-xl px-4 py-3 pl-10 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10 transition-colors text-sm"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !secretKey.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Access SaaS Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <a href="/dashboard" className="text-xs text-slate-500 hover:text-slate-850 font-bold transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Main Site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
