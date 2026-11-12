/**
 * Registry for background intervals so shutdown can stop them deterministically
 * instead of relying on `process.exit` to tear the event loop down.
 */
const intervals = new Set<NodeJS.Timeout>();

export function startManagedInterval(
  callback: (...args: unknown[]) => void,
  ms: number
): NodeJS.Timeout {
  const id = setInterval(callback, ms);
  // Do not keep the process alive solely for a background job.
  id.unref?.();
  intervals.add(id);
  return id;
}

export function stopManagedInterval(id: NodeJS.Timeout): void {
  clearInterval(id);
  intervals.delete(id);
}

export function clearManagedIntervals(): void {
  for (const id of intervals) clearInterval(id);
  intervals.clear();
}