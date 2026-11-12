'use client';
import { cn } from '../utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, disabled = false, label, size = 'md' }: ToggleProps) {
  const trackW = size === 'sm' ? 34 : 42;
  const trackH = size === 'sm' ? 16 : 20;
  const thumb = trackH - 8;
  const offX = 3;
  const onX = trackW - thumb - 3;

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 select-none',
        disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer',
      )}
      onClick={(e) => {
        if (disabled) return;
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        style={{
          position: 'relative',
          width: trackW,
          height: trackH,
          flexShrink: 0,
          border: `1px solid ${checked ? 'var(--ink)' : 'var(--line)'}`,
          background: 'transparent',
          borderRadius: 0,
          transition: 'border-color 200ms var(--ease-fade), background-color 200ms var(--ease-fade)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 3,
            left: 0,
            transform: `translateX(${checked ? onX : offX}px)`,
            width: thumb,
            height: thumb,
            background: checked ? 'var(--ink)' : 'var(--ink-dim)',
            transition: 'transform 220ms var(--ease-join), background-color 200ms var(--ease-fade)',
          }}
        />
      </button>
      {label && (
        <span className="label" style={{ letterSpacing: '0.1em' }}>
          {label}
        </span>
      )}
    </label>
  );
}