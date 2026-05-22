import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { AestheticGrid } from "@/components/AestheticGrid";
import { FashionQuote } from "@/components/FashionQuote";
import { FeaturedEditorial } from "@/components/FeaturedEditorial";
import { Footer } from "@/components/Footer";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";
import { fashionQuotes, aesthetics } from "@/data/aesthetics";
import { AIStyleBanner } from "@/components/AIStyleBanner";

export default function HomePage() {
  return (
    <main>
      <Navigation />
      <Hero />

      <MarqueeStrip
        items={aesthetics.map((a) => a.name)}
        variant="dark"
        speed={30}
      />

      <FashionQuote
        text={fashionQuotes[0].text}
        author={fashionQuotes[0].author}
        variant="dark"
      />

      <AestheticGrid />

      <MarqueeStrip
        items={["Discover", "Inspire", "Curate", "Shop", "Create", "Express"]}
        variant="dark"
        speed={20}
        separator="·"
      />

      <FashionQuote
        text={fashionQuotes[2].text}
        author={fashionQuotes[2].author}
        variant="light"
      />

      <FeaturedEditorial />

      <AIStyleBanner />

      <Footer />
    </main>
  );
}
