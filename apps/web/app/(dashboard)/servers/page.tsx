'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input, Skeleton, EmptyState } from '@pinguin/ui';
import { ErrorMessage } from '@pinguin/ui';
import { Plate } from '@/components/Plate';
import { PageLayout } from '@/components/layout/PageLayout';
import { fetchGuilds, api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { useConfetti } from '@/hooks/useConfetti';
import type { GuildItemDTO } from '@pinguin/shared';

export default function ServersPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/overview';
  const [guilds, setGuilds] = useState<GuildItemDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fire } = useConfetti();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGuilds();
      if (res.success && res.data) setGuilds(res.data.guilds);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = guilds.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const invite = (id: string) => {
    fire('invite');
    api
      .get<{ data: { url: string } }>(`/api/bot/invite?guild_id=${id}`)
      .then((res) => {
        const url = (res as { data?: { url: string } }).data?.url;
        if (url) window.open(url, '_blank');
      })
      .catch(() => {});
  };

  return (
    <PageLayout
      title="servers"
      eyebrow="01 · selector"
      glyph="組"
      description="only servers where you hold manage-guild are listed. pick one to open its modules."
      actions={
        <Input
          placeholder="search servers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '14rem' }}
          aria-label="search servers"
        />
      }
    >
      {error && <ErrorMessage title="could not load" message={error} onRetry={load} />}

      {!error && loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))', gap: '1rem' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" style={{ height: '9rem' }} />
          ))}
        </div>
      )}

      {!error && !loading && filtered.length === 0 && (
        <EmptyState
          icon={<span className="cjk" aria-hidden="true" style={{ fontSize: '1.6rem' }}>無</span>}
          title="no server found"
          description={search ? 'nothing matches that search.' : 'no server is available to you yet.'}
        />
      )}

      {!error && !loading && filtered.length > 0 && (
        <div className="rows">
          {filtered.map((g, i) => (
            <div className="rows__row" key={g.id}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <div style={{ minWidth: 0 }}>
                <div className="rows__title" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {g.name}
                  <span className="tag">{g.botPresent ? 'present' : 'absent'}</span>
                  <span className="tag">{g.premium !== 'FREE' ? 'premium' : 'free'}</span>
                </div>
                <div className="rows__desc">
                  {formatNumber(g.memberCount)} members · id {g.id}
                </div>
              </div>
              {g.botPresent ? (
                <Link href={`/servers/${g.id}${redirect}`} className="btn">
                  open
                </Link>
              ) : (
                <button type="button" className="btn" onClick={() => invite(g.id)}>
                  invite
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="content-grid" style={{ marginTop: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
        <div className="content-grid__body">
          <div className="prose" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p>
              the bot needs manage-guild to list a server. if a server is missing, it is not a bug
              in the dashboard: the permission is not granted, or the bot was removed.
            </p>
          </div>
        </div>
        <aside className="content-grid__plate">
          <Plate name="comet" />
        </aside>
      </div>
    </PageLayout>
  );
}
