import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { aesthetics } from "@/data/aesthetics";
import { AestheticHero } from "@/components/aesthetic/AestheticHero";
import { StyleIdentity } from "@/components/aesthetic/StyleIdentity";
import { InspirationGallery } from "@/components/aesthetic/InspirationGallery";
import { OutfitShowcase } from "@/components/aesthetic/OutfitShowcase";
import { StyleGuide } from "@/components/aesthetic/StyleGuide";
import { ShoppingSection } from "@/components/aesthetic/ShoppingSection";
import { FashionQuote } from "@/components/FashionQuote";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";
import { fashionQuotes } from "@/data/aesthetics";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return aesthetics.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const aesthetic = aesthetics.find((a) => a.id === id);
  if (!aesthetic) return {};
  return {
    title: `${aesthetic.name} — AURA`,
    description: `${aesthetic.longDescription}`,
  };
}

export default async function AestheticPage({ params }: PageProps) {
  const { id } = await params;
  const aesthetic = aesthetics.find((a) => a.id === id);

  if (!aesthetic) notFound();

  const quoteIndex = aesthetics.indexOf(aesthetic) % fashionQuotes.length;
  const quote = fashionQuotes[quoteIndex];

  return (
    <main>
      <Navigation />
      <AestheticHero aesthetic={aesthetic} />

      <MarqueeStrip
        items={[...aesthetic.tags, aesthetic.tagline, aesthetic.name, ...aesthetic.moodWords]}
        variant="dark"
        speed={25}
      />

      <StyleIdentity aesthetic={aesthetic} />

      <InspirationGallery aesthetic={aesthetic} />

      <FashionQuote text={quote.text} author={quote.author} variant="dark" />

      <OutfitShowcase aesthetic={aesthetic} />

      <MarqueeStrip
        items={["Clothing", "Shoes", "Bags", "Accessories", "Beauty", "Jewellery"]}
        variant="dark"
        speed={20}
        separator="—"
      />

      <ShoppingSection aesthetic={aesthetic} />

      <StyleGuide aesthetic={aesthetic} />

      <Footer />
    </main>
  );
}
