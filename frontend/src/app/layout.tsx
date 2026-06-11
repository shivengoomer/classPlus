import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { TopLoadingBar } from "@/components/layout/TopLoadingBar";
import { ClerkTokenProvider } from "@/components/layout/ClerkTokenProvider";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "classPlus - AI Assessment Creator (By Shiven Goomer)",
  description: "Create and grade premium assessments with the power of classPlus.",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en">
        <body
          className={`${plusJakartaSans.variable} antialiased`}
        >
          <ClerkTokenProvider>
            <Suspense fallback={null}>
              <TopLoadingBar />
            </Suspense>
            {children}
            <ToastContainer />
          </ClerkTokenProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
