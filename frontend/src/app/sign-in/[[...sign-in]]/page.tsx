'use client';

import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/layout/AuthLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Users, ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export default function SignInPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'teacher' | null>(null);

  // Role picker screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EAF0F8] via-[#EEF2F8] to-[#E6ECF5] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#10375C]/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/[0.07] blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-[#10375C] flex items-center justify-center shadow-xl shadow-[#10375C]/25">
              <Logo className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">classPlus</h1>
              <p className="text-xs text-slate-500 mt-0.5">AI-powered education platform</p>
            </div>
          </div>

          {/* Role Picker Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-3xl shadow-2xl shadow-slate-200/60 p-6 flex flex-col gap-4">
            <div className="text-center mb-1">
              <h2 className="text-base font-black text-slate-900">Who are you signing in as?</h2>
              <p className="text-xs text-slate-500 mt-1">Choose your role to continue</p>
            </div>

            {/* Teacher option */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('teacher')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#10375C]/20 bg-[#10375C]/5 hover:bg-[#10375C]/10 hover:border-[#10375C]/40 transition-all group text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-[#10375C] flex items-center justify-center shadow-md shadow-[#10375C]/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900">Teacher / School</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Manage classes, create assessments & grade</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#10375C] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </motion.button>

            {/* Student option */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/student')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-indigo-200/60 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900">Student</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Access assignments, practice & AI tutor</p>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </motion.button>

            {/* Back to home */}
            <div className="text-center pt-1 border-t border-slate-100">
              <button
                onClick={() => router.push('/')}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors"
              >
                ← Back to homepage
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Teacher selected — show Clerk sign-in via AuthLayout
  return (
    <AuthLayout
      title="Teacher Sign In"
      subtitle="Sign in to manage classrooms, create assessments, and track student progress."
      portalType="teacher"
      onBack={() => setSelectedRole(null)}
      backLabel="Change role"
    >
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#10375C",
            colorText: "#0F172A",
            colorTextSecondary: "#64748B",
            colorBackground: "#FFFFFF",
            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            borderRadius: "1rem",
          },
          elements: {
            cardBox: "shadow-none border-0 w-full bg-transparent",
            card: "shadow-[0_24px_60px_rgba(16,55,92,0.06)] border border-slate-200/50 bg-white/90 backdrop-blur-xl rounded-[24px] px-8 py-7 w-full max-w-lg mx-auto",
            header: "hidden",
            socialButtonsBlockButton: "border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 font-bold shadow-sm transition-all rounded-xl h-11 flex justify-center items-center gap-2",
            socialButtonsBlockButtonText: "text-slate-600 font-bold text-xs font-sans",
            formButtonPrimary: "bg-[#10375C] hover:bg-[#0d2f4f] text-white font-bold text-xs tracking-wider shadow-md shadow-[#10375C]/10 active:scale-[0.98] transition-all rounded-xl h-11 border-0 w-full mt-2 cursor-pointer uppercase font-sans",
            formFieldInput: "border border-slate-200 focus:border-[#10375C] focus:ring-1 focus:ring-[#10375C]/20 bg-slate-50/30 hover:bg-slate-50/60 rounded-xl px-4 py-2.5 text-sm transition-all w-full font-sans",
            formFieldLabel: "text-slate-700 font-bold text-xs mb-1.5 font-sans",
            footerActionText: "text-slate-500 text-xs font-semibold font-sans",
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
    </AuthLayout>
  );
}
