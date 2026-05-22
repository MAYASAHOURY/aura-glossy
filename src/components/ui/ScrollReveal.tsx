"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface ScrollRevealProps {
  children: React.ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  once?: boolean;
  margin?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function ScrollReveal({
  children,
  variants = fadeUp,
  delay = 0,
  className = "",
  once = true,
  margin = "-80px",
}: ScrollRevealProps) {
  const mergedVariants: Variants = {
    hidden: variants.hidden!,
    visible: {
      ...(variants.visible as object),
      transition: {
        ...((variants.visible as { transition?: object })?.transition ?? {}),
        delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={mergedVariants}
    >
      {children}
    </motion.div>
  );
}

// Stagger container — animates children with sequential delay
interface StaggerProps {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
  once?: boolean;
  margin?: string;
}

export function StaggerReveal({
  children,
  delay = 0.05,
  stagger = 0.1,
  className = "",
  once = true,
  margin = "-80px",
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
