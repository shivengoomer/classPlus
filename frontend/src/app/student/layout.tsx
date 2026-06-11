// src/app/student/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'classPlus Student Portal',
  description: 'View your assignments, submit work, and get AI-powered learning support',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
