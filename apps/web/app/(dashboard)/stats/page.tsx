'use client';
import { useEffect, useState } from 'react';
import { Cpu, Activity, Server, Users, Terminal, Clock } from 'lucide-react';
import { Card, KPICard, Skeleton, ErrorMessage, Button } from '@pinguin/ui';
import { PageLayout } from '@/components/layout/PageLayout';
import { Plate } from '@/components/Plate';
import { fetchMetricsSnapshots, type SystemMetricsSnapshot } from '@/lib/api';
import { formatNumber, formatDuration } from '@/lib/utils';
import { useVisibleInterval } from '@/lib/hooks';
import dynamic from 'next/dynamic';

const StatsChart = dynamic(() => import('@/components/charts/StatsChart'), { ssr: false });

export default function StatsPage() {
  const [snapshots, setSnapshots] = useState<SystemMetricsSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadSnapshots = async () => {
    try {
      const response = await fetchMetricsSnapshots();
      setSnapshots(response.data?.snapshots ?? []);
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  useVisibleInterval(loadSnapshots, 30000);

  const latest = snapshots[snapshots.length - 1];

  const chartData = snapshots.map((s) => ({
    time: new Date(s.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    cpu: Number(s.cpuUsage.toFixed(1)),
    ram: Number(s.ramUsage.toFixed(1)),
  }));

  const axis = {
    stroke: 'var(--line)',
    tick: { fill: 'var(--ink-dim)', fontSize: 10, fontFamily: 'var(--f-mono)' },
  } as const;

  const tooltip = {
    backgroundColor: 'var(--bar)',
    border: '1px solid var(--line)',
    borderRadius: 0,
    labelStyle: { color: 'var(--ink-dim)', fontFamily: 'var(--f-mono)', fontSize: 10 },
    itemStyle: { color: 'var(--ink)', fontFamily: 'var(--f-mono)', fontSize: 10 },
  } as const;

  if (error) {
    return (
      <PageLayout title="system metrics" eyebrow="06 · metrics" glyph="計">
        <ErrorMessage title="could not load" message={error} onRetry={loadSnapshots} />
      </PageLayout>
    );
  }

  const kpis = latest
    ? [
        { icon: <Cpu size={14} />, label: 'cpu', value: `${latest.cpuUsage.toFixed(1)}%` },
        { icon: <Activity size={14} />, label: 'ram', value: `${latest.ramUsage.toFixed(1)}%` },
        { icon: <Server size={14} />, label: 'servers', value: formatNumber(latest.guildCount) },
        { icon: <Users size={14} />, label: 'members', value: formatNumber(latest.userCount) },
        { icon: <Terminal size={14} />, label: 'commands', value: formatNumber(latest.commandCount) },
        { icon: <Clock size={14} />, label: 'uptime', value: formatDuration(latest.uptimeSeconds) },
      ]
    : [];

  return (
    <PageLayout
      title="system metrics"
      eyebrow="06 · metrics"
      glyph="計"
      description="samples every thirty seconds. this page is read only; nothing here writes back to the bot."
      actions={
        <>
          {lastUpdate && (
            <span className="caption">updated {lastUpdate.toLocaleTimeString('en-GB')}</span>
          )}
          <Button size="sm" onClick={loadSnapshots}>
            refresh
          </Button>
        </>
      }
    >
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              <Skeleton variant="card" style={{ height: '6.5rem' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
          {kpis.map((kpi) => (
            <div key={kpi.label} style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              <KPICard label={kpi.label} value={kpi.value} icon={kpi.icon} />
            </div>
          ))}
        </div>
      )}

      <div className="content-grid">
        <div className="content-grid__body stack">
          <Card>
            <div className="panel__head">
              <h2 className="panel__title">cpu and memory</h2>
              <span className="label">last 24 h</span>
            </div>
            {loading ? (
              <Skeleton style={{ height: '16rem', width: '100%' }} />
            ) : chartData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <StatsChart data={chartData} axis={axis} tooltip={tooltip} />
              </div>
            ) : (
              <p className="caption" style={{ paddingBlock: '2rem', textAlign: 'center' }}>
                no sample recorded yet
              </p>
            )}
          </Card>

          <Card>
            <div className="panel__head">
              <h2 className="panel__title">sample ledger</h2>
              <span className="label">last eight</span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>time</th>
                    <th>cpu</th>
                    <th>ram</th>
                    <th>servers</th>
                    <th>members</th>
                    <th>commands</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.slice(-8).reverse().map((s) => (
                    <tr key={s.timestamp}>
                      <td>{new Date(s.timestamp).toLocaleTimeString('en-GB')}</td>
                      <td>{s.cpuUsage.toFixed(1)}%</td>
                      <td>{s.ramUsage.toFixed(1)}%</td>
                      <td>{formatNumber(s.guildCount)}</td>
                      <td>{formatNumber(s.userCount)}</td>
                      <td>{formatNumber(s.commandCount)}</td>
                    </tr>
                  ))}
                  {snapshots.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.6rem' }}>
                        <span className="caption">no sample yet</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="content-grid__plate">
          <Plate name="sphere" />
        </aside>
      </div>
    </PageLayout>
  );
}
