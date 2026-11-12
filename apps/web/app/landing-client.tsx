'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MODULES } from '@/lib/landing-data';

export { MODULES, FEATURES } from '@/lib/landing-data';

const CHANGED = [
  { v: '0.1', t: 'levels and xp rewards', d: '11 november 2026' },
  { v: '0.0', t: 'dashboard rewrite: modules, kpis, audit rows', d: '15 may 2026' },
  { v: '0.0', t: 'giveaways and tickets', d: '28 april 2026' },
];

interface Stats {
  guilds: number;
  users: number;
  commands: number;
  uptime: string;
}

const TERMINAL_LINES: { text: string; kind?: 'cmd' | 'ok' | 'head' }[] = [
  { text: 'pinguin@boat:~$ ./bot status', kind: 'cmd' },
  { text: '  modules loaded        18/18', kind: 'ok' },
  { text: '  commands synced       214', kind: 'ok' },
  { text: '  database              connected', kind: 'ok' },
  { text: '  shard 0               ready', kind: 'ok' },
  { text: '' },
  { text: '  guilds                {guilds}', kind: 'head' },
  { text: '  members               {members}', kind: 'head' },
  { text: '  uptime                {uptime}', kind: 'head' },
  { text: '' },
  { text: 'pinguin@boat:~$ ▌', kind: 'cmd' },
];

export default function LandingClient() {
  const [user, setUser] = useState<{ id: string; username: string } | null | undefined>(undefined);
  const [stats, setStats] = useState<Stats>({ guilds: 0, users: 0, commands: 0, uptime: '—' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setUser(d?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/public')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const data = d?.data ?? d ?? {};
        setStats({
          guilds: Number(data.totalGuilds ?? data.guilds ?? 0),
          users: Number(data.totalUsers ?? data.members ?? 0),
          commands: Number(data.totalCommands ?? 0),
          uptime: data.uptime ? `${Number(data.uptime).toFixed(2)}%` : '—',
        });
      })
      .catch(() => {
        /* the page must render with honest zeros when the api is down */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(TERMINAL_LINES.length);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        let i = 0;
        const tick = () => {
          i += 1;
          setVisible(i);
          if (i < TERMINAL_LINES.length) raf = window.setTimeout(tick, 240);
        };
        raf = window.setTimeout(tick, 200);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const lineText = (text: string) =>
    text
      .replace('{guilds}', String(stats.guilds))
      .replace('{members}', String(stats.users))
      .replace('{uptime}', stats.uptime);

  const navLinks = [
    { href: '#modules', label: 'modules' },
    { href: '#deploy', label: 'deploy' },
    { href: '#notes', label: 'notes' },
  ];

  return (
    <>
      <header className="landing__bar">
        <div className="shell landing__bar-inner">
          <Link href="/" className="brand" aria-label="pinguin boat, home">
            <span className="brand__mark cjk" aria-hidden="true">企</span>
            <span className="brand__name">pinguin boat</span>
            <span className="brand__sub">v0.1</span>
          </Link>

          <nav className={`nav${menuOpen ? ' nav--open' : ''}`} aria-label="sections">
            {navLinks.map((l) => (
              <a key={l.href} className="nav__link" href={l.href} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <a
              className="nav__link"
              href="https://discord.gg/EJHhcYkXMQ"
              target="_blank"
              rel="noopener noreferrer"
            >
              discord
            </a>
            <a className="nav__link" href="/dashboard">
              dashboard
            </a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <button
              type="button"
              className="btn btn--icon nav__menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'close menu' : 'open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden="true" style={{ fontSize: '0.9rem', lineHeight: 1 }}>
                {menuOpen ? '×' : '≡'}
              </span>
            </button>
            <Link
              href={user ? '/dashboard' : '/auth/login'}
              className="btn btn--hide-sm"
              prefetch={false}
            >
              {user ? 'open dashboard' : 'sign in'}
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero">
          <span className="hero__folio-mark" aria-hidden="true">企</span>
          <div className="shell hero__grid">
            <div>
              <div className="hero__eyebrow">
                <span className="cjk" aria-hidden="true" style={{ fontSize: '1.35rem' }}>企</span>
                <span className="label">01 · a discord bot, and the dashboard for it</span>
              </div>

              <h1 className="hero__title">a bot that keeps its mouth shut until you speak.</h1>

              <p className="hero__lead">
                moderation, automod, tickets, levels, music, giveaways, economy. nineteen modules,
                each with a switch and a settings panel. configured from the web, not from a command
                you have to look up.
              </p>

              <div className="hero__actions">
                <Link href={user ? '/servers' : '/auth/login'} className="btn btn--solid" prefetch={false}>
                  {user ? 'open the dashboard' : 'connect discord'}
                </Link>
              </div>

              <div className="hero__meta">
                <div className="hero__meta-item">
                  <span className="hero__meta-key">servers</span>
                  <span className="hero__meta-value">{stats.guilds}</span>
                </div>
                <div className="hero__meta-item">
                  <span className="hero__meta-key">members</span>
                  <span className="hero__meta-value">{stats.users}</span>
                </div>
                <div className="hero__meta-item">
                  <span className="hero__meta-key">commands</span>
                  <span className="hero__meta-value">{stats.commands}</span>
                </div>
                <div className="hero__meta-item">
                  <span className="hero__meta-key">uptime</span>
                  <span className="hero__meta-value">{stats.uptime}</span>
                </div>
                <div className="hero__meta-item">
                  <span className="hero__meta-key">status</span>
                  <span className="hero__meta-value">alpha</span>
                </div>
              </div>
            </div>

            <div className="hero__figure">
              <div className="hero__plate-row">
                <figure className="plate" style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/plates/nebula.svg" alt="halftone plate: a nebula, bright core inside uneven veils of gas" width={780} height={960} fetchPriority="high" decoding="async" />
                  <figcaption>
                    <span>fig. 03 · 雲</span>
                    <span>03/10</span>
                  </figcaption>
                </figure>
                <figure className="plate" style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/plates/eclipse.svg" alt="halftone plate: a total eclipse, dark disc inside a thin corona ring" width={780} height={960} decoding="async" />
                  <figcaption>
                    <span>fig. 02 · 蝕</span>
                    <span>02/10</span>
                  </figcaption>
                </figure>
              </div>

              <figure className="plate" style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/plates/milkyway.svg" alt="halftone plate: the milky way, a bright band of stars split by dark dust lanes" width={1560} height={760} loading="lazy" decoding="async" />
                <figcaption>
                  <span>fig. 05 — milky way · 河</span>
                  <span>05/10</span>
                </figcaption>
              </figure>

              <div className="hero__side">
                <div className="hero__side-row">
                  <span className="label">set in</span>
                  <span style={{ fontSize: '0.74rem' }}>fraunces &amp; space mono</span>
                </div>
                <div className="hero__side-row">
                  <span className="label">contact</span>
                  <a className="link-arrow" href="https://discord.gg/EJHhcYkXMQ" target="_blank" rel="noopener noreferrer">
                    discord
                  </a>
                </div>
                <div className="hero__side-row">
                  <span className="label">source</span>
                  <a className="link-arrow" href="https://github.com/seapvvi/pinguin-boat" target="_blank" rel="noopener noreferrer">
                    repository
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...MODULES, ...MODULES].map((m, i) => (
              <span className="marquee__item" key={`${m.name}-${i}`}>
                <span className="cjk">{['管', '記', '静', '波', '山', '星'][i % 6]}</span>
                {m.name}
              </span>
            ))}
          </div>
        </div>

        <section className="folio" id="terminal">
          <span className="watermark" aria-hidden="true">
            <span>態</span>
          </span>
          <div className="shell">
            <header className="sec-head js-fade">
              <span className="sec-head__label">02 · state</span>
              <h2 className="section-title">the bot reports what it is doing</h2>
              <p className="sec-head__note">read straight from the process. no synthetic metrics.</p>
            </header>

            <div className="content-grid content-grid--wide js-fade">
              <div className="terminal" ref={terminalRef}>
                <div className="terminal__bar">
                  <span>bot status — read only</span>
                  <span>{stats.guilds} guilds</span>
                </div>
                <div className="terminal__body">
                  {TERMINAL_LINES.slice(0, visible).map((line, i) => (
                    <div
                      key={i}
                      className={`terminal__line${
                        line.kind === 'cmd'
                          ? ' terminal__line--cmd'
                          : line.kind === 'ok'
                            ? ' terminal__line--ok'
                            : line.kind === 'head'
                              ? ' terminal__line--head'
                              : ''
                      }`}
                    >
                      {line.text.endsWith('▌') ? (
                        <>
                          {lineText(line.text.replace('▌', ''))}
                          <span className="caret" aria-hidden="true">▌</span>
                        </>
                      ) : (
                        lineText(line.text) || '\u00a0'
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rows js-fade" style={{ marginTop: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
              {CHANGED.map((c, i) => (
                <div className="rows__row" key={`${c.v}-${c.t}`}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="rows__title">{c.t}</div>
                    <div className="rows__desc">published {c.d}</div>
                  </div>
                  <span className="tag">v{c.v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="folio"
          id="join"
          style={{
            background:
              'radial-gradient(120% 90% at 60% 38%, color-mix(in srgb, var(--accent-primary) 3%, transparent), transparent 70%)',
            overflow: 'hidden',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(40% 40% at 60% 38%, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <span className="watermark" aria-hidden="true">
            <span>入</span>
          </span>
          <div className="shell">
            <header className="sec-head js-fade">
              <span className="sec-head__label">06 · join</span>
              <h2 className="section-title">one server to start with</h2>
              <p className="sec-head__note">
                no trial, no card, no onboarding funnel. connect, choose a server, and the modules
                are there.
              </p>
            </header>

            <div className="content-grid js-fade">
              <div className="content-grid__body">
                <div className="prose" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <p>
                    the bot asks for the permissions it needs at invite time: manage messages,
                    moderate members, manage roles, and read history. if you decline one, the
                    module that needs it stays off instead of failing silently.
                  </p>
                  <p>
                    support runs through the discord. the dashboard has no support chat, and no
                    newsletter is collected anywhere on this site.
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '1.4rem' }}>
                  <Link href={user ? '/servers' : '/auth/login'} className="btn btn--solid" prefetch={false}>
                    {user ? 'open the dashboard' : 'connect discord'}
                  </Link>
                  <a className="btn" href="https://discord.gg/EJHhcYkXMQ" target="_blank" rel="noopener noreferrer">
                    join the discord
                  </a>
                </div>
              </div>
              <aside className="content-grid__plate">
                <figure className="plate" style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/plates/moon.svg" alt="halftone plate: a moon with craters and a few stars behind it" width={780} height={960} loading="lazy" decoding="async" />
                  <figcaption>
                    <span>fig. 03</span>
                    <span>moon · 月</span>
                  </figcaption>
                </figure>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">
          <div className="footer__inner">
            <div className="footer__col" style={{ minWidth: '14rem' }}>
              <span className="brand__name">pinguin boat</span>
              <span className="caption">a discord bot and a dashboard. open source, community run.</span>
            </div>

            <div className="footer__col">
              <span className="label">pages</span>
              {navLinks.map((l) => (
                <a className="footer__link" href={l.href} key={l.href}>
                  {l.label}
                </a>
              ))}
            </div>

            <div className="footer__col">
              <span className="label">elsewhere</span>
              <a className="footer__link" href="https://discord.gg/EJHhcYkXMQ" target="_blank" rel="noopener noreferrer">
                discord
              </a>
              <a className="footer__link" href="https://github.com/seapvvi/pinguin-boat" target="_blank" rel="noopener noreferrer">
                repository
              </a>
              <a className="footer__link" href="https://docs.pinguin.ovh" target="_blank" rel="noopener noreferrer">
                docs
              </a>
            </div>

            <div className="footer__col">
              <span className="label">colophon</span>
              <span className="caption">set in fraunces &amp; space mono</span>
              <span className="caption">plates generated as svg halftone fields</span>
              <span className="caption">no cookies · no analytics</span>
            </div>
          </div>

          <div className="footer__base">
            <span className="caption">© 2026 pinguin boat — forged for the community</span>
            <span className="caption">
              <span className="cjk" aria-hidden="true" style={{ fontSize: '0.9rem', marginRight: '0.4rem' }}>印</span>
              printed matter for the web
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
