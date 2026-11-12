'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@pinguin/ui';
import ServerSelector from './ServerSelector';
import { getAvatarUrl } from '@/lib/utils';

interface HeaderProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    isDonor?: boolean;
    isOwner?: boolean;
  } | null;
  onMenuToggle: () => void;
  onLogout: () => void;
  guildId?: string;
  onSearch?: () => void;
}

const CRUMB_LABEL: Record<string, string> = {
  servers: 'servers',
  dashboard: 'dashboard',
  owner: 'owner',
  docs: 'docs',
  soutien: 'support',
  stats: 'stats',
};

export default function Header({ user, onMenuToggle, onLogout, guildId, onSearch }: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0] ?? 'dashboard';
  const page = segments[1];

  return (
    <header className="app__bar">
      <div className="shell app__bar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', minWidth: 0 }}>
          <button
            type="button"
            onClick={onMenuToggle}
            className="btn btn--icon"
            aria-label="toggle menu"
            title="menu"
          >
            <span aria-hidden="true" style={{ fontSize: '0.95rem', lineHeight: 1 }}>
              ≡
            </span>
          </button>

          <nav className="crumbs" aria-label="breadcrumb">
            <Link href="/dashboard" className="crumbs__link">
              index
            </Link>
            <span aria-hidden="true" className="crumbs__sep">
              /
            </span>
            <span className="crumbs__current">{CRUMB_LABEL[section] ?? section}</span>
            {page && (
              <>
                <span aria-hidden="true" className="crumbs__sep">
                  /
                </span>
                <span className="crumbs__current">{page}</span>
              </>
            )}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="btn"
              aria-label="open command palette"
              aria-keyshortcuts="Control+K Meta+K"
              title="⌘K"
            >
              <span aria-hidden="true">⌕</span>
              <span className="btn--hide-sm" style={{ color: 'var(--ink-dim)', fontSize: '0.68rem' }}>
                ⌘K
              </span>
            </button>
          )}

          {guildId && <ServerSelector guildId={guildId} />}

          {user && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Avatar src={getAvatarUrl(user) ?? undefined} name={user.username} size={24} />
              <span className="label" style={{ color: 'var(--ink)' }}>
                {user.username}
              </span>
            </span>
          )}

          <Link href="/soutien" className="btn btn--hide-sm">
            support
          </Link>

          <button type="button" onClick={onLogout} className="btn btn--icon" aria-label="sign out" title="sign out">
            <span aria-hidden="true" style={{ fontSize: '0.8rem' }}>
              ⏻
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
