'use client';

import { useEffect } from 'react';

/** Last-resort boundary: catches render errors thrown outside the dashboard group. */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[web] render failed', error);
  }, [error]);

  return (
    <main className="shell" style={{ paddingBlock: '4rem' }}>
      <div className="folio" role="alert" aria-live="assertive">
        <span className="label">erreur inattendue</span>
        <h1 className="display" style={{ marginTop: '0.75rem' }}>
          le site a rencontré un problème
        </h1>
        <p className="note" style={{ marginTop: '0.75rem', maxWidth: '48ch' }}>
          Rechargez la page. Si le problème persiste, réessayez dans quelques
          minutes.
        </p>
        {error.digest && (
          <p className="caption" style={{ marginTop: '0.5rem' }}>
            référence&nbsp;: {error.digest}
          </p>
        )}
        <button
          type="button"
          className="btn btn--solid"
          style={{ marginTop: '1.5rem' }}
          onClick={reset}
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}