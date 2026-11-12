'use client';

import { useEffect, useState } from 'react';
import { setPreview } from '@pinguin/ui';
import { getUser } from './auth';
import { DEMO_USER } from './demo';

// True while the dashboard runs on sample data (no discord session), so write
// actions can be disabled instead of failing against the api.
let preview = false;

function sync(value: boolean) {
  preview = value;
  setPreview(value);
}

export function isPreview(): boolean {
  return preview;
}

export function usePreview(): boolean {
  const [value, setValue] = useState(preview);

  useEffect(() => {
    let cancelled = false;
    getUser().then((u) => {
      sync(Boolean(u && u.id === DEMO_USER.id));
      if (!cancelled) setValue(preview);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return value;
}
