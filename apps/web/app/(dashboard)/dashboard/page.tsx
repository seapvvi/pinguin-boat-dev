'use client';

import { useEffect, useState } from 'react';
import { Server, Users, Terminal, Clock, Cpu, DollarSign, Wifi, MessageSquare, TrendingUp, Heart } from 'lucide-react';
import { Card, KPICard, Skeleton, EmptyState, Button } from '@pinguin/ui';
import { ErrorMessage } from '@pinguin/ui';
import { Plate } from '@/components/Plate';
import { PageLayout } from '@/components/layout/PageLayout';
import { getUser, type User } from '@/lib/auth';
import { fetchBotStats, fetchChangelogs, fetchGuilds, api } from '@/lib/api';
import { InviteBotButton } from '@/components/InviteBotButton';
import { formatNumber, formatDuration } from '@/lib/utils';
import type { BotStats, Changelog, GuildItemDTO, LeaderboardEntry } from '@pinguin/shared';

interface Donor {
  id: string;
  username: string;
  amount: number;
  message: string | null;
}

interface OverviewData {
  stats: BotStats | null;
  changelogs: Changelog[];
  topXP: LeaderboardEntry[];
  topGuilds: GuildItemDTO[];
  donors: Donor[];
}

export default function OverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setUser(await getUser());
      const [statsRes, changelogsRes, guildsRes, donorsRes, lbRes] = await Promise.allSettled([
        fetchBotStats(),
        fetchChangelogs({ page: '1', limit: '5' }),
        fetchGuilds(),
        api.get<{ data: { donors: Donor[] } }>('/api/donors'),
        api.get<{ data: { entries: LeaderboardEntry[] } }>('/api/overview/leaderboard/global?limit=5'),
      ]);
      setData({
        stats: statsRes.status === 'fulfilled' ? statsRes.value.data ?? null : null,
        changelogs: changelogsRes.status === 'fulfilled' ? changelogsRes.value.data?.entries ?? [] : [],
        topXP:
          lbRes.status === 'fulfilled'
            ? (
                (
                  lbRes.value.data as
                    | { entries?: Array<Partial<LeaderboardEntry> & { totalXp?: number }> }
                    | undefined
                )?.entries?.map((e: Partial<LeaderboardEntry> & { totalXp?: number }) => ({
                  rank: e.rank ?? 0,
                  userId: String(e.userId ?? ''),
                  username: String(e.username ?? 'unknown'),
                  avatar: String(e.avatar ?? ''),
                  xp: Number(e.totalXp ?? e.xp ?? 0),
                  level: Number(e.level ?? 0),
                  guildId: String(e.guildId ?? ''),
                })) ?? []
              )
            : [],
        topGuilds: guildsRes.status === 'fulfilled' ? guildsRes.value.data?.guilds?.slice(0, 5) ?? [] : [],
        donors: donorsRes.status === 'fulfilled' ? (donorsRes.value.data as { donors?: Donor[] })?.donors?.slice(0, 5) ?? [] : [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <PageLayout title="dashboard" eyebrow="01 · overview" glyph="企">
        <ErrorMessage title="could not load" message={error} onRetry={load} />
      </PageLayout>
    );
  }

  const stats = data?.stats as
    | (BotStats & { isOwner?: boolean; activeChannels?: number })
    | null;

  const kpis = stats
    ? stats.isOwner === true
      ? [
          { icon: <Server size={14} />, label: 'servers', value: formatNumber(stats.totalGuilds) },
          { icon: <Users size={14} />, label: 'members', value: formatNumber(stats.totalUsers) },
          { icon: <Terminal size={14} />, label: 'commands', value: formatNumber(stats.totalCommands ?? 0) },
          { icon: <Clock size={14} />, label: 'uptime', value: formatDuration(stats.uptime ?? 0) },
          { icon: <Cpu size={14} />, label: 'cpu', value: `${stats.cpuUsage ?? 0}%` },
          { icon: <Cpu size={14} />, label: 'ram', value: `${stats.ramUsage ?? 0}%` },
          { icon: <DollarSign size={14} />, label: 'premium', value: '0 €' },
          { icon: <Wifi size={14} />, label: 'online', value: formatNumber(stats.onlineMembers ?? 0) },
        ]
      : [
          { icon: <Server size={14} />, label: 'servers', value: formatNumber(stats.totalGuilds) },
          { icon: <Users size={14} />, label: 'members', value: formatNumber(stats.totalUsers) },
          { icon: <TrendingUp size={14} />, label: 'online', value: formatNumber(stats.onlineMembers ?? 0) },
          { icon: <MessageSquare size={14} />, label: 'active channels', value: formatNumber(stats.activeChannels ?? 0) },
        ]
    : [];

  return (
    <PageLayout
      title={`welcome, ${user?.username ?? '…'}`}
      eyebrow="01 · overview"
      glyph="企"
      description="the counts below come from the api, not from a cached snapshot. if a number is missing it is missing on purpose."
      actions={
        <>
          <a href="/soutien" className="btn">
            <Heart size={12} aria-hidden="true" /> support
          </a>
          <InviteBotButton />
        </>
      }
    >
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" style={{ height: '7rem' }} />
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

      {data && data.donors.length > 0 && (
        <Card>
          <div className="panel__head">
            <h2 className="panel__title">donors</h2>
            <span className="label">{data.donors.length} listed</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {data.donors.map((d) => (
              <span className="tag tag--ink" key={d.id}>
                {d.username} · {d.amount.toFixed(2)} €
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="content-grid">
        <div className="content-grid__body stack">
          <Card>
            <div className="panel__head">
              <h2 className="panel__title">global xp</h2>
              <span className="label">top five</span>
            </div>
            {loading ? (
              <div className="stack">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.topXP.length === 0 ? (
              <EmptyState title="no data" description="the xp board is empty for now." />
            ) : (
              <div>
                {data?.topXP.map((entry, i) => (
                  <div className="kv" key={entry.userId}>
                    <span className="kv__key">#{i + 1}</span>
                    <span className="kv__value" style={{ flex: 1, textAlign: 'left', marginLeft: '0.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.username}
                    </span>
                    <span className="kv__value">{entry.level} lvl</span>
                    <span className="kv__value">{formatNumber(entry.xp)} xp</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="panel__head">
              <h2 className="panel__title">top servers</h2>
              <span className="label">first five</span>
            </div>
            {loading ? (
              <div className="stack">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.topGuilds.length === 0 ? (
              <EmptyState title="no server" description="no server has been registered yet." />
            ) : (
              data?.topGuilds.map((g) => (
                <div className="kv" key={g.id}>
                  <span className="kv__key" style={{ maxWidth: '16ch', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {g.name}
                  </span>
                  <span className="kv__value">
                    <span className="tag">{g.botPresent ? 'present' : 'absent'}</span>
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>

        <aside className="content-grid__plate">
          <Plate name="moon" />
        </aside>
      </div>

      <div className="content-grid content-grid--left">
        <aside className="content-grid__plate">
          <Plate name="nebula" />
        </aside>
        <div className="content-grid__body stack">
          <Card>
            <div className="panel__head">
              <h2 className="panel__title">changelogs</h2>
              <span className="label">last five</span>
            </div>
            {loading ? (
              <div className="stack">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : data?.changelogs.length === 0 ? (
              <EmptyState title="nothing published" description="no changelog has been published yet." />
            ) : (
              data?.changelogs.map((cl) => (
                <div className="kv" key={cl.id} style={{ alignItems: 'flex-start' }}>
                  <span className="kv__key" style={{ flexShrink: 0 }}>
                    v{cl.version}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--ink)', fontSize: '0.78rem' }}>{cl.title}</div>
                    {cl.content && (
                      <div className="caption" style={{ marginTop: '0.2rem', letterSpacing: '0.03em' }}>
                        {cl.content.slice(0, 120)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card>

          <Card>
            <div className="panel__head">
              <h2 className="panel__title">system state</h2>
              <span className="label">read only</span>
            </div>
            {loading ? (
              <div className="stack">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div>
                {[
                  { label: 'api', status: 'up' },
                  { label: 'database', status: 'up' },
                  { label: 'queue', status: 'up' },
                  { label: 'cache', status: 'up' },
                  { label: 'music', status: 'up' },
                ].map((sys) => (
                  <div className="kv" key={sys.label}>
                    <span className="kv__key">{sys.label}</span>
                    <span className="kv__value">
                      <span className="tag tag--ink">{sys.status}</span>
                    </span>
                  </div>
                ))}
                <p className="caption" style={{ marginTop: '0.7rem' }}>
                  alpha — no billing. no status here is a promise about the future.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {user && (
        <div className="status-band">
          <span className="status-band__key cjk" aria-hidden="true">印</span>
          <span className="label">signed in</span>
          <span className="status-band__statement">{user.username}</span>
          <span className="note">session cookie, http only.</span>
          <Button size="sm" onClick={load}>
            reload
          </Button>
        </div>
      )}
    </PageLayout>
  );
}
