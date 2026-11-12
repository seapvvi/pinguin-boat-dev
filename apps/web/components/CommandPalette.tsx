"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchGuilds } from "@/lib/api";
import type { GuildItemDTO } from "@pinguin/shared";
import { filterEntries, type FuzzyEntry } from "@/lib/fuzzy";

interface CommandPaletteProps {
  isOwner: boolean;
  guideId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Entry = FuzzyEntry;

const PAGES: Array<{ label: string; href: string; guild?: boolean }> = [
  { label: "dashboard", href: "/dashboard" },
  { label: "servers", href: "/servers" },
  { label: "moderation", href: "/moderation", guild: true },
  { label: "automod", href: "/automod", guild: true },
  { label: "protection", href: "/protection", guild: true },
  { label: "tickets", href: "/tickets", guild: true },
  { label: "logs", href: "/logs", guild: true },
  { label: "music", href: "/music", guild: true },
  { label: "levels", href: "/levels", guild: true },
  { label: "economy", href: "/economy", guild: true },
  { label: "giveaways", href: "/giveaways", guild: true },
  { label: "polls", href: "/polls", guild: true },
  { label: "suggestions", href: "/suggestions", guild: true },
  { label: "welcome", href: "/welcome", guild: true },
  { label: "autoroles", href: "/autoroles", guild: true },
  { label: "embeds", href: "/embeds", guild: true },
  { label: "settings", href: "/settings", guild: true },
  { label: "commands", href: "/commands" },
  { label: "support us", href: "/soutien" },
];

const OWNER_PAGES: Array<{ label: string; href: string }> = [
  { label: "owner · overview", href: "/owner" },
  { label: "owner · servers", href: "/owner/servers" },
  { label: "owner · users", href: "/owner/users" },
  { label: "owner · 2fa", href: "/owner/2fa" },
  { label: "owner · logs", href: "/owner/logs" },
];

const RECENT_KEY = "pinguin:recent-servers";

function readRecents(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

/** Remembers servers the user switches to, so recents lead the palette. */
export function rememberServer(guildId: string): void {
  try {
    const next = [
      guildId,
      ...readRecents().filter((id) => id !== guildId),
    ].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // private mode / storage full: recents are a nicety, never an error
  }
}

export default function CommandPalette({
  isOwner,
  guideId,
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [guilds, setGuilds] = useState<GuildItemDTO[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setRecents(readRecents());
    const timer = setTimeout(() => inputRef.current?.focus(), 0);
    if (guilds.length === 0) {
      fetchGuilds()
        .then((res) => {
          if (res.success && res.data) setGuilds(res.data.guilds ?? []);
        })
        .catch(() => undefined);
    }
    return () => clearTimeout(timer);
  }, [open, guilds.length]);

  const entries = useMemo<Entry[]>(() => {
    const rank = (id: string) => {
      const idx = recents.indexOf(id);
      return idx === -1 ? 99 : idx;
    };
    const serverEntries = [...guilds]
      .sort((a, b) => rank(a.id) - rank(b.id))
      .map<Entry>((g) => ({
        id: `server:${g.id}`,
        label: g.name,
        group: "servers",
        href: `/servers/${g.id}`,
        hint: g.botPresent ? `· ${g.memberCount} members` : "· bot absent",
        keywords: g.id,
      }));
    const pageEntries = PAGES.map<Entry>((p) => {
      const href = p.guild
        ? guideId
          ? `/servers/${guideId}${p.href}`
          : `/servers?redirect=${encodeURIComponent(p.href)}`
        : p.href;
      return { id: `page:${p.href}`, label: p.label, group: "pages", href };
    });
    const ownerEntries = isOwner
      ? OWNER_PAGES.map<Entry>((p) => ({
          id: `owner:${p.href}`,
          label: p.label,
          group: "actions",
          href: p.href,
        }))
      : [];
    return [...serverEntries, ...pageEntries, ...ownerEntries];
  }, [guilds, recents, guideId, isOwner]);

  const results = useMemo(
    () => filterEntries(entries, query),
    [entries, query],
  );

  const go = useCallback(
    (entry: Entry) => {
      if (entry.group === "servers")
        rememberServer(entry.id.replace("server:", ""));
      onOpenChange(false);
      router.push(entry.href);
    },
    [router, onOpenChange],
  );

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const groups: Entry["group"][] = ["servers", "pages", "actions"];

  return (
    <div className="cmd-backdrop" onClick={() => onOpenChange(false)}>
      <div
        className="cmd-palette"
        role="dialog"
        aria-modal="true"
        aria-label="command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          // Keep focus inside the dialog while it is open.
          if (e.key === "Tab") e.preventDefault();
        }}
      >
        <input
          ref={inputRef}
          className="cmd-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          placeholder="jump to a server, a page…"
          aria-label="search servers and pages"
          aria-controls="cmd-results"
          aria-activedescendant={
            results[active] ? `cmd-${results[active].id}` : undefined
          }
          role="combobox"
          aria-expanded="true"
        />
        <ul
          id="cmd-results"
          className="cmd-results"
          role="listbox"
          ref={listRef}
        >
          {results.length === 0 && <li className="cmd-empty">no match</li>}
          {groups.map((group) => {
            const rows = results.filter((r) => r.group === group);
            if (rows.length === 0) return null;
            return (
              <li key={group} role="presentation">
                <p className="cmd-group" aria-hidden="true">
                  {group}
                </p>
                <ul role="presentation">
                  {rows.map((entry) => {
                    const index = results.indexOf(entry);
                    return (
                      <li key={entry.id} role="presentation">
                        <button
                          id={`cmd-${entry.id}`}
                          role="option"
                          aria-selected={index === active}
                          data-index={index}
                          className={
                            index === active ? "cmd-item is-active" : "cmd-item"
                          }
                          onMouseEnter={() => setActive(index)}
                          onClick={() => go(entry)}
                        >
                          <span>{entry.label}</span>
                          {entry.hint && (
                            <span className="cmd-hint">{entry.hint}</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
        <p className="cmd-foot caption">↑↓ navigate · ↵ open · esc close</p>
      </div>
    </div>
  );
}
