"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = {
  Explore: ["Aesthetics", "Style Quiz", "Editorial", "Moodboard"],
  Experience: ["AI Stylist", "Outfit Builder", "Saved Looks", "Community"],
  About: ["Our Vision", "Manifesto", "Careers", "Contact"],
};

export function Footer() {
  return (
    <footer className="bg-charcoal border-t border-white/5">
      <div className="max-w-screen-xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-cormorant text-cream text-3xl tracking-[0.4em] font-light hover:text-gold transition-colors duration-300 block mb-5"
            >
              AURA
            </Link>
            <p className="text-body text-cream/40 text-sm leading-relaxed max-w-[200px]">
              Fashion-editorial aesthetic discovery for the modern identity.
            </p>

            {/* Social links */}
            <div className="flex gap-4 mt-7">
              {["Instagram", "Pinterest", "TikTok"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-label text-cream/30 hover:text-cream transition-colors duration-300"
                  style={{ fontSize: "0.6rem" }}
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <p className="text-label text-cream/50 mb-5">{category}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-body text-cream/30 hover:text-cream text-sm transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-label text-cream/20" style={{ fontSize: "0.6rem" }}>
            © 2025 AURA. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-label text-cream/20 hover:text-cream/50 transition-colors duration-300"
                style={{ fontSize: "0.6rem" }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
