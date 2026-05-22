import Link from "next/link";
import Image from "next/image";
import { aesthetics, fashionQuotes } from "@/data/aesthetics";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FashionQuote } from "@/components/FashionQuote";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";

export const metadata = {
  title: "Discover — AURA",
  description: "Explore all ten aesthetic worlds. Discover your signature style.",
};

export default function DiscoverPage() {
  const featured = aesthetics.filter((a) => a.span === "featured" || a.span === "tall").slice(0, 2);
  const rest = aesthetics.filter((a) => !featured.includes(a));

  return (
    <main>
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-20 px-8 md:px-16 bg-aura-black">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-label text-gold mb-5">Aesthetic Universe</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1
              className="font-cormorant text-cream font-light leading-tight"
              style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
            >
              Ten Worlds.
              <br />
              <em className="italic text-cream/50">One Identity.</em>
            </h1>
            <p className="text-body text-cream/35 text-base max-w-sm leading-relaxed">
              Every aesthetic is a complete world — with its own rules, heroes, and visual
              language. Explore them all. Find where you belong.
            </p>
          </div>
        </div>
      </section>

      <MarqueeStrip
        items={aesthetics.map((a) => a.name)}
        variant="dark"
        speed={28}
      />

      {/* Featured grid */}
      <section className="px-6 md:px-10 py-12 bg-aura-black">
        <div className="max-w-screen-xl mx-auto">
          <p className="text-label text-cream/30 mb-8" style={{ fontSize: "0.6rem" }}>
            Explore All Aesthetics
          </p>

          {/* First two large */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {featured.map((aesthetic) => (
              <AestheticCard key={aesthetic.id} aesthetic={aesthetic} size="large" />
            ))}
          </div>

          {/* Rest in 3-col */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {rest.slice(0, 4).map((aesthetic) => (
              <AestheticCard key={aesthetic.id} aesthetic={aesthetic} size="medium" />
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rest.slice(4).map((aesthetic) => (
              <AestheticCard key={aesthetic.id} aesthetic={aesthetic} size="medium" />
            ))}
          </div>
        </div>
      </section>

      <FashionQuote text={fashionQuotes[4].text} author={fashionQuotes[4].author} variant="dark" />

      {/* Style quiz CTA */}
      <section className="py-20 px-8 md:px-16 bg-charcoal">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-label text-gold mb-5">Not sure where to start?</p>
          <h2
            className="font-cormorant text-cream font-light mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
          >
            Take the Style Quiz
          </h2>
          <p className="text-body text-cream/40 max-w-md mx-auto mb-10 text-base">
            Five visual questions. Your aesthetic, revealed. The quiz takes 2 minutes and gives you
            a starting point for building your perfect wardrobe.
          </p>
          <Link
            href="/quiz"
            className="group inline-flex items-center gap-3 text-label text-aura-black bg-gold px-10 py-4 hover:bg-gold/90 transition-colors"
          >
            Begin the Quiz
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
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
      </section>

      <Footer />
    </main>
  );
}

function AestheticCard({
  aesthetic,
  size,
}: {
  aesthetic: (typeof aesthetics)[0];
  size: "large" | "medium";
}) {
  return (
    <Link
      href={`/aesthetic/${aesthetic.id}`}
      className="group relative overflow-hidden block"
      style={{ aspectRatio: size === "large" ? "16/9" : "3/4" }}
    >
      {/* Gradient bg (image loaded via CSS for server component simplicity) */}
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
        style={{
          background: `radial-gradient(ellipse at 60% 40%, ${aesthetic.accentColor}35 0%, #0A0A0A 75%)`,
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 gradient-vignette" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          {aesthetic.tags.map((tag) => (
            <span
              key={tag}
              className="text-label border px-2 py-1"
              style={{ color: aesthetic.accentColor, borderColor: aesthetic.accentColor + "40", fontSize: "0.5rem" }}
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-label text-cream/0 group-hover:text-cream/40 transition-colors duration-400 mb-1">
          {aesthetic.tagline}
        </p>
        <h3
          className="font-cormorant text-cream font-light leading-none"
          style={{ fontSize: size === "large" ? "clamp(2rem, 4vw, 4rem)" : "clamp(1.5rem, 3vw, 2.5rem)" }}
        >
          {aesthetic.name}
        </h3>

        {/* Explore link */}
        <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <div className="h-px w-5" style={{ backgroundColor: aesthetic.accentColor }} />
          <span className="text-label" style={{ color: aesthetic.accentColor, fontSize: "0.6rem" }}>
            Explore
          </span>
        </div>
      </div>
    </Link>
  );
}
