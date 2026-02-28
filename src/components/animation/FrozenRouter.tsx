'use client';

// WARNING: Uses internal Next.js API (LayoutRouterContext). May break on Next.js major upgrades.

import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useContext, useEffect, useRef, type ReactNode } from 'react';

function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context);
  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);

  const isTransitioning = segment !== prevSegment;
  const contextToProvide = isTransitioning && prevContext ? prevContext : context;

  return (
    <LayoutRouterContext.Provider value={contextToProvide!}>
      {children}
    </LayoutRouterContext.Provider>
  );
}
