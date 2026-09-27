import type { Transition, Variants } from "motion/react";

/**
 * Shared motion design tokens and transition presets for SPA Ajibade & Co.
 * Reusable across all interactive micro-animations.
 */
export const EASINGS = {
  easeOut: [0.22, 1, 0.36, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  fastOut: [0.16, 1, 0.3, 1] as const,
} as const;

export const DURATIONS = {
  fast: 0.1, // ~100ms for taps
  normal: 0.18, // ~180ms for hovers
  medium: 0.3, // ~300ms for dropdowns/tabs
  slow: 0.45, // ~450ms for staggered entrances
} as const;

export const TRANSITIONS = {
  hover: {
    duration: DURATIONS.normal,
    ease: EASINGS.easeOut,
  } satisfies Transition,
  tap: {
    duration: DURATIONS.fast,
    ease: "easeOut",
  } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 28,
  } satisfies Transition,
  smooth: {
    duration: DURATIONS.medium,
    ease: EASINGS.easeOut,
  } satisfies Transition,
  entrance: {
    duration: DURATIONS.slow,
    ease: EASINGS.easeOut,
  } satisfies Transition,
} as const;

/** Interaction presets for interactive UI elements */
export const INTERACTION = {
  button: {
    whileHover: { scale: 1.025 },
    whileTap: { scale: 0.96 },
    transition: TRANSITIONS.hover,
  },
  pill: {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.95 },
    transition: TRANSITIONS.hover,
  },
  iconButton: {
    whileHover: { scale: 1.08 },
    whileTap: { scale: 0.92 },
    transition: TRANSITIONS.hover,
  },
  card: {
    whileHover: {
      y: -4,
      transition: TRANSITIONS.hover,
    },
    whileTap: {
      scale: 0.985,
      transition: TRANSITIONS.tap,
    },
  },
  clickableItem: {
    whileHover: { x: 3 },
    whileTap: { scale: 0.98 },
    transition: TRANSITIONS.hover,
  },
  chip: {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.95 },
    transition: TRANSITIONS.hover,
  },
} as const;

/** Stagger container & item variants for lists and grids */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.entrance,
  },
};

export const staggerScaleItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.smooth,
  },
};

/** Accordion expand/collapse variants */
export const accordionPanelVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: EASINGS.easeOut },
      opacity: { duration: 0.15 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.35, ease: EASINGS.easeOut },
      opacity: { duration: 0.25, delay: 0.05 },
    },
  },
};

/** Dropdown menu entrance/exit variants */
export const dropdownMenuVariants: Variants = {
  initial: { opacity: 0, y: 6, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.96,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

/** Tab content switch variants */
export const tabContentVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Dialog modal entrance/exit variants */
export const modalDialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASINGS.easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};
