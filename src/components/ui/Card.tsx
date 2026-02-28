'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

type MotionConflicts = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, MotionConflicts> {
  padding?: 'default' | 'compact';
  interactive?: boolean;
}

export function Card({
  padding = 'default',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  if (interactive) {
    return (
      <motion.div
        className={cn(
          'bg-white border border-[var(--color-border)] rounded-xl shadow-sm cursor-pointer',
          className
        )}
        whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white border border-[var(--color-border)] rounded-xl shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-4 py-3 border-b border-[var(--color-border)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'default' | 'compact';
}

function CardBody({ padding = 'default', className, children, ...props }: CardBodyProps) {
  return (
    <div
      className={cn(padding === 'compact' ? 'p-3' : 'p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-4 py-3 border-t border-[var(--color-border)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
