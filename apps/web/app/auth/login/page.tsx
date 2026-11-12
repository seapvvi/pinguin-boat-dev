'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Logo } from '@pinguin/ui';

const MARK = '印';

export default function LoginPage() {
  return (
    <main
      id="main"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--gutter)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span className="watermark" style={{ left: '50%', top: '46%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(12rem, 34vw, 26rem)' }} aria-hidden="true">
        {MARK}
      </span>

      <div className="shell" style={{ maxWidth: '34rem', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 'clamp(1.4rem, 4vw, 2.2rem)' }}>
          <Logo withText size={30} />
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'clamp(1.2rem, 3vw, 1.8rem)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.7rem' }}>
            <span className="cjk" aria-hidden="true" style={{ fontSize: '1.3rem' }}>
              {MARK}
            </span>
            <span className="label">00 · sign in</span>
          </div>

          <h1 className="page-title">sign in with discord</h1>

          <p className="note" style={{ marginTop: '0.8rem', maxWidth: '52ch' }}>
            the dashboard reads your server list from discord and only shows the servers you can
            manage. no separate account, no password stored here.
          </p>

          <div style={{ marginTop: 'clamp(1.2rem, 3vw, 1.8rem)' }}>
            <a className="btn btn--solid btn--block" href="/api/auth/login">
              <span aria-hidden="true" style={{ fontSize: '0.9rem' }}>
                ⧉
              </span>
              continue with discord
            </a>
          </div>

          <div style={{ marginTop: '1.4rem', paddingTop: '0.9rem', borderTop: '1px solid var(--line-soft)' }}>
            <div className="kv">
              <span className="kv__key">cookies</span>
              <span className="kv__value">session only</span>
            </div>
            <div className="kv">
              <span className="kv__key">analytics</span>
              <span className="kv__value">none</span>
            </div>
            <div className="kv">
              <span className="kv__key">support</span>
              <span className="kv__value">
                <a className="link-arrow" href="https://discord.gg/EJHhcYkXMQ" target="_blank" rel="noopener noreferrer">
                  discord
                </a>
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.4rem' }}>
            <Link href="/" className="caption">
              ← back to the index
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
