"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ease } from "@/lib/animations";

// Gradient fallback colors per aesthetic
const fallbackGradients: Record<string, [string, string]> = {
  classic: ["#2A1F10", "#3D2E18"],
  streetwear: ["#1A0A0A", "#2D1010"],
  casual: ["#0A1A0A", "#1A2D1A"],
  minimalist: ["#141414", "#1E1E1E"],
  "dark-academia": ["#1A1208", "#2D2010"],
  "soft-girl": ["#1A0A10", "#2D1020"],
  "korean-fashion": ["#120A18", "#20102D"],
  y2k: ["#0A0A1A", "#10102D"],
  vintage: ["#1A1208", "#2D2010"],
  elegant: ["#141010", "#20181A"],
};

interface InspirationGalleryProps {
  aesthetic: Aesthetic;
}

function GalleryImage({
  src,
  alt,
  gradient,
  index,
  className,
}: {
  src: string;
  alt: string;
  gradient: [string, string];
  index: number;
  className?: string;
}) {
  const [error, setError] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden group ${className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay: index * 0.08, ease }}
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => setError(true)}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
          }}
        />
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-aura-black/0 group-hover:bg-aura-black/20 transition-all duration-500" />
    </motion.div>
  );
}

export function InspirationGallery({ aesthetic }: InspirationGalleryProps) {
  const images = aesthetic.inspirationImages;
  const gradient = fallbackGradients[aesthetic.id] ?? ["#1A1A1A", "#2A2A2A"];

  return (
    <section className="bg-aura-black py-20 px-6 md:px-10 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-8" style={{ backgroundColor: aesthetic.accentColor }} />
                <p className="text-label" style={{ color: aesthetic.accentColor }}>
                  Inspiration
                </p>
              </div>
              <h2
                className="font-cormorant text-cream font-light leading-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Visual Mood
              </h2>
            </div>
          </ScrollReveal>
        </div>

        {/* Editorial grid — varied sizes for visual interest */}
        <div className="grid grid-cols-12 gap-3 auto-rows-[240px]">
          {/* Large hero image — spans more columns */}
          {images[0] && (
            <GalleryImage
              src={images[0]}
              alt={`${aesthetic.name} inspiration 1`}
              gradient={gradient}
              index={0}
              className="col-span-12 md:col-span-7 row-span-2"
            />
          )}

          {/* Tall right image */}
          {images[1] && (
            <GalleryImage
              src={images[1]}
              alt={`${aesthetic.name} inspiration 2`}
              gradient={gradient}
              index={1}
              className="col-span-12 md:col-span-5 row-span-2"
            />
          )}

          {/* Three medium images */}
          {images[2] && (
            <GalleryImage
              src={images[2]}
              alt={`${aesthetic.name} inspiration 3`}
              gradient={gradient}
              index={2}
              className="col-span-12 md:col-span-4 row-span-1"
            />
          )}
          {images[3] && (
            <GalleryImage
              src={images[3]}
              alt={`${aesthetic.name} inspiration 4`}
              gradient={gradient}
              index={3}
              className="col-span-12 md:col-span-4 row-span-1"
            />
          )}
          {images[4] && (
            <GalleryImage
              src={images[4]}
              alt={`${aesthetic.name} inspiration 5`}
              gradient={gradient}
              index={4}
              className="col-span-12 md:col-span-4 row-span-1"
            />
          )}

          {/* Wide bottom image */}
          {images[5] && (
            <GalleryImage
              src={images[5]}
              alt={`${aesthetic.name} inspiration 6`}
              gradient={gradient}
              index={5}
              className="col-span-12 row-span-1"
            />
          )}
        </div>
      </div>
    </section>
  );
}
