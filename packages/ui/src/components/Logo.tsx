import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export function Logo({ className = '', size = 28, withText = false }: LogoProps) {
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span
        className="cjk"
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          border: '1px solid var(--line)',
          fontSize: size * 0.56,
          lineHeight: 1,
          color: 'var(--ink)',
          flexShrink: 0,
        }}
      >
        企
      </span>
      {withText && (
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: size * 0.5,
            letterSpacing: '0.02em',
            color: 'var(--ink)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textTransform: 'lowercase',
          }}
        >
          pinguin boat
        </span>
      )}
    </span>
  );
}