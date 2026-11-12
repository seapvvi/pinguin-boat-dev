'use client';
import React from 'react';
import { cn } from '../utils/cn';
import { useCountUp } from '../hooks/useCountUp';

interface KPICardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  className?: string;
}

export function KPICard({ icon, label, value, trend, className }: KPICardProps) {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0, 700);

  return (
    <div
      className={cn('border-t border-r border-[var(--line)] p-4 bg-transparent', className)}
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="label" style={{ letterSpacing: '0.14em' }}>
          {label}
        </span>
        {icon && (
          <span aria-hidden="true" className="text-[var(--ink-dim)]" style={{ opacity: 0.8 }}>
            {icon}
          </span>
        )}
      </div>
      <div
        className="font-mono text-[1.35rem] leading-none text-[var(--ink-bright)]"
        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}
      >
        {typeof value === 'number' ? animatedValue.toLocaleString() : value}
      </div>
      {trend && (
        <div
          className="label mt-2"
          style={{ color: trend.direction === 'up' ? 'var(--ink)' : 'var(--ink-dim)' }}
        >
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
}