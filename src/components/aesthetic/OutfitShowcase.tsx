"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Aesthetic } from "@/data/aesthetics";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ease } from "@/lib/animations";

interface OutfitData {
  name: string;
  occasion: string;
  description: string;
  items: { piece: string; brand: string; price: string }[];
}

// Outfit descriptions per aesthetic
const outfitData: Record<string, OutfitData[]> = {
  classic: [
    {
      name: "The Power Meeting",
      occasion: "Professional",
      description: "Tailored authority without a word spoken.",
      items: [
        { piece: "Structured blazer", brand: "COS", price: "£195" },
        { piece: "Pleated wide-leg trousers", brand: "Mango", price: "£69.99" },
        { piece: "Silk crew-neck", brand: "Uniqlo", price: "£49.90" },
        { piece: "Leather tote", brand: "Polène", price: "€295" },
        { piece: "Block-heel pumps", brand: "Zara", price: "£79.99" },
      ],
    },
    {
      name: "Timeless Weekend",
      occasion: "Casual-elevated",
      description: "Relaxed but never underdressed.",
      items: [
        { piece: "White poplin shirt", brand: "H&M", price: "£19.99" },
        { piece: "High-waist trousers", brand: "Pull&Bear", price: "£29.99" },
        { piece: "Ballet flats", brand: "H&M", price: "£34.99" },
        { piece: "Silk scarf", brand: "H&M", price: "£19.99" },
        { piece: "Structured bag", brand: "Jacquemus", price: "€490" },
      ],
    },
    {
      name: "Evening Edited",
      occasion: "Evening",
      description: "Understated luxury for the moments that matter.",
      items: [
        { piece: "Midi slip dress", brand: "Reformation", price: "$278" },
        { piece: "Kitten-heel mules", brand: "Zara", price: "£79.99" },
        { piece: "Evening clutch", brand: "H&M", price: "£19.99" },
        { piece: "Pearl drop earrings", brand: "H&M", price: "£9.99" },
        { piece: "Gold bracelet", brand: "Tiffany & Co.", price: "$575" },
      ],
    },
  ],
  streetwear: [
    {
      name: "Street Level",
      occasion: "Everyday urban",
      description: "The look that owns the block.",
      items: [
        { piece: "Oversized graphic tee", brand: "H&M", price: "£14.99" },
        { piece: "Wide cargo pants", brand: "Zara", price: "£59.99" },
        { piece: "Chunky sneakers", brand: "H&M", price: "£39.99" },
        { piece: "Chain necklace", brand: "SHEIN", price: "£8.00" },
        { piece: "Beanie", brand: "H&M", price: "£7.99" },
      ],
    },
    {
      name: "Drop Day",
      occasion: "Statement",
      description: "For the days you're making a move.",
      items: [
        { piece: "Logo hoodie", brand: "Acne Studios", price: "€320" },
        { piece: "Technical cargo trousers", brand: "Zara", price: "£59.99" },
        { piece: "Platform boots", brand: "ASOS", price: "£75.00" },
        { piece: "Messenger bag", brand: "AliExpress", price: "£15.00" },
        { piece: "Shield sunglasses", brand: "ASOS", price: "£20.00" },
      ],
    },
    {
      name: "Urban Night",
      occasion: "Evening out",
      description: "Street cred meets night energy.",
      items: [
        { piece: "Oversized denim jacket", brand: "ASOS", price: "£65.00" },
        { piece: "Varsity bomber", brand: "Princess Polly", price: "AUD $89" },
        { piece: "Sculpted mini bag", brand: "Jacquemus", price: "€450" },
        { piece: "HardWear bracelet", brand: "Tiffany & Co.", price: "$825" },
        { piece: "Leather jacket", brand: "Reformation", price: "$448" },
      ],
    },
  ],
  casual: [
    {
      name: "The Easy Morning",
      occasion: "Weekend",
      description: "Coffee run that looks effortlessly considered.",
      items: [
        { piece: "Linen relaxed shirt", brand: "H&M", price: "£19.99" },
        { piece: "High-rise straight jeans", brand: "Cider", price: "$28.00" },
        { piece: "Canvas sneakers", brand: "H&M", price: "£19.99" },
        { piece: "Canvas tote", brand: "H&M", price: "£12.99" },
        { piece: "Gold hoop earrings", brand: "Zara", price: "£17.99" },
      ],
    },
    {
      name: "Linen Season",
      occasion: "Day out",
      description: "Natural fabrics, natural ease.",
      items: [
        { piece: "Linen wide-leg set", brand: "Reformation", price: "$248" },
        { piece: "Minimal trainers", brand: "COS", price: "£115" },
        { piece: "Pebbled bucket bag", brand: "ASOS", price: "£55.00" },
        { piece: "Bucket hat", brand: "Cider", price: "$16.00" },
        { piece: "Cord bracelet", brand: "H&M", price: "£5.99" },
      ],
    },
    {
      name: "Elevated Basics",
      occasion: "Casual-chic",
      description: "When your basics are better than everyone else's look.",
      items: [
        { piece: "Cotton-cashmere cardigan", brand: "Uniqlo", price: "£59.90" },
        { piece: "Organic cotton tee", brand: "Mango", price: "£49.99" },
        { piece: "Mohair knit sweater", brand: "Acne Studios", price: "€420" },
        { piece: "Numéro Neuf bag", brand: "Polène", price: "€285" },
        { piece: "Love Tag bracelet", brand: "Tiffany & Co.", price: "$250" },
      ],
    },
  ],
};

// Default outfit data for aesthetics without specific data
function getOutfitData(aestheticId: string): OutfitData[] {
  return (
    outfitData[aestheticId] ?? [
      {
        name: "Signature Look",
        occasion: "Everyday",
        description: "The essential expression of this aesthetic.",
        items: [
          { piece: "Statement top", brand: "Zara", price: "£35.99" },
          { piece: "Tailored trousers", brand: "Mango", price: "£59.99" },
          { piece: "Minimal shoes", brand: "COS", price: "£115" },
          { piece: "Structured bag", brand: "Polène", price: "€295" },
          { piece: "Gold jewellery", brand: "Mango", price: "£24.99" },
        ],
      },
      {
        name: "Evening Edit",
        occasion: "Evening",
        description: "Elevated for the occasion.",
        items: [
          { piece: "Draped midi dress", brand: "Mango", price: "£89.99" },
          { piece: "Heeled shoes", brand: "Zara", price: "£79.99" },
          { piece: "Evening bag", brand: "H&M", price: "£19.99" },
          { piece: "Statement earrings", brand: "Mango", price: "£24.99" },
          { piece: "Luxury bag", brand: "Jacquemus", price: "€420" },
        ],
      },
      {
        name: "Weekend Ready",
        occasion: "Casual",
        description: "Relaxed without compromise.",
        items: [
          { piece: "Casual top", brand: "H&M", price: "£19.99" },
          { piece: "Comfortable trousers", brand: "Uniqlo", price: "£39.90" },
          { piece: "Clean sneakers", brand: "COS", price: "£115" },
          { piece: "Everyday bag", brand: "Polène", price: "€285" },
          { piece: "Simple jewellery", brand: "H&M", price: "£9.99" },
        ],
      },
    ]
  );
}

export function OutfitShowcase({ aesthetic }: { aesthetic: Aesthetic }) {
  const [activeOutfit, setActiveOutfit] = useState(0);
  const outfits = getOutfitData(aesthetic.id);
  const images = aesthetic.outfitImages;
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const current = outfits[activeOutfit];
  const currentImage = images[activeOutfit];

  return (
    <section className="bg-charcoal py-24 px-6 md:px-10 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <ScrollReveal>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px w-8" style={{ backgroundColor: aesthetic.accentColor }} />
                <p className="text-label" style={{ color: aesthetic.accentColor }}>
                  Outfit Inspiration
                </p>
              </div>
              <h2
                className="font-cormorant text-cream font-light"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                Three Complete Looks
              </h2>
            </div>
          </ScrollReveal>

          {/* Outfit selector tabs */}
          <div className="flex gap-1">
            {outfits.map((outfit, i) => (
              <button
                key={i}
                onClick={() => setActiveOutfit(i)}
                className={`text-label px-4 py-2.5 border transition-all duration-300 ${
                  activeOutfit === i
                    ? "text-aura-black border-transparent"
                    : "text-cream/35 border-white/10 hover:text-cream/60"
                }`}
                style={activeOutfit === i ? { backgroundColor: aesthetic.accentColor } : {}}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        {/* Outfit display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOutfit}
            className="grid grid-cols-1 md:grid-cols-2 gap-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.6, ease }}
          >
            {/* Outfit image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              {currentImage && !imgErrors[activeOutfit] ? (
                <Image
                  src={currentImage}
                  alt={current.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={() => setImgErrors((p) => ({ ...p, [activeOutfit]: true }))}
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(160deg, ${aesthetic.accentColor}18 0%, #141414 60%)`,
                  }}
                />
              )}
              {/* Overlay with occasion */}
              <div className="absolute top-5 left-5">
                <span
                  className="text-label px-3 py-1.5 border"
                  style={{
                    color: aesthetic.accentColor,
                    borderColor: aesthetic.accentColor + "40",
                    backgroundColor: "#0A0A0A90",
                    fontSize: "0.6rem",
                  }}
                >
                  {current.occasion}
                </span>
              </div>
            </div>

            {/* Outfit details */}
            <div
              className="flex flex-col justify-between px-8 md:px-12 py-10 border-l"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div>
                <p className="text-label text-cream/30 mb-3" style={{ fontSize: "0.6rem" }}>
                  Look {String(activeOutfit + 1).padStart(2, "0")}
                </p>
                <h3
                  className="font-cormorant text-cream font-light mb-3"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
                >
                  {current.name}
                </h3>
                <p className="text-body text-cream/40 text-sm italic mb-8">
                  {current.description}
                </p>

                {/* Item list */}
                <div className="space-y-3">
                  {current.items.map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-white/5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                    >
                      <div>
                        <p className="text-body text-cream/70 text-sm">{item.piece}</p>
                        <p className="text-label text-cream/30 mt-0.5" style={{ fontSize: "0.6rem" }}>
                          {item.brand}
                        </p>
                      </div>
                      <p
                        className="text-label"
                        style={{ color: aesthetic.accentColor, fontSize: "0.7rem" }}
                      >
                        {item.price}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <a
                  href={`#shopping`}
                  className="group inline-flex items-center gap-3 text-label text-cream/60 hover:text-cream border border-white/10 hover:border-white/30 px-7 py-3.5 transition-all duration-400"
                >
                  Shop This Look
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
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mt-8">
          {outfits.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveOutfit(i)}
              className="h-px transition-all duration-400"
              style={{
                width: activeOutfit === i ? "3rem" : "1.5rem",
                backgroundColor:
                  activeOutfit === i ? aesthetic.accentColor : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
