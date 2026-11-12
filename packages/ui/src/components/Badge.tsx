import React from 'react';
import { cn } from '../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'border-[var(--line-soft)] text-[var(--ink-dim)]',
  success: 'border-[var(--line)] text-[var(--ink)]',
  warning: 'border-[var(--line)] text-[var(--ink)]',
  error: 'border-[var(--line)] text-[var(--ink-bright)]',
  info: 'border-[var(--line)] text-[var(--ink-dim)]',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('tag', variantStyles[variant], className)}>{children}</span>
  );
}