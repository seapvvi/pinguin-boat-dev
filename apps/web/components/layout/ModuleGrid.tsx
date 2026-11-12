import React from 'react';

interface ModuleGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function ModuleGrid({ children, columns = 2 }: ModuleGridProps) {
  const style: React.CSSProperties =
    columns === 1
      ? { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }
      : {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: '1rem',
          width: '100%',
          alignItems: 'start',
        };

  return (
    <div className="module-grid" style={style}>
      {children}
    </div>
  );
}