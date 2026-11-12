'use client';
import React, { useRef, useEffect } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface Dot {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  sway: number;
  swaySpeed: number;
}

interface DriftingDotsProps {
  enabled?: boolean;
  count?: number;
}

/**
 * Ambient halftone drift: a sparse field of cream dots on the paper.
 * Off unless a donor toggles it, and never under reduced motion.
 */
export function Snowflakes({ enabled = false, count = 22 }: DriftingDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (!enabled || prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    dotsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.6 + 0.5,
      speed: Math.random() * 0.16 + 0.05,
      opacity: Math.random() * 0.16 + 0.05,
      sway: Math.random() * 30,
      swaySpeed: Math.random() * 0.005 + 0.002,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const dot of dotsRef.current) {
        dot.y += dot.speed;
        dot.x += Math.sin(dot.y * dot.swaySpeed) * 0.25;
        if (dot.y > canvas.height) {
          dot.y = -dot.size;
          dot.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 197, 181, ${dot.opacity})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, prefersReduced, count]);

  if (!enabled || prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}