'use client';

import { useEffect, useState, useRef } from 'react';

export interface PopupData {
  message: string;
  duration: number;
  createdAt?: number;
}

interface UseSSEOptions {
  onPopup?: (popup: PopupData) => void;
}

interface UseSSEResult {
  popup: PopupData | null;
}

export function useSSE(options?: UseSSEOptions & { enabled?: boolean }): UseSSEResult {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const onPopupRef = useRef(options?.onPopup);
  onPopupRef.current = options?.onPopup;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let source: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const open = () => {
      source = new EventSource('/api/owner/events', { withCredentials: true });

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as PopupData;
          setPopup(data);
          onPopupRef.current?.(data);
        } catch {
          /* ignore malformed events */
        }
      };

      source.onerror = () => {
        source?.close();
        source = null;
        // stop retrying while the tab is hidden; visibilitychange reconnects
        if (!document.hidden) retry = setTimeout(open, 3000);
      };
    };

    const close = () => {
      if (retry) clearTimeout(retry);
      retry = null;
      source?.close();
      source = null;
    };

    if (!document.hidden) open();
    const onVisibility = () => {
      if (document.hidden) close();
      else if (!source) open();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      close();
    };
  }, [enabled]);

  return { popup };
}
