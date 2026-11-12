'use client';
import React, { useSyncExternalStore } from 'react';
import { cn } from '../utils/cn';
import { getPreview, subscribePreview } from '../utils/preview';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 font-mono lowercase whitespace-nowrap select-none ' +
  'border transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed';

const sizes: Record<ButtonSize, string> = {
  sm: 'text-[0.62rem] tracking-[0.12em] px-3 py-[0.35rem] min-h-[1.9rem]',
  md: 'text-[0.68rem] tracking-[0.14em] px-[0.9rem] py-[0.45rem] min-h-[2.2rem]',
  lg: 'text-[0.68rem] tracking-[0.14em] px-[1.3rem] py-[0.9rem] min-h-[2.9rem]',
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] hover:bg-transparent hover:text-[var(--ink)]',
  secondary:
    'bg-transparent text-[var(--ink)] border-[var(--line)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:border-[var(--ink)]',
  ghost:
    'bg-transparent text-[var(--ink-dim)] border-transparent hover:text-[var(--ink-bright)] hover:bg-[rgba(212,197,181,0.05)]',
  danger:
    'bg-transparent text-[var(--ink)] border-[var(--line)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:border-[var(--ink)]',
  success:
    'bg-transparent text-[var(--ink)] border-[var(--line)] hover:bg-[var(--ink)] hover:text-[var(--paper)] hover:border-[var(--ink)]',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const preview = useSyncExternalStore(subscribePreview, getPreview, getPreview);
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading || preview}
      title={preview ? 'disabled in preview' : props.title}
      className={cn(base, sizes[size], variants[variant], className)}
      style={{ borderRadius: 0, ...props.style }}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: '0.7rem',
            height: '0.7rem',
            border: '1px solid currentColor',
            borderTopColor: 'transparent',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      )}
      <span className="inline-flex items-center gap-2">{children}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}