"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], ["0%", "-8%"]);

  return (
    <section
      ref={ref}
      className="relative h-[100dvh] min-h-[700px] overflow-hidden bg-aura-black"
    >
      {/* Parallax image */}
      <motion.div className="absolute inset-0 scale-110" style={{ y: imageY }}>
        <Image
          src="/images/classic/hero.jpg"
          alt="Aura editorial hero"
          fill
          className="object-cover object-center opacity-55"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Layered gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-aura-black/40 via-transparent to-aura-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-aura-black/30 via-transparent to-transparent" />

      {/* Grain overlay for film texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Hero content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Editorial eyebrow */}
        <motion.p
          className="text-label text-cream/50 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Fashion · Identity · Discovery
        </motion.p>

        {/* Main headline */}
        <motion.h1
          className="font-cormorant text-cream font-light leading-[0.92] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3.5rem, 11vw, 10rem)" }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Discover Your
          <br />
          <em className="italic text-cream">Aesthetic</em>
        </motion.h1>

        {/* Gold divider */}
        <motion.div
          className="h-px bg-gold mt-10 mb-9"
          style={{ width: "4rem", transformOrigin: "left" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
        />

        {/* Subtext */}
        <motion.p
          className="text-body text-cream/60 text-base md:text-lg max-w-sm md:max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.7 }}
        >
          Explore curated fashion worlds. Find the aesthetic that speaks to your soul.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="#aesthetics"
            className="group flex items-center gap-3 text-label text-cream border border-cream/25 px-8 py-4 hover:bg-cream hover:text-aura-black hover:border-cream transition-all duration-500"
          >
            Begin Exploring
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/quiz"
            className="text-label text-cream/45 hover:text-cream transition-colors duration-300 underline underline-offset-4 decoration-cream/20 hover:decoration-cream"
          >
            Take the Style Quiz
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.8 }}
      >
        <p className="text-label text-cream/30" style={{ fontSize: "0.6rem" }}>
          Scroll
        </p>
        <motion.div
          className="w-px h-14 bg-gradient-to-b from-cream/30 to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
