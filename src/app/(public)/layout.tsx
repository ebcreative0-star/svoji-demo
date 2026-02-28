import { PublicTransitionProvider } from '@/components/animation/PublicTransitionProvider';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PublicTransitionProvider>{children}</PublicTransitionProvider>;
}
