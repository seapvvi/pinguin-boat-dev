'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Toggle, Skeleton } from '@pinguin/ui';
import { fetchGuildSettings, toggleModule as apiToggleModule } from '@/lib/api';

const KEY_MAP: Record<string, string> = {
  automod: 'moderation',
};

interface ModuleToggleProps {
  guildId: string;
  moduleKey: string;
  label: string;
  description?: string;
}

export function ModuleToggle({ guildId, moduleKey, label, description }: ModuleToggleProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rawKey = moduleKey.trim().toLowerCase();
  const normalizedModuleKey = KEY_MAP[rawKey] ?? rawKey;

  useEffect(() => {
    fetchGuildSettings(guildId)
      .then((res) => {
        if (res.success && res.data?.guild) {
          const disabled = res.data.guild.disabledModules ?? [];
          setEnabled(!disabled.map((m: string) => m.toLowerCase()).includes(normalizedModuleKey));
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'could not load'))
      .finally(() => setLoading(false));
  }, [guildId, normalizedModuleKey]);

  const handleToggle = async (value: boolean) => {
    const previous = enabled;
    setEnabled(value);
    setToggling(true);
    setError(null);
    try {
      await apiToggleModule(guildId, normalizedModuleKey, value);
      toast.success(value ? `${label} on` : `${label} off`);
    } catch (e) {
      setEnabled(previous);
      const msg = e instanceof Error ? e.message : 'could not save';
      const is404 = msg.includes('404') || msg.includes('Not Found') || msg.includes('not found');
      toast.error(is404 ? `module "${label}" not found` : msg);
      setError(is404 ? `route not found for module "${moduleKey}"` : msg);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <div>
      <div
        className="switch-row"
        style={{ border: '1px solid var(--line-soft)', padding: '0.7rem 0.8rem', marginBottom: 0 }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="switch-row__title">{label}</span>
            {enabled && <span className="tag">on</span>}
          </div>
          {description && <p className="switch-row__desc">{description}</p>}
        </div>
        {enabled !== null && <Toggle checked={enabled} onChange={handleToggle} disabled={toggling} label={`toggle ${label}`} />}
      </div>
      {error && <p className="caption" style={{ marginTop: '0.35rem', color: 'var(--error, var(--ink-dim))' }}>{error}</p>}
    </div>
  );
}
