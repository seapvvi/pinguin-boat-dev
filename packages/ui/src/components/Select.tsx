'use client';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  className?: string;
  id?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  value,
  onChange,
  className,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const width = Math.max(rect.width, 180);
      const estimated = Math.min(options.length * 34 + 8, 240);
      const below = window.innerHeight - rect.bottom;
      const dropUp = below < estimated + 16;
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width,
        zIndex: 9999,
        ...(dropUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      });
    }
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (optValue: string) => {
    onChange?.({ target: { value: optValue } });
    setOpen(false);
  };

  return (
    <div className="field">
      {label && (
        <label htmlFor={selectId} className="field__label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!open) setOpen(true);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          className={cn('input text-left', error && 'border-[var(--error)]', className)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            borderRadius: 0,
          }}
        >
          <span className={!selectedOption ? 'text-[var(--ink-dim)]' : undefined}>
            {selectedOption ? selectedOption.label : placeholder || 'select…'}
          </span>
          <span aria-hidden="true" style={{ color: 'var(--ink-dim)', fontSize: '0.6rem', marginLeft: '0.6rem' }}>
            {open ? '▴' : '▾'}
          </span>
        </button>

        {typeof document !== 'undefined' &&
          createPortal(
            open ? (
              <div
                ref={dropdownRef}
                role="listbox"
                style={{
                  ...dropdownStyle,
                  maxHeight: 240,
                  overflowY: 'auto',
                  background: 'var(--bar)',
                  border: '1px solid var(--line)',
                  boxShadow: '0 10px 34px rgba(0, 0, 0, 0.45)',
                }}
              >
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === value}
                    onClick={() => handleSelect(opt.value)}
                    className="w-full text-left transition-colors duration-150"
                    style={{
                      padding: '0.45rem 0.6rem',
                      fontSize: '0.74rem',
                      border: 'none',
                      background: 'transparent',
                      color:
                        opt.value === value ? 'var(--accent-hover)' : 'var(--ink)',
                      textTransform: 'lowercase',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212,197,181,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null,
            document.body,
          )}
      </div>

      {error && (
        <span className="caption" style={{ color: 'var(--error)' }}>
          {error}
        </span>
      )}
    </div>
  );
}