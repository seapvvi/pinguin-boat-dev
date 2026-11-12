'use client';

import { useState } from 'react';
import {
  BookOpen, Shield, Swords, Ticket, ScrollText, Trophy, Wallet,
  Gift, Vote, Lightbulb, DoorOpen, UserPlus, FileText, Settings,
  Music, Crown, Terminal, Hash, Gamepad2, Star, ClipboardList,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  commands?: { name: string; desc: string; usage?: string }[];
  features?: string[];
}

const SECTIONS: Section[] = [
  {
    id: 'getting-started',
    icon: <BookOpen size={16} />,
    title: 'démarrage rapide',
    description: 'comment ajouter pinguin boat à votre serveur et effectuer la configuration initiale.',
    features: [
      'invitez le bot via le bouton "inviter" dans le sélecteur de serveur.',
      'assurez-vous que le bot possède les permissions administrator ou au minimum : managechannels, manageroles, banmembers, kickmembers, managemessages, sendmessages, embedlinks, readmessagehistory.',
      'rendez-vous sur le dashboard puis sélectionnez votre serveur.',
      'naviguez dans les modules via la barre latérale et configurez chacun selon vos besoins.',
      'chaque module peut être activé/désactivé indépendamment via le toggle en haut de sa page.',
    ],
  },
  {
    id: 'moderation',
    icon: <Shield size={16} />,
    title: 'modération',
    description: 'commandes de modération manuelle pour gérer les membres de votre serveur.',
    commands: [
      { name: '/ban', desc: 'bannir un membre du serveur.', usage: '/ban @utilisateur [raison] [durée]' },
      { name: '/unban', desc: 'débannir un utilisateur.', usage: '/unban <id> [raison]' },
      { name: '/kick', desc: 'expulser un membre du serveur.', usage: '/kick @utilisateur [raison]' },
      { name: '/mute', desc: 'rendre un membre muet (timeout discord).', usage: '/mute @utilisateur <durée> [raison]' },
      { name: '/unmute', desc: 'retirer le timeout d’un membre.', usage: '/unmute @utilisateur [raison]' },
      { name: '/warn', desc: 'avertir un membre. les avertissements sont enregistrés.', usage: '/warn @utilisateur <raison>' },
      { name: '/warnings', desc: 'voir les avertissements d’un membre.', usage: '/warnings @utilisateur' },
      { name: '/clearwarns', desc: 'effacer tous les avertissements d’un membre.', usage: '/clearwarns @utilisateur' },
      { name: '/purge', desc: 'supprimer un nombre de messages dans un salon.', usage: '/purge <nombre> [@utilisateur]' },
      { name: '/slowmode', desc: 'définir le slowmode d’un salon.', usage: '/slowmode <secondes>' },
      { name: '/lock', desc: 'verrouiller un salon (interdire d’écrire).', usage: '/lock [salon]' },
      { name: '/unlock', desc: 'déverrouiller un salon.', usage: '/unlock [salon]' },
      { name: '/case', desc: 'voir les détails d’un cas de modération.', usage: '/case <id>' },
      { name: '/modlogs', desc: 'voir l’historique de modération d’un membre.', usage: '/modlogs @utilisateur' },
    ],
  },
  {
    id: 'automod',
    icon: <Swords size={16} />,
    title: 'auto-modération',
    description: 'filtres automatiques pour protéger votre serveur sans intervention manuelle.',
    features: [
      'filtre anti-spam : détecte et supprime les messages répétitifs ou envoyés trop rapidement.',
      'filtre anti-liens : bloque les urls et invitations discord non autorisées.',
      'filtre anti-mentions : limite les mentions en masse (@everyone, @here, rôles).',
      'filtre anti-majuscules : réduit les messages entièrement en majuscules.',
      'filtre de mots interdits : liste personnalisable de mots/expressions bloqués.',
      'actions configurables : supprimer, avertir, mute temporaire selon le niveau de violation.',
      'whitelist de rôles et salons pour exclure certains membres ou zones de l’auto-modération.',
    ],
  },
  {
    id: 'protection',
    icon: <Swords size={16} />,
    title: 'protection anti-raid',
    description: 'protège votre serveur contre les raids et les bots malveillants.',
    features: [
      'mode verification : impose une vérification aux nouveaux membres avant d’accéder au serveur.',
      'anti-join rapide : détecte les vagues de jointures et déclenche une alerte ou un lockdown.',
      'lockdown automatique : verrouille tous les salons configurés en cas de raid détecté.',
      'whitelist ip/compte : exempte certains membres de confiance des restrictions.',
      'alertes en temps réel : notification dans un salon de log lors d’une tentative de raid.',
    ],
  },
  {
    id: 'tickets',
    icon: <Ticket size={16} />,
    title: 'tickets',
    description: 'système de support avec tickets privés créés par les membres.',
    features: [
      'panneau de tickets : créez un message avec bouton de création de ticket via le dashboard.',
      'catégories multiples : définissez plusieurs types de tickets (support, report, candidature…).',
      'permissions automatiques : le salon privé n’est visible que par le membre et le staff.',
      'transcriptions : sauvegardez le contenu d’un ticket à sa fermeture.',
      'commandes staff : /ticket close, /ticket add, /ticket remove, /ticket rename.',
    ],
    commands: [
      { name: '/ticket close', desc: 'fermer le ticket actuel.', usage: '/ticket close [raison]' },
      { name: '/ticket add', desc: 'ajouter un membre au ticket.', usage: '/ticket add @utilisateur' },
      { name: '/ticket remove', desc: 'retirer un membre du ticket.', usage: '/ticket remove @utilisateur' },
    ],
  },
  {
    id: 'logs',
    icon: <ScrollText size={16} />,
    title: 'logs',
    description: 'journalisation des événements du serveur dans un salon dédié.',
    features: [
      'événements disponibles : messages supprimés/modifiés, entrées/sorties membres, modifications de rôles, changements de salons, actions de modération, mises à jour vocales.',
      'sélection granulaire : activez uniquement les événements dont vous avez besoin.',
      'salon de log dédié : configurez un salon spécifique pour recevoir les logs.',
      'ignorer des salons ou des utilisateurs : excluez certaines zones ou membres des logs.',
    ],
  },
  {
    id: 'levels',
    icon: <Trophy size={16} />,
    title: 'niveaux / xp',
    description: 'système de progression basé sur l’activité des membres.',
    features: [
      'xp gagné automatiquement en envoyant des messages (configurable : min/max xp par message, cooldown).',
      'annonce de passage de niveau dans un salon configurable ou en mp.',
      'récompenses de rôles : attribuez automatiquement des rôles à certains paliers de niveau.',
      'classement : commande /rank et /leaderboard pour voir sa position.',
      'multiplicateurs de xp par rôle ou par salon.',
      'réinitialisation du niveau d’un membre : /xp reset @membre.',
    ],
    commands: [
      { name: '/rank', desc: 'voir votre niveau et xp actuels.', usage: '/rank [@utilisateur]' },
      { name: '/leaderboard', desc: 'afficher le classement xp du serveur.', usage: '/leaderboard' },
      { name: '/xp give', desc: 'donner des xp à un membre (staff).', usage: '/xp give @utilisateur <montant>' },
      { name: '/xp remove', desc: 'retirer des xp à un membre (staff).', usage: '/xp remove @utilisateur <montant>' },
      { name: '/xp reset', desc: 'réinitialiser les xp d’un membre (staff).', usage: '/xp reset @utilisateur' },
    ],
  },
  {
    id: 'economy',
    icon: <Wallet size={16} />,
    title: 'économie',
    description: 'système de monnaie virtuelle et de boutique pour votre serveur.',
    features: [
      'monnaie virtuelle personnalisable (nom, symbole, emoji).',
      'gains quotidiens, hebdomadaires et travail via commandes.',
      'boutique : créez des articles achetables avec la monnaie du serveur.',
      'transferts entre membres, classement des richesses.',
      'intégration avec les niveaux : bonus économiques à certains paliers.',
    ],
    commands: [
      { name: '/balance', desc: 'voir votre solde.', usage: '/balance [@utilisateur]' },
      { name: '/daily', desc: 'récupérer votre bonus quotidien.', usage: '/daily' },
      { name: '/work', desc: 'travailler pour gagner des coins.', usage: '/work' },
      { name: '/pay', desc: 'payer un autre membre.', usage: '/pay @utilisateur <montant>' },
      { name: '/shop', desc: 'voir la boutique du serveur.', usage: '/shop' },
      { name: '/buy', desc: 'acheter un article de la boutique.', usage: '/buy <nom_article>' },
      { name: '/leaderboard money', desc: 'classement des fortunes.', usage: '/leaderboard money' },
    ],
  },
  {
    id: 'giveaways',
    icon: <Gift size={16} />,
    title: 'giveaways',
    description: 'organisez des concours et tirages au sort sur votre serveur.',
    features: [
      'création de giveaway avec durée, nombre de gagnants et description.',
      'participation via réaction ou bouton.',
      'tirage automatique à la fin du délai.',
      'reroll : re-tirer de nouveaux gagnants si un gagnant ne répond pas.',
      'annulation d’un giveaway en cours.',
      'conditions de participation configurables (rôle requis).',
    ],
    commands: [
      { name: '/giveaway start', desc: 'démarrer un giveaway.', usage: '/giveaway start <durée> <gagnants> <prix>' },
      { name: '/giveaway end', desc: 'terminer un giveaway immédiatement.', usage: '/giveaway end <id>' },
      { name: '/giveaway reroll', desc: 're-tirer les gagnants.', usage: '/giveaway reroll <id>' },
      { name: '/giveaway cancel', desc: 'annuler un giveaway.', usage: '/giveaway cancel <id>' },
    ],
  },
  {
    id: 'polls',
    icon: <Vote size={16} />,
    title: 'sondages',
    description: 'créez des sondages interactifs pour consulter votre communauté.',
    features: [
      'sondages à choix multiples avec jusqu’à 10 options.',
      'durée configurable avec clôture automatique.',
      'résultats en temps réel affichés dans l’embed.',
      'vote unique par membre.',
    ],
    commands: [
      { name: '/poll', desc: 'créer un sondage.', usage: '/poll <question> [option1] [option2] … [durée]' },
      { name: '/poll end', desc: 'terminer un sondage manuellement.', usage: '/poll end <id>' },
    ],
  },
  {
    id: 'suggestions',
    icon: <Lightbulb size={16} />,
    title: 'suggestions',
    description: 'permettez aux membres de soumettre des suggestions via le bot.',
    features: [
      'salon de suggestions configurable.',
      'soumission via commande, vote communautaire avec reactions (+1 / -1).',
      'gestion des suggestions : approuver, refuser, commenter (staff).',
      'notifications optionnelles à l’auteur lors d’une décision.',
    ],
    commands: [
      { name: '/suggest', desc: 'soumettre une suggestion.', usage: '/suggest <texte>' },
      { name: '/suggestion approve', desc: 'approuver une suggestion (staff).', usage: '/suggestion approve <id> [commentaire]' },
      { name: '/suggestion deny', desc: 'refuser une suggestion (staff).', usage: '/suggestion deny <id> [raison]' },
    ],
  },
  {
    id: 'welcome',
    icon: <DoorOpen size={16} />,
    title: 'bienvenue',
    description: 'messages d’accueil et d’au revoir personnalisés.',
    features: [
      'message de bienvenue configurable avec variables : {user}, {server}, {count}.',
      'message d’au revoir pour les membres quittant le serveur.',
      'embed personnalisable : couleur, image, description, footer.',
      'mention de l’utilisateur dans le message.',
    ],
  },
  {
    id: 'autoroles',
    icon: <UserPlus size={16} />,
    title: 'auto-rôles',
    description: 'attribution automatique de rôles lors de l’arrivée d’un nouveau membre.',
    features: [
      'jusqu’à 5 rôles attribués automatiquement à l’arrivée.',
      'rôles séparés pour bots et humains.',
      'délai configurable avant attribution (anti-raid).',
    ],
  },
  {
    id: 'embeds',
    icon: <FileText size={16} />,
    title: 'embeds',
    description: 'créez et envoyez des messages embed personnalisés dans vos salons.',
    features: [
      'éditeur d’embed complet : titre, description, couleur, image, footer, auteur, champs.',
      'envoi dans n’importe quel salon du serveur.',
      'sauvegarde et réutilisation de templates.',
      'prévisualisation avant envoi.',
    ],
  },
  {
    id: 'music',
    icon: <Music size={16} />,
    title: 'musique',
    description: 'lecture de musique dans les salons vocaux depuis youtube.',
    commands: [
      { name: '/play', desc: 'lancer une musique par url ou recherche.', usage: '/play <url ou recherche>' },
      { name: '/pause', desc: 'mettre en pause la lecture.', usage: '/pause' },
      { name: '/resume', desc: 'reprendre la lecture.', usage: '/resume' },
      { name: '/skip', desc: 'passer à la piste suivante.', usage: '/skip' },
      { name: '/stop', desc: 'arrêter la musique et vider la queue.', usage: '/stop' },
      { name: '/queue', desc: 'voir la file d’attente.', usage: '/queue' },
      { name: '/volume', desc: 'régler le volume (0–100).', usage: '/volume <0-100>' },
      { name: '/loop', desc: 'activer/désactiver la répétition.', usage: '/loop' },
      { name: '/shuffle', desc: 'mélanger la queue.', usage: '/shuffle' },
      { name: '/nowplaying', desc: 'voir la piste en cours.', usage: '/nowplaying' },
    ],
  },
  {
    id: 'minigames',
    icon: <Gamepad2 size={16} />,
    title: 'minijeux',
    description: 'divertissez votre communauté avec des minijeux intégrés utilisant le système d’économie.',
    features: [
      'blackjack : jouez au 21 contre le croupier avec vos coins.',
      'pierre-feuille-ciseaux : défiez le bot dans un classique.',
      'morpion : jouez au tic-tac-toe contre un autre membre.',
      'guess : devinez un nombre aléatoire pour gagner des coins.',
      'mises configurables : minimum et maximum par le staff.',
      'récompenses personnalisables pour chaque jeu.',
      'sessions sécurisées : une seule partie active par joueur.',
    ],
    commands: [
      { name: '/blackjack', desc: 'lancer une partie de blackjack.', usage: '/blackjack <mise>' },
      { name: '/rps', desc: 'jouer à pierre-feuille-ciseaux.', usage: '/rps <mise> <choix>' },
      { name: '/morpion', desc: 'lancer une partie de morpion.', usage: '/morpion <mise> @adversaire' },
      { name: '/guess', desc: 'deviner un nombre aléatoire.', usage: '/guess <mise>' },
    ],
  },
  {
    id: 'starboard',
    icon: <Star size={16} />,
    title: 'starboard',
    description: 'mettez en avant les messages les plus populaires de votre serveur.',
    features: [
      'salon starboard dédié pour afficher les messages les plus étoilés.',
      'emoji de réaction personnalisable (par défaut : ⭐).',
      'seuil minimum de réactions configurable.',
      'option pour autoriser ou non l’auto-star (réagir à son propre message).',
      'affichage en temps réel des entrées depuis le dashboard.',
      'classement des messages par nombre d’étoiles.',
    ],
    commands: [
      { name: '/starboard config', desc: 'configurer le starboard.', usage: '/starboard config <salon> [emoji] [min]' },
    ],
  },
  {
    id: 'forms',
    icon: <ClipboardList size={16} />,
    title: 'formulaires',
    description: 'créez des formulaires personnalisés pour collecter des informations auprès de vos membres.',
    features: [
      'modèles de formulaires personnalisables avec champs texte, texte long et choix multiples.',
      'salon de réception des réponses configurable.',
      'salon de logs pour le suivi des soumissions.',
      'approbation ou rejet des réponses depuis le dashboard en temps réel.',
      'plusieurs formulaires actifs simultanément.',
      'champs obligatoires ou optionnels.',
    ],
    commands: [
      { name: '/forms submit', desc: 'remplir un formulaire disponible.', usage: '/forms submit <nom_formulaire>' },
      { name: '/forms config', desc: 'configurer le système de formulaires.', usage: '/forms config <salon> [log_salon]' },
    ],
  },
  {
    id: 'settings',
    icon: <Settings size={16} />,
    title: 'paramètres',
    description: 'configuration générale du bot sur votre serveur.',
    features: [
      'préfixe de commande legacy (si applicable).',
      'langue du bot (français/anglais).',
      'salon d’annonces, salon de règles.',
      'rôles staff (modération, admin) reconnus par le bot.',
      'retirer le bot du serveur proprement depuis le dashboard.',
    ],
  },
  {
    id: 'donor',
    icon: <Crown size={16} />,
    title: 'avantages donateurs',
    description: 'fonctionnalités exclusives débloquées par un don de 5€ minimum sur ko-fi.',
    features: [
      'thèmes dashboard exclusifs : gold, aurora, crimson, synthwave, everforest, cobalt2, et plus à venir.',
      'flocons de neige animés dans la sidebar.',
      'badge donateur sur votre profil (icone coeur).',
      'rôle exclusif + salon privé sur le serveur discord officiel.',
      'accès anticipé aux nouvelles fonctionnalités en bêta.',
      'vote prioritaire sur la roadmap du projet.',
      'pour activer vos privilèges : faites un don de 5€+ sur ko-fi.com/pvvi en indiquant votre id discord dans le message.',
    ],
  },
];

export default function DocsPage() {
  const [openSection, setOpenSection] = useState<string | null>('getting-started');

  return (
    <PageLayout
      title="documentation"
      eyebrow="05 · docs"
      glyph="冊"
      description="guide complet de tous les modules et commandes de pinguin boat."
    >
      <div className="rows">
        {SECTIONS.map((section, i) => {
          const isOpen = openSection === section.id;
          return (
            <section key={section.id} className="faq__row">
              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '2.4rem minmax(0,1fr) auto',
                  gap: '1rem',
                  alignItems: 'baseline',
                  padding: '0.95rem 0',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', flexWrap: 'wrap' }}>
                    <span aria-hidden="true" style={{ color: 'var(--ink-dim)', display: 'inline-flex' }}>{section.icon}</span>
                    <span className="rows__title">{section.title}</span>
                  </div>
                  <div className="rows__desc">{section.description}</div>
                </div>
                <span className="tag">{isOpen ? 'open' : 'read'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 0 1.2rem 3.4rem' }}>
                  {section.features && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <Hash size={12} aria-hidden="true" />
                        <span className="label">fonctionnalités</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {section.features.map((f, idx) => (
                          <li key={idx} className="note" style={{ maxWidth: '72ch' }}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {section.commands && (
                    <div style={{ marginTop: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <Terminal size={12} aria-hidden="true" />
                        <span className="label">commandes</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {section.commands.map((cmd) => (
                          <div
                            key={cmd.name}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(10rem, 16rem) minmax(0,1fr)',
                              gap: '0.8rem',
                              padding: '0.55rem 0',
                              borderBottom: '1px solid var(--line-soft)',
                              alignItems: 'start',
                            }}
                          >
                            <code
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--ink)',
                                fontFamily: 'var(--f-mono)',
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {cmd.usage ?? cmd.name}
                            </code>
                            <span className="note" style={{ maxWidth: '60ch' }}>{cmd.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </PageLayout>
  );
}
