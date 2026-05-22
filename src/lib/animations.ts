import type { Variants } from "framer-motion";

export const ease = [0.16, 1, 0.3, 1] as const;
export const easeOut = [0.0, 0.0, 0.2, 1] as const;

// ─── Core variants ───────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease },
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease } },
};

// Clip-path reveal — image or block sweeps in from bottom
export const clipRevealUp: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: 1.1, ease },
  },
};

// Clip-path reveal — sweeps in from left
export const clipRevealLeft: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1.1, ease },
  },
};

// Line mask reveal — used for text lines
export const lineReveal: Variants = {
  hidden: { y: "105%" },
  visible: {
    y: "0%",
    transition: { duration: 0.8, ease },
  },
};

// Width expansion — used for decorative lines
export const lineGrow: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.9, ease },
  },
};

// ─── Stagger containers ────────────────────────────────────────
export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerNormal: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const staggerSlow: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } },
};

// ─── Card hover ────────────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, transition: { duration: 0.4, ease } },
  hover: { scale: 1.02, transition: { duration: 0.4, ease } },
};

// ─── Page transition ───────────────────────────────────────────
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease, staggerChildren: 0.1 },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.4 } },
};

// ─── Helpers ──────────────────────────────────────────────────
export function withDelay(
  variants: Variants,
  delay: number
): Variants {
  return {
    hidden: variants.hidden,
    visible: {
      ...(variants.visible as object),
      transition: {
        ...((variants.visible as { transition?: object })?.transition || {}),
        delay,
      },
    },
  };
}
