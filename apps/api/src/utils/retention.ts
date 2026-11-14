const DAY_MS = 24 * 60 * 60 * 1000;

export interface RetentionRule {
  /** Physical table name in Postgres. */
  table: string;
  /** Column holding the row date. */
  column: string;
  defaultDays: number;
  /**
   * Env key overriding the derived `<TABLE>_RETENTION_DAYS`. Needed when the
   * table name and the documented env key disagree (e.g. `music_history_entries`
   * is configured through `MUSIC_HISTORY_RETENTION_DAYS`).
   */
  envKey?: string;
}

/**
 * Log tables that only grow. Charts read at most a few weeks back, so older
 * rows are deleted rather than archived to keep backups and indexes small.
 */
export const RETENTION_RULES: RetentionRule[] = [
  { table: "audit_logs", column: "created_at", defaultDays: 180 },
  { table: "owner_logs", column: "created_at", defaultDays: 365 },
  { table: "system_metrics_snapshots", column: "timestamp", defaultDays: 30 },
  {
    table: "music_history_entries",
    column: "played_at",
    defaultDays: 180,
    envKey: "MUSIC_HISTORY_RETENTION_DAYS",
  },
];

/** `AUDIT_LOG_RETENTION_DAYS` style env key for a rule's table. */
export function retentionEnvKey(table: string): string {
  const rule = RETENTION_RULES.find((r) => r.table === table);
  return rule?.envKey ?? `${table.toUpperCase()}_RETENTION_DAYS`;
}

/** Days to keep for a table; `0` or a negative value disables pruning. */
export function retentionDays(
  table: string,
  env: Record<string, string | undefined> = process.env,
): number | null {
  const rule = RETENTION_RULES.find((r) => r.table === table);
  if (!rule) return null;
  const raw = env[retentionEnvKey(table)];
  const parsed =
    raw === undefined || raw === "" ? rule.defaultDays : Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/** Rows older than the cutoff are deleted; also returns the cutoff for logging. */
export function retentionCutoff(
  table: string,
  now: Date = new Date(),
  env: Record<string, string | undefined> = process.env,
): Date | null {
  const days = retentionDays(table, env);
  return days === null ? null : new Date(now.getTime() - days * DAY_MS);
}
