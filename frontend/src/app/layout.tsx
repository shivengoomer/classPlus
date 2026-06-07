import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { TopLoadingBar } from "@/components/layout/TopLoadingBar";
import { ClerkTokenProvider } from "@/components/layout/ClerkTokenProvider";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ClassPilot - AI Assessment Creator (By Shiven Goomer)",
  description: "Create and grade premium assessments with the power of ClassPilot.",
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
          className={`${bricolage.variable} ${inter.variable} antialiased`}
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
