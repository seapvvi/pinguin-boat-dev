import type { Metadata } from 'next';
import Link from 'next/link';
import LandingClient from './landing-client';
import { MODULES, FEATURES } from '@/lib/landing-data';
import './page.css';

export const metadata: Metadata = {
  title: 'pinguin boat — a discord bot, and a dashboard for it',
  description:
    'moderation, music, economy, levels, tickets, giveaways. one integration, configured from the web. no accounts, no cookie banner, no newsletter.',
};

const PLATE_NAV = [
  { glyph: '模', href: '#modules', label: 'modules' },
  { glyph: '法', href: '#deploy', label: 'deploy' },
  { glyph: '問', href: '#notes', label: 'notes' },
];

export default function LandingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'pinguin boat',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Discord',
    description:
      'A Discord bot and dashboard: moderation, music, economy, levels, tickets, giveaways and more, configured from the web.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };

  return (
    <div className="landing">
      <script
        type="application/ld+json"
        // Static, developer-authored payload — no user input is interpolated.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="skip-link" href="#main">
        skip to content
      </a>

      <LandingClient />

      <section className="folio" id="modules">
        <span className="watermark" aria-hidden="true">
          <span>模</span>
        </span>
        <div className="shell">
          <header className="sec-head js-fade">
            <span className="sec-head__label">02 · index — modules</span>
            <h2 className="section-title">nineteen modules, each one switchable</h2>
            <p className="sec-head__note">
              turn a module on or off per server, then set its channel, role and message from the
              same dashboard. nothing is hidden behind a command you have to look up.
            </p>
          </header>

          <div className="rows js-fade">
            {MODULES.map((m, i) => (
              <div className="rows__row" key={m.name}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="rows__title">{m.name}</div>
                  <div className="rows__desc">{m.desc}</div>
                </div>
                <span className="tag">{m.tag}</span>
              </div>
            ))}
          </div>

          <div className="folio-cards js-fade" style={{ marginTop: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
            {FEATURES.map((f) => (
              <article className="folio-card" key={f.glyph}>
                <span className="folio-card__glyph cjk" aria-hidden="true">{f.glyph}</span>
                <h3 className="card-title">{f.title}</h3>
                <p className="note" style={{ marginTop: '0.4rem' }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="folio" id="deploy">
        <span className="watermark" aria-hidden="true">
          <span>法</span>
        </span>
        <div className="shell">
          <header className="sec-head js-fade">
            <span className="sec-head__label">03 · method — deploy</span>
            <h2 className="section-title">add it, pick a server, done</h2>
            <p className="sec-head__note">
              the bot reads its own configuration from the api. the dashboard writes it, the bot
              picks it up. no restart, no yaml, no copy-paste.
            </p>
          </header>

          <div className="content-grid content-grid--left js-fade">
            <aside className="content-grid__plate">
              <figure className="plate" style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/plates/cluster.svg" alt="halftone plate: a globular star cluster, hundreds of stars packed to one core" width={780} height={780} loading="lazy" />
                <figcaption>
                  <span>fig. 04</span>
                  <span>cluster · 群</span>
                </figcaption>
              </figure>
              <div className="status-band" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem' }}>
                <span className="label">status</span>
                <span className="status-band__statement">alpha — no billing</span>
                <span className="note">every module is free while the bot is in alpha.</span>
              </div>
            </aside>

            <div className="content-grid__body">
              <div className="prose" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p>
                  connect discord, choose a server from the list you already moderate, and the
                  dashboard opens on that server&rsquo;s overview. modules are listed down the left
                  with a switch beside each one. the first thing you see is a count, not a chart.
                </p>
                <p>
                  changes are written to the database as you make them. the bot reads the record on
                  the next event, so a toggle takes effect immediately. if the api is unreachable the
                  dashboard says so instead of pretending the save worked.
                </p>
              </div>

              <ol className="rows" style={{ marginTop: '1.6rem', padding: 0 }}>
                {[
                  { t: 'connect', d: 'discord login, no separate account, no password stored here.' },
                  { t: 'choose a server', d: 'only servers where you hold manage-guild are listed.' },
                  { t: 'toggle modules', d: 'one switch per module, with its own settings panel.' },
                  { t: 'read the logs', d: 'every action is written to the audit trail with an actor.' },
                ].map((s, i) => (
                  <li className="rows__row" key={s.t} style={{ listStyle: 'none' }}>
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <div className="rows__title">{s.t}</div>
                      <div className="rows__desc">{s.d}</div>
                    </div>
                    <span className="tag">{i === 3 ? 'log' : 'step'}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="folio" id="notes">
        <span className="watermark" aria-hidden="true">
          <span>問</span>
        </span>
        <div className="shell">
          <header className="sec-head js-fade">
            <span className="sec-head__label">04 · marginalia — notes</span>
            <h2 className="section-title">questions that come up</h2>
            <p className="sec-head__note">short answers. if something is missing, ask in the discord.</p>
          </header>

          <div className="faq js-fade">
            {[
              {
                q: 'does it need a premium subscription?',
                a: 'no. every module is available on every server. premium exists later for rate limits and storage, not for features.',
              },
              {
                q: 'what happens if the bot is offline?',
                a: 'the dashboard keeps working and shows the last known state. commands are unavailable until the bot reconnects.',
              },
              {
                q: 'is there a cookie banner?',
                a: 'no. this site sets no cookies and runs no analytics. the server writes ordinary access logs, nothing else.',
              },
              {
                q: 'can i run it myself?',
                a: 'yes. the bot and the dashboard are in one repository. the database schema is shared through the workspace package.',
              },
              {
                q: 'where do i report a bug?',
                a: 'in the discord support server, or as an issue in the repository. both go to the same place.',
              },
            ].map((row, i) => (
              <details className="faq__row" key={row.q}>
                <summary>
                  <span>
                    <span className="num" style={{ marginRight: '0.7rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {row.q}
                  </span>
                </summary>
                <p className="faq__answer">{row.a}</p>
              </details>
            ))}
          </div>

          <div className="status-band js-fade" style={{ marginTop: 'clamp(1.4rem, 3vw, 2.2rem)' }}>
            <span className="status-band__key cjk" aria-hidden="true">社</span>
            <span className="label">community</span>
            <span className="status-band__statement">one discord, open to anyone</span>
            <span className="note">support, bug reports, and feature requests go there.</span>
            <a className="link-arrow" href="https://discord.gg/EJHhcYkXMQ" target="_blank" rel="noopener noreferrer">
              join the discord
            </a>
          </div>
        </div>
      </section>

      <nav className="folio" aria-label="plate index" style={{ paddingBlock: '1.4rem' }}>
        <div className="shell" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem 1.6rem' }}>
          {PLATE_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="nav__link" style={{ display: 'inline-flex', gap: '0.45rem' }}>
              <span className="cjk" aria-hidden="true" style={{ fontSize: '0.95rem' }}>{n.glyph}</span>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
