import { describe, it, expect } from "vitest";
import {
  RETENTION_RULES,
  retentionCutoff,
  retentionDays,
  retentionEnvKey,
} from "./retention";

describe("log retention", () => {
  it("uses the default window when nothing is configured", () => {
    expect(retentionDays("audit_logs", {})).toBe(180);
    expect(retentionDays("system_metrics_snapshots", {})).toBe(30);
  });

  it("honours an env override and the AUDIT_LOGS_... key format", () => {
    expect(retentionEnvKey("audit_logs")).toBe("AUDIT_LOGS_RETENTION_DAYS");
    expect(
      retentionDays("audit_logs", { AUDIT_LOGS_RETENTION_DAYS: "7" }),
    ).toBe(7);
  });

  it("disables pruning with 0, a negative or a non-numeric value", () => {
    expect(
      retentionDays("audit_logs", { AUDIT_LOGS_RETENTION_DAYS: "0" }),
    ).toBeNull();
    expect(
      retentionDays("audit_logs", { AUDIT_LOGS_RETENTION_DAYS: "-3" }),
    ).toBeNull();
    expect(
      retentionDays("audit_logs", { AUDIT_LOGS_RETENTION_DAYS: "abc" }),
    ).toBeNull();
    expect(
      retentionCutoff("owner_logs", new Date(), {
        OWNER_LOGS_RETENTION_DAYS: "0",
      }),
    ).toBeNull();
  });

  it("computes the cutoff back from now", () => {
    const now = new Date("2026-06-01T00:00:00Z");
    expect(
      retentionCutoff("system_metrics_snapshots", now, {})?.toISOString(),
    ).toBe("2026-05-02T00:00:00.000Z");
    expect(new Set(RETENTION_RULES.map((r) => r.table)).size).toBe(
      RETENTION_RULES.length,
    );
  });
});
