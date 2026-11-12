'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface InviteBotButtonProps {
  guildId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function InviteBotButton({ guildId, className, children }: InviteBotButtonProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const q = guildId ? `?guild_id=${guildId}` : '';
    api
      .get<{ success: boolean; data: { url: string } }>(`/api/bot/invite${q}`)
      .then((res) => {
        const invite = (res as { data?: { url: string } }).data?.url;
        if (invite) setUrl(invite);
      })
      .catch(() => {});
  }, [guildId]);

  if (!url) {
    return (
      <span className={className ?? 'btn'} aria-disabled="true" style={{ opacity: 0.5 }}>
        loading…
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? 'btn'}
    >
      {children ?? 'invite the bot'}
    </a>
  );
}