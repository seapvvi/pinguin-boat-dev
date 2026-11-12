'use client';
import { useEffect } from 'react';

interface ToastAlertProps {
  show: boolean;
  message: string;
  type?: 'error' | 'warning';
  onDismiss: () => void;
  duration?: number;
}

export function ToastAlert({ show, message, type = 'error', onDismiss, duration = 5000 }: ToastAlertProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [show, onDismiss, duration]);

  if (!show) return null;

  return (
    <div
      role="alert"
      className="modal-panel"
      style={{
        position: 'fixed',
        bottom: '1.2rem',
        right: '1.2rem',
        zIndex: 100,
        maxWidth: '22rem',
        padding: '0.8rem 0.9rem',
        borderLeft: `1px solid var(--ink)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
        <div style={{ flex: 1 }}>
          <span className="label">{type === 'error' ? 'error' : 'notice'}</span>
          <p style={{ marginTop: '0.25rem', fontSize: '0.78rem', lineHeight: 1.55, textTransform: 'lowercase' }}>
            {message}
          </p>
        </div>
        <button type="button" className="label" onClick={onDismiss} aria-label="dismiss">
          ×
        </button>
      </div>
    </div>
  );
}