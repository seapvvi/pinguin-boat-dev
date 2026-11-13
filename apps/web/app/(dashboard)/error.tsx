'use client';

import { useEffect } from 'react';

/**
 * Error boundary for the dashboard group. Client components throw during
 * render, so this must be a client component; it keeps the shell (sidebar,
 * header) mounted and replaces only the page body.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The API is the usual culprit; surface it in the browser console with the
    // digest Next generates so a user report can be matched to a server log.
    console.error('[dashboard] render failed', error);
  }, [error]);

  return (
    <div className="panel" role="alert" aria-live="assertive">
      <div className="panel__head">
        <h2 className="panel__title">page indisponible</h2>
        {error.digest && <span className="label">{error.digest}</span>}
      </div>
      <p className="note" style={{ marginBottom: '1rem' }}>
        Une erreur est survenue pendant le chargement de cette page. Vos données
        ne sont pas modifiées.
      </p>
      <button type="button" className="btn btn--solid" onClick={reset}>
        Réessayer
      </button>
    </div>
  );
}