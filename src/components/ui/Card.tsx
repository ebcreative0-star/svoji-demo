import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
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
  return (
    <div
      className={cn(
        'bg-white border border-[var(--color-border)] rounded-xl shadow-sm',
        interactive && 'cursor-pointer hover:shadow-md transition-shadow',
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
