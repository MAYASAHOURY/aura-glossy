"use client";

import { motion } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { fadeUp, ease } from "@/lib/animations";
import Link from "next/link";

export function StyleGuide({ aesthetic }: { aesthetic: Aesthetic }) {
  return (
    <section className="bg-aura-black py-28 px-8 md:px-16 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left: Capsule wardrobe essentials */}
          <div>
            <ScrollReveal delay={0.05}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-8" style={{ backgroundColor: aesthetic.accentColor }} />
                <p className="text-label" style={{ color: aesthetic.accentColor }}>
                  The Capsule
                </p>
              </div>
              <h2
                className="font-cormorant text-cream font-light mb-10"
                style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
              >
                Your{" "}
                <em className="italic" style={{ color: aesthetic.accentColor + "CC" }}>
                  Essentials
                </em>
              </h2>
            </ScrollReveal>

            <StaggerReveal stagger={0.09} delay={0.1}>
              {aesthetic.essentials.map((item, i) => (
                <motion.div
                  key={i}
                  className="group flex items-center gap-5 py-4 border-b border-white/5 cursor-default"
                  variants={fadeUp}
                >
                  <span
                    className="font-cormorant italic text-lg flex-shrink-0 transition-colors duration-300"
                    style={{ color: aesthetic.accentColor + "50" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-body text-cream/60 text-sm group-hover:text-cream/90 transition-colors duration-300">
                    {item}
                  </p>
                  <motion.div
                    className="ml-auto w-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: aesthetic.accentColor }}
                  />
                </motion.div>
              ))}
            </StaggerReveal>
          </div>

          {/* Right: AI stylist CTA + Related aesthetics */}
          <div>
            {/* AI Stylist CTA card */}
            <ScrollReveal delay={0.2} className="mb-10">
              <motion.div
                className="p-8 border border-white/8 relative overflow-hidden"
                whileHover={{ borderColor: aesthetic.accentColor + "40" }}
                transition={{ duration: 0.4 }}
              >
                {/* Accent glow */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 opacity-10 blur-3xl pointer-events-none"
                  style={{ backgroundColor: aesthetic.accentColor }}
                />

                <p className="text-label mb-4" style={{ color: aesthetic.accentColor }}>
                  AI Stylist
                </p>
                <h3
                  className="font-cormorant text-cream font-light mb-4"
                  style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)" }}
                >
                  Style advice,{" "}
                  <em className="italic">personalised</em>
                </h3>
                <p className="text-body text-cream/40 text-sm leading-relaxed mb-7">
                  Ask our AI stylist how to build a{" "}
                  <span className="text-cream/70">{aesthetic.name.toLowerCase()}</span> wardrobe,
                  find pieces that fit your budget, or get outfit suggestions for any occasion.
                </p>
                <Link
                  href="/stylist"
                  className="group inline-flex items-center gap-3 text-label text-cream/60 hover:text-cream transition-colors duration-300"
                >
                  Start a conversation
                  <svg
                    className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </ScrollReveal>

            {/* Moodboard CTA */}
            <ScrollReveal delay={0.3} className="mb-10">
              <motion.div
                className="p-8 border border-white/8"
                whileHover={{ borderColor: aesthetic.accentColor + "40" }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-label mb-3" style={{ color: aesthetic.accentColor }}>
                  Moodboard
                </p>
                <p className="text-body text-cream/40 text-sm mb-5">
                  Save this aesthetic to your personal moodboard and build your style vision.
                </p>
                <Link
                  href="/moodboard"
                  className="group inline-flex items-center gap-3 text-label text-cream/60 hover:text-cream transition-colors duration-300"
                >
                  Open Moodboard
                  <svg
                    className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </ScrollReveal>

            {/* Related aesthetics */}
            {aesthetic.relatedAesthetics.length > 0 && (
              <ScrollReveal delay={0.4}>
                <p className="text-label text-cream/30 mb-4" style={{ fontSize: "0.6rem" }}>
                  Related Aesthetics
                </p>
                <div className="flex gap-3">
                  {aesthetic.relatedAesthetics.map((id) => (
                    <Link
                      key={id}
                      href={`/aesthetic/${id}`}
                      className="text-label text-cream/50 hover:text-cream border border-white/10 hover:border-white/30 px-4 py-2 transition-all duration-300 capitalize"
                    >
                      {id.replace("-", " ")}
                    </Link>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
