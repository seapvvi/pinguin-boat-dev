'use client';

import { useEffect, useState } from 'react';
import { Button } from '@pinguin/ui';
import { getUser } from '@/lib/auth';

const DISCORD_URL = 'https://discord.gg/EJHhcYkXMQ';
const STORAGE_PREFIX = 'pinguin-alpha-seen-';
const WAIT_SECONDS = 5;

export function EarlyAlphaPopup() {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await getUser();
      if (cancelled || !user) return;
      if (localStorage.getItem(`${STORAGE_PREFIX}${user.id}`) === '1') return;
      setOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setCountdown(WAIT_SECONDS);
    setReady(false);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setReady(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const close = async () => {
    if (!ready) return;
    const user = await getUser();
    if (user) localStorage.setItem(`${STORAGE_PREFIX}${user.id}`, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 100 }}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="project status">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', marginBottom: '0.7rem' }}>
          <span className="cjk" aria-hidden="true" style={{ fontSize: '1.2rem' }}>
            仮
          </span>
          <span className="label">00 · status</span>
        </div>

        <h2 className="section-title" style={{ fontSize: '1.5rem' }}>
          the project is in alpha
        </h2>

        <div className="prose" style={{ marginTop: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <p>
            modules are still being written. some settings are missing, some panels are empty, and
            behaviour can change between deploys without a migration note.
          </p>
          <p>
            the discord is where bugs and feature requests go. nothing is collected here, and no
            message will be shown twice.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.1rem' }}>
          <a
            className="btn btn--solid"
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
          >
            open the discord
          </a>
          <Button variant="secondary" onClick={close} disabled={!ready}>
            {ready ? 'understood' : `wait ${countdown}s`}
          </Button>
        </div>

        <p className="caption" style={{ marginTop: '0.9rem' }}>
          shown once per account
        </p>
      </div>
    </div>
  );
}