'use client';

import { usePreview } from '@/lib/preview';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  const preview = usePreview();
  const off = disabled || preview;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={off}
      onClick={onChange}
      style={{
        position: 'relative',
        width: 40,
        height: 20,
        flexShrink: 0,
        border: `1px solid ${checked ? 'var(--ink)' : 'var(--line)'}`,
        background: 'transparent',
        borderRadius: 0,
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? 0.4 : 1,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 3,
          left: 0,
          transform: `translateX(${checked ? 22 : 3}px)`,
          width: 12,
          height: 12,
          background: checked ? 'var(--ink)' : 'var(--ink-dim)',
          transition: 'transform 220ms cubic-bezier(0.22,0.61,0.36,1), background-color 200ms',
        }}
      />
    </button>
  );
}
