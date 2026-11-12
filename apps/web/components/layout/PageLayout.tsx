'use client';
import React from 'react';
import { pageVariants, pageVariantsReduced } from '@/lib/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PageLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  glyph?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ title, description, eyebrow, glyph, actions, children }: PageLayoutProps) {
  const reduced = useReducedMotion();
  const variants = reduced ? pageVariantsReduced : pageVariants;

  return (
    <div className="w-full" data-variants={variants === pageVariants ? 'motion' : 'reduced'}>
      <div className="page-head">
        <div>
          {eyebrow && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', marginBottom: '0.5rem' }}>
              {glyph && (
                <span className="cjk" aria-hidden="true" style={{ fontSize: '1.15rem' }}>
                  {glyph}
                </span>
              )}
              <span className="label">{eyebrow}</span>
            </div>
          )}
          <h1 className="page-head__title">{title}</h1>
          {description && <p className="page-head__lead">{description}</p>}
        </div>
        {actions && <div className="page-head__actions">{actions}</div>}
      </div>

      <div className="stack">{children}</div>
    </div>
  );
}