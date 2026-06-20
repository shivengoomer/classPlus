'use client';

import { Suspense, useState, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/layout/AuthLayout";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Users, ArrowRight, Sparkles, AlertCircle, KeyRound, User, Lock, Mail } from "lucide-react";
import { verifyStudentSession, studentLogin, studentRegister } from '@/lib/studentApi';
import { useStudentStore } from '@/store/studentStore';

function SignInContent() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);

  // Student auth states
  const { setSession, studentName: storedStudentName, studentEmail: storedStudentEmail, _hasHydrated } = useStudentStore();
  const [flow, setFlow] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'info' | 'pin'>('info');
  const [email, setEmail] = useState('');
  const [classCode, setClassCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle URL-based role selection safely on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'teacher') {
        setSelectedRole('teacher');
      } else if (roleParam === 'student') {
        setSelectedRole('student');
      }
    }
  }, []);

  // Redirect if student is already logged in
  useEffect(() => {
    if (selectedRole === 'student' && _hasHydrated && storedStudentName && storedStudentEmail) {
      router.push('/student/dashboard');
    }
  }, [selectedRole, _hasHydrated, storedStudentName, storedStudentEmail, router]);

  // Auto-submit PIN when it reaches 4 digits
  useEffect(() => {
    if (selectedRole === 'student' && pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin, selectedRole]);

  // Handle first-step verification for student
  const handleVerifyEmailOrDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (flow === 'login') {
      if (!email.trim()) return;
      setLoading(true);
      try {
        const data = await verifyStudentSession(email.trim());
        if (data.status === 'needs_setup') {
          setError('No account found for this email. Please register with your Class Code.');
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
      if (!classCode.trim() || !studentName.trim() || !email.trim()) return;
      setStep('pin');
    }
  };

  // Handle PIN submission for student
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

      setSession(data.student, data.email, data.groups, data.token);
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

  // Back action helper
  const handleBack = () => {
    setSelectedRole(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('role');
      window.history.pushState({}, '', url.pathname);
    }
  };

  // Determine AuthLayout properties dynamically based on current screen
  let layoutTitle = "Welcome to classPlus";
  let layoutSubtitle = "Select your workspace role below to access your custom dashboard and learning features.";
  let portalType: 'teacher' | 'student' | undefined = undefined;

  if (selectedRole === 'teacher') {
    layoutTitle = "Teacher Sign In";
    layoutSubtitle = "Sign in to manage classrooms, create assessments, and track student progress.";
    portalType = 'teacher';
  } else if (selectedRole === 'student') {
    layoutTitle = "Student Portal";
    layoutSubtitle = flow === 'login' 
      ? "Sign in with your email and PIN to access your assignments and grades."
      : "Register to join your classroom and set up your student PIN.";
    portalType = 'student';
  }

  return (
    <AuthLayout
      title={layoutTitle}
      subtitle={layoutSubtitle}
      portalType={portalType}
      onBack={selectedRole !== null ? handleBack : undefined}
      backLabel="Change role"
    >
      <AnimatePresence mode="wait">
        {selectedRole === null && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col gap-4 max-w-md mx-auto"
          >
            {/* Educator & Admin Card */}
            <div 
              onClick={() => setSelectedRole('teacher')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-[#10375C]/[0.02] hover:border-[#10375C]/45 transition-all hover:shadow-[0_12px_24px_rgba(16,55,92,0.03)] cursor-pointer group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[#10375C]/5 border border-[#10375C]/10 flex items-center justify-center text-[#10375C] group-hover:bg-[#10375C] group-hover:text-white transition-all duration-300 flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-grow min-w-0 pr-2">
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#10375C] transition-colors font-outfit">
                  Educator & Admin Portal
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-normal font-medium">
                  Manage classrooms, auto-generate interactive assessments, grade submissions, and track learning gap statistics.
                </p>
              </div>
              <div className="flex items-center self-center text-slate-400 group-hover:text-[#10375C] transition-colors flex-shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Student Card */}
            <div 
              onClick={() => setSelectedRole('student')}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-indigo-500/[0.02] hover:border-indigo-500/45 transition-all hover:shadow-[0_12px_24px_rgba(99,102,241,0.03)] cursor-pointer group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-650 group-hover:text-white transition-all duration-300 flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-grow min-w-0 pr-2">
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-650 transition-colors font-outfit">
                  Student Learning Hub
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-normal font-medium">
                  Join classrooms, view assignments, solve quizzes, and chat with your personalized AI study partner.
                </p>
              </div>
              <div className="flex items-center self-center text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        )}

        {selectedRole === 'teacher' && (
          <motion.div
            key="teacher-signin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-row items-center justify-center"
          >
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: "#10375C",
                  colorText: "#0F172A",
                  colorTextSecondary: "#64748B",
                  colorBackground: "white",
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  borderRadius: "1rem",
                },
                elements: {
                  cardBox: "max-w-lg mx-auto",
                  card: "shadow-[0_24px_60px_rgba(16,55,92,0.06)] border border-slate-200/50 bg-white/90 backdrop-blur-xl rounded-[24px] px-6 py-6 sm:px-10 sm:py-8 w-full max-w-md mx-auto",
                  header: "hidden",
                  socialButtonsBlockButton: "border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 font-bold shadow-sm transition-all rounded-xl h-11 flex justify-center items-center gap-2",
                  socialButtonsBlockButtonText: "text-slate-600 font-bold text-xs font-sans",
                  formButtonPrimary: "bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs tracking-wider shadow-md shadow-[#10375C]/10 active:scale-[0.98] transition-all rounded-xl h-11 border-0 w-full mt-2 cursor-pointer uppercase font-sans",
                  formFieldInput: "border border-slate-200 focus:border-[#10375C] focus:ring-1 focus:ring-[#10375C]/20 bg-slate-50/30 hover:bg-slate-50/60 rounded-xl px-4 py-2.5 text-sm transition-all w-full font-sans",
                  formFieldLabel: "text-slate-700 font-bold text-xs mb-1.5 font-sans",
                  footerActionText: "text-slate-550 text-xs font-semibold font-sans",
                  footerActionLink: "text-[#10375C] hover:text-[#0d2f4f] font-bold text-xs transition-all font-sans",
                  identityPreviewText: "text-slate-700 font-bold text-xs font-sans",
                  identityPreviewEditButtonIcon: "text-[#10375C]",
                  dividerText: "text-slate-400 font-bold text-[9px] uppercase tracking-widest font-sans",
                  dividerLine: "bg-slate-200/60",
                  formFieldSuccessText: "text-emerald-600 text-xs font-semibold font-sans",
                  formFieldErrorText: "text-rose-600 text-xs font-semibold font-sans",
                  alert: "bg-rose-50 border border-rose-200/75 rounded-xl p-3 text-rose-700 text-xs font-semibold font-sans",
                }
              }}
            />
          </motion.div>
        )}

        {selectedRole === 'student' && (
          <motion.div
            key="student-signin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full flex justify-center"
          >
            <div className="shadow-[0_24px_60px_rgba(16,55,92,0.06)] border border-slate-200/50 bg-white/90 backdrop-blur-xl rounded-[24px] px-6 py-6 sm:px-10 sm:py-8 w-full max-w-md mx-auto flex flex-col gap-6">
              <AnimatePresence mode="wait">
                {step === 'info' ? (
                  <motion.div
                    key={flow === 'login' ? 'student-login-form' : 'student-register-form'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-5 w-full"
                  >
                    <form onSubmit={handleVerifyEmailOrDetails} className="flex flex-col gap-4">
                      {flow === 'login' ? (
                        /* Email Input (Direct Login) */
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. student@school.com"
                            required
                            className="w-full text-sm border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all placeholder:text-slate-400"
                          />
                          <p className="text-[10px] text-slate-400 leading-normal">Enter your registered student email address</p>
                        </div>
                      ) : (
                        /* Registration form fields */
                        <div className="flex flex-col gap-4">
                          {/* Class Code */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Class Code
                            </label>
                            <input
                              type="text"
                              value={classCode}
                              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                              placeholder="e.g. A3F9BC"
                              maxLength={10}
                              required
                              className="w-full text-center text-base font-extrabold tracking-[0.2em] border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-3 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all placeholder:text-slate-350 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                            />
                            <p className="text-[10px] text-slate-400 text-center leading-normal">Ask your teacher for the 6-character code</p>
                          </div>

                          {/* Roster Name */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-indigo-500" /> Roster Name
                            </label>
                            <input
                              type="text"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              placeholder="Exactly as enrolled by teacher"
                              required
                              className="w-full text-sm border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all"
                            />
                          </div>

                          {/* Email */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Address
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="e.g. name@school.com"
                              required
                              className="w-full text-sm border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 leading-normal">Used for code-free login from now on</p>
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200/50 rounded-xl text-xs text-red-650">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        type="submit"
                        disabled={loading || (flow === 'login' ? !email.trim() : (!classCode.trim() || !studentName.trim() || !email.trim()))}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 disabled:bg-slate-200 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mt-2 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>{flow === 'login' ? 'Verify Student Email' : 'Proceed to Set PIN'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Switch Flow Link */}
                    <div className="text-center border-t border-slate-100 pt-4 mt-1">
                      {flow === 'login' ? (
                        <button
                          onClick={() => switchFlow('register')}
                          className="text-xs text-indigo-650 hover:text-indigo-850 font-extrabold transition-colors cursor-pointer"
                        >
                          New to classPlus? Register with Class Code
                        </button>
                      ) : (
                        <button
                          onClick={() => switchFlow('login')}
                          className="text-xs text-indigo-650 hover:text-indigo-850 font-extrabold transition-colors cursor-pointer"
                        >
                          Already registered? Login here
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* PIN step */
                  <motion.div
                    key="student-pin-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-5 w-full"
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800">
                        {flow === 'register' ? 'Set Your Account PIN' : 'Enter Your Account PIN'}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                        {flow === 'register'
                          ? 'Define a 4-digit PIN to secure your portal credentials.'
                          : `Enter PIN for: ${email}`}
                      </p>
                    </div>

                    {/* PIN display circles */}
                    <div className="flex justify-center gap-3.5 my-2">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                            pin.length > idx
                              ? 'bg-slate-900 border-slate-900 scale-110 shadow-sm'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Numerical keypad */}
                    <div className="grid grid-cols-3 gap-2.5 mx-auto max-w-[210px] my-1 font-sans">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handlePinDigitClick(num)}
                          className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-sm flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPin('')}
                        className="w-12 h-12 text-slate-400 text-[11px] font-bold hover:text-slate-600 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePinDigitClick(0)}
                        className="w-12 h-12 rounded-full border border-slate-100 bg-slate-50/50 font-bold text-slate-700 text-sm flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handlePinBackspace}
                        className="w-12 h-12 text-slate-400 text-xs font-semibold hover:text-slate-600 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      >
                        ⌫
                      </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200/50 rounded-xl text-xs text-red-650 justify-center">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {loading && (
                      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10375C]" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
