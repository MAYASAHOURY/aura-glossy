"use client";

import { motion } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { fadeUp, fadeRight, lineGrow, ease } from "@/lib/animations";

export function StyleIdentity({ aesthetic }: { aesthetic: Aesthetic }) {
  return (
    <section className="bg-aura-black py-28 md:py-40 px-8 md:px-16 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left: The statement */}
          <div>
            <ScrollReveal variants={fadeRight} delay={0.05}>
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  className="h-px w-8"
                  style={{ backgroundColor: aesthetic.accentColor }}
                  variants={lineGrow}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
                <p className="text-label" style={{ color: aesthetic.accentColor }}>
                  Aesthetic Identity
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2
                className="font-cormorant text-cream font-light leading-[0.92]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}
              >
                What is{" "}
                <em className="italic" style={{ color: aesthetic.accentColor + "CC" }}>
                  {aesthetic.name}?
                </em>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="mt-10">
              <p className="text-body text-cream/55 text-base md:text-lg leading-relaxed max-w-md">
                {aesthetic.longDescription}
              </p>
            </ScrollReveal>

            {/* Color palette swatches */}
            <ScrollReveal delay={0.35} className="mt-10">
              <p className="text-label text-cream/30 mb-4" style={{ fontSize: "0.6rem" }}>
                Palette
              </p>
              <div className="flex gap-2">
                {aesthetic.colorPalette.map((color, i) => (
                  <motion.div
                    key={color}
                    className="w-8 h-8 rounded-full border border-white/10"
                    style={{ backgroundColor: color }}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.07, ease }}
                    title={color}
                  />
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Mood words + style rules */}
          <div>
            {/* Mood words — large typographic */}
            <ScrollReveal delay={0.15} className="mb-16">
              <div className="grid grid-cols-2 gap-3">
                {aesthetic.moodWords.map((word, i) => (
                  <motion.div
                    key={word}
                    className="border border-white/6 px-5 py-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease }}
                  >
                    <p
                      className="font-cormorant italic text-cream/40 leading-none"
                      style={{ fontSize: "clamp(1.2rem, 2vw, 1.8rem)" }}
                    >
                      {word}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>

            {/* Style rules */}
            <ScrollReveal delay={0.2}>
              <p className="text-label text-cream/30 mb-5" style={{ fontSize: "0.6rem" }}>
                The Rules
              </p>
              <StaggerReveal stagger={0.08} delay={0.3}>
                {aesthetic.styleRules.map((rule, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 mb-4"
                    variants={fadeUp}
                  >
                    <span
                      className="font-cormorant italic text-xl mt-0.5 flex-shrink-0"
                      style={{ color: aesthetic.accentColor + "80" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-body text-cream/50 text-sm leading-relaxed">{rule}</p>
                  </motion.div>
                ))}
              </StaggerReveal>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
