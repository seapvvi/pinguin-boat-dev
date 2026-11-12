'use client';
import React, { useEffect, useCallback } from 'react';
import { cn } from '../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = previous;
      };
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'default',
        }}
      />
      <div className={cn('modal-panel', className)}>
        {title && (
          <div className="flex items-baseline justify-between gap-4 mb-4 pb-3 border-b border-[var(--line-soft)]">
            <h2 className="section-title" style={{ fontSize: '1.15rem' }}>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="close"
              className="label"
              style={{ letterSpacing: '0.14em' }}
            >
              close ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}