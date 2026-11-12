'use client';
import React, { useState } from 'react';
import { Toggle } from '@pinguin/ui';

interface SectionCardProps {
  title: string;
  description?: string;
  glyph?: string;
  icon?: React.ReactNode;
  accent?: string;
  headerAction?: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  glyph,
  icon,
  accent,
  headerAction,
  expandable = false,
  defaultExpanded = true,
  isActive,
  children,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [justEnabled, setJustEnabled] = useState(false);

  const handleToggleChange = (checked: boolean) => {
    if (!checked) return;
    setJustEnabled(true);
    setTimeout(() => setJustEnabled(false), 1800);
  };

  return (
    <section
      className="panel panel--flush"
      style={accent ? { borderLeft: `1px solid ${accent}` } : undefined}
    >
      <div className="panel__head" style={{ padding: '0.8rem 0.9rem 0', margin: 0, borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', minWidth: 0 }}>
          {glyph ? (
            <span className="cjk" aria-hidden="true" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
              {glyph}
            </span>
          ) : icon ? (
            <span aria-hidden="true" style={{ opacity: 0.8, color: 'var(--ink-dim)', display: 'inline-flex' }}>
              {icon}
            </span>
          ) : null}
          <div style={{ minWidth: 0 }}>
            <h2 className="panel__title">{title}</h2>
            {description && (
              <p className="caption" style={{ marginTop: '0.2rem', letterSpacing: '0.04em' }}>
                {description}
              </p>
            )}
          </div>
          {isActive && <span className="tag tag--live">on</span>}
          {justEnabled && <span className="tag tag--ink">set</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {headerAction && React.isValidElement<{ checked: boolean; onChange: (v: boolean) => void }>(headerAction) && headerAction.type === Toggle
            ? React.cloneElement(headerAction, {
                onChange: (checked: boolean) => {
                  handleToggleChange(checked);
                  headerAction.props.onChange?.(checked);
                },
              })
            : headerAction}

          {expandable && (
            <button
              type="button"
              className="btn btn--icon"
              aria-expanded={expanded}
              aria-label={expanded ? 'collapse' : 'expand'}
              onClick={() => setExpanded((v) => !v)}
              style={{ width: '1.7rem', height: '1.7rem', border: 'none' }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontSize: '0.6rem',
                  display: 'inline-block',
                  transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 240ms var(--ease-fade)',
                }}
              >
                ▾
              </span>
            </button>
          )}
        </div>
      </div>

      {(!expandable || expanded) && (
        <div style={{ padding: '0.9rem', borderTop: '1px solid var(--line-soft)', marginTop: '0.8rem' }}>
          {children}
        </div>
      )}
    </section>
  );
}