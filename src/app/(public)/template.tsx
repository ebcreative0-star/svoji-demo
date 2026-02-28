'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSelectedLayoutSegment } from 'next/navigation';
import { FrozenRouter } from '@/components/animation/FrozenRouter';

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
