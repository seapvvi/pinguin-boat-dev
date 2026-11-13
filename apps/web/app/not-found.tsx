import Link from 'next/link';

/** Root 404: unmatched marketing and legacy URLs land here. */
export default function RootNotFound() {
  return (
    <main className="shell" style={{ paddingBlock: '4rem' }}>
      <div className="folio">
        <span className="label">404</span>
        <h1 className="display" style={{ marginTop: '0.75rem' }}>
          page introuvable
        </h1>
        <p className="note" style={{ marginTop: '0.75rem', maxWidth: '48ch' }}>
          Le lien est peut-être obsolète. Le tableau de bord reste accessible via
          le bouton ci-dessous.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Link className="btn btn--solid" href="/">
            Accueil
          </Link>
          <Link className="btn" href="/dashboard">
            Tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}