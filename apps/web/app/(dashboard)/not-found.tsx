import Link from 'next/link';

/** 404 for unknown dashboard routes (bad guild id, removed module page). */
export default function DashboardNotFound() {
  return (
    <div className="panel" role="alert">
      <div className="panel__head">
        <h2 className="panel__title">page introuvable</h2>
        <span className="label">404</span>
      </div>
      <p className="note" style={{ marginBottom: '1rem' }}>
        Cette page n&apos;existe pas ou plus. Le serveur a peut-être été retiré de
        la liste.
      </p>
      <Link className="btn btn--solid" href="/dashboard">
        Retour au tableau de bord
      </Link>
    </div>
  );
}