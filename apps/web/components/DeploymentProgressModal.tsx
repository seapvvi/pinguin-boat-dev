'use client';
import { useEffect, useState, useRef } from 'react';
import { Modal } from '@pinguin/ui';
import { fetchDeploymentStatus } from '@/lib/api';

interface DeploymentProgressModalProps {
  deploymentId: string | null;
  onClose: () => void;
}

const STEPS = [
  { keyword: 'downloading', label: 'downloading' },
  { keyword: 'shared file', label: 'copying shared files' },
  { keyword: 'dependencies', label: 'installing dependencies' },
  { keyword: 'build', label: 'building' },
  { keyword: 'prisma generated', label: 'generating the client' },
  { keyword: 'migrations', label: 'applying migrations' },
  { keyword: 'health', label: 'health check' },
  { keyword: 'symlink', label: 'switching the release' },
];

export default function DeploymentProgressModal({ deploymentId, onClose }: DeploymentProgressModalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('RUNNING');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deploymentId) return;

    const poll = setInterval(async () => {
      try {
        const res = await fetchDeploymentStatus(deploymentId);
        if (res.success && res.data) {
          const d = res.data;
          const lines = d.log || [];
          setLogs(lines);
          setStatus(d.status);
          if (d.status !== 'RUNNING' && d.status !== 'PENDING') clearInterval(poll);
        }
      } catch {
        /* polling is best effort */
      }
    }, 1500);

    return () => clearInterval(poll);
  }, [deploymentId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'end' });
  }, [logs]);

  const isRunning = status === 'RUNNING' || status === 'PENDING';
  const isFailed = status === 'FAILED';
  const done = STEPS.filter((s) => logs.some((l) => l.toLowerCase().includes(s.keyword))).length;
  const progress = Math.round((done / STEPS.length) * 100);

  return (
    <Modal open={Boolean(deploymentId)} onClose={onClose} title="deploy">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.8rem' }}>
        <span className="label">{isRunning ? 'in progress' : isFailed ? 'failed' : 'finished'}</span>
        <span className="num">{progress}%</span>
      </div>

      <div style={{ height: 1, background: 'var(--line-soft)', marginTop: '0.5rem', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background: 'var(--ink)',
            transition: 'width 500ms var(--ease-fade)',
          }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        {STEPS.map((step, i) => {
          const complete = logs.some((l) => l.toLowerCase().includes(step.keyword));
          const active = !complete && (i === 0 || STEPS.slice(0, i).every((s) => logs.some((l) => l.toLowerCase().includes(s.keyword))));
          return (
            <div className="kv" key={step.keyword}>
              <span className="kv__key">{complete ? 'done' : active && isRunning ? 'now' : 'wait'}</span>
              <span className="kv__value" style={{ color: complete || active ? 'var(--ink)' : 'var(--ink-dim)' }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '1rem',
          border: '1px solid var(--line-soft)',
          background: 'var(--plate-frame)',
          padding: '0.6rem',
          maxHeight: '12rem',
          overflowY: 'auto',
        }}
      >
        <div className="terminal__body" style={{ minHeight: 0, padding: 0, fontSize: '0.66rem' }}>
          {logs.length === 0 && isRunning && <div className="terminal__line">waiting for output…</div>}
          {logs.map((line, i) => (
            <div key={i} className="terminal__line">
              {line}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </Modal>
  );
}