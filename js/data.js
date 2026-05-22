/* ========================================
   AURA — Platform data
   Styles, quiz, AI, real shopping graph
   ======================================== */

// ----------------------------------------
// IMAGE SOURCE TOGGLE
// ----------------------------------------
const USE_LOCAL_IMAGES = true; // local images on
const LOCAL_IMG_BASE = 'images';

// Which aesthetics have a complete local image pack installed.
// If a style is in here, the platform uses its local files instead of Unsplash.
const LOCAL_PACKED = ['classic', 'casual', 'streetwear', 'elegant', 'minimalist', 'korean', 'y2k', 'softgirl', 'vintage'];

// Slot → relative filename inside images/{aesthetic}/
const SLOT_FILES = {
  hero: 'hero.jpg',
  accent: 'accent.jpg',
  outfit1: 'outfit-1.jpg', outfit2: 'outfit-2.jpg', outfit3: 'outfit-3.jpg',
  outfit4: 'outfit-4.jpg', outfit5: 'outfit-5.jpg', outfit6: 'outfit-6.jpg',
  outfit7: 'outfit-7.jpg', outfit8: 'outfit-8.jpg',
  completeLook: 'complete-look.jpg',
  detailFabric: 'detail-fabric.jpg', detailAccessory: 'detail-accessory.jpg',
  detailShoes: 'detail-shoes.jpg', detailJewelry: 'detail-jewelry.jpg',
  detailMakeup: 'detail-makeup.jpg', detailBag: 'detail-bag.jpg',
  beauty: 'beauty.jpg', lookbook: 'lookbook.jpg',
  productClothingAff: 'product-clothing-aff.jpg',
  productClothingMid: 'product-clothing-mid.jpg',
  productClothingLux: 'product-clothing-lux.jpg',
  productShoesAff: 'product-shoes-aff.jpg',
  productShoesMid: 'product-shoes-mid.jpg',
  productShoesLux: 'product-shoes-lux.jpg',
  productBagsAff: 'product-bags-aff.jpg',
  productBagsMid: 'product-bags-mid.jpg',
  productBagsLux: 'product-bags-lux.jpg',
  productAccessoriesAff: 'product-accessories-aff.jpg',
  productAccessoriesMid: 'product-accessories-mid.jpg',
  productAccessoriesLux: 'product-accessories-lux.jpg',
  productBeautyAff: 'product-beauty-aff.jpg',
  productBeautyMid: 'product-beauty-mid.jpg',
  productBeautyLux: 'product-beauty-lux.jpg',
  productJewelryAff: 'product-jewelry-aff.jpg',
  productJewelryMid: 'product-jewelry-mid.jpg',
  productJewelryLux: 'product-jewelry-lux.jpg'
};

// Build an image URL for a (aesthetic, slot). Falls back to Unsplash if the
// aesthetic isn't in LOCAL_PACKED yet.
function slotImg(aesthetic, slot, fallbackQuery) {
  if (USE_LOCAL_IMAGES && LOCAL_PACKED.indexOf(aesthetic) !== -1 && SLOT_FILES[slot]) {
    // Use encoded path to handle spaces / special chars safely
    return `${LOCAL_IMG_BASE}/${aesthetic}/${SLOT_FILES[slot]}`;
  }
  // Fallback to the slug system
  return localImgPath(fallbackQuery || (aesthetic + ' ' + slot));
}

// Slug-based fallback used by data fields that haven't been migrated yet
function localImgPath(q) {
  if (!USE_LOCAL_IMAGES) return null;
  const aesthetic = detectAesthetic(q) || 'misc';
  const slug = String(q).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${LOCAL_IMG_BASE}/${aesthetic}/${slug}.jpg`;
}

// ----------------------------------------
// CURATED EDITORIAL IMAGE POOLS (Unsplash fallback when USE_LOCAL_IMAGES = false)
// Real images.unsplash.com CDN URLs, hand-picked per aesthetic.
// ----------------------------------------
const IMG_POOLS = {
  // Cream blazers, beige neutrals, polished tailoring
  classic: [
    '1490481651871-ab68de25d43d', '1496747611176-843222e1e57c',
    '1492707892479-7bc8d5a4ee93', '1487412947147-5cebf100ffc2',
    '1503944168849-8bf86fa6e2a8', '1551803091-e20673f15770',
    '1581044777550-4cfa60707c03', '1469334031218-e382a71b716b',
    '1539109136881-3be0616acf4b', '1517841905240-472988babdf9',
    '1494790108377-be9c29b29330', '1530418877033-7b67e35bf03b'
  ],
  oldmoney: [
    '1487412947147-5cebf100ffc2', '1490481651871-ab68de25d43d',
    '1483985988355-763728e1935b', '1494790108377-be9c29b29330',
    '1469334031218-e382a71b716b', '1503944168849-8bf86fa6e2a8',
    '1551803091-e20673f15770', '1530418877033-7b67e35bf03b',
    '1539109136881-3be0616acf4b'
  ],
  streetwear: [
    '1556906781-9a412961c28c', '1542291026-7eec264c27ff',
    '1525966222134-fcfa99b8ae77', '1597840900616-31b15cea3a25',
    '1571945153237-4929e783af4a', '1542038784456-1ea8e935640e',
    '1521577352947-9bb58764b69a', '1483985988355-763728e1935b',
    '1505740420928-5e560c06d30e'
  ],
  minimalist: [
    '1487412947147-5cebf100ffc2', '1490481651871-ab68de25d43d',
    '1483985988355-763728e1935b', '1469334031218-e382a71b716b',
    '1496747611176-843222e1e57c', '1530418877033-7b67e35bf03b',
    '1551803091-e20673f15770', '1539109136881-3be0616acf4b',
    '1492707892479-7bc8d5a4ee93'
  ],
  elegant: [
    '1518049362265-d5b2a6b00b37', '1496217590455-aa63a8350eea',
    '1515886657613-9f3515b0c78f', '1525507119028-ed4c629a60a3',
    '1494790108377-be9c29b29330', '1488161628813-04466f872be2',
    '1517841905240-472988babdf9', '1503944168849-8bf86fa6e2a8',
    '1581044777550-4cfa60707c03'
  ],
  korean: [
    '1488161628813-04466f872be2', '1535713875002-d1d0cf377fde',
    '1496747611176-843222e1e57c', '1518049362265-d5b2a6b00b37',
    '1496217590455-aa63a8350eea', '1494790108377-be9c29b29330',
    '1530418877033-7b67e35bf03b', '1515886657613-9f3515b0c78f'
  ],
  y2k: [
    '1525507119028-ed4c629a60a3', '1496217590455-aa63a8350eea',
    '1515886657613-9f3515b0c78f', '1518049362265-d5b2a6b00b37',
    '1494790108377-be9c29b29330', '1556906781-9a412961c28c',
    '1488161628813-04466f872be2'
  ],
  vintage: [
    '1465495976277-4387d4b0b4c6', '1492707892479-7bc8d5a4ee93',
    '1481833761820-0509d3217039', '1452780212940-6f5c0d14d848',
    '1469334031218-e382a71b716b', '1503944168849-8bf86fa6e2a8',
    '1517841905240-472988babdf9', '1454165804606-c3d57bc86b40'
  ],
  softgirl: [
    '1525507119028-ed4c629a60a3', '1496217590455-aa63a8350eea',
    '1515886657613-9f3515b0c78f', '1518049362265-d5b2a6b00b37',
    '1494790108377-be9c29b29330', '1488161628813-04466f872be2',
    '1581044777550-4cfa60707c03'
  ],
  darkacademia: [
    '1481833761820-0509d3217039', '1452780212940-6f5c0d14d848',
    '1454165804606-c3d57bc86b40', '1487412947147-5cebf100ffc2',
    '1492707892479-7bc8d5a4ee93', '1465495976277-4387d4b0b4c6',
    '1503944168849-8bf86fa6e2a8', '1539109136881-3be0616acf4b'
  ],
  casual: [
    '1483985988355-763728e1935b', '1469334031218-e382a71b716b',
    '1496747611176-843222e1e57c', '1530418877033-7b67e35bf03b',
    '1495121605193-b116b5b9c5fe', '1517841905240-472988babdf9',
    '1539109136881-3be0616acf4b', '1551803091-e20673f15770'
  ]
};

// Generic editorial fallback for any non-matching query
const IMG_FALLBACK = [
  '1490481651871-ab68de25d43d', '1496747611176-843222e1e57c',
  '1492707892479-7bc8d5a4ee93', '1487412947147-5cebf100ffc2',
  '1483985988355-763728e1935b', '1469334031218-e382a71b716b',
  '1494790108377-be9c29b29330', '1525507119028-ed4c629a60a3',
  '1518049362265-d5b2a6b00b37', '1481833761820-0509d3217039',
  '1503944168849-8bf86fa6e2a8', '1551803091-e20673f15770'
];

// Identify which aesthetic a query belongs to by scanning for keywords
function detectAesthetic(q) {
  q = q.toLowerCase();
  const map = [
    ['oldmoney',     ['old money', 'quiet luxury', 'cashmere', 'tonal']],
    ['darkacademia', ['dark academia', 'darkacademia', 'tweed', 'oxford', 'library', 'plaid skirt', 'knit vest', 'satchel', 'wine', 'brick']],
    ['streetwear',   ['streetwear', 'sneaker', 'hoodie', 'cargo', 'bucket hat', 'air force', 'dunk', 'jordan', 'chunky', 'tracksuit']],
    ['softgirl',     ['soft girl', 'softgirl', 'coquette', 'bow', 'pearl', 'heart', 'pink', 'pastel', 'floral', 'ribbon', 'mary jane', 'ballet flat']],
    ['korean',       ['korean', 'k-pop', 'kpop', 'cardigan', 'pleated', 'seoul']],
    ['y2k',          ['y2k', 'low rise', 'low-rise', 'baby tee', 'butterfly', 'rhinestone', 'platform']],
    ['vintage',      ['vintage', '70s', '60s', '90s', 'retro', 'thrift', 'flare jeans', 'levi']],
    ['elegant',      ['elegant', 'silk', 'satin', 'slip dress', 'kitten heel', 'pearl', 'lace', 'blush']],
    ['minimalist',   ['minimal', 'linen', 'wool', 'cashmere', 'beige', 'oat', 'taupe', 'cream', 'monochrome']],
    ['classic',      ['classic', 'blazer', 'tailored', 'trench', 'loafers', 'white shirt', 'button down', 'pumps']],
    ['casual',       ['casual', 'denim', 'jeans', 'sweater', 'sweatshirt', 'tee', 'hoodie', 'weekend']]
  ];
  for (const [aesthetic, keywords] of map) {
    for (const k of keywords) if (q.includes(k)) return aesthetic;
  }
  return null;
}

// Image helper.
// Styles in LOCAL_PACKED use local images. Others fall back to Unsplash.
const img = (q, w = 600, h = 800) => {
  const aesthetic = detectAesthetic(q);
  const pool = (aesthetic && IMG_POOLS[aesthetic]) || IMG_FALLBACK;
  let seed = 0;
  for (let i = 0; i < q.length; i++) seed = (seed * 31 + q.charCodeAt(i)) >>> 0;
  const photoId = pool[seed % pool.length];
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&crop=faces,edges&auto=format&q=80`;
};

// Real store search URLs — every product becomes a working link
const STORE_URLS = {
  'Zara':            q => `https://www.zara.com/us/en/search?searchTerm=${encodeURIComponent(q)}`,
  'H&M':             q => `https://www2.hm.com/en_us/search-results.html?q=${encodeURIComponent(q)}`,
  'Mango':           q => `https://shop.mango.com/us/search?kw=${encodeURIComponent(q)}`,
  'ASOS':            q => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
  'Bershka':         q => `https://www.bershka.com/us/search?searchTerm=${encodeURIComponent(q)}`,
  'Pull&Bear':       q => `https://www.pullandbear.com/us/search?term=${encodeURIComponent(q)}`,
  'SHEIN':           q => `https://us.shein.com/pdsearch/${encodeURIComponent(q)}/`,
  'Uniqlo':          q => `https://www.uniqlo.com/us/en/search?q=${encodeURIComponent(q)}`,
  'Nike':            q => `https://www.nike.com/w?q=${encodeURIComponent(q)}`,
  'Adidas':          q => `https://www.adidas.com/us/search?q=${encodeURIComponent(q)}`,
  'Sephora':         q => `https://www.sephora.com/search?keyword=${encodeURIComponent(q)}`,
  'COS':             q => `https://www.cos.com/en_usd/search.html?q=${encodeURIComponent(q)}`,
  'Massimo Dutti':   q => `https://www.massimodutti.com/us/search?term=${encodeURIComponent(q)}`,
  'Stradivarius':    q => `https://www.stradivarius.com/us/search?term=${encodeURIComponent(q)}`,
  'Urban Outfitters':q => `https://www.urbanoutfitters.com/search?q=${encodeURIComponent(q)}`,
  'Etsy':            q => `https://www.etsy.com/search?q=${encodeURIComponent(q)}`,
  'Depop':           q => `https://www.depop.com/search/?q=${encodeURIComponent(q)}`,
  'Reformation':     q => `https://www.thereformation.com/search?q=${encodeURIComponent(q)}`,
  'Levis':           q => `https://www.levi.com/US/en_US/search/?q=${encodeURIComponent(q)}`,
  'Brandy Melville': q => `https://www.brandymelville.com/search?q=${encodeURIComponent(q)}`,
  'Princess Polly':  q => `https://us.princesspolly.com/search?q=${encodeURIComponent(q)}`,
  'Mejuri':          q => `https://mejuri.com/search?q=${encodeURIComponent(q)}&type=product`,
  'Dr. Martens':     q => `https://www.drmartens.com/us/en_us/search?q=${encodeURIComponent(q)}`,
  'Glossier':        q => `https://www.glossier.com/search?query=${encodeURIComponent(q)}`,
  'Beyond Retro':    q => `https://www.beyondretro.com/search?type=product&q=${encodeURIComponent(q)}`,
  'Everlane':        q => `https://www.everlane.com/search?q=${encodeURIComponent(q)}`,
  // Extended store network
  '& Other Stories': q => `https://www.stories.com/en_usd/search.html?q=${encodeURIComponent(q)}`,
  'A.P.C.':          q => `https://www.apc-us.com/search?q=${encodeURIComponent(q)}`,
  'Acne Studios':    q => `https://www.acnestudios.com/us/en/search/?q=${encodeURIComponent(q)}`,
  'AliExpress':      q => `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`,
  'Aritzia':         q => `https://www.aritzia.com/us/en/search?q=${encodeURIComponent(q)}`,
  'Charles & Keith': q => `https://www.charleskeith.com/us/search?q=${encodeURIComponent(q)}`,
  'Cider':           q => `https://www.cider.com/collections/all?search=${encodeURIComponent(q)}`,
  'Converse':        q => `https://www.converse.com/c/search?q=${encodeURIComponent(q)}`,
  'Free People':     q => `https://www.freepeople.com/search/?q=${encodeURIComponent(q)}`,
  'Jacquemus':       q => `https://www.jacquemus.com/search?q=${encodeURIComponent(q)}`,
  'JW PEI':          q => `https://www.jwpei.com/search?q=${encodeURIComponent(q)}`,
  'Le Specs':        q => `https://www.lespecs.com/search?q=${encodeURIComponent(q)}`,
  'Pandora':         q => `https://us.pandora.net/en/search?q=${encodeURIComponent(q)}`,
  'Polène':          q => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
  'Sézane':          q => `https://www.sezane.com/us/search?q=${encodeURIComponent(q)}`,
  'Tiffany & Co.':   q => `https://www.tiffany.com/en-us/search/?q=${encodeURIComponent(q)}`,
  'Toteme':          q => `https://toteme.com/search?q=${encodeURIComponent(q)}`,
  'Veja':            q => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
  'YesStyle':        q => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`
};

const shopUrl = (store, q) => {
  const fn = STORE_URLS[store];
  return fn ? fn(q) : `https://www.google.com/search?q=${encodeURIComponent(store + ' ' + q)}`;
};

const P = (tier, store, name, price, q, imgQ) => ({
  tier, store, name, price, q,
  img: img(imgQ),
  url: shopUrl(store, q)
});

const TIER_LABELS = { aff: 'Affordable', mid: 'Mid-range', lux: 'Luxury' };
const CATEGORIES = [
  { id: 'clothing',    label: 'Clothing'    },
  { id: 'shoes',       label: 'Shoes'       },
  { id: 'bags',        label: 'Bags'        },
  { id: 'accessories', label: 'Accessories' },
  { id: 'beauty',      label: 'Beauty'      },
  { id: 'jewelry',     label: 'Jewelry'     }
];

const STYLES = {

classic: {
  id: 'classic', name: 'Classic', tagline: 'timeless. refined. forever.', letter: 'C', mood: 'Refined',
  short: 'Polished pieces, neutral tones, and quiet confidence.',
  intro: 'Classic style is the language of timelessness — a wardrobe built on intention, structure, and quiet luxury. It rejects fleeting trends in favor of pieces that endure: a tailored blazer, a crisp white button-down, the perfect trench. The personality behind it is composed, deliberate, and self-assured.',
  metaMood: 'Refined', metaSeason: 'All year', metaPersonality: 'Composed',
  heroImg: img('classic fashion woman tailored blazer'),
  accentImg: img('white shirt elegant'),
  outfits: [
    { label: 'Daily wear', img: slotImg('classic', 'outfit1', 'tailored blazer trousers woman') },
    { label: 'University', img: slotImg('classic', 'outfit2', 'cardigan loafers preppy') },
    { label: 'Winter',     img: slotImg('classic', 'outfit3', 'camel coat winter outfit') },
    { label: 'Summer',     img: slotImg('classic', 'outfit4', 'white shirt linen pants summer') },
    { label: 'Elegant',    img: slotImg('classic', 'outfit5', 'little black dress classic') },
    { label: 'Casual',     img: slotImg('classic', 'outfit6', 'button down jeans woman') },
    { label: 'Workwear',   img: slotImg('classic', 'outfit7', 'blazer pencil skirt office') },
    { label: 'Evening',    img: slotImg('classic', 'outfit8', 'silk blouse pearls') }
  ],
  notes: {
    makeup: ['Rosy nude lipstick', 'Soft taupe eyeshadow', 'Defined brow', 'Subtle peach blush', 'Glowy skin finish'],
    hair:   ['Low chignon', 'Soft blowout', 'Side-parted lob', 'Polished low ponytail'],
    scent:  ['Chanel No.5', 'Chloe Eau de Parfum', 'Le Labo Rose 31']
  },
  palette: [
    { hex: '#f5efe6', name: 'Cream' },    { hex: '#d4b896', name: 'Camel' },
    { hex: '#8b6f47', name: 'Chestnut' }, { hex: '#2c2620', name: 'Espresso' },
    { hex: '#ffffff', name: 'Optic' },    { hex: '#3a4a52', name: 'Slate' }
  ],
  completeLook: {
    title: 'The Effortless Workday',
    desc: 'A tailored blazer over a crisp shirt, leather loafers, and a single gold detail.',
    img: img('tailored blazer outfit camel woman')
  },
  shop: {
    clothing: [
      P('aff', 'SHEIN', 'Tailored Blazer', '$26', 'tailored blazer beige', 'beige blazer woman product'),
      P('mid', 'Zara', 'Wool-Blend Blazer', '$129', 'wool blazer woman', 'wool blazer beige product'),
      P('lux', 'Massimo Dutti', '100% Wool Blazer', '$295', 'wool blazer', 'camel wool blazer product')
    ],
    shoes: [
      P('aff', 'H&M', 'Loafers', '$39', 'loafers women', 'loafers brown product'),
      P('mid', 'Mango', 'Leather Loafers', '$99', 'leather loafers women', 'leather loafers product'),
      P('lux', 'COS', 'Square-Toe Loafers', '$235', 'leather loafers', 'classic loafers brown product')
    ],
    bags: [
      P('aff', 'H&M', 'Faux-Leather Tote', '$29', 'leather tote bag', 'tan tote bag product'),
      P('mid', 'Mango', 'Leather Shopper', '$129', 'leather shopper bag', 'leather tote bag product'),
      P('lux', 'COS', 'Soft Leather Tote', '$245', 'leather tote', 'tan leather tote product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Silk-Feel Scarf', '$12', 'silk scarf', 'silk scarf neutral product'),
      P('mid', 'Mango', 'Printed Silk Scarf', '$45', 'silk scarf', 'silk scarf product'),
      P('lux', 'COS', 'Pure Silk Scarf', '$85', 'silk scarf', 'silk scarf elegant product')
    ],
    beauty: [
      P('aff', 'Sephora', 'NYX Soft Matte Lip', '$7', 'NYX soft matte lip cream', 'nude lipstick product'),
      P('mid', 'Sephora', 'NARS Lipstick', '$32', 'NARS lipstick rosy nude', 'lipstick product nude'),
      P('lux', 'Sephora', 'Chanel Rouge Coco', '$48', 'chanel rouge coco', 'luxury lipstick product')
    ],
    jewelry: [
      P('aff', 'H&M', 'Pearl Stud Earrings', '$15', 'pearl earrings', 'pearl earrings product'),
      P('mid', 'Mango', 'Gold Watch', '$79', 'gold watch women', 'gold watch product'),
      P('lux', 'Mejuri', 'Pearl Studs', '$98', 'pearl studs', 'pearl earrings gold product')
    ]
  }
},

casual: {
  id: 'casual', name: 'Casual', tagline: 'easy. comfortable. effortless.', letter: 'C', mood: 'Easy',
  short: 'Relaxed essentials with a soft, lived-in feel.',
  intro: 'Casual style is the art of looking put-together without trying. It is the language of weekends, coffee runs, and long walks home. Built on denim, soft knits, and breathable cotton, it prioritizes ease — but ease, done well, is its own kind of polish.',
  metaMood: 'Easy', metaSeason: 'Year-round', metaPersonality: 'Warm',
  heroImg: img('casual fashion woman jeans sweater'),
  accentImg: img('denim jacket girl'),
  outfits: [
    { label: 'Daily wear', img: slotImg('casual', 'outfit1', 'jeans sweater casual outfit') },
    { label: 'University', img: slotImg('casual', 'outfit2', 'sweatshirt jeans backpack') },
    { label: 'Winter',     img: slotImg('casual', 'outfit3', 'puffer jacket beanie casual') },
    { label: 'Summer',     img: slotImg('casual', 'outfit4', 'white tee shorts casual') },
    { label: 'Weekend',    img: slotImg('casual', 'outfit5', 'hoodie sneakers comfy') },
    { label: 'Travel',     img: slotImg('casual', 'outfit6', 'comfy travel outfit airport') },
    { label: 'Coffee run', img: slotImg('casual', 'outfit7', 'oversized sweater jeans') },
    { label: 'Everyday',   img: slotImg('casual', 'outfit8', 'basic tee jeans woman') }
  ],
  notes: {
    makeup: ['Tinted lip balm', 'Cream blush', 'Brow gel only', 'Mascara', 'Skin tint, no foundation'],
    hair:   ['Messy bun', 'Loose waves', 'Half-up half-down', 'Low ponytail'],
    scent:  ['Glossier You', 'Maison Margiela By the Fireplace']
  },
  palette: [
    { hex: '#dde4dc', name: 'Sage' },   { hex: '#94a8b8', name: 'Denim' },
    { hex: '#e8d8c4', name: 'Sand' },   { hex: '#f4f4f4', name: 'White' },
    { hex: '#7a8a6b', name: 'Olive' },  { hex: '#3d3530', name: 'Bark' }
  ],
  completeLook: {
    title: 'The Saturday Coffee Run',
    desc: 'Worn-in jeans, an oversized knit, and white sneakers. Comfortable enough to walk in for hours.',
    img: img('casual jeans sweater sneakers outfit')
  },
  shop: {
    clothing: [
      P('aff', 'Uniqlo', 'Crew Sweatshirt', '$29', 'crew sweatshirt', 'grey sweatshirt product'),
      P('mid', 'Levis', '501 Original Jean', '$98', '501 original jeans', 'blue jeans product'),
      P('lux', 'Everlane', 'Cashmere Crew', '$148', 'cashmere crew sweater', 'cashmere sweater beige product')
    ],
    shoes: [
      P('aff', 'H&M', 'Canvas Sneakers', '$35', 'white sneakers', 'white sneakers product'),
      P('mid', 'Adidas', 'Stan Smith', '$100', 'stan smith', 'stan smith sneakers product'),
      P('lux', 'Nike', 'Cortez Leather', '$110', 'cortez leather', 'cortez sneakers product')
    ],
    bags: [
      P('aff', 'SHEIN', 'Cotton Tote', '$12', 'cotton tote bag', 'canvas tote bag product'),
      P('mid', 'Mango', 'Crossbody Bag', '$59', 'crossbody bag', 'crossbody bag tan product'),
      P('lux', 'COS', 'Mini Leather Bag', '$185', 'mini leather bag', 'mini leather bag product')
    ],
    accessories: [
      P('aff', 'ASOS', 'Baseball Cap', '$15', 'baseball cap', 'baseball cap product'),
      P('mid', 'Nike', 'Heritage Cap', '$30', 'heritage cap', 'baseball cap white product'),
      P('lux', 'Mango', 'Wool Beanie', '$39', 'wool beanie', 'wool beanie cream product')
    ],
    beauty: [
      P('aff', 'Sephora', 'e.l.f. Lip Balm', '$5', 'elf lip balm', 'lip balm product'),
      P('mid', 'Glossier', 'Balm Dotcom', '$14', 'balm dotcom', 'lip balm pink product'),
      P('lux', 'Sephora', 'Augustinus Bader Lip', '$48', 'augustinus bader lip balm', 'luxury lip balm product')
    ],
    jewelry: [
      P('aff', 'H&M', 'Gold Hoops', '$9', 'gold hoops', 'gold hoop earrings product'),
      P('mid', 'Mango', 'Gold-Plated Hoops', '$29', 'gold hoop earrings', 'gold hoops product'),
      P('lux', 'Mejuri', 'Small Hoops', '$98', 'small gold hoops', 'gold hoops jewelry product')
    ]
  }
},

streetwear: {
  id: 'streetwear', name: 'Streetwear', tagline: 'bold. unapologetic. yours.', letter: 'S', mood: 'Bold',
  short: 'Sneakers, oversized layers, and graphic confidence.',
  intro: 'Streetwear is fashion as identity, as music, as movement. Born from skate parks, hip-hop, and youth subculture, it took the language of the street and turned it into the loudest voice in fashion. Oversized hoodies, statement sneakers, cargo pants, graphic tees — every piece carries weight.',
  metaMood: 'Bold', metaSeason: 'All year', metaPersonality: 'Confident',
  heroImg: img('streetwear fashion woman hoodie sneakers'),
  accentImg: img('sneakers urban'),
  outfits: [
    { label: 'Daily wear', img: slotImg('streetwear', 'outfit1', 'oversized hoodie cargo pants') },
    { label: 'University', img: slotImg('streetwear', 'outfit2', 'streetwear backpack sneakers') },
    { label: 'Winter',     img: slotImg('streetwear', 'outfit3', 'puffer jacket streetwear') },
    { label: 'Summer',     img: slotImg('streetwear', 'outfit4', 'graphic tee shorts sneakers') },
    { label: 'Statement',  img: slotImg('streetwear', 'outfit5', 'streetwear bold outfit') },
    { label: 'Sneakers',   img: slotImg('streetwear', 'outfit6', 'jordan sneakers outfit') },
    { label: 'Layered',    img: slotImg('streetwear', 'outfit7', 'oversized layered streetwear') },
    { label: 'Y2K street', img: slotImg('streetwear', 'outfit8', 'cargo pants y2k') }
  ],
  notes: {
    makeup: ['Glossy lip', 'Smoked-out liner', 'Brushed brows', 'Bronzy skin', 'Faux freckles'],
    hair:   ['Slick-back bun', 'Two braids', 'Space buns', 'Half-up claw clip'],
    scent:  ['Le Labo Santal 33', 'Tom Ford Lost Cherry']
  },
  palette: [
    { hex: '#1a1a1a', name: 'Onyx' },   { hex: '#e63946', name: 'Power' },
    { hex: '#f5f5f5', name: 'Bone' },   { hex: '#5a4a3a', name: 'Earth' },
    { hex: '#ff7a00', name: 'Flame' },  { hex: '#3d4a8a', name: 'Indigo' }
  ],
  completeLook: {
    title: 'The Statement Sneaker Day',
    desc: 'Oversized hoodie, baggy cargos, and the loudest sneakers you own.',
    img: img('streetwear oversized hoodie cargos sneakers')
  },
  shop: {
    clothing: [
      P('aff', 'SHEIN', 'Oversized Hoodie', '$19', 'oversized hoodie', 'oversized hoodie black product'),
      P('mid', 'Pull&Bear', 'Cargo Pants', '$45', 'cargo pants', 'cargo pants product'),
      P('lux', 'Adidas', 'Track Jacket', '$130', 'track jacket', 'track jacket product')
    ],
    shoes: [
      P('aff', 'H&M', 'Chunky Sneakers', '$45', 'chunky sneakers', 'chunky sneakers product'),
      P('mid', 'Nike', 'Air Force 1', '$115', 'air force 1', 'air force 1 sneakers product'),
      P('lux', 'Nike', 'Dunk High', '$130', 'dunk high', 'dunk high sneakers product')
    ],
    bags: [
      P('aff', 'SHEIN', 'Sling Bag', '$15', 'sling bag', 'sling bag black product'),
      P('mid', 'Adidas', 'Originals Sling', '$45', 'originals sling bag', 'sling crossbody product'),
      P('lux', 'Nike', 'Heritage Backpack', '$95', 'heritage backpack', 'backpack streetwear product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Bucket Hat', '$12', 'bucket hat', 'bucket hat product'),
      P('mid', 'H&M', 'Wool Bucket Hat', '$25', 'wool bucket hat', 'bucket hat black product'),
      P('lux', 'Adidas', 'Originals Cap', '$35', 'originals cap', 'baseball cap black product')
    ],
    beauty: [
      P('aff', 'Sephora', 'NYX Butter Gloss', '$5', 'nyx butter gloss', 'lip gloss product'),
      P('mid', 'Sephora', 'Fenty Gloss Bomb', '$22', 'fenty gloss bomb', 'lip gloss product nude'),
      P('lux', 'Sephora', 'Pat McGrath Gloss', '$32', 'pat mcgrath lip gloss', 'luxury lip gloss product')
    ],
    jewelry: [
      P('aff', 'SHEIN', 'Layered Chain Set', '$8', 'layered chain necklace', 'silver chain necklace product'),
      P('mid', 'Mango', 'Chunky Chain', '$35', 'chunky chain necklace', 'chunky chain product'),
      P('lux', 'Mejuri', 'Bold Chain', '$148', 'bold chain necklace', 'gold chain necklace product')
    ]
  }
},

minimalist: {
  id: 'minimalist', name: 'Minimalist', tagline: 'less, but better.', letter: 'M', mood: 'Calm',
  short: 'Clean lines, neutral palette, intentional pieces.',
  intro: 'Minimalist style is a philosophy stitched into clothing. It is the deliberate rejection of excess — no logos, no clutter, no noise. Every piece has a purpose. Every silhouette is considered. Minimalism is not boring; it is editing as a form of expression.',
  metaMood: 'Calm', metaSeason: 'All year', metaPersonality: 'Discerning',
  heroImg: img('minimalist fashion woman beige neutral'),
  accentImg: img('minimal outfit white'),
  outfits: [
    { label: 'Daily wear', img: slotImg('minimalist', 'outfit1', 'beige outfit minimal') },
    { label: 'University', img: slotImg('minimalist', 'outfit2', 'minimal sweater jeans clean') },
    { label: 'Winter',     img: slotImg('minimalist', 'outfit3', 'long coat minimal beige') },
    { label: 'Summer',     img: slotImg('minimalist', 'outfit4', 'linen dress minimal') },
    { label: 'Workwear',   img: slotImg('minimalist', 'outfit5', 'minimal blazer trousers') },
    { label: 'Evening',    img: slotImg('minimalist', 'outfit6', 'black slip dress minimal') },
    { label: 'Weekend',    img: slotImg('minimalist', 'outfit7', 'white tee jeans minimal') },
    { label: 'Layered',    img: slotImg('minimalist', 'outfit8', 'minimal layered neutral') }
  ],
  notes: {
    makeup: ['Berry-stained lip', 'Bare lid, lashes only', 'Brushed brows', 'Skin tint'],
    hair:   ['Sleek low bun', 'Middle-part lob', 'Slick straight'],
    scent:  ['Le Labo Rose 31', 'Aesop Hwyl']
  },
  palette: [
    { hex: '#f4f0ea', name: 'Bone' },     { hex: '#d4c4a8', name: 'Oat' },
    { hex: '#a89684', name: 'Stone' },    { hex: '#736356', name: 'Taupe' },
    { hex: '#2d2820', name: 'Charcoal' }, { hex: '#ffffff', name: 'White' }
  ],
  completeLook: {
    title: 'The Considered Wardrobe',
    desc: 'A long wool coat, soft cashmere, tonal trousers, and one piece of fine jewelry.',
    img: img('minimal beige outfit cashmere coat')
  },
  shop: {
    clothing: [
      P('aff', 'Uniqlo', 'Linen Shirt', '$40', 'linen shirt women', 'linen shirt cream product'),
      P('mid', 'Mango', 'Linen Trousers', '$69', 'linen trousers', 'linen trousers product'),
      P('lux', 'COS', 'Wool Coat', '$295', 'wool coat', 'beige wool coat product')
    ],
    shoes: [
      P('aff', 'H&M', 'Square-Toe Loafers', '$39', 'square toe loafers', 'minimalist loafers product'),
      P('mid', 'Mango', 'Leather Mules', '$99', 'leather mules', 'leather mules product'),
      P('lux', 'COS', 'Leather Loafers', '$235', 'leather loafers minimalist','leather loafers black product')
    ],
    bags: [
      P('aff', 'H&M', 'Structured Tote', '$29', 'structured tote', 'minimal tote bag product'),
      P('mid', 'Mango', 'Leather Sling', '$89', 'leather sling bag', 'leather sling bag product'),
      P('lux', 'COS', 'Leather Tote', '$245', 'leather tote', 'minimalist leather tote product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Linen Scarf', '$10', 'linen scarf', 'neutral scarf product'),
      P('mid', 'COS', 'Wool-Blend Scarf', '$69', 'wool scarf', 'wool scarf beige product'),
      P('lux', 'Mango', 'Leather Belt', '$59', 'leather belt women', 'leather belt product')
    ],
    beauty: [
      P('aff', 'Sephora', 'e.l.f. Lip Stain', '$7', 'elf lip stain', 'berry lip stain product'),
      P('mid', 'Glossier', 'Generation G', '$20', 'generation g', 'lipstick berry product'),
      P('lux', 'Sephora', 'Le Labo Rose 31', '$190', 'le labo rose 31', 'le labo perfume product')
    ],
    jewelry: [
      P('aff', 'H&M', 'Thin Gold Chain', '$15', 'thin gold chain necklace', 'gold chain necklace product'),
      P('mid', 'Mango', 'Geometric Earrings', '$29', 'geometric earrings gold', 'gold earrings product'),
      P('lux', 'Mejuri', 'Croissant Chain', '$148', 'croissant chain', 'gold chain necklace minimal product')
    ]
  }
},

elegant: {
  id: 'elegant', name: 'Elegant', tagline: 'grace in motion.', letter: 'E', mood: 'Romantic',
  short: 'Soft drapery, rich fabrics, and feminine silhouettes.',
  intro: 'Elegant style is the embodiment of femininity refined. It moves with intention — silk that catches light, satin that drapes, lace that suggests rather than reveals. Pearls, kitten heels, ballet pinks. The personality behind it is gentle, romantic, and self-possessed.',
  metaMood: 'Romantic', metaSeason: 'All year', metaPersonality: 'Gentle',
  heroImg: img('elegant fashion woman silk dress'),
  accentImg: img('pearl necklace silk'),
  outfits: [
    { label: 'Daily wear',    img: slotImg('elegant', 'outfit1', 'silk blouse skirt elegant') },
    { label: 'Brunch',        img: slotImg('elegant', 'outfit2', 'floral midi dress elegant') },
    { label: 'Winter',        img: slotImg('elegant', 'outfit3', 'long wool coat elegant') },
    { label: 'Summer',        img: slotImg('elegant', 'outfit4', 'linen dress elegant cream') },
    { label: 'Cocktail',      img: slotImg('elegant', 'outfit5', 'satin slip dress elegant') },
    { label: 'Evening',       img: slotImg('elegant', 'outfit6', 'black gown elegant') },
    { label: 'Wedding guest', img: slotImg('elegant', 'outfit7', 'midi dress wedding guest') },
    { label: 'Romantic',      img: slotImg('elegant', 'outfit8', 'lace blouse romantic') }
  ],
  notes: {
    makeup: ['Rosy pink lip', 'Soft pink eyeshadow', 'Defined lashes', 'Pink blush', 'Glowy base'],
    hair:   ['Soft chignon', 'Loose romantic curls', 'Ribbon ponytail'],
    scent:  ['Chloe Rose Tangerine', 'Miss Dior Blooming']
  },
  palette: [
    { hex: '#fbe8e1', name: 'Blush' },     { hex: '#e8c5b8', name: 'Peach' },
    { hex: '#f8f1e4', name: 'Champagne' }, { hex: '#c8a594', name: 'Rose Gold' },
    { hex: '#7a4a3d', name: 'Bordeaux' },  { hex: '#fffdf9', name: 'Pearl' }
  ],
  completeLook: {
    title: 'The Soft Cocktail Hour',
    desc: 'A satin slip dress, kitten heels, pearl earrings, and a top-handle bag.',
    img: img('elegant silk slip dress pearls outfit')
  },
  shop: {
    clothing: [
      P('aff', 'H&M', 'Satin Blouse', '$35', 'satin blouse', 'satin blouse blush product'),
      P('mid', 'Mango', 'Lace-Trim Slip', '$89', 'lace slip dress', 'slip dress satin product'),
      P('lux', 'Reformation', 'Silk Slip Dress', '$248', 'silk slip dress', 'silk slip dress product')
    ],
    shoes: [
      P('aff', 'SHEIN', 'Kitten Heel Slingbacks', '$25', 'kitten heels', 'kitten heels product'),
      P('mid', 'Zara', 'Slingback Pumps', '$79', 'slingback pumps', 'slingback heels product'),
      P('lux', 'Mango', 'Leather Kitten Heels', '$139', 'leather kitten heels', 'leather kitten heels product')
    ],
    bags: [
      P('aff', 'ASOS', 'Top-Handle Bag', '$35', 'top handle bag', 'top handle bag pink product'),
      P('mid', 'Mango', 'Mini Top-Handle', '$89', 'mini top handle bag', 'mini top handle bag product'),
      P('lux', 'COS', 'Leather Top-Handle', '$245', 'top handle leather bag', 'top handle leather bag product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Pearl Hair Clip', '$5', 'pearl hair clip', 'pearl hair clip product'),
      P('mid', 'Mango', 'Silk Hair Scarf', '$25', 'silk hair scarf', 'silk scarf hair product'),
      P('lux', 'COS', 'Silk Twill Scarf', '$85', 'silk twill scarf', 'silk twill scarf product')
    ],
    beauty: [
      P('aff', 'Sephora', 'NYX Matte Lipstick', '$7', 'nyx matte lipstick rose', 'pink lipstick product'),
      P('mid', 'Sephora', 'Charlotte Tilbury Pillow Talk', '$38', 'charlotte tilbury pillow talk', 'pink lipstick product nude'),
      P('lux', 'Sephora', 'Chanel Rouge Allure', '$50', 'chanel rouge allure', 'chanel lipstick product')
    ],
    jewelry: [
      P('aff', 'H&M', 'Pearl Studs', '$9', 'pearl studs', 'pearl studs product'),
      P('mid', 'Mango', 'Pearl Drop Earrings', '$29', 'pearl drop earrings', 'pearl drop earrings product'),
      P('lux', 'Mejuri', 'Pearl Pendant', '$128', 'pearl pendant', 'pearl pendant necklace product')
    ]
  }
}

};

// More styles get added by data-extra.js

// ----- Remaining 5 styles -----
Object.assign(STYLES, {

korean: {
  id: 'korean', name: 'Korean Fashion', tagline: 'soft. sweet. quietly cool.', letter: 'K', mood: 'Sweet',
  short: 'Oversized layers, pastel cardigans, and dewy charm.',
  intro: 'Korean fashion is built on contrast. Oversized blazers paired with mini skirts. Dewy, luminous skin under chunky knits. Soft pastels next to schoolgirl pleats. It is feminine without being delicate, trendy without being aggressive.',
  metaMood: 'Sweet', metaSeason: 'Spring & Fall', metaPersonality: 'Dreamy',
  heroImg: img('korean fashion woman cute outfit'),
  accentImg: img('korean street style girl'),
  outfits: [
    { label: 'Daily wear', img: slotImg('korean', 'outfit1', 'korean fashion cardigan skirt') },
    { label: 'University', img: slotImg('korean', 'outfit2', 'korean uni outfit cute') },
    { label: 'Winter',     img: slotImg('korean', 'outfit3', 'korean winter long coat scarf') },
    { label: 'Summer',     img: slotImg('korean', 'outfit4', 'korean summer dress') },
    { label: 'Date',       img: slotImg('korean', 'outfit5', 'korean date outfit cute') },
    { label: 'Cafe',       img: slotImg('korean', 'outfit6', 'korean cafe outfit aesthetic') },
    { label: 'School',     img: slotImg('korean', 'outfit7', 'korean school uniform style') },
    { label: 'Cozy',       img: slotImg('korean', 'outfit8', 'korean cozy oversized') }
  ],
  notes: {
    makeup: ['Gradient lip tint', 'Straight brushed brows', 'Aegyo-sal under eye', 'Dewy glass skin'],
    hair:   ['Curtain bangs', 'Half-up bow', 'Loose claw-clip bun'],
    scent:  ['Chance Eau Tendre', 'Jo Malone Peony & Blush Suede']
  },
  palette: [
    { hex: '#fbe5e8', name: 'Cherry' },  { hex: '#f5e6c8', name: 'Cream' },
    { hex: '#d8c4e0', name: 'Lilac' },   { hex: '#a4c8e0', name: 'Sky' },
    { hex: '#fff4e8', name: 'Vanilla' }, { hex: '#594a3d', name: 'Mocha' }
  ],
  completeLook: {
    title: 'The Cafe Study Day',
    desc: 'Oversized cardigan, pleated mini, knee-high socks, and a tiny shoulder bag.',
    img: img('korean cafe outfit cardigan pleated skirt')
  },
  shop: {
    clothing: [
      P('aff', 'SHEIN', 'Oversized Cardigan', '$18', 'oversized cardigan pastel', 'pastel cardigan product'),
      P('mid', 'Stradivarius', 'Pleated Mini Skirt', '$39', 'pleated mini skirt', 'pleated skirt product'),
      P('lux', 'Mango', 'Knit Polo Sweater', '$99', 'knit polo sweater', 'knit polo product korean')
    ],
    shoes: [
      P('aff', 'H&M', 'Mary Jane Flats', '$35', 'mary jane flats', 'mary janes product'),
      P('mid', 'Bershka', 'Platform Loafers', '$50', 'platform loafers', 'platform loafers product'),
      P('lux', 'Mango', 'Leather Mary Janes', '$99', 'leather mary janes', 'leather mary janes product')
    ],
    bags: [
      P('aff', 'SHEIN', 'Mini Shoulder Bag', '$14', 'mini shoulder bag korean', 'mini shoulder bag product'),
      P('mid', 'Stradivarius', 'Quilted Mini Bag', '$39', 'quilted mini bag', 'quilted mini bag product'),
      P('lux', 'Mango', 'Leather Mini', '$99', 'leather mini bag', 'mini leather bag pink product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Pearl Hair Clips Set', '$5', 'pearl hair clips', 'pearl hair clips product'),
      P('mid', 'H&M', 'Knee-High Socks', '$12', 'knee high socks', 'knee high socks product'),
      P('lux', 'Urban Outfitters', 'Bow Hair Clip', '$35', 'bow hair clip', 'bow hair clip product')
    ],
    beauty: [
      P('aff', 'Sephora', 'Etude House Lip Tint', '$8', 'etude house lip tint', 'lip tint product'),
      P('mid', 'Sephora', 'Laneige Lip Mask', '$24', 'laneige lip sleeping mask', 'lip mask product'),
      P('lux', 'Sephora', 'Sulwhasoo Serum', '$80', 'sulwhasoo first care serum', 'korean serum product')
    ],
    jewelry: [
      P('aff', 'SHEIN', 'Pearl Pin Set', '$5', 'pearl pin hair', 'pearl jewelry product'),
      P('mid', 'H&M', 'Heart Pendant', '$15', 'heart pendant necklace', 'heart necklace product'),
      P('lux', 'Mejuri', 'Pearl Pendant', '$98', 'pearl pendant', 'pearl pendant gold product')
    ]
  }
},

y2k: {
  id: 'y2k', name: 'Y2K', tagline: 'rhinestones. low-rise. nostalgia.', letter: 'Y', mood: 'Playful',
  short: 'Glitter, baby tees, and unapologetic 2000s revival.',
  intro: 'Y2K style is fashion through a millennium-bug lens — a glittering revival of late 1990s and early 2000s pop culture. Low-rise jeans, baby tees, rhinestones, fur trim, denim-on-denim, ironic graphics. The personality is playful, nostalgic, and loud.',
  metaMood: 'Playful', metaSeason: 'Year-round', metaPersonality: 'Bold',
  heroImg: img('y2k fashion woman 2000s style'),
  accentImg: img('y2k baby tee outfit'),
  outfits: [
    { label: 'Daily wear', img: slotImg('y2k', 'outfit1', 'low rise jeans baby tee') },
    { label: 'University', img: slotImg('y2k', 'outfit2', 'y2k school outfit') },
    { label: 'Winter',     img: slotImg('y2k', 'outfit3', 'y2k fur jacket') },
    { label: 'Summer',     img: slotImg('y2k', 'outfit4', 'y2k mini skirt halter top') },
    { label: 'Going out',  img: slotImg('y2k', 'outfit5', 'y2k going out rhinestone') },
    { label: 'Tracksuit',  img: slotImg('y2k', 'outfit6', 'juicy couture tracksuit') },
    { label: 'Denim',      img: slotImg('y2k', 'outfit7', 'denim on denim y2k') },
    { label: 'Mall day',   img: slotImg('y2k', 'outfit8', 'y2k mall outfit early 2000s') }
  ],
  notes: {
    makeup: ['Frosted lip gloss', 'Shimmery silver eyeshadow', 'Thin pencil-line brow', 'Body glitter'],
    hair:   ['Crimped waves', 'Two-tone chunky highlights', 'Half-up double bubble pony'],
    scent:  ['Britney Spears Curious', 'Vanilla Fields']
  },
  palette: [
    { hex: '#ff6bb5', name: 'Bubblegum' }, { hex: '#e0e0e0', name: 'Chrome' },
    { hex: '#ff5e3a', name: 'Mandarin' },  { hex: '#9be3d4', name: 'Aqua' },
    { hex: '#a78ed8', name: 'Lavender' },  { hex: '#ffd700', name: 'Gold' }
  ],
  completeLook: {
    title: 'The Mall Day Throwback',
    desc: 'Low-rise jeans, baby tee, butterfly clips, and a tiny rhinestone shoulder bag.',
    img: img('y2k low rise jeans baby tee outfit')
  },
  shop: {
    clothing: [
      P('aff', 'SHEIN', 'Low-Rise Jeans', '$22', 'low rise jeans', 'low rise jeans product'),
      P('mid', 'Bershka', 'Cropped Baby Tee', '$15', 'baby tee crop', 'baby tee product pink'),
      P('lux', 'Pull&Bear', 'Low-Rise Cargo', '$50', 'low rise cargo', 'cargo pants y2k product')
    ],
    shoes: [
      P('aff', 'SHEIN', 'Chunky Platforms', '$32', 'chunky platform sneakers', 'platform sneakers product'),
      P('mid', 'Pull&Bear', 'Platform Mary Janes', '$50', 'platform mary janes', 'platform mary janes product'),
      P('lux', 'Adidas', 'Samba', '$100', 'samba', 'samba sneakers product')
    ],
    bags: [
      P('aff', 'SHEIN', 'Baguette Bag', '$12', 'baguette bag', 'mini baguette bag pink product'),
      P('mid', 'Urban Outfitters', 'Mini Shoulder Bag', '$45', 'mini shoulder bag y2k', 'mini shoulder bag rhinestone product'),
      P('lux', 'ASOS', 'Embellished Baguette', '$95', 'embellished baguette bag', 'rhinestone bag product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Butterfly Clips Set', '$4', 'butterfly hair clips', 'butterfly clips product'),
      P('mid', 'Urban Outfitters', 'Tinted Shades', '$25', 'tinted oval sunglasses', 'tinted sunglasses pink product'),
      P('lux', 'ASOS', 'Trucker Cap', '$22', 'trucker cap', 'trucker cap product')
    ],
    beauty: [
      P('aff', 'Sephora', 'NYX Lip Gloss', '$5', 'nyx lip gloss frosted', 'lip gloss frosted product'),
      P('mid', 'Sephora', 'Rare Beauty Gloss', '$22', 'rare beauty gloss', 'lip gloss y2k product'),
      P('lux', 'Sephora', 'Pat McGrath Gloss', '$32', 'pat mcgrath lust gloss', 'pat mcgrath gloss product')
    ],
    jewelry: [
      P('aff', 'SHEIN', 'Layered Chokers', '$8', 'choker layered set', 'choker necklace product'),
      P('mid', 'Pull&Bear', 'Charm Necklace', '$25', 'charm necklace', 'charm necklace product'),
      P('lux', 'Mejuri', 'Heart Locket', '$148', 'heart locket', 'heart locket gold product')
    ]
  }
},

vintage: {
  id: 'vintage', name: 'Vintage', tagline: 'every piece, a story.', letter: 'V', mood: 'Nostalgic',
  short: 'Curated thrift finds, retro silhouettes, lived-in charm.',
  intro: 'Vintage style is a love letter to the past, written in fabric. It draws from the 1940s shoulder, the 1950s waist, the 1960s shift, the 1970s flare. Each piece carries history. The personality behind it is curious, romantic, and a little contrarian.',
  metaMood: 'Nostalgic', metaSeason: 'All year', metaPersonality: 'Curious',
  heroImg: img('vintage fashion woman retro outfit'),
  accentImg: img('vintage thrifted outfit'),
  outfits: [
    { label: 'Daily wear', img: slotImg('vintage', 'outfit1', 'vintage 70s outfit jeans') },
    { label: 'University', img: slotImg('vintage', 'outfit2', 'vintage cardigan blouse') },
    { label: 'Winter',     img: slotImg('vintage', 'outfit3', 'vintage wool coat retro') },
    { label: 'Summer',     img: slotImg('vintage', 'outfit4', 'vintage 60s dress summer') },
    { label: '70s',        img: slotImg('vintage', 'outfit5', '70s flared jeans') },
    { label: '90s',        img: slotImg('vintage', 'outfit6', '90s grunge outfit') },
    { label: 'Romantic',   img: slotImg('vintage', 'outfit7', 'vintage tea dress') },
    { label: 'Edgy',       img: slotImg('vintage', 'outfit8', 'vintage leather jacket') }
  ],
  notes: {
    makeup: ['Red matte lip', 'Winged liquid liner', 'Defined arched brow', 'Pinched-cheek blush'],
    hair:   ['Pin curls', 'Headscarf wrap', 'Soft Hollywood waves'],
    scent:  ['Guerlain Shalimar', 'Estee Lauder Youth Dew']
  },
  palette: [
    { hex: '#a85c3a', name: 'Rust' },    { hex: '#d4a868', name: 'Mustard' },
    { hex: '#5c6a4a', name: 'Olive' },   { hex: '#7a3838', name: 'Cherry' },
    { hex: '#c4a48a', name: 'Caramel' }, { hex: '#3d2a20', name: 'Cocoa' }
  ],
  completeLook: {
    title: 'The Thrifted Sunday',
    desc: 'Vintage Levis, a 70s blouse, leather Mary Janes, and a story-worn shoulder bag.',
    img: img('vintage 70s outfit retro fashion')
  },
  shop: {
    clothing: [
      P('aff', 'SHEIN', 'Retro Print Blouse', '$25', 'retro print blouse', 'vintage style blouse product'),
      P('mid', 'Depop', 'Vintage Levis 501', '$85', 'vintage levis 501', 'vintage jeans product'),
      P('lux', 'Beyond Retro', 'Vintage Wool Cardigan', '$95', 'vintage wool cardigan', 'vintage cardigan product')
    ],
    shoes: [
      P('aff', 'H&M', 'Mary Jane Flats', '$40', 'mary jane flats', 'mary janes product'),
      P('mid', 'Mango', 'Leather Mary Janes', '$99', 'leather mary janes vintage', 'leather mary janes product'),
      P('lux', 'Dr. Martens', '1461 Oxford', '$160', '1461 oxford', 'dr martens oxford product')
    ],
    bags: [
      P('aff', 'Depop', 'Vintage Shoulder Bag', '$35', 'vintage shoulder bag', 'vintage handbag product'),
      P('mid', 'Etsy', 'Curated Leather Bag', '$85', 'vintage leather bag', 'vintage leather handbag product'),
      P('lux', 'Beyond Retro', 'Vintage Coach', '$195', 'vintage coach bag', 'vintage coach bag product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Cat-Eye Sunglasses', '$8', 'cat eye sunglasses', 'cat eye sunglasses product'),
      P('mid', 'ASOS', 'ASOS Design Cat-Eye', '$25', 'cat eye sunglasses tortoise', 'tortoise sunglasses product'),
      P('lux', 'Etsy', 'Vintage Brooch', '$45', 'vintage brooch', 'vintage brooch product')
    ],
    beauty: [
      P('aff', 'Sephora', 'NYX Liquid Suede', '$7', 'nyx liquid suede', 'red lipstick product'),
      P('mid', 'Sephora', 'MAC Ruby Woo', '$22', 'mac ruby woo', 'red matte lipstick product'),
      P('lux', 'Sephora', 'Chanel Rouge Coco', '$50', 'chanel rouge coco red', 'red lipstick chanel product')
    ],
    jewelry: [
      P('aff', 'SHEIN', 'Beaded Necklace', '$7', 'beaded necklace vintage', 'beaded necklace product'),
      P('mid', 'Etsy', 'Vintage Gold Locket', '$45', 'vintage gold locket', 'gold locket vintage product'),
      P('lux', 'Mejuri', 'Antique-Style Hoops', '$148', 'antique gold hoops', 'gold hoop earrings product')
    ]
  }
},

softgirl: {
  id: 'softgirl', name: 'Soft Girl', tagline: 'pastel. pretty. pure.', letter: 'S', mood: 'Tender',
  short: 'Pinks, hearts, ruffles, and Tumblr-era romance.',
  intro: 'Soft girl style is the aesthetic of unapologetic sweetness. Born on TikTok, raised on Tumblr, it celebrates everything pink, glittery, and tender. Heart-shaped sunglasses, ruffled blouses, pastel cardigans, butterfly motifs.',
  metaMood: 'Tender', metaSeason: 'Spring', metaPersonality: 'Gentle',
  heroImg: img('soft girl pink fashion aesthetic'),
  accentImg: img('pastel pink outfit girl'),
  outfits: [
    { label: 'Daily wear',  img: slotImg('softgirl', 'outfit1', 'pastel pink outfit cardigan') },
    { label: 'University',  img: slotImg('softgirl', 'outfit2', 'soft girl school outfit') },
    { label: 'Winter',      img: slotImg('softgirl', 'outfit3', 'pink puffer winter cute') },
    { label: 'Summer',      img: slotImg('softgirl', 'outfit4', 'floral dress soft girl') },
    { label: 'Cottagecore', img: slotImg('softgirl', 'outfit5', 'cottagecore dress prairie') },
    { label: 'Picnic',      img: slotImg('softgirl', 'outfit6', 'picnic floral dress') },
    { label: 'Cozy',        img: slotImg('softgirl', 'outfit7', 'pink knit sweater cozy') },
    { label: 'Romantic',    img: slotImg('softgirl', 'outfit8', 'lace blouse pink soft') }
  ],
  notes: {
    makeup: ['Pink glossy lip', 'Pink eyeshadow', 'Faux freckles', 'Heavy pink blush'],
    hair:   ['Two low pigtails', 'Half-up bow', 'Pink butterfly clips'],
    scent:  ['Marc Jacobs Daisy', 'Ariana Grande Cloud']
  },
  palette: [
    { hex: '#ffd1dc', name: 'Petal' },        { hex: '#ffc8a8', name: 'Peach' },
    { hex: '#fff0f5', name: 'Cotton Candy' }, { hex: '#e6c8e0', name: 'Lilac' },
    { hex: '#fff8e7', name: 'Cream' },        { hex: '#c4a8b8', name: 'Mauve' }
  ],
  completeLook: {
    title: 'The Picnic Romance',
    desc: 'A floral midi, ballet flats, a heart-shaped bag, and a delicate pearl pendant.',
    img: img('soft girl pink floral dress outfit')
  },
  shop: {
    clothing: [
      P('aff', 'SHEIN', 'Floral Mini Dress', '$22', 'floral mini dress', 'floral dress pink product'),
      P('mid', 'H&M', 'Pastel Cardigan', '$48', 'pastel knit cardigan women', 'pink cardigan product'),
      P('lux', 'Reformation', 'Lace-Trim Dress', '$248', 'lace trim midi dress', 'lace dress product')
    ],
    shoes: [
      P('aff', 'H&M', 'Ballet Flats', '$30', 'ballet flats', 'pink ballet flats product'),
      P('mid', 'Stradivarius', 'Mary Janes', '$45', 'mary janes pink', 'pink mary janes product'),
      P('lux', 'Mango', 'Satin Ballet Flats', '$99', 'satin ballet flats', 'satin ballet flats product')
    ],
    bags: [
      P('aff', 'SHEIN', 'Heart-Shaped Bag', '$14', 'heart shaped bag', 'heart bag pink product'),
      P('mid', 'Princess Polly', 'Mini Heart Bag', '$45', 'mini heart bag', 'mini bag pink product'),
      P('lux', 'ASOS', 'Pearl-Bead Bag', '$95', 'pearl bead bag', 'pearl bag product')
    ],
    accessories: [
      P('aff', 'SHEIN', 'Heart Sunglasses', '$6', 'heart sunglasses', 'heart sunglasses pink product'),
      P('mid', 'H&M', 'Bow Hair Clips', '$18', 'bow hair clips set', 'bow hair clips product'),
      P('lux', 'Urban Outfitters', 'Pearl Headband', '$35', 'pearl headband', 'pearl headband product')
    ],
    beauty: [
      P('aff', 'Sephora', 'e.l.f. Cream Blush', '$5', 'elf cream blush pink', 'cream blush product'),
      P('mid', 'Sephora', 'Rare Beauty Blush', '$23', 'rare beauty blush', 'rare beauty blush product'),
      P('lux', 'Sephora', 'Chanel Joues Blush', '$52', 'chanel joues contraste', 'chanel blush product')
    ],
    jewelry: [
      P('aff', 'SHEIN', 'Pearl Pendant', '$7', 'pearl pendant cute', 'pearl pendant product'),
      P('mid', 'H&M', 'Bow Earrings', '$19', 'bow earrings', 'bow earrings product'),
      P('lux', 'Mejuri', 'Bold Pearl Pendant', '$128', 'bold pearl pendant', 'pearl pendant gold product')
    ]
  }
}

});

// ----------------------------------------
// QUIZ
// ----------------------------------------
const QUIZ = [
  {
    q: 'How would you describe your style?',
    options: [
      { icon: '🧥', text: 'Polished and put together',   tag: 'classic' },
      { icon: '☁️', text: 'Easy and comfortable',         tag: 'casual' },
      { icon: '🔥', text: 'Bold and unapologetic',       tag: 'streetwear' },
      { icon: '🤍', text: 'Quiet and minimal',           tag: 'minimalist' }
    ]
  },
  {
    q: 'Pick a color palette.',
    options: [
      { icon: '🪞', text: 'Cream, oat, ivory',           tag: 'minimalist' },
      { icon: '🌸', text: 'Blush, pearl, soft rose',     tag: 'elegant' },
      { icon: '🎀', text: 'Pastel pink and lace',        tag: 'softgirl' },
      { icon: '✨', text: 'Pink chrome and bubblegum',   tag: 'y2k' }
    ]
  },
  {
    q: 'A perfect weekend looks like…',
    options: [
      { icon: '🥐', text: 'A pastel café with a book',         tag: 'korean' },
      { icon: '🍷', text: 'A quiet wine bar at dinner',         tag: 'elegant' },
      { icon: '🎧', text: 'City streets with friends',         tag: 'streetwear' },
      { icon: '🍂', text: 'Hunting through a vintage market',  tag: 'vintage' }
    ]
  },
  {
    q: 'Pick a shoe.',
    options: [
      { icon: '👟', text: 'White sneakers',           tag: 'casual' },
      { icon: '🥿', text: 'Leather loafers',          tag: 'classic' },
      { icon: '👠', text: 'Heels or satin mules',     tag: 'elegant' },
      { icon: '🎀', text: 'Mary Janes or ballet flats', tag: 'softgirl' }
    ]
  },
  {
    q: 'Your fashion icon is closest to…',
    options: [
      { icon: '🎬', text: 'Audrey Hepburn — timeless',          tag: 'classic' },
      { icon: '🎤', text: 'A K-pop idol with iced americano',   tag: 'korean' },
      { icon: '⭐', text: 'Paris Hilton circa 2003',             tag: 'y2k' },
      { icon: '🌻', text: 'A 70s flower child',                 tag: 'vintage' }
    ]
  }
];

// ----------------------------------------
// AI STYLIST RESPONSES
// ----------------------------------------
const AI_RESPONSES = [

  // ── BEIGE / NEUTRAL OUTFITS ──
  {
    keywords: ['beige pants', 'beige trousers', 'tan pants', 'camel pants', 'beige', 'tan', 'camel', 'trousers', 'pants'],
    response: "Beige pants are a workhorse — they go with almost everything. Try:\n\n• A crisp white shirt + tan loafers for polished quiet luxury.\n• An oversized cream knit + white sneakers for soft minimalism.\n• A black turtleneck + ankle boots for autumn drama.\n• A camel blazer + white tee — effortlessly editorial.",
    productRefs: [
      ['aff', 'SHEIN', 'White Button-Down Shirt', '$15', 'white button down shirt women', 'white shirt product'],
      ['mid', 'Uniqlo', 'Cashmere Crew Knit', '$79', 'cashmere crew neck sweater women', 'cashmere sweater beige product'],
      ['mid', 'Mango', 'Fluid Beige Trousers', '$69', 'beige wide leg trousers women', 'beige trousers product'],
      ['lux', 'COS', 'Tailored Camel Trousers', '$135', 'tailored camel trousers women', 'camel trousers product']
    ]
  },

  // ── BLACK JEANS ──
  {
    keywords: ['black jeans', 'black denim', 'dark jeans', 'black jeans outfit', 'wear black jeans', 'black', 'jeans', 'denim'],
    response: "Black jeans anchor any wardrobe:\n\n• Camel coat + white tee + leather loafers — quiet luxury.\n• Graphic tee + chunky sneakers + bomber — easy streetwear.\n• Silk blouse + heeled mules — minimalist date night.\n• Knit sweater + gold hoops + ankle boots — casual chic.",
    productRefs: [
      ['aff', 'H&M', 'Black Straight Jeans', '$30', 'black straight leg jeans women', 'black jeans product'],
      ['mid', 'Levis', 'Mile High Black Jeans', '$98', 'levis mile high black jeans women', 'black jeans levis product'],
      ['lux', 'COS', 'Tapered Black Denim', '$135', 'tailored black jeans women', 'black jeans woman product']
    ]
  },

  // ── WHITE SHIRT ──
  {
    keywords: ['white shirt', 'white blouse', 'white button', 'button down', 'button-down', 'white top', 'crisp shirt', 'white', 'shirt', 'blouse'],
    response: "A white shirt is the most quietly powerful piece you can own:\n\n• Tucked into tailored trousers with loafers — classic.\n• Half-tucked into Levis with white sneakers — casual cool.\n• Under a knit vest with pleated skirt — refined.\n• Oversized + belted with wide-leg trousers — modern editorial.",
    productRefs: [
      ['aff', 'SHEIN', 'Cotton Button-Down', '$15', 'white button down shirt women', 'white shirt product'],
      ['mid', 'Uniqlo', 'Premium Linen Shirt', '$50', 'white linen shirt women', 'white linen shirt product'],
      ['lux', 'COS', 'Oversized Poplin Shirt', '$125', 'oversized white poplin shirt women', 'white poplin shirt product']
    ]
  },

  // ── DATE NIGHT ──
  {
    keywords: ['date night', 'date outfit', 'romantic dinner', 'dinner outfit', 'coffee date', 'date', 'dinner', 'romantic'],
    response: "Pick something you feel like *yourself* in — but elevated:\n\n• Satin slip dress + delicate gold chain + kitten heels.\n• High-waisted black trousers + soft silk blouse + statement earrings.\n• Midi dress in a rich tone + tailored blazer + ankle boots.\n• Wrap dress + barely-there sandals + a small leather bag.",
    productRefs: [
      ['aff', 'SHEIN', 'Satin Slip Dress', '$25', 'satin slip dress women elegant', 'satin slip dress product'],
      ['mid', 'Mango', 'Lace-Trim Slip Dress', '$89', 'lace slip dress women date night', 'slip dress black product'],
      ['lux', 'Reformation', 'Silk Slip Dress', '$248', 'silk slip dress women', 'silk slip dress product']
    ]
  },

  // ── WORK / INTERVIEW ──
  {
    keywords: ['job interview', 'work outfit', 'office outfit', 'professional outfit', 'business casual', 'interview', 'work', 'office', 'professional'],
    response: "Structure and confidence — here's how:\n\n• Tailored trousers + silk blouse + low pumps + leather tote.\n• Wrap dress in a solid color + gold studs — effortlessly polished.\n• Blazer over a tucked turtleneck + straight-leg pants.\n• Midi skirt + simple knit + pointed flats — understated authority.",
    productRefs: [
      ['aff', 'H&M', 'Tailored Wide-Leg Trousers', '$39', 'tailored trousers women office', 'tailored trousers product'],
      ['mid', 'Mango', 'Wool-Blend Blazer', '$129', 'wool blazer women office work', 'wool blazer product'],
      ['lux', 'Massimo Dutti', 'Pure Wool Blazer', '$295', 'pure wool tailored blazer women', 'wool blazer woman product']
    ]
  },

  // ── WINTER / COAT ──
  {
    keywords: ['winter outfit', 'winter coat', 'cold weather', 'winter look', 'winter', 'cold', 'coat', 'snow', 'layer', 'layering'],
    response: "Layers that look intentional, not bulky:\n\n• Long wool coat + chunky knit + straight-leg jeans + leather boots.\n• Puffer over hoodie + cargos + chunky sneakers — streetwear winter.\n• Teddy coat + turtleneck + midi skirt + tights — cozy chic.\n• Double-breasted coat + scarf + loafers — old money winter.",
    productRefs: [
      ['aff', 'H&M', 'Teddy Bear Coat', '$70', 'teddy bear coat women winter', 'teddy coat product'],
      ['mid', 'Mango', 'Wool-Blend Overcoat', '$179', 'wool overcoat women winter camel', 'wool coat product'],
      ['lux', 'COS', 'Long Structured Coat', '$295', 'long structured wool coat women', 'long coat wool product']
    ]
  },

  // ── SUMMER ──
  {
    keywords: ['summer outfit', 'summer look', 'hot weather', 'beach outfit', 'summer style', 'summer', 'hot', 'beach', 'warm', 'linen'],
    response: "Breathable fabrics — linen, cotton, silk:\n\n• Linen midi + leather sandals + straw tote — Mediterranean chic.\n• High-waisted shorts + fitted crop tee + white sneakers.\n• Slip dress + denim jacket for cooler evenings.\n• Flowy sundress + flat sandals + minimal gold jewelry.",
    productRefs: [
      ['aff', 'SHEIN', 'Linen-Blend Midi Dress', '$22', 'linen midi dress women summer', 'linen dress white product'],
      ['mid', 'Mango', 'Linen Midi Dress', '$79', 'linen midi dress women summer', 'linen midi product'],
      ['lux', 'Reformation', 'Linen Sundress', '$198', 'linen sundress women summer', 'linen sundress product']
    ]
  },

  // ── COLORS / COLOR MATCHING ──
  {
    keywords: ['what colors go', 'color combinations', 'color palette', 'color matching', 'colors match', 'color theory', 'color', 'colors', 'matching', 'palette'],
    response: "A few rules that never fail:\n\n• Stick to one palette family per outfit — warm (camel, rust, ivory) or cool (navy, grey, white).\n• Pair one statement color with two neutrals.\n• Tonal dressing — all one color family — always looks expensive.\n• Earth tones (terracotta, camel, olive, cream) work together effortlessly.\n• Add one unexpected accent — a red lip with all-beige."
  },

  // ── MINIMALIST ──
  {
    keywords: ['dress more minimalist', 'minimalist style', 'minimalist wardrobe', 'minimalist outfit', 'minimalist fashion', 'minimalist', 'minimal', 'capsule wardrobe basics'],
    response: "Minimalism is about intention, not absence:\n\n• Build around 5-6 colors — bone, taupe, oat, charcoal, white, black.\n• Quality over quantity: wool coat, cashmere knit, leather loafers, well-cut trousers.\n• Texture replaces pattern — linen, silk, wool, ribbed cotton.\n• One piece of fine jewelry worn daily.\n• Every piece should work with at least 5 others.",
    productRefs: [
      ['aff', 'Uniqlo', 'Ribbed Cashmere Crew', '$79', 'ribbed cashmere crew neck women', 'cashmere sweater product'],
      ['mid', 'COS', 'Wide-Leg Linen Trousers', '$99', 'wide leg linen trousers women beige', 'linen trousers product'],
      ['lux', 'Toteme', 'Oversized Wool Coat', '$895', 'toteme wool coat women', 'wool coat beige product']
    ]
  },

  // ── STREETWEAR ──
  {
    keywords: ['streetwear outfit', 'streetwear look', 'streetwear style', 'urban style', 'hype outfit', 'streetwear', 'street style', 'hypebae', 'hype'],
    response: "Commit to one bold piece and let everything else support it:\n\n• Statement sneakers + relaxed cargos + fitted tee + sling bag.\n• Oversized graphic hoodie + bike shorts + chunky sneakers.\n• Graphic tee under an open button-down + wide-leg jeans + Air Force 1s.\n• Tracksuit + clean sneakers + gold chain — effortless cool.",
    productRefs: [
      ['aff', 'SHEIN', 'Oversized Graphic Hoodie', '$19', 'oversized graphic hoodie women streetwear', 'oversized hoodie product'],
      ['mid', 'Pull&Bear', 'Cargo Wide-Leg Pants', '$45', 'cargo wide leg pants women', 'cargo pants product'],
      ['mid', 'Nike', 'Air Force 1 Low White', '$110', 'air force 1 low white women', 'air force 1 product'],
      ['lux', 'Acne Studios', 'Oversized Logo Sweatshirt', '$280', 'acne studios oversized sweatshirt', 'acne studios product']
    ]
  },

  // ── ACCESSORIES & JEWELRY ──
  {
    keywords: ['what accessories', 'accessories ideas', 'jewelry ideas', 'bag ideas', 'accessories', 'jewelry', 'handbag', 'bag'],
    response: "Accessories are where personality lives:\n\n• Pick one focal point — bold earrings or a statement bag, not both.\n• Mix metals consistently (all gold or all silver).\n• Invest in one good leather bag in a neutral — it works forever.\n• Pearls, gold hoops, and a delicate watch outlive every trend.\n• A scarf can be worn as a hair tie, bag charm, or belt.",
    productRefs: [
      ['aff', 'H&M', 'Gold Hoop Earrings', '$9', 'gold hoop earrings women', 'gold hoops product'],
      ['mid', 'Charles & Keith', 'Leather Crossbody Bag', '$75', 'leather crossbody bag women', 'leather crossbody product'],
      ['lux', 'Mejuri', 'Pearl Drop Earrings', '$128', 'pearl drop earrings women gold', 'pearl pendant product']
    ]
  },

  // ── BUDGET STYLE ──
  {
    keywords: ['budget fashion', 'affordable outfits', 'cheap clothes', 'affordable style', 'budget wardrobe', 'budget', 'cheap', 'affordable', 'low budget', 'inexpensive'],
    response: "You don't need a big budget for great style:\n\n• Thrift first for statement pieces: vintage Levis, wool coats, silk blouses.\n• Invest proportionally — spend on shoes and bags, they wear hardest.\n• Three perfect basics > ten almost-right pieces.\n• Uniqlo for quality basics that don't look cheap.\n• H&M and SHEIN for trendy seasonal items you'll wear a few times.",
    productRefs: [
      ['aff', 'SHEIN', 'Tailored Blazer', '$26', 'tailored blazer women affordable', 'tailored blazer product'],
      ['aff', 'H&M', 'Pleated Midi Skirt', '$29', 'pleated midi skirt women affordable', 'pleated skirt product'],
      ['aff', 'Uniqlo', 'Premium Linen Shirt', '$40', 'linen shirt women uniqlo', 'linen shirt product']
    ]
  },

  // ── HAIR ──
  {
    keywords: ['hairstyle ideas', 'hair ideas', 'hair suggestions', 'hair for outfit', 'hair', 'hairstyle'],
    response: "A few easy, elevated hairstyles:\n\n• Sleek low bun with middle part — minimalist polish.\n• Soft claw-clip half-up — Korean coffee-shop chic.\n• Loose Hollywood waves — vintage romance.\n• Two pulled-back braids under a slick pony — streetwear edge.\n• Ribbon-tied low pony — soft girl elegance."
  },

  // ── PERFUME / FRAGRANCE ──
  {
    keywords: ['perfume recommendations', 'what perfume', 'fragrance ideas', 'scent suggestions', 'romantic perfume', 'best perfumes', 'perfume', 'scent', 'fragrance'],
    response: "Fragrance is invisible style — pick a signature:\n\n• Classic and polished: Chanel No.5, Chloe Eau de Parfum.\n• Soft and romantic: Glossier You, Marc Jacobs Daisy.\n• Warm and smoky: Tom Ford Tobacco Vanille, Le Labo Santal 33.\n• Fresh and modern: Maison Margiela Replica Beach Walk.\n• Playful and Y2K: Viktor & Rolf Flowerbomb.",
    productRefs: [
      ['aff', 'Sephora', 'Glossier You EDP', '$70', 'glossier you perfume women', 'glossier you perfume product'],
      ['mid', 'Sephora', 'Marc Jacobs Daisy EDP', '$82', 'marc jacobs daisy perfume women', 'marc jacobs daisy product'],
      ['lux', 'Sephora', 'Le Labo Santal 33', '$220', 'le labo santal 33 perfume', 'le labo santal 33 product']
    ]
  },

  // ── ELEGANT / QUIET LUXURY ──
  {
    keywords: ['elegant style', 'quiet luxury', 'old money style', 'elegant look', 'classy outfit', 'sophisticated', 'elegant', 'classy', 'luxury style', 'old money'],
    response: "Quiet luxury is about restraint and quality:\n\n• Monochrome tonal outfits in cream, camel, or grey.\n• Investment pieces: cashmere knit, leather loafers, tailored trousers.\n• Let fabric do the talking — no logos, no loud prints.\n• Silk blouse + wide-leg trousers + simple gold jewelry.\n• A single great coat over anything = instant polish.",
    productRefs: [
      ['aff', 'H&M', 'Satin Slip Blouse', '$35', 'satin blouse women elegant', 'satin blouse product'],
      ['mid', 'Mango', 'Pleated Wide-Leg Trousers', '$99', 'pleated wide leg trousers women elegant', 'wide leg trousers product'],
      ['lux', 'Toteme', 'Cashmere Turtleneck', '$395', 'toteme cashmere turtleneck women', 'cashmere turtleneck product']
    ]
  },

  // ── KOREAN AESTHETIC ──
  {
    keywords: ['korean style', 'k-fashion', 'kpop style', 'korean aesthetic', 'korean fashion', 'korean outfit', 'korean', 'kpop', 'k-pop'],
    response: "Korean fashion = effortless softness with clean proportions:\n\n• Oversized cardigan + pleated mini skirt + white sneakers.\n• Cropped knit + high-waist wide-leg trousers + platform loafers.\n• Pastel blazer + simple white tee + straight jeans.\n• Soft blouse + soft denim skirt + Mary Janes + knee socks.",
    productRefs: [
      ['aff', 'SHEIN', 'Oversized Knit Cardigan', '$29', 'oversized knit cardigan korean women', 'oversized cardigan product'],
      ['mid', 'Uniqlo', 'Pleated Wide-Leg Trousers', '$59', 'pleated wide leg trousers women korean', 'pleated trousers product'],
      ['lux', 'Acne Studios', 'Ribbed Merino Knit', '$290', 'ribbed merino knit women', 'merino knit product']
    ]
  },

  // ── Y2K ──
  {
    keywords: ['y2k style', 'y2k aesthetic', 'y2k fashion', 'y2k outfit', 'y2k look', 'y2k', '2000s fashion', '2000s style', 'low rise'],
    response: "Y2K is nostalgia done right:\n\n• Baby tee + low-rise flare jeans + chunky platform sneakers.\n• Mini skirt + cropped cardigan + platform Mary Janes.\n• Velour set + chunky sneakers + tinted sunglasses.\n• Mesh top + denim mini + butterfly clips in the hair.",
    productRefs: [
      ['aff', 'SHEIN', 'Baby Tee Crop Top', '$12', 'baby tee y2k women', 'baby tee product'],
      ['mid', 'ASOS', 'Low-Rise Flare Jeans', '$55', 'low rise flare jeans women y2k', 'flare jeans product'],
      ['mid', 'Urban Outfitters', 'Platform Mary Janes', '$89', 'platform mary jane shoes women y2k', 'platform mary jane product']
    ]
  },

  // ── VINTAGE / RETRO ──
  {
    keywords: ['vintage style', 'retro look', 'vintage aesthetic', 'vintage outfit', 'vintage fashion', 'thrift style', 'vintage', 'retro', 'thrift', '70s', '90s'],
    response: "Vintage dressing is about character:\n\n• High-waist flare jeans + printed blouse + wedge mules — 70s.\n• Corduroy skirt + turtleneck + loafers + a great coat — 90s.\n• Prairie dress + cowboy boots + stacked jewelry — timeless boho.\n• Vintage Levis + shrunken blazer + vintage tee — effortless cool.",
    productRefs: [
      ['aff', 'Depop', 'Vintage High-Waist Flares', '$35', 'vintage high waist flare jeans women', 'flare jeans vintage product'],
      ['mid', 'Urban Outfitters', 'Corduroy Mini Skirt', '$59', 'corduroy mini skirt women vintage', 'corduroy skirt product'],
      ['mid', 'Dr. Martens', '1460 Pascal Boots', '$165', 'dr martens 1460 pascal leather boots women', 'dr martens boots product']
    ]
  },

  // ── SOFT GIRL / COQUETTE ──
  {
    keywords: ['soft girl', 'softgirl', 'coquette', 'feminine style', 'romantic style', 'girly outfit', 'bow aesthetic', 'cottagecore', 'soft aesthetic', 'feminine'],
    response: "Soft girl is sweetness with intention:\n\n• Floral mini dress + white platform Mary Janes + bow hair clip.\n• Pastel cardigan + pleated mini skirt + ballet flats.\n• Lace-trim blouse + ribbon skirt + pearl jewelry.\n• Cami dress + sheer cardigan over + kitten heels.",
    productRefs: [
      ['aff', 'SHEIN', 'Floral Mini Dress', '$22', 'floral mini dress women soft girl', 'floral dress product'],
      ['mid', 'H&M', 'Pastel Knit Cardigan', '$48', 'pastel knit cardigan women soft girl', 'pastel cardigan product'],
      ['mid', 'Charles & Keith', 'Ballet Flat Shoes', '$55', 'ballet flat shoes women', 'ballet flats product']
    ]
  },

  // ── BOOTS ──
  {
    keywords: ['elegant boots', 'black boots', 'ankle boots', 'knee high boots', 'boots outfit', 'wear boots', 'boots'],
    response: "Boots change the entire energy of a look:\n\n• Elegant black ankle boots + midi skirt + cashmere knit — refined.\n• Combat boots + mini dress — unexpected contrast.\n• Knee-high boots + straight-leg jeans + long coat — editorial.\n• Square-toe boots + tailored trousers — modern minimalist.",
    productRefs: [
      ['aff', 'SHEIN', 'Black Ankle Boots Pointed', '$45', 'black ankle boots pointed toe women elegant', 'black boots product'],
      ['mid', 'Mango', 'Leather Ankle Boots', '$119', 'leather ankle boots women elegant black', 'leather ankle boots product'],
      ['lux', 'Acne Studios', 'Leather Square-Toe Boots', '$650', 'acne studios leather boots women', 'acne studios boots product']
    ]
  },

  // ── MIDI DRESS ──
  {
    keywords: ['midi dress', 'midi skirt outfit', 'long dress', 'maxi dress', 'dress ideas', 'midi'],
    response: "The midi length is endlessly wearable:\n\n• Floral midi + denim jacket + white sneakers — casual.\n• Satin midi + gold jewelry + heels — evening.\n• Knit midi + ankle boots + structured bag — autumn.\n• Linen midi + flat sandals + straw bag — summer.",
    productRefs: [
      ['aff', 'SHEIN', 'Satin Midi Dress', '$28', 'satin midi dress women elegant', 'satin midi dress product'],
      ['mid', 'Mango', 'Knit Midi Dress', '$89', 'knit midi dress women autumn', 'knit midi dress product'],
      ['lux', 'Reformation', 'Floral Midi Dress', '$228', 'floral midi dress women elegant', 'floral midi dress product']
    ]
  },

  // ── WIDE LEG PANTS ──
  {
    keywords: ['wide leg pants', 'wide leg trousers', 'palazzo pants', 'flowy pants', 'wide leg', 'wide-leg'],
    response: "Wide-leg trousers are the most versatile silhouette right now:\n\n• High-waisted wide-leg + fitted turtleneck + loafers — classic.\n• Linen wide-leg + crop tank + flat sandals — summer ease.\n• Wide-leg cargos + fitted tee + chunky sneakers — street.\n• Belted wide-leg + silk blouse + kitten heels — elegant.",
    productRefs: [
      ['aff', 'SHEIN', 'High-Waist Wide-Leg Trousers', '$25', 'high waist wide leg trousers women', 'wide leg trousers product'],
      ['mid', 'Mango', 'Pleated Wide-Leg Trousers', '$89', 'pleated wide leg trousers women', 'wide leg pants product'],
      ['lux', 'COS', 'Wide-Leg Tailored Trousers', '$145', 'wide leg tailored trousers women cos', 'wide leg trousers cos product']
    ]
  },

  // ── LEATHER PANTS ──
  {
    keywords: ['leather pants', 'leather trousers', 'leather leggings', 'faux leather', 'leather bottoms'],
    response: "Leather pants are a season-less power move:\n\n• Camel knit + leather trousers + loafers — quiet luxury.\n• White tee + leather pants + white sneakers — minimal cool.\n• Blazer + leather trousers + heeled boots — evening edge.\n• Oversized hoodie + leather leggings + chunky sneakers — street.",
    productRefs: [
      ['aff', 'SHEIN', 'Faux Leather Straight Pants', '$29', 'faux leather straight leg pants women', 'faux leather pants product'],
      ['mid', 'Zara', 'Faux Leather Wide-Leg', '$79', 'faux leather wide leg trousers women', 'leather trousers product'],
      ['lux', 'Toteme', 'Slim Leather Trousers', '$490', 'toteme leather trousers women', 'leather pants product']
    ]
  },

  // ── BLAZER ──
  {
    keywords: ['blazer outfit', 'how to wear blazer', 'style a blazer', 'blazer look', 'blazer'],
    response: "The blazer is the ultimate transformer:\n\n• Oversized blazer + cycling shorts + white tee + sneakers — street.\n• Fitted blazer + silk cami + straight jeans + heeled mules — chic.\n• Boxy blazer + midi dress underneath — layering genius.\n• Monochrome blazer set (jacket + matching trousers) — power dressing.",
    productRefs: [
      ['aff', 'H&M', 'Single-Breasted Blazer', '$49', 'single breasted blazer women', 'blazer product'],
      ['mid', 'Mango', 'Structured Linen Blazer', '$119', 'structured linen blazer women', 'linen blazer product'],
      ['lux', 'Massimo Dutti', 'Pure Wool Blazer', '$295', 'pure wool blazer women tailored', 'wool blazer product']
    ]
  },

  // ── TURTLENECK ──
  {
    keywords: ['turtleneck outfit', 'turtleneck look', 'how to wear turtleneck', 'polo neck', 'turtleneck', 'polo neck'],
    response: "The turtleneck is quiet confidence:\n\n• Ribbed turtleneck + wide-leg trousers + loafers — Parisian.\n• Slim turtleneck under a blazer + straight jeans — layered.\n• Chunky turtleneck + leather trousers + ankle boots — editorial.\n• Cashmere turtleneck + midi skirt + pearl studs — elegant.",
    productRefs: [
      ['aff', 'Uniqlo', 'Ribbed Mock Neck', '$29', 'ribbed mock neck turtleneck women', 'turtleneck product'],
      ['mid', 'COS', 'Merino Turtleneck', '$89', 'merino wool turtleneck women', 'merino turtleneck product'],
      ['lux', 'Toteme', 'Cashmere Turtleneck Sweater', '$395', 'cashmere turtleneck sweater women', 'cashmere turtleneck product']
    ]
  },

  // ── WEDDING GUEST ──
  {
    keywords: ['wedding guest', 'wedding outfit', 'guest at wedding', 'formal event', 'formal outfit', 'wedding'],
    response: "Wedding guest dressing has one rule: don't upstage, but don't underwhelm:\n\n• Floral midi dress + strappy heels + small clutch — timeless.\n• Linen suit (blazer + trousers) + simple cami + kitten heels.\n• Wrap dress in a jewel tone + gold jewelry + nude heels.\n• Pleated maxi dress + low block heels — modern and floaty.",
    productRefs: [
      ['aff', 'SHEIN', 'Floral Wrap Midi Dress', '$35', 'floral wrap midi dress women wedding guest', 'floral midi dress product'],
      ['mid', 'Mango', 'Chiffon Midi Dress', '$99', 'chiffon midi dress women wedding guest', 'chiffon dress product'],
      ['lux', 'Reformation', 'Floral Midi Wedding Guest', '$248', 'floral midi dress wedding guest elegant', 'reformation wedding dress product']
    ]
  },

  // ── NIGHT OUT ──
  {
    keywords: ['night out', 'club outfit', 'going out', 'party outfit', 'evening look', 'girls night', 'going out look'],
    response: "For a night out, be the energy:\n\n• Fitted mini dress + strappy heels + small shoulder bag.\n• High-waisted leather shorts + cami + heeled boots.\n• Slip dress + leather jacket + chunky mules.\n• Strapless corset top + wide-leg trousers + pointed heels.",
    productRefs: [
      ['aff', 'SHEIN', 'Satin Mini Dress', '$22', 'satin mini dress women night out party', 'satin mini dress product'],
      ['mid', 'ASOS', 'Fitted Mini Going Out Dress', '$65', 'fitted mini dress women night out', 'mini dress product'],
      ['mid', 'Zara', 'Faux Leather Mini Skirt', '$49', 'faux leather mini skirt women night out', 'leather mini skirt product']
    ]
  },

  // ── BRUNCH ──
  {
    keywords: ['brunch outfit', 'weekend brunch', 'brunch look', 'casual chic', 'brunch'],
    response: "Brunch is effortlessly chic with the right pieces:\n\n• Linen trousers + stripe tee + loafers + tote bag.\n• Floral midi dress + denim jacket + sneakers.\n• High-waist jeans + knit top + mules + sunglasses.\n• Linen shorts + a nice blouse + flat sandals.",
    productRefs: [
      ['aff', 'H&M', 'Linen-Blend Trousers', '$35', 'linen blend trousers women casual', 'linen trousers product'],
      ['mid', 'Mango', 'Knit Stripe Top', '$49', 'knit stripe top women casual', 'stripe top product'],
      ['mid', 'Zara', 'Leather Mule Sandals', '$69', 'leather mule sandals women', 'mule sandals product']
    ]
  },

  // ── TRAVEL ──
  {
    keywords: ['travel outfit', 'airport outfit', 'travel style', 'comfortable travel', 'what to pack', 'travel', 'airport', 'vacation'],
    response: "Travel in style — comfort and chic aren't opposites:\n\n• Wide-leg trousers + fitted knit + loafers + long coat.\n• Linen wide-leg pants + simple tee + sneakers + tote.\n• Matching tracksuit set + white tee + clean sneakers.\n• Maxi skirt + fitted top + slides — ideal for warm destinations.",
    productRefs: [
      ['aff', 'SHEIN', 'Matching Tracksuit Set', '$35', 'matching tracksuit set women travel comfortable', 'tracksuit product'],
      ['mid', 'COS', 'Wide-Leg Crepe Trousers', '$99', 'wide leg crepe trousers women travel', 'wide leg trousers product'],
      ['mid', 'Uniqlo', 'Airism Wide-Leg Pants', '$49', 'uniqlo airism wide leg pants women', 'wide leg pants product']
    ]
  },

  // ── GYM / ATHLEISURE ──
  {
    keywords: ['gym outfit', 'workout outfit', 'athleisure', 'gym wear', 'sporty look', 'gym', 'workout', 'athletic'],
    response: "Athleisure that works from the gym to the street:\n\n• Matching set (sports bra + high-waist leggings) + oversized hoodie.\n• Wide-leg sweatpants + crop tee + chunky sneakers.\n• Biker shorts + longline tee + slides.\n• Tennis skirt + fitted top + platform sneakers — cute and sporty.",
    productRefs: [
      ['aff', 'SHEIN', 'Seamless Gym Set', '$29', 'seamless gym set sports bra leggings women', 'gym set product'],
      ['mid', 'Nike', 'High-Waist Leggings', '$65', 'nike high waist leggings women', 'nike leggings product'],
      ['mid', 'Adidas', 'Matching Sweat Set', '$85', 'adidas matching sweat set women', 'adidas sweat set product']
    ]
  },

  // ── GREEN OUTFITS ──
  {
    keywords: ['green outfit', 'olive outfit', 'green color', 'green clothes', 'khaki outfit', 'green'],
    response: "Green is one of the most wearable non-neutral shades:\n\n• Olive cargos + cream knit + white sneakers — casual.\n• Forest green midi dress + gold jewelry + nude heels — evening.\n• Sage linen trousers + white tee + loafers — minimal summer.\n• Hunter green coat + camel scarf + brown boots — winter.",
    productRefs: [
      ['aff', 'H&M', 'Olive Cargo Trousers', '$39', 'olive cargo trousers women', 'olive cargo pants product'],
      ['mid', 'Mango', 'Forest Green Midi Dress', '$79', 'forest green midi dress women', 'green dress product'],
      ['mid', 'Zara', 'Sage Linen Trousers', '$59', 'sage linen trousers women', 'sage trousers product']
    ]
  },

  // ── RED OUTFITS ──
  {
    keywords: ['red outfit', 'red dress', 'wearing red', 'red clothes', 'red look', 'red'],
    response: "Red is a statement — let it be the hero:\n\n• Red midi dress + nude heels + minimal gold jewelry.\n• Red trousers + white shirt + black loafers — bold but clean.\n• Red coat + all-black under it — the classic contrast.\n• Deep red blouse + straight-leg jeans + ankle boots.",
    productRefs: [
      ['aff', 'SHEIN', 'Red Satin Midi Dress', '$28', 'red satin midi dress women', 'red dress product'],
      ['mid', 'Mango', 'Red Tailored Trousers', '$79', 'red tailored trousers women', 'red trousers product'],
      ['mid', 'Zara', 'Red Wool Coat', '$129', 'red wool coat women', 'red coat product']
    ]
  },

  // ── CAPSULE WARDROBE ──
  {
    keywords: ['capsule wardrobe', 'wardrobe basics', 'wardrobe essentials', 'build wardrobe', 'wardrobe from scratch', 'capsule', 'essentials', 'basics'],
    response: "A capsule wardrobe built to last:\n\n• 2-3 pairs of trousers (black, camel, white or beige)\n• 1 tailored blazer in a neutral\n• 2-3 simple tees and a great white shirt\n• 1 quality denim in a clean wash\n• 1 knit sweater (cashmere if budget allows)\n• 1 wool coat\n• 1 versatile dress (midi or wrap)\n• Leather loafers, white sneakers, ankle boots\n\nStick to one color story — everything works with everything.",
    productRefs: [
      ['aff', 'Uniqlo', 'Ribbed Crew-Neck Knit', '$39', 'ribbed crew neck knit women', 'crew neck product'],
      ['mid', 'COS', 'Tailored Wide-Leg Trousers', '$99', 'tailored wide leg trousers women neutral', 'wide leg trousers product'],
      ['lux', 'Toteme', 'Classic Trench Coat', '$695', 'toteme trench coat women', 'trench coat product']
    ]
  },

  // ── DARK ACADEMIA ──
  {
    keywords: ['dark academia', 'dark academia style', 'bookish aesthetic', 'gothic academia', 'academic aesthetic'],
    response: "Dark academia is romance through structure:\n\n• Plaid mini skirt + turtleneck knit + knee-high socks + loafers.\n• Knit vest + white collared shirt + high-waist trousers + oxfords.\n• Oversized tweed blazer + straight jeans + Chelsea boots.\n• Long maxi skirt + fitted cardigan + corset top layer.",
    productRefs: [
      ['aff', 'SHEIN', 'Plaid Pleated Mini Skirt', '$19', 'plaid pleated mini skirt women dark academia', 'plaid skirt product'],
      ['mid', 'Urban Outfitters', 'Knit Vest Sweater', '$55', 'knit vest sweater women dark academia', 'knit vest product'],
      ['mid', 'Dr. Martens', 'Oxford Shoes Women', '$130', 'dr martens oxford shoes women', 'oxford shoes product']
    ]
  },

  // ── LOAFERS ──
  {
    keywords: ['loafers outfit', 'how to wear loafers', 'leather loafers', 'loafer shoes', 'loafers'],
    response: "Loafers are the most versatile shoe in 2025:\n\n• With a pleated midi skirt + knit — elegant day.\n• With straight-leg jeans + oversized blazer — Parisian cool.\n• With shorts + a crisp shirt — summer prep.\n• Platform loafers + mini skirt + fitted top — Korean chic.",
    productRefs: [
      ['aff', 'SHEIN', 'Platform Loafer Shoes', '$35', 'platform loafer shoes women', 'loafer shoes product'],
      ['mid', 'Mango', 'Leather Loafer Shoes', '$89', 'leather loafer shoes women', 'leather loafer product'],
      ['lux', 'COS', 'Chunky Sole Loafers', '$185', 'chunky sole leather loafers women', 'chunky loafers product']
    ]
  },

  // ── SNEAKER OUTFITS ──
  {
    keywords: ['sneaker outfit', 'outfit with sneakers', 'white sneakers outfit', 'how to wear sneakers', 'sneakers', 'trainers'],
    response: "Sneakers elevate or ground a look — your choice:\n\n• White sneakers + midi dress — the simplest, chicest combination.\n• Chunky sneakers + flare jeans + crop top — Y2K energy.\n• Clean white sneakers + tailored trousers + tee — Parisian off-duty.\n• Air Force 1s + cargos + graphic tee — streetwear staple.",
    productRefs: [
      ['aff', 'H&M', 'White Canvas Sneakers', '$25', 'white canvas sneakers women', 'white sneakers product'],
      ['mid', 'Adidas', 'Stan Smith White Sneakers', '$90', 'adidas stan smith white sneakers women', 'adidas stan smith product'],
      ['mid', 'Nike', 'Air Force 1 White', '$110', 'nike air force 1 white women', 'air force 1 product']
    ]
  },

  // ── SKIRT OUTFITS ──
  {
    keywords: ['mini skirt outfit', 'skirt ideas', 'how to style a skirt', 'skirt outfits', 'skirt', 'mini skirt', 'maxi skirt'],
    response: "Skirts are the most feminine-feeling yet endlessly versatile piece:\n\n• Pleated midi + fitted knit + loafers — polished.\n• Denim mini + fitted tee + white sneakers — classic casual.\n• Maxi floral skirt + simple top + flat sandals — summer.\n• Leather mini + oversized blazer + ankle boots — edge.",
    productRefs: [
      ['aff', 'SHEIN', 'Pleated Midi Skirt', '$18', 'pleated midi skirt women', 'pleated midi skirt product'],
      ['mid', 'Zara', 'Satin Midi Skirt', '$59', 'satin midi skirt women elegant', 'satin midi skirt product'],
      ['mid', 'Mango', 'Faux Leather Mini Skirt', '$49', 'faux leather mini skirt women', 'leather mini skirt product']
    ]
  },

  // ── TRANSITIONAL OUTFITS (SPRING/FALL) ──
  {
    keywords: ['spring outfit', 'autumn outfit', 'fall outfit', 'transitional outfit', 'in between weather', 'spring', 'autumn', 'fall'],
    response: "Transitional dressing = mastered layering:\n\n• Linen trousers + long-sleeve tee + light trench coat + loafers.\n• Midi dress + ribbed cardigan + ankle boots.\n• Straight-leg jeans + tucked knit + leather jacket.\n• Light blazer + simple tee + wide-leg trousers + mules.",
    productRefs: [
      ['aff', 'H&M', 'Ribbed Cardigan', '$35', 'ribbed cardigan women transitional', 'cardigan product'],
      ['mid', 'Mango', 'Fitted Leather Jacket', '$149', 'fitted leather jacket women', 'leather jacket product'],
      ['mid', 'Zara', 'Light Trench Coat', '$119', 'light trench coat women spring', 'trench coat product']
    ]
  },

  // ── JEWELRY STACKING ──
  {
    keywords: ['stack jewelry', 'layer necklaces', 'necklace layers', 'jewelry stacking', 'gold jewelry', 'layer jewelry'],
    response: "Jewelry layering rules:\n\n• Vary chain lengths — choker (14\"), collar (16\"), medium (18\"), long (24\").\n• Mix textures: thin chains with thicker ones, pendants with plain.\n• Stick to one metal for a polished result.\n• For earrings: ear cuff + small stud + hoop in one ear — maximalist chic.\n• Less is more with bold earrings — skip necklaces.",
    productRefs: [
      ['aff', 'H&M', 'Layered Gold Chains Set', '$12', 'layered gold chain necklace set women', 'gold chain necklace product'],
      ['mid', 'Mejuri', 'Gold Demi-Fine Necklace', '$78', 'gold demi fine necklace women', 'gold necklace product'],
      ['lux', 'Tiffany & Co.', 'Gold Chain Necklace', '$350', 'tiffany gold chain necklace women', 'tiffany necklace product']
    ]
  },

  // ── BAGS ──
  {
    keywords: ['what bag', 'bag outfit', 'handbag ideas', 'shoulder bag', 'tote bag', 'crossbody bag', 'mini bag', 'purse'],
    response: "The right bag pulls everything together:\n\n• Structured leather tote — polished, office, everything.\n• Mini crossbody — dinner, casual daytime, effortless.\n• Woven or straw tote — summer, beach, market runs.\n• Clutch — evening, weddings, anything cocktail.\n• Baguette — the most editorial silhouette right now.",
    productRefs: [
      ['aff', 'Charles & Keith', 'Structured Shoulder Bag', '$59', 'structured shoulder bag women', 'shoulder bag product'],
      ['mid', 'JW PEI', 'Woven Tote Bag', '$68', 'woven tote bag women', 'woven tote product'],
      ['lux', 'JW PEI', 'Gabbi Mini Bag', '$88', 'mini structured bag women leather elegant', 'leather mini bag product']
    ]
  }

];

const AI_FALLBACKS = [
  "Tell me a bit more — what's the occasion, weather, or vibe? I can build a full look around almost any starting piece.",
  "Are you leaning more polished and structured, or soft and easy? That changes everything.",
  "Walk me through what's already in your closet that you love — that's where great outfits start."
];

AI_RESPONSES.forEach(r => {
  if (r.productRefs) {
    r.products = r.productRefs.map(arr => P(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]));
    delete r.productRefs;
  }
});

// ============================================================
// BEAUTY NOTES — editorial caption for the beauty accent image
// ============================================================
const BEAUTY_NOTES = {
  classic:    'A clean canvas: SPF, a wash of mascara, and nude lips. Less is always more.',
  casual:     'Effortless skin, tinted balm, and a ponytail done right. Comfort before glam.',
  streetwear: 'Bold liner, glossy lips, or a clean fade — the face is part of the look.',
  minimalist: 'Skinimalism. Glass skin, clear brow gel, and one deliberate detail.',
  elegant:    'Dewy skin, a swipe of rose, and a perfume that lingers long after you leave the room.',
  korean:     'Glass skin, gradient lip, and a blush blended so softly it looks like a flush.',
  y2k:        'Frosted gloss, metallic shadow, and a tiny rhinestone — somewhere, anywhere.',
  vintage:    'A winged liner, a red lip, and a spritz of something powdery and warm.',
  softgirl:   'Rosy cheeks, glossy lips, and lashes that curl just enough to look like you weren\'t trying.'
};

// Inject beautyNote into each STYLES entry
Object.keys(BEAUTY_NOTES).forEach(id => {
  if (STYLES[id]) STYLES[id].beautyNote = BEAUTY_NOTES[id];
});

// ============================================================
// LOCAL IMAGE OVERRIDES — patch the 3 user-packed styles
// ============================================================
(function applyLocalPacks() {
  if (typeof USE_LOCAL_IMAGES === 'undefined' || !USE_LOCAL_IMAGES) return;
  if (typeof LOCAL_PACKED === 'undefined' || !LOCAL_PACKED) return;
  const base = LOCAL_IMG_BASE;
  const productSlotMap = {
    clothing: ['product-clothing-aff.jpg','product-clothing-mid.jpg','product-clothing-lux.jpg'],
    shoes:    ['product-shoes-aff.jpg','product-shoes-mid.jpg','product-shoes-lux.jpg'],
    bags:     ['product-bags-aff.jpg','product-bags-mid.jpg','product-bags-lux.jpg'],
    accessories: ['product-accessories-aff.jpg','product-accessories-mid.jpg','product-accessories-lux.jpg'],
    beauty:   ['product-beauty-aff.jpg','product-beauty-mid.jpg','product-beauty-lux.jpg'],
    jewelry:  ['product-jewelry-aff.jpg','product-jewelry-mid.jpg','product-jewelry-lux.jpg']
  };
  LOCAL_PACKED.forEach(id => {
    const s = STYLES[id];
    if (!s) return;
    const folder = base + '/' + id;
    s.heroImg     = folder + '/hero.jpg';
    s.accentImg   = folder + '/accent.jpg';
    s.lookbookImg = folder + '/lookbook.jpg';
    s.beautyImg   = folder + '/beauty.jpg';
    s.details = {
      fabric:    folder + '/detail-fabric.jpg',
      accessory: folder + '/detail-accessory.jpg',
      shoes:     folder + '/detail-shoes.jpg',
      jewelry:   folder + '/detail-jewelry.jpg',
      makeup:    folder + '/detail-makeup.jpg',
      bag:       folder + '/detail-bag.jpg'
    };
    s.outfits.forEach((o, i) => { o.img = folder + '/outfit-' + (i + 1) + '.jpg'; });
    if (s.completeLook) s.completeLook.img = folder + '/complete-look.jpg';
    Object.keys(productSlotMap).forEach(cat => {
      if (s.shop && s.shop[cat]) {
        s.shop[cat].forEach((p, i) => {
          if (productSlotMap[cat][i]) p.img = folder + '/' + productSlotMap[cat][i];
        });
      }
    });
  });

  // ── Pass 2: Fix duplicate outfit slots by borrowing from the closest relative aesthetic
  // Each entry: [styleId, relativeId] — relative is visually closest / aesthetically adjacent
  const OUTFIT_RELATIVES = [
    ['korean', 'softgirl'],   // Korean had 7 unique outfits; slot 8 was a copy of slot 1
    ['y2k',    'softgirl'],   // Y2K had 5–6 unique outfits; slots 7–8 copied from 1–2
  ];

  // Hard overrides for cross-style file-content duplicates (same bytes, different URLs — can't dedup by URL)
  // minimalist/outfit-8 is an identical copy of casual/outfit-6 — replace with classic slot 8 (adjacent aesthetic)
  if (STYLES.minimalist && STYLES.classic) {
    STYLES.minimalist.outfits[7].img = base + '/classic/outfit-8.jpg';
  }

  OUTFIT_RELATIVES.forEach(([id, relId]) => {
    const s   = STYLES[id];
    const rel = STYLES[relId];
    if (!s || !rel) return;

    const seen = new Set();
    let   relIdx = 0;

    s.outfits.forEach(o => {
      if (!seen.has(o.img)) {
        seen.add(o.img);
      } else {
        // Duplicate found — advance through relative's outfits to find a fresh image
        while (relIdx < rel.outfits.length && seen.has(rel.outfits[relIdx].img)) relIdx++;
        if (relIdx < rel.outfits.length) {
          o.img = rel.outfits[relIdx].img;
          seen.add(o.img);
          relIdx++;
        }
      }
    });
  });
})();
