"use client";

import { motion } from "framer-motion";

interface FashionQuoteProps {
  text: string;
  author: string;
  variant?: "light" | "dark";
}

export function FashionQuote({ text, author, variant = "dark" }: FashionQuoteProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`relative py-24 md:py-36 px-8 overflow-hidden ${
        isDark ? "bg-aura-black" : "bg-cream"
      }`}
    >
      {/* Decorative large quotation mark */}
      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 font-cormorant text-[20rem] leading-none select-none pointer-events-none ${
          isDark ? "text-white/[0.03]" : "text-aura-black/[0.04]"
        }`}
      >
        &ldquo;
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Decorative line */}
        <motion.div
          className={`h-px mx-auto mb-10 ${isDark ? "bg-gold/50" : "bg-aura-black/20"}`}
          style={{ width: "3rem", transformOrigin: "center" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />

        {/* Quote text */}
        <motion.blockquote
          className={`font-cormorant italic font-light leading-tight ${
            isDark ? "text-cream" : "text-aura-black"
          }`}
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          &ldquo;{text}&rdquo;
        </motion.blockquote>

        {/* Author */}
        <motion.p
          className={`text-label mt-8 ${isDark ? "text-cream/40" : "text-aura-black/40"}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          — {author}
        </motion.p>

        {/* Decorative bottom line */}
        <motion.div
          className={`h-px mx-auto mt-10 ${isDark ? "bg-gold/50" : "bg-aura-black/20"}`}
          style={{ width: "3rem", transformOrigin: "center" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </div>
    </section>
  );
}
