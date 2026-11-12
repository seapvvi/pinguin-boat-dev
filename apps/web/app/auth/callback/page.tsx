'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/auth';

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = params.get('next') ?? '/servers';
      try {
        const user = await getUser();
        if (cancelled) return;
        if (user) {
          router.replace(next);
          return;
        }
        setError('the session was not created. try signing in again.');
      } catch {
        if (!cancelled) setError('the callback did not complete. try again.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <>
      <span className="label">00 · callback</span>
      <h1 className="page-title" style={{ marginTop: '0.6rem' }}>
        {error ? 'sign in failed' : 'signing in'}
      </h1>
      <p className="note" style={{ marginTop: '0.8rem' }}>
        {error ?? 'one moment, reading your discord session.'}
      </p>

      {error && (
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.4rem' }}>
          <Link href="/auth/login" className="btn">
            try again
          </Link>
          <Link href="/" className="btn">
            index
          </Link>
        </div>
      )}
    </>
  );
}

export default function AuthCallbackPage() {
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
      }}
    >
      <span className="watermark" style={{ left: '58%', top: '44%', transform: 'translate(-50%, -50%)' }} aria-hidden="true">
        戻
      </span>

      <div className="shell" style={{ maxWidth: '32rem', position: 'relative', zIndex: 1 }}>
        <Suspense
          fallback={
            <>
              <span className="label">00 · callback</span>
              <h1 className="page-title" style={{ marginTop: '0.6rem' }}>
                signing in
              </h1>
            </>
          }
        >
          <CallbackInner />
        </Suspense>
      </div>
    </main>
  );
}
