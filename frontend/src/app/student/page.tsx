// src/app/student/page.tsx — Email & PIN Login and Registration Screen
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, Sparkles, AlertCircle, GraduationCap, KeyRound, User, Lock, ArrowLeft, Mail } from 'lucide-react';
import { verifyStudentSession, studentLogin, studentRegister } from '@/lib/studentApi';
import { useStudentStore } from '@/store/studentStore';

export default function StudentLoginPage() {
  const router = useRouter();
  const { setSession, studentName: storedStudentName, studentEmail: storedStudentEmail, _hasHydrated } = useStudentStore();

  // Redirect if already logged in
  useEffect(() => {
    if (_hasHydrated && storedStudentName && storedStudentEmail) {
      router.push('/student/dashboard');
    }
  }, [_hasHydrated, storedStudentName, storedStudentEmail, router]);

  const [flow, setFlow] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'info' | 'pin'>('info');

  // Input states
  const [email, setEmail] = useState('');
  const [classCode, setClassCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [pin, setPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-submit PIN when it reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  // Handle first-step verification
  const handleVerifyEmailOrDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (flow === 'login') {
      if (!email.trim()) return;
      setLoading(true);
      try {
        const data = await verifyStudentSession(email.trim());
        if (data.status === 'needs_setup') {
          // If no account found with email, transition to register flow automatically
          setError('No account found for this email. Please register below with your Class Code.');
          setFlow('register');
        } else {
          setStep('pin');
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Register validation
      if (!classCode.trim() || !studentName.trim() || !email.trim()) return;
      setStep('pin');
    }
  };

  // Handle PIN submission
  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) return;
    setLoading(true);
    setError('');

    try {
      let data;
      if (flow === 'register') {
        data = await studentRegister(
          classCode.trim(),
          studentName.trim(),
          email.trim(),
          pin
        );
      } else {
        data = await studentLogin(email.trim(), pin);
      }

      setSession(data.student, data.email, data.groups);
      // Store assignments in sessionStorage for dashboard
      sessionStorage.setItem('student_assignments', JSON.stringify(data.assignments));
      router.push('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your PIN.');
      setPin(''); // Reset PIN on error
    } finally {
      setLoading(false);
    }
  };

  const handlePinDigitClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const switchFlow = (newFlow: 'login' | 'register') => {
    setFlow(newFlow);
    setStep('info');
    setPin('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-indigo-100 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-blue-100 rounded-full blur-[100px] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#10375C] flex items-center justify-center shadow-xl shadow-[#10375C]/20">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              classPlus <span className="text-[#10375C]">Student</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {step === 'info'
                ? flow === 'login'
                  ? 'Access your workspace with email'
                  : 'Join your class group and register'
                : 'Secure your session'}
            </p>
          </div>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 p-5 sm:p-8 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            {step === 'info' ? (
              <motion.div
                key={flow === 'login' ? 'flow-login' : 'flow-register'}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <form onSubmit={handleVerifyEmailOrDetails} className="flex flex-col gap-4">
                  {flow === 'login' ? (
                    /* Email Input (Direct Login) */
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. student@school.com"
                        required
                        className="w-full text-sm border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-4 py-3 bg-slate-50 text-slate-800 transition-colors"
                      />
                      <p className="text-[10px] text-slate-400">Enter your registered student email address</p>
                    </div>
                  ) : (
                    /* Registration form fields */
                    <>
                      {/* Class Code */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Class Code
                        </label>
                        <input
                          type="text"
                          value={classCode}
                          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                          placeholder="e.g. A3F9BC"
                          maxLength={10}
                          required
                          className="w-full text-center text-lg font-black tracking-[0.2em] border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-4 py-2 bg-slate-50 text-slate-800 transition-colors placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                        />
                        <p className="text-[10px] text-slate-400 text-center">Ask your teacher for the 6-character code</p>
                      </div>

                      {/* Roster Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-500" /> Roster Name
                        </label>
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Exactly as enrolled by teacher"
                          required
                          className="w-full text-xs border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-800 transition-colors"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@school.com"
                          required
                          className="w-full text-xs border-2 border-slate-200 focus:border-indigo-400 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-800 transition-colors"
                        />
                        <p className="text-[10px] text-slate-400">Used for code-free login from now on</p>
                      </div>
                    </>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || (flow === 'login' ? !email.trim() : (!classCode.trim() || !studentName.trim() || !email.trim()))}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-2xl bg-[#10375C] hover:bg-[#0d2f4f] disabled:bg-slate-350 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] mt-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {flow === 'login' ? 'Verify Student Email' : 'Proceed to Set PIN'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Switch Flow Links */}
                <div className="text-center border-t border-slate-100 pt-4">
                  {flow === 'login' ? (
                    <button
                      onClick={() => switchFlow('register')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      New to classPlus? Register with Class Code
                    </button>
                  ) : (
                    <button
                      onClick={() => switchFlow('login')}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      Already registered? Login here
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Step 2: PIN Pad entry */
              <motion.div
                key="step-pin"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStep('info');
                      setPin('');
                      setError('');
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Back</span>
                </div>

                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {flow === 'register' ? 'Set Your Account PIN' : 'Enter Your Account PIN'}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    {flow === 'register'
                      ? 'Define a 4-digit PIN to secure your portal credentials.'
                      : `Enter PIN for: ${email}`}
                  </p>
                </div>

                {/* PIN Display Circles */}
                <div className="flex justify-center gap-3.5 my-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        pin.length > idx
                          ? 'bg-[#10375C] border-[#10375C] scale-110'
                          : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Pinpad numerical keyboard */}
                <div className="grid grid-cols-3 gap-2.5 mx-auto max-w-[200px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePinDigitClick(num)}
                      className="w-11 h-11 rounded-full border border-slate-100 bg-slate-55 font-bold text-slate-700 text-sm flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPin('')}
                    className="w-11 h-11 text-slate-400 text-xs font-semibold hover:text-slate-600 flex items-center justify-center active:scale-95 transition-all"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinDigitClick(0)}
                    className="w-11 h-11 rounded-full border border-slate-100 bg-slate-55 font-bold text-slate-700 text-sm flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handlePinBackspace}
                    className="w-11 h-11 text-slate-400 text-xs font-semibold hover:text-slate-600 flex items-center justify-center active:scale-95 transition-all"
                  >
                    ⌫
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 justify-center">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {loading && (
                  <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    Authenticating...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Teacher link */}
        <div className="text-center mt-6 flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <p className="text-sm text-slate-500">
            Are you a teacher?{' '}
            <a href="/sign-in" className="text-[#10375C] font-semibold hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
