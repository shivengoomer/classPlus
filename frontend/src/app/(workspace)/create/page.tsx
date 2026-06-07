// src/app/create/page.tsx
'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateAssignmentForm } from '@/components/create/CreateAssignmentForm';

export default function CreateAssignmentPage() {
  return (
    <AppShell>
      <CreateAssignmentForm />
    </AppShell>
  );
}
