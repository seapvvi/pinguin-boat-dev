const DAY_MS = 24 * 60 * 60 * 1000;

export interface RetentionRule {
  table: string;
  /** Column holding the row date. */
  column: string;
  defaultDays: number;
}

/**
 * Log tables that only grow. Charts read at most a few weeks back, so older
 * rows are deleted rather than archived to keep backups and indexes small.
 */
export const RETENTION_RULES: RetentionRule[] = [
  { table: "audit_logs", column: "created_at", defaultDays: 180 },
  { table: "owner_logs", column: "created_at", defaultDays: 365 },
  { table: "system_metrics_snapshots", column: "timestamp", defaultDays: 30 },
  { table: "music_history", column: "played_at", defaultDays: 180 },
];

/** `AUDIT_LOG_RETENTION_DAYS` style env key for a rule's table. */
export function retentionEnvKey(table: string): string {
  return `${table.toUpperCase()}_RETENTION_DAYS`;
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
