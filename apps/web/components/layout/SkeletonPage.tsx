import { Skeleton } from '@pinguin/ui';
import { ModuleGrid } from './ModuleGrid';

export function SkeletonPage({ rows = 2 }: { rows?: number }) {
  return (
    <div className="stack" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton variant="heading" style={{ width: '12rem' }} />
          <Skeleton variant="text" style={{ width: '18rem' }} />
        </div>
        <Skeleton variant="button" />
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <ModuleGrid key={i} columns={2}>
          <Skeleton variant="card" style={{ height: '10rem' }} />
          <Skeleton variant="card" style={{ height: '10rem' }} />
        </ModuleGrid>
      ))}
    </div>
  );
}

export default SkeletonPage;