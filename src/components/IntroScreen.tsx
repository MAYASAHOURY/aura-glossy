"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const IMAGES = [
  { src: "/images/intro/intro-1.jpg", alt: "Aura intro 1" },
  { src: "/images/intro/intro-2.jpg", alt: "Aura intro 2" },
  { src: "/images/intro/intro-3.jpg", alt: "Aura intro 3" },
  { src: "/images/intro/intro-4.jpg", alt: "Aura intro 4" },
];

const DURATION_PER_IMAGE = 1800; // ms each image shows
const EXIT_DURATION = 900;       // ms the whole intro takes to fade out

interface Props {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  const exit = useCallback(() => {
    setExiting(true);
    setTimeout(onComplete, EXIT_DURATION);
  }, [onComplete]);

  useEffect(() => {
    if (exiting) return;
    if (current >= IMAGES.length) {
      exit();
      return;
    }
    const t = setTimeout(() => setCurrent((c) => c + 1), DURATION_PER_IMAGE);
    return () => clearTimeout(t);
  }, [current, exiting, exit]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0D0508" }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: EXIT_DURATION / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Soft radial rose glow in background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #3A0D1A55 0%, transparent 75%)",
        }}
      />

      {/* Top: AURA wordmark */}
      <motion.div
        className="relative z-10 text-center mb-8 md:mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <p
          className="font-cormorant italic tracking-[0.35em] uppercase"
          style={{
            fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
            color: "#C8A0A8",
            letterSpacing: "0.4em",
          }}
        >
          A U R A
        </p>
        <p
          className="font-cormorant italic"
          style={{
            fontSize: "clamp(0.55rem, 1vw, 0.65rem)",
            color: "#A07880",
            letterSpacing: "0.2em",
            marginTop: "0.35rem",
          }}
        >
          Discover Your Aesthetic
        </p>
      </motion.div>

      {/* Image frame */}
      <div className="relative z-10 w-full flex justify-center px-6">
        <div
          className="relative overflow-hidden"
          style={{
            width: "min(340px, 72vw)",
            aspectRatio: "3 / 4",
            boxShadow: "0 32px 80px #0008, 0 0 0 1px #C8A0A812",
          }}
        >
          <AnimatePresence mode="sync">
            {current < IMAGES.length && (
              <motion.div
                key={current}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={IMAGES[current].src}
                  alt={IMAGES[current].alt}
                  fill
                  className="object-cover object-center"
                  priority={current === 0}
                  sizes="340px"
                />
                {/* Subtle pink tint overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, #C8A0A808 0%, transparent 40%, #0D050818 100%)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <motion.div
        className="relative z-10 flex items-center gap-2 mt-8 md:mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        {IMAGES.map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              width: i === current ? "28px" : "6px",
              height: "2px",
              backgroundColor: "#C8A0A820",
              borderRadius: "1px",
              transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {i === current && !exiting && (
              <motion.div
                className="absolute inset-0 h-full"
                style={{ backgroundColor: "#C8A0A8", borderRadius: "1px" }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: DURATION_PER_IMAGE / 1000, ease: "linear" }}
              />
            )}
            {i < current && (
              <div
                className="absolute inset-0 h-full"
                style={{ backgroundColor: "#C8A0A8", borderRadius: "1px" }}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Skip */}
      <motion.button
        onClick={exit}
        className="absolute bottom-7 right-8 text-label transition-colors duration-300 hover:opacity-100"
        style={{
          color: "#A07880",
          fontSize: "0.58rem",
          letterSpacing: "0.15em",
          opacity: 0.6,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        whileHover={{ opacity: 1 }}
      >
        SKIP
      </motion.button>

      {/* Decorative corner lines */}
      <div className="absolute top-6 left-6 w-8 h-8 pointer-events-none"
        style={{ borderTop: "1px solid #C8A0A820", borderLeft: "1px solid #C8A0A820" }} />
      <div className="absolute top-6 right-6 w-8 h-8 pointer-events-none"
        style={{ borderTop: "1px solid #C8A0A820", borderRight: "1px solid #C8A0A820" }} />
      <div className="absolute bottom-6 left-6 w-8 h-8 pointer-events-none"
        style={{ borderBottom: "1px solid #C8A0A820", borderLeft: "1px solid #C8A0A820" }} />
      <div className="absolute bottom-6 right-6 w-8 h-8 pointer-events-none"
        style={{ borderBottom: "1px solid #C8A0A820", borderRight: "1px solid #C8A0A820" }} />
    </motion.div>
  );
}
