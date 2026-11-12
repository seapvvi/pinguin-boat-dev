'use client';
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'pinguin-snowflakes';
const EVENT_NAME = 'pinguin-snowflakes-change';

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Motion layer hook. The halftone editorial system has no falling-text layer:
 * the only ambient motion is the hero loop and one-time fade-ins, so this
 * stays off by default and simply reports an inert state.
 */
export function useSnowflakes() {
  const [enabled, setEnabled] = useState(readEnabled);

  useEffect(() => {
    const sync = () => setEnabled(readEnabled());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      window.dispatchEvent(new Event(EVENT_NAME));
      return next;
    });
  }, []);

  return { enabled, toggle };
}