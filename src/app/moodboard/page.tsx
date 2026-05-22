"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { aesthetics } from "@/data/aesthetics";
import { ease, fadeUp } from "@/lib/animations";
import { StaggerReveal } from "@/components/ui/ScrollReveal";

interface SavedItem {
  id: string;
  aestheticId: string;
  imageUrl: string;
  label: string;
  savedAt: string;
}

// Seed the moodboard with aesthetic hero images so it's not empty on first visit
function seedItems(): SavedItem[] {
  return aesthetics.slice(0, 6).map((a) => ({
    id: a.id,
    aestheticId: a.id,
    imageUrl: a.hero,
    label: `${a.name} — ${a.tagline}`,
    savedAt: new Date().toISOString(),
  }));
}

export default function MoodboardPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [view, setView] = useState<"grid" | "editorial">("grid");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("aura-moodboard");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems(seedItems());
      }
    } else {
      const seed = seedItems();
      setItems(seed);
      localStorage.setItem("aura-moodboard", JSON.stringify(seed));
    }
  }, []);

  function removeItem(id: string) {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem("aura-moodboard", JSON.stringify(updated));
  }

  function addAesthetic(aestheticId: string) {
    const a = aesthetics.find((ae) => ae.id === aestheticId);
    if (!a || items.find((i) => i.id === a.id)) return;
    const newItem: SavedItem = {
      id: a.id,
      aestheticId: a.id,
      imageUrl: a.hero,
      label: `${a.name} — ${a.tagline}`,
      savedAt: new Date().toISOString(),
    };
    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem("aura-moodboard", JSON.stringify(updated));
  }

  const filtered =
    activeFilter === "all" ? items : items.filter((i) => i.aestheticId === activeFilter);

  if (!mounted) return <div className="min-h-screen bg-aura-black" />;

  return (
    <div className="min-h-screen bg-aura-black">
      <Navigation />

      {/* Header */}
      <section className="pt-28 pb-10 px-8 md:px-16 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-label text-gold mb-3">My Collection</p>
              <h1
                className="font-cormorant text-cream font-light"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                Moodboard
              </h1>
              <p className="text-body text-cream/35 text-sm mt-3">
                {items.length} piece{items.length !== 1 ? "s" : ""} saved
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("grid")}
                className={`text-label px-4 py-2 border transition-all duration-300 ${
                  view === "grid"
                    ? "bg-cream text-aura-black border-cream"
                    : "text-cream/40 border-white/10 hover:text-cream/70"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView("editorial")}
                className={`text-label px-4 py-2 border transition-all duration-300 ${
                  view === "editorial"
                    ? "bg-cream text-aura-black border-cream"
                    : "text-cream/40 border-white/10 hover:text-cream/70"
                }`}
              >
                Editorial
              </button>
            </div>
          </div>

          {/* Aesthetic filter */}
          <div className="flex flex-wrap gap-2 mt-7">
            <button
              onClick={() => setActiveFilter("all")}
              className={`text-label px-4 py-1.5 border transition-all duration-300 ${
                activeFilter === "all"
                  ? "text-gold border-gold/40"
                  : "text-cream/25 border-white/6 hover:text-cream/50"
              }`}
              style={{ fontSize: "0.65rem" }}
            >
              All
            </button>
            {aesthetics
              .filter((a) => items.some((i) => i.aestheticId === a.id))
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActiveFilter(a.id)}
                  className={`text-label px-4 py-1.5 border transition-all duration-300 ${
                    activeFilter === a.id
                      ? "text-aura-black border-transparent"
                      : "text-cream/25 border-white/6 hover:text-cream/50"
                  }`}
                  style={{
                    fontSize: "0.65rem",
                    ...(activeFilter === a.id ? { backgroundColor: a.accentColor } : {}),
                  }}
                >
                  {a.name}
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Board content */}
      <section className="px-8 md:px-10 py-12">
        <div className="max-w-screen-xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-cormorant italic text-cream/25 text-3xl mb-4">
                Your board is empty
              </p>
              <p className="text-body text-cream/20 text-sm mb-8">
                Save inspiration from any aesthetic page
              </p>
              <Link
                href="/#aesthetics"
                className="text-label text-gold border border-gold/30 px-6 py-3 hover:bg-gold/10 transition-colors"
              >
                Explore Aesthetics
              </Link>
            </div>
          ) : view === "grid" ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              layout
            >
              <AnimatePresence>
                {filtered.map((item, i) => {
                  const aesthetic = aesthetics.find((a) => a.id === item.aestheticId);
                  return (
                    <motion.div
                      key={item.id}
                      className="group relative aspect-[3/4] overflow-hidden"
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.label}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="25vw"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = "none";
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(160deg, ${aesthetic?.accentColor ?? "#1A1A1A"}20 0%, #0A0A0A99 100%)`,
                        }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-aura-black/0 group-hover:bg-aura-black/50 transition-all duration-500 flex flex-col items-start justify-end p-4 opacity-0 group-hover:opacity-100">
                        <p className="font-cormorant text-cream text-xl font-light mb-2">
                          {item.label.split("—")[0]}
                        </p>
                        <div className="flex gap-2">
                          <Link
                            href={`/aesthetic/${item.aestheticId}`}
                            className="text-label text-cream/70 hover:text-cream transition-colors"
                            style={{ fontSize: "0.6rem" }}
                          >
                            Explore →
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-label text-cream/40 hover:text-red-400 transition-colors ml-2"
                            style={{ fontSize: "0.6rem" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Accent dot */}
                      <div
                        className="absolute top-3 right-3 w-2 h-2 rounded-full"
                        style={{ backgroundColor: aesthetic?.accentColor }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Editorial view — varied sizes
            <div className="grid grid-cols-12 gap-3 auto-rows-[200px]">
              {filtered.map((item, i) => {
                const aesthetic = aesthetics.find((a) => a.id === item.aestheticId);
                const spans = [
                  "col-span-12 md:col-span-7 row-span-2",
                  "col-span-12 md:col-span-5 row-span-2",
                  "col-span-12 md:col-span-4 row-span-2",
                  "col-span-12 md:col-span-4 row-span-1",
                  "col-span-12 md:col-span-4 row-span-1",
                  "col-span-12 md:col-span-6 row-span-2",
                  "col-span-12 md:col-span-6 row-span-2",
                ];
                const span = spans[i % spans.length];

                return (
                  <motion.div
                    key={item.id}
                    className={`group relative overflow-hidden ${span}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.07 }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="50vw"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(160deg, ${aesthetic?.accentColor ?? "#1A1A1A"}15 0%, #0A0A0A80 100%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-aura-black/0 group-hover:bg-aura-black/40 transition-all duration-400 flex items-end p-5 opacity-0 group-hover:opacity-100">
                      <div>
                        <p className="font-cormorant text-cream text-2xl font-light">
                          {item.label.split("—")[0]}
                        </p>
                        <Link
                          href={`/aesthetic/${item.aestheticId}`}
                          className="text-label text-cream/50 hover:text-cream transition-colors"
                          style={{ fontSize: "0.6rem" }}
                        >
                          Explore Aesthetic →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Add more aesthetics */}
      <section className="px-8 md:px-16 py-16 border-t border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-label text-cream/30 mb-6" style={{ fontSize: "0.6rem" }}>
            Add to your board
          </p>
          <div className="flex flex-wrap gap-2">
            {aesthetics
              .filter((a) => !items.some((i) => i.aestheticId === a.id))
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => addAesthetic(a.id)}
                  className="group text-label text-cream/40 hover:text-cream border border-white/8 hover:border-white/25 px-4 py-2 transition-all duration-300 flex items-center gap-2"
                  style={{ fontSize: "0.65rem" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: a.accentColor }}
                  />
                  {a.name}
                  <span className="opacity-40 group-hover:opacity-80 transition-opacity">+</span>
                </button>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
