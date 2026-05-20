/**
 * Design System v2 — DecisionVault
 * "A cinematic operating system for mastering judgment and decision intelligence."
 *
 * Tokens are intentionally restrained: deep graphite + midnight navy base,
 * one electric blue accent, occasional violet/cyan/silver. No neon excess.
 */

// Cinematic easing curves — every animation should pick one of these.
export const EASING = {
  // Apple/Linear-style smooth deceleration
  cinematic: [0.16, 1, 0.3, 1] as const,
  // Stripe-style gentle ease
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  // Soft overshoot for tactile pops
  snap: [0.34, 1.56, 0.64, 1] as const,
  // Subtle settling
  settle: [0.2, 0.8, 0.2, 1] as const,
  easeOut: 'easeOut' as const,
};

// Motion springs — physical, layered timing
export const SPRING = {
  // Default smooth interactive spring
  smooth: { type: 'spring' as const, stiffness: 220, damping: 28, mass: 0.9 },
  // Gentle, almost glide
  gentle: { type: 'spring' as const, stiffness: 140, damping: 24, mass: 1 },
  // Tactile button press
  tactile: { type: 'spring' as const, stiffness: 360, damping: 26, mass: 0.7 },
  // Cinematic reveal — slow, weighty
  cinematic: { type: 'spring' as const, stiffness: 110, damping: 22, mass: 1.1 },
};

export const DURATION = {
  fast: 0.2,
  normal: 0.35,
  slow: 0.55,
  cinematic: 0.85,
  epic: 1.2,
  page: 0.4,
};

export const STAGGER = {
  fast: 0.04,
  normal: 0.07,
  slow: 0.12,
  cinematic: 0.18,
};

// Refined palette — narrow, intentional, premium
export const COLORS = {
  // Base graphite + midnight navy
  void: '#06080f',
  deep: '#0a0e17',
  surface: '#0f141c',
  surfaceRaised: '#131a25',
  surfaceElevated: '#1a2230',
  surfaceFloating: '#1f2838',

  // Text — soft white through silver gray to deep ink
  ink: '#f0f2f5',
  inkBright: '#ffffff',
  inkDim: '#8a919c',
  inkFaint: '#4a5568',
  inkGhost: '#2a3243',

  // Primary accent — muted electric blue
  accent: '#6b8afe',
  accentSoft: '#8ba4ff',
  accentDeep: '#4a6ce0',

  // Secondary accents — used sparingly to guide focus
  violet: '#a78bfa',
  cyan: '#5eead4',
  silver: '#c8cdd4',
  warmSilver: '#d4d0c8',

  // Semantic
  emerald: '#34d399',
  rose: '#fb7185',
  amber: '#fbbf24',
} as const;

// Layered shadow ramp — realistic depth, volumetric
export const SHADOWS = {
  // No shadow
  flat: 'none',
  // Subtle resting elevation
  e1: '0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.18)',
  // Card surface
  e2: '0 1px 2px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
  // Raised panel
  e3: '0 2px 4px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
  // Floating element (modal, popover)
  e4: '0 4px 12px rgba(0,0,0,0.4), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
  // Card hover lift
  cardHover: '0 0 0 1px rgba(107,138,254,0.08), 0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
  // Atmospheric accent glow — used sparingly
  glow: '0 0 24px rgba(107,138,254,0.10), 0 0 64px rgba(107,138,254,0.04)',
  glowStrong: '0 0 40px rgba(107,138,254,0.18), 0 0 100px rgba(107,138,254,0.06)',
  // Buttons
  button: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(107,138,254,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
  buttonHover: '0 2px 4px rgba(0,0,0,0.35), 0 16px 40px rgba(107,138,254,0.28), inset 0 1px 0 rgba(255,255,255,0.3)',
  fab: '0 8px 24px rgba(0,0,0,0.4), 0 0 40px rgba(107,138,254,0.28), inset 0 1px 0 rgba(255,255,255,0.3)',
} as const;

// Type scale — editorial, generous, confident
export const TYPE = {
  // Editorial display (hero moments)
  displayXL: 'text-[44px] sm:text-6xl md:text-7xl lg:text-[88px]',
  displayLG: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  displayMD: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  displaySM: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  // Headings
  h1: 'text-3xl sm:text-4xl md:text-5xl',
  h2: 'text-2xl sm:text-3xl md:text-4xl',
  h3: 'text-xl sm:text-2xl md:text-3xl',
  h4: 'text-lg sm:text-xl',
  // Body
  body: 'text-base',
  bodySm: 'text-sm',
  caption: 'text-xs',
  // Kicker / eyebrow
  kicker: 'text-[10px] font-medium uppercase tracking-[0.28em]',
  kickerLg: 'text-xs font-medium uppercase tracking-[0.32em]',
} as const;

// Spatial rhythm — generous breathing room
export const SPACING = {
  sectionY: 'py-24 sm:py-32 lg:py-40',
  sectionYSm: 'py-16 sm:py-20 lg:py-24',
  containerX: 'px-5 sm:px-8 lg:px-12',
  maxW: 'max-w-7xl mx-auto',
  maxWNarrow: 'max-w-5xl mx-auto',
  maxWProse: 'max-w-2xl mx-auto',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Z-index ramp
export const Z = {
  base: 0,
  raised: 10,
  sticky: 20,
  fab: 30,
  nav: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
  cursor: 9999,
} as const;
