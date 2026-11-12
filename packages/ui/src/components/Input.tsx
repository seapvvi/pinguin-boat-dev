'use client';
import React, { useSyncExternalStore } from 'react';
import { cn } from '../utils/cn';
import { getPreview, subscribePreview } from '../utils/preview';

type InputVariant = 'default' | 'filled';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  inputVariant?: InputVariant;
}

export function Input({
  label,
  error,
  helperText,
  inputVariant = 'default',
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const preview = useSyncExternalStore(subscribePreview, getPreview, getPreview);

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="field__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'input',
          inputVariant === 'filled' && 'bg-[rgba(212,197,181,0.03)]',
          error && 'border-[var(--error)]',
          className,
        )}
        style={{ borderRadius: 0 }}
        {...props}
        disabled={props.disabled || preview}
      />
      {error && (
        <span className="caption" style={{ color: 'var(--error)' }}>
          {error}
        </span>
      )}
      {helperText && !error && <span className="caption">{helperText}</span>}
    </div>
  );
}