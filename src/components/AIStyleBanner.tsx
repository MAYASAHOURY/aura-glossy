"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { fadeUp, staggerNormal, ease } from "@/lib/animations";

const features = [
  {
    icon: "✦",
    title: "Style Quiz",
    description: "Discover your aesthetic in five visual questions.",
    href: "/quiz",
  },
  {
    icon: "✦",
    title: "AI Stylist",
    description: "Personal style advice, any time, any question.",
    href: "/stylist",
  },
  {
    icon: "✦",
    title: "Moodboard",
    description: "Save inspiration and build your visual identity.",
    href: "/moodboard",
  },
];

export function AIStyleBanner() {
  return (
    <section className="bg-charcoal py-24 md:py-32 px-8 md:px-16 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04] blur-3xl rounded-full bg-gold pointer-events-none" />

      <div className="max-w-screen-xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <p className="text-label text-gold mb-5">The Full Experience</p>
          <h2
            className="font-cormorant text-cream font-light leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}
          >
            More than a website.
            <br />
            <em className="italic text-cream/50">A fashion universe.</em>
          </h2>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerNormal}
        >
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp}>
              <Link
                href={f.href}
                className="group block p-8 border border-white/6 hover:border-gold/30 transition-all duration-500 relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:to-transparent transition-all duration-700" />

                <p
                  className="text-label mb-5 transition-colors duration-300"
                  style={{ color: "#C4973B", fontSize: "0.8rem" }}
                >
                  {f.icon}
                </p>
                <h3
                  className="font-cormorant text-cream font-light mb-3 group-hover:text-gold transition-colors duration-300"
                  style={{ fontSize: "clamp(1.3rem, 2vw, 1.8rem)" }}
                >
                  {f.title}
                </h3>
                <p className="text-body text-cream/40 text-sm leading-relaxed mb-6">
                  {f.description}
                </p>
                <span className="text-label text-cream/35 group-hover:text-cream transition-colors duration-300 flex items-center gap-2">
                  Explore
                  <svg
                    className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
