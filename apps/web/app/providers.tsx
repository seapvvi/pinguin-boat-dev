'use client';

import { useEffect, type ReactNode } from 'react';
import { LazyMotion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Fetch the animation engine as its own chunk: `m` components render their
// markup immediately and start animating once the feature bundle resolves.
const loadMotionFeatures = () => import('motion/react').then((mod) => mod.domAnimation);

export function Providers({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();

  // one-time fade-ins for every .js-fade block
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.js-fade'));
    if (nodes.length === 0) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [prefersReduced]);

  return <LazyMotion features={loadMotionFeatures}>{children}</LazyMotion>;
}