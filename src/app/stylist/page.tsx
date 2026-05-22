"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { aesthetics } from "@/data/aesthetics";
import { ease } from "@/lib/animations";

interface Message {
  id: string;
  role: "user" | "stylist";
  text: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "Build me a Classic capsule wardrobe for under £300",
  "What's the essential Streetwear piece I'm missing?",
  "How do I style Dark Academia for summer?",
  "Which aesthetic suits someone who loves comfort but wants to look polished?",
  "Suggest a Soft Girl outfit for a first date",
  "What are the key differences between Minimalist and Elegant style?",
];

function stylistResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("capsule") || lower.includes("wardrobe")) {
    const aesthetic = aesthetics.find((a) => lower.includes(a.name.toLowerCase()));
    if (aesthetic) {
      return `A ${aesthetic.name} capsule wardrobe is built around ${aesthetic.essentials.slice(0, 3).join(", ")}, and a few key accessories. The secret is in the proportions and palette — stick to ${aesthetic.colorPalette.length > 0 ? "your core tones" : "neutrals"} and let each piece earn its place. Start with the foundational pieces: ${aesthetic.essentials[0]} and ${aesthetic.essentials[1]}. Everything should work with everything else. Quality over quantity — three perfect pieces outperform fifteen mediocre ones.`;
    }
    return "A capsule wardrobe is about intention. Start with 10 hero pieces that work in multiple combinations — a perfect blazer, well-cut trousers, a versatile dress, two great bags, and three pairs of shoes. Build outward from there. The goal is maximum outfits from minimum pieces.";
  }

  if (lower.includes("summer") || lower.includes("warm")) {
    return "Summer dressing is about lightness — physically and visually. Linen, cotton, silk — fabrics that breathe. Silhouettes that don't cling in heat. Think open necklines, relaxed hems, and shoes that won't cause discomfort in warm weather. Keep your accessories minimal — one good earring is enough when the air is warm and the mood is light.";
  }

  if (lower.includes("winter") || lower.includes("cold")) {
    return "Winter dressing is layering as an art form. Start with your base — a fine knit or silk layer — and build textures outward. The key piece is always a coat worth remembering. Think deep tones: burgundy, forest green, camel, charcoal. Scarves and boots are where winter style lives. Don't sacrifice elegance for warmth — the two coexist beautifully.";
  }

  if (lower.includes("classic")) {
    const a = aesthetics.find((a) => a.id === "classic")!;
    return `Classic style is about investing in pieces that ignore the calendar. Start with a tailored blazer, then a perfect white shirt. Add high-waist straight trousers. From there: one leather bag (look at Polène or COS for value), pointed flats or kitten heels, and pearl earrings. The rules: ${a.styleRules[0]}. Wear it for twenty years. Never apologise for looking like an adult.`;
  }

  if (lower.includes("streetwear") || lower.includes("street")) {
    const a = aesthetics.find((a) => a.id === "streetwear")!;
    return `Streetwear's foundation is the oversized silhouette. If your clothes fit, they're not streetwear. Start with a graphic tee from a brand you actually love — the message matters. Cargo pants or wide-leg trousers. A statement sneaker. The rest is yours: a hoodie, a bag with attitude, a chain or beanie that means something. Key rule: ${a.styleRules[0]}`;
  }

  if (lower.includes("minimalist")) {
    return "Minimalist dressing is a practice, not a trend. Everything you own should earn its place. Start an edit: if it doesn't work with three other things you own, it goes. Build around white, black, and one accent tone. COS and Uniqlo for the foundation. Polène for your bag. One gold and one silver piece of jewellery. The goal is a wardrobe where getting dressed is a decision made in 60 seconds.";
  }

  if (lower.includes("date") || lower.includes("evening")) {
    return "An evening look should make you feel like the best version of yourself — not costumed. If your aesthetic is Classic: a midi slip dress, kitten heels, simple earrings. Streetwear: one elevated piece (the jacket, the shoe) paired with your usual ease. Soft Girl: something in your palette, delicate jewellery, a beautiful bag. The secret is always: wear something you've worn before and loved. Comfort reads as confidence.";
  }

  if (lower.includes("budget") || lower.includes("affordable") || lower.includes("cheap")) {
    return "The most elevated looks don't require luxury prices — they require intentional editing. H&M Conscious, COS sale, Uniqlo, and Mango deliver quality worth wearing. Invest in: the bag (look secondhand for designer), the shoes (well-made, not trendy), the coat. Save on: basic tees, everyday trousers, casual basics. The hierarchy: spend on what touches the silhouette's edge — shoes, bag, outerwear — save on what fills the middle.";
  }

  if (lower.includes("soft girl")) {
    return "Soft Girl is the aesthetic of intentional femininity. The palette is your structure: pastels only, mixing freely. Key pieces: a pastel cardigan (buy it slightly oversized), a floral dress or midi skirt, Mary Jane flats. Hair accessories matter as much as the outfit — collect bow clips and pearl pins. Layer delicate jewellery. The beauty look is skin-first, a cloud of blush, and lip gloss. It should feel gentle, deliberate, and entirely yours.";
  }

  if (lower.includes("korean") || lower.includes("k-style") || lower.includes("seoul")) {
    return "Korean fashion is built on proportion play. Oversized top with slim bottom — or wide top with wide trousers. The Seoul formula works because every element is considered, even when it appears effortless. Key pieces: oversized knit vest or cropped jacket, high-waist wide trousers or mini skirt, platform trainers. Layering is the technique: start from a slim base and add volume deliberately. The accessories are small, precise, and plentiful.";
  }

  if (lower.includes("dark academia")) {
    return "Dark Academia dressing is literary, layered, and deeply intentional. The palette: warm browns, burgundy, forest green, navy, and ivory. Build your foundation on a tweed or herringbone blazer, high-waist wide trousers, and Oxford brogues. The satchel bag is non-negotiable. Add a plaid scarf and turtleneck knit. The look should suggest you've just emerged from an ancient library with a stack of novels and a very specific opinion about them.";
  }

  if (lower.includes("vintage")) {
    return "Vintage dressing is curation and confidence. The key is integration — your vintage hero piece (a silk printed blouse, a perfect 70s flare trouser, a structured coat) paired with modern basics, not a full costume. Mix decades freely. Modern minimal footwear balances a statement vintage silhouette. The palette is warm: rust, amber, olive, cream. One perfectly chosen piece says more than a fully vintage look.";
  }

  if (lower.includes("elegant")) {
    return "Elegance is studied restraint. Everything you add should have a reason to be there; everything you remove should make the look better. Work with drape and movement: satin, silk, fine crepe. Column silhouettes, soft wrapping, minimal ornamentation. The jewellery should be delicate or architectural — nothing in between. Shoes should be barely there or definitively pointed. Monochrome or tonal dressing creates the most immediate polish. Always leave something unsaid.";
  }

  if (lower.includes("y2k") || lower.includes("2000s") || lower.includes("noughties")) {
    return "Y2K style is nostalgia weaponised — you're playing with a specific visual language from a specific decade, so commitment is key. The low-rise silhouette is foundational. Layer micro-bags, rhinestone accessories, butterfly clips. Platform shoes or chunky trainers. The palette: metallics, baby blue, pink, silver. The textures: velour, satin, holographic. The Y2K trick is knowing which 2000s moments to reference — and letting a few key pieces carry the whole look.";
  }

  // Generic fallback
  return "Great style starts with self-knowledge. Before I can give you specific advice, tell me: what aesthetic draws you in? What makes you feel most yourself when you're dressed? The best wardrobe is built from the inside out — understanding your own aesthetic is the first step. Try our Style Quiz to discover your aesthetic, then come back and I'll build your perfect wardrobe from there.";
}

export default function StylistPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "stylist",
      text: "Hello. I'm your personal AURA stylist — here to help you build, refine, and discover your aesthetic. Ask me anything: capsule wardrobes, outfit ideas, shopping guidance, or how to dress for any occasion or aesthetic. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(text?: string) {
    const messageText = text ?? input.trim();
    if (!messageText) return;
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const response = stylistResponse(messageText);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "stylist",
          text: response,
          timestamp: new Date(),
        },
      ]);
    }, 1200 + Math.random() * 800);
  }

  return (
    <div className="min-h-screen bg-aura-black flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="border-b border-white/5 pt-24 pb-6 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <p className="text-label text-gold mb-2">AI Stylist</p>
          <h1
            className="font-cormorant text-cream font-light"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Your Personal Style Advisor
          </h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 md:px-16 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <div
                className={`max-w-xl px-6 py-4 ${
                  msg.role === "stylist"
                    ? "bg-charcoal border border-white/6"
                    : "bg-gold/15 border border-gold/30"
                }`}
              >
                {msg.role === "stylist" && (
                  <p className="text-label text-gold mb-2" style={{ fontSize: "0.55rem" }}>
                    AURA Stylist
                  </p>
                )}
                <p className="text-body text-cream/75 text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-charcoal border border-white/6 px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-cream/40"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="px-6 md:px-16 pb-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-label text-cream/20 mb-3" style={{ fontSize: "0.6rem" }}>
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-label text-cream/40 hover:text-cream/80 border border-white/8 hover:border-white/20 px-3 py-2 transition-all duration-300 text-left"
                  style={{ fontSize: "0.65rem" }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/5 px-6 md:px-16 py-5">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask your stylist anything..."
            className="flex-1 bg-charcoal border border-white/8 focus:border-gold/50 text-cream/80 placeholder-cream/20 text-sm px-5 py-3.5 outline-none transition-colors duration-300 text-body"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className={`flex-shrink-0 text-label px-6 py-3.5 transition-all duration-300 ${
              input.trim() ? "bg-gold text-aura-black hover:bg-gold/90" : "bg-white/5 text-cream/20"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
