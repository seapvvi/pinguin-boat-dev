'use client';
import React from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'something went wrong',
  message = 'the api did not answer. the data below may be incomplete.',
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn('flex flex-col items-start py-8 px-5 text-left', className)}
      style={{ border: '1px solid var(--line)', background: 'rgba(216, 178, 162, 0.03)' }}
      role="alert"
    >
      <span className="label" style={{ letterSpacing: '0.16em', color: 'var(--ink-dim)' }}>
        error
      </span>
      <h3 className="section-title" style={{ fontSize: '1.15rem', marginTop: '0.35rem' }}>
        {title}
      </h3>
      <p className="note" style={{ marginTop: '0.35rem' }}>
        {message}
      </p>
      {onRetry && (
        <div style={{ marginTop: '0.9rem' }}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            try again
          </Button>
        </div>
      )}
    </div>
  );
}