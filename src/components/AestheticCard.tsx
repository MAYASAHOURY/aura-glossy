"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";

interface AestheticCardProps {
  aesthetic: Aesthetic;
  index: number;
  className?: string;
}

export function AestheticCard({ aesthetic, index, className = "" }: AestheticCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className={`group relative overflow-hidden cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/aesthetic/${aesthetic.id}`} className="block w-full h-full">
        {/* Image / fallback gradient */}
        <div className="absolute inset-0">
          {!imgError ? (
            <Image
              src={aesthetic.hero}
              alt={aesthetic.name}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${aesthetic.accentColor}22 0%, ${aesthetic.accentColor}55 50%, #0A0A0A 100%)`,
              }}
            />
          )}
        </div>

        {/* Base vignette */}
        <div className="absolute inset-0 gradient-vignette" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-aura-black/0 group-hover:bg-aura-black/40 transition-all duration-500" />

        {/* Accent color bar on hover */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[3px] origin-bottom"
          style={{ backgroundColor: aesthetic.accentColor, scaleY: 0 }}
          whileHover={{ scaleY: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-7">
          {/* Tags — visible on hover */}
          <motion.div
            className="flex flex-wrap gap-2 mb-4 overflow-hidden"
            initial={false}
          >
            {aesthetic.tags.map((tag) => (
              <span
                key={tag}
                className="text-label text-cream/0 group-hover:text-cream/70 border border-cream/0 group-hover:border-cream/20 px-2.5 py-1 transition-all duration-500"
                style={{ fontSize: "0.55rem" }}
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Tagline */}
          <p className="text-label text-cream/0 group-hover:text-cream/50 transition-all duration-500 mb-2">
            {aesthetic.tagline}
          </p>

          {/* Name */}
          <div className="flex items-end justify-between">
            <h3 className="font-cormorant text-cream text-3xl md:text-4xl font-light leading-none tracking-tight">
              {aesthetic.name}
            </h3>

            {/* Arrow */}
            <motion.div
              className="text-cream/0 group-hover:text-cream transition-all duration-500 flex items-center gap-1"
              style={{ fontSize: "0.65rem" }}
            >
              <span className="text-label tracking-widest">Explore</span>
              <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>

          {/* Gold line on hover */}
          <div
            className="mt-4 h-px w-0 group-hover:w-full transition-all duration-500"
            style={{ backgroundColor: aesthetic.accentColor + "60" }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
