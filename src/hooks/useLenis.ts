import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Cinematic smooth scroll via Lenis.
 *
 * Lazy-instantiates Lenis on mount, drives its RAF, and tears down cleanly.
 * Respects prefers-reduced-motion (skips entirely) and skips on coarse pointers
 * (mobile/touch) where native momentum scrolling feels better than synthetic easing.
 *
 * Use once per page. Returns the Lenis instance ref for advanced use cases.
 */
export function useLenis(options?: { enabled?: boolean }) {
  const lenisRef = useRef<Lenis | null>(null);
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    // Respect reduced motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Skip on touch / coarse-pointer devices — native scroll feels better there
    const isCoarse =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)').matches;
    if (isCoarse) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      smoothWheel: true,
      orientation: 'vertical',
    });

    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
