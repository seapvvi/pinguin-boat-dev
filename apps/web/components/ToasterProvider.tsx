'use client';
import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          borderRadius: 0,
          background: 'var(--bar)',
          color: 'var(--ink)',
          border: '1px solid var(--line)',
          fontFamily: 'var(--f-mono)',
          fontSize: '0.74rem',
          textTransform: 'lowercase',
          boxShadow: 'none',
        },
      }}
    />
  );
}
