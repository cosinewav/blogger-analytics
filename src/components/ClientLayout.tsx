'use client';

import { ReactNode } from 'react';
import { PageTransition } from '@/components/animations/PageTransition';

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
