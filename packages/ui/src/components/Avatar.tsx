import React, { useState } from 'react';
import { cn } from '../utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}

export function Avatar({ src, alt = '', name, size = 32, className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = name ? getInitials(name) : '·';

  if (src && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || name || 'avatar'}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={cn('object-cover flex-shrink-0', className)}
        style={{ width: size, height: size, borderRadius: 0, filter: 'grayscale(1)' }}
      />
    );
  }

  return (
    <span
      className={cn('flex items-center justify-center flex-shrink-0 select-none', className)}
      style={{
        width: size,
        height: size,
        borderRadius: 0,
        border: '1px solid var(--line)',
        color: 'var(--ink)',
        fontFamily: 'var(--f-mono)',
        fontSize: size * 0.38,
        letterSpacing: '0.04em',
        textTransform: 'lowercase',
      }}
      aria-label={alt || name || 'avatar'}
      role="img"
    >
      {initials}
    </span>
  );
}