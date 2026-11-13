'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useConfetti } from '@/hooks/useConfetti';
import { m as motion } from 'motion/react';
import {
  Heart, ExternalLink, Palette, MessageCircle, Star, Rocket,
  Vote, Brush, Shield, Megaphone, Users, Trophy, Medal, Lock
} from 'lucide-react';
import { Card, Skeleton, Button } from '@pinguin/ui';
import { PageLayout } from '@/components/layout/PageLayout';
import { api } from '@/lib/api';
import KofiPopup from '@/components/KofiPopup';

interface Donor {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  amount: number;
  message: string | null;
}

const PERKS = [
  { icon: <Shield size={16} />, title: 'rôle donateur discord', desc: 'un rôle exclusif avec une couleur distinctive sur notre serveur discord officiel.' },
  { icon: <MessageCircle size={16} />, title: 'salon privé #donateurs', desc: 'accès au salon privé réservé aux donateurs pour échanger directement avec l’équipe et influencer le projet.' },
  { icon: <Star size={16} />, title: 'badge sur votre profil', desc: 'un badge donateur affiché sur votre profil dans le dashboard, visible par la communauté.' },
  { icon: <Megaphone size={16} />, title: 'annonce publique', desc: 'votre soutien est célébré sur notre serveur discord. option de rester anonyme disponible.' },
  { icon: <Rocket size={16} />, title: 'accès anticipé aux bêtas', desc: 'vous testez les nouvelles fonctionnalités en avant-première, avant tout le monde.' },
  { icon: <Vote size={16} />, title: 'vote prioritaire roadmap', desc: 'vos votes et suggestions pour les prochaines fonctionnalités ont un poids prioritaire.' },
  { icon: <Palette size={16} />, title: 'thèmes dashboard exclusifs', desc: 'accès à des thèmes de couleurs supplémentaires dans le dashboard : gold, aurora, crimson, et bientôt d’autres.' },
  { icon: <Brush size={16} />, title: 'couleur d’embed custom', desc: 'personnalisez la couleur des embeds du bot sur votre serveur avec la commande /embed-color.' },
];

export default function SupportPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const reduced = useReducedMotion();
  const { fire } = useConfetti();

  useEffect(() => {
    api.get<{ data?: { donors?: Donor[] }; donors?: Donor[] }>('/api/donors')
      .then((res) => {
        const list = res?.data?.donors ?? res?.donors ?? [];
        setDonors(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const sortedDonors = [...donors].sort((a, b) => b.amount - a.amount);
  const topDonors = sortedDonors.slice(0, 3);
  const restDonors = sortedDonors.slice(3);

  const stats = [
    { label: 'donateurs', value: donors.length > 0 ? donors.length : '—', icon: <Users size={14} /> },
    { label: 'total récolté', value: donors.length > 0
        ? `${donors.reduce((s, d) => s + d.amount, 0).toFixed(0)} €`
        : '—', icon: <Heart size={14} /> },
    { label: 'avantages inclus', value: PERKS.length.toString(), icon: <Star size={14} /> },
  ];

  const sectionAnimation = (index: number) => reduced
    ? { initial: {}, animate: {} }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: index * 0.08, duration: 0.35 },
      };

  return (
    <PageLayout
      title="soutenir pinguin boat"
      eyebrow="04 · support"
      glyph="援"
      description="pinguin boat est un projet open source. les dons couvrent l’hébergement et le temps de développement. aucune fonctionnalité du bot n’est verrouillée."
      actions={
        <Button
          onClick={() => {
            fire('donate');
            setShowPopup(true);
          }}
        >
          <ExternalLink size={14} /> faire un don
        </Button>
      }
    >
      {showPopup && <KofiPopup onClose={() => setShowPopup(false)} />}

      <motion.div {...sectionAnimation(0)}>
        <div className="stat-strip">
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span className="label">{s.label}</span>
                <span aria-hidden="true" style={{ color: 'var(--ink-dim)' }}>{s.icon}</span>
              </div>
              {loading ? <Skeleton className="h-6 w-16" /> : <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--ink-bright)' }}>{s.value}</div>}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="content-grid">
        <div className="content-grid__body stack">
          <motion.div {...sectionAnimation(1)}>
            <Card>
              <div className="panel__head">
                <h2 className="panel__title">ce que vous obtenez dès 5 €</h2>
                <span className="label">cosmétique &amp; communauté</span>
              </div>
              <p className="note" style={{ marginBottom: '1rem' }}>
                aucune fonctionnalité du bot n’est verrouillée. ces avantages sont cosmétiques et communautaires.
              </p>
              <div className="folio-cards">
                {PERKS.map((p) => (
                  <article key={p.title} className="folio-card">
                    <span aria-hidden="true" style={{ color: 'var(--ink-dim)', marginBottom: '0.5rem', display: 'inline-flex' }}>{p.icon}</span>
                    <h3 className="card-title">{p.title}</h3>
                    <p className="note" style={{ marginTop: '0.35rem' }}>{p.desc}</p>
                    <span className="caption" style={{ marginTop: '0.6rem', color: 'var(--ink)' }}>inclus dès 5 €</span>
                  </article>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div {...sectionAnimation(2)}>
            <Card>
              <div className="panel__head">
                <h2 className="panel__title">ils soutiennent le projet</h2>
                <span className="label">{donors.length} donateurs</span>
              </div>
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : donors.length === 0 ? (
                <div style={{ paddingBlock: '1.2rem' }}>
                  <p className="note">soyez le premier à soutenir le projet et apparaître ici.</p>
                  <div style={{ marginTop: '0.9rem' }}>
                    <Button size="sm" onClick={() => { fire('donate'); setShowPopup(true); }}>
                      être le premier
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="stack">
                  {topDonors.map((d, i) => (
                    <div key={d.id} className="kv" style={{ alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                        {i === 0 ? <Trophy size={14} aria-hidden="true" /> : <Medal size={14} aria-hidden="true" />}
                        <span className="kv__value" style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.username}</span>
                      </span>
                      <span className="kv__value">{d.amount.toFixed(2)} €</span>
                    </div>
                  ))}
                  {restDonors.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.4rem' }}>
                      {restDonors.map((d) => (
                        <span key={d.id} className="tag">{d.username}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <aside className="content-grid__plate">
          <Card>
            <div className="panel__head">
              <h2 className="panel__title">à propos</h2>
            </div>
            <div className="prose" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.76rem' }}>
              <p>pinguin boat est développé et maintenu par une petite équipe. les dons financent l’infrastructure et le temps de travail.</p>
              <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Lock size={12} aria-hidden="true" /> 100% open source · aucune fonctionnalité verrouillée</p>
            </div>
          </Card>
        </aside>
      </div>
    </PageLayout>
  );
}
