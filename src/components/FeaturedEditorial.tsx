"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const editorials = [
  {
    id: "classic",
    label: "Classic · This Season",
    title: "The Architecture of Elegance",
    body: "Where sharp tailoring meets quiet confidence. Three complete looks for the woman who needs no introduction.",
    image: "/images/classic/hero.jpg",
    href: "/aesthetic/classic",
    accent: "#C4973B",
  },
  {
    id: "casual",
    label: "Casual · Everyday Edit",
    title: "Effortless by Design",
    body: "Casual doesn't mean careless. Eight outfits that elevate the everyday into something worth photographing.",
    image: "/images/casual/hero.jpg",
    href: "/aesthetic/casual",
    accent: "#7A9E7E",
  },
  {
    id: "streetwear",
    label: "Streetwear · Drop",
    title: "The Language of the Street",
    body: "Culture, cut, and community. Streetwear as a form of self-expression that needs no translation.",
    image: "/images/streetwear/hero.jpg",
    href: "/aesthetic/streetwear",
    accent: "#E84040",
  },
];

export function FeaturedEditorial() {
  const [active, setActive] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const current = editorials[active];

  return (
    <section className="bg-aura-black py-24 px-6 md:px-10 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-14">
          <div>
            <motion.div
              className="flex items-center gap-5 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="h-px w-8 bg-gold" />
              <p className="text-label text-gold">Featured Editorial</p>
            </motion.div>
            <motion.h2
              className="font-cormorant text-cream font-light"
              style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
            >
              Curated for You
            </motion.h2>
          </div>

          {/* Tab switcher */}
          <div className="hidden md:flex items-center gap-1">
            {editorials.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setActive(i)}
                className={`text-label px-4 py-2 transition-all duration-300 ${
                  active === i
                    ? "text-cream border-b border-gold"
                    : "text-cream/30 hover:text-cream/60"
                }`}
              >
                {e.id.charAt(0).toUpperCase() + e.id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Editorial card */}
        <motion.div
          key={active}
          className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[500px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            {!imgError[active] ? (
              <Image
                src={current.image}
                alt={current.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={() => setImgError((prev) => ({ ...prev, [active]: true }))}
              />
            ) : (
              <div
                className="w-full h-full min-h-[300px]"
                style={{
                  background: `linear-gradient(135deg, ${current.accent}22 0%, ${current.accent}55 100%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-aura-black/40" />
          </div>

          {/* Text content */}
          <div
            className="flex flex-col justify-center px-10 py-12 md:py-16 border border-white/5 border-l-0"
            style={{ borderLeftColor: current.accent + "30" }}
          >
            <p className="text-label mb-5" style={{ color: current.accent }}>
              {current.label}
            </p>

            <h3
              className="font-cormorant text-cream font-light leading-tight mb-6"
              style={{ fontSize: "clamp(1.8rem, 3vw, 3rem)" }}
            >
              {current.title}
            </h3>

            <div className="h-px w-10 mb-6" style={{ backgroundColor: current.accent + "60" }} />

            <p className="text-body text-cream/50 text-sm md:text-base leading-relaxed mb-10 max-w-sm">
              {current.body}
            </p>

            <Link
              href={current.href}
              className="group self-start flex items-center gap-3 text-label text-cream/70 hover:text-cream border border-cream/15 hover:border-cream/40 px-7 py-3.5 transition-all duration-400"
            >
              View Editorial
              <svg
                className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
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
          </div>
        </motion.div>

        {/* Mobile tab switcher */}
        <div className="md:hidden flex items-center justify-center gap-3 mt-8">
          {editorials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-8 h-px transition-all duration-300 ${
                active === i ? "bg-gold w-12" : "bg-cream/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
