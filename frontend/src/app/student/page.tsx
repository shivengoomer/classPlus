'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sign-in?role=student');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10375C]" />
    </div>
  );
}
