'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo, Avatar } from '@pinguin/ui';
import { getAvatarUrl } from '@/lib/utils';

interface SidebarProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    isOwner: boolean;
    isDonor?: boolean;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function guildHref(guildId: string | null, base: string, isGuildPage: boolean): string {
  if (!isGuildPage) return base;
  if (!guildId) return `/servers?redirect=${encodeURIComponent(base)}`;
  return `/servers/${guildId}${base}`;
}

interface CategoryDef {
  label: string;
  glyph: string;
  items: { label: string; href: string; guildPage?: boolean }[];
}

const categoryDefs: CategoryDef[] = [
  {
    label: 'general',
    glyph: '総',
    items: [
      { label: 'dashboard', href: '/dashboard' },
      { label: 'servers', href: '/servers' },
    ],
  },
  {
    label: 'resources',
    glyph: '資',
    items: [{ label: 'commands', href: '/commands', guildPage: true }],
  },
  {
    label: 'support',
    glyph: '援',
    items: [{ label: 'support us', href: '/soutien' }],
  },
  {
    label: 'management',
    glyph: '管',
    items: [
      { label: 'moderation', href: '/moderation', guildPage: true },
      { label: 'automod', href: '/automod', guildPage: true },
      { label: 'protection', href: '/protection', guildPage: true },
      { label: 'backups', href: '/protection/backup', guildPage: true },
      { label: 'tickets', href: '/tickets', guildPage: true },
      { label: 'logs', href: '/logs', guildPage: true },
      { label: 'music', href: '/music', guildPage: true },
      { label: 'notifications', href: '/notifications', guildPage: true },
    ],
  },
  {
    label: 'community',
    glyph: '社',
    items: [
      { label: 'levels', href: '/levels', guildPage: true },
      { label: 'economy', href: '/economy', guildPage: true },
      { label: 'giveaways', href: '/giveaways', guildPage: true },
      { label: 'polls', href: '/polls', guildPage: true },
      { label: 'suggestions', href: '/suggestions', guildPage: true },
      { label: 'starboard', href: '/starboard', guildPage: true },
      { label: 'forms', href: '/forms', guildPage: true },
      { label: 'minigames', href: '/minigames', guildPage: true },
      { label: 'clans', href: '/clans', guildPage: true },
      { label: 'invites', href: '/invites', guildPage: true },
    ],
  },
  {
    label: 'configuration',
    glyph: '設',
    items: [
      { label: 'welcome', href: '/welcome', guildPage: true },
      { label: 'autoroles', href: '/autoroles', guildPage: true },
      { label: 'embeds', href: '/embeds', guildPage: true },
      { label: 'settings', href: '/settings', guildPage: true },
    ],
  },
];

const ownerItems = [
  { href: '/owner', label: 'owner panel' },
  { href: '/owner/servers', label: 'servers' },
  { href: '/owner/users', label: 'users' },
  { href: '/owner/connected', label: 'connected' },
];

export default function Sidebar({ user, isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isOwner = user?.isOwner ?? false;
  const guildId = pathname.match(/^\/servers\/([^/]+)/)?.[1] ?? null;
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (label: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  const isActive = (href: string, isGuildPage?: boolean) => {
    if (isGuildPage && !guildId) return false;
    if (href === '/servers') return pathname === '/servers';
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const content = (
    <div className="side">
      <div className="side__head">
        <Link href="/" onClick={onClose} aria-label="pinguin boat, home">
          <Logo withText size={26} />
        </Link>
      </div>

      <nav className="side__nav" aria-label="modules">
        {categoryDefs.map((category) => {
          const open = !collapsed.has(category.label);
          const hasActive = category.items.some((i) => isActive(guildHref(guildId, i.href, !!i.guildPage), !!i.guildPage));

          return (
            <section className="side__group" key={category.label}>
              <button
                type="button"
                className="side__group-head"
                aria-expanded={open}
                onClick={() => toggle(category.label)}
              >
                <span className="side__group-glyph cjk" aria-hidden="true">
                  {category.glyph}
                </span>
                <span className="label" style={{ letterSpacing: '0.14em', color: hasActive ? 'var(--ink)' : undefined }}>
                  {category.label}
                </span>
                <span aria-hidden="true" className="side__chev" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                  ▾
                </span>
              </button>

              {open && (
                <ul className="side__list">
                  {category.items.map((item) => {
                    const href = guildHref(guildId, item.href, !!item.guildPage);
                    const active = isActive(href, !!item.guildPage);
                    return (
                      <li key={item.href}>
                        <Link
                          href={href}
                          onClick={onClose}
                          className={active ? 'side__link side__link--active' : 'side__link'}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span aria-hidden="true" className="side__tick" />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

        {isOwner && (
          <section className="side__group">
            <div className="side__group-head" style={{ cursor: 'default' }}>
              <span className="side__group-glyph cjk" aria-hidden="true">
                主
              </span>
              <span className="label" style={{ letterSpacing: '0.14em' }}>
                owner
              </span>
            </div>
            <ul className="side__list">
              {ownerItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={active ? 'side__link side__link--active' : 'side__link'}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span aria-hidden="true" className="side__tick" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </nav>

      {user && (
        <div className="side__foot">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
            <Avatar src={getAvatarUrl(user) ?? undefined} name={user.username} size={26} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="side__user">{user.username}</div>
              <div className="caption">{user.isOwner ? 'owner' : user.isDonor ? 'donor' : 'member'}</div>
            </div>
            <button type="button" className="side__logout" onClick={onLogout} aria-label="sign out" title="sign out">
              ⏻
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isOpen && (
        <aside className="side-wrap side-wrap--desktop" aria-label="sidebar">
          {content}
        </aside>
      )}

      {isOpen && (
        <div className="side-wrap side-wrap--mobile">
          <button type="button" className="side-scrim" aria-label="close menu" onClick={onClose} />
          <aside className="side-wrap__panel" aria-label="sidebar">
            <button type="button" className="side__close" onClick={onClose} aria-label="close menu">
              ×
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
