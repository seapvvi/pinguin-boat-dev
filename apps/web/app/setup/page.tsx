'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

type Step = 'loading' | 'password' | 'form' | 'done' | 'locked';

interface FormState {
  clientId: string;
  clientSecret: string;
  token: string;
  ownerId: string;
  publicKey: string;
  devGuildId: string;
  databaseUrl: string;
  ownerPassword: string;
  sessionSecret: string;
  botInternalSecret: string;
  appUrl: string;
  apiUrl: string;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  hint = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {hint && <span className="caption">{hint}</span>}
    </div>
  );
}

export default function SetupPage() {
  const [step, setStep] = useState<Step>('loading');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dbTest, setDbTest] = useState('');
  const [form, setForm] = useState<FormState>({
    clientId: '',
    clientSecret: '',
    token: '',
    ownerId: '',
    publicKey: '',
    devGuildId: '',
    databaseUrl: 'postgresql://pinguin:password@localhost:5432/pinguinboat',
    ownerPassword: '',
    sessionSecret: randomHex(32),
    botInternalSecret: randomHex(32),
    appUrl: '',
    apiUrl: '',
  });

  const set = (key: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  useEffect(() => {
    fetch('/api/setup/status')
      .then((r) => r.json())
      .then((d: { setupRequired?: boolean }) => {
        setStep(d.setupRequired ? 'password' : 'locked');
      })
      .catch(() => setStep('password'));

    const { protocol, hostname } = window.location;
    setForm((f) => ({
      ...f,
      appUrl: f.appUrl || `${protocol}//${hostname}:3000`,
      apiUrl: f.apiUrl || `${protocol}//${hostname}:4000`,
    }));
  }, []);

  async function verifyPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/setup/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setStep('form');
      } else {
        setError(data.error ?? 'that password was not accepted.');
      }
    } catch {
      setError('network error. try again.');
    } finally {
      setBusy(false);
    }
  }

  async function testDb() {
    setBusy(true);
    setDbTest('');
    try {
      const res = await fetch('/api/setup/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, databaseUrl: form.databaseUrl }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      setDbTest(data.ok ? 'connection ok' : data.error ?? 'connection failed');
    } catch {
      setDbTest('network error');
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...form }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setStep('done');
      } else {
        setError(data.error ?? 'the configuration was not written.');
      }
    } catch {
      setError('network error. try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      id="main"
      style={{
        minHeight: '100vh',
        padding: 'clamp(1.4rem, 4vw, 2.6rem) var(--gutter)',
        position: 'relative',
      }}
    >
      <span className="watermark" style={{ left: '78%', top: '18%', transform: 'translate(-50%, -50%)' }} aria-hidden="true">
        設
      </span>

      <div className="shell" style={{ maxWidth: '44rem', position: 'relative', zIndex: 1 }}>
        <header style={{ borderBottom: '1px solid var(--line)', paddingBottom: '1rem', marginBottom: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
            <span className="cjk" aria-hidden="true" style={{ fontSize: '1.3rem' }}>
              設
            </span>
            <span className="label">00 · first boot</span>
          </div>
          <h1 className="page-title" style={{ marginTop: '0.5rem' }}>
            initial configuration
          </h1>
          <p className="note" style={{ marginTop: '0.5rem' }}>
            one form, written once. the setup route closes itself after the .env files are written.
          </p>
        </header>

        {step === 'loading' && <p className="caption">loading…</p>}

        {step === 'locked' && (
          <div className="panel">
            <p className="note">configuration is already done. this page is closed.</p>
          </div>
        )}

        {step === 'password' && (
          <form onSubmit={verifyPassword} className="panel stack">
            <p className="note">
              enter the setup password set in the .env file at the repository root
              (variable <code>setup_password</code>).
            </p>
            <Field
              label="setup password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="········"
            />
            {error && <span className="caption" style={{ color: 'var(--ink-bright)' }}>{error}</span>}
            <div>
              <button type="submit" className="btn btn--solid" disabled={busy || !password}>
                {busy ? 'checking…' : 'continue'}
              </button>
            </div>
          </form>
        )}

        {step === 'form' && (
          <form onSubmit={submit} className="stack">
            <section className="panel stack">
              <div className="panel__head">
                <h2 className="panel__title">discord</h2>
                <span className="label">portal → applications</span>
              </div>
              <Field label="client id" value={form.clientId} onChange={set('clientId')} placeholder="123456789012345678" hint="general information → application id" />
              <Field label="client secret" value={form.clientSecret} onChange={set('clientSecret')} hint="oauth2 → client secret" />
              <Field label="bot token" value={form.token} onChange={set('token')} hint="bot → token" />
              <Field label="your discord id (owner)" value={form.ownerId} onChange={set('ownerId')} placeholder="123456789012345678" hint="developer mode → copy id" />
              <Field label="public key" value={form.publicKey} onChange={set('publicKey')} hint="general information → public key" />
              <Field label="test server id (optional)" value={form.devGuildId} onChange={set('devGuildId')} hint="commands register instantly there in dev" />
            </section>

            <section className="panel stack">
              <div className="panel__head">
                <h2 className="panel__title">database</h2>
                <span className="label">postgres</span>
              </div>
              <Field label="postgresql url" value={form.databaseUrl} onChange={set('databaseUrl')} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn" onClick={testDb} disabled={busy}>
                  test connection
                </button>
                {dbTest && <span className="caption">{dbTest}</span>}
              </div>
            </section>

            <section className="panel stack">
              <div className="panel__head">
                <h2 className="panel__title">security</h2>
                <span className="label">generated</span>
              </div>
              <Field
                label="owner password (dashboard)"
                type="password"
                value={form.ownerPassword}
                onChange={set('ownerPassword')}
                hint="twelve characters minimum, for the owner panel"
              />
              <Field
                label="session secret"
                value={form.sessionSecret}
                onChange={set('sessionSecret')}
                hint="used to sign the session cookie"
              />
              <Field
                label="bot internal secret"
                value={form.botInternalSecret}
                onChange={set('botInternalSecret')}
                hint="shared with the bot process"
              />
            </section>

            <section className="panel stack">
              <div className="panel__head">
                <h2 className="panel__title">urls</h2>
                <span className="label">pre-filled</span>
              </div>
              <Field label="site url" value={form.appUrl} onChange={set('appUrl')} />
              <Field label="api url" value={form.apiUrl} onChange={set('apiUrl')} />
            </section>

            {error && <span className="caption" style={{ color: 'var(--ink-bright)' }}>{error}</span>}

            <div>
              <button type="submit" className="btn btn--solid" disabled={busy}>
                {busy ? 'writing…' : 'write the configuration'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <section className="panel stack">
            <div className="panel__head">
              <h2 className="panel__title">written</h2>
              <span className="label">done</span>
            </div>
            <p className="note">
              <code>.env</code> at the root and <code>apps/web/.env.local</code> have been written.
            </p>
            <div style={{ border: '1px solid var(--line-soft)', background: 'var(--plate-frame)', padding: '0.7rem' }}>
              <pre className="terminal__body" style={{ minHeight: 0, padding: 0, margin: 0, fontSize: '0.7rem' }}>{`pnpm dev

# then, in another terminal
pnpm db:push`}</pre>
            </div>
            <p className="note">
              add the callback url in the discord portal: <code>{form.appUrl}/auth/callback</code>
            </p>
          </section>
        )}
      </div>
    </main>
  );
}