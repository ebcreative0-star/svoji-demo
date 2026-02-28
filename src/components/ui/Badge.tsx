'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-full',
  {
    variants: {
      intent: {
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        neutral: 'bg-gray-100 text-gray-600',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      intent: 'neutral',
      size: 'sm',
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ intent, size, dot, className, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ intent, size }), className)}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-green-500': intent === 'success',
            'bg-amber-500': intent === 'warning',
            'bg-red-500': intent === 'danger',
            'bg-blue-500': intent === 'info',
            'bg-gray-400': intent === 'neutral' || intent === undefined || intent === null,
          })}
        />
      )}
      {children}
    </span>
  );
}
