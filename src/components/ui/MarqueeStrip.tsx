"use client";

import { motion } from "framer-motion";

interface MarqueeStripProps {
  items: string[];
  speed?: number;
  separator?: string;
  className?: string;
  variant?: "light" | "dark" | "gold";
}

export function MarqueeStrip({
  items,
  speed = 30,
  separator = "·",
  className = "",
  variant = "dark",
}: MarqueeStripProps) {
  const bg =
    variant === "dark"
      ? "bg-aura-black border-y border-white/5"
      : variant === "gold"
      ? "bg-gold"
      : "bg-cream border-y border-black/5";

  const text =
    variant === "dark"
      ? "text-cream/30"
      : variant === "gold"
      ? "text-aura-black/60"
      : "text-aura-black/30";

  // Duplicate items so the marquee loops seamlessly
  const allItems = [...items, ...items, ...items, ...items];

  return (
    <div className={`relative overflow-hidden py-4 ${bg} ${className}`}>
      <motion.div
        className="flex items-center gap-6 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {allItems.map((item, i) => (
          <span key={i} className={`flex items-center gap-6 ${text}`}>
            <span className="text-label tracking-widest3">{item}</span>
            <span className={`${text} opacity-50`}>{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
