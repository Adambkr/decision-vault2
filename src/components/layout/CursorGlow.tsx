import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsTouchDevice } from '@/hooks/useMediaQuery';

/**
 * Cursor glow — soft ambient light that follows the cursor with a lerp.
 * The lag creates a luxurious "trailing aura" feel rather than a tracking spotlight.
 *
 * Optimized: pauses the rAF loop when the mouse is stationary to save battery
 * and avoid unnecessary compositor work.
 */
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isTouchDevice = useIsTouchDevice();
  const visibleRef = useRef(false);
  const targetPos = useRef({ x: -500, y: -500 });
  const currentPos = useRef({ x: -500, y: -500 });
  const rafRef = useRef<number | null>(null);
  const lastMoveTime = useRef(0);
  const isRunning = useRef(false);

  useEffect(() => {
    if (isTouchDevice) return;

    const glow = glowRef.current;
    if (!glow) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Snap to target when very close to avoid micro-lerp forever
      if (dist < 0.5) {
        currentPos.current.x = targetPos.current.x;
        currentPos.current.y = targetPos.current.y;
      } else {
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.15);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.15);
      }

      glow.style.transform = `translate3d(${currentPos.current.x - 200}px, ${currentPos.current.y - 200}px, 0)`;

      const timeSinceMove = performance.now() - lastMoveTime.current;
      // Stop rAF if mouse hasn't moved for 120ms and we're close to target
      if (timeSinceMove > 120 && dist < 2) {
        isRunning.current = false;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isRunning.current) return;
      isRunning.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
      lastMoveTime.current = performance.now();

      if (!visibleRef.current) {
        visibleRef.current = true;
        glow.style.opacity = '1';
        currentPos.current.x = e.clientX;
        currentPos.current.y = e.clientY;
      }
      startLoop();
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      glow.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      isRunning.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isTouchDevice]);

  useEffect(() => {
    visibleRef.current = false;
    if (glowRef.current) glowRef.current.style.opacity = '0';
  }, [location]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-[9999] rounded-full hidden lg:block cursor-glow"
      style={{
        width: 400,
        height: 400,
        top: 0,
        left: 0,
        opacity: 0,
        background:
          'radial-gradient(circle, rgba(107,138,254,0.07) 0%, rgba(107,138,254,0.025) 30%, transparent 70%)',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        mixBlendMode: 'screen',
      }}
    />
  );
}

