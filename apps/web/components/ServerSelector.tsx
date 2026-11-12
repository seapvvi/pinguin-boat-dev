'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@pinguin/ui';
import type { GuildItemDTO } from '@pinguin/shared';
import { fetchGuilds } from '@/lib/api';

interface ServerSelectorProps {
  guildId: string;
}

export default function ServerSelector({ guildId }: ServerSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [guilds, setGuilds] = useState<GuildItemDTO[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && guilds.length === 0) {
      setLoading(true);
      fetchGuilds()
        .then((res) => {
          if (res.success && res.data) setGuilds(res.data.guilds);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, guilds.length]);

  const currentGuild = guilds.find((g) => g.id === guildId);
  const filtered = guilds.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (id: string) => {
    setOpen(false);
    setSearch('');
    router.push(`/servers/${id}/overview`);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{ maxWidth: 220, gap: '0.45rem' }}
      >
        {currentGuild ? (
          <>
            <Avatar
              src={currentGuild.icon ? `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png?size=32` : undefined}
              name={currentGuild.name}
              size={18}
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentGuild.name}
            </span>
          </>
        ) : (
          <span>choose server</span>
        )}
        <span aria-hidden="true" style={{ fontSize: '0.55rem', opacity: 0.7 }}>
          ▾
        </span>
      </button>

      {open && (
        <div
          className="menu-panel"
          role="listbox"
          style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', width: 290, zIndex: 60 }}
        >
          <div className="menu-panel__search">
            <input
              className="input"
              placeholder="search servers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', minHeight: 0, padding: '0.2rem 0' }}
              aria-label="search servers"
            />
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {loading && <div className="caption" style={{ padding: '0.8rem' }}>loading…</div>}

            {!loading && filtered.length === 0 && (
              <div className="caption" style={{ padding: '0.8rem' }}>no server found</div>
            )}

            {!loading &&
              filtered.map((g) => {
                const selected = g.id === guildId;
                return (
                  <button
                    type="button"
                    key={g.id}
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(g.id)}
                    className={selected ? 'menu-row menu-row--active' : 'menu-row'}
                  >
                    <Avatar
                      src={g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=32` : undefined}
                      name={g.name}
                      size={24}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="menu-row__title">{g.name}</span>
                      <span className="caption" style={{ display: 'block' }}>
                        {g.botPresent ? 'bot present' : 'bot absent'}
                      </span>
                    </span>
                    {selected && (
                      <span aria-hidden="true" style={{ color: 'var(--accent-hover)', fontSize: '0.7rem' }}>
                        ◆
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
