import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/layout/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Start Creating with VedAI"
      subtitle="Join thousands of educators leveraging artificial intelligence to build, assign, and auto-evaluate student homework in minutes."
    >
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#F97316",
            colorText: "#0F172A",
            colorTextSecondary: "#475569",
            colorBackground: "#FFFFFF",
            fontFamily: "var(--font-inter), sans-serif",
            borderRadius: "1.25rem",
          },
          elements: {
            cardBox: "shadow-none border-0 w-full bg-transparent",
            card: "shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-200/50 bg-white rounded-3xl p-8 w-full max-w-md mx-auto",
            headerTitle: "text-slate-900 font-extrabold text-2xl tracking-tight font-sans",
            headerSubtitle: "text-slate-500 text-sm mt-1",
            socialButtonsBlockButton: "border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition-all rounded-2xl h-11 flex justify-center items-center gap-2",
            socialButtonsBlockButtonText: "text-slate-600 font-bold text-xs",
            formButtonPrimary: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs tracking-wide shadow-md shadow-orange-500/10 active:scale-95 transition-all rounded-2xl h-11 border-0 w-full mt-2 cursor-pointer",
            formFieldInput: "border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 bg-slate-50/50 hover:bg-slate-50 rounded-2xl px-4 py-2.5 text-sm transition-all w-full",
            formFieldLabel: "text-slate-700 font-bold text-xs mb-1.5",
            footerActionLink: "text-orange-500 hover:text-orange-600 font-bold text-xs transition-colors",
            identityPreviewText: "text-slate-700 font-bold text-xs",
            identityPreviewEditButtonIcon: "text-orange-500",
            dividerText: "text-slate-400 font-bold text-[10px] uppercase tracking-wider",
            dividerLine: "bg-slate-100",
            formFieldSuccessText: "text-emerald-600 text-xs font-semibold",
            formFieldErrorText: "text-rose-600 text-xs font-semibold",
            alert: "bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-700 text-xs font-semibold",
          }
        }}
      />
    </AuthLayout>
  );
}
