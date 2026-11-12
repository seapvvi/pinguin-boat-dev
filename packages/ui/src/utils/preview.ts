// When the dashboard runs on sample data (no session), write controls are
// disabled instead of failing against the api.
let preview = false;
const listeners = new Set<(value: boolean) => void>();

export function setPreview(value: boolean) {
  if (preview === value) return;
  preview = value;
  listeners.forEach((fn) => fn(value));
}

export function getPreview(): boolean {
  return preview;
}

export function subscribePreview(fn: (value: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
