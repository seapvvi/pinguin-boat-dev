import React from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}
      style={{ borderTop: '1px solid var(--line-soft)' }}
    >
      {icon && (
        <span aria-hidden="true" className="text-[var(--ink-dim)] mb-3" style={{ opacity: 0.7 }}>
          {icon}
        </span>
      )}
      <h3 className="card-title mb-1">{title}</h3>
      {description && (
        <p className="note" style={{ textAlign: 'center', marginTop: '0.3rem' }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: '1rem' }}>
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}