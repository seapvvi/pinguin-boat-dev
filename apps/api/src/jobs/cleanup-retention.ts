import { prisma } from "@pinguin/db";
import { RETENTION_RULES, retentionCutoff } from "../utils/retention";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * Deletes rows older than each table's retention window. Rows are dropped, not
 * archived: the dashboard only charts recent history and Postgres backups grow
 * with every audit/owner/metrics row.
 */
export async function pruneLogs(
  now: Date = new Date(),
): Promise<Record<string, number>> {
  const deleted: Record<string, number> = {};
  for (const rule of RETENTION_RULES) {
    const cutoff = retentionCutoff(rule.table, now);
    if (!cutoff) continue;
    const sql = `DELETE FROM "${rule.table}" WHERE "${rule.column}" < $1`;
    try {
      const count = await prisma.$executeRawUnsafe(sql, cutoff);
      deleted[rule.table] = count;
      if (count > 0)
        console.log(`[CLEANUP] ${count} ligne(s) de ${rule.table} purgée(s)`);
    } catch (err) {
      // Table may not exist yet on an older database: log and keep the others.
      console.error(`[CLEANUP] Purge de ${rule.table} impossible:`, err);
    }
  }
  return deleted;
}

export function startRetentionCleanup(): void {
  pruneLogs().catch((err) =>
    console.error("[CLEANUP] Purge initiale échouée:", err),
  );
  setInterval(() => {
    pruneLogs().catch((err) =>
      console.error("[CLEANUP] Purge de rétention échouée:", err),
    );
  }, SIX_HOURS_MS);
}
