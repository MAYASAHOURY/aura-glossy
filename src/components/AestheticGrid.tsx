"use client";

import { motion } from "framer-motion";
import { aesthetics } from "@/data/aesthetics";
import { AestheticCard } from "./AestheticCard";

export function AestheticGrid() {
  const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9] = aesthetics;

  return (
    <section id="aesthetics" className="bg-aura-black py-24 px-6 md:px-10">
      {/* Section header */}
      <div className="max-w-screen-xl mx-auto mb-14">
        <motion.div
          className="flex items-center gap-6 mb-5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="h-px w-10 bg-gold" />
          <p className="text-label text-gold">Aesthetic Worlds</p>
        </motion.div>

        <motion.h2
          className="font-cormorant text-cream font-light leading-tight"
          style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Ten Worlds.
          <br />
          <em className="italic text-cream/60">One Identity.</em>
        </motion.h2>
      </div>

      {/* Editorial grid */}
      <div className="max-w-screen-xl mx-auto grid grid-cols-12 auto-rows-[200px] gap-3">
        {/* Row 1: Classic (featured large) + Streetwear */}
        <AestheticCard
          aesthetic={a0}
          index={0}
          className="col-span-12 md:col-span-7 row-span-3"
        />
        <AestheticCard
          aesthetic={a1}
          index={1}
          className="col-span-12 md:col-span-5 row-span-2"
        />

        {/* Casual fills next to streetwear bottom */}
        <AestheticCard
          aesthetic={a2}
          index={2}
          className="col-span-12 md:col-span-5 row-span-1"
        />

        {/* Row 2: Minimalist, Dark Academia, Soft Girl */}
        <AestheticCard
          aesthetic={a3}
          index={3}
          className="col-span-12 md:col-span-4 row-span-2"
        />
        <AestheticCard
          aesthetic={a4}
          index={4}
          className="col-span-12 md:col-span-4 row-span-2"
        />
        <AestheticCard
          aesthetic={a5}
          index={5}
          className="col-span-12 md:col-span-4 row-span-2"
        />

        {/* Row 3: Korean Fashion (wide) + Y2K + Vintage + Elegant */}
        <AestheticCard
          aesthetic={a6}
          index={6}
          className="col-span-12 md:col-span-5 row-span-2"
        />
        <AestheticCard
          aesthetic={a7}
          index={7}
          className="col-span-12 md:col-span-3 row-span-2"
        />
        <AestheticCard
          aesthetic={a8}
          index={8}
          className="col-span-12 md:col-span-2 row-span-2"
        />
        <AestheticCard
          aesthetic={a9}
          index={9}
          className="col-span-12 md:col-span-2 row-span-2"
        />
      </div>

      {/* CTA below grid */}
      <motion.div
        className="max-w-screen-xl mx-auto mt-12 flex items-center gap-5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <a
          href="/quiz"
          className="group flex items-center gap-3 text-label text-cream/70 hover:text-cream transition-colors duration-300"
        >
          Not sure which aesthetic is yours?
          <span className="text-gold group-hover:translate-x-1 transition-transform duration-300 inline-block">
            Take the Style Quiz →
          </span>
        </a>
      </motion.div>
    </section>
  );
}
