'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield, ShieldCheck, ShieldOff, Key, Smartphone,
  CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import {
  Card, Button, Badge, Skeleton, ErrorMessage,
  Modal, Input
} from '@pinguin/ui';
import { get2FAStatus, setup2FA, verify2FA, disable2FA, getRecoveryCodeStatus, regenerateRecoveryCodes } from '@/lib/api';

export default function Owner2FAPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [recoveryRemaining, setRecoveryRemaining] = useState<number | null>(null);
  const [regenCode, setRegenCode] = useState('');
  const [showRegenModal, setShowRegenModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get2FAStatus();
      if (res.success && res.data) {
        setEnabled(res.data.enabled);
        if (res.data.enabled) {
          const codes = await getRecoveryCodeStatus().catch(() => null);
          if (codes?.success && codes.data) setRecoveryRemaining(codes.data.remaining);
        }
      }
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSetup = async () => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await setup2FA();
      if (res.success && res.data) {
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
        setRecoveryCodes(res.data.recoveryCodes ?? null);
        setVerificationCode('');
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Erreur lors de la configuration.' });
    } finally { setActionLoading(false); }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) return;
    setActionLoading(true);
    setStatusMessage(null);
    try {
      await verify2FA(verificationCode.trim());
      setEnabled(true);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      setRecoveryRemaining(recoveryCodes?.length ?? null);
      setStatusMessage({ type: 'success', text: '2FA activée avec succès !' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Code invalide. Veuillez réessayer.' });
    } finally { setActionLoading(false); }
  };

  const handleDisable = async () => {
    if (!disableCode.trim()) return;
    setActionLoading(true);
    setStatusMessage(null);
    try {
      await disable2FA(disableCode.trim());
      setEnabled(false);
      setShowDisableModal(false);
      setDisableCode('');
      setStatusMessage({ type: 'success', text: '2FA désactivée.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Code invalide.' });
    } finally { setActionLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!regenCode.trim()) return;
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await regenerateRecoveryCodes(regenCode.trim());
      setRecoveryCodes(res.data?.recoveryCodes ?? null);
      setRecoveryRemaining(res.data?.recoveryCodes?.length ?? null);
      setShowRegenModal(false);
      setRegenCode('');
      setStatusMessage({ type: 'success', text: 'Nouveaux codes de récupération générés.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Code invalide.' });
    } finally { setActionLoading(false); }
  };

  // Shown once right after setup/regeneration: only hashes are kept server-side.
  const recoveryCodesCard = recoveryCodes && (
    <Card className="mb-6">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Codes de récupération</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Conservez ces codes hors ligne. Chacun fonctionne une seule fois, si vous perdez l'accès à votre application d'authentification.
        Ils ne seront plus affichés.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-sm text-[var(--text-primary)]">
        {recoveryCodes.map((c) => (
          <code key={c} className="bg-[var(--bg-surface-alt)] px-3 py-2 rounded-[var(--radius-sm)]">{c}</code>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))} title="Copier">
          <Key size={14} /> Copier
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setRecoveryCodes(null)}>J'ai enregistré mes codes</Button>
      </div>
    </Card>
  );

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
        <ErrorMessage title="Erreur" message={error} onRetry={load} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Authentification à deux facteurs</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Sécurisez votre accès owner avec 2FA.</p>
      </div>

      {statusMessage && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-[var(--radius-sm)] mb-6 ${
          statusMessage.type === 'success' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--error)]/10 text-[var(--error)]'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
          <span className="text-sm">{statusMessage.text}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-[var(--radius)]" />
          <Skeleton className="h-48 rounded-[var(--radius)]" />
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {enabled ? (
                  <ShieldCheck size={24} className="text-[var(--success)]" />
                ) : (
                  <ShieldOff size={24} className="text-[var(--text-secondary)]" />
                )}
                <div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Statut 2FA
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {enabled
                      ? 'L\'authentification à deux facteurs est activée.'
                      : 'L\'authentification à deux facteurs n\'est pas configurée.'}
                  </p>
                </div>
              </div>
              <Badge variant={enabled ? 'success' : 'error'}>
                {enabled ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
          </Card>

          {enabled ? (
            <>
            {recoveryCodesCard}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Codes de récupération</h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    {recoveryRemaining === null
                      ? 'Aucun code de récupération enregistré. Régénérez-en pour ne pas rester bloqué.'
                      : `${recoveryRemaining} code(s) de récupération restant(s).`}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setShowRegenModal(true)}>
                  <RefreshCw size={14} /> Régénérer
                </Button>
              </div>
            </Card>
            <Card>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Désactiver la 2FA</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Vous pouvez désactiver l'authentification à deux facteurs à tout moment.
              </p>
              <Button variant="danger" size="sm" onClick={() => setShowDisableModal(true)}>
                <ShieldOff size={14} /> Désactiver la 2FA
              </Button>
            </Card>
            </>
          ) : qrCode ? (
            <Card>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Configurer la 2FA</h2>
              <div className="flex flex-col items-center gap-4 mb-4">
                <p className="text-sm text-[var(--text-secondary)] text-center">
                  Scannez ce code QR avec votre application d'authentification (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-white p-3 rounded-[var(--radius-sm)]">
                  <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
                {secret && (
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-[var(--bg-surface-alt)] px-3 py-2 rounded-[var(--radius-sm)] text-[var(--text-primary)]">{secret}</code>
                    <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(secret)} title="Copier">
                      <Key size={14} />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Input
                  label="Code de vérification"
                  placeholder="Entrez le code à 6 chiffres..."
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                {recoveryCodesCard}
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" size="sm" onClick={() => { setQrCode(null); setSecret(null); setRecoveryCodes(null); }}>
                    <RefreshCw size={14} /> Recommencer
                  </Button>
                  <Button size="sm" loading={actionLoading} disabled={verificationCode.length < 6} onClick={handleVerify}>
                    <Shield size={14} /> Vérifier et activer
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Configurer l'authentification à deux facteurs</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Renforcez la sécurité de votre compte owner en activant la 2FA.
                Vous aurez besoin d'une application d'authentification sur votre téléphone.
              </p>
              <Button size="sm" loading={actionLoading} onClick={handleSetup}>
                <Smartphone size={14} /> Configurer la 2FA
              </Button>
            </Card>
          )}
        </>
      )}

      <Modal open={showDisableModal} onClose={() => setShowDisableModal(false)} title="Désactiver la 2FA">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Pour désactiver la 2FA, veuillez entrer votre code d'authentification actuel.
        </p>
        <Input
          label="Code 2FA"
          placeholder="Code à 6 chiffres..."
          value={disableCode}
          onChange={(e) => setDisableCode(e.target.value)}
          maxLength={6}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowDisableModal(false)}>Annuler</Button>
          <Button variant="danger" size="sm" loading={actionLoading} disabled={disableCode.length < 6} onClick={handleDisable}>
            Désactiver
          </Button>
        </div>
      </Modal>

      <Modal open={showRegenModal} onClose={() => setShowRegenModal(false)} title="Régénérer les codes de récupération">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Les anciens codes seront invalidés. Entrez votre code d'authentification actuel pour continuer.
        </p>
        <Input
          label="Code 2FA"
          placeholder="Code à 6 chiffres..."
          value={regenCode}
          onChange={(e) => setRegenCode(e.target.value)}
          maxLength={6}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowRegenModal(false)}>Annuler</Button>
          <Button size="sm" loading={actionLoading} disabled={regenCode.length < 6} onClick={handleRegenerate}>
            Régénérer
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
