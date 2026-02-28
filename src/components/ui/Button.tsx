'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]',
        secondary: 'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
        ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 min-h-[32px]',
        md: 'text-sm px-5 py-2.5 min-h-[44px]',
        lg: 'text-base px-7 py-3.5 min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type MotionConflicts = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflicts>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      isLoading,
      leadingIcon,
      trailingIcon,
      className,
      children,
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    if (!children && !ariaLabel) {
      console.warn('[Button] Icon-only button is missing an aria-label. Screen readers will not announce this button.');
    }

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size }), className)}
        aria-label={ariaLabel}
        whileHover={isDisabled ? undefined : {
          y: -1.5,
          scale: 1.03,
          transition: { type: 'tween', duration: 0.15, ease: 'easeOut' }
        }}
        whileTap={isDisabled ? undefined : {
          scale: 0.975,
          transition: { type: 'tween', duration: 0.1, ease: 'easeOut' }
        }}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leadingIcon}
        {children}
        {!isLoading && trailingIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { buttonVariants };
