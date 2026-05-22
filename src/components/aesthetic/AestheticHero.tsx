"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";
import { ease } from "@/lib/animations";

export function AestheticHero({ aesthetic }: { aesthetic: Aesthetic }) {
  const ref = useRef<HTMLElement>(null);
  const [imgError, setImgError] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-6%"]);

  const nameParts = aesthetic.name.split(" ");
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(" ");

  return (
    <section
      ref={ref}
      className="relative h-[100dvh] min-h-[700px] overflow-hidden bg-aura-black"
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0 scale-[1.08]" style={{ y: imageY }}>
        {!imgError ? (
          <Image
            src={aesthetic.hero}
            alt={aesthetic.name}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, ${aesthetic.accentColor}40 0%, #0A0A0A 70%)`,
            }}
          />
        )}
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-aura-black/50 via-transparent to-aura-black/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-aura-black/40 via-transparent to-transparent" />
      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "150px",
        }}
      />

      {/* Back navigation */}
      <motion.div
        className="absolute top-28 left-8 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Link
          href="/#aesthetics"
          className="group flex items-center gap-2 text-label text-cream/40 hover:text-cream/80 transition-colors duration-300"
          style={{ fontSize: "0.6rem" }}
        >
          <svg
            className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          All Aesthetics
        </Link>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-start justify-end px-8 md:px-16 pb-20"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        {/* Tags */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease }}
        >
          {aesthetic.tags.map((tag) => (
            <span
              key={tag}
              className="text-label border px-3 py-1.5"
              style={{
                color: aesthetic.accentColor,
                borderColor: aesthetic.accentColor + "50",
                fontSize: "0.6rem",
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Aesthetic name */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            className="font-cormorant text-cream font-light leading-[0.88]"
            style={{ fontSize: "clamp(4rem, 13vw, 12rem)" }}
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.2, delay: 0.5, ease }}
          >
            {firstName}
          </motion.h1>
        </div>
        {restName && (
          <div className="overflow-hidden mb-5">
            <motion.h1
              className="font-cormorant text-cream/60 italic font-light leading-[0.88]"
              style={{ fontSize: "clamp(4rem, 13vw, 12rem)" }}
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.2, delay: 0.65, ease }}
            >
              {restName}
            </motion.h1>
          </div>
        )}

        {/* Gold line */}
        <motion.div
          className="h-px mb-5"
          style={{
            width: "3rem",
            backgroundColor: aesthetic.accentColor,
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 1.1 }}
        />

        {/* Tagline */}
        <motion.p
          className="font-cormorant text-cream/60 italic"
          style={{ fontSize: "clamp(1.1rem, 2vw, 1.6rem)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.3, ease }}
        >
          {aesthetic.tagline}
        </motion.p>

        {/* Mood words */}
        <motion.div
          className="flex items-center gap-5 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.6 }}
        >
          {aesthetic.moodWords.slice(0, 4).map((word, i) => (
            <span key={word} className="text-label text-cream/25" style={{ fontSize: "0.55rem" }}>
              {word}
              {i < 3 && <span className="ml-5">·</span>}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 right-8 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-cream/20 to-transparent"
          animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p
          className="text-label text-cream/20"
          style={{ fontSize: "0.55rem", writingMode: "vertical-lr" }}
        >
          Scroll to explore
        </p>
      </motion.div>
    </section>
  );
}
