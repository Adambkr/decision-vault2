/**
 * Motion primitives — cinematic, spring-based, layered.
 *
 * Every component should pull its variants from here.
 * This enforces a unified motion language across DecisionVault.
 */

import type { Transition, Variants } from 'motion/react';
import { EASING, DURATION } from './constants';

/* ───────────── Transitions ───────────── */

export const TRANSITION = {
  fast: { duration: DURATION.fast, ease: EASING.cinematic } as Transition,
  normal: { duration: DURATION.normal, ease: EASING.cinematic } as Transition,
  slow: { duration: DURATION.slow, ease: EASING.cinematic } as Transition,
  cinematic: { duration: DURATION.cinematic, ease: EASING.cinematic } as Transition,
  smooth: { duration: DURATION.slow, ease: EASING.smooth } as Transition,

  // Spring physics — physical, layered feel
  spring: { type: 'spring', stiffness: 220, damping: 28, mass: 0.9 } as Transition,
  springGentle: { type: 'spring', stiffness: 140, damping: 24, mass: 1 } as Transition,
  springTactile: { type: 'spring', stiffness: 360, damping: 26, mass: 0.7 } as Transition,
  springCinematic: { type: 'spring', stiffness: 110, damping: 22, mass: 1.1 } as Transition,
};

/* ───────────── Reveal variants ───────────── */

// Fade up with blur — the signature DecisionVault reveal
export const reveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)', willChange: 'transform, opacity, filter' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    willChange: 'auto',
    transition: { duration: DURATION.cinematic, ease: EASING.cinematic },
  },
};

// Subtle fade up — for inline content, less dramatic
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, willChange: 'transform, opacity' },
  visible: {
    opacity: 1,
    y: 0,
    willChange: 'auto',
    transition: { duration: DURATION.slow, ease: EASING.cinematic },
  },
};

// Fade in — pure opacity
export const fade: Variants = {
  hidden: { opacity: 0, willChange: 'opacity' },
  visible: { opacity: 1, willChange: 'auto', transition: { duration: DURATION.slow, ease: EASING.cinematic } },
};

// Scale + fade — for orbs, hero elements
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, filter: 'blur(8px)', willChange: 'transform, opacity, filter' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    willChange: 'auto',
    transition: { duration: DURATION.epic, ease: EASING.cinematic },
  },
};

// Slide from left
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -24, willChange: 'transform, opacity' },
  visible: { opacity: 1, x: 0, willChange: 'auto', transition: { duration: DURATION.cinematic, ease: EASING.cinematic } },
};

// Slide from right
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 24, willChange: 'transform, opacity' },
  visible: { opacity: 1, x: 0, willChange: 'auto', transition: { duration: DURATION.cinematic, ease: EASING.cinematic } },
};

/* ───────────── Stagger containers ───────────── */

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

export const staggerContainerFast = staggerContainer(0.05);
export const staggerContainerSlow = staggerContainer(0.14);

/* ───────────── Page transitions ───────────── */

export const pageTransition = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: DURATION.page, ease: EASING.cinematic },
};

/* ───────────── Interaction variants ───────────── */

// Tactile button — soft scale on tap
export const tactile = {
  whileTap: { scale: 0.97 },
  transition: TRANSITION.springTactile,
};

// Magnetic hover — to be combined with onMouseMove
export const magneticHover = {
  whileHover: { scale: 1.02 },
  transition: TRANSITION.springGentle,
};

/* ───────────── Helper: reduced-motion safe ───────────── */

// Wrap a variant set so it becomes instant when prefers-reduced-motion is on.
export function reduced(prefersReduced: boolean, variants: Variants): Variants {
  if (!prefersReduced) return variants;
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.01 } },
  };
}
