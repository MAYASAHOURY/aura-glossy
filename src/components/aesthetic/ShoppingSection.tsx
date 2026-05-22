"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";
import { shoppingData, type Tier, type Category, type OutfitCombo, type Product } from "@/data/shopping";
import { ScrollReveal, StaggerReveal } from "@/components/ui/ScrollReveal";
import { fadeUp, ease } from "@/lib/animations";

const TIERS: { id: Tier | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "affordable", label: "Affordable" },
  { id: "mid", label: "Mid-Range" },
  { id: "luxury", label: "Luxury" },
];

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All Pieces" },
  { id: "clothing", label: "Clothing" },
  { id: "shoes", label: "Shoes" },
  { id: "bags", label: "Bags" },
  { id: "accessories", label: "Accessories" },
  { id: "beauty", label: "Beauty" },
  { id: "jewelry", label: "Jewellery" },
];

const tierBadge: Record<Tier, string> = {
  affordable: "bg-green-900/40 text-green-400/80",
  mid: "bg-blue-900/40 text-blue-400/80",
  luxury: "bg-yellow-900/40 text-yellow-400/80",
};

const tierLabel: Record<Tier, string> = {
  affordable: "Affordable",
  mid: "Mid-Range",
  luxury: "Luxury",
};

function ProductCard({
  product,
  accentColor,
}: {
  product: Product;
  accentColor: string;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease }}
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-4">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-600 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${product.brandColor}30 0%, ${product.accentColor}18 50%, #0A0A0A 100%)`,
            }}
          >
            <div
              className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-20"
              style={{ backgroundColor: product.accentColor }}
            />
            <p
              className="font-cormorant text-cream/20 text-center leading-none select-none"
              style={{ fontSize: "clamp(0.9rem, 3vw, 1.4rem)", letterSpacing: "0.1em" }}
            >
              {product.brand}
            </p>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className="text-label px-2 py-1 bg-aura-black/80 backdrop-blur-sm"
            style={{ color: accentColor, fontSize: "0.55rem" }}
          >
            {product.category}
          </span>
        </div>

        <div className="absolute inset-0 bg-aura-black/0 group-hover:bg-aura-black/60 transition-all duration-400 flex items-end p-5 opacity-0 group-hover:opacity-100">
          <p className="text-body text-cream/80 text-xs leading-relaxed">{product.description}</p>
        </div>
      </div>

      <div>
        <p className="text-label text-cream/40 mb-1" style={{ fontSize: "0.6rem" }}>
          {product.brand}
        </p>
        <p className="text-body text-cream/80 text-sm mb-2 group-hover:text-cream transition-colors duration-300 line-clamp-1">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-cormorant italic" style={{ color: accentColor, fontSize: "1rem" }}>
            {product.price}
          </p>
          <span
            className={`text-label px-2 py-0.5 rounded-full ${tierBadge[product.tier]}`}
            style={{ fontSize: "0.5rem" }}
          >
            {product.tier}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function OutfitCard({
  outfit,
  accentColor,
  isActive,
  onClick,
}: {
  outfit: OutfitCombo;
  accentColor: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const tierColors: Record<Tier, { bg: string; text: string; border: string }> = {
    affordable: { bg: "bg-green-900/20", text: "text-green-400/70", border: "border-green-800/40" },
    mid: { bg: "bg-blue-900/20", text: "text-blue-400/70", border: "border-blue-800/40" },
    luxury: { bg: "bg-yellow-900/20", text: "text-yellow-400/70", border: "border-yellow-800/40" },
  };
  const tc = tierColors[outfit.tier];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border transition-all duration-400 p-6 md:p-8 ${
        isActive ? "border-white/20 bg-white/[0.03]" : "border-white/6 bg-transparent hover:border-white/12"
      }`}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <span
            className={`text-label px-2.5 py-1 border rounded-full ${tc.bg} ${tc.text} ${tc.border}`}
            style={{ fontSize: "0.55rem" }}
          >
            {tierLabel[outfit.tier]}
          </span>
          <h4
            className="font-cormorant text-cream font-light mt-3"
            style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}
          >
            {outfit.name}
          </h4>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-all duration-300 ${
            isActive ? "border-transparent" : "border-white/20"
          }`}
          style={isActive ? { backgroundColor: accentColor } : {}}
        />
      </div>

      <ul className="space-y-2.5 mb-5">
        {outfit.pieces.map((piece, i) => (
          <li key={i} className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-2 min-w-0">
              <span
                className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                style={{ backgroundColor: accentColor + "80" }}
              />
              <span className="text-body text-cream/50 text-xs truncate">{piece.item}</span>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="text-label text-cream/25" style={{ fontSize: "0.55rem" }}>
                {piece.brand} · {piece.price}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className="pt-4 border-t"
              style={{ borderColor: accentColor + "30" }}
            >
              <p className="text-body text-cream/45 text-xs leading-relaxed italic">
                {outfit.note}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export function ShoppingSection({ aesthetic }: { aesthetic: Aesthetic }) {
  const [activeTier, setActiveTier] = useState<Tier | "all">("all");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [activeOutfit, setActiveOutfit] = useState<number | null>(null);

  const aestheticData = shoppingData[aesthetic.id];
  const allProducts = aestheticData?.products ?? [];
  const outfits = aestheticData?.outfits ?? [];
  const styleTips = aestheticData?.styleTips ?? [];

  const filtered = allProducts.filter((p) => {
    const tierMatch = activeTier === "all" || p.tier === activeTier;
    const catMatch = activeCategory === "all" || p.category === activeCategory;
    return tierMatch && catMatch;
  });

  return (
    <section id="shopping" className="bg-aura-black py-28 px-6 md:px-10 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <ScrollReveal className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-8" style={{ backgroundColor: aesthetic.accentColor }} />
            <p className="text-label" style={{ color: aesthetic.accentColor }}>
              Where to Shop This Style
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2
              className="font-cormorant text-cream font-light"
              style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
            >
              Build the{" "}
              <em className="italic" style={{ color: aesthetic.accentColor + "CC" }}>
                {aesthetic.name}
              </em>{" "}
              Look
            </h2>
            <p className="text-body text-cream/35 text-sm max-w-xs">
              Three price points. Every category. Curated so you can actually build this aesthetic — from first piece to full wardrobe.
            </p>
          </div>
        </ScrollReveal>

        {/* ── Complete Looks ──────────────────────────────────────────── */}
        {outfits.length > 0 && (
          <ScrollReveal className="mb-20">
            <div className="flex items-center gap-4 mb-6">
              <p className="text-label text-cream/40" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
                COMPLETE OUTFITS
              </p>
              <div className="flex-1 h-px bg-white/6" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {outfits.map((outfit, i) => (
                <OutfitCard
                  key={i}
                  outfit={outfit}
                  accentColor={aesthetic.accentColor}
                  isActive={activeOutfit === i}
                  onClick={() => setActiveOutfit(activeOutfit === i ? null : i)}
                />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex items-center gap-4 mb-1">
            <p className="text-label text-cream/40" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
              BROWSE ALL PIECES
            </p>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          <div className="flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTier(t.id)}
                className={`text-label px-5 py-2 border transition-all duration-300 ${
                  activeTier === t.id
                    ? "text-aura-black border-transparent"
                    : "text-cream/40 border-white/10 hover:text-cream/70"
                }`}
                style={activeTier === t.id ? { backgroundColor: aesthetic.accentColor } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`text-label px-4 py-1.5 border transition-all duration-300 ${
                  activeCategory === c.id
                    ? "text-cream/90 border-white/30"
                    : "text-cream/25 border-white/6 hover:text-cream/50"
                }`}
                style={{ fontSize: "0.6rem" }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <p className="text-label text-cream/20" style={{ fontSize: "0.55rem" }}>
            {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
            {activeTier !== "all" ? ` · ${tierLabel[activeTier as Tier]}` : ""}
            {activeCategory !== "all" ? ` · ${activeCategory}` : ""}
          </p>
        </div>

        {/* ── Products grid ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTier}-${activeCategory}`}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StaggerReveal stagger={0.04} delay={0.05} className="contents">
              {filtered.length > 0 ? (
                filtered.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    accentColor={aesthetic.accentColor}
                    index={i}
                  />
                ))
              ) : (
                <motion.div
                  className="col-span-full py-16 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="font-cormorant italic text-cream/30 text-2xl">
                    No pieces in this filter
                  </p>
                </motion.div>
              )}
            </StaggerReveal>
          </motion.div>
        </AnimatePresence>

        {/* ── Style Tips ──────────────────────────────────────────────── */}
        {styleTips.length > 0 && (
          <ScrollReveal className="mb-10">
            <div className="flex items-center gap-4 mb-8">
              <p className="text-label text-cream/40" style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}>
                STYLING NOTES
              </p>
              <div className="flex-1 h-px bg-white/6" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {styleTips.map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="w-px self-stretch flex-shrink-0"
                    style={{ backgroundColor: aesthetic.accentColor + "40" }}
                  />
                  <p className="text-body text-cream/40 text-xs leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* ── Disclaimer ──────────────────────────────────────────────── */}
        <ScrollReveal delay={0.2}>
          <p className="text-label text-cream/20 text-center" style={{ fontSize: "0.6rem" }}>
            All links direct to brand websites. Prices may vary. Aura curates but does not sell directly.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
