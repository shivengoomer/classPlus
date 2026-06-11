import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/layout/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout 
      title="Welcome Back to classPlus"
      subtitle="Sign in to your account to manage assignments, view classroom performance metrics, and prepare interactive lesson plans."
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
            card: "shadow-[0_24px_60px_rgba(16,55,92,0.06)] border border-slate-200/50 bg-white/90 backdrop-blur-xl rounded-[24px] p-8 w-full max-w-md mx-auto",
            headerTitle: "text-slate-900 font-black text-2xl tracking-tight font-sans text-center",
            headerSubtitle: "text-slate-500 text-xs mt-1.5 text-center font-sans",
            socialButtonsBlockButton: "border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 font-bold shadow-sm transition-all rounded-xl h-11 flex justify-center items-center gap-2",
            socialButtonsBlockButtonText: "text-slate-600 font-bold text-xs font-sans",
            formButtonPrimary: "bg-[#10375C] hover:bg-[#f97316] text-white font-bold text-xs tracking-wider shadow-md shadow-[#10375C]/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all rounded-xl h-11 border-0 w-full mt-2 cursor-pointer uppercase font-sans",
            formFieldInput: "border border-slate-200 focus:border-[#10375C] focus:ring-1 focus:ring-[#10375C]/20 bg-slate-50/30 hover:bg-slate-50/60 rounded-xl px-4 py-2.5 text-sm transition-all w-full font-sans",
            formFieldLabel: "text-slate-700 font-bold text-xs mb-1.5 font-sans",
            footerActionText: "text-slate-500 text-xs font-semibold font-sans",
            footerActionLink: "text-[#10375C] hover:text-orange-500 font-bold text-xs transition-all font-sans",
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
