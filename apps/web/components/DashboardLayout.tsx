'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import OwnerPopupListener from './OwnerPopupListener';
import CommandPalette from './CommandPalette';
import { Plate, PLATE_LABEL } from './Plate';
import { getUser, logout as authLogout, type User } from '@/lib/auth';
import { usePreview } from '@/lib/preview';

interface DashboardLayoutProps {
  children: ReactNode;
  guildId?: string;
}

const MARKS = ['企', '港', '記', '組', '版', '印'];

export default function DashboardLayout({ children, guildId }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const preview = usePreview();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const u = await getUser();
      if (cancelled) return;
      if (!u) {
        router.replace('/auth/login');
        return;
      }
      setUser(u);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await authLogout();
    router.replace('/auth/login');
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span className="cjk" style={{ fontSize: '2.4rem', opacity: 0.5 }} aria-hidden="true">
            印
          </span>
          <p className="caption" style={{ marginTop: '0.9rem' }}>
            loading
          </p>
        </div>
      </div>
    );
  }

  const mark = MARKS[Math.abs(hashCode(pathname)) % MARKS.length];

  return (
    <div className="app">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onLogout={handleLogout}
      />

      <div className={sidebarOpen ? 'app__main app__main--open' : 'app__main'}>
        <Header
          user={user}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          onLogout={handleLogout}
          guildId={guildId}
          onSearch={() => setPaletteOpen(true)}
        />

        {preview && (
          <p className="caption app__preview-note" role="status">
            preview · sample data, no discord session. saving and toggles are disabled.
          </p>
        )}

        <main id="main" className="app__body">
          <div key={pathname} className="app__page">
            {children}
          </div>
        </main>

        <footer className="app__footer folio--bar">
          <div className="shell app__footer-inner">
            <span className="caption">
              © 2026 pinguin boat —{' '}
              <a
                className="link-arrow"
                href="https://e-z.bio/pvi"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.55rem', display: 'inline-flex' }}
              >
                pvvi
              </a>
            </span>
            <span className="caption" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem' }}>
              <span>colophon · fraunces &amp; space mono</span>
              <span aria-hidden="true" className="cjk" style={{ fontSize: '0.85rem' }}>
                印
              </span>
            </span>
          </div>
        </footer>
      </div>

      <Plate name="moon" className="app__watermark-plate" decorative />
      <span aria-hidden="true" className="app__mark cjk">
        {mark}
      </span>

      <CommandPalette
        isOwner={Boolean(user?.isOwner)}
        guideId={guildId ?? null}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
      />

      <OwnerPopupListener enabled={Boolean(user?.isOwner) && !preview} />
    </div>
  );
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export { PLATE_LABEL };
