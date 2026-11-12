'use client';
import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, padding = true, hover = false, style }: CardProps) {
  return (
    <div
      className={cn(
        'bg-transparent border border-[var(--line-soft)]',
        padding && 'p-5',
        hover && 'transition-colors duration-300 hover:border-[var(--line)]',
        className,
      )}
      style={{ borderRadius: 0, ...style }}
    >
      {children}
    </div>
  );
}