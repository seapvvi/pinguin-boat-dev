'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield, Scale, MessageSquare, Terminal, Activity, Gift,
  Gamepad2, Star, ClipboardList, Users, Music,
  Hash, Clock, Command,
} from 'lucide-react';
import { Badge, Toggle, Button, KPICard } from '@pinguin/ui';
import { EmptyState, ErrorMessage } from '@pinguin/ui';
import { SkeletonPage } from '@/components/layout/SkeletonPage';
import { Plate } from '@/components/Plate';
import { fetchGuildSettings, fetchModCases, updateGuildSettings, fetchAuditLogs } from '@/lib/api';
import { formatNumber, formatDate } from '@/lib/utils';
import type { GuildConfig, ModCase } from '@pinguin/shared';
import { ModuleName } from '@pinguin/shared';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useCountUp } from '@/hooks/useCountUp';
import dynamic from 'next/dynamic';

const OnboardingModal = dynamic(
  () => import('@/components/onboarding/OnboardingModal').then((m) => m.OnboardingModal),
  { ssr: false }
);
import { PageLayout, SectionCard, ModuleGrid } from '@/components/layout';

export default function GuildOverviewPage() {
  const { guildId } = useParams<{ guildId: string }>();
  const router = useRouter();
  const [config, setConfig] = useState<GuildConfig | null>(null);
  const [cases, setCases] = useState<ModCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [channelCount, setChannelCount] = useState<number>(0);
  const [recentActivity, setRecentActivity] = useState<{ id?: string; action?: string; createdAt?: string }[]>([]);

  const onboarding = useOnboarding(guildId);

  const modules = [
    { key: ModuleName.MODERATION, label: 'moderation', icon: <Shield size={14} /> },
    { key: ModuleName.PROTECTION, label: 'protection', icon: <Scale size={14} /> },
    { key: ModuleName.TICKETS, label: 'tickets', icon: <MessageSquare size={14} /> },
    { key: ModuleName.LOGS, label: 'logs', icon: <Terminal size={14} /> },
    { key: ModuleName.LEVELS, label: 'levels', icon: <Activity size={14} /> },
    { key: ModuleName.ECONOMY, label: 'economy', icon: <Activity size={14} /> },
    { key: ModuleName.MUSIC, label: 'music', icon: <Music size={14} /> },
    { key: ModuleName.GIVEAWAYS, label: 'giveaways', icon: <Gift size={14} /> },
    { key: ModuleName.MINIGAMES, label: 'minigames', icon: <Gamepad2 size={14} /> },
    { key: ModuleName.STARBOARD, label: 'starboard', icon: <Star size={14} /> },
    { key: ModuleName.FORMS, label: 'forms', icon: <ClipboardList size={14} /> },
    { key: ModuleName.CLANS, label: 'clans', icon: <Users size={14} /> },
  ];

  const skeletonRows = modules.length > 4 ? 3 : modules.length <= 2 ? 1 : 2;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, casesRes, auditRes] = await Promise.all([
        fetchGuildSettings(guildId),
        fetchModCases(guildId, { page: '1', limit: '5' }),
        fetchAuditLogs(guildId, { page: '1', limit: '10' }),
      ]);
      if (settingsRes.success && settingsRes.data) {
        const guild = settingsRes.data.guild;
        setConfig(guild);
        setMemberCount((guild as GuildConfig & { memberCount?: number }).memberCount ?? 0);
        setChannelCount((guild as GuildConfig & { channelCount?: number }).channelCount ?? 0);
      }
      if (casesRes.success && casesRes.data) setCases(casesRes.data.cases ?? []);
      if (auditRes.success && auditRes.data) setRecentActivity(auditRes.data.entries ?? []);
    } catch (e) {
      const is404 = e instanceof Error && e.message.includes('404');
      setError(is404 ? 'this server is not reachable' : (e instanceof Error ? e.message : 'could not load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [guildId]);

  useEffect(() => {
    if (!loading && config) onboarding.checkOnboardingStatus();
  }, [loading, config?.id]);

  const handleModuleToggle = async (module: ModuleName, enabled: boolean) => {
    setToggling(module);
    setToggleError(null);
    try {
      const current = config?.disabledModules ?? [];
      const updated = enabled ? current.filter((m) => m !== module) : [...current, module];
      const res = await updateGuildSettings(guildId, { disabledModules: updated });
      if (res.success && res.data) setConfig(res.data.guild);
    } catch (e) {
      setToggleError(e instanceof Error ? e.message : 'the change did not save');
    } finally {
      setToggling(null);
    }
  };

  const isModuleEnabled = (module: ModuleName) => !config?.disabledModules.includes(module);

  const animatedMembers = useCountUp(memberCount || 0, 700);
  const animatedChannels = useCountUp(channelCount || 0, 700);
  const animatedCases = useCountUp(cases.length || 0, 700);

  if (error) {
    if (error === 'this server is not reachable') {
      return (
        <PageLayout title="server not found" eyebrow="01 · server" glyph="ç„¡">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', paddingBlock: '2rem' }}>
            <p className="note" style={{ fontSize: '0.86rem' }}>
              this server is not listed for you, or the bot is not in it. both cases look the same from here.
            </p>
            <Button onClick={() => router.push('/servers')}>back to servers</Button>
          </div>
        </PageLayout>
      );
    }
    return (
      <PageLayout title="server overview" eyebrow="01 · server" glyph="ä¼">
        <ErrorMessage title="could not load" message={error} onRetry={load} />
      </PageLayout>
    );
  }

  if (loading) {
    return <SkeletonPage rows={skeletonRows} />;
  }

  const stats = [
    { label: 'members', value: formatNumber(animatedMembers), icon: <Users size={14} /> },
    { label: 'channels', value: formatNumber(animatedChannels), icon: <Hash size={14} /> },
    { label: 'mod cases', value: formatNumber(animatedCases), icon: <Command size={14} /> },
    { label: 'activity', value: recentActivity.length > 0 ? 'recent' : '—', icon: <Clock size={14} /> },
  ];

  return (
    <PageLayout
      title="server overview"
      eyebrow="01 · server"
      glyph="ä¼"
      description={`id ${guildId} · ${isModuleEnabled(ModuleName.MODERATION) ? 'moderation on' : 'moderation off'}`}
      actions={
        <>
          <Badge variant="default">alpha</Badge>
          <Button onClick={load} size="sm">
            refresh
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <KPICard label={s.label} value={s.value} icon={s.icon} />
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="content-grid__body stack">
          <ModuleGrid>
            <SectionCard title="modules" description="one switch per module" glyph="çµ„" expandable>
              {toggleError && (
                <div style={{ border: '1px solid var(--line)', padding: '0.5rem 0.6rem', marginBottom: '0.7rem' }}>
                  <span className="caption" style={{ color: 'var(--ink)' }}>
                    {toggleError}
                  </span>
                </div>
              )}

              <div>
                {modules.map((mod) => {
                  const enabled = isModuleEnabled(mod.key);
                  return (
                    <div className="switch-row" key={mod.key}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span aria-hidden="true" style={{ color: 'var(--ink-dim)', display: 'inline-flex' }}>
                          {mod.icon}
                        </span>
                        <div>
                          <div className="switch-row__title">{mod.label}</div>
                          <div className="switch-row__desc">{enabled ? 'on for this server' : 'off for this server'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="tag">{enabled ? 'on' : 'off'}</span>
                        <Toggle
                          checked={enabled}
                          onChange={(v) => handleModuleToggle(mod.key, v)}
                          disabled={toggling === mod.key}
                          label={`toggle ${mod.label}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="recent mod cases" description="last five" glyph="éŒ²">
              {cases.length === 0 ? (
                <EmptyState title="no cases" description="nothing has been actioned on this server yet." />
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>user</th>
                        <th>type</th>
                        <th>reason</th>
                        <th>date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((c) => (
                        <tr key={c.id}>
                          <td>{c.userId.slice(0, 8)}…</td>
                          <td>
                            <span className="tag">{c.type.toLowerCase()}</span>
                          </td>
                          <td className="dim" style={{ maxWidth: '22ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.reason}
                          </td>
                          <td className="dim">{formatDate(c.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </ModuleGrid>
        </div>

        <aside className="content-grid__plate">
          <Plate name="rocket" priority />
          <SectionCard title="audit trail" description="last ten" glyph="è¨˜">
            {recentActivity.length === 0 ? (
              <p className="caption">nothing recorded yet.</p>
            ) : (
              <div>
                {recentActivity.map((act, i: number) => (
                  <div className="kv" key={act.id ?? i}>
                    <span className="kv__key" style={{ maxWidth: '14ch', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {act.action ?? 'action'}
                    </span>
                    <span className="kv__value">{act.createdAt ? formatDate(act.createdAt) : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </aside>
      </div>

      <OnboardingModal
        guildId={guildId}
        open={onboarding.open}
        currentStep={onboarding.currentStep}
        totalSteps={onboarding.totalSteps}
        data={onboarding.data}
        onClose={onboarding.skipOnboarding}
        onSkip={onboarding.skipOnboarding}
        onComplete={onboarding.completeOnboarding}
        onStepChange={onboarding.setStep}
        onNextStep={onboarding.nextStep}
        onPrevStep={onboarding.prevStep}
      />
    </PageLayout>
  );
}
