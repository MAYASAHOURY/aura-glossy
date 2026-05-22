export type Category = "clothing" | "shoes" | "bags" | "accessories" | "beauty" | "jewelry";
export type Tier = "affordable" | "mid" | "luxury";

export interface Product {
  id: string;
  brand: string;
  name: string;
  category: Category;
  tier: Tier;
  price: string;
  href: string;
  brandColor: string;
  accentColor: string;
  description: string;
  image?: string;
}

export interface OutfitCombo {
  name: string;
  tier: Tier;
  pieces: Array<{ item: string; brand: string; price: string }>;
  note: string;
}

export interface AestheticShopping {
  products: Product[];
  outfits: OutfitCombo[];
  styleTips: string[];
}

type ShoppingData = Record<string, AestheticShopping>;

function p(
  brand: string, name: string, category: Category, tier: Tier,
  price: string, href: string, brandColor: string, accentColor: string,
  description: string, image?: string
): Product {
  return {
    id: `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    brand, name, category, tier, price, href,
    brandColor, accentColor, description, image,
  };
}

function outfit(name: string, tier: Tier, pieces: Array<{ item: string; brand: string; price: string }>, note: string): OutfitCombo {
  return { name, tier, pieces, note };
}

export const shoppingData: ShoppingData = {
  classic: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Tailored Ponte Blazer", "clothing", "affordable", "£49.99", "https://www2.hm.com", "#F5EDD6", "#C4973B", "Sharp structure, clean lapels, wardrobe cornerstone."),
      p("Pull&Bear", "Classic Straight-Leg Trousers", "clothing", "affordable", "£29.99", "https://www.pullandbear.com", "#2D2D2D", "#8A8278", "High-waist, streamlined, eternally flattering."),
      p("Bershka", "Satin Pussy-Bow Blouse", "clothing", "affordable", "£22.99", "https://www.bershka.com", "#1A1A2E", "#C4973B", "Silk-look finish, a nod to boardroom femininity."),
      p("H&M", "Classic Trench Coat", "clothing", "affordable", "£69.99", "https://www2.hm.com", "#F5EDD6", "#C4973B", "The coat that does everything without asking."),
      p("SHEIN", "High-Waist Pencil Skirt", "clothing", "affordable", "£18.00", "https://www.shein.com", "#FF4747", "#8A8278", "Knee-length, clean back slit, tailored energy."),
      p("H&M", "Pointed-Toe Ballet Flats", "shoes", "affordable", "£34.99", "https://www2.hm.com", "#F5EDD6", "#C4973B", "The quintessential flat. Works with everything."),
      p("Pull&Bear", "Block-Heel Court Shoes", "shoes", "affordable", "£32.99", "https://www.pullandbear.com", "#2D2D2D", "#C4973B", "Stable heel, clean toe — office to evening."),
      p("Bershka", "Structured Leather-Look Bag", "bags", "affordable", "£25.99", "https://www.bershka.com", "#1A1A2E", "#8A8278", "Clean lines, gold hardware, effortlessly polished."),
      p("H&M", "Pearl Drop Earrings", "jewelry", "affordable", "£9.99", "https://www2.hm.com", "#F5EDD6", "#C4973B", "Understated elegance. Never needs updating."),
      p("H&M", "Silk-Look Satin Scarf", "accessories", "affordable", "£19.99", "https://www2.hm.com", "#F5EDD6", "#C4973B", "Versatile — neck, bag handle, or hair. Eternal."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("COS", "Structured Wool-Blend Coat", "clothing", "mid", "£195", "https://www.cos.com", "#F2F0EB", "#8A8278", "The investment piece that defines the season."),
      p("Mango", "Pleated Satin Midi Skirt", "clothing", "mid", "£69.99", "https://www.mango.com", "#C8533A", "#E8D5A3", "Fluid, feminine movement. Day-to-evening effortlessly."),
      p("Uniqlo", "Premium Lambswool Crewneck", "clothing", "mid", "£79.90", "https://www.uniqlo.com", "#E52224", "#F5EDD6", "Cashmere feel at a fraction of the price."),
      p("ASOS", "Silk Pussy-Bow Blouse", "clothing", "mid", "£65.00", "https://www.asos.com", "#1A1A3E", "#C4973B", "Elevated silk blouse with an effortless drape."),
      p("Zara", "Tailored Wide-Leg Suit Trousers", "clothing", "mid", "£59.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "Long line, generous leg, impeccably pressed."),
      p("Zara", "Block-Heel Leather Pumps", "shoes", "mid", "£79.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "The heel height that flatters every silhouette."),
      p("Mango", "Leather Belt Bag", "bags", "mid", "£59.99", "https://www.mango.com", "#C8533A", "#C4973B", "Crossbody or belt-worn. Structured and considered."),
      p("COS", "Clean-Line Leather Tote", "bags", "mid", "£145", "https://www.cos.com", "#F2F0EB", "#8A8278", "Architectural bag, holds everything with grace."),
      p("Mango", "Gold Multi-Chain Necklace", "jewelry", "mid", "£29.99", "https://www.mango.com", "#C8533A", "#E8D5A3", "Layered, luxurious — elevates any neckline."),
      p("COS", "Leather Slim Belt", "accessories", "mid", "£55", "https://www.cos.com", "#F2F0EB", "#8A8278", "Gold buckle, clean finish — defines every silhouette."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Jacquemus", "Le Chiquito Long Bag", "bags", "luxury", "€490", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "Sculpted leather. The bag fashion week lives for."),
      p("Polène", "Numéro Un Nano", "bags", "luxury", "€295", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Pebbled leather, minimalist closure, cult favourite."),
      p("Acne Studios", "Double-Breasted Wool Coat", "clothing", "luxury", "€950", "https://www.acnestudios.com", "#FF7345", "#F5EDD6", "The coat you'll wear for twenty years."),
      p("Acne Studios", "Cashmere Turtleneck", "clothing", "luxury", "€580", "https://www.acnestudios.com", "#FF7345", "#C4973B", "Cloud-soft cashmere, endlessly refined."),
      p("Reformation", "Eloise Midi Dress", "clothing", "luxury", "$278", "https://www.thereformation.com", "#2D4A1E", "#E8D5A3", "Sustainable luxury. Perfect proportions, forever."),
      p("Reformation", "Silk Wrap Blouse", "clothing", "luxury", "$188", "https://www.thereformation.com", "#2D4A1E", "#C4973B", "Bias-cut silk, falls perfectly, season-less."),
      p("Dior Beauty", "Rouge Dior Lipstick", "beauty", "luxury", "$42", "https://www.dior.com", "#1A0A0A", "#C4973B", "The most iconic red. One coat, complete."),
      p("Tiffany & Co.", "T Wire Bracelet", "jewelry", "luxury", "$575", "https://www.tiffany.com", "#0ABAB5", "#F5F5F5", "Architectural elegance on the wrist."),
      p("Polène", "Numéro Neuf Mini", "bags", "luxury", "€285", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Suede structure, understated everyday luxury."),
      p("Jacquemus", "La Bomba Hat", "accessories", "luxury", "€195", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "The wide brim that becomes the whole outfit."),
    ],
    outfits: [
      outfit("The Polished Daily", "affordable", [
        { item: "Tailored Ponte Blazer", brand: "H&M", price: "£49.99" },
        { item: "Straight-Leg Trousers", brand: "Pull&Bear", price: "£29.99" },
        { item: "Pointed-Toe Ballet Flats", brand: "H&M", price: "£34.99" },
        { item: "Structured Bag", brand: "Bershka", price: "£25.99" },
        { item: "Pearl Drop Earrings", brand: "H&M", price: "£9.99" },
      ], "Tie the satin scarf to the bag handle, pull hair back, and this becomes a complete editorial look under £150."),
      outfit("The Weekend Refined", "mid", [
        { item: "Structured Wool-Blend Coat", brand: "COS", price: "£195" },
        { item: "Pleated Satin Midi Skirt", brand: "Mango", price: "£69.99" },
        { item: "Block-Heel Leather Pumps", brand: "Zara", price: "£79.99" },
        { item: "Clean-Line Leather Tote", brand: "COS", price: "£145" },
        { item: "Gold Multi-Chain Necklace", brand: "Mango", price: "£29.99" },
      ], "The midi skirt peeking below the structured coat is the detail that makes this look editorial. Keep it tonal."),
      outfit("The Investment Wardrobe", "luxury", [
        { item: "Double-Breasted Wool Coat", brand: "Acne Studios", price: "€950" },
        { item: "Eloise Midi Dress", brand: "Reformation", price: "$278" },
        { item: "Le Chiquito Long Bag", brand: "Jacquemus", price: "€490" },
        { item: "T Wire Bracelet", brand: "Tiffany & Co.", price: "$575" },
        { item: "Rouge Dior Lipstick", brand: "Dior Beauty", price: "$42" },
      ], "One luxury coat transforms everything underneath. Buy it once. It earns back every wearing."),
    ],
    styleTips: [
      "A well-tailored blazer outperforms ten trend pieces — invest in the cut above all else.",
      "Proportion is the secret: always balance wide-leg with a fitted top, or a boxy coat with a slim skirt.",
      "Accessories tell the whole story in Classic dressing — one gold earring and a structured bag is enough.",
      "Build your shoe wardrobe in black, camel, and burgundy leather. They carry every outfit forward.",
    ],
  },

  streetwear: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Oversized Graphic Tee", "clothing", "affordable", "£14.99", "https://www2.hm.com", "#F5EDD6", "#E84040", "Bold print, boxy cut, effortless cool."),
      p("SHEIN", "Wide-Leg Cargo Joggers", "clothing", "affordable", "£18.00", "https://www.shein.com", "#FF4747", "#1A1A1A", "Multi-pocket silhouette, adjustable drawstring."),
      p("SHEIN", "Oversized Bomber Jacket", "clothing", "affordable", "£28.00", "https://www.shein.com", "#FF4747", "#E84040", "Satin finish, ribbed cuffs, culture-coded."),
      p("Bershka", "Wide-Leg Cargo Trousers", "clothing", "affordable", "£27.99", "https://www.bershka.com", "#1A1A2E", "#E84040", "Low-rise, utility pockets, street-essential."),
      p("H&M", "Tie-Dye Oversized Hoodie", "clothing", "affordable", "£24.99", "https://www2.hm.com", "#F5EDD6", "#E84040", "Washed-out tones, relaxed fit, always right."),
      p("H&M", "Chunky Lug-Sole Sneakers", "shoes", "affordable", "£39.99", "https://www2.hm.com", "#F5EDD6", "#E84040", "Platform height, statement sole, all-day wear."),
      p("AliExpress", "Crossbody Messenger Bag", "bags", "affordable", "£15.00", "https://www.aliexpress.com", "#E85926", "#1A1A1A", "Hands-free, practical, street-ready."),
      p("AliExpress", "Logo Cap", "accessories", "affordable", "£12.00", "https://www.aliexpress.com", "#E85926", "#E84040", "Structured six-panel, wear forward or backwards."),
      p("H&M", "Beanie Ribbed Hat", "accessories", "affordable", "£7.99", "https://www2.hm.com", "#F5EDD6", "#E84040", "Wear low, wear slouchy, always right."),
      p("SHEIN", "Layered Chain Necklace", "jewelry", "affordable", "£8.00", "https://www.shein.com", "#FF4747", "#C0C0C0", "Industrial chain links, cool metallic weight."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("ASOS", "Oversized Denim Jacket", "clothing", "mid", "£65.00", "https://www.asos.com", "#1A1A3E", "#E84040", "Vintage wash, dropped shoulders, customise freely."),
      p("Zara", "Technical Cargo Trousers", "clothing", "mid", "£59.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "Water-repellent fabric, utilitarian pockets."),
      p("Princess Polly", "Boxy Varsity Bomber", "clothing", "mid", "AUD $89", "https://www.princess-polly.com", "#FF69B4", "#1A1A1A", "Collegiate energy, modern proportions."),
      p("Mango", "Oversized Graphic Hoodie", "clothing", "mid", "£59.99", "https://www.mango.com", "#C8533A", "#E84040", "Heavyweight fleece, statement front graphic."),
      p("Zara", "Oversized Puffer Jacket", "clothing", "mid", "£79.99", "https://www.zara.com", "#1D1D1D", "#E84040", "Quilted channels, city-essential outerwear."),
      p("ASOS", "Chunky Platform Boots", "shoes", "mid", "£75.00", "https://www.asos.com", "#1A1A3E", "#E84040", "Combat sole, zip-up, stomps in the best way."),
      p("Zara", "Mini Graphic Print Tote", "bags", "mid", "£29.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "Artist-collab energy without the resale markup."),
      p("ASOS", "Wide-Leg Sweatpants", "clothing", "mid", "£45.00", "https://www.asos.com", "#1A1A3E", "#E84040", "Heavy cotton, wide leg — the relaxed standard."),
      p("ASOS", "Shield Wrap Sunglasses", "accessories", "mid", "£20.00", "https://www.asos.com", "#1A1A3E", "#E84040", "Future-forward lens shape, instant attitude."),
      p("COS", "Logo Sweatshirt", "clothing", "mid", "£95", "https://www.cos.com", "#F2F0EB", "#E84040", "Heavyweight fleece, clean COS mark, wears forever."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Acne Studios", "Logo Oversized Hoodie", "clothing", "luxury", "€320", "https://www.acnestudios.com", "#FF7345", "#F5EDD6", "The face patch. Premium fleece. Cult status."),
      p("Acne Studios", "Distressed Wide-Leg Denim", "clothing", "luxury", "€420", "https://www.acnestudios.com", "#FF7345", "#E84040", "Intentionally worn, perfectly balanced cut."),
      p("Jacquemus", "Le Sac Rond Mini Bag", "bags", "luxury", "€450", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "Sculptural circle bag. Statement without trying."),
      p("Jacquemus", "Le Bomber Jacket", "clothing", "luxury", "€790", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "The luxury bomber — structured, impeccable, iconic."),
      p("Acne Studios", "Distressed Wool Scarf", "accessories", "luxury", "€250", "https://www.acnestudios.com", "#FF7345", "#F5EDD6", "The scarf that started a thousand copies."),
      p("Acne Studios", "Logo Wool Cap", "accessories", "luxury", "€180", "https://www.acnestudios.com", "#FF7345", "#F5EDD6", "Premium wool, tonal logo, always the right cap."),
      p("Reformation", "Oversized Leather Jacket", "clothing", "luxury", "$448", "https://www.thereformation.com", "#2D4A1E", "#E84040", "Sustainable leather, boxy perfection, forever piece."),
      p("Dior Beauty", "Backstage Face & Body Foundation", "beauty", "luxury", "$52", "https://www.dior.com", "#1A0A0A", "#E84040", "Skin-like finish. The backstage secret."),
      p("Tiffany & Co.", "City HardWear Link Bracelet", "jewelry", "luxury", "$825", "https://www.tiffany.com", "#0ABAB5", "#F5F5F5", "Sterling chain, industrial-luxe, unmistakably Tiffany."),
      p("Acne Studios", "Logo Crewneck Sweatshirt", "clothing", "luxury", "€280", "https://www.acnestudios.com", "#FF7345", "#F5EDD6", "French terry, chest logo, essential street luxury."),
    ],
    outfits: [
      outfit("The Off-Duty Drop", "affordable", [
        { item: "Wide-Leg Cargo Joggers", brand: "SHEIN", price: "£18.00" },
        { item: "Oversized Graphic Tee", brand: "H&M", price: "£14.99" },
        { item: "Chunky Lug-Sole Sneakers", brand: "H&M", price: "£39.99" },
        { item: "Crossbody Messenger Bag", brand: "AliExpress", price: "£15.00" },
        { item: "Beanie Ribbed Hat", brand: "H&M", price: "£7.99" },
      ], "Tuck one side of the tee only. The asymmetry is the detail. Proportion is everything in this look."),
      outfit("The Elevated Street", "mid", [
        { item: "Oversized Denim Jacket", brand: "ASOS", price: "£65.00" },
        { item: "Technical Cargo Trousers", brand: "Zara", price: "£59.99" },
        { item: "Chunky Platform Boots", brand: "ASOS", price: "£75.00" },
        { item: "Mini Graphic Print Tote", brand: "Zara", price: "£29.99" },
        { item: "Shield Wrap Sunglasses", brand: "ASOS", price: "£20.00" },
      ], "Wear the denim jacket slightly off one shoulder. Stack the chain necklaces. Let the boots do the rest."),
      outfit("The Cult Edit", "luxury", [
        { item: "Logo Oversized Hoodie", brand: "Acne Studios", price: "€320" },
        { item: "Distressed Wide-Leg Denim", brand: "Acne Studios", price: "€420" },
        { item: "Le Sac Rond Mini Bag", brand: "Jacquemus", price: "€450" },
        { item: "City HardWear Link Bracelet", brand: "Tiffany & Co.", price: "$825" },
        { item: "Distressed Wool Scarf", brand: "Acne Studios", price: "€250" },
      ], "The hoodie + luxury micro bag juxtaposition is the formula that defines elevated streetwear. Nothing here is accidental."),
    ],
    styleTips: [
      "The sneaker is always the centrepiece — build every streetwear outfit around the shoe first.",
      "Oversized on top, tapered or fitted on bottom is the foundational proportion formula.",
      "One graphic piece per outfit maximum — let it be the voice, everything else supports it.",
      "Layering creates the depth: unzip the jacket, let the hoodie show, stack the chains.",
    ],
  },

  casual: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Linen-Blend Relaxed Shirt", "clothing", "affordable", "£19.99", "https://www2.hm.com", "#F5EDD6", "#7A9E7E", "Breathable, breezy, lives in every season."),
      p("Cider", "Relaxed Straight Jeans", "clothing", "affordable", "$28.00", "https://www.cider.com", "#F9E4C8", "#7A9E7E", "High-rise, medium wash, universally flattering."),
      p("Bershka", "Denim Shorts", "clothing", "affordable", "£19.99", "https://www.bershka.com", "#1A1A2E", "#7A9E7E", "Frayed hem, relaxed fit, summer staple."),
      p("SHEIN", "Ribbed Fitted Tank", "clothing", "affordable", "£10.00", "https://www.shein.com", "#FF4747", "#7A9E7E", "Stretch rib, tucks in or layers out."),
      p("H&M", "Cotton Maxi Dress", "clothing", "affordable", "£29.99", "https://www2.hm.com", "#F5EDD6", "#7A9E7E", "Effortless length, adjustable straps, all-day ease."),
      p("H&M", "Canvas Low-Top Sneakers", "shoes", "affordable", "£19.99", "https://www2.hm.com", "#F5EDD6", "#7A9E7E", "Clean lines, no fuss, good for everything."),
      p("Pull&Bear", "Slip-On Canvas Shoes", "shoes", "affordable", "£22.99", "https://www.pullandbear.com", "#2D2D2D", "#7A9E7E", "Easy on, easy off, goes with everything."),
      p("H&M", "Large Canvas Tote", "bags", "affordable", "£12.99", "https://www2.hm.com", "#F5EDD6", "#7A9E7E", "Oversized, practical, market-to-museum ready."),
      p("Cider", "Terry Bucket Hat", "accessories", "affordable", "$16.00", "https://www.cider.com", "#F9E4C8", "#7A9E7E", "Weekend energy, sun protection, instant cool."),
      p("H&M", "Woven Cord Bracelet", "jewelry", "affordable", "£5.99", "https://www2.hm.com", "#F5EDD6", "#7A9E7E", "Casual stacking piece, natural materials."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Uniqlo", "Linen Relaxed Trousers", "clothing", "mid", "£39.90", "https://www.uniqlo.com", "#E52224", "#7A9E7E", "Breathable linen, wide leg, perfect drape."),
      p("Uniqlo", "Cotton-Cashmere Cardigan", "clothing", "mid", "£59.90", "https://www.uniqlo.com", "#E52224", "#E8D5A3", "Soft touch, ribbed knit, long-sleeve ease."),
      p("Mango", "Organic Cotton T-Shirt", "clothing", "mid", "£29.99", "https://www.mango.com", "#C8533A", "#7A9E7E", "The perfect white tee — elevated quality, clean cut."),
      p("Uniqlo", "UV-Protection Linen Shirt", "clothing", "mid", "£39.90", "https://www.uniqlo.com", "#E52224", "#7A9E7E", "Protects and breathes — the holiday essential."),
      p("Zara", "Relaxed-Fit Straight Denim", "clothing", "mid", "£49.99", "https://www.zara.com", "#1D1D1D", "#7A9E7E", "Mid-rise, easy leg, gets better with age."),
      p("COS", "Minimal Leather Trainers", "shoes", "mid", "£115", "https://www.cos.com", "#F2F0EB", "#8A8278", "Understated, clean, go with everything."),
      p("ASOS", "Cork Flatform Sandals", "shoes", "mid", "£45.00", "https://www.asos.com", "#1A1A3E", "#7A9E7E", "Natural texture, slight height, summer staple."),
      p("ASOS", "Pebbled Leather Bucket Bag", "bags", "mid", "£55.00", "https://www.asos.com", "#1A1A3E", "#7A9E7E", "Relaxed shape, drawstring top, wear daily."),
      p("Zara", "Gold Hoop Earrings", "jewelry", "mid", "£17.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "Thin, medium hoop. The universal earring."),
      p("Mango", "Slouchy Canvas Shopper", "bags", "mid", "£39.99", "https://www.mango.com", "#C8533A", "#7A9E7E", "Soft structure, everyday companion, washes well."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Reformation", "Denim Button-Up Shirt", "clothing", "luxury", "$148", "https://www.thereformation.com", "#2D4A1E", "#7A9E7E", "Sustainable denim, relaxed fit, endlessly wearable."),
      p("Reformation", "Linen Wide-Leg Set", "clothing", "luxury", "$248", "https://www.thereformation.com", "#2D4A1E", "#7A9E7E", "Matching linen, easy living, elevated casual."),
      p("Acne Studios", "Mohair Crewneck Sweater", "clothing", "luxury", "€420", "https://www.acnestudios.com", "#FF7345", "#7A9E7E", "Cloud-soft mohair, oversized, season-defining."),
      p("Acne Studios", "Wide-Leg Linen Trousers", "clothing", "luxury", "€380", "https://www.acnestudios.com", "#FF7345", "#7A9E7E", "Beautifully draped, relaxed at the waist, effortless."),
      p("Polène", "Numéro Neuf Mini", "bags", "luxury", "€285", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Gentle suede, structured base, everyday luxury."),
      p("Jacquemus", "Le Raphia Bag", "bags", "luxury", "€350", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "Natural raffia weave — the summer bag elevated."),
      p("Dior Beauty", "Lip Glow Oil", "beauty", "luxury", "$44", "https://www.dior.com", "#1A0A0A", "#C4973B", "Nourishing, tinted, the barely-there lip."),
      p("Tiffany & Co.", "Love Tag Bracelet", "jewelry", "luxury", "$250", "https://www.tiffany.com", "#0ABAB5", "#F5F5F5", "Return to Tiffany. The iconic everyday piece."),
      p("Reformation", "Linen Midi Skirt", "clothing", "luxury", "$128", "https://www.thereformation.com", "#2D4A1E", "#7A9E7E", "A-line linen, breathes beautifully, seasons effortlessly."),
      p("Polène", "Wristlet Bag", "bags", "luxury", "€195", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Small leather loop, hands-free casual luxury."),
    ],
    outfits: [
      outfit("The Market Day", "affordable", [
        { item: "Linen-Blend Relaxed Shirt", brand: "H&M", price: "£19.99" },
        { item: "Relaxed Straight Jeans", brand: "Cider", price: "$28.00" },
        { item: "Canvas Low-Top Sneakers", brand: "H&M", price: "£19.99" },
        { item: "Large Canvas Tote", brand: "H&M", price: "£12.99" },
        { item: "Terry Bucket Hat", brand: "Cider", price: "$16.00" },
      ], "Leave the shirt untucked and roll the sleeves once. This look lives on film and in real life equally."),
      outfit("The Saturday Best", "mid", [
        { item: "Linen Relaxed Trousers", brand: "Uniqlo", price: "£39.90" },
        { item: "Cotton-Cashmere Cardigan", brand: "Uniqlo", price: "£59.90" },
        { item: "Minimal Leather Trainers", brand: "COS", price: "£115" },
        { item: "Pebbled Leather Bucket Bag", brand: "ASOS", price: "£55.00" },
        { item: "Gold Hoop Earrings", brand: "Zara", price: "£17.99" },
      ], "Tonal neutral palette throughout. The cardigan half-tucked into the trouser waistband is the defining detail."),
      outfit("The Quiet Elevated", "luxury", [
        { item: "Linen Wide-Leg Set", brand: "Reformation", price: "$248" },
        { item: "Numéro Neuf Mini", brand: "Polène", price: "€285" },
        { item: "Mohair Crewneck Sweater", brand: "Acne Studios", price: "€420" },
        { item: "Lip Glow Oil", brand: "Dior Beauty", price: "$44" },
        { item: "Love Tag Bracelet", brand: "Tiffany & Co.", price: "$250" },
      ], "Invest once in a matching linen set — it photographs beautifully and requires zero styling effort. Tie the Acne sweater over the shoulders for cooler evenings."),
    ],
    styleTips: [
      "Linen and cotton breathe beautifully — fabric quality reads on camera and in person immediately.",
      "Roll one sleeve, leave the other. The small asymmetry makes casual feel thoughtful.",
      "One elevated piece transforms the whole look — a good bag turns jeans and a tee editorial.",
      "The shoe is never truly casual. Choose it with as much intention as anything else.",
    ],
  },

  minimalist: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Slim-Fit Cotton Poplin Shirt", "clothing", "affordable", "£14.99", "https://www2.hm.com", "#F5EDD6", "#A0A09A", "Crisp white, unadorned — the foundation of everything."),
      p("Bershka", "Straight-Cut Black Trousers", "clothing", "affordable", "£25.99", "https://www.bershka.com", "#1A1A2E", "#A0A09A", "Clean silhouette, no detailing. Perfectly minimal."),
      p("Bershka", "Ribbed Fitted Tank", "clothing", "affordable", "£12.99", "https://www.bershka.com", "#1A1A2E", "#A0A09A", "Stretch rib, body-skimming, wear alone or layered."),
      p("H&M", "Wide-Leg High-Waist Trousers", "clothing", "affordable", "£29.99", "https://www2.hm.com", "#F5EDD6", "#A0A09A", "Floor-length, clean line, one and done."),
      p("SHEIN", "Monochrome Co-ord Set", "clothing", "affordable", "£28.00", "https://www.shein.com", "#FF4747", "#A0A09A", "Matching top and trouser — the minimal uniform."),
      p("H&M", "White Leather-Look Sneakers", "shoes", "affordable", "£24.99", "https://www2.hm.com", "#F5EDD6", "#A0A09A", "Pristine sole, no logos. The clean sneaker."),
      p("Pull&Bear", "Simple Slide Sandals", "shoes", "affordable", "£18.99", "https://www.pullandbear.com", "#2D2D2D", "#A0A09A", "One strap, no buckle. Reductive perfection."),
      p("H&M", "Micro-Structure Mini Bag", "bags", "affordable", "£19.99", "https://www2.hm.com", "#F5EDD6", "#A0A09A", "Simple geometry, one clasp, one compartment."),
      p("H&M", "Geometric Silver Earrings", "jewelry", "affordable", "£7.99", "https://www2.hm.com", "#F5EDD6", "#C0C0C0", "Clean lines, no fuss. Modern sculpture for the ear."),
      p("H&M", "Matte Nude Nail Polish", "beauty", "affordable", "£4.99", "https://www2.hm.com", "#F5EDD6", "#A0A09A", "Nude or clear. The minimal beauty choice."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("COS", "Long Clean-Line Overcoat", "clothing", "mid", "£195", "https://www.cos.com", "#F2F0EB", "#8A8278", "Floor-grazing hem, no collar drama. Architectural."),
      p("Uniqlo", "Ultra Light Down Jacket", "clothing", "mid", "£89.90", "https://www.uniqlo.com", "#E52224", "#A0A09A", "Packs flat, weighs nothing, goes everywhere."),
      p("COS", "Ribbed Knit Longline Set", "clothing", "mid", "£120", "https://www.cos.com", "#F2F0EB", "#A0A09A", "Column silhouette, matching, supremely considered."),
      p("Uniqlo", "Merino Mock-Neck Sweater", "clothing", "mid", "£59.90", "https://www.uniqlo.com", "#E52224", "#A0A09A", "Fine merino, slim-fit, the winter foundation."),
      p("Zara", "Clean Midi Shirt Dress", "clothing", "mid", "£55.99", "https://www.zara.com", "#1D1D1D", "#A0A09A", "Elongated proportion, minimal buttons, no noise."),
      p("COS", "Polished Leather Loafers", "shoes", "mid", "£175", "https://www.cos.com", "#F2F0EB", "#8A8278", "Clean toe, thin sole, no embellishment."),
      p("COS", "Leather Minimal Mule", "shoes", "mid", "£145", "https://www.cos.com", "#F2F0EB", "#8A8278", "Backless, pointed toe, quiet authority."),
      p("COS", "Structured Vegetable-Tan Tote", "bags", "mid", "£145", "https://www.cos.com", "#F2F0EB", "#8A8278", "One compartment, one handle, one perfect bag."),
      p("ASOS", "Minimal Crossbody", "bags", "mid", "£35.00", "https://www.asos.com", "#1A1A3E", "#A0A09A", "Small, flat, no hardware. Just structure."),
      p("Mango", "Delicate Sterling Silver Ring", "jewelry", "mid", "£19.99", "https://www.mango.com", "#C8533A", "#C0C0C0", "Thin band, barely there, permanently perfect."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Jacquemus", "Le Bambino Long Bag", "bags", "luxury", "€420", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "One signature curve. The bag at its most essential."),
      p("Polène", "Cyme Bag", "bags", "luxury", "€360", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Knot closure, undone elegance. Quiet perfection."),
      p("Polène", "Numéro Dix Bag", "bags", "luxury", "€335", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Architectural frame, clean lines, enduring form."),
      p("Acne Studios", "High-Waist Tailored Trousers", "clothing", "luxury", "€380", "https://www.acnestudios.com", "#FF7345", "#A0A09A", "The trouser that makes every top work."),
      p("Acne Studios", "Minimal Logo Shirt", "clothing", "luxury", "€290", "https://www.acnestudios.com", "#FF7345", "#A0A09A", "Cotton poplin, barely-there branding, forever."),
      p("Reformation", "Rib Tank Midi Dress", "clothing", "luxury", "$148", "https://www.thereformation.com", "#2D4A1E", "#A0A09A", "Body-skimming rib, no excess, no apology."),
      p("Reformation", "Cashmere Crewneck", "clothing", "luxury", "$298", "https://www.thereformation.com", "#2D4A1E", "#A0A09A", "Pure cashmere, relaxed fit, season-less."),
      p("Dior Beauty", "Forever Natural Nude Foundation", "beauty", "luxury", "$56", "https://www.dior.com", "#1A0A0A", "#E8D5A3", "Second-skin finish. Minimal, perfected."),
      p("Jacquemus", "La Medusa Mini Bag", "bags", "luxury", "€380", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "Compact and sculptural. The minimal bag statement."),
      p("Tiffany & Co.", "T Smile Earrings", "jewelry", "luxury", "$1,050", "https://www.tiffany.com", "#0ABAB5", "#C0C0C0", "The T motif. Bold in its restraint."),
    ],
    outfits: [
      outfit("The Monochrome Morning", "affordable", [
        { item: "Slim-Fit Cotton Poplin Shirt", brand: "H&M", price: "£14.99" },
        { item: "Straight-Cut Black Trousers", brand: "Bershka", price: "£25.99" },
        { item: "White Leather-Look Sneakers", brand: "H&M", price: "£24.99" },
        { item: "Micro-Structure Mini Bag", brand: "H&M", price: "£19.99" },
        { item: "Geometric Silver Earrings", brand: "H&M", price: "£7.99" },
      ], "All white or all black. Choose one palette and commit completely. The absence of variety is the statement."),
      outfit("The Clean Line", "mid", [
        { item: "Long Clean-Line Overcoat", brand: "COS", price: "£195" },
        { item: "Ribbed Knit Longline Set", brand: "COS", price: "£120" },
        { item: "Polished Leather Loafers", brand: "COS", price: "£175" },
        { item: "Structured Vegetable-Tan Tote", brand: "COS", price: "£145" },
        { item: "Delicate Sterling Silver Ring", brand: "Mango", price: "£19.99" },
      ], "COS head to toe is not laziness — it's the uniform of the intentional dresser. The tonal layering speaks louder than any print."),
      outfit("The Quiet Power", "luxury", [
        { item: "High-Waist Tailored Trousers", brand: "Acne Studios", price: "€380" },
        { item: "Rib Tank Midi Dress", brand: "Reformation", price: "$148" },
        { item: "Cyme Bag", brand: "Polène", price: "€360" },
        { item: "T Smile Earrings", brand: "Tiffany & Co.", price: "$1,050" },
        { item: "Forever Natural Nude Foundation", brand: "Dior Beauty", price: "$56" },
      ], "The absence of accessories IS the loudest statement. Keep only what matters absolutely. Let the cut do the work."),
    ],
    styleTips: [
      "If removing a piece makes the look better, remove it — minimalism is an act of curation, not restriction.",
      "The silhouette and seam are your decorations. Make them flawless before adding anything else.",
      "Texture is your colour palette: bouclé, ribbed knit, matte leather, brushed cotton.",
      "Never wear more than one piece with visible branding at a time. One is restraint. Two is noise.",
    ],
  },

  "dark-academia": {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Tweed Double-Breasted Blazer", "clothing", "affordable", "£44.99", "https://www2.hm.com", "#F5EDD6", "#8B7355", "Textured herringbone, brass buttons, intellectual energy."),
      p("Bershka", "Plaid Wide-Leg Trousers", "clothing", "affordable", "£25.99", "https://www.bershka.com", "#1A1A2E", "#8B7355", "Classic check, wide silhouette, academic authority."),
      p("Bershka", "Corduroy Blazer", "clothing", "affordable", "£34.99", "https://www.bershka.com", "#1A1A2E", "#8B7355", "Fine cord texture, earth tones, scholarly layering piece."),
      p("SHEIN", "Ribbed Turtleneck Sweater", "clothing", "affordable", "£18.00", "https://www.shein.com", "#FF4747", "#8B7355", "Fine rib, high neck, the academic base layer."),
      p("H&M", "Longline Cable-Knit Cardigan", "clothing", "affordable", "£34.99", "https://www2.hm.com", "#F5EDD6", "#8B7355", "Draped length, warm texture, worn open over everything."),
      p("H&M", "Oxford Leather-Look Brogues", "shoes", "affordable", "£39.99", "https://www2.hm.com", "#F5EDD6", "#8B7355", "Wing-tip detail, lace-up, walks with intention."),
      p("Pull&Bear", "Oxford Lace-Up Shoes", "shoes", "affordable", "£32.99", "https://www.pullandbear.com", "#2D2D2D", "#8B7355", "Classic silhouette, burnished finish, scholarly."),
      p("H&M", "Satchel-Style Shoulder Bag", "bags", "affordable", "£27.99", "https://www2.hm.com", "#F5EDD6", "#8B7355", "Buckle closure, structured form, scholar-approved."),
      p("H&M", "Ornate Oxidised Choker", "jewelry", "affordable", "£9.99", "https://www2.hm.com", "#F5EDD6", "#8B7355", "Dark metal, antique finish, literary romance."),
      p("H&M", "Plaid Wool-Mix Scarf", "accessories", "affordable", "£12.99", "https://www2.hm.com", "#F5EDD6", "#8B7355", "Oversized plaid. Drape over everything, everywhere."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Zara", "Herringbone Double-Breasted Coat", "clothing", "mid", "£119.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "The coat that belongs in an Oxford courtyard."),
      p("Mango", "Corduroy High-Waist Trousers", "clothing", "mid", "£59.99", "https://www.mango.com", "#C8533A", "#8B7355", "Warm-toned corduroy, straight-leg, scholarly."),
      p("Zara", "Chunky-Knit Cable Cardigan", "clothing", "mid", "£69.99", "https://www.zara.com", "#1D1D1D", "#C4973B", "Dark emerald or burgundy, textured cable knit."),
      p("Mango", "Pleated Wide-Leg Midi Skirt", "clothing", "mid", "£59.99", "https://www.mango.com", "#C8533A", "#8B7355", "Midi length, dark tones, worn with a blazer always."),
      p("COS", "Ribbed Turtleneck Sweater", "clothing", "mid", "£85", "https://www.cos.com", "#F2F0EB", "#8B7355", "Fine merino rib, perfectly proportioned, the base layer."),
      p("ASOS", "Leather Oxford Brogues", "shoes", "mid", "£65.00", "https://www.asos.com", "#1A1A3E", "#8B7355", "Classic brogue, leather upper, aged patina."),
      p("Zara", "Leather-Look Satchel Bag", "bags", "mid", "£49.99", "https://www.zara.com", "#1D1D1D", "#8B7355", "Top flap, structured body, holds books and beauty."),
      p("COS", "Structured Canvas Shopper", "bags", "mid", "£65.00", "https://www.cos.com", "#F2F0EB", "#8B7355", "Unassuming, large, holds a novel and a jacket."),
      p("Mango", "Stacked Stone Ring", "jewelry", "mid", "£24.99", "https://www.mango.com", "#C8533A", "#8B7355", "Dark gemstone setting, worn stacked, worn with gravity."),
      p("ASOS", "Wide-Leg Plaid Trousers", "clothing", "mid", "£55.00", "https://www.asos.com", "#1A1A3E", "#8B7355", "Heritage check, generous leg, cuffed at the ankle."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Acne Studios", "Checked Wool Overcoat", "clothing", "luxury", "€1,100", "https://www.acnestudios.com", "#FF7345", "#8B7355", "Heritage check, maxi-length, impeccable construction."),
      p("Acne Studios", "Chunky Wool Knit Sweater", "clothing", "luxury", "€480", "https://www.acnestudios.com", "#FF7345", "#8B7355", "Heavyweight wool, oversized gauge, academic warmth."),
      p("Acne Studios", "Plaid Wide-Leg Trousers", "clothing", "luxury", "€420", "https://www.acnestudios.com", "#FF7345", "#8B7355", "Heritage plaid, generous proportion, considered cut."),
      p("Polène", "Numéro Dix Bucket Bag", "bags", "luxury", "€335", "https://www.polene-paris.com", "#C8B8A8", "#8B7355", "Dark cognac leather, scholarly and luxurious."),
      p("Polène", "Basalt Bag", "bags", "luxury", "€395", "https://www.polene-paris.com", "#C8B8A8", "#8B7355", "Structured top handle, understated architectural form."),
      p("Jacquemus", "La Vague Shoulder Bag", "bags", "luxury", "€350", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "Wave silhouette, structured leather, editorial weight."),
      p("Reformation", "Plaid Long Blazer", "clothing", "luxury", "$318", "https://www.thereformation.com", "#2D4A1E", "#8B7355", "Sustainable tweed, menswear-inspired, long proportion."),
      p("Reformation", "Wool Blazer", "clothing", "luxury", "$298", "https://www.thereformation.com", "#2D4A1E", "#8B7355", "Sustainable wool, structured shoulder, forever tailoring."),
      p("Dior Beauty", "Diorshow Iconic Mascara", "beauty", "luxury", "$32", "https://www.dior.com", "#1A0A0A", "#8B7355", "Dark, dramatic lashes. The academic eye."),
      p("Tiffany & Co.", "HardWear Link Bracelet", "jewelry", "luxury", "$1,100", "https://www.tiffany.com", "#0ABAB5", "#C0C0C0", "Sterling silver links. Intellectual luxury."),
    ],
    outfits: [
      outfit("The Scholar's Morning", "affordable", [
        { item: "Tweed Double-Breasted Blazer", brand: "H&M", price: "£44.99" },
        { item: "Plaid Wide-Leg Trousers", brand: "Bershka", price: "£25.99" },
        { item: "Oxford Leather-Look Brogues", brand: "H&M", price: "£39.99" },
        { item: "Satchel-Style Shoulder Bag", brand: "H&M", price: "£27.99" },
        { item: "Plaid Wool-Mix Scarf", brand: "H&M", price: "£12.99" },
      ], "Throw the scarf over one shoulder only. Carry a worn paperback. You are now a literary character — the look does the rest."),
      outfit("The Oxford Afternoon", "mid", [
        { item: "Herringbone Double-Breasted Coat", brand: "Zara", price: "£119.99" },
        { item: "Chunky-Knit Cable Cardigan", brand: "Zara", price: "£69.99" },
        { item: "Corduroy Trousers", brand: "Mango", price: "£59.99" },
        { item: "Leather Oxford Brogues", brand: "ASOS", price: "£65.00" },
        { item: "Structured Canvas Shopper", brand: "COS", price: "£65.00" },
      ], "Layer turtleneck under cardigan under coat. The depth of layering is not extra — it IS the aesthetic."),
      outfit("The Late Library", "luxury", [
        { item: "Checked Wool Overcoat", brand: "Acne Studios", price: "€1,100" },
        { item: "Chunky Wool Knit Sweater", brand: "Acne Studios", price: "€480" },
        { item: "Numéro Dix Bucket Bag", brand: "Polène", price: "€335" },
        { item: "Plaid Long Blazer", brand: "Reformation", price: "$318" },
        { item: "Diorshow Iconic Mascara", brand: "Dior Beauty", price: "$32" },
      ], "Rich plaid, dark leather, heavyweight wool — this is Dark Academia at its most considered and most coveted."),
    ],
    styleTips: [
      "Layer deliberately: shirt → knit → blazer → coat. Each layer should be visible at the neckline.",
      "Earth tones and jewel tones only. Anything too clean or too bright breaks the spell.",
      "Accessories should look earned, not purchased: vintage brass, aged leather, oxidised metals.",
      "The satchel is the centrepiece of this aesthetic. Choose it carefully and let everything else serve it.",
    ],
  },

  "soft-girl": {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("SHEIN", "Floral Babydoll Mini Dress", "clothing", "affordable", "£16.00", "https://www.shein.com", "#FF4793", "#E8A0C0", "Soft florals, puffed sleeves, dreamy proportion."),
      p("Cider", "Pastel Ribbed Cardigan", "clothing", "affordable", "$24.00", "https://www.cider.com", "#F9E4C8", "#E8A0C0", "Butter yellow or lilac, cropped, perpetually sweet."),
      p("Cider", "Ruffle-Hem Midi Skirt", "clothing", "affordable", "$22.00", "https://www.cider.com", "#F9E4C8", "#E8A0C0", "Tiered ruffles, pastel cotton, movement in every step."),
      p("SHEIN", "Pastel Co-Ord Set", "clothing", "affordable", "£24.00", "https://www.shein.com", "#FF4793", "#E8A0C0", "Matching crop and wide-leg — the soft uniform."),
      p("Bershka", "Organza Puff-Sleeve Blouse", "clothing", "affordable", "£22.99", "https://www.bershka.com", "#1A1A2E", "#E8A0C0", "Sheer layers, puffed sleeves, ethereal without effort."),
      p("H&M", "Satin Mary Jane Flats", "shoes", "affordable", "£24.99", "https://www2.hm.com", "#F5EDD6", "#E8A0C0", "Round toe, delicate strap, eternally feminine."),
      p("H&M", "Ballet Flats with Bow", "shoes", "affordable", "£22.99", "https://www2.hm.com", "#F5EDD6", "#E8A0C0", "Grosgrain bow, flat sole, ballet dreams."),
      p("H&M", "Mini Cloud-Shape Bag", "bags", "affordable", "£14.99", "https://www2.hm.com", "#F5EDD6", "#E8A0C0", "Fluffy and structured in equal measure."),
      p("H&M", "Pearl & Bow Hair Clips", "accessories", "affordable", "£6.99", "https://www2.hm.com", "#F5EDD6", "#E8A0C0", "Set of 6. Mix through hair freely for the full effect."),
      p("SHEIN", "Layered Pearl Pendant Necklace", "jewelry", "affordable", "£9.00", "https://www.shein.com", "#FF4793", "#E8A0C0", "Dainty pearl drops, layered, effortlessly soft."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Zara", "Organza Midi Dress", "clothing", "mid", "£79.99", "https://www.zara.com", "#1D1D1D", "#E8A0C0", "Sheer layers, soft pinks, floats with movement."),
      p("Zara", "Pastel Fluffy Cropped Cardigan", "clothing", "mid", "£49.99", "https://www.zara.com", "#1D1D1D", "#E8A0C0", "Teddy texture, cropped, soft-girl coded."),
      p("Princess Polly", "Floral Wrap Mini Dress", "clothing", "mid", "AUD $65.95", "https://www.princess-polly.com", "#FF69B4", "#E8D5A3", "Wrapped silhouette, delicate print, pretty always."),
      p("Princess Polly", "Floral Linen Co-Ord Set", "clothing", "mid", "AUD $79.95", "https://www.princess-polly.com", "#FF69B4", "#E8A0C0", "Matching crop and midi skirt, soft palette, effortless."),
      p("ASOS", "Lace Cami Top", "clothing", "mid", "£28.00", "https://www.asos.com", "#1A1A3E", "#E8A0C0", "Delicate lace, adjustable straps, layerable or alone."),
      p("Mango", "Satin Kitten-Heel Mule", "shoes", "mid", "£49.99", "https://www.mango.com", "#C8533A", "#E8A0C0", "Low heel, slip-on, luxurious sheen."),
      p("Zara", "Bow-Detail Ballet Flats", "shoes", "mid", "£45.99", "https://www.zara.com", "#1D1D1D", "#E8A0C0", "Oversized bow, pointed toe, maximally soft."),
      p("ASOS", "Pastel Mini Cloud Bag", "bags", "mid", "£45.00", "https://www.asos.com", "#1A1A3E", "#E8A0C0", "Marshmallow texture, top handle, brings joy instantly."),
      p("Mango", "Dainty Heart Drop Earrings", "jewelry", "mid", "£19.99", "https://www.mango.com", "#C8533A", "#E8A0C0", "Gold heart, tiny scale, perpetually delicate."),
      p("Mango", "Pearl Hair Clips Set", "accessories", "mid", "£14.99", "https://www.mango.com", "#C8533A", "#E8A0C0", "Genuine faux-pearl clips, scatter throughout the hair."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Jacquemus", "Le Bambino Long Bag", "bags", "luxury", "€490", "https://www.jacquemus.com", "#E8D5B0", "#E8A0C0", "The curvaceous shape that launched a thousand copies."),
      p("Jacquemus", "Le Petit Sac Rond", "bags", "luxury", "€380", "https://www.jacquemus.com", "#E8D5B0", "#E8A0C0", "Tiny circle bag, long chain — the dream accessory."),
      p("Reformation", "Organic Cotton Floral Midi", "clothing", "luxury", "$198", "https://www.thereformation.com", "#2D4A1E", "#E8A0C0", "Sustainable floral, midi length, responsibly dreamy."),
      p("Reformation", "Floral Silk Slip Dress", "clothing", "luxury", "$268", "https://www.thereformation.com", "#2D4A1E", "#E8A0C0", "Bias-cut floral silk, delicate straps, forever feminine."),
      p("Acne Studios", "Alpaca-Blend Crewneck", "clothing", "luxury", "€450", "https://www.acnestudios.com", "#FF7345", "#E8A0C0", "Incredibly soft alpaca, pastel tones, oversized warmth."),
      p("Acne Studios", "Mohair Cropped Sweater", "clothing", "luxury", "€380", "https://www.acnestudios.com", "#FF7345", "#E8A0C0", "Cloud-like mohair, cropped length, in blush or lavender."),
      p("Polène", "Textured Cyme Mini", "bags", "luxury", "€340", "https://www.polene-paris.com", "#C8B8A8", "#E8A0C0", "Pebbled blush leather, knot detail, sweet luxury."),
      p("Polène", "Numéro Un Nano", "bags", "luxury", "€295", "https://www.polene-paris.com", "#C8B8A8", "#E8A0C0", "Nano scale, pebbled leather, the luxurious miniature."),
      p("Dior Beauty", "Diorsnow Perfect Light Cushion", "beauty", "luxury", "$68", "https://www.dior.com", "#1A0A0A", "#E8A0C0", "Luminous finish, porcelain radiance, soft girl perfected."),
      p("Tiffany & Co.", "Paloma's Melody Bracelet", "jewelry", "luxury", "$575", "https://www.tiffany.com", "#0ABAB5", "#E8A0C0", "Musical note charm, delicate chain, poetry on the wrist."),
    ],
    outfits: [
      outfit("The Dream Day", "affordable", [
        { item: "Floral Babydoll Mini Dress", brand: "SHEIN", price: "£16.00" },
        { item: "Satin Mary Jane Flats", brand: "H&M", price: "£24.99" },
        { item: "Mini Cloud-Shape Bag", brand: "H&M", price: "£14.99" },
        { item: "Layered Pearl Pendant Necklace", brand: "SHEIN", price: "£9.00" },
        { item: "Pearl & Bow Hair Clips", brand: "H&M", price: "£6.99" },
      ], "Scatter multiple clips through the hair. Layer the pearl necklace twice. Let everything feel intentionally, unapologetically sweet."),
      outfit("The Pastel Saturday", "mid", [
        { item: "Organza Midi Dress", brand: "Zara", price: "£79.99" },
        { item: "Pastel Fluffy Cardigan", brand: "Zara", price: "£49.99" },
        { item: "Satin Kitten-Heel Mule", brand: "Mango", price: "£49.99" },
        { item: "Pastel Mini Cloud Bag", brand: "ASOS", price: "£45.00" },
        { item: "Dainty Heart Drop Earrings", brand: "Mango", price: "£19.99" },
      ], "Tie the cardigan loosely over the shoulders for a romantic finish. Soft textures should always be layered, never singular."),
      outfit("The Dreamscape", "luxury", [
        { item: "Alpaca-Blend Crewneck", brand: "Acne Studios", price: "€450" },
        { item: "Organic Cotton Floral Midi", brand: "Reformation", price: "$198" },
        { item: "Le Bambino Long Bag", brand: "Jacquemus", price: "€490" },
        { item: "Paloma's Melody Bracelet", brand: "Tiffany & Co.", price: "$575" },
        { item: "Diorsnow Perfect Light Cushion", brand: "Dior Beauty", price: "$68" },
      ], "The softness of alpaca with the sculptural Jacquemus bag — dreamy and elevated in equal measure. The bracelet adds delicacy at the wrist."),
    ],
    styleTips: [
      "Mix your pastels freely — the soft palette harmonises everything. Lilac and blush always work together.",
      "Hair details matter as much as the outfit: clips, bows, and velvet bands are part of the look.",
      "Never wear just one delicate piece — layer three or four. Daintiness is a quantity play.",
      "Soft textures (mohair, tulle, organza, satin) feel most authentic. Avoid anything stiff or structured.",
    ],
  },

  "korean-fashion": {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("SHEIN", "K-Style Plaid Mini Skirt", "clothing", "affordable", "£14.00", "https://www.shein.com", "#FF4793", "#D4B8CC", "Preppy plaid, mini length, straight from Seoul."),
      p("Cider", "Oversized Puff-Sleeve Blouse", "clothing", "affordable", "$22.00", "https://www.cider.com", "#F9E4C8", "#D4B8CC", "Soft volume, button-down, Korean-campus energy."),
      p("Cider", "Knit Oversized Vest", "clothing", "affordable", "$26.00", "https://www.cider.com", "#F9E4C8", "#D4B8CC", "Wide-rib texture, wore over blouses or alone."),
      p("SHEIN", "Wide-Leg Tailored Trousers", "clothing", "affordable", "£16.00", "https://www.shein.com", "#FF4747", "#D4B8CC", "Clean line, generous leg, K-street precision."),
      p("Bershka", "Cropped Blazer", "clothing", "affordable", "£29.99", "https://www.bershka.com", "#1A1A2E", "#D4B8CC", "Boxy crop, worn buttoned or draped — Seoul formula."),
      p("H&M", "Chunky Platform Trainers", "shoes", "affordable", "£44.99", "https://www2.hm.com", "#F5EDD6", "#D4B8CC", "Platform sole, statement height, street-ready."),
      p("H&M", "Slim Oval Sunglasses", "accessories", "affordable", "£12.99", "https://www2.hm.com", "#F5EDD6", "#D4B8CC", "Small lens, retro frame, K-beauty staple."),
      p("H&M", "Structured Mini Bucket Bag", "bags", "affordable", "£22.99", "https://www2.hm.com", "#F5EDD6", "#D4B8CC", "Small bucket, top handle, perfectly proportioned."),
      p("H&M", "Ribbed Mini Dress", "clothing", "affordable", "£22.99", "https://www2.hm.com", "#F5EDD6", "#D4B8CC", "Body-con rib, layer a long cardigan over for balance."),
      p("SHEIN", "Dainty Multi-Layer Chain Necklace", "jewelry", "affordable", "£7.00", "https://www.shein.com", "#FF4793", "#D4B8CC", "Layered chains, modern finish, idol-approved."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Zara", "Oversized Chunky-Knit Vest", "clothing", "mid", "£49.99", "https://www.zara.com", "#1D1D1D", "#D4B8CC", "Volume knit, wide armhole, layered over anything."),
      p("Mango", "Asymmetric Draped Blouse", "clothing", "mid", "£39.99", "https://www.mango.com", "#C8533A", "#D4B8CC", "One-shoulder drape, Seoul editorial energy."),
      p("ASOS", "Wide-Leg High-Waist Trousers", "clothing", "mid", "£45.00", "https://www.asos.com", "#1A1A3E", "#D4B8CC", "Clean line, generous leg, crisp proportion."),
      p("ASOS", "Preppy Polo Collar Shirt", "clothing", "mid", "£35.00", "https://www.asos.com", "#1A1A3E", "#D4B8CC", "Collegiate collar, worn underneath knit vests."),
      p("Mango", "Oversized Stripe Shirt", "clothing", "mid", "£39.99", "https://www.mango.com", "#C8533A", "#D4B8CC", "Boyfriend fit, striped, Korean-campus coded."),
      p("COS", "Padded Leather Trainers", "shoes", "mid", "£135", "https://www.cos.com", "#F2F0EB", "#D4B8CC", "Premium padding, clean design, Seoul-approved."),
      p("Zara", "Mini Quilted Crossbody", "bags", "mid", "£35.99", "https://www.zara.com", "#1D1D1D", "#D4B8CC", "Diamond quilting, chain strap, compact and considered."),
      p("Princess Polly", "Wide-Leg Cargo Pants", "clothing", "mid", "AUD $74.95", "https://www.princess-polly.com", "#FF69B4", "#D4B8CC", "K-street cargo, wide leg, cool coordination."),
      p("Zara", "Double-Knit Co-Ord Set", "clothing", "mid", "£89.99", "https://www.zara.com", "#1D1D1D", "#D4B8CC", "Matching blazer and trouser in bold knit."),
      p("COS", "Ribbed Fitted Tank", "clothing", "mid", "£45", "https://www.cos.com", "#F2F0EB", "#D4B8CC", "Clean rib, minimal, the Seoul base layer."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Jacquemus", "La Petite Serre Bag", "bags", "luxury", "€380", "https://www.jacquemus.com", "#E8D5B0", "#D4B8CC", "Compact handle bag, clean lines, understated."),
      p("Jacquemus", "Le Chiquito Mini Bag", "bags", "luxury", "€490", "https://www.jacquemus.com", "#E8D5B0", "#D4B8CC", "The iconic sculptural mini — Seoul's favourite import."),
      p("Acne Studios", "Distressed Straight Denim", "clothing", "luxury", "€380", "https://www.acnestudios.com", "#FF7345", "#D4B8CC", "Deliberately worn, perfectly cut, Seoul OOTD."),
      p("Acne Studios", "Oversized Mini Knit", "clothing", "luxury", "€340", "https://www.acnestudios.com", "#FF7345", "#D4B8CC", "Compact but draped, the K-style knit."),
      p("Reformation", "Flared Trouser Set", "clothing", "luxury", "$248", "https://www.thereformation.com", "#2D4A1E", "#D4B8CC", "Co-ord set, sustainable fabric, K-chic energy."),
      p("Reformation", "Silk Blouse", "clothing", "luxury", "$168", "https://www.thereformation.com", "#2D4A1E", "#D4B8CC", "Bias-cut silk, falls perfectly, Seoul editorial."),
      p("Polène", "Numéro Un Nano", "bags", "luxury", "€295", "https://www.polene-paris.com", "#C8B8A8", "#D4B8CC", "Nano proportion, pebbled leather. Gallery-ready."),
      p("Polène", "Cyme Mini Bag", "bags", "luxury", "€340", "https://www.polene-paris.com", "#C8B8A8", "#D4B8CC", "Knot closure, architectural form, Seoul-approved."),
      p("Dior Beauty", "5 Couleurs Couture Eyeshadow", "beauty", "luxury", "$75", "https://www.dior.com", "#1A0A0A", "#D4B8CC", "Soft-focus palette, blendable, K-beauty elevated."),
      p("Tiffany & Co.", "T Diamond Pendant", "jewelry", "luxury", "$2,250", "https://www.tiffany.com", "#0ABAB5", "#D4B8CC", "Diamond-set T bar. Statement restraint."),
    ],
    outfits: [
      outfit("The Seoul Campus", "affordable", [
        { item: "Knit Oversized Vest", brand: "Cider", price: "$26.00" },
        { item: "Oversized Puff-Sleeve Blouse", brand: "Cider", price: "$22.00" },
        { item: "K-Style Plaid Mini Skirt", brand: "SHEIN", price: "£14.00" },
        { item: "Chunky Platform Trainers", brand: "H&M", price: "£44.99" },
        { item: "Structured Mini Bucket Bag", brand: "H&M", price: "£22.99" },
      ], "Layer the vest over the blouse, leave the blouse collar visible. The blouse-under-vest is the Korean campus formula."),
      outfit("The Dongdaemun Edit", "mid", [
        { item: "Oversized Chunky-Knit Vest", brand: "Zara", price: "£49.99" },
        { item: "Wide-Leg High-Waist Trousers", brand: "ASOS", price: "£45.00" },
        { item: "Padded Leather Trainers", brand: "COS", price: "£135" },
        { item: "Mini Quilted Crossbody", brand: "Zara", price: "£35.99" },
        { item: "Slim Oval Sunglasses", brand: "H&M", price: "£12.99" },
      ], "Oversized knit vest + wide-leg trouser is the proportional balance that defines Seoul street style. The quilted crossbody keeps it contemporary."),
      outfit("The Apgujeong Look", "luxury", [
        { item: "Distressed Straight Denim", brand: "Acne Studios", price: "€380" },
        { item: "Flared Trouser Set", brand: "Reformation", price: "$248" },
        { item: "La Petite Serre Bag", brand: "Jacquemus", price: "€380" },
        { item: "5 Couleurs Couture Eyeshadow", brand: "Dior Beauty", price: "$75" },
        { item: "T Diamond Pendant", brand: "Tiffany & Co.", price: "$2,250" },
      ], "One editorial piece does all the work at this level. The Jacquemus bag is the statement; the rest is precision."),
    ],
    styleTips: [
      "The Seoul proportion formula: one oversized piece plus one fitted or wide piece — never both loose.",
      "Layering a knit vest over a blouse over wide trousers is the campus formula that defines K-style.",
      "Accessories should be deliberate and minimal — one considered piece worn quietly is more powerful.",
      "Mix preppy and street freely. That tension between collegiate and cool is exactly the aesthetic.",
    ],
  },

  y2k: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("SHEIN", "Y2K Butterfly Print Crop Top", "clothing", "affordable", "£12.00", "https://www.shein.com", "#FF4793", "#9090E8", "Butterfly motif, neon hues, early-2000s encoded."),
      p("Cider", "Low-Rise Flared Jeans", "clothing", "affordable", "$32.00", "https://www.cider.com", "#F9E4C8", "#9090E8", "Hip-hugging rise, subtle flare, Y2K signature."),
      p("SHEIN", "Velour Zip-Up Tracksuit Top", "clothing", "affordable", "£20.00", "https://www.shein.com", "#FF4793", "#9090E8", "Juicy-coded velour, logo zip, 2003 reissued."),
      p("Cider", "Metallic Mini Skirt", "clothing", "affordable", "$24.00", "https://www.cider.com", "#F9E4C8", "#9090E8", "Iridescent surface, mini length, maximum impact."),
      p("Bershka", "Rhinestone Embellished Belt", "accessories", "affordable", "£14.99", "https://www.bershka.com", "#1A1A2E", "#9090E8", "Crystal chain waist — the Y2K essential."),
      p("H&M", "Chunky Platform Mary Janes", "shoes", "affordable", "£34.99", "https://www2.hm.com", "#F5EDD6", "#9090E8", "Platform sole, buckle strap, 2000s reissued."),
      p("H&M", "Chunky Sneaker Platform", "shoes", "affordable", "£39.99", "https://www2.hm.com", "#F5EDD6", "#9090E8", "Exaggerated sole, holographic detail, future-coded."),
      p("SHEIN", "Micro Metallic Mini Bag", "bags", "affordable", "£16.00", "https://www.shein.com", "#FF4793", "#9090E8", "Tiny scale, chrome finish, perfectly impractical."),
      p("AliExpress", "Crystal Choker Necklace", "jewelry", "affordable", "£12.00", "https://www.aliexpress.com", "#E85926", "#9090E8", "Rhinestone band, sparkle, direct from 2001."),
      p("SHEIN", "Rhinestone Butterfly Clips", "accessories", "affordable", "£8.00", "https://www.shein.com", "#FF4793", "#9090E8", "Crystal-set wings, scatter through hair freely."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Princess Polly", "Y2K Denim Mini Skirt", "clothing", "mid", "AUD $59.95", "https://www.princess-polly.com", "#FF69B4", "#9090E8", "Low-rise, mini, worn with attitude."),
      p("ASOS", "Metallic Halter Mini Dress", "clothing", "mid", "£65.00", "https://www.asos.com", "#1A1A3E", "#9090E8", "Silver metallic, strappy, party-in-2003 energy."),
      p("Princess Polly", "Sequin Cami & Mini Set", "clothing", "mid", "AUD $69.95", "https://www.princess-polly.com", "#FF69B4", "#9090E8", "Full-sequin co-ord, blinding from every angle."),
      p("ASOS", "Velour Wide-Leg Pants", "clothing", "mid", "£45.00", "https://www.asos.com", "#1A1A3E", "#9090E8", "Soft velour, wide leg, pure Y2K comfort."),
      p("Zara", "Wrap Mini Skirt", "clothing", "mid", "£35.99", "https://www.zara.com", "#1D1D1D", "#9090E8", "Low wrap silhouette, side knot — effortless and low."),
      p("Zara", "Platform Patent Boots", "shoes", "mid", "£69.99", "https://www.zara.com", "#1D1D1D", "#9090E8", "Platform block heel, knee-high, retro-luxe."),
      p("ASOS", "Rhinestone Embellished Crossbody", "bags", "mid", "£35.00", "https://www.asos.com", "#1A1A3E", "#9090E8", "Crystal-encrusted, tiny, maximum Y2K impact."),
      p("Zara", "Holographic Mini Bag", "bags", "mid", "£25.99", "https://www.zara.com", "#1D1D1D", "#9090E8", "Iridescent panels, top handle, shift-and-shimmer."),
      p("Mango", "Rhinestone Drop Earrings", "jewelry", "mid", "£24.99", "https://www.mango.com", "#C8533A", "#9090E8", "Crystal drops, long chain, maximum sparkle."),
      p("Princess Polly", "Crop Baby Tee", "clothing", "mid", "AUD $45.95", "https://www.princess-polly.com", "#FF69B4", "#9090E8", "Ultra-crop, fitted, the Y2K top formula."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Jacquemus", "Le Papier Bag", "bags", "luxury", "€450", "https://www.jacquemus.com", "#E8D5B0", "#9090E8", "Angular envelope clutch. Future-archive already."),
      p("Jacquemus", "La Bomba Visor Hat", "accessories", "luxury", "€175", "https://www.jacquemus.com", "#E8D5B0", "#9090E8", "Sculptural visor, Y2K energy with Jacquemus craft."),
      p("Acne Studios", "Metallic Pleated Skirt", "clothing", "luxury", "€350", "https://www.acnestudios.com", "#FF7345", "#9090E8", "Silver pleats, midi length, Y2K grown up."),
      p("Acne Studios", "Crystal Drop Earrings", "jewelry", "luxury", "€290", "https://www.acnestudios.com", "#FF7345", "#9090E8", "Faceted crystal, Acne craft — Y2K elevated."),
      p("Acne Studios", "Sterling Chain Belt", "accessories", "luxury", "€220", "https://www.acnestudios.com", "#FF7345", "#9090E8", "Industrial chain waist, Y2K nostalgia, luxury grade."),
      p("Reformation", "Satin Bias-Cut Slip Dress", "clothing", "luxury", "$238", "https://www.thereformation.com", "#2D4A1E", "#9090E8", "Cowl neck satin, sustainable, Paris-by-way-of-2001."),
      p("Reformation", "Metallic Mini Dress", "clothing", "luxury", "$298", "https://www.thereformation.com", "#2D4A1E", "#9090E8", "Sustainable metallic fabric, mini cut — Y2K but forever."),
      p("Polène", "Mini Metallic Bag", "bags", "luxury", "€295", "https://www.polene-paris.com", "#C8B8A8", "#9090E8", "Structured metallic leather, compact, coveted."),
      p("Dior Beauty", "Addict Lip Maximizer", "beauty", "luxury", "$38", "https://www.dior.com", "#1A0A0A", "#E8A0C0", "Plumping gloss, mirror shine. Y2K glam elevated."),
      p("Tiffany & Co.", "Elsa Peretti Bean Bracelet", "jewelry", "luxury", "$950", "https://www.tiffany.com", "#0ABAB5", "#C0C0C0", "Sculptural bean, polished silver, timeless future."),
    ],
    outfits: [
      outfit("The 2003 Diary", "affordable", [
        { item: "Low-Rise Flared Jeans", brand: "Cider", price: "$32.00" },
        { item: "Y2K Butterfly Crop Top", brand: "SHEIN", price: "£12.00" },
        { item: "Chunky Platform Mary Janes", brand: "H&M", price: "£34.99" },
        { item: "Micro Metallic Mini Bag", brand: "SHEIN", price: "£16.00" },
        { item: "Crystal Choker Necklace", brand: "AliExpress", price: "£12.00" },
      ], "The crystal choker and butterfly clips are non-negotiable. Scatter three clips minimum. More is always more in Y2K."),
      outfit("The Metallic Moment", "mid", [
        { item: "Y2K Denim Mini Skirt", brand: "Princess Polly", price: "AUD $59.95" },
        { item: "Metallic Halter Mini Dress", brand: "ASOS", price: "£65.00" },
        { item: "Platform Patent Boots", brand: "Zara", price: "£69.99" },
        { item: "Rhinestone Embellished Crossbody", brand: "ASOS", price: "£35.00" },
        { item: "Rhinestone Drop Earrings", brand: "Mango", price: "£24.99" },
      ], "Silver on silver is the Y2K rule. Mix textures of metallic — matte and shiny together read richer than one alone."),
      outfit("The Archive Future", "luxury", [
        { item: "Metallic Pleated Skirt", brand: "Acne Studios", price: "€350" },
        { item: "Satin Bias-Cut Slip Dress", brand: "Reformation", price: "$238" },
        { item: "Le Papier Bag", brand: "Jacquemus", price: "€450" },
        { item: "Crystal Drop Earrings", brand: "Acne Studios", price: "€290" },
        { item: "Addict Lip Maximizer", brand: "Dior Beauty", price: "$38" },
      ], "Y2K grown up — metallic pleats and satin together at this quality level is the era recontextualised as fashion art."),
    ],
    styleTips: [
      "Low-rise is the foundational Y2K silhouette — everything reads as more authentic from there.",
      "Metallics, holographics, and rhinestones are basics in this aesthetic, not statement choices.",
      "The micro bag is a style statement, not a practical choice. Embrace the impracticality.",
      "More is more: stack the bracelets, scatter the clips, layer the necklaces. Restraint has no place here.",
    ],
  },

  vintage: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Vintage-Wash Denim Jacket", "clothing", "affordable", "£34.99", "https://www2.hm.com", "#F5EDD6", "#D4A853", "Faded wash, oversized, decades of character."),
      p("Bershka", "Flared Corduroy Trousers", "clothing", "affordable", "£29.99", "https://www.bershka.com", "#1A1A2E", "#D4A853", "Rich cord texture, 70s silhouette, warm earth tones."),
      p("Pull&Bear", "Prairie Midi Dress", "clothing", "affordable", "£34.99", "https://www.pullandbear.com", "#2D2D2D", "#D4A853", "Floral prairie print, midi length, soft femininity."),
      p("Bershka", "70s-Style Print Blouse", "clothing", "affordable", "£22.99", "https://www.bershka.com", "#1A1A2E", "#D4A853", "Bold print, blouson sleeve, retro joy."),
      p("SHEIN", "Wide-Leg Flare Jeans", "clothing", "affordable", "£22.00", "https://www.shein.com", "#FF4747", "#D4A853", "High-waist, extreme flare, 70s in denim."),
      p("H&M", "Block-Heel Leather-Look Boots", "shoes", "affordable", "£44.99", "https://www2.hm.com", "#F5EDD6", "#D4A853", "Stacked heel, ankle-length, old-soul energy."),
      p("Pull&Bear", "Platform Lace-Up Boots", "shoes", "affordable", "£39.99", "https://www.pullandbear.com", "#2D2D2D", "#D4A853", "Chunky platform, lace-up, 90s grunge-vintage."),
      p("H&M", "Structured Retro Top-Handle Bag", "bags", "affordable", "£22.99", "https://www2.hm.com", "#F5EDD6", "#D4A853", "Rigid structure, top handle, grandmothers had one."),
      p("H&M", "Multi-Strand Vintage Necklace", "jewelry", "affordable", "£12.99", "https://www2.hm.com", "#F5EDD6", "#D4A853", "Layered chains, aged gold, thrift-shop magic."),
      p("H&M", "Printed Silk-Look Scarf", "accessories", "affordable", "£14.99", "https://www2.hm.com", "#F5EDD6", "#D4A853", "Baroque print, tied at neck or as hair wrap."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Mango", "Floral Print Wrap Midi Dress", "clothing", "mid", "£79.99", "https://www.mango.com", "#C8533A", "#D4A853", "Rich floral, midi wrap, 70s femininity perfected."),
      p("Zara", "Retro-Print Bouclé Blazer", "clothing", "mid", "£99.99", "https://www.zara.com", "#1D1D1D", "#D4A853", "Textured bouclé, statement buttons, archive energy."),
      p("Mango", "Smocked Waist Maxi Dress", "clothing", "mid", "£89.99", "https://www.mango.com", "#C8533A", "#D4A853", "Floral smocking, maxi length, summer festival energy."),
      p("Zara", "High-Rise Wide-Leg Jeans", "clothing", "mid", "£49.99", "https://www.zara.com", "#1D1D1D", "#D4A853", "Dark-rinse denim, generous leg, throwback silhouette."),
      p("ASOS", "Vintage-Inspired Denim Set", "clothing", "mid", "£75.00", "https://www.asos.com", "#1A1A3E", "#D4A853", "Matching jacket and shorts, worn wash, denim duo."),
      p("ASOS", "Wide-Fit Vintage-Look Boots", "shoes", "mid", "£80.00", "https://www.asos.com", "#1A1A3E", "#D4A853", "Worn-in leather effect, stacked heel, pre-owned feel."),
      p("COS", "Structured Leather Carry-All", "bags", "mid", "£125", "https://www.cos.com", "#F2F0EB", "#D4A853", "Boxy frame, open-top, timeless utility."),
      p("COS", "Suede Tote Bag", "bags", "mid", "£115", "https://www.cos.com", "#F2F0EB", "#D4A853", "Soft suede, natural texture, vintage-feeling luxury."),
      p("Mango", "Multi-Pearl Opera Necklace", "jewelry", "mid", "£39.99", "https://www.mango.com", "#C8533A", "#D4A853", "Long strand, opera-length, layered for drama."),
      p("Zara", "Printed Wrap Blouse", "clothing", "mid", "£45.99", "https://www.zara.com", "#1D1D1D", "#D4A853", "Abstract print, wrap closure, retro feminine."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Polène", "Numéro Un Small Bag", "bags", "luxury", "€320", "https://www.polene-paris.com", "#C8B8A8", "#D4A853", "Pebbled leather, understated clasp, heirloom quality."),
      p("Polène", "Numéro Neuf Bag", "bags", "luxury", "€350", "https://www.polene-paris.com", "#C8B8A8", "#D4A853", "Suede and leather, structured, heirloom feel."),
      p("Jacquemus", "La Banane Belt Bag", "bags", "luxury", "€370", "https://www.jacquemus.com", "#E8D5B0", "#D4A853", "Curved silhouette, waist-worn, sculptural charm."),
      p("Jacquemus", "Le Raphia Bag", "bags", "luxury", "€350", "https://www.jacquemus.com", "#E8D5B0", "#D4A853", "Natural raffia, vintage texture elevated to art."),
      p("Acne Studios", "1996 Straight-Cut Jeans", "clothing", "luxury", "€330", "https://www.acnestudios.com", "#FF7345", "#D4A853", "The cult vintage wash. Mid-rise, perfectly cut."),
      p("Acne Studios", "Suede Boxy Jacket", "clothing", "luxury", "€890", "https://www.acnestudios.com", "#FF7345", "#D4A853", "Soft suede, boxy shoulders, wears like a heirloom."),
      p("Reformation", "Vintage-Inspired Slip Midi", "clothing", "luxury", "$218", "https://www.thereformation.com", "#2D4A1E", "#D4A853", "Bias-cut satin, sustainable, nostalgic and new."),
      p("Reformation", "Floral Wrap Maxi Dress", "clothing", "luxury", "$278", "https://www.thereformation.com", "#2D4A1E", "#D4A853", "Sustainable floral, maxi wrap, eternally romantic."),
      p("Dior Beauty", "Backstage Rosy Glow Blush", "beauty", "luxury", "$58", "https://www.dior.com", "#1A0A0A", "#D4A853", "Adaptive rosy flush. Vintage porcelain skin."),
      p("Tiffany & Co.", "Victoria Line Bracelet", "jewelry", "luxury", "$1,400", "https://www.tiffany.com", "#0ABAB5", "#D4A853", "Diamond-set lines. The heirloom for the present."),
    ],
    outfits: [
      outfit("The Thrift Find", "affordable", [
        { item: "Vintage-Wash Denim Jacket", brand: "H&M", price: "£34.99" },
        { item: "Flared Corduroy Trousers", brand: "Bershka", price: "£29.99" },
        { item: "Block-Heel Leather-Look Boots", brand: "H&M", price: "£44.99" },
        { item: "Structured Retro Top-Handle Bag", brand: "H&M", price: "£22.99" },
        { item: "Printed Silk-Look Scarf", brand: "H&M", price: "£14.99" },
      ], "Tie the scarf through the bag handle. The denim jacket worn open with the collar popped is the detail that makes this feel genuinely vintage."),
      outfit("The Decade Mix", "mid", [
        { item: "Floral Print Wrap Midi Dress", brand: "Mango", price: "£79.99" },
        { item: "Retro-Print Bouclé Blazer", brand: "Zara", price: "£99.99" },
        { item: "Wide-Fit Vintage-Look Boots", brand: "ASOS", price: "£80.00" },
        { item: "Structured Leather Carry-All", brand: "COS", price: "£125" },
        { item: "Multi-Pearl Opera Necklace", brand: "Mango", price: "£39.99" },
      ], "70s dress + 90s bouclé jacket = the vintage blend that works across any era. Layer the opera-length pearl necklace over the blazer."),
      outfit("The Heirloom Look", "luxury", [
        { item: "1996 Straight-Cut Jeans", brand: "Acne Studios", price: "€330" },
        { item: "Vintage-Inspired Slip Midi", brand: "Reformation", price: "$218" },
        { item: "Numéro Un Small Bag", brand: "Polène", price: "€320" },
        { item: "La Banane Belt Bag", brand: "Jacquemus", price: "€370" },
        { item: "Backstage Rosy Glow Blush", brand: "Dior Beauty", price: "$58" },
      ], "The jeans that defined a decade, paired with the bag that will define the next. Wear the Banane at the waist, Polène over the shoulder."),
    ],
    styleTips: [
      "Let one statement vintage piece anchor the look — a silk dress, a bouclé blazer. Build around it.",
      "Modern basics (white tee, dark denim) pair beautifully with a single vintage hero piece.",
      "Warm earth tones photograph like old film — lean into amber, rust, olive, and burgundy.",
      "Vintage dressing is about feeling, not historical accuracy. Mix decades freely and without apology.",
    ],
  },

  elegant: {
    products: [
      // ─── Affordable ──────────────────────────────────────────────────────
      p("H&M", "Satin Slip Midi Dress", "clothing", "affordable", "£29.99", "https://www2.hm.com", "#F5EDD6", "#C8B8A8", "Liquid drape, adjustable straps, effortless evening."),
      p("Bershka", "Cigarette-Leg Tailored Trousers", "clothing", "affordable", "£22.99", "https://www.bershka.com", "#1A1A2E", "#C8B8A8", "Clean ankle, slim line, quietly powerful."),
      p("Bershka", "Satin Wide-Leg Trousers", "clothing", "affordable", "£25.99", "https://www.bershka.com", "#1A1A2E", "#C8B8A8", "Fluid satin, generous leg, day-to-evening ease."),
      p("H&M", "Lace Cami Bodysuit", "clothing", "affordable", "£19.99", "https://www2.hm.com", "#F5EDD6", "#C8B8A8", "Delicate lace, tucked into trousers for refined layering."),
      p("SHEIN", "Off-Shoulder Satin Midi Dress", "clothing", "affordable", "£24.00", "https://www.shein.com", "#FF4747", "#C8B8A8", "Draped off-shoulder, bias cut, evening without effort."),
      p("H&M", "Strappy Kitten-Heel Sandals", "shoes", "affordable", "£29.99", "https://www2.hm.com", "#F5EDD6", "#C8B8A8", "Barely-there straps, delicate heel, undeniable grace."),
      p("Pull&Bear", "Pointed Satin Mule", "shoes", "affordable", "£28.99", "https://www.pullandbear.com", "#2D2D2D", "#C8B8A8", "Pointed toe, backless, liquid satin upper."),
      p("H&M", "Satin Evening Clutch", "bags", "affordable", "£19.99", "https://www2.hm.com", "#F5EDD6", "#C8B8A8", "Compact, gathered satin, everything you need."),
      p("H&M", "Crystal Drop Chandelier Earrings", "jewelry", "affordable", "£12.99", "https://www2.hm.com", "#F5EDD6", "#C8B8A8", "Cascading crystals, catches every light."),
      p("H&M", "Velvet Padded Headband", "accessories", "affordable", "£9.99", "https://www2.hm.com", "#F5EDD6", "#C8B8A8", "Rich velvet, adds instant sophistication."),

      // ─── Mid-range ────────────────────────────────────────────────────────
      p("Mango", "Satin Wrap Midi Dress", "clothing", "mid", "£89.99", "https://www.mango.com", "#C8533A", "#C8B8A8", "Bias-cut drape, evening to dinner, silk-like handle."),
      p("COS", "Structured Column Dress", "clothing", "mid", "£145", "https://www.cos.com", "#F2F0EB", "#8A8278", "Vertical seaming, minimal detail, architectural."),
      p("Mango", "Velvet Midi Dress", "clothing", "mid", "£99.99", "https://www.mango.com", "#C8533A", "#C8B8A8", "Rich velvet, column silhouette, dinner perfect."),
      p("COS", "Cashmere Crewneck", "clothing", "mid", "£195", "https://www.cos.com", "#F2F0EB", "#C8B8A8", "Pure cashmere, refined weight, wears over everything."),
      p("ASOS", "Satin Palazzo Trousers", "clothing", "mid", "£65.00", "https://www.asos.com", "#1A1A3E", "#C8B8A8", "Floor-length satin, wide palazzo leg, draped authority."),
      p("Zara", "Pointed Court Heel", "shoes", "mid", "£79.99", "https://www.zara.com", "#1D1D1D", "#C8B8A8", "The pointed heel that works with everything."),
      p("COS", "Smooth Leather Structured Bag", "bags", "mid", "£155", "https://www.cos.com", "#F2F0EB", "#8A8278", "Polished finish, magnetic clasp, enduring form."),
      p("Zara", "Sequin Long Evening Jacket", "clothing", "mid", "£119.99", "https://www.zara.com", "#1D1D1D", "#C8B8A8", "Full-length sequin, wear over everything, always elegant."),
      p("Mango", "Pearl Stud Drop Earrings", "jewelry", "mid", "£24.99", "https://www.mango.com", "#C8533A", "#C8B8A8", "Pearl centre, extended drop, daytime gala."),
      p("Zara", "Crystal Drop Necklace", "jewelry", "mid", "£29.99", "https://www.zara.com", "#1D1D1D", "#C8B8A8", "Pendant crystal drop, delicate chain, elegant simplicity."),

      // ─── Luxury ───────────────────────────────────────────────────────────
      p("Jacquemus", "La Riviera Bag", "bags", "luxury", "€550", "https://www.jacquemus.com", "#E8D5B0", "#C4973B", "Sculptural top handle, arc silhouette, considered luxury."),
      p("Jacquemus", "Le Chiquito Lungo Bag", "bags", "luxury", "€520", "https://www.jacquemus.com", "#E8D5B0", "#C8B8A8", "Elongated chiquito, refined proportion, arm-carry drama."),
      p("Polène", "Numéro Un Bag", "bags", "luxury", "€395", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "The signature. Structured beauty. Quiet prestige."),
      p("Polène", "Numéro Dix Bag", "bags", "luxury", "€335", "https://www.polene-paris.com", "#C8B8A8", "#8A8278", "Clean frame, enduring form, understated presence."),
      p("Acne Studios", "Floor-Length Fluid Dress", "clothing", "luxury", "€850", "https://www.acnestudios.com", "#FF7345", "#C8B8A8", "Draped construction, column silhouette, evening mastery."),
      p("Acne Studios", "Silk Slip Dress", "clothing", "luxury", "€680", "https://www.acnestudios.com", "#FF7345", "#C8B8A8", "Pure silk, bias cut, barely-there elegance."),
      p("Reformation", "Silk Evening Gown", "clothing", "luxury", "$398", "https://www.thereformation.com", "#2D4A1E", "#C8B8A8", "Sustainable silk, floor-length, wears like a dream."),
      p("Reformation", "Silk Midi Dress", "clothing", "luxury", "$278", "https://www.thereformation.com", "#2D4A1E", "#C8B8A8", "Fluid silk, midi length, effortless poise."),
      p("Dior Beauty", "Prestige Skincare Crème", "beauty", "luxury", "$285", "https://www.dior.com", "#1A0A0A", "#C8B8A8", "The crème of crèmes. Luminous, ageless skin."),
      p("Tiffany & Co.", "Victoria Diamond Earrings", "jewelry", "luxury", "$4,050", "https://www.tiffany.com", "#0ABAB5", "#C0C0C0", "Marquise diamonds, platinum. Jewels for the moments that matter."),
    ],
    outfits: [
      outfit("The Evening Minimum", "affordable", [
        { item: "Satin Slip Midi Dress", brand: "H&M", price: "£29.99" },
        { item: "Strappy Kitten-Heel Sandals", brand: "H&M", price: "£29.99" },
        { item: "Satin Evening Clutch", brand: "H&M", price: "£19.99" },
        { item: "Crystal Drop Chandelier Earrings", brand: "H&M", price: "£12.99" },
      ], "One satin piece, one crystal earring. Simplicity executed perfectly is the most elegant move available."),
      outfit("The Dinner Ritual", "mid", [
        { item: "Satin Wrap Midi Dress", brand: "Mango", price: "£89.99" },
        { item: "Pointed Court Heel", brand: "Zara", price: "£79.99" },
        { item: "Smooth Leather Structured Bag", brand: "COS", price: "£155" },
        { item: "Pearl Stud Drop Earrings", brand: "Mango", price: "£24.99" },
        { item: "Crystal Drop Necklace", brand: "Zara", price: "£29.99" },
      ], "Bias-cut satin moves beautifully. Walk slowly and deliberately. Let the fabric carry the elegance."),
      outfit("The Presence", "luxury", [
        { item: "Floor-Length Fluid Dress", brand: "Acne Studios", price: "€850" },
        { item: "Numéro Un Bag", brand: "Polène", price: "€395" },
        { item: "La Riviera Bag", brand: "Jacquemus", price: "€550" },
        { item: "Victoria Diamond Earrings", brand: "Tiffany & Co.", price: "$4,050" },
        { item: "Prestige Skincare Crème", brand: "Dior Beauty", price: "$285" },
      ], "One long fluid dress is the entire statement. Nothing else is required. The earrings are the punctuation — not the sentence."),
    ],
    styleTips: [
      "Movement is elegance — draped and fluid silhouettes always outperform stiff, structured ones for this aesthetic.",
      "Monochrome or tonal dressing creates instant polish. One colour head to toe is always the most powerful choice.",
      "Shoes and bag should be quieter than the garment. Never let them compete with the silhouette.",
      "The neckline is your canvas — every elegant dressing decision begins there.",
    ],
  },
};
