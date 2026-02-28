'use client';

import { MotionConfig } from 'framer-motion';
import { LenisProvider } from '@/components/providers/LenisProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MotionConfig reducedMotion="user">
      <LenisProvider>{children}</LenisProvider>
    </MotionConfig>
  );
}
