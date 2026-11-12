/**
 * In-memory progressive lockout for the owner password prompt.
 *
 * A single owner password protects every destructive action, so brute force has
 * to be expensive even when the attacker controls the source IP (the dashboard
 * is reachable from any browser). Failures are tracked per owner user and per
 * IP; the lockout is per-process, which is sufficient for the single API
 * instance this deployment runs.
 */

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;
const LOCKOUT_MS = 5 * 60_000;

interface Attempt {
  failures: number;
  firstFailureAt: number;
  lockedUntil: number;
}

const attempts = new Map<string, Attempt>();

function keyFor(scope: string, id: string): string {
  return `${scope}:${id}`;
}

function prune(entry: Attempt): Attempt {
  const now = Date.now();
  if (entry.lockedUntil > now) return entry;
  if (now - entry.firstFailureAt > WINDOW_MS) {
    return { failures: 0, firstFailureAt: now, lockedUntil: 0 };
  }
  return entry;
}

/** Remaining lockout in milliseconds, 0 when the caller may try again. */
export function lockoutRemaining(userId: string, ip: string): number {
  const now = Date.now();
  const user = attempts.get(keyFor("user", userId));
  const byIp = attempts.get(keyFor("ip", ip));

  const userLocked =
    user && user.lockedUntil > now ? user.lockedUntil - now : 0;
  const ipLocked = byIp && byIp.lockedUntil > now ? byIp.lockedUntil - now : 0;

  return Math.max(userLocked, ipLocked);
}

/** Called when a lockout starts, so the owner can be alerted once (not per miss). */
let onLockout: ((info: { userId: string; ip: string }) => void) | null = null;

export function setLockoutListener(
  listener: (info: { userId: string; ip: string }) => void,
): void {
  onLockout = listener;
}

export function recordFailure(userId: string, ip: string): void {
  const now = Date.now();
  const wasLocked = lockoutRemaining(userId, ip) > 0;
  for (const [scope, id] of [
    ["user", userId],
    ["ip", ip],
  ] as const) {
    const key = keyFor(scope, id);
    const current = attempts.get(key);
    const base = current
      ? prune(current)
      : { failures: 0, firstFailureAt: now, lockedUntil: 0 };
    const failures = base.failures + 1;

    attempts.set(key, {
      failures,
      firstFailureAt: base.firstFailureAt,
      lockedUntil: failures >= MAX_FAILURES ? now + LOCKOUT_MS : 0,
    });
  }
  if (!wasLocked && lockoutRemaining(userId, ip) > 0) {
    onLockout?.({ userId, ip });
  }
}

export function recordSuccess(userId: string, ip: string): void {
  attempts.delete(keyFor("user", userId));
  attempts.delete(keyFor("ip", ip));
}

/** Test/maintenance helper. */
export function resetOwnerLockout(): void {
  attempts.clear();
}
