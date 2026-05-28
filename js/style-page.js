/* ============================================================
   AURA — Style page renderer (sections 1–4)
   ============================================================ */
(function () {
  // Disable browser scroll restoration so page always starts at top
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const params = new URLSearchParams(window.location.search);
  const id = (window.location.hash ? window.location.hash.replace(/^#/, '') : (params.get('id') || 'classic'));
  const s = STYLES[id];
  const root = document.getElementById('style-content');

  if (!s) {
    root.innerHTML = '<div style="padding:200px 48px;text-align:center;"><h1>Style not found</h1><a href="index.html#styles" class="btn">Back to all styles</a></div>';
    return;
  }
  document.title = s.name + ' — AURA';

  const DESCRIPTIONS = {
    classic:    'Timeless tailoring rooted in quiet sophistication. Tweed blazers, ivory shirting, leather loafers. Wear it to work, to dinner, or anywhere you want to look polished without trying.',
    casual:     'Easy, lived-in pieces that feel like a Sunday morning. Worn jeans, soft knits, white sneakers. Perfect for everyday errands, brunch, and long walks.',
    streetwear: 'Bold, urban, and unapologetically loud. Oversized hoodies, cargo pants, statement sneakers. Made for the city, weekends out, and concerts.',
    minimalist: 'Less, but better. Neutral tones, clean lines, and quality fabrics. The uniform of people who let the cut do the talking — work, travel, and everywhere in between.',
    elegant:    'Refined and feminine, with a soft evening quality. Silk slips, satin heels, a single pearl. Wear it to galleries, dinners, and slow evenings.',
    korean:     'Soft, modern, and effortlessly cool. Pleated skirts, cropped knits, white sneakers. Made for cafés, photo dates, and study sessions.',
    y2k:        'Glossy, playful, and unapologetically nostalgic. Low-rise jeans, baby tees, butterfly clips. Made for parties, weekend nights, and feeling young.',
    vintage:    'Borrowed from another decade — 70s flares, prairie blouses, suede boots. Wear it to flea markets, brunches, and slow city wanderings.',
    softgirl:   'Sweet, romantic, and pastel-soft. Lace tops, mini skirts, ribbon hair clips. Perfect for picnics, first dates, and spring afternoons.',
    hijabicore: 'Modest fashion as quiet luxury. Long-line coats, layered satin hijabs, oversized blazers, and intentional draping. Editorial, composed, and unmistakably modern — for the everyday and everywhere.'
  };

  const BREAKDOWNS = {
    classic: {
      top: 'A crisp button-up or fitted knit in a neutral tone — the foundation of every polished look.',
      bottom: 'High-waisted tailored trousers cut straight through the leg. The cleanest silhouette there is.',
      shoes: 'Leather loafers or pointed flats. Quiet, well-made, and they get better with age.',
      accessories: 'A leather tote, gold studs, and a structured belt. One detail at a time, never more.'
    },
    casual: {
      top: 'An oversized cotton tee or soft knit sweater. Comfort first, but cut well so it still looks intentional.',
      bottom: 'Worn-in straight-leg jeans in a mid-blue wash. The pair you reach for without thinking.',
      shoes: 'Clean white sneakers — the most versatile shoe in any wardrobe.',
      accessories: 'A canvas tote, a baseball cap, and a simple silver chain.'
    },
    streetwear: {
      top: 'An oversized graphic hoodie or boxy tee. Bold, branded, and built for layering.',
      bottom: 'Loose cargo pants or baggy jeans with utility detailing.',
      shoes: 'Chunky sneakers in a statement colorway — the centerpiece of every fit.',
      accessories: 'A crossbody bag, a beanie, and silver chunky jewelry.'
    },
    minimalist: {
      top: 'A fine merino crewneck or silk shell in cream, ash, or black. Nothing extra.',
      bottom: 'Wide-leg trousers in heavy wool or clean denim. Architectural, not fussy.',
      shoes: 'Leather mules or sleek loafers. Monochrome, low contrast, refined.',
      accessories: 'A single structured bag and minimal gold jewelry — one statement, never more.'
    },
    elegant: {
      top: 'A silk camisole or fluid satin blouse. Soft on the body, catches the light.',
      bottom: 'A midi slip skirt or tailored cigarette pant in a deep tone.',
      shoes: 'Slingback heels or satin mules. Feminine and just elevated enough.',
      accessories: 'A pearl drop, a small leather clutch, and a soft floral perfume.'
    },
    korean: {
      top: 'A cropped cardigan over a fitted white tee. Layered, soft, and a little playful.',
      bottom: 'A pleated mini skirt or wide tailored trousers in a neutral tone.',
      shoes: 'White sneakers or chunky Mary Janes — clean, modern, and very K-fashion.',
      accessories: 'A small shoulder bag, a hair clip, and dewy minimal makeup.'
    },
    y2k: {
      top: 'A baby tee, mesh top, or fitted cami with low-rise everything.',
      bottom: 'Low-rise flared jeans or a denim mini — the lower the rise the better.',
      shoes: 'Pointed kitten heels or chunky platform sneakers.',
      accessories: 'Butterfly clips, tinted sunglasses, and a tiny shoulder bag.'
    },
    vintage: {
      top: 'A prairie blouse, ribbed turtleneck, or 70s knit in cream or rust.',
      bottom: 'High-waisted flared jeans or a corduroy midi skirt.',
      shoes: 'Suede boots, square-toe loafers, or knee-high leather boots.',
      accessories: 'A leather satchel, large gold hoops, and a wide-brim hat.'
    },
    softgirl: {
      top: 'A lace cami, ribbon-trimmed blouse, or cropped cardigan in pastel pink.',
      bottom: 'A pleated mini skirt or floral midi — soft fabrics, gentle silhouettes.',
      shoes: 'Ballet flats with ribbon ties or low-heel mary janes.',
      accessories: 'Pearl hair clips, a heart pendant, and a small quilted bag.'
    },
    hijabicore: {
      top: 'An oversized knit, fluid silk blouse, or long-line blazer — generous coverage, intentional drape.',
      bottom: 'A satin midi skirt, fluid wide-leg trousers, or a tailored maxi. Movement without bulk.',
      shoes: 'Pointed flats, leather loafers, or sleek ankle boots — quiet, well-made, and never loud.',
      accessories: 'A satin or chiffon hijab in a warm neutral, a structured leather tote, and gold layered chains.'
    }
  };

  const desc = DESCRIPTIONS[s.id] || s.short;
  const breakdown = BREAKDOWNS[s.id] || BREAKDOWNS.classic;

  const STYLE_THEME = {
    classic:    { acc: '#b08050', bg: '#f8f4ed', brd: '#e8ddc8', text: '#2a1f0f' },
    casual:     { acc: '#5a9e8a', bg: '#f0f7f4', brd: '#c0d8d0', text: '#0e2a20' },
    streetwear: { acc: '#1a1a1a', bg: '#f2f2f2', brd: '#d0d0d0', text: '#0a0a0a' },
    minimalist: { acc: '#8c8880', bg: '#f5f5f2', brd: '#dddbd5', text: '#1a1a18' },
    elegant:    { acc: '#8a6050', bg: '#f7f2ee', brd: '#e0d0c4', text: '#1a0e08' },
    korean:     { acc: '#d88aaa', bg: '#fdf5f8', brd: '#f0d0dc', text: '#2a0a14' },
    y2k:        { acc: '#9050d0', bg: '#f8f0ff', brd: '#d8c0f0', text: '#1a0a28' },
    vintage:    { acc: '#9a6430', bg: '#f8f0e4', brd: '#e0ccaa', text: '#2a1500' },
    softgirl:   { acc: '#e060a0', bg: '#fff0f8', brd: '#f8c8e0', text: '#2a0018' },
    hijabicore: { acc: '#8a6048', bg: '#faf5ed', brd: '#e0d0c0', text: '#2a1f0f' }
  };
  const theme = STYLE_THEME[s.id] || STYLE_THEME.classic;

  // ---------- Curated outfits (accurate links) ----------
  const CURATED_COMBOS = {

    // CLASSIC — heroIdx:0=white mini dress+black knit+black Kelly bag · heroIdx:3=black halter+ivory wide-leg trousers · heroIdx:6=cream blazer+black bustier
    classic: [
      { name: 'The Everyday', tier: 'aff', tag: 'Monochrome · white mini dress', heroIdx: 0, pieces: [
        { category: 'Dress',     name: 'White Sleeveless Fitted Mini Dress',          store: 'Zara',            price: '$49', q: 'white sleeveless fitted mini dress women structured' },
        { category: 'Layer',     name: 'Black Fine Knit Draped Over Shoulders',       store: 'H&M',             price: '$29', q: 'black fine knit cardigan women classic draped shoulders' },
        { category: 'Bag',       name: 'Black Structured Kelly Top-Handle Bag',       store: 'ASOS',            price: '$55', q: 'black structured kelly top handle bag women classic gold hardware' },
        { category: 'Shoes',     name: 'Black Pointed-Toe Ballet Flats',              store: 'Charles & Keith', price: '$49', q: 'black pointed toe ballet flat shoes women' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                    store: 'ASOS',            price: '$18', q: 'black cat eye sunglasses women classic retro' },
        { category: 'Jewelry',   name: 'Gold Drop Earrings',                          store: 'H&M',             price: '$15', q: 'gold drop earrings women classic minimal' },
        { category: 'Jewelry',   name: 'Gold Cuff Bracelet',                          store: 'H&M',             price: '$18', q: 'gold cuff bracelet women classic' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Power dressing · halter and trousers', heroIdx: 3, pieces: [
        { category: 'Top',       name: 'Black Deep-V Halter Bodysuit',                store: 'SHEIN',           price: '$22', q: 'black deep v halter neck bodysuit women sleek' },
        { category: 'Bottom',    name: 'Ivory High-Waist Wide-Leg Pleated Trousers',  store: 'Zara',            price: '$69', q: 'ivory high waist wide leg pleated trousers women tailored' },
        { category: 'Belt',      name: 'Black Double-Ring Leather Belt',              store: 'ASOS',            price: '$25', q: 'black double ring leather belt women' },
        { category: 'Bag',       name: 'Black Structured Top-Handle Bag',             store: 'Zara',            price: '$89', q: 'black structured top handle bag women classic' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                    store: 'ASOS',            price: '$22', q: 'black cat eye narrow sunglasses women chic' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                    store: 'H&M',             price: '$12', q: 'small gold hoop earrings women minimal' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Parisian edit · blazer and bustier', heroIdx: 6, pieces: [
        { category: 'Blazer',    name: 'Cream Oversized Blazer',                      store: 'Massimo Dutti',   price: '$245', q: 'cream oversized blazer women structured tailored' },
        { category: 'Top',       name: 'Black Strapless Bustier Top',                 store: 'Reformation',     price: '$138', q: 'black strapless bustier top women structured' },
        { category: 'Bottom',    name: 'Cream High-Waist Wide-Leg Trousers',          store: 'COS',             price: '$165', q: 'cream high waist wide leg trousers women tailored' },
        { category: 'Belt',      name: 'Black Gold-Buckle Leather Belt',              store: 'Zara',            price: '$35',  q: 'black leather gold buckle belt women classic' },
        { category: 'Bag',       name: 'Dark Quilted Chain Shoulder Bag',             store: 'ASOS',            price: '$75',  q: 'dark quilted chain shoulder bag women evening' }
      ]}
    ],

    // CASUAL — heroIdx:0=black crop tee+dark ribbed trousers+GG bag · heroIdx:3=stone puffer bomber+white ribbed crop+sweatpants+Adidas Samba · heroIdx:6=dark denim jacket
    casual: [
      { name: 'The Everyday', tier: 'aff', tag: 'Dark neutral · fitted tee and trousers', heroIdx: 0, pieces: [
        { category: 'Top',       name: 'Black Fitted Crew-Neck Crop Tee',             store: 'H&M',             price: '$15', q: 'black fitted crew neck crop t-shirt women basic' },
        { category: 'Bottom',    name: 'Dark Charcoal Ribbed Straight-Leg Trousers',  store: 'Zara',            price: '$45', q: 'dark charcoal ribbed straight leg trousers women' },
        { category: 'Belt',      name: 'Brown Patent Leather Wide Buckle Belt',       store: 'H&M',             price: '$20', q: 'brown patent leather wide buckle belt women' },
        { category: 'Bag',       name: 'GG Monogram Canvas Hobo Shoulder Bag',        store: 'SHEIN',           price: '$28', q: 'gg monogram canvas hobo shoulder bag women' },
        { category: 'Jewelry',   name: 'Gold Hoop Earrings',                          store: 'H&M',             price: '$12', q: 'gold hoop earrings women medium casual' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings and Bangles',             store: 'H&M',             price: '$15', q: 'gold stacking rings bangles set women' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Off-duty · puffer bomber and sweats', heroIdx: 3, pieces: [
        { category: 'Jacket',    name: 'Stone Beige Oversized Puffer Bomber Jacket',  store: 'H&M',       price: '$65',  q: 'stone beige oversized puffer bomber jacket women casual' },
        { category: 'Top',       name: 'White Fitted Ribbed Crop Top',                store: 'Uniqlo',          price: '$20',  q: 'white fitted ribbed crop tank top women' },
        { category: 'Bottom',    name: 'Light/White Wide-Leg Sweatpants',             store: 'H&M',             price: '$39',  q: 'light grey white wide leg sweatpants women comfortable' },
        { category: 'Shoes',     name: 'Adidas Samba Sneakers',                       store: 'Adidas',          price: '$100', q: 'samba og sneakers white women adidas' },
        { category: 'Accessory', name: 'Cream Embroidered Baseball Cap',              store: 'H&M',             price: '$19',  q: 'embroidered slogan baseball cap women cream beige tala' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Denim on denim · NYC street', heroIdx: 6, pieces: [
        { category: 'Jacket',    name: 'Dark Wash Oversized Denim Jacket',            store: 'Levis',           price: '$128', q: 'dark wash oversized denim trucker jacket women levis' },
        { category: 'Top',       name: 'White Fitted Ribbed Crop Tank',               store: 'H&M',             price: '$18',  q: 'white fitted ribbed crop tank top women' },
        { category: 'Bottom',    name: 'Dark Navy Baggy Wide-Leg Jeans',              store: 'Levis',           price: '$98',  q: 'dark navy baggy wide leg jeans women low rise' },
        { category: 'Bag',       name: 'Cream Mini Shoulder Bag',                     store: 'Charles & Keith', price: '$59',  q: 'cream mini shoulder bag women casual small' },
        { category: 'Jewelry',   name: 'Gold Coin Pendant Necklace',                  store: 'Mejuri',          price: '$95',  q: 'gold coin pendant necklace women delicate' }
      ]}
    ],

    // STREETWEAR — heroIdx:0=khaki trench+shirt+tie+dark grey maxi skirt+baker boy cap+platform loafers · heroIdx:3=brown leather bomber+green plaid scarf+grey baggy jeans+UGG mules · heroIdx:6=striped jacket
    streetwear: [
      { name: 'The Everyday', tier: 'aff', tag: 'Eclectic · trench and maxi skirt', heroIdx: 0, pieces: [
        { category: 'Coat',      name: 'Khaki Oversized Trench Coat',                 store: 'Zara',             price: '$89', q: 'khaki oversized trench coat women street style' },
        { category: 'Top',       name: 'White Oversized Dress Shirt',                 store: 'H&M',              price: '$25', q: 'white oversized dress shirt button down women' },
        { category: 'Accessory', name: 'Patterned Necktie',                           store: 'SHEIN',            price: '$10', q: 'patterned tie streetwear accessory women unisex' },
        { category: 'Bottom',    name: 'Dark Grey Wide-Leg Maxi Skirt',               store: 'ASOS',             price: '$55', q: 'dark grey wide leg maxi skirt women button front' },
        { category: 'Belt',      name: 'Black Wide Leather Belt',                     store: 'H&M',              price: '$25', q: 'black wide leather belt women streetwear' },
        { category: 'Shoes',     name: 'Dark Brown Leather Platform Loafers',         store: 'ASOS',             price: '$65', q: 'dark brown leather platform loafers shoes women streetwear' },
        { category: 'Hat',       name: 'Dark Brown Baker Boy Newsboy Cap',            store: 'ASOS',             price: '$30', q: 'dark brown wool baker boy newsboy cap women streetwear' },
        { category: 'Accessory', name: 'Amber Tinted Rectangular Sunglasses',         store: 'SHEIN',            price: '$12', q: 'amber tinted rectangular sunglasses women streetwear' },
        { category: 'Bag',       name: 'Dark Brown Leather Crossbody Bag',            store: 'SHEIN',            price: '$28', q: 'dark brown leather crossbody bag women streetwear' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Cozy street · leather bomber and plaid scarf', heroIdx: 3, pieces: [
        { category: 'Jacket',    name: 'Dark Brown Oversized Faux Leather Bomber',    store: 'SHEIN',            price: '$55', q: 'brown oversized faux leather bomber jacket women' },
        { category: 'Scarf',     name: 'Chunky Green Plaid Oversized Scarf',          store: 'H&M',              price: '$35', q: 'chunky plaid tartan oversized scarf women green' },
        { category: 'Bottom',    name: 'Light Grey/Sage Baggy Wide-Leg Jeans',        store: 'Urban Outfitters', price: '$79', q: 'light grey sage baggy wide leg jeans women low rise' },
        { category: 'Shoes',     name: 'Camel UGG-Style Platform Mule Slippers',      store: 'ASOS',             price: '$49', q: 'camel suede platform mule slippers women ugg style' },
        { category: 'Bag',       name: 'Neon Yellow-Green Mini Crossbody Bag',        store: 'SHEIN',            price: '$18', q: 'neon lime yellow green mini crossbody bag women streetwear' },
        { category: 'Jewelry',   name: 'Gold Cross Pendant Necklace',                 store: 'H&M',              price: '$15', q: 'gold cross pendant necklace women streetwear' },
        { category: 'Jewelry',   name: 'Silver Hoop Earrings',                        store: 'H&M',              price: '$12', q: 'silver hoop earrings women streetwear medium' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Urban layering · stripes and cargos', heroIdx: 6, pieces: [
        { category: 'Jacket',    name: 'Green Striped Cropped Overshirt',             store: 'Urban Outfitters', price: '$68',  q: 'green stripe cropped overshirt jacket women streetwear' },
        { category: 'Top',       name: 'White Fitted Long-Sleeve Tee',               store: 'Uniqlo',           price: '$30',  q: 'white fitted long sleeve heattech tee women' },
        { category: 'Scarf',     name: 'Printed Square Bandana Scarf',               store: 'SHEIN',            price: '$12',  q: 'printed silk square bandana neckerchief women' },
        { category: 'Bottom',    name: 'Army Green Low-Rise Baggy Jeans',            store: 'SHEIN',            price: '$42',  q: 'army green low rise baggy wide leg jeans women streetwear' },
        { category: 'Shoes',     name: 'Air Jordan 1 Low Sneakers',                  store: 'Nike',             price: '$110', q: 'air jordan 1 low sneakers women' }
      ]}
    ],

    // MINIMALIST — heroIdx:0=chocolate turtleneck+plaid wrap skirt+brown knee boots · heroIdx:3=black mock-neck+black satin asymmetric midi skirt+sculptural belt · heroIdx:6=total black column
    minimalist: [
      { name: 'The Everyday', tier: 'aff', tag: 'Autumnal · tonal chocolate brown', heroIdx: 0, pieces: [
        { category: 'Top',       name: 'Chocolate Brown Oversized Turtleneck Sweater', store: 'H&M',             price: '$35', q: 'chocolate brown oversized turtleneck sweater women' },
        { category: 'Bottom',    name: 'Plaid Check Wrap Midi Skirt with Slit',        store: 'Zara',            price: '$55', q: 'plaid check wrap midi skirt slit women autumn' },
        { category: 'Belt',      name: 'Brown Wide Leather Belt',                      store: 'H&M',             price: '$28', q: 'brown wide leather belt women minimal' },
        { category: 'Shoes',     name: 'Brown Pointed Knee-High Boots',                store: 'Charles & Keith', price: '$99', q: 'brown pointed toe knee high boots women' },
        { category: 'Bag',       name: 'Large Grey/Brown Structured Tote',             store: 'H&M',             price: '$45', q: 'large neutral structured tote bag women minimalist' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'All black · sleek city dressing', heroIdx: 3, pieces: [
        { category: 'Top',       name: 'Black Fitted Sleeveless Mock-Neck Top',        store: 'SHEIN',           price: '$20',  q: 'black fitted sleeveless mock neck top women minimal' },
        { category: 'Bottom',    name: 'Black Satin Gathered Asymmetric Midi Skirt',   store: 'Zara',            price: '$69',  q: 'black satin gathered asymmetric midi skirt women minimal' },
        { category: 'Belt',      name: 'Sculptural Wavy-Edge Black Leather Belt',      store: 'COS',             price: '$89',  q: 'sculptural black leather belt women architectural wavy' },
        { category: 'Bag',       name: 'Black Structured Patent Top-Handle Tote',      store: 'ASOS',            price: '$75',  q: 'black structured top handle tote bag women minimal' },
        { category: 'Jewelry',   name: 'Gold Thick Hoop Earrings',                     store: 'Mejuri',          price: '$95',  q: 'gold thick hoop earrings women medium minimal' },
        { category: 'Jewelry',   name: 'Gold Cuff Bracelet',                           store: 'H&M',             price: '$18',  q: 'gold cuff bracelet women minimal statement' },
        { category: 'Jewelry',   name: 'Gold Ring',                                    store: 'H&M',             price: '$12',  q: 'gold ring women minimal' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Column dressing · total black evening', heroIdx: 6, pieces: [
        { category: 'Top',       name: 'Black Ribbed Long-Sleeve Turtleneck',          store: 'COS',             price: '$115', q: 'black ribbed long sleeve turtleneck women minimal' },
        { category: 'Bottom',    name: 'Black Midi Flared A-Line Skirt',               store: 'Zara',            price: '$79',  q: 'black midi flared a-line skirt women elegant' },
        { category: 'Belt',      name: 'Thin Black Leather Belt',                      store: 'H&M',             price: '$19',  q: 'thin black leather belt women minimal' },
        { category: 'Shoes',     name: 'Black Pointed Ankle Boots',                    store: 'ASOS',            price: '$89',  q: 'black pointed toe ankle boots women heeled' },
        { category: 'Bag',       name: 'Black Quilted Chain Shoulder Bag',             store: 'ASOS',            price: '$75',  q: 'black quilted chain shoulder bag women evening' }
      ]}
    ],

    // ELEGANT — heroIdx:0=dark brown sheer lace bodysuit+chocolate satin mini+gold cuffs · heroIdx:3=white oversized blazer worn as dress+black knee-high boots · heroIdx:6=black blazer coat+lace trousers
    elegant: [
      { name: 'The Everyday', tier: 'aff', tag: 'Lace and satin · evening glam', heroIdx: 0, pieces: [
        { category: 'Top',       name: 'Dark Brown Sheer Floral Lace Fitted Bodysuit', store: 'SHEIN',           price: '$25', q: 'dark brown sheer floral lace long sleeve fitted bodysuit women' },
        { category: 'Bottom',    name: 'Chocolate Satin Gathered Mini Skirt',          store: 'ASOS',            price: '$45', q: 'chocolate brown satin gathered ruched mini skirt women' },
        { category: 'Jewelry',   name: 'Gold Wide Cuff Bracelets (Both Wrists)',       store: 'ASOS',            price: '$29', q: 'gold wide cuff bracelet women statement both wrists' },
        { category: 'Jewelry',   name: 'Gold Chunky Hoop Earrings',                    store: 'H&M',             price: '$15', q: 'gold chunky hoop earrings women medium elegant' },
        { category: 'Shoes',     name: 'Brown Pointed-Toe Slingback Heels',            store: 'SHEIN',           price: '$35', q: 'brown pointed toe slingback heel pumps women elegant' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Power white · blazer as dress', heroIdx: 3, pieces: [
        { category: 'Blazer',    name: 'White Oversized Structured Blazer (Worn as Dress)', store: 'Zara',       price: '$89',  q: 'white oversized boyfriend blazer women long elegant worn as dress' },
        { category: 'Shoes',     name: 'Black Knee-High Stiletto Leather Boots',       store: 'ASOS',            price: '$95',  q: 'black knee high stiletto heeled leather boots women' },
        { category: 'Bag',       name: 'Black Clean Structured Shoulder Bag',          store: 'Zara',            price: '$79',  q: 'black clean structured shoulder bag women elegant minimal' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                     store: 'H&M',             price: '$12',  q: 'small gold hoop earrings women delicate' },
        { category: 'Accessory', name: 'Luxury Compact Powder Mirror',                 store: 'Sephora',         price: '$38',  q: 'luxury compact powder mirror women' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Lace and blazer · Paris evening', heroIdx: 6, pieces: [
        { category: 'Jacket',    name: 'Black Deep-V Long Blazer Coat',               store: 'Zara',            price: '$129', q: 'black deep v long blazer coat women sleek evening' },
        { category: 'Bottom',    name: 'Black Sheer Lace Wide-Leg Trousers',          store: 'SHEIN',           price: '$38',  q: 'black sheer lace wide leg trousers women elegant evening' },
        { category: 'Shoes',     name: 'Black Pointed-Toe Heeled Mules',              store: 'ASOS',            price: '$79',  q: 'black pointed toe heeled mule shoes women elegant' },
        { category: 'Jewelry',   name: 'Crystal Chandelier Drop Earrings',            store: 'ASOS',            price: '$35',  q: 'crystal chandelier drop earrings women long statement' },
        { category: 'Jewelry',   name: 'Layered Gold Chain Necklace',                 store: 'Mejuri',          price: '$145', q: 'layered gold chain necklace women delicate' }
      ]}
    ],

    // KOREAN — heroIdx:0=white zip cap-sleeve top+brown plaid mini+dark brown knee-high buckle boots · heroIdx:3=cream ruched corset+sparkly plaid micro mini+cream duster+fedora · heroIdx:6=pink shirt
    korean: [
      { name: 'The Everyday', tier: 'aff', tag: 'Plaid and boots · Korean street', heroIdx: 0, pieces: [
        { category: 'Top',       name: 'White Zip-Up Cap-Sleeve Structured Top',      store: 'ASOS',            price: '$28', q: 'white zip up cap sleeve cropped structured top women korean fashion' },
        { category: 'Bottom',    name: 'Brown Plaid Pleated Mini Skirt',              store: 'SHEIN',           price: '$22', q: 'brown plaid tartan check pleated mini skirt women korean fashion' },
        { category: 'Shoes',     name: 'Dark Brown Knee-High Buckle-Strap Heeled Boots', store: 'Charles & Keith', price: '$99', q: 'dark brown knee high buckle strap heeled boots women korean fashion' },
        { category: 'Bag',       name: 'Tan/Caramel Leather Shoulder Bag',           store: 'Charles & Keith', price: '$79', q: 'tan caramel leather shoulder bag women korean fashion' },
        { category: 'Jewelry',   name: 'Silver Hoop Earrings',                        store: 'H&M',             price: '$12', q: 'silver hoop earrings women korean fashion medium' },
        { category: 'Jewelry',   name: 'Beaded Bracelet',                             store: 'H&M',             price: '$10', q: 'beaded bracelet women korean fashion cute' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Café editorial · corset and sparkly plaid mini', heroIdx: 3, pieces: [
        { category: 'Top',       name: 'Cream Ruched Corset Top with Ruffled Puff Sleeves', store: 'SHEIN',     price: '$28',  q: 'cream ruched corset ruffled puff sleeve crop top women korean fashion' },
        { category: 'Bottom',    name: 'Silver/Grey Sparkly Plaid Micro Mini Skirt',  store: 'SHEIN',           price: '$28',  q: 'sparkly metallic plaid micro mini skirt women korean fashion' },
        { category: 'Layer',     name: 'Cream Long Oversized Sheer Duster Cardigan',  store: 'Zara',            price: '$79',  q: 'cream long oversized sheer duster cardigan women korean fashion' },
        { category: 'Hat',       name: 'White Wide-Brim Fedora',                      store: 'H&M',             price: '$25',  q: 'white wide brim fedora sun hat women summer korean' },
        { category: 'Shoes',     name: 'White Pointed Mule Heels',                    store: 'Charles & Keith', price: '$75',  q: 'white pointed mule heels women minimal korean' },
        { category: 'Bag',       name: 'Dark Brown Suede Large Tote',                 store: 'ASOS',            price: '$69',  q: 'dark brown suede large tote bag women korean fashion' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                    store: 'ASOS',            price: '$18',  q: 'black cat eye sunglasses women korean fashion' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Gallery date · pink shirt and trousers', heroIdx: 6, pieces: [
        { category: 'Top',       name: 'Pink Oxford Cotton Shirt',                    store: 'Uniqlo',          price: '$49',  q: 'pink oxford cotton button down shirt women korean preppy' },
        { category: 'Bottom',    name: 'Beige High-Waist Wide-Leg Trousers',          store: 'COS',             price: '$155', q: 'beige high waist wide leg tailored trousers women' },
        { category: 'Bag',       name: 'Small Black Chain Strap Shoulder Bag',        store: 'ASOS',            price: '$55',  q: 'small black chain strap shoulder bag women korean fashion' },
        { category: 'Shoes',     name: 'Beige Open-Toe Slide Sandals',                store: 'Charles & Keith', price: '$59',  q: 'beige open toe slide sandals women minimal korean' },
        { category: 'Jewelry',   name: 'Small Silver Hoop Earrings',                  store: 'H&M',             price: '$12',  q: 'small silver hoop earrings women minimal korean' }
      ]}
    ],

    // Y2K — heroIdx:0=white baby tee+faux fur animal print mini+cream knee boots+brown baker boy cap+gold chains · heroIdx:3=sheer paisley kimono overshirt+grey washed wide jeans+light blue mini bag · heroIdx:6=pink graphic+silver sequin
    y2k: [
      { name: 'The Everyday', tier: 'aff', tag: 'Fur mini · 2000s night out', heroIdx: 0, pieces: [
        { category: 'Top',       name: 'White Fitted Baby Crop Tee',                  store: 'H&M',             price: '$18', q: 'white fitted baby tee women basic crop y2k' },
        { category: 'Bottom',    name: 'Faux Fur Animal Print Micro Mini Skirt',      store: 'SHEIN',           price: '$22', q: 'faux fur animal print micro mini skirt women y2k 2000s leopard' },
        { category: 'Shoes',     name: 'Cream/White Knee-High Pointed Boots',         store: 'SHEIN',           price: '$45', q: 'cream white knee high pointed heel boots women y2k' },
        { category: 'Hat',       name: 'Brown Tweed Baker Boy Newsboy Cap',           store: 'ASOS',            price: '$22', q: 'brown tweed baker boy newsboy cap women vintage y2k' },
        { category: 'Accessory', name: 'Brown Gradient Aviator Sunglasses',           store: 'SHEIN',           price: '$12', q: 'brown gradient aviator sunglasses women y2k 2000s large' },
        { category: 'Jewelry',   name: 'Gold Layered Chain Necklaces',                store: 'H&M',             price: '$18', q: 'gold layered chain necklace set women y2k 2000s' },
        { category: 'Jewelry',   name: 'Gold Bangle Bracelets',                       store: 'H&M',             price: '$15', q: 'gold bangle bracelet set women y2k 2000s stack' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Y2K boho · sheer kimono and wide-leg jeans', heroIdx: 3, pieces: [
        { category: 'Top',       name: 'Sheer Snake/Paisley Print Open Kimono Overshirt', store: 'SHEIN',       price: '$28', q: 'sheer snake paisley print open kimono overshirt women y2k boho' },
        { category: 'Bottom',    name: 'Grey Washed Distressed Wide-Leg Jeans',       store: 'SHEIN',           price: '$38', q: 'grey washed distressed wide leg jeans women y2k low rise' },
        { category: 'Bag',       name: 'Light Blue Structured Mini Top-Handle Bag',   store: 'SHEIN',           price: '$25', q: 'light blue structured mini top handle bag women y2k 2000s' },
        { category: 'Jewelry',   name: 'Gold/Amber Bead Bracelets',                   store: 'H&M',             price: '$15', q: 'gold amber bead bracelet set women y2k boho' },
        { category: 'Jewelry',   name: 'Layered Gold Chain Necklaces',                store: 'H&M',             price: '$18', q: 'layered gold chain necklace set women y2k 2000s' },
        { category: 'Accessory', name: 'Tinted Y2K Sunglasses',                       store: 'SHEIN',           price: '$12', q: 'tinted wrap around sunglasses women y2k 2000s' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Silver and pink · Y2K glam night', heroIdx: 6, pieces: [
        { category: 'Top',       name: 'Pink Fitted Graphic Long-Sleeve', store: 'SHEIN',           price: '$25',  q: 'pink fitted graphic print long sleeve crop top women y2k' },
        { category: 'Bottom',    name: 'Silver Sequin Flared Wide-Leg Pants', store: 'SHEIN',       price: '$45',  q: 'silver sequin flared wide leg pants women y2k glam party' },
        { category: 'Hat',       name: 'Crystal Rhinestone Beret',        store: 'SHEIN',           price: '$18',  q: 'crystal rhinestone beret hat women y2k glam party' },
        { category: 'Bag',       name: 'Silver Metallic Puffer Shoulder Bag', store: 'SHEIN',       price: '$28',  q: 'silver metallic puffer quilted chain shoulder bag women y2k' },
        { category: 'Shoes',     name: 'Silver Strappy Stiletto Heels',   store: 'ASOS',            price: '$65',  q: 'silver strappy stiletto heels women party y2k glam' }
      ]}
    ],

    // VINTAGE — heroIdx:0=white bouclé tweed co-ord+black tights+crystal pumps+white satin headband+crystal drop earrings · heroIdx:3=beige/stone trench+black lace dress+black lace tights+burgundy heels+gold belt · heroIdx:6=pink corset mini
    vintage: [
      { name: 'The Everyday', tier: 'aff', tag: '60s mod · white tweed co-ord', heroIdx: 0, pieces: [
        { category: 'Jacket',    name: 'White Bouclé Tweed Structured Jacket',        store: 'Zara',            price: '$79', q: 'white boucle tweed structured jacket women 60s vintage gold buttons' },
        { category: 'Bottom',    name: 'White Tweed Mini Skirt (Matching Co-ord)',    store: 'Zara',            price: '$55', q: 'white tweed mini skirt women matching co-ord vintage' },
        { category: 'Tights',    name: 'Black Opaque Tights 60 Denier',              store: 'H&M',             price: '$12', q: 'black opaque tights 60 denier women vintage' },
        { category: 'Shoes',     name: 'White Crystal-Embellished Ankle-Strap Pumps', store: 'ASOS',           price: '$65', q: 'white crystal embellished ankle strap pumps women vintage 60s' },
        { category: 'Accessory', name: 'White Wide Satin Headband',                   store: 'H&M',            price: '$12', q: 'white wide satin headband women 60s mod vintage' },
        { category: 'Jewelry',   name: 'Large Crystal Chandelier Drop Earrings',      store: 'ASOS',           price: '$35', q: 'large crystal chandelier drop earrings women vintage statement' },
        { category: 'Jewelry',   name: 'Rhinestone Crystal Bracelet',                 store: 'SHEIN',          price: '$12', q: 'rhinestone crystal bracelet women vintage glamour' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Paris café · trench coat and lace', heroIdx: 3, pieces: [
        { category: 'Coat',      name: 'Beige/Stone Long Open Trench Coat',           store: 'Zara',            price: '$129', q: 'beige stone long open trench coat women classic vintage' },
        { category: 'Dress',     name: 'Black Long-Sleeve Sheer Lace Mini Dress',     store: 'ASOS',            price: '$65',  q: 'black long sleeve sheer lace mini dress women vintage 60s' },
        { category: 'Tights',    name: 'Black Floral Lace-Pattern Tights',            store: 'SHEIN',           price: '$14',  q: 'black lace floral pattern tights women vintage elegant' },
        { category: 'Shoes',     name: 'Dark Burgundy Pointed Stiletto Heels',        store: 'ASOS',            price: '$75',  q: 'dark burgundy wine pointed stiletto heels women vintage' },
        { category: 'Belt',      name: 'YSL-Style Gold-Buckle Wide Leather Belt',     store: 'Zara',            price: '$35',  q: 'gold buckle wide leather belt women vintage ysl style' },
        { category: 'Accessory', name: 'Small Rectangular Vintage Sunglasses',        store: 'SHEIN',           price: '$10',  q: 'small rectangular vintage sunglasses women retro' },
        { category: 'Jewelry',   name: 'Gold Watch',                                  store: 'ASOS',            price: '$45',  q: 'gold watch women vintage classic' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings',                         store: 'H&M',             price: '$15',  q: 'gold stacking rings women vintage minimal' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Barbie Parisian · corset mini and scarf', heroIdx: 6, pieces: [
        { category: 'Dress',     name: 'Pink Corset-Boned Ruffle Mini Dress', store: 'SHEIN',      price: '$45',  q: 'pink corset boned ruffle hem mini dress women vintage glam' },
        { category: 'Accessory', name: 'Pink Silk Square Head Scarf',     store: 'SHEIN',           price: '$15',  q: 'pink silk square scarf hair wrap women vintage' },
        { category: 'Bag',       name: 'Monogram Print Mini Boston Bag',  store: 'SHEIN',           price: '$35',  q: 'monogram print mini boston speedy bag women vintage' },
        { category: 'Shoes',     name: 'Nude Pointed Kitten-Heel Pumps',  store: 'ASOS',            price: '$65',  q: 'nude pointed kitten heel pumps women classic' },
        { category: 'Accessory', name: 'Tiny Rectangular Sunglasses',     store: 'SHEIN',           price: '$10',  q: 'tiny rectangular narrow sunglasses women vintage retro' }
      ]}
    ],

    // SOFTGIRL — heroIdx:1=pink chunky knit+white tiered ribbon-trim maxi skirt+cream crescent bag · heroIdx:3=pink gingham square-neck midi dress+pink lily hair clip · heroIdx:6=denim overalls+cream chunky knit cardigan
    softgirl: [
      { name: 'The Everyday', tier: 'aff', tag: 'Soft pink · chunky knit and tiered skirt', heroIdx: 1, pieces: [
        { category: 'Top',       name: 'Pink Chunky Oversized Knit Sweater with Bow Cuff', store: 'H&M',       price: '$39', q: 'pink chunky oversized knit sweater women soft girl cozy bow cuff' },
        { category: 'Bottom',    name: 'White Tiered Ribbon-Trim Maxi Skirt',         store: 'SHEIN',           price: '$28', q: 'white tiered ribbon bow trim maxi skirt women soft girl' },
        { category: 'Bag',       name: 'Cream Crescent-Shape Structured Shoulder Bag', store: 'Charles & Keith', price: '$59', q: 'cream crescent shape structured shoulder bag women soft girl' },
        { category: 'Shoes',     name: 'Nude Strappy Flat Sandals',                   store: 'H&M',             price: '$25', q: 'nude strappy flat sandals women minimal soft girl' }
      ]},
      { name: 'The Elevated', tier: 'mid', tag: 'Picnic princess · gingham midi dress', heroIdx: 3, pieces: [
        { category: 'Dress',     name: 'Pink Gingham Square-Neck Full-Skirt Midi Dress', store: 'SHEIN',        price: '$45',  q: 'pink gingham check square neck full skirt midi dress women soft girl' },
        { category: 'Hair',      name: 'Pink Silk Lily Flower Hair Clip',             store: 'H&M',             price: '$12',  q: 'pink silk lily flower hair clip women soft girl romantic' },
        { category: 'Jewelry',   name: 'Pearl Drop Gold Earrings',                    store: 'Pandora',         price: '$65',  q: 'pearl drop earrings women gold soft girl romantic' },
        { category: 'Jewelry',   name: 'Pink Pendant Chain Necklace',                 store: 'H&M',             price: '$18',  q: 'pink pendant chain necklace women soft girl delicate' },
        { category: 'Shoes',     name: 'White Flat Shoes',                            store: 'H&M',             price: '$25',  q: 'white flat shoes women soft girl minimal' }
      ]},
      { name: 'The Statement', tier: 'lux', tag: 'Autumnal soft · overalls and cardigan', heroIdx: 6, pieces: [
        { category: 'Bottom',    name: 'Light Wash Denim Midi Overalls',  store: 'H&M',             price: '$59',  q: 'light wash denim midi overalls dungarees women soft girl' },
        { category: 'Top',       name: 'White Fitted Long-Sleeve Undershirt', store: 'Uniqlo',      price: '$30',  q: 'white fitted long sleeve heattech top women' },
        { category: 'Layer',     name: 'Cream Oversized Chunky Knit Cardigan', store: '& Other Stories', price: '$119', q: 'cream oversized chunky knit cardigan women autumn' },
        { category: 'Shoes',     name: 'Brown Suede Ankle Boots',         store: 'H&M',             price: '$79',  q: 'brown suede ankle boots women soft girl autumnal' },
        { category: 'Bag',       name: 'Small Cream Shoulder Bag',        store: 'Charles & Keith', price: '$65',  q: 'small cream leather shoulder bag women minimal' }
      ]}
    ],

    // HIJABI CORE — heroIdx:0=brown leather coat+pinstripe maxi · heroIdx:1=all-black tailored · heroIdx:2=gray knit+plaid scarf+pleated maxi
    // 2026-05-25: queries reworked — removed "modest" from mainstream retailers (Zara/COS/H&M/Uniqlo)
    // because they don't tag products that way and the keyword dropped results to zero. Modanisa
    // (the actual modest-fashion retailer) keeps simple descriptive queries that match its catalog.
    hijabicore: [
      { name: 'The Daily Layer', tier: 'aff', tag: 'Brown editorial · leather coat and pinstripe skirt', heroIdx: 0, pieces: [
        { category: 'Coat',      name: 'Brown Faux-Leather Oversized Belted Coat',     store: 'H&M',             price: '$79',  q: 'brown faux leather belted long coat women' },
        { category: 'Top',       name: 'Brown Ribbed Turtleneck Sweater',              store: 'Uniqlo',          price: '$39',  q: 'brown ribbed turtleneck sweater women' },
        { category: 'Skirt',     name: 'Brown Pinstripe Wool-Blend Maxi Skirt',        store: 'Zara',            price: '$59',  q: 'brown pinstripe wool maxi skirt women' },
        { category: 'Bag',       name: 'Brown Suede Structured Tote',                  store: 'COS',             price: '$245', q: 'brown suede leather tote bag women' },
        { category: 'Scarf',     name: 'Brown Satin Modal Hijab',                      store: 'Modanisa',        price: '$18',  q: 'brown satin hijab women' },
        { category: 'Accessory', name: 'Black Aviator Sunglasses',                     store: 'ASOS',            price: '$22',  q: 'black aviator sunglasses women' }
      ]},
      { name: 'The Tailored Edit', tier: 'mid', tag: 'All-black power · long coat and waistcoat', heroIdx: 1, pieces: [
        { category: 'Coat',      name: 'Black Long Oversized Wool Coat',               store: 'COS',             price: '$295', q: 'black long wool coat women oversized' },
        { category: 'Blazer',    name: 'Black Fitted Tailored Waistcoat',              store: 'Zara',            price: '$59',  q: 'black fitted tailored waistcoat women' },
        { category: 'Top',       name: 'Crisp White Oversized Button-Down Shirt',      store: 'Uniqlo',          price: '$45',  q: 'white oversized button down shirt women' },
        { category: 'Bottom',    name: 'Black Wide-Leg Tailored Trousers',             store: 'COS',             price: '$135', q: 'black wide leg tailored trousers women' },
        { category: 'Bag',       name: 'Brown Leather Mini Top-Handle Bag',            store: 'Charles & Keith', price: '$89',  q: 'brown leather mini top handle bag women' },
        { category: 'Scarf',     name: 'Black Premium Satin Hijab',                    store: 'Modanisa',        price: '$18',  q: 'black satin hijab women' }
      ]},
      { name: 'The Cozy Polish', tier: 'aff', tag: 'Gray layered · oversized knit and pleated maxi', heroIdx: 2, pieces: [
        { category: 'Top',       name: 'Gray Oversized Chunky Knit Sweater',           store: 'H&M',             price: '$45',  q: 'gray oversized chunky knit sweater women' },
        { category: 'Scarf',     name: 'Plaid Wool Oversized Blanket Scarf',           store: 'Zara',            price: '$45',  q: 'plaid wool oversized blanket scarf' },
        { category: 'Skirt',     name: 'Charcoal Pleated Maxi Skirt',                  store: 'COS',             price: '$135', q: 'charcoal pleated maxi skirt women' },
        { category: 'Shoes',     name: 'White Leather Sneakers',                       store: 'Adidas',          price: '$85',  q: 'stan smith white women' },
        { category: 'Bag',       name: 'Black Woven Shoulder Bag',                     store: 'Zara',            price: '$49',  q: 'black woven shoulder bag women' },
        { category: 'Scarf',     name: 'Dark Gray Premium Hijab',                      store: 'Modanisa',        price: '$15',  q: 'dark gray hijab women' }
      ]}
    ]
  };

  // Additional outfit combos — heroIdx:1 and heroIdx:4 added for every aesthetic
  const EXTRA_COMBOS = {
    classic: [
      { name: 'The Prep Edit', tier: 'aff', tag: 'Layered preppy · pinstripe shirt and navy vest', heroIdx: 1, pieces: [
        { category: 'Top',       name: 'Blue/White Pinstripe Oxford Button-Down Shirt', store: 'Uniqlo',         price: '$39', q: 'blue white pinstripe oxford button down shirt women classic preppy' },
        { category: 'Top',       name: 'Dark Navy Sleeveless Ribbed Knit Vest',         store: 'H&M',            price: '$25', q: 'dark navy sleeveless ribbed knit vest women classic layering' },
        { category: 'Bottom',    name: 'Dark Navy High-Waist Wide-Leg Jeans',           store: 'Zara',           price: '$59', q: 'dark navy high waist wide leg jeans women tailored classic' },
        { category: 'Belt',      name: 'Thin Brown Leather Belt with Gold Buckle',      store: 'H&M',            price: '$20', q: 'thin brown leather belt gold buckle women' },
        { category: 'Bag',       name: 'Tan Structured Leather Top-Handle Bag',         store: 'Charles & Keith', price: '$89', q: 'tan structured leather top handle bag women classic' }
      ]},
      { name: 'The Office Hour', tier: 'mid', tag: 'Winter polish · wool coat and turtleneck', heroIdx: 2, pieces: [
        { category: 'Coat',      name: 'Cream/Ivory Oversized Structured Wool Coat',    store: 'Zara',           price: '$119', q: 'cream ivory oversized wool structured coat women classic' },
        { category: 'Top',       name: 'Black Ribbed Turtleneck Sweater',               store: 'Uniqlo',         price: '$39',  q: 'black ribbed turtleneck sweater women classic' },
        { category: 'Tights',    name: 'Black Opaque Tights',                           store: 'H&M',            price: '$12',  q: 'black opaque tights women 60 denier' },
        { category: 'Bag',       name: 'Black Structured Quilted Top-Handle Bag',       store: 'Zara',           price: '$79',  q: 'black structured quilted top handle bag women gold hardware' },
        { category: 'Accessory', name: 'Black Leather Gloves',                          store: 'H&M',            price: '$29',  q: 'black leather gloves women classic lined' },
        { category: 'Shoes',     name: 'Black Pointed-Toe Ankle Boots',                 store: 'Charles & Keith', price: '$99', q: 'black pointed toe ankle boots women heeled classic' }
      ]},
      { name: 'The Weekend Edit', tier: 'mid', tag: 'Cream-on-cream · relaxed knit and satin midi', heroIdx: 4, pieces: [
        { category: 'Top',       name: 'Cream Relaxed Crewneck Knit Pullover',          store: 'H&M',            price: '$45', q: 'cream ivory relaxed crewneck knit pullover sweater women' },
        { category: 'Bottom',    name: 'Cream Satin Bias-Cut Long Midi Skirt',          store: 'Zara',           price: '$69', q: 'cream satin bias cut long midi skirt women elegant' },
        { category: 'Bag',       name: 'Black Quilted Chain Crossbody Bag',             store: 'ASOS',           price: '$55', q: 'black quilted chain crossbody bag women classic evening chanel style' },
        { category: 'Shoes',     name: 'White Pointed-Toe Pumps',                       store: 'Charles & Keith', price: '$79', q: 'white pointed toe pumps women classic' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                      store: 'ASOS',           price: '$18', q: 'black cat eye sunglasses women retro classic' },
        { category: 'Jewelry',   name: 'Gold Drop Earrings',                            store: 'H&M',            price: '$15', q: 'gold drop earrings women classic delicate' }
      ]},
      { name: 'The Timeless Evening', tier: 'mid', tag: 'Parisian café · trench and chunky knit', heroIdx: 5, pieces: [
        { category: 'Coat',      name: 'Beige Classic Belted Trench Coat',              store: 'Zara',           price: '$129', q: 'beige classic belted trench coat women' },
        { category: 'Top',       name: 'White Chunky Rib-Knit Sweater',                 store: 'H&M',            price: '$45',  q: 'white chunky rib knit sweater women classic' },
        { category: 'Bag',       name: 'Brown Structured Leather Satchel',              store: 'Charles & Keith', price: '$99', q: 'brown structured leather satchel bag women classic' },
        { category: 'Tights',    name: 'Black Opaque Tights',                           store: 'H&M',            price: '$12',  q: 'black opaque tights women 60 denier' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings',                           store: 'H&M',            price: '$18',  q: 'gold stacking rings set women classic minimal' },
        { category: 'Jewelry',   name: 'Gold Chain Bracelet',                           store: 'H&M',            price: '$20',  q: 'gold chain bracelet women classic delicate' }
      ]}
    ],
    casual: [
      { name: 'The Summer Casual', tier: 'aff', tag: 'Effortless · white cami and baggy jeans', heroIdx: 1, pieces: [
        { category: 'Top',       name: 'White Fitted Spaghetti-Strap Crop Cami',       store: 'H&M',            price: '$15', q: 'white fitted spaghetti strap crop cami women basic' },
        { category: 'Bottom',    name: 'Light Blue Wide-Leg Baggy Jeans',              store: 'Zara',           price: '$59', q: 'light blue wash wide leg baggy jeans women casual' },
        { category: 'Hat',       name: 'Navy Polo Embroidered Logo Baseball Cap',      store: 'ASOS',           price: '$35', q: 'navy polo embroidered logo baseball cap women casual' },
        { category: 'Bag',       name: 'Black Woven Quilted Bucket Tote Bag',          store: 'SHEIN',          price: '$28', q: 'black woven quilted bucket tote bag women casual' },
        { category: 'Jewelry',   name: 'Gold Cross Pendant Necklace',                  store: 'H&M',            price: '$15', q: 'gold cross pendant necklace women delicate casual' },
        { category: 'Jewelry',   name: 'Gold Watch',                                   store: 'ASOS',           price: '$45', q: 'gold watch women casual minimal' }
      ]},
      { name: 'The Smart Casual', tier: 'mid', tag: 'Polished casual · houndstooth blazer and wide-leg jeans', heroIdx: 2, pieces: [
        { category: 'Jacket',    name: 'Beige/Tan Houndstooth Cropped Blazer',         store: 'Zara',           price: '$79',  q: 'beige tan houndstooth cropped blazer women casual chic' },
        { category: 'Top',       name: 'White Ribbed Crop Cami',                       store: 'H&M',            price: '$15',  q: 'white ribbed crop cami top women basic' },
        { category: 'Bottom',    name: 'Dark Blue Wide-Leg Jeans',                     store: 'Zara',           price: '$59',  q: 'dark blue wide leg jeans women tailored casual' },
        { category: 'Shoes',     name: 'Nude Mesh Pointed-Toe Pumps/Mules',            store: 'Charles & Keith', price: '$75', q: 'nude mesh pointed toe pumps mules women elegant casual' },
        { category: 'Bag',       name: 'Cream Ivory Structured Box Shoulder Bag',      store: 'Charles & Keith', price: '$79', q: 'cream ivory structured box shoulder bag women casual chic' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                     store: 'ASOS',           price: '$18',  q: 'black cat eye sunglasses women classic casual' },
        { category: 'Jewelry',   name: 'Tiny Gold Pendant Necklace',                   store: 'H&M',            price: '$12',  q: 'tiny gold pendant necklace women delicate casual' }
      ]},
      { name: 'The Autumn Casual', tier: 'mid', tag: 'Cosy layers · shearling jacket and straight jeans', heroIdx: 4, pieces: [
        { category: 'Jacket',    name: 'Dark Chocolate Brown Shearling Aviator Jacket', store: 'ASOS',          price: '$89',  q: 'dark brown shearling aviator jacket women autumn casual' },
        { category: 'Top',       name: 'Cream Ivory Ribbed Turtleneck Sweater',         store: 'Uniqlo',        price: '$39',  q: 'cream ivory ribbed turtleneck sweater women casual' },
        { category: 'Bottom',    name: 'Medium-Wash Straight/Flared Jeans',             store: 'Levis',         price: '$98',  q: 'medium wash straight flared jeans women casual' },
        { category: 'Shoes',     name: 'Grey Pointed-Toe Ankle Booties',                store: 'Charles & Keith', price: '$89', q: 'grey pointed toe ankle booties women casual' },
        { category: 'Bag',       name: 'Brown Structured Leather Top-Handle Bag',       store: 'Charles & Keith', price: '$99', q: 'brown structured leather top handle bag women casual' }
      ]},
      { name: 'The Effortless Brunch', tier: 'mid', tag: 'Casually polished · ribbed knit top and satin trousers', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Black Ribbed Knit Short-Sleeve Top',            store: 'Zara',          price: '$29',  q: 'black ribbed knit short sleeve top women casual chic gold button' },
        { category: 'Bottom',    name: 'Cream/Ivory Satin Fluid Wide-Leg Trousers',     store: 'ASOS',          price: '$55',  q: 'cream ivory satin fluid wide leg trousers women elegant casual' },
        { category: 'Bag',       name: 'Black Patent Structured Top-Handle Bag',        store: 'Charles & Keith', price: '$89', q: 'black patent leather structured top handle bag women' },
        { category: 'Shoes',     name: 'Black Pointed-Toe Heeled Pumps',                store: 'Charles & Keith', price: '$79', q: 'black pointed toe heeled pumps women classic casual' },
        { category: 'Jewelry',   name: 'Gold Watch',                                    store: 'ASOS',          price: '$45',  q: 'gold watch women casual minimal' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                      store: 'ASOS',          price: '$18',  q: 'black cat eye sunglasses women classic casual' }
      ]}
    ],
    streetwear: [
      { name: 'The Grey Edit', tier: 'aff', tag: 'Tonal grey · plaid blazer and wide trousers', heroIdx: 1, pieces: [
        { category: 'Jacket',    name: 'Grey Windowpane Plaid Oversized Blazer',        store: 'SHEIN',         price: '$45', q: 'grey windowpane plaid oversized blazer women streetwear' },
        { category: 'Bottom',    name: 'Grey Textured Baggy Wide-Leg Trousers',         store: 'Zara',          price: '$59', q: 'grey textured baggy wide leg trousers women streetwear' },
        { category: 'Shoes',     name: 'Black Pointed-Toe Flat Shoes',                  store: 'ASOS',          price: '$45', q: 'black pointed toe flat shoes women sleek minimal' },
        { category: 'Bag',       name: 'Black Mini Quilted Crossbody Bag',              store: 'SHEIN',         price: '$18', q: 'black mini quilted crossbody bag women streetwear small' },
        { category: 'Hat',       name: 'Grey Wool Beret',                               store: 'ASOS',          price: '$22', q: 'grey wool beret hat women streetwear parisian' },
        { category: 'Jewelry',   name: 'Layered Gold Chain Necklace',                   store: 'H&M',           price: '$18', q: 'layered gold chain necklace women streetwear' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings',                           store: 'H&M',           price: '$12', q: 'gold stacking rings women minimal streetwear' }
      ]},
      { name: 'The Sneaker Focus', tier: 'aff', tag: 'Casual street · cropped sweatshirt and Converse', heroIdx: 2, pieces: [
        { category: 'Top',       name: 'Grey Oversized Cropped Sweatshirt',             store: 'H&M',           price: '$25', q: 'grey oversized cropped sweatshirt women streetwear casual' },
        { category: 'Hat',       name: 'Electric Blue Graphic Beanie',                  store: 'SHEIN',         price: '$12', q: 'electric blue graphic beanie hat women streetwear' },
        { category: 'Bottom',    name: 'Light Wash Baggy Wide-Leg Jeans',               store: 'SHEIN',         price: '$38', q: 'light wash baggy wide leg jeans women low rise streetwear' },
        { category: 'Shoes',     name: 'White Converse High-Top Canvas Sneakers',       store: 'ASOS',          price: '$75', q: 'white converse high top canvas sneakers women classic chuck taylor' },
        { category: 'Jewelry',   name: 'Silver Layered Chain Necklaces',                store: 'H&M',           price: '$15', q: 'silver layered chain necklace set women streetwear' }
      ]},
      { name: 'The Pinstripe Edit', tier: 'mid', tag: 'Relaxed weekend · open pinstripe shirt and distressed baggy jeans', heroIdx: 4, pieces: [
        { category: 'Top',       name: 'Blue/White Thin Pinstripe Open Shirt (Tied/Cropped)', store: 'H&M',    price: '$25', q: 'blue white thin pinstripe shirt women streetwear tied cropped open' },
        { category: 'Bottom',    name: 'Light Grey Distressed Baggy Wide-Leg Jeans',   store: 'SHEIN',         price: '$38', q: 'light grey distressed baggy wide leg jeans women streetwear low rise' },
        { category: 'Shoes',     name: 'Green Suede Platform Lace-Up Mule Shoes',      store: 'ASOS',          price: '$55', q: 'green suede platform lace up mule shoes women streetwear' },
        { category: 'Bag',       name: 'Black Mini Backpack',                           store: 'SHEIN',         price: '$28', q: 'black mini backpack women streetwear small' },
        { category: 'Accessory', name: 'Thin Square-Frame Clear Glasses',               store: 'SHEIN',         price: '$12', q: 'thin square frame clear glasses women streetwear fashion' },
        { category: 'Jewelry',   name: 'Silver Hoop Earrings',                          store: 'H&M',           price: '$12', q: 'silver hoop earrings women medium streetwear' }
      ]},
      { name: 'The Vintage Tee', tier: 'aff', tag: 'Classic street · vintage graphic crop tee and jeans', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Cream/Off-White Vintage Graphic Football Crop Tee', store: 'Urban Outfitters', price: '$38', q: 'cream off white vintage graphic football crop tee women streetwear' },
        { category: 'Bottom',    name: 'Light Blue Wash Relaxed Straight Jeans',       store: 'Levis',         price: '$98', q: 'light blue wash relaxed straight jeans women casual streetwear' },
        { category: 'Accessory', name: 'Small Black Cat-Eye Sunglasses',               store: 'SHEIN',         price: '$10', q: 'small black cat eye sunglasses women minimal retro' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                     store: 'H&M',           price: '$12', q: 'small gold hoop earrings women minimal streetwear' }
      ]}
    ],
    minimalist: [
      { name: 'The Camel Edit', tier: 'mid', tag: 'Tonal camel · ribbed turtleneck and oversized coat', heroIdx: 1, pieces: [
        { category: 'Top',       name: 'Camel/Oatmeal Ribbed Oversized Turtleneck',    store: 'H&M',           price: '$35', q: 'camel oatmeal ribbed oversized turtleneck sweater women minimalist' },
        { category: 'Coat',      name: 'Camel Oversized Wool Coat (Draped)',            store: 'Zara',          price: '$129', q: 'camel oversized wool coat women minimalist classic draped' },
        { category: 'Bottom',    name: 'Camel Wide-Leg Tailored Trousers',             store: 'COS',           price: '$145', q: 'camel wide leg tailored trousers women minimalist' },
        { category: 'Shoes',     name: 'White Adidas Samba Sneakers',                  store: 'Adidas',        price: '$100', q: 'samba og sneakers white women adidas' },
        { category: 'Bag',       name: 'Cream Triangle Slouchy Shoulder Bag',          store: 'Charles & Keith', price: '$65', q: 'cream triangle slouchy shoulder bag women minimalist' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                     store: 'H&M',           price: '$12', q: 'small gold hoop earrings women minimal' }
      ]},
      { name: 'The Quiet Work Day', tier: 'mid', tag: 'Office uniform · white poplin shirt and tailored trousers', heroIdx: 2, pieces: [
        { category: 'Top',       name: 'White Fitted Poplin Button-Down Shirt',        store: 'Uniqlo',        price: '$39',  q: 'white fitted poplin button down shirt women minimal classic' },
        { category: 'Bottom',    name: 'Black High-Waist Straight Tailored Trousers',  store: 'COS',           price: '$145', q: 'black high waist straight tailored trousers women minimal' },
        { category: 'Bag',       name: 'Large Black Structured Leather Tote',          store: 'Charles & Keith', price: '$99', q: 'large black structured leather tote bag women minimal work' },
        { category: 'Jewelry',   name: 'Silver Watch',                                 store: 'ASOS',          price: '$45',  q: 'silver watch women minimal classic' },
        { category: 'Jewelry',   name: 'Thin Gold Chain Necklace',                     store: 'Mejuri',        price: '$68',  q: 'thin gold chain necklace women minimal delicate' },
        { category: 'Jewelry',   name: 'Small Gold Ring',                              store: 'H&M',           price: '$12',  q: 'small gold ring women minimal' }
      ]},
      { name: 'The Relaxed Minimal', tier: 'aff', tag: 'Off-duty · white sweatshirt and wide-leg jeans', heroIdx: 4, pieces: [
        { category: 'Top',       name: 'White Relaxed Crewneck Sweatshirt',            store: 'H&M',           price: '$35', q: 'white relaxed crewneck sweatshirt women minimal clean' },
        { category: 'Bottom',    name: 'Dark/Medium Blue Wide-Leg Jeans',              store: 'Zara',          price: '$59', q: 'dark blue wide leg jeans women minimalist clean' },
        { category: 'Belt',      name: 'Thin Black Leather Belt',                      store: 'H&M',           price: '$18', q: 'thin black leather belt women minimal' },
        { category: 'Bag',       name: 'Large Black Woven Intrecciato-Style Tote',     store: 'SHEIN',         price: '$45', q: 'large black woven intrecciato tote bag women minimalist' },
        { category: 'Shoes',     name: 'Black Pointed-Toe Ankle Boots',                store: 'Charles & Keith', price: '$99', q: 'black pointed toe ankle boots women minimal heeled' },
        { category: 'Accessory', name: 'Small Black Rectangular Sunglasses',           store: 'SHEIN',         price: '$10', q: 'small black rectangular sunglasses women minimal' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                     store: 'H&M',           price: '$12', q: 'small gold hoop earrings women minimal' }
      ]},
      { name: 'The Weekend Market', tier: 'mid', tag: 'Monochrome layers · mock-neck bodysuit and stripe cardigan', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Black Long-Sleeve Mock-Neck Fitted Bodysuit',  store: 'SHEIN',         price: '$22',  q: 'black long sleeve mock neck fitted bodysuit women minimal' },
        { category: 'Bottom',    name: 'Black High-Waist Wide-Leg Trousers',           store: 'COS',           price: '$145', q: 'black high waist wide leg trousers women minimal' },
        { category: 'Layer',     name: 'Black/White Stripe Oversized Chunky Cardigan', store: 'Zara',          price: '$69',  q: 'black white horizontal stripe oversized chunky cardigan women minimal' },
        { category: 'Bag',       name: 'Black Structured Mini Top-Handle Bag',         store: 'ASOS',          price: '$65',  q: 'black structured top handle mini bag women minimal jacquemus style' },
        { category: 'Shoes',     name: 'White Chunky Platform Sneakers',               store: 'H&M',           price: '$39',  q: 'white chunky sole sneakers women minimal' },
        { category: 'Accessory', name: 'Small Black Rectangular Sunglasses',           store: 'SHEIN',         price: '$10',  q: 'small black rectangular sunglasses women minimal' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                     store: 'H&M',           price: '$12',  q: 'small gold hoop earrings women minimal' }
      ]}
    ],
    elegant: [
      { name: 'The Silk Edit', tier: 'mid', tag: 'Tonal satin · V-neck satin top and midi skirt', heroIdx: 1, pieces: [
        { category: 'Top',       name: 'Dark Brown V-Neck Satin Top with Lace Trim',   store: 'SHEIN',         price: '$28',  q: 'dark brown v neck satin top lace trim hem women elegant' },
        { category: 'Bottom',    name: 'Ivory/Cream Fitted Satin Midi Skirt',          store: 'Zara',          price: '$69',  q: 'ivory cream fitted satin midi skirt women elegant' },
        { category: 'Bag',       name: 'Cream Mini Kelly-Style Top-Handle Bag',        store: 'Charles & Keith', price: '$89', q: 'cream ivory mini kelly top handle bag women elegant gold hardware' },
        { category: 'Jewelry',   name: 'Pearl Strand Choker Necklace',                 store: 'H&M',           price: '$25',  q: 'pearl strand choker necklace women elegant classic' }
      ]},
      { name: 'The Day Date', tier: 'mid', tag: 'Bold editorial · burgundy leather trench and all-white', heroIdx: 2, pieces: [
        { category: 'Coat',      name: 'Burgundy/Wine Faux Leather Long Trench Coat',  store: 'ASOS',          price: '$89',  q: 'burgundy wine faux leather long trench coat women elegant' },
        { category: 'Top',       name: 'White Classic Button-Down Shirt',              store: 'Uniqlo',        price: '$39',  q: 'white classic button down shirt women elegant' },
        { category: 'Accessory', name: 'Polka Dot Silk Necktie',                       store: 'SHEIN',         price: '$12',  q: 'polka dot silk necktie women fashion accessory elegant' },
        { category: 'Shoes',     name: 'White Knee-High Stiletto Boots',               store: 'ASOS',          price: '$95',  q: 'white knee high stiletto heeled boots women elegant' },
        { category: 'Bag',       name: 'White Structured Mini Bag',                    store: 'Charles & Keith', price: '$79', q: 'white structured mini bag women elegant classic' },
        { category: 'Accessory', name: 'White Cat-Eye Sunglasses',                     store: 'ASOS',          price: '$22',  q: 'white cat eye sunglasses women elegant retro' },
        { category: 'Jewelry',   name: 'Gold and Pearl Drop Earrings',                 store: 'H&M',           price: '$20',  q: 'gold pearl drop earrings women elegant' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings',                          store: 'H&M',           price: '$18',  q: 'gold stacking rings women elegant' }
      ]},
      { name: 'The Co-ord Edit', tier: 'mid', tag: 'Matching set · cream ribbed sleeveless co-ord', heroIdx: 4, pieces: [
        { category: 'Top',       name: 'Cream Ribbed Sleeveless Mock-Neck Top',        store: 'SHEIN',         price: '$22',  q: 'cream ivory ribbed sleeveless mock neck top women elegant' },
        { category: 'Bottom',    name: 'Cream Ribbed Wide-Leg Trousers (Co-ord Match)', store: 'SHEIN',        price: '$28',  q: 'cream ivory ribbed wide leg trousers women co-ord elegant matching' },
        { category: 'Shoes',     name: 'Burgundy Pointed-Toe Gold-Buckle Loafer Heels', store: 'Charles & Keith', price: '$89', q: 'burgundy wine pointed toe heeled loafer shoes gold buckle women' },
        { category: 'Jewelry',   name: 'Gold Watch',                                   store: 'ASOS',          price: '$45',  q: 'gold watch women elegant minimal' },
        { category: 'Jewelry',   name: 'Gold Chain Bracelet',                          store: 'H&M',           price: '$20',  q: 'gold chain bracelet women elegant delicate' }
      ]},
      { name: 'The Gallery Opening', tier: 'lux', tag: 'Ballgown moment · white polka dot corset midi dress', heroIdx: 5, pieces: [
        { category: 'Dress',     name: 'White/Ivory Polka Dot Corset Boned Midi Ballgown', store: 'ASOS',      price: '$95',  q: 'white polka dot corset boned structured midi ballgown dress women elegant' },
        { category: 'Bag',       name: 'Black Heart-Shape Chain Mini Bag',             store: 'SHEIN',         price: '$22',  q: 'black heart shape chain mini bag women evening elegant' },
        { category: 'Jewelry',   name: 'Large Pearl Cluster Drop Earrings',            store: 'H&M',           price: '$25',  q: 'large pearl cluster drop earrings women statement elegant' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings',                          store: 'H&M',           price: '$18',  q: 'gold stacking rings women elegant evening' }
      ]}
    ],
    korean: [
      { name: 'The Cozy Edit', tier: 'mid', tag: 'Teddy coat · fluffy shearling and black cami', heroIdx: 1, pieces: [
        { category: 'Coat',      name: 'Cream Fluffy Shearling Teddy Oversized Coat',  store: 'SHEIN',         price: '$65', q: 'cream fluffy shearling teddy oversized coat women korean fashion' },
        { category: 'Top',       name: 'Black Sleeveless Cami Top',                    store: 'H&M',           price: '$15', q: 'black sleeveless cami top women basic minimal' },
        { category: 'Accessory', name: 'Hermès-Style Printed Silk Square Scarf (Head Wrap)', store: 'SHEIN',  price: '$12', q: 'printed silk square scarf head wrap women korean fashion hermes style' },
        { category: 'Hat',       name: 'Black Baseball Cap',                           store: 'H&M',           price: '$18', q: 'black baseball cap women korean fashion street style' }
      ]},
      { name: 'The Study Date', tier: 'aff', tag: 'Campus cute · navy cable-knit cardigan and pleated mini', heroIdx: 2, pieces: [
        { category: 'Top',       name: 'Navy Dark Blue Cable-Knit Cropped V-Neck Cardigan', store: 'H&M',     price: '$39', q: 'navy dark blue cable knit cropped v neck cardigan women korean fashion' },
        { category: 'Top',       name: 'White Ribbed Cami Tank (Underneath)',          store: 'H&M',           price: '$12', q: 'white ribbed cami tank top women basic layering' },
        { category: 'Bottom',    name: 'Cream/White Pleated Tennis Mini Skirt',        store: 'SHEIN',         price: '$22', q: 'cream white pleated tennis mini skirt women korean fashion' },
        { category: 'Shoes',     name: 'White Knee-High Heeled Boots',                 store: 'Charles & Keith', price: '$99', q: 'white knee high heeled boots women korean fashion' },
        { category: 'Bag',       name: 'Black Mini Top-Handle Bag',                    store: 'SHEIN',         price: '$18', q: 'black mini top handle bag women korean fashion small cute' }
      ]},
      { name: 'The Tweed Edit', tier: 'mid', tag: 'K-fashion chic · cream tweed jacket and denim mini', heroIdx: 4, pieces: [
        { category: 'Jacket',    name: 'Cream Tweed Cropped Jacket (Chanel-Style, Gold Buttons)', store: 'SHEIN', price: '$45', q: 'cream tweed cropped chanel style jacket women korean fashion gold buttons' },
        { category: 'Top',       name: 'White Ribbed Crop Cami',                       store: 'H&M',           price: '$15', q: 'white ribbed crop cami top women basic' },
        { category: 'Bottom',    name: 'Light Blue Denim Mini Skirt',                  store: 'Zara',          price: '$39', q: 'light blue denim mini skirt women korean fashion' },
        { category: 'Bag',       name: 'Black/White Quilted Chain Crossbody Bag',      store: 'ASOS',          price: '$45', q: 'black white quilted chain crossbody bag women korean fashion' },
        { category: 'Hat',       name: 'Navy Embroidered Baseball Cap',                store: 'H&M',           price: '$19', q: 'navy embroidered letter baseball cap women korean fashion' },
        { category: 'Accessory', name: 'Black Cat-Eye Sunglasses',                     store: 'ASOS',          price: '$18', q: 'black cat eye sunglasses women korean fashion' },
        { category: 'Jewelry',   name: 'Silver Chain Necklace and Hoop Earrings',      store: 'H&M',           price: '$15', q: 'silver chain necklace hoop earrings set women korean fashion' }
      ]},
      { name: 'The Night Market', tier: 'mid', tag: 'Lace co-ord · cream sheer blouse and matching mini', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Cream Sheer Floral Lace Button-Down Blouse',   store: 'SHEIN',         price: '$28', q: 'cream sheer floral lace button down blouse women korean fashion' },
        { category: 'Bottom',    name: 'Cream Lace/Brocade Mini Skirt (Matching Set)', store: 'SHEIN',         price: '$25', q: 'cream ivory lace brocade mini skirt women korean fashion matching set' },
        { category: 'Bag',       name: 'Cream Structured Angular Mini Bag',            store: 'Charles & Keith', price: '$65', q: 'cream structured angular mini bag women korean fashion' },
        { category: 'Jewelry',   name: 'Pearl Choker Necklace',                        store: 'H&M',           price: '$18', q: 'pearl choker necklace women korean fashion elegant' }
      ]}
    ],
    y2k: [
      { name: 'The Feather Moment', tier: 'mid', tag: 'Y2K glam · pink feather top and leopard mini', heroIdx: 1, pieces: [
        { category: 'Top',       name: 'Pink Fluffy Feathered Off-Shoulder Top',       store: 'SHEIN',         price: '$32', q: 'pink fluffy feather off shoulder marabou top women y2k 2000s' },
        { category: 'Bottom',    name: 'Leopard Print Mini Skirt',                     store: 'SHEIN',         price: '$22', q: 'leopard print mini skirt women y2k 2000s animal print' },
        { category: 'Belt',      name: 'Gold Buckle Mini Belt',                        store: 'H&M',           price: '$15', q: 'gold buckle mini belt women y2k 2000s' },
        { category: 'Shoes',     name: 'Pink Faux Fur Knee-High Leg-Warmer Boots',     store: 'SHEIN',         price: '$45', q: 'pink faux fur knee high leg warmer boots women y2k 2000s' },
        { category: 'Bag',       name: 'Pink Structured Shoulder/Crossbody Bag',       store: 'SHEIN',         price: '$28', q: 'pink structured mini shoulder bag women y2k 2000s' },
        { category: 'Hat',       name: 'Leopard Print Baker Boy Newsboy Cap',          store: 'ASOS',          price: '$22', q: 'leopard print baker boy newsboy cap women y2k animal print' },
        { category: 'Jewelry',   name: 'Rhinestone Crystal Chain Choker',              store: 'SHEIN',         price: '$12', q: 'rhinestone crystal chain choker necklace women y2k 2000s' }
      ]},
      { name: 'The Festival Look', tier: 'aff', tag: 'Main character · dark corset top and baggy khaki pants', heroIdx: 2, pieces: [
        { category: 'Top',       name: 'Dark Brown Strapless Boned Corset Top with Lace Trim', store: 'SHEIN', price: '$28', q: 'dark brown strapless boned corset top lace trim women y2k' },
        { category: 'Bottom',    name: 'Khaki/Olive Baggy Balloon-Leg Pants',          store: 'SHEIN',         price: '$38', q: 'khaki olive baggy balloon leg pants women y2k streetwear' },
        { category: 'Layer',     name: 'Denim Jacket (Tied Around Waist)',             store: 'H&M',           price: '$45', q: 'denim jacket women classic y2k tied around waist' },
        { category: 'Jewelry',   name: 'Silver Hoop Earrings',                         store: 'H&M',           price: '$12', q: 'silver hoop earrings women y2k 2000s medium' },
        { category: 'Jewelry',   name: 'Gold Cross Pendant Necklace',                  store: 'H&M',           price: '$15', q: 'gold cross pendant necklace women y2k layered' },
        { category: 'Jewelry',   name: 'Layered Gold Chain Necklaces',                 store: 'H&M',           price: '$18', q: 'layered gold chain necklace set women y2k 2000s' }
      ]},
      { name: 'The Going Out Fit', tier: 'mid', tag: 'Pink velour tracksuit · Juicy Couture Y2K', heroIdx: 4, pieces: [
        { category: 'Top',       name: 'Pink Velour Zip-Up Crop Hoodie',               store: 'SHEIN',         price: '$38', q: 'pink velour velvet zip up crop hoodie women y2k juicy couture style' },
        { category: 'Bottom',    name: 'Pink Velour Wide-Leg Flare Pants (Matching)',  store: 'SHEIN',         price: '$35', q: 'pink velour velvet wide leg flare pants women y2k tracksuit matching' },
        { category: 'Accessory', name: 'White Satin Headband',                         store: 'H&M',           price: '$12', q: 'white satin headband women y2k 2000s' },
        { category: 'Jewelry',   name: 'Crystal Rhinestone Choker Necklace',           store: 'Urban Outfitters', price: '$28', q: 'crystal rhinestone choker necklace women y2k 2000s' },
        { category: 'Bag',       name: 'Small Pink Structured Bag',                    store: 'SHEIN',         price: '$22', q: 'small pink structured bag women y2k 2000s cute' }
      ]},
      { name: 'The Plaid Corset', tier: 'aff', tag: 'Grunge glam · burgundy plaid corset and grey baggy jeans', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Burgundy Plaid Corset Tank with White Lace Ruffle Hem', store: 'SHEIN', price: '$28', q: 'burgundy plaid corset tank top white lace ruffle hem overlay women y2k' },
        { category: 'Bottom',    name: 'Grey Wide-Leg Baggy Jeans',                    store: 'SHEIN',         price: '$38', q: 'grey wide leg baggy jeans women y2k low rise' },
        { category: 'Shoes',     name: 'Grey Metallic Chunky Platform Shoes',          store: 'SHEIN',         price: '$45', q: 'grey metallic chunky platform shoes women y2k 2000s' },
        { category: 'Bag',       name: 'Black Mini Crossbody Bag',                     store: 'SHEIN',         price: '$18', q: 'black mini crossbody bag women y2k streetwear' },
        { category: 'Jewelry',   name: 'Black Star Charm Choker Necklace',             store: 'SHEIN',         price: '$12', q: 'black star charm choker necklace women y2k grunge' },
        { category: 'Jewelry',   name: 'Layered Beaded Necklaces',                     store: 'H&M',           price: '$15', q: 'layered beaded necklaces set women y2k 2000s colorful' }
      ]}
    ],
    vintage: [
      { name: 'The Military Edit', tier: 'mid', tag: 'Structured vintage · cream military jacket and ruffled mini', heroIdx: 1, pieces: [
        { category: 'Jacket',    name: 'Cream Structured Military-Style Long Jacket (Gold Buttons)', store: 'Zara', price: '$89', q: 'cream structured military style long jacket women gold buttons vintage collarless' },
        { category: 'Bottom',    name: 'Cream/Ivory Ruffled Tiered Mini Skirt',        store: 'ASOS',          price: '$55',  q: 'cream ivory ruffled tiered mini skirt women vintage elegant' },
        { category: 'Tights',    name: 'White Floral Lace Tights',                     store: 'SHEIN',         price: '$14',  q: 'white floral lace pattern tights women vintage elegant' },
        { category: 'Jewelry',   name: 'Multi-Strand Pearl Collar Necklace',           store: 'H&M',           price: '$25',  q: 'multi strand pearl collar necklace women vintage classic' },
        { category: 'Jewelry',   name: 'Gold Stud Earrings',                           store: 'H&M',           price: '$12',  q: 'gold stud earrings women classic vintage minimal' },
        { category: 'Jewelry',   name: 'Gold Ring',                                    store: 'H&M',           price: '$12',  q: 'gold ring women classic vintage minimal' }
      ]},
      { name: 'The Flea Market Find', tier: 'mid', tag: 'Parisian vintage · cream tweed blazer and Chanel flap', heroIdx: 2, pieces: [
        { category: 'Jacket',    name: 'Cream Tweed Bouclé Blazer (Gold Buttons)',     store: 'Zara',          price: '$79',  q: 'cream tweed boucle blazer women vintage classic gold buttons' },
        { category: 'Top',       name: 'Cream Turtleneck Sweater',                     store: 'Uniqlo',        price: '$39',  q: 'cream ivory turtleneck sweater women vintage classic' },
        { category: 'Tights',    name: 'White Floral Lace Tights',                     store: 'SHEIN',         price: '$14',  q: 'white floral lace pattern tights women vintage elegant' },
        { category: 'Shoes',     name: 'White Pointed-Toe Kitten-Heel Pumps',          store: 'ASOS',          price: '$65',  q: 'white pointed toe kitten heel pumps women vintage 60s classic' },
        { category: 'Bag',       name: 'Cream Quilted Classic Flap Bag with Gold Chain', store: 'SHEIN',       price: '$38',  q: 'cream ivory quilted classic flap bag gold chain women vintage chanel style' }
      ]},
      { name: 'The Garden Party', tier: 'mid', tag: 'Garden party · ivory ruffle full-skirt halter mini dress', heroIdx: 4, pieces: [
        { category: 'Dress',     name: 'Ivory/Cream Ruffle-Hem Full-Circle Skirt Halter Mini Dress', store: 'ASOS', price: '$75', q: 'ivory cream ruffle hem full circle skirt halter mini dress women vintage garden party' },
        { category: 'Shoes',     name: 'White Kitten-Heel Ankle-Strap Pumps',          store: 'Charles & Keith', price: '$75', q: 'white kitten heel ankle strap pumps women vintage garden party' },
        { category: 'Bag',       name: 'White Mini Pearl-Trim Shoulder Bag',           store: 'SHEIN',         price: '$25', q: 'white mini pearl trim shoulder bag women vintage garden party' },
        { category: 'Jewelry',   name: 'Pearl Drop Earrings',                          store: 'H&M',           price: '$18', q: 'pearl drop earrings women vintage elegant garden party' }
      ]},
      { name: 'The 70s Fantasy', tier: 'lux', tag: 'Hollywood glamour · pink satin bustier and sequin midi', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Pink Satin Strapless Bustier Top',             store: 'ASOS',          price: '$55',  q: 'pink satin strapless bustier top women vintage hollywood glamour' },
        { category: 'Bottom',    name: 'Pink Sequin Fitted Midi Skirt',                store: 'SHEIN',         price: '$45',  q: 'pink sequin fitted midi skirt women vintage glamour party' },
        { category: 'Layer',     name: 'White Fluffy Faux Fur Stole/Wrap',             store: 'SHEIN',         price: '$38',  q: 'white fluffy faux fur stole wrap women vintage glamour hollywood' },
        { category: 'Bag',       name: 'Crystal Rhinestone Embellished Mini Clutch',   store: 'SHEIN',         price: '$28',  q: 'crystal rhinestone embellished mini bag clutch women vintage glamour silver' },
        { category: 'Jewelry',   name: 'Diamond/Crystal Rhinestone Choker Necklace',   store: 'SHEIN',         price: '$18',  q: 'diamond crystal rhinestone choker necklace women vintage glamour' },
        { category: 'Jewelry',   name: 'Crystal Rhinestone Tennis Bracelet',           store: 'SHEIN',         price: '$15',  q: 'crystal rhinestone tennis bracelet women vintage glamour' }
      ]}
    ],
    softgirl: [
      { name: 'The Beauty Edit', tier: 'aff', tag: 'Glazed skin · soft girl makeup look', heroIdx: 0, pieces: [
        { category: 'Blush',     name: 'Flushed Pink Blush Palette',                   store: 'Sephora',       price: '$28', q: 'flushed pink blush palette women soft girl dewy glow' },
        { category: 'Lip',       name: 'Glossy Pink Lip Gloss',                        store: 'Sephora',       price: '$18', q: 'glossy pink lip gloss women soft girl coquette' },
        { category: 'Lashes',    name: 'Lengthening Volumizing Black Mascara',         store: 'Sephora',       price: '$25', q: 'lengthening volumizing mascara black women soft girl lashes' },
        { category: 'Jewelry',   name: 'Delicate Gold Chain Necklace',                 store: 'H&M',           price: '$18', q: 'delicate gold chain necklace women soft girl minimal' },
        { category: 'Skincare',  name: 'Dewy Glass-Skin Tinted Moisturizer',          store: 'Sephora',       price: '$35', q: 'dewy glass skin tinted moisturizer women soft girl glazed' }
      ]},
      { name: 'The Garden Party', tier: 'mid', tag: 'Floral midi · pink cardigan over floral dress', heroIdx: 2, pieces: [
        { category: 'Top',       name: 'Pink Ribbed Tie-Front Cropped Cardigan',       store: 'H&M',           price: '$35',  q: 'pink ribbed tie front cropped cardigan women soft girl' },
        { category: 'Dress',     name: 'Pink/White Floral Print Spaghetti-Strap Midi Dress', store: 'SHEIN',  price: '$38',  q: 'pink white floral print spaghetti strap midi dress women soft girl' },
        { category: 'Bag',       name: 'Cream Structured Mini Top-Handle Bag',         store: 'Charles & Keith', price: '$65', q: 'cream structured mini top handle bag women soft girl' },
        { category: 'Shoes',     name: 'White Platform Heeled Strap Sandals',          store: 'Charles & Keith', price: '$75', q: 'white platform heeled strap sandals women soft girl' }
      ]},
      { name: 'The Preppy Edit', tier: 'mid', tag: 'Soft preppy · navy V-neck over pinstripe shirt and tailored trousers', heroIdx: 4, pieces: [
        { category: 'Top',       name: 'Navy Cable-Knit Cropped V-Neck Sweater',       store: 'H&M',           price: '$39', q: 'navy cable knit cropped v neck sweater women soft girl preppy' },
        { category: 'Top',       name: 'White/Blue Pinstripe Collared Shirt (Layered)', store: 'Uniqlo',       price: '$39', q: 'white blue pinstripe collared shirt women preppy layering underneath' },
        { category: 'Bottom',    name: 'Cream/Ivory Wide-Leg Tailored Trousers',       store: 'Zara',          price: '$69', q: 'cream ivory wide leg tailored trousers women soft girl preppy' },
        { category: 'Belt',      name: 'Brown Leather Belt',                           store: 'H&M',           price: '$20', q: 'brown leather belt women classic preppy' },
        { category: 'Jewelry',   name: 'Gold Logo Pendant Necklace',                   store: 'H&M',           price: '$18', q: 'gold logo pendant necklace women soft girl chanel style elegant' },
        { category: 'Jewelry',   name: 'Small Gold Hoop Earrings',                     store: 'H&M',           price: '$12', q: 'small gold hoop earrings women minimal soft girl' }
      ]},
      { name: 'The First Date', tier: 'mid', tag: 'Navy and white · silk shirt and tailored trousers', heroIdx: 5, pieces: [
        { category: 'Top',       name: 'Navy Blue Silk/Satin Button-Down Shirt',       store: 'Zara',          price: '$59',  q: 'navy blue silk satin button down shirt women soft girl elegant' },
        { category: 'Bottom',    name: 'White Wide-Leg Tailored Trousers',             store: 'Zara',          price: '$69',  q: 'white wide leg tailored trousers women soft girl minimal' },
        { category: 'Belt',      name: 'White Leather Belt with Gold Buckle',          store: 'H&M',           price: '$20',  q: 'white leather belt gold buckle women minimal soft girl' },
        { category: 'Bag',       name: 'Black Quilted Chain Crossbody Bag',            store: 'ASOS',          price: '$45',  q: 'black quilted chain crossbody bag women elegant soft girl chanel style' },
        { category: 'Jewelry',   name: 'Gold Chain Bracelet',                          store: 'H&M',           price: '$18',  q: 'gold chain bracelet women soft girl delicate' },
        { category: 'Jewelry',   name: 'Pearl Stud Earrings',                          store: 'H&M',           price: '$12',  q: 'pearl stud earrings women soft girl elegant classic' }
      ]}
    ],

    // HIJABI CORE — heroIdx:3=cream knit+beige satin · heroIdx:4=sage linen+white maxi · heroIdx:5=navy military+dark denim
    // 2026-05-25: queries reworked (same rationale as CURATED.hijabicore above).
    hijabicore: [
      { name: 'The Quiet Luxury', tier: 'mid', tag: 'Cream knit and beige satin midi', heroIdx: 3, pieces: [
        { category: 'Top',       name: 'Cream Oversized Fluffy Knit Sweater',          store: 'COS',             price: '$135', q: 'cream oversized knit sweater women' },
        { category: 'Skirt',     name: 'Beige Satin Bias-Cut Maxi Skirt',              store: 'Zara',            price: '$59',  q: 'beige satin bias cut maxi skirt women' },
        { category: 'Bag',       name: 'Cream Soft Leather Hobo Shoulder Bag',         store: 'COS',             price: '$195', q: 'cream leather hobo shoulder bag women' },
        { category: 'Jewelry',   name: 'Gold Layered Pendant Necklace Set',            store: 'Mejuri',          price: '$98',  q: 'gold layered pendant necklace women' },
        { category: 'Scarf',     name: 'Mauve Modal Satin Hijab',                      store: 'Modanisa',        price: '$22',  q: 'mauve satin hijab women' },
        { category: 'Jewelry',   name: 'Gold Stacking Rings',                          store: 'H&M',             price: '$18',  q: 'gold stacking rings women' }
      ]},
      { name: 'The Summer Editorial', tier: 'aff', tag: 'Sage linen and white maxi', heroIdx: 4, pieces: [
        { category: 'Jacket',    name: 'Sage Green Linen Tie-Front Cropped Jacket',    store: 'Zara',            price: '$59',  q: 'sage green linen jacket women' },
        { category: 'Skirt',     name: 'White Linen Tiered Maxi Skirt',                store: 'H&M',             price: '$45',  q: 'white tiered maxi skirt women' },
        { category: 'Top',       name: 'White Lightweight Cotton Long-Sleeve Tee',     store: 'Uniqlo',          price: '$25',  q: 'white long sleeve cotton t shirt women' },
        { category: 'Scarf',     name: 'White Premium Cotton Hijab',                   store: 'Modanisa',        price: '$15',  q: 'white cotton hijab women' },
        { category: 'Shoes',     name: 'Nude Pointed-Toe Flats',                       store: 'H&M',             price: '$32',  q: 'nude pointed toe flats women' }
      ]},
      { name: 'The Polished Travel', tier: 'mid', tag: 'Navy military and dark denim', heroIdx: 5, pieces: [
        { category: 'Jacket',    name: 'Navy Military Tailored Jacket',                store: 'Zara',            price: '$89',  q: 'navy military jacket women' },
        { category: 'Bottom',    name: 'Dark Indigo High-Waist Wide-Leg Jeans',        store: 'Uniqlo',          price: '$49',  q: 'dark indigo high waist wide leg jeans women' },
        { category: 'Bag',       name: 'Brown Monogram Mini Top-Handle Bag',           store: 'Charles & Keith', price: '$95',  q: 'brown mini top handle bag women' },
        { category: 'Shoes',     name: 'Brown Pointed Leather Pumps',                  store: 'COS',             price: '$165', q: 'brown pointed leather pumps women' },
        { category: 'Scarf',     name: 'Chocolate Brown Modal Hijab',                  store: 'Modanisa',        price: '$18',  q: 'chocolate brown hijab women' }
      ]}
    ]
  };

  const STYLING_TIPS = {
    classic: [
      { tip: 'Build around three neutrals.', detail: 'Cream, navy, and camel. Every other piece is an accent against this foundation — one that never competes.' },
      { tip: 'Invest in one perfect blazer.', detail: 'A well-fitting blazer in a quality neutral tone elevates every outfit in your wardrobe. Start here before anything else.' },
      { tip: 'Let fabric do the talking.', detail: 'Opt for wool, silk, and cashmere over synthetic blends. The weight and drape of real fabric is visible from across the room.' },
      { tip: 'One accessory at a time.', detail: 'A watch, or earrings, or a scarf — not all three. Restraint is the signature of classic dressing. Edit relentlessly.' }
    ],
    casual: [
      { tip: 'Fit matters more than price.', detail: 'A $20 tee that fits you perfectly beats a $200 one that doesn\'t. Know your preferred silhouette and seek it in every piece.' },
      { tip: 'Anchor with good denim.', detail: 'One well-fitting pair of straight-leg jeans in a clean wash can be dressed up or down for almost any situation.' },
      { tip: 'Let one thing be elevated.', detail: 'Pair casual pieces with one elevated item — quality leather sneakers, a cashmere knit, or a structured bag changes everything.' },
      { tip: 'Build around white.', detail: 'A crisp white tee is the most versatile piece you own. Keep two or three in rotation and replace them regularly.' }
    ],
    streetwear: [
      { tip: 'Commit to one statement piece.', detail: 'A loud sneaker, a bold graphic, or a statement bag. Let everything else support it — not compete with it.' },
      { tip: 'Proportion is the real flex.', detail: 'Oversized top with fitted bottom — or vice versa. The contrast makes streetwear look intentional rather than accidental.' },
      { tip: 'Layer textures, not just colors.', detail: 'Mix jersey with nylon, cotton with leather. Texture creates depth without needing loud prints.' },
      { tip: 'Keep the silhouette consistent.', detail: 'Baggy-baggy works if it\'s all baggy. Fitted-fitted works. The mix between needs purpose — proportion creates the look.' }
    ],
    minimalist: [
      { tip: 'Five colors, maximum.', detail: 'Bone, taupe, oat, charcoal, and one accent. A minimal wardrobe is defined by what you leave out — edit to the essential.' },
      { tip: 'Quality over quantity, always.', detail: 'Three perfect basics outperform twenty almost-right pieces. Invest in fewer things, chosen more carefully.' },
      { tip: 'Texture is your pattern.', detail: 'In a monochrome palette, texture creates visual interest — linen, silk, ribbed knit, and smooth wool do the work color cannot.' },
      { tip: 'Wear one piece of fine jewelry daily.', detail: 'A thin gold chain or simple stud worn every day becomes a personal signature. Consistency becomes style.' }
    ],
    elegant: [
      { tip: 'Fabric first, always.', detail: 'Silk, satin, and chiffon move differently than synthetic blends. The fluid weight of real fabric is immediately visible — and worth the price.' },
      { tip: 'Monochromatic looks feel most elevated.', detail: 'Blush-on-blush or ivory-on-cream creates a visual richness that mixed colors can rarely match.' },
      { tip: 'The kitten heel over the stiletto.', detail: 'A kitten heel implies confidence that doesn\'t need height. It is quietly more elegant than the obvious stiletto.' },
      { tip: 'Keep accessories soft and very few.', detail: 'Pearl drops or a single bracelet. Elegance is gentle and restrained — never loud, never too much.' }
    ],
    korean: [
      { tip: 'Contrast defines the look.', detail: 'Oversized blazer with a mini skirt. Chunky sweater with a delicate collar. Korean style lives in that exact tension between the two.' },
      { tip: 'Skin first, then makeup.', detail: 'The dewy glass-skin look is the foundation of every Korean beauty look. Invest in skincare before cosmetics — it shows.' },
      { tip: 'Layer with visible intention.', detail: 'A fitted tee under an oversized cardigan under a blazer — every layer should be visible and purposeful, not just warm.' },
      { tip: 'Small bags, maximum impact.', detail: 'The tinier the bag, the more intentional it looks. A mini quilted chain bag elevates even the simplest casual outfit.' }
    ],
    y2k: [
      { tip: 'Go low, go bold.', detail: 'Low-rise is the defining silhouette. Pair with a cropped top and show just a hint of midriff — it\'s entirely about the attitude.' },
      { tip: 'More is more.', detail: 'Layered necklaces, butterfly clips, tinted sunglasses simultaneously — Y2K is the one aesthetic where maximalism is the rule.' },
      { tip: 'Rhinestones are an instant upgrade.', detail: 'A rhinestone detail on any basic piece instantly reads as Y2K. A $10 rhinestone belt transforms an entire outfit.' },
      { tip: 'Denim on denim, done with intent.', detail: 'Match washes closely for a polished double-denim moment. The further apart the washes, the bolder the statement.' }
    ],
    vintage: [
      { tip: 'Learn to read labels.', detail: 'Union labels, fabric composition, and country of origin accurately date a garment. This knowledge helps you find the real pieces.' },
      { tip: 'Thrift with a clear strategy.', detail: 'Know what you\'re looking for before you go. Coats, denim, and wool hold up best over time. Synthetics rarely do.' },
      { tip: 'Mix one vintage piece with modern basics.', detail: 'One thrifted blazer or blouse worn with clean modern basics creates a more wearable look than head-to-toe costume dressing.' },
      { tip: 'Tailoring changes everything.', detail: 'A $15 thrifted blazer taken in at the waist can look like a $300 designer piece. A good tailor is a real investment.' }
    ],
    softgirl: [
      { tip: 'Pink is a neutral.', detail: 'Blush, petal, rose, and mauve all layer beautifully together. Build tonal pink outfits the same way you would work with neutrals.' },
      { tip: 'Accessorize with your hair.', detail: 'Bow clips, pearl pins, and ribbon headbands are part of the outfit. Your hair styling is a deliberate choice, not an afterthought.' },
      { tip: 'Shape matters as much as color.', detail: 'Puff sleeves, flared skirts, ruffle hems — the silhouette is as important as the color palette. Feminine shapes define this aesthetic.' },
      { tip: 'Apply blush like you mean it.', detail: 'On cheeks, on the nose bridge, blended lightly onto the lids — the soft girl look is rooted in a generous, flushed glow.' }
    ],
    hijabicore: [
      { tip: 'The hijab is part of the outfit.', detail: 'Match its tone to one piece in the look — coat, bag, or shoes. The right colour bridge instantly makes a layered fit read as styled, not stacked.' },
      { tip: 'Length is the silhouette.', detail: 'Build around one long line — a maxi coat, a fluid maxi skirt, a column-length abaya. The eye reads modesty as elegance the moment the proportion is right.' },
      { tip: 'Two textures, never three.', detail: 'Satin hijab with wool coat. Cotton hijab with linen jacket. Mixing more than two fabric weights at once breaks the calm of the look.' },
      { tip: 'Quality over coverage performance.', detail: 'A real silk hijab, a structured leather bag, a well-cut wool coat — pick the three pieces that touch the body the most and invest in them.' }
    ]
  };

  const BRAND_GUIDE = {
    classic: {
      aff: { stores: 'H&M · ASOS · SHEIN · Uniqlo', note: 'H&M Divided and ASOS carry structured blazers and tailored trousers that rival mid-range options at a fraction of the price. Uniqlo for genuinely well-made basics.' },
      mid: { stores: 'Zara · COS · Massimo Dutti · Uniqlo', note: 'Massimo Dutti is the definitive mid-range classic wardrobe. COS for clean tailoring, Uniqlo for the best quality basics.' },
      lux: { stores: 'Toteme · A.P.C. · Jacquemus · Reformation · Acne Studios', note: 'Toteme defines the modern classic wardrobe. A.P.C. for the perfect trench, the right leather bag, and the ideal slim jean.' }
    },
    casual: {
      aff: { stores: 'H&M · Uniqlo · SHEIN · ASOS', note: 'Uniqlo offers genuinely well-made basics at low prices — their denim, linen, and knitwear consistently exceed expectations.' },
      mid: { stores: 'Levis · Zara · Aritzia · Free People', note: 'Levis for the best mid-range denim — it outlasts everything else. Aritzia for elevated casuals that never feel try-hard.' },
      lux: { stores: 'Everlane · COS · A.P.C. · Toteme', note: 'A.P.C. Denim is a genuine investment piece that ages beautifully. Everlane for transparent pricing and consistently clean basics.' }
    },
    streetwear: {
      aff: { stores: 'SHEIN · Cider · H&M · AliExpress', note: 'Cider and SHEIN lead for affordable streetwear — oversized hoodies, cargo pants, and chunky sneakers without the premium.' },
      mid: { stores: 'Nike · Adidas · Urban Outfitters · ASOS · Zara', note: 'Nike and Adidas Originals are the backbone of any streetwear wardrobe. Urban Outfitters for the pieces that tie a look together.' },
      lux: { stores: 'Acne Studios · Jacquemus · A.P.C.', note: 'Acne Studios for the heavyweight tee and perfect-fit jeans. Jacquemus for sculptural bags that become the focal point of a look.' }
    },
    minimalist: {
      aff: { stores: 'Uniqlo · H&M · SHEIN', note: 'Uniqlo is the minimalist\'s most useful resource — well-cut basics in neutral tones, consistently good quality, low prices.' },
      mid: { stores: 'COS · & Other Stories · Aritzia', note: 'COS was designed for minimalist dressing — clean architectural silhouettes, quality fabrics, and a quietly strong identity.' },
      lux: { stores: 'Toteme · A.P.C. · Acne Studios · Jacquemus', note: 'Toteme defines modern minimalism. Beautiful cuts, a neutral color story, and a quiet luxury that improves every season.' }
    },
    elegant: {
      aff: { stores: 'SHEIN · H&M · ASOS', note: 'ASOS and H&M carry silk-look blouses and satin midi skirts that photograph beautifully and look far more expensive than they are.' },
      mid: { stores: 'Zara · & Other Stories · Reformation · COS', note: '& Other Stories does elegant consistently well — silk-adjacent blouses, fluid midi dresses, and well-made kitten heels across every season.' },
      lux: { stores: 'Reformation · Jacquemus · Toteme · Polène', note: 'Reformation for sustainable silk dresses that move beautifully. Polène for the most elegant everyday investment bag available.' }
    },
    korean: {
      aff: { stores: 'SHEIN · Cider · AliExpress · H&M', note: 'SHEIN and Cider lead the affordable Korean-adjacent look — soft knits, pleated skirts, and platform shoes in the right pastel palette.' },
      mid: { stores: 'Uniqlo · ASOS · & Other Stories', note: 'Uniqlo\'s Japanese sensibility translates perfectly into Korean dressing — clean knits, soft fabrics, refined silhouettes.' },
      lux: { stores: 'Acne Studios · A.P.C. · Toteme · Jacquemus', note: 'Acne Studios for the oversized blazer that elevates everything. Korean luxury aligns naturally with Scandinavian and French minimalism.' }
    },
    y2k: {
      aff: { stores: 'SHEIN · Cider · AliExpress · Princess Polly · H&M', note: 'SHEIN and Cider are the strongest affordable sources for Y2K — low-rise jeans, baby tees, platform shoes, rhinestone everything.' },
      mid: { stores: 'ASOS · Urban Outfitters · Zara · Princess Polly', note: 'Urban Outfitters and Princess Polly curate the best mid-range Y2K references — the most accurate 2000s revival pieces available.' },
      lux: { stores: 'Jacquemus · Acne Studios', note: 'Jacquemus and Acne Studios do high-fashion Y2K — sculptural micro bags, precise denim, and statement shoes built to last.' }
    },
    vintage: {
      aff: { stores: 'Depop · Etsy · SHEIN · H&M · ASOS', note: 'Depop is the number-one destination for genuine vintage finds. Etsy sellers often specialize in curated pieces from specific decades.' },
      mid: { stores: 'Beyond Retro · Urban Outfitters · Free People · Etsy', note: 'Beyond Retro is one of the most trusted curated vintage retailers — pre-loved, well-priced, and genuinely selected.' },
      lux: { stores: 'Reformation · A.P.C. · Dr. Martens', note: 'Dr. Martens are the most enduring investment shoe for this aesthetic — built to improve with age and outlast every trend.' }
    },
    softgirl: {
      aff: { stores: 'SHEIN · Cider · Princess Polly · AliExpress · H&M', note: 'SHEIN and Cider carry the complete soft girl range — floral dresses, lace tops, bow accessories, and pastel knits at every price.' },
      mid: { stores: 'Brandy Melville · ASOS · Urban Outfitters', note: 'Brandy Melville built its brand almost entirely on the soft girl aesthetic — their pieces are the most authentic single-brand reference.' },
      lux: { stores: 'Reformation · Jacquemus · Polène', note: 'Reformation\'s lace-trim dresses and floral midis are the elevated version of this aesthetic. Polène for the bag that completes every look.' }
    },
    hijabicore: {
      aff: { stores: 'SHEIN · H&M · Uniqlo · Modanisa', note: 'SHEIN and H&M cover long-sleeve maxi dresses, abaya-cut coats, and modest tops at the friendliest prices. Modanisa carries premium hijabs at affordable tier.' },
      mid: { stores: 'COS · Zara · Uniqlo · Modanisa · Charles & Keith', note: 'COS is the modest dresser\'s best friend — clean lines, generous cuts, and quality fabrics designed for layering. Zara for tailored coats, Modanisa for the right hijab fabrics.' },
      lux: { stores: 'Toteme · COS · Acne Studios · Modanisa Premium', note: 'Toteme and Acne Studios both excel at long lines and soft drape — a natural fit. Modanisa\'s premium tier carries silk hijabs and tailored abayas at investment quality.' }
    }
  };

  const RICH_CATEGORIES = [
    { id: 'clothing',    label: 'Clothing'    },
    { id: 'shoes',       label: 'Shoes'       },
    { id: 'bags',        label: 'Bags'        },
    { id: 'accessories', label: 'Accessories' },
    { id: 'beauty',      label: 'Beauty'      },
    { id: 'jewelry',     label: 'Jewelry'     }
  ];
  const TIER_BADGE = { aff: 'Budget', mid: 'Mid-range', lux: 'Luxury' };

  const RICH = {};
  RICH_CATEGORIES.forEach(c => {
    RICH[c.id] = (typeof getExpandedShop === 'function') ? getExpandedShop(s, c.id) : (s.shop[c.id] || []);
  });
  const ALL_PRODUCTS = [];
  RICH_CATEGORIES.forEach(c => {
    (RICH[c.id] || []).forEach(p => ALL_PRODUCTS.push(Object.assign({}, p, { _cat: c.id, _catLabel: c.label })));
  });

  function buildUrl(store, q) {
    if (typeof expandedShopUrl === 'function') return expandedShopUrl(store, q);
    if (typeof shopUrl === 'function') return shopUrl(store, q);
    return 'https://www.google.com/search?q=' + encodeURIComponent(store + ' ' + q);
  }

  const styleCombos = (CURATED_COMBOS[s.id] || CURATED_COMBOS.classic);

  const COMBOS = styleCombos.map(combo => {
    const heroOutfit = s.outfits[combo.heroIdx] || s.outfits[0];
    return {
      name: combo.name, tier: combo.tier, tag: combo.tag,
      hero: heroOutfit ? heroOutfit.img : s.heroImg,
      pieces: combo.pieces.map(p => ({
        category: p.category, name: p.name, store: p.store, price: p.price,
        url: buildUrl(p.store, p.q)
      }))
    };
  });

  // ===== Build markup =====
  let html = '';

  // ── HERO SECTION ── side layout: text left, image right
  var _heroLetter = (s.name || '').charAt(0);
  var html_hero = '<section class="style-hero" data-bg-letter="' + _heroLetter + '">';
  html_hero += '<div class="style-hero-content">';
  html_hero += '<span class="style-hero-tag">Aesthetic</span>';
  html_hero += '<h1>' + s.name + '</h1>';
  html_hero += '<p class="style-hero-desc">' + desc + '</p>';
  html_hero += '<div class="style-hero-meta">';
  if (s.metaMood)        html_hero += '<div class="style-hero-meta-item"><h5>' + s.metaMood        + '</h5><p>Mood</p></div>';
  if (s.metaSeason)      html_hero += '<div class="style-hero-meta-item"><h5>' + s.metaSeason      + '</h5><p>Season</p></div>';
  if (s.metaPersonality) html_hero += '<div class="style-hero-meta-item"><h5>' + s.metaPersonality + '</h5><p>Personality</p></div>';
  html_hero += '</div>';
  html_hero += '</div>';
  html_hero += '<div class="style-hero-visual">';
  html_hero += '<div class="style-hero-img-main"><img src="' + s.heroImg + '" alt="' + s.name + '" fetchpriority="high"></div>';
  if (s.accentImg) html_hero += '<div class="style-hero-img-accent"><img src="' + s.accentImg + '" alt="" loading="lazy"></div>';
  html_hero += '</div>';
  html_hero += '</section>';

  // ===== Full Wardrobe data (FDIR_CATS, FASHION_DIR used below for builder) =====

  // Fashion Directory — 12 categories × 3 budget tiers
  const FDIR_CATS = [
    { id: 'tops',        label: 'Tops'        },
    { id: 'pants',       label: 'Pants'       },
    { id: 'skirts',      label: 'Skirts'      },
    { id: 'dresses',     label: 'Dresses'     },
    { id: 'jackets',     label: 'Jackets'     },
    { id: 'shoes',       label: 'Shoes'       },
    { id: 'boots',       label: 'Boots'       },
    { id: 'bags',        label: 'Bags'        },
    { id: 'jewelry',     label: 'Jewelry'     },
    { id: 'accessories', label: 'Accessories' },
    { id: 'makeup',      label: 'Makeup'      },
    { id: 'fragrances',  label: 'Fragrances'  }
  ];

  // item shorthand: [name, store, price, searchQuery]
  const D = (name, store, price, q) => ({ name, store, price, q });

  const FASHION_DIR = {
    classic: {
      tops: {
        aff: [D('White Cotton Button-Down','H&M','$25','white cotton button down shirt women'), D('Fitted Ivory Shell Top','SHEIN','$16','fitted ivory shell top women'), D('Ribbed Crewneck Knit','ASOS','$22','ribbed crewneck knit top women')],
        mid: [D('Silk Camisole Ivory','COS','$59','silk camisole top women ivory'), D('Merino Crew Sweater','COS','$125','merino wool crew sweater women'), D('Premium Linen Shirt','Uniqlo','$45','premium linen shirt women')],
        lux: [D('Silk Shell Top','Reformation','$128','silk shell top women'), D('Cashmere Crewneck','Toteme','$580','cashmere crewneck sweater women'), D('Fine Silk Blouse','Massimo Dutti','$185','fine silk blouse women')]
      },
      pants: {
        aff: [D('High-Waist Tailored Trousers','H&M','$35','high waist tailored trousers women'), D('Straight-Leg Beige Trousers','SHEIN','$28','straight leg beige trousers women'), D('Wide-Leg Black Trousers','ASOS','$32','wide leg black trousers women')],
        mid: [D('Tailored Wide-Leg Trousers','COS','$165','tailored wide leg trousers women'), D('High-Rise Straight Trousers','COS','$79','high rise straight trousers women'), D('Wool Blend Trousers','Zara','$89','wool blend tailored trousers women')],
        lux: [D('Wool Pleated Trousers','Toteme','$495','wool pleated trousers women'), D('Straight-Cut Trousers','A.P.C.','$295','straight cut tailored trousers women'), D('Silk Wide-Leg Trousers','Reformation','$198','silk wide leg trousers women')]
      },
      skirts: {
        aff: [D('Pleated Midi Skirt','H&M','$35','pleated midi skirt women'), D('A-Line Pencil Skirt','SHEIN','$22','a-line pencil skirt midi women'), D('Satin Midi Skirt','H&M','$30','satin midi skirt women')],
        mid: [D('Tailored Midi Skirt','COS','$79','tailored midi skirt women'), D('Pleated Wool Skirt','COS','$145','pleated wool midi skirt women'), D('Satin Midi Skirt','& Other Stories','$129','satin midi skirt women')],
        lux: [D('Pleated Silk Midi','Toteme','$395','pleated silk midi skirt women'), D('Structured Midi Skirt','Reformation','$248','structured midi skirt women'), D('Wool Pencil Skirt','A.P.C.','$245','wool pencil midi skirt women')]
      },
      dresses: {
        aff: [D('Wrap Shirt Dress','H&M','$39','wrap shirt dress midi women'), D('Midi Wrap Dress','SHEIN','$28','midi wrap dress women'), D('Linen Shirt Dress','ASOS','$45','linen shirt dress midi women')],
        mid: [D('Classic Wrap Dress','COS','$89','classic wrap dress women midi'), D('Tailored Shirt Dress','Zara','$79','tailored shirt dress midi women'), D('Clean Shift Dress','COS','$165','clean shift dress women')],
        lux: [D('Silk Wrap Dress','Reformation','$248','silk wrap dress women'), D('Minimal Midi Dress','Toteme','$595','minimal midi dress women'), D('Structured Midi Dress','Massimo Dutti','$245','structured midi dress women')]
      },
      jackets: {
        aff: [D('Tailored Blazer','H&M','$65','tailored blazer women'), D('Classic Trench Coat','SHEIN','$55','classic trench coat women'), D('Double-Breasted Blazer','ASOS','$59','double breasted blazer women')],
        mid: [D('Wool Overcoat','COS','$199','wool overcoat women'), D('Classic Blazer','Zara','$119','classic blazer women tailored'), D('Tailored Coat','COS','$395','tailored long coat women')],
        lux: [D('Classic Trench','Toteme','$895','classic trench coat women'), D('Structured Blazer','A.P.C.','$545','structured blazer women'), D('Cashmere Coat','Massimo Dutti','$595','cashmere wool coat women')]
      },
      shoes: {
        aff: [D('Pointed Ballet Flats','SHEIN','$22','pointed ballet flats women'), D('Block Heel Pumps','H&M','$45','block heel pumps women'), D('Classic Loafers','ASOS','$35','classic loafers women')],
        mid: [D('Leather Loafers','COS','$99','leather loafers women'), D('Slingback Heels','& Other Stories','$165','slingback heels women'), D('Kitten Heel Mules','COS','$175','kitten heel mules women')],
        lux: [D('Pointed Slingback','A.P.C.','$395','pointed slingback heels women'), D('Classic Leather Loafer','Reformation','$278','leather loafer women classic'), D('Leather Mules','Toteme','$450','leather mules women')]
      },
      boots: {
        aff: [D('Faux-Leather Ankle Boots','H&M','$55','leather look ankle boots women'), D('Pointed Toe Boots','SHEIN','$45','pointed toe ankle boots women'), D('Block Heel Boots','H&M','$59','block heel ankle boots women')],
        mid: [D('Leather Ankle Boots','COS','$129','leather ankle boots women'), D('Classic Chelsea Boots','Zara','$119','chelsea boots women leather'), D('Block Heel Knee Boots','ASOS','$115','block heel knee high boots women')],
        lux: [D('Leather Chelsea Boots','A.P.C.','$495','leather chelsea boots women'), D('Knee-High Leather Boots','Toteme','$695','leather knee high boots women'), D('Classic Ankle Boot','Reformation','$328','leather ankle boots women')]
      },
      bags: {
        aff: [D('Structured Faux-Leather Tote','H&M','$35','structured tote bag women'), D('Mini Top Handle','SHEIN','$25','mini top handle bag women'), D('Beige Shoulder Bag','ASOS','$39','beige shoulder bag women')],
        mid: [D('Structured Top Handle','Charles & Keith','$89','structured top handle bag women'), D('Leather Shoulder Bag','COS','$119','leather shoulder bag women'), D('Mini Shoulder Bag','& Other Stories','$99','mini shoulder bag women')],
        lux: [D('Gabbi Bag','JW PEI','$88','gabbi bag women structured leather'), D('Half Moon Bag','A.P.C.','$545','half moon leather bag women'), D('Structured Leather Tote','Toteme','$690','structured leather tote bag')]
      },
      jewelry: {
        aff: [D('Pearl Stud Earrings','H&M','$8','pearl stud earrings small'), D('Thin Gold Hoops','SHEIN','$6','thin gold hoop earrings women'), D('Dainty Gold Chain','Pandora','$45','dainty gold chain necklace')],
        mid: [D('Gold Bar Pendant','Mejuri','$65','gold bar pendant necklace'), D('Pearl Drop Earrings','& Other Stories','$45','pearl drop earrings'), D('Thin Gold Ring','Mejuri','$48','thin gold ring women')],
        lux: [D('Pearl Drop Earrings','Mejuri','$148','pearl drop gold earrings'), D('Gold Hoop Earrings','Tiffany & Co.','$295','gold hoop earrings classic'), D('Gold Signet Ring','Mejuri','$248','gold signet ring women')]
      },
      accessories: {
        aff: [D('Silk-Look Scarf','H&M','$15','silk square scarf women'), D('Classic Leather Belt','SHEIN','$12','classic leather belt women'), D('Tortoise Sunglasses','ASOS','$18','tortoise frame sunglasses women')],
        mid: [D('Silk Twill Scarf','& Other Stories','$45','silk twill scarf square'), D('Leather Waist Belt','COS','$39','leather waist belt women'), D('Classic Sunglasses','Zara','$35','classic sunglasses women cat eye')],
        lux: [D('Cashmere Scarf','Toteme','$295','cashmere scarf women'), D('Fine Leather Belt','A.P.C.','$195','fine leather belt women'), D('Minimal Sunglasses','Acne Studios','$295','minimal sunglasses women')]
      },
      makeup: {
        aff: [D('Flawless Longwear Foundation','Sephora','$18','e.l.f. flawless longwear foundation'), D('Soft Matte Lip Cream','Sephora','$14','NYX Soft Matte Lip Cream'), D('Lash Mascara','Sephora','$12','essence lash princess mascara')],
        mid: [D('Beautiful Skin Foundation','Sephora','$49','Charlotte Tilbury beautiful skin foundation'), D('Velvet Teddy Lip Liner','Sephora','$28','MAC lip liner velvet teddy'), D('Blush & Glow','Sephora','$38','NARS blush orgasm')],
        lux: [D('Matte Revolution Lipstick','Sephora','$45','Charlotte Tilbury matte revolution lipstick'), D('Luminous Silk Foundation','Sephora','$68','Armani luminous silk foundation'), D('Radiant Concealer','Sephora','$55','NARS radiant creamy concealer')]
      },
      fragrances: {
        aff: [D('Clean Rose Perfume','Sephora','$32','clean reserve rose perfume women'), D('White Tea EDT','Sephora','$28','elizabeth arden white tea eau de toilette'), D('Classic Floral Mist','Sephora','$24','vera wang princess perfume')],
        mid: [D('You Perfume','Glossier','$72','You perfume Glossier'), D('La Vie Est Belle','Sephora','$98','lancome la vie est belle eau de parfum'), D('Bloom EDP','Sephora','$89','gucci bloom eau de parfum')],
        lux: [D('Chanel N°5 EDP','Sephora','$185','chanel no 5 eau de parfum'), D('Miss Dior EDP','Sephora','$165','miss dior blooming bouquet perfume'), D('Libre EDP','Sephora','$148','ysl libre eau de parfum')]
      }
    },

    casual: {
      tops: {
        aff: [D('Oversized White Tee','H&M','$15','oversized white t-shirt women'), D('Soft Ribbed Tank','SHEIN','$12','soft ribbed tank top women'), D('Graphic Pocket Tee','H&M','$18','graphic pocket t-shirt women')],
        mid: [D('Soft Knit Beige Sweater','Uniqlo','$45','soft knit beige sweater women'), D('Fine Rib Turtleneck','Uniqlo','$39','fine rib turtleneck women'), D('Relaxed Linen Shirt','COS','$55','relaxed linen shirt women')],
        lux: [D('Cashmere Crew Sweater','COS','$175','cashmere crew sweater women'), D('Supima Pocket Tee','Everlane','$48','supima pocket tee women'), D('Linen Relaxed Shirt','Reformation','$128','linen relaxed shirt women')]
      },
      pants: {
        aff: [D('Straight-Leg Blue Jeans','SHEIN','$28','straight leg blue jeans women'), D('Relaxed Sweatpants','H&M','$28','relaxed sweatpants women'), D('High-Waist Barrel Jeans','ASOS','$35','high waist barrel jeans women')],
        mid: [D('Wide-Leg Light Wash Jeans','COS','$69','wide leg light wash jeans women'), D('Classic Straight Jeans','Levis','$89','classic straight jeans women'), D('Wide-Leg Jeans','Aritzia','$128','wide leg jeans women')],
        lux: [D('High-Rise Straight Jeans','Levis','$98','high rise straight leg jeans women premium'), D('Barrel-Leg Jeans','Reformation','$148','barrel leg jeans women'), D('Perfect Jean','Everlane','$128','perfect straight jeans women')]
      },
      skirts: {
        aff: [D('Denim Mini Skirt','SHEIN','$22','denim mini skirt women'), D('Jersey Midi Skirt','H&M','$28','jersey midi skirt women'), D('Cargo Mini Skirt','ASOS','$32','cargo mini skirt women')],
        mid: [D('Linen Midi Skirt','Zara','$69','linen midi skirt women'), D('Denim Midi Skirt','COS','$65','denim midi skirt women'), D('Wrap Skirt','ASOS','$45','wrap midi skirt women casual')],
        lux: [D('Linen Wrap Midi Skirt','Reformation','$148','linen wrap midi skirt women'), D('Denim Midi Skirt','Levis','$89','denim midi skirt women'), D('Cotton Maxi Skirt','Everlane','$98','cotton maxi skirt women')]
      },
      dresses: {
        aff: [D('Slip Mini Dress','SHEIN','$22','slip mini dress women casual'), D('Floral Midi Dress','H&M','$35','floral midi dress women casual'), D('Smocked Sundress','H&M','$32','smocked sundress women')],
        mid: [D('Linen Midi Dress','COS','$79','linen midi dress women'), D('Day Dress','Zara','$69','casual day dress women midi'), D('Denim Shirt Dress','ASOS','$65','denim shirt dress midi women')],
        lux: [D('Linen Shirt Dress','Reformation','$178','linen shirt dress women'), D('Easy Slip Dress','Everlane','$128','easy slip dress women'), D('Sun Dress','COS','$165','minimal sun dress women')]
      },
      jackets: {
        aff: [D('Oversized Fleece Hoodie','H&M','$35','oversized fleece hoodie women'), D('Classic Denim Jacket','SHEIN','$35','classic denim jacket women'), D('Bomber Jacket','H&M','$45','bomber jacket women casual')],
        mid: [D('Light Wash Denim Jacket','Levis','$119','light wash denim jacket women'), D('Casual Blazer','Zara','$89','casual unstructured blazer women'), D('Track Jacket','Adidas','$75','adidas track jacket women')],
        lux: [D('Premium Denim Jacket','Levis','$168','premium denim trucker jacket women'), D('Relaxed Blazer','A.P.C.','$395','relaxed blazer women casual'), D('Coach Jacket','Reformation','$178','coach jacket women')]
      },
      shoes: {
        aff: [D('White Canvas Sneakers','SHEIN','$25','white canvas sneakers women'), D('Classic Low-Top','H&M','$35','classic low top sneakers women'), D('Slip-On Sneakers','ASOS','$28','slip on sneakers women white')],
        mid: [D('Classic Chuck Taylors','Converse','$65','chuck taylor all star women'), D('White Leather Sneakers','ASOS','$79','white leather sneakers women clean minimal'), D('Clean Leather Trainers','COS','$89','clean leather trainers women white')],
        lux: [D('Stan Smith Leather','Adidas','$110','adidas stan smith leather white women'), D('Leather Sneakers','A.P.C.','$295','white leather sneakers women premium'), D('Classic Runner','Adidas','$120','adidas stan smith white women')]
      },
      boots: {
        aff: [D('Ankle Combat Boots','H&M','$55','ankle combat boots women'), D('Chelsea Boots','SHEIN','$42','chelsea boots women'), D('Side-Zip Boots','ASOS','$48','side zip ankle boots women')],
        mid: [D('Leather Chelsea Boots','COS','$119','leather chelsea boots women'), D('Combat Boots','Dr. Martens','$179','dr martens 1460 boots women'), D('Lug-Sole Ankle Boots','ASOS','$95','lug sole ankle boots women')],
        lux: [D('1460 Smooth Boots','Dr. Martens','$179','dr martens 1460 smooth boots women'), D('Leather Combat Boots','A.P.C.','$495','leather combat boots women'), D('Chelsea Boots','Reformation','$298','leather chelsea boots women')]
      },
      bags: {
        aff: [D('Canvas Tote Bag','H&M','$18','canvas tote bag beige women'), D('Mini Canvas Tote','SHEIN','$12','mini canvas tote bag'), D('Nylon Crossbody','H&M','$25','nylon crossbody bag women')],
        mid: [D('Small Leather Crossbody','Charles & Keith','$79','small leather crossbody bag women'), D('Bucket Bag','COS','$89','bucket bag women leather'), D('Belt Bag','Zara','$45','belt bag waist pack women')],
        lux: [D('Leather Tote','Everlane','$198','leather tote bag women'), D('Small Shoulder Bag','A.P.C.','$395','small shoulder bag women leather'), D('Day Bag','Toteme','$590','leather day bag women')]
      },
      jewelry: {
        aff: [D('Silver Hoop Earrings','H&M','$8','silver hoop earrings small women'), D('Layered Chains Set','SHEIN','$10','layered chain necklace set women'), D('Simple Stud Set','ASOS','$12','simple stud earrings set women')],
        mid: [D('Silver Hoop Earrings','Pandora','$55','silver hoop earrings pandora'), D('Gold Layered Chain','Mejuri','$95','gold layered chain necklace women'), D('Bold Hoops','& Other Stories','$35','bold hoop earrings women')],
        lux: [D('Gold Chain Necklace','Mejuri','$148','gold chain necklace women'), D('Large Hoop Earrings','Mejuri','$128','large hoop earrings gold women'), D('Bezel Ring','Mejuri','$88','bezel set ring gold women')]
      },
      accessories: {
        aff: [D('Baseball Cap Beige','H&M','$12','beige baseball cap women'), D('Chunky Knit Beanie','SHEIN','$8','chunky knit beanie women'), D('Canvas Belt Bag','H&M','$18','canvas belt bag women')],
        mid: [D('Wool Baseball Cap','COS','$35','wool baseball cap women'), D('Satin Headband','& Other Stories','$25','satin headband women'), D('Woven Straw Hat','Zara','$39','woven straw hat women summer')],
        lux: [D('Cashmere Beanie','COS','$75','cashmere beanie women'), D('Leather Belt','Everlane','$75','leather belt women'), D('Sunglasses','Le Specs','$89','le specs sunglasses women')]
      },
      makeup: {
        aff: [D('Tinted Moisturizer SPF','Sephora','$16','CeraVe tinted moisturizer SPF'), D('Brow Pencil','Sephora','$10','essence brow pencil makeup'), D('Mascara','Sephora','$12','L\'Oreal voluminous mascara')],
        mid: [D('Skin Tint Foundation','Sephora','$42','ILIA skin tint serum foundation'), D('Cream Blush Stick','Sephora','$36','Rare Beauty soft pinch liquid blush'), D('Brow Gel','Sephora','$32','Benefit gimme brow volumizing gel')],
        lux: [D('Skin Foundation','Sephora','$62','Armani luminous silk foundation'), D('Lip & Cheek Stick','Sephora','$45','NARS the multiple stick'), D('Lip Oil Gloss','Sephora','$38','Dior addict lip oil')]
      },
      fragrances: {
        aff: [D('Body Mist','Sephora','$18','bath and body works warm vanilla sugar'), D('Vanilla Roll-On','Sephora','$22','pacifica vanilla coconut perfume roll on'), D('Fresh Linen Spray','Sephora','$26','clean beauty collective fresh laundry')],
        mid: [D('You Perfume','Glossier','$72','You perfume Glossier'), D('Musky Floral EDP','Sephora','$89','maison margiela replica flower market'), D('Clean Citrus EDP','Sephora','$85','jo malone lime basil mandarin')],
        lux: [D('Replica Beach Walk','Sephora','$185','maison margiela replica beach walk perfume'), D('Chloe EDP','Sephora','$148','chloe eau de parfum women'), D('Free People Peach','Sephora','$138','phlur missing person perfume')]
      }
    },

    streetwear: {
      tops: {
        aff: [D('Oversized Graphic Hoodie','SHEIN','$25','oversized graphic hoodie unisex streetwear'), D('Boxy Graphic Tee','H&M','$18','boxy graphic t-shirt streetwear'), D('Zip-Up Jacket','H&M','$38','zip up track jacket women streetwear')],
        mid: [D('Oversized Crewneck Sweatshirt','Urban Outfitters','$69','oversized crewneck sweatshirt women'), D('Heavyweight Graphic Tee','Urban Outfitters','$45','heavyweight graphic t-shirt women'), D('Ribbed Long-Sleeve','ASOS','$35','ribbed long sleeve top women streetwear')],
        lux: [D('Heavyweight Cotton Tee','Acne Studios','$240','heavyweight cotton t-shirt women'), D('Cropped Sweatshirt','Jacquemus','$295','cropped sweatshirt women'), D('Logo Hoodie','Acne Studios','$395','logo hoodie women')]
      },
      pants: {
        aff: [D('Baggy Cargo Pants','SHEIN','$32','baggy cargo pants women streetwear'), D('Wide-Leg Joggers','H&M','$35','wide leg joggers women'), D('Relaxed Track Pants','H&M','$28','relaxed track pants women')],
        mid: [D('Wide-Leg Cargo Pants','ASOS','$65','wide leg cargo pants women'), D('Wide-Leg Cargo Trousers','Zara','$79','wide leg cargo trousers women'), D('Baggy Jeans','Urban Outfitters','$89','baggy jeans women streetwear')],
        lux: [D('Wide-Leg Trousers','Jacquemus','$395','wide leg trousers women'), D('Track Pants','Acne Studios','$345','track pants women'), D('Cargo Trousers','A.P.C.','$325','cargo trousers women')]
      },
      skirts: {
        aff: [D('Denim Mini Skirt','SHEIN','$22','denim mini skirt streetwear women'), D('Cargo Mini Skirt','SHEIN','$25','cargo mini skirt women'), D('Skate Skirt','H&M','$28','skate skirt women short')],
        mid: [D('Denim Mini Skirt','Urban Outfitters','$55','denim mini skirt women urban'), D('Cargo Skirt','Zara','$65','cargo skirt women mini streetwear'), D('Pleated Skort','ASOS','$49','pleated skort women')],
        lux: [D('Denim Mini Skirt','Acne Studios','$295','denim mini skirt women'), D('Wrap Mini Skirt','Jacquemus','$345','wrap mini skirt women'), D('Slit Midi Skirt','A.P.C.','$245','slit midi skirt women')]
      },
      dresses: {
        aff: [D('Slip Dress','SHEIN','$22','slip dress streetwear women'), D('Jersey Dress','SHEIN','$22','jersey mini dress women'), D('Tank Mini Dress','H&M','$28','tank mini dress women')],
        mid: [D('Jersey Maxi Dress','Urban Outfitters','$75','jersey maxi dress women'), D('Mini T-Shirt Dress','ASOS','$45','mini t-shirt dress women'), D('Slip Dress','& Other Stories','$95','slip dress women streetwear')],
        lux: [D('Jersey Dress','Acne Studios','$395','jersey dress women'), D('Mini Dress','Jacquemus','$495','mini dress women'), D('Slip Dress','Reformation','$198','silk slip dress women')]
      },
      jackets: {
        aff: [D('Oversized Puffer Jacket','SHEIN','$45','oversized puffer jacket women'), D('Windbreaker Jacket','H&M','$55','windbreaker jacket women streetwear'), D('Bomber Jacket','H&M','$39','bomber jacket women streetwear')],
        mid: [D('Puffer Jacket','Nike','$125','puffer jacket women nike'), D('Coach Jacket','Urban Outfitters','$89','coach jacket women streetwear'), D('Utility Jacket','ASOS','$75','utility jacket women cargo')],
        lux: [D('Leather Jacket','Acne Studios','$1095','leather jacket women'), D('Cropped Bomber','Jacquemus','$595','cropped bomber jacket women'), D('Denim Jacket','A.P.C.','$395','denim jacket women premium')]
      },
      shoes: {
        aff: [D('Chunky Black Sneakers','SHEIN','$45','chunky black sneakers women streetwear'), D('Platform Trainers','H&M','$42','platform trainers women chunky'), D('Canvas Hi-Top','H&M','$35','canvas hi top sneakers women')],
        mid: [D('Air Force 1','Nike','$115','nike air force 1 women white'), D('Stan Smith','Adidas','$100','adidas stan smith women white'), D('Chunky Sneakers','Urban Outfitters','$89','chunky platform sneakers women')],
        lux: [D('Leather Sneakers','Acne Studios','$395','leather sneakers women low top'), D('Designer Trainers','Jacquemus','$495','trainers sneakers women designer'), D('High-Top Leather','A.P.C.','$345','high top leather sneakers women')]
      },
      boots: {
        aff: [D('Combat Boots','SHEIN','$48','combat lace up boots women'), D('Chunky Platform Boots','SHEIN','$48','chunky platform boots women streetwear'), D('Lug-Sole Boots','H&M','$58','lug sole ankle boots women')],
        mid: [D('1460 Combat Boots','Dr. Martens','$179','dr martens 1460 boots women black'), D('Platform Chelsea','ASOS','$95','platform chelsea boots women'), D('Lug Chelsea Boots','Urban Outfitters','$129','lug sole chelsea boots women')],
        lux: [D('Leather Combat Boots','Acne Studios','$695','leather combat boots women'), D('Platform Boots','Jacquemus','$595','platform boots women designer'), D('Tall Boots','A.P.C.','$595','tall leather boots women')]
      },
      bags: {
        aff: [D('Nylon Crossbody Sling','H&M','$25','nylon crossbody sling bag'), D('Belt Bag','SHEIN','$18','belt bag waist pack streetwear'), D('Mini Backpack','SHEIN','$22','mini backpack women streetwear')],
        mid: [D('Nike Belt Bag','Nike','$45','nike belt bag waist pack'), D('Nylon Tote','Urban Outfitters','$55','nylon tote bag women'), D('Mini Crossbody','ASOS','$45','mini crossbody bag streetwear')],
        lux: [D('Le Bambino Bag','Jacquemus','$795','le bambino bag jacquemus'), D('Leather Shoulder Bag','Acne Studios','$595','leather shoulder bag women'), D('Tote Bag','A.P.C.','$345','tote bag women leather')]
      },
      jewelry: {
        aff: [D('Chunky Silver Chain','SHEIN','$10','chunky silver chain necklace women'), D('Hoop Earring Set','H&M','$12','hoop earring set women silver'), D('Silver Ring Set','H&M','$9','silver ring set women chunky')],
        mid: [D('Chunky Chain Necklace','Urban Outfitters','$35','chunky chain necklace women silver'), D('XL Hoop Earrings','& Other Stories','$39','xl hoop earrings women silver'), D('Statement Ring','Urban Outfitters','$28','statement chunky ring women')],
        lux: [D('Chunky Sterling Chain','Mejuri','$198','chunky sterling silver chain necklace women'), D('Bold Hoop Earrings','Mejuri','$148','bold hoop earrings women gold'), D('Diamond Stud Set','Mejuri','$248','diamond stud earrings women')]
      },
      accessories: {
        aff: [D('Knit Beanie Black','H&M','$12','knit beanie black women'), D('Bucket Hat','SHEIN','$12','bucket hat women streetwear'), D('Tinted Sunglasses','SHEIN','$10','tinted sunglasses women streetwear')],
        mid: [D('Wool Bucket Hat','Urban Outfitters','$35','wool bucket hat women'), D('Tinted Oval Sunglasses','Urban Outfitters','$25','tinted oval sunglasses women'), D('Crossbody Wallet','ASOS','$32','crossbody wallet women')],
        lux: [D('Beanie','Acne Studios','$195','beanie knit hat women'), D('Sunglasses','Acne Studios','$295','sunglasses women designer'), D('Leather Gloves','A.P.C.','$195','leather gloves women')]
      },
      makeup: {
        aff: [D('Matte Foundation','Sephora','$16','NYX born to glow foundation'), D('Black Liquid Liner','Sephora','$10','essence eyeliner pen black'), D('Matte Lip Cream','Sephora','$14','NYX soft matte lip cream')],
        mid: [D('Skin Tint','Sephora','$52','Fenty Beauty skin tint'), D('Flypencil Liner','Sephora','$24','Urban Decay flypencil liner'), D('Cream Lipstick','Sephora','$38','NARS powermatte lipstick')],
        lux: [D('Pro Filt Foundation','Sephora','$40','Fenty Beauty pro filt foundation'), D('24/7 Eyeliner','Sephora','$24','Urban Decay 24/7 pencil liner'), D('Black Mascara','Sephora','$27','Lancome hypnose mascara')]
      },
      fragrances: {
        aff: [D('Street Vibes Spray','Sephora','$22','zara urban vibes perfume men women'), D('Urban Musk','Sephora','$28','good girl gone bad perfume'), D('Fresh Body Mist','Sephora','$18','axe apollo body spray women')],
        mid: [D('Replica Jazz Club','Sephora','$185','maison margiela replica jazz club'), D('Santal 33','Sephora','$185','le labo santal 33 perfume'), D('Ambiance Perfume','Sephora','$89','byredo blanche eau de parfum')],
        lux: [D('Byredo Gypsy Water','Sephora','$225','byredo gypsy water eau de parfum'), D('BDK Rouge Smoking','Sephora','$265','bdk rouge smoking perfume'), D('Maison 540','Sephora','$195','maison margiela 540 ambrette')]
      }
    },

    minimalist: {
      tops: {
        aff: [D('Fitted White Tee','H&M','$12','fitted white t-shirt women'), D('High-Neck Ribbed Top','SHEIN','$14','high neck ribbed top women'), D('Linen Button-Down','Uniqlo','$35','linen button down shirt women')],
        mid: [D('Merino Crew Sweater','COS','$125','merino wool crew sweater women'), D('Supima Cotton Tee','Everlane','$35','supima cotton tee women'), D('Fine Wool Turtleneck','Uniqlo','$59','fine wool turtleneck women')],
        lux: [D('Cashmere Turtleneck','Toteme','$580','cashmere turtleneck black women'), D('Silk Slip Top','& Other Stories','$145','silk slip top women'), D('Merino Polo','A.P.C.','$195','merino wool polo sweater women')]
      },
      pants: {
        aff: [D('High-Rise Black Trousers','SHEIN','$28','high rise black tailored trousers women'), D('Linen Wide-Leg','H&M','$35','linen wide leg trousers women'), D('Straight White Trousers','ASOS','$30','straight white trousers women')],
        mid: [D('Tailored Wide-Leg Trousers','COS','$165','tailored wide leg trousers women'), D('Linen Trousers','Everlane','$98','linen trousers women'), D('High-Rise Trousers','& Other Stories','$129','high rise tailored trousers women')],
        lux: [D('Wool Pleated Trousers','Toteme','$495','wool pleated trousers women'), D('Fluid Trousers','Acne Studios','$395','fluid trousers women'), D('Tailored Trousers','A.P.C.','$295','tailored straight trousers women')]
      },
      skirts: {
        aff: [D('Straight Midi Skirt','H&M','$30','straight midi skirt women'), D('A-Line Midi Skirt','SHEIN','$22','a-line midi skirt women minimal'), D('High-Slit Midi','ASOS','$28','high slit midi skirt women')],
        mid: [D('Tailored Midi Skirt','COS','$145','tailored midi skirt women'), D('Linen Midi Skirt','Everlane','$88','linen midi skirt women'), D('Straight Skirt','& Other Stories','$99','straight midi skirt women')],
        lux: [D('Pleated Silk Midi','Toteme','$395','pleated silk midi skirt women'), D('Slit Skirt','Acne Studios','$345','slit midi skirt women'), D('Pencil Skirt','A.P.C.','$245','pencil midi skirt women')]
      },
      dresses: {
        aff: [D('Slip Midi Dress','H&M','$35','slip midi dress women'), D('Fitted Sheath Dress','SHEIN','$28','fitted sheath dress women'), D('Linen Shift Dress','ASOS','$32','linen shift dress women')],
        mid: [D('Clean Shift Dress','COS','$165','clean shift dress women'), D('Linen Column Dress','Everlane','$128','linen column dress women'), D('Midi Dress','& Other Stories','$129','minimal midi dress women')],
        lux: [D('Minimal Midi Dress','Toteme','$595','minimal midi dress women'), D('Clean Column Dress','Acne Studios','$595','column dress women'), D('Cotton Dress','A.P.C.','$295','cotton minimal dress women')]
      },
      jackets: {
        aff: [D('Tailored Blazer','H&M','$65','tailored blazer women minimal'), D('Simple Trench','SHEIN','$45','simple trench coat women'), D('Clean Overcoat','ASOS','$55','clean overcoat women')],
        mid: [D('Clean-Cut Blazer','COS','$275','clean cut blazer women'), D('Classic Trench Coat','Everlane','$228','classic trench coat women'), D('Long Coat','& Other Stories','$245','long coat women minimal')],
        lux: [D('Minimal Trench','Toteme','$895','minimal trench coat women'), D('Structured Coat','Acne Studios','$895','structured coat women'), D('Long Coat','A.P.C.','$595','long coat women tailored')]
      },
      shoes: {
        aff: [D('Black Leather Loafers','H&M','$45','black leather loafers women'), D('White Sneakers','Uniqlo','$39','white sneakers women clean'), D('Pointed Ballet Flats','SHEIN','$22','pointed ballet flats black women')],
        mid: [D('Black Leather Mules','& Other Stories','$179','black leather mules women'), D('Loafers','COS','$175','leather loafers women'), D('Kitten Heel Slingback','COS','$99','kitten heel slingback women')],
        lux: [D('Leather Mules','Toteme','$450','leather mules women'), D('Pointed Shoes','Acne Studios','$495','pointed leather shoes women'), D('Loafers','A.P.C.','$395','leather loafers women premium')]
      },
      boots: {
        aff: [D('Ankle Boots','H&M','$55','ankle boots women minimal'), D('Clean Chelsea','SHEIN','$42','clean chelsea boots women'), D('Square-Toe Boots','ASOS','$52','square toe ankle boots women')],
        mid: [D('Ankle Boots','COS','$245','leather ankle boots women'), D('Chelsea Boots','Everlane','$198','chelsea boots women leather'), D('Square-Toe Boots','& Other Stories','$195','square toe boots women')],
        lux: [D('Leather Ankle Boots','Toteme','$495','leather ankle boots women'), D('Leather Boots','Acne Studios','$695','leather boots women minimal'), D('Chelsea Boots','A.P.C.','$495','chelsea boots women leather premium')]
      },
      bags: {
        aff: [D('Black Shoulder Bag','H&M','$25','black shoulder bag minimal women'), D('Minimal Tote','SHEIN','$20','minimal tote bag women'), D('Clean Crossbody','ASOS','$28','clean crossbody bag women')],
        mid: [D('Structured Black Bag','COS','$175','structured black leather bag women'), D('Day Market Tote','Everlane','$148','day market tote bag women'), D('Minimal Shoulder Bag','& Other Stories','$129','minimal shoulder bag women')],
        lux: [D('Structured Leather Bag','JW PEI','$98','structured leather shoulder bag women'), D('Minimal Bag','Toteme','$595','minimal leather bag women'), D('Leather Tote','A.P.C.','$395','leather tote bag women')]
      },
      jewelry: {
        aff: [D('Thin Gold Hoops','H&M','$8','thin gold hoop earrings women'), D('Simple Ring Set','SHEIN','$6','simple ring set gold women'), D('Dainty Chain','Pandora','$45','dainty chain necklace women gold')],
        mid: [D('Gold Bar Pendant','Mejuri','$65','gold bar pendant necklace women'), D('Thin Gold Hoops','Mejuri','$95','thin gold hoop earrings women'), D('Stacking Ring Set','Mejuri','$88','stacking ring set gold women')],
        lux: [D('Gold Signet Ring','Mejuri','$248','gold signet ring women'), D('Diamond Studs','Mejuri','$395','diamond stud earrings women gold'), D('Gold Chain','Tiffany & Co.','$325','gold chain necklace women')]
      },
      accessories: {
        aff: [D('Minimal Sunglasses','ASOS','$18','minimal sunglasses women'), D('Linen Tote','Uniqlo','$25','linen tote bag women'), D('Simple Belt','H&M','$12','simple belt women minimal')],
        mid: [D('Clean Sunglasses','COS','$95','clean sunglasses women minimal'), D('Linen Scarf','Everlane','$55','linen scarf women'), D('Minimal Belt','& Other Stories','$45','minimal leather belt women')],
        lux: [D('Cashmere Scarf','Toteme','$295','cashmere scarf women'), D('Sunglasses','Acne Studios','$295','minimal sunglasses women designer'), D('Leather Belt','A.P.C.','$195','leather belt women minimal')]
      },
      makeup: {
        aff: [D('Tinted Moisturizer SPF','Sephora','$18','Neutrogena tinted moisturizer SPF women'), D('Clear Brow Gel','Sephora','$10','NYX brow glue stick women'), D('Lip Balm Tint','Sephora','$12','Burt\'s Bees tinted lip balm')],
        mid: [D('Skin Tint Serum','Sephora','$42','ILIA skin tint serum foundation'), D('Pinch Blush','Sephora','$36','Rare Beauty soft pinch liquid blush'), D('Brow Pomade','Sephora','$28','Anastasia Beverly Hills brow pomade')],
        lux: [D('Serum Foundation','Sephora','$68','Armani luminous silk foundation'), D('Cream Blush','Sephora','$48','Chanel baume essentiel blush'), D('Lip Treatment','Sephora','$38','Dior addict lip glow oil')]
      },
      fragrances: {
        aff: [D('Clean Cotton EDT','Sephora','$28','clean beauty collective clean cotton perfume'), D('Warm Cashmere Mist','Sephora','$22','bath and body works cashmere glow'), D('White Tea EDT','Sephora','$28','elizabeth arden white tea perfume')],
        mid: [D('You Perfume','Glossier','$72','You perfume Glossier'), D('Musk Therapy','Sephora','$89','Commodity Goods perfume'), D('Clean Vetiver','Sephora','$145','le labo vetiver 46 perfume')],
        lux: [D('Chanel Chance','Sephora','$185','chanel chance eau tendre perfume'), D('Maison Replica Flower','Sephora','$230','maison margiela replica flower market'), D('Clean Perfume','Sephora','$265','Byredo Blanche eau de parfum')]
      }
    },

    elegant: {
      tops: {
        aff: [D('Satin Camisole','SHEIN','$18','satin camisole top women elegant'), D('Lace-Trim Blouse','H&M','$28','lace trim blouse women'), D('Ruffle Silk-Look Top','ASOS','$32','ruffle silk look top women')],
        mid: [D('Silk Slip Blouse','COS','$89','silk slip blouse women'), D('Ruffle Neck Top','& Other Stories','$89','ruffle neck top women elegant'), D('Bow Blouse','Zara','$79','bow neck blouse women silk')],
        lux: [D('Silk Camisole','Reformation','$148','silk camisole top women'), D('Silk Bow Blouse','Toteme','$495','silk bow blouse women'), D('Crystal-Strap Cami','Jacquemus','$295','crystal strap camisole women')]
      },
      pants: {
        aff: [D('Satin Wide-Leg Trousers','H&M','$35','satin wide leg trousers women'), D('Cigarette Trousers','SHEIN','$28','cigarette trousers women elegant'), D('Pleated Trousers','ASOS','$39','pleated trousers women elegant')],
        mid: [D('Pleated Wide-Leg Trousers','& Other Stories','$129','pleated wide leg trousers women'), D('Satin Trousers','COS','$89','satin trousers women'), D('Fluid Trousers','Zara','$89','fluid wide leg trousers women')],
        lux: [D('Silk Wide-Leg Trousers','Reformation','$198','silk wide leg trousers women'), D('Tailored Silk Trousers','Toteme','$495','tailored silk trousers women'), D('Crystal-Hem Trousers','Jacquemus','$595','trousers women elegant designer')]
      },
      skirts: {
        aff: [D('Pleated Midi Skirt','H&M','$35','pleated midi skirt women elegant'), D('Satin Midi Skirt','SHEIN','$25','satin midi skirt women'), D('Lace-Trim Skirt','ASOS','$38','lace trim midi skirt women')],
        mid: [D('Satin Midi Slip Skirt','& Other Stories','$129','satin midi slip skirt women'), D('Pleated Silk Skirt','COS','$89','pleated silk skirt women midi'), D('Fluid Midi Skirt','Zara','$75','fluid midi skirt women elegant')],
        lux: [D('Silk Slip Midi Skirt','Reformation','$248','silk slip midi skirt women'), D('Pleated Silk Midi','Toteme','$395','pleated silk midi skirt women'), D('Crystal-Hem Skirt','Jacquemus','$595','crystal hem skirt women')]
      },
      dresses: {
        aff: [D('Satin Slip Dress','SHEIN','$28','satin slip dress midi women elegant'), D('Lace Midi Dress','H&M','$45','lace midi dress women'), D('Chiffon Wrap Dress','ASOS','$48','chiffon wrap dress women midi')],
        mid: [D('Silk Midi Dress','COS','$99','silk midi dress women elegant'), D('Slip Dress','& Other Stories','$145','slip dress women elegant'), D('Satin Midi Dress','Zara','$89','satin midi dress women')],
        lux: [D('Silk Midi Dress','Reformation','$298','silk midi dress women'), D('Satin Column Dress','Toteme','$695','satin column dress women'), D('Crystal Dress','Jacquemus','$795','crystal embellished dress women')]
      },
      jackets: {
        aff: [D('Satin Blazer','H&M','$65','satin blazer women elegant'), D('Cropped Jacket','SHEIN','$38','cropped jacket women elegant'), D('Velvet Blazer','ASOS','$55','velvet blazer women')],
        mid: [D('Tailored Blazer','COS','$129','tailored blazer women elegant'), D('Velvet Jacket','& Other Stories','$195','velvet jacket women elegant'), D('Silk Bomber','Zara','$99','silk bomber jacket women')],
        lux: [D('Silk Blazer','Reformation','$248','silk blazer women'), D('Tailored Jacket','Toteme','$695','tailored jacket women elegant'), D('Crystal-Trim Blazer','Jacquemus','$895','blazer jacket women designer')]
      },
      shoes: {
        aff: [D('Pointed Block Heels','SHEIN','$30','pointed block heel pumps women'), D('Strappy Sandals','H&M','$38','strappy sandals women elegant'), D('Kitten Heel Mules','ASOS','$45','kitten heel mules women')],
        mid: [D('Satin Mules','Charles & Keith','$89','satin mules women'), D('Block Heel Sandals','Charles & Keith','$89','block heel sandals women elegant'), D('Kitten Heels','COS','$79','kitten heel shoes women')],
        lux: [D('Crystal Strap Heels','Jacquemus','$595','crystal embellished heels women'), D('Silk Mules','Toteme','$545','silk mules women'), D('Slingback Heels','A.P.C.','$395','slingback heels women elegant')]
      },
      boots: {
        aff: [D('Knee-High Boots','SHEIN','$52','knee high boots women elegant'), D('Heeled Ankle Boots','H&M','$65','heeled ankle boots women elegant'), D('Over-Knee Boots','ASOS','$75','over knee boots women elegant')],
        mid: [D('Leather Knee-High Boots','COS','$199','leather knee high boots women'), D('Heeled Chelsea Boots','& Other Stories','$249','heeled chelsea boots women'), D('Thigh-High Boots','ASOS','$149','thigh high boots women elegant')],
        lux: [D('Knee-High Boots','Toteme','$695','knee high leather boots women'), D('Heeled Boots','A.P.C.','$595','heeled leather boots women'), D('Tall Boots','Jacquemus','$895','tall boots women designer')]
      },
      bags: {
        aff: [D('Mini Pearl Clutch','SHEIN','$25','pearl beaded clutch bag women'), D('Satin Evening Bag','H&M','$28','satin evening bag women'), D('Mini Shoulder Bag','ASOS','$32','mini shoulder bag women elegant')],
        mid: [D('Mini Evening Bag','Charles & Keith','$79','mini evening bag pearl women'), D('Mini Flap Bag','Charles & Keith','$95','mini flap bag women elegant'), D('Satin Mini Bag','& Other Stories','$89','satin mini bag women')],
        lux: [D('Mini Top Handle Bag','JW PEI','$88','mini top handle leather bag women elegant'), D('Micro Bag','Jacquemus','$595','micro bag women designer'), D('Evening Bag','Toteme','$595','evening leather bag women')]
      },
      jewelry: {
        aff: [D('Pearl Drop Earrings','H&M','$12','pearl drop earrings women'), D('Crystal Studs','SHEIN','$8','crystal stud earrings women elegant'), D('Pearl Chain Necklace','ASOS','$15','pearl chain necklace women')],
        mid: [D('Crystal Drop Earrings','& Other Stories','$45','crystal drop earrings women'), D('Pearl Necklace','Pandora','$89','pearl necklace women'), D('Crystal Stud Earrings','& Other Stories','$49','crystal stud earrings women')],
        lux: [D('Pearl Drop Earrings','Tiffany & Co.','$395','pearl drop earrings tiffany'), D('Diamond Huggies','Mejuri','$295','diamond huggie earrings women'), D('Pearl Necklace','Mejuri','$248','pearl necklace women gold')]
      },
      accessories: {
        aff: [D('Pearl Headband','SHEIN','$10','pearl headband women elegant'), D('Satin Gloves','ASOS','$22','satin gloves women elegant'), D('Velvet Choker','H&M','$12','velvet choker women')],
        mid: [D('Silk Scarf','& Other Stories','$55','silk scarf women elegant'), D('Satin Hair Bow','COS','$25','satin hair bow women'), D('Pearl Sunglasses Chain','ASOS','$28','pearl sunglasses chain women')],
        lux: [D('Cashmere Wrap','Toteme','$395','cashmere wrap scarf women'), D('Silk Gloves','Jacquemus','$295','silk gloves women elegant'), D('Pearl Hair Pin','Mejuri','$98','pearl hair pin gold women')]
      },
      makeup: {
        aff: [D('Satin Lipstick','Sephora','$14','Maybelline color sensational lipstick nude'), D('Blush Duo','Sephora','$16','e.l.f. blush palette nude pink'), D('Lengthening Mascara','Sephora','$14','L\'Oreal voluminous mascara black')],
        mid: [D('Satin Lip Liner','Sephora','$28','Charlotte Tilbury lip liner pillowtalk'), D('Sheer Foundation','Sephora','$42','Laura Mercier tinted moisturizer nude'), D('Highlighter','Sephora','$38','NARS highlighter orgasm')],
        lux: [D('Rouge Allure Lipstick','Sephora','$42','Chanel rouge allure lipstick women'), D('Serum Cushion','Sephora','$68','Armani luminous silk foundation'), D('Dior Lip Glow','Sephora','$38','Dior addict lip glow oil rose')]
      },
      fragrances: {
        aff: [D('Pink Friday EDT','Sephora','$28','paris hilton can can perfume women'), D('Floral Bouquet','Sephora','$32','elizabeth arden green tea perfume'), D('Sweet Pea Mist','Sephora','$18','victorias secret pure seduction mist')],
        mid: [D('La Vie Est Belle','Sephora','$98','lancome la vie est belle eau de parfum'), D('Bloom EDP','Sephora','$89','gucci bloom eau de parfum'), D('Chloe EDP','Sephora','$115','chloe eau de parfum rose')],
        lux: [D('Chanel N°5 EDP','Sephora','$185','chanel no 5 eau de parfum women'), D('Miss Dior Blooming','Sephora','$165','miss dior blooming bouquet perfume'), D('YSL Libre EDP','Sephora','$148','ysl libre eau de parfum women')]
      }
    },

    korean: {
      tops: {
        aff: [D('Cropped Pastel Cardigan','H&M','$29','cropped pastel cardigan korean fashion'), D('Fitted Polo Crop','SHEIN','$16','fitted polo crop top women korean'), D('Peter Pan Collar Blouse','SHEIN','$18','peter pan collar blouse women')],
        mid: [D('Knit Cardigan Beige','Uniqlo','$59','knit cardigan beige women'), D('Cashmere Polo Sweater','Uniqlo','$79','cashmere polo sweater women'), D('Cropped Blazer','COS','$79','cropped blazer women korean style')],
        lux: [D('Cashmere Cropped Cardigan','& Other Stories','$165','cashmere cropped cardigan women'), D('Fine-Knit Cardigan','COS','$125','fine knit cardigan women'), D('Silk Blouse','Reformation','$148','silk blouse women')]
      },
      pants: {
        aff: [D('Wide-Leg Trousers','H&M','$29','wide leg trousers women korean style'), D('High-Waist Straight Jeans','SHEIN','$28','high waist straight leg jeans women'), D('Plaid Trousers','SHEIN','$28','plaid trousers women korean')],
        mid: [D('High-Waist Wide Trousers','COS','$65','high waist wide trousers women'), D('Pleated Wide-Leg','Uniqlo','$55','pleated wide leg trousers women'), D('Barrel-Leg Jeans','ASOS','$65','barrel leg jeans women')],
        lux: [D('Tailored Wide-Leg','Aritzia','$148','tailored wide leg trousers women'), D('Clean Trousers','COS','$165','clean tailored trousers women'), D('Silk Wide-Leg','Toteme','$495','silk wide leg trousers women')]
      },
      skirts: {
        aff: [D('Pleated Mini Skirt','SHEIN','$22','pleated mini skirt schoolgirl women'), D('Plaid Mini Skirt','SHEIN','$22','plaid mini skirt women korean'), D('Tennis Skirt','H&M','$22','tennis skirt women white')],
        mid: [D('Pleated Mini Skirt','COS','$45','pleated mini skirt women'), D('Plaid Midi Skirt','ASOS','$55','plaid midi skirt women korean'), D('Wool Mini Skirt','Uniqlo','$49','wool mini skirt women')],
        lux: [D('Tailored Mini Skirt','Aritzia','$138','tailored mini skirt women'), D('Pleated Wool Skirt','COS','$145','pleated wool mini skirt women'), D('Leather Mini Skirt','Reformation','$198','leather mini skirt women')]
      },
      dresses: {
        aff: [D('A-Line Mini Dress','H&M','$29','a-line mini dress women korean'), D('Floral Wrap Dress','SHEIN','$25','floral wrap mini dress women'), D('Knit Mini Dress','SHEIN','$24','knit mini dress women cute')],
        mid: [D('Knit Midi Dress','COS','$79','knit midi dress women'), D('Shirt Mini Dress','ASOS','$55','shirt mini dress women'), D('Floral Midi Dress','& Other Stories','$129','floral midi dress women')],
        lux: [D('Silk Midi Dress','Reformation','$228','silk midi dress women'), D('Knit Dress','COS','$195','knit dress women'), D('Mini Dress','Aritzia','$178','mini dress women tailored')]
      },
      jackets: {
        aff: [D('Oversized Blazer','H&M','$35','oversized blazer women korean style'), D('Cropped Bomber','SHEIN','$32','cropped bomber jacket women'), D('Plaid Blazer','SHEIN','$32','plaid blazer women korean')],
        mid: [D('Oversized Blazer','COS','$115','oversized blazer women'), D('Wool Coat','Uniqlo','$149','wool coat women'), D('Denim Jacket','ASOS','$65','denim jacket women korean')],
        lux: [D('Structured Blazer','Aritzia','$228','structured blazer women'), D('Wool Coat','COS','$395','wool coat women'), D('Leather Jacket','A.P.C.','$695','leather jacket women')]
      },
      shoes: {
        aff: [D('White Sneakers','SHEIN','$35','white sneakers women korean fashion'), D('Platform Canvas Sneakers','H&M','$35','platform canvas sneakers white women'), D('Ballet Flats','SHEIN','$22','ballet flats women korean')],
        mid: [D('Chunky Mary Janes','Charles & Keith','$75','chunky mary jane shoes women'), D('Platform Loafers','COS','$89','platform loafers women'), D('Leather Sneakers','& Other Stories','$149','leather sneakers women white')],
        lux: [D('Leather Mary Janes','Reformation','$248','leather mary jane shoes women'), D('Platform Shoes','A.P.C.','$345','platform shoes women'), D('Leather Ballet Flats','Toteme','$395','leather ballet flats women')]
      },
      boots: {
        aff: [D('Short Ankle Boots','H&M','$42','short ankle boots women korean'), D('Chelsea Boots','SHEIN','$42','chelsea boots women black'), D('Platform Boots','SHEIN','$39','platform boots women chunky')],
        mid: [D('Chunky Boots','COS','$119','chunky ankle boots women'), D('Lug-Sole Boots','ASOS','$95','lug sole boots women'), D('Platform Boots','Charles & Keith','$89','platform boots women')],
        lux: [D('Leather Ankle Boots','A.P.C.','$495','leather ankle boots women'), D('Chelsea Boots','Toteme','$595','leather chelsea boots women'), D('Platform Boots','Reformation','$298','platform boots women')]
      },
      bags: {
        aff: [D('Mini Pearl Shoulder Bag','H&M','$28','mini pearl shoulder bag women'), D('Quilted Chain Bag','SHEIN','$25','quilted chain shoulder bag women'), D('Mini Zipper Bag','SHEIN','$16','mini zipper shoulder bag cute women')],
        mid: [D('Mini Shoulder Bag','Charles & Keith','$89','mini shoulder bag women'), D('Quilted Mini Bag','COS','$89','quilted mini leather bag women'), D('Bucket Bag','& Other Stories','$99','bucket bag women small')],
        lux: [D('Mini Top Handle Bag','JW PEI','$88','mini top handle bag women leather'), D('Leather Mini Bag','A.P.C.','$345','leather mini bag women'), D('Mini Quilted','Toteme','$495','mini quilted leather bag women')]
      },
      jewelry: {
        aff: [D('Pearl Hair Clips Set','SHEIN','$8','pearl hair clips set women korean'), D('Dainty Gold Hoops','H&M','$9','dainty gold hoop earrings women'), D('Bow Hair Clip Set','H&M','$8','bow hair clip set women korean')],
        mid: [D('Pearl Hair Pin','& Other Stories','$35','pearl hair pin gold women'), D('Satin Ribbon Clip','& Other Stories','$25','satin ribbon hair clip women'), D('Gold Chain Necklace','Mejuri','$65','gold chain necklace women dainty')],
        lux: [D('Pearl Hair Pin Gold','Mejuri','$98','pearl hair pin gold women'), D('Diamond Studs','Mejuri','$248','diamond stud earrings women gold'), D('Pearl Necklace','Tiffany & Co.','$295','pearl necklace women tiffany')]
      },
      accessories: {
        aff: [D('Satin Ribbon Headband','SHEIN','$6','satin ribbon headband women korean'), D('Mini Tote Bag','H&M','$18','mini tote bag women cute'), D('Clear Frame Sunglasses','ASOS','$15','clear frame glasses women korean')],
        mid: [D('Satin Scrunchie Set','& Other Stories','$20','satin scrunchie set women'), D('Mini Shoulder Bag','Charles & Keith','$45','mini shoulder bag women korean'), D('Wire-Frame Sunglasses','COS','$29','wire frame sunglasses women')],
        lux: [D('Silk Scarf','Toteme','$295','silk scarf women'), D('Leather Gloves','A.P.C.','$195','leather gloves women'), D('Sunglasses','Acne Studios','$295','sunglasses women minimal')]
      },
      makeup: {
        aff: [D('Glass Skin Primer','Sephora','$16','e.l.f. power grip primer'), D('Cushion Foundation','Sephora','$22','Missha magic cushion foundation'), D('Lip Tint','Sephora','$14','Romand juicy lasting tint')],
        mid: [D('Dewy Foundation','Sephora','$42','Fenty Beauty skin tint foundation'), D('Blush & Highlighter','Sephora','$38','Rare Beauty soft pinch liquid blush'), D('Cushion Lip Tint','Sephora','$32','Laneige lip sleeping mask')],
        lux: [D('Skin Perfecting Foundation','Sephora','$68','Armani luminous silk cushion foundation'), D('Serum Concealer','Sephora','$55','NARS radiant creamy concealer'), D('Glow Setting Powder','Sephora','$62','Charlotte Tilbury setting powder')]
      },
      fragrances: {
        aff: [D('Cherry Blossom Mist','Sephora','$18','bath and body works japanese cherry blossom'), D('Floral Youth EDT','Sephora','$28','clean beauty collective women perfume'), D('Pear & Lily Mist','Sephora','$22','bodycology pear blossom mist')],
        mid: [D('Bloom Florale','Sephora','$89','gucci bloom acqua di fiori'), D('Miss Dior Rose','Sephora','$125','miss dior rose n roses perfume'), D('Daisy EDT','Sephora','$95','marc jacobs daisy eau de toilette')],
        lux: [D('Chanel Chance Tender','Sephora','$185','chanel chance eau tendre perfume'), D('Chloe Rose EDP','Sephora','$135','chloe rose de chloe perfume'), D('YSL Mon Paris','Sephora','$148','ysl mon paris eau de parfum')]
      }
    },

    y2k: {
      tops: {
        aff: [D('Baby Tee Crop','SHEIN','$12','baby tee y2k crop top women'), D('Mesh Long-Sleeve Top','SHEIN','$15','mesh long sleeve top women y2k'), D('Sequin Crop Top','SHEIN','$18','sequin crop top y2k women')],
        mid: [D('Mesh Long-Sleeve Top','Princess Polly','$45','mesh long sleeve top women'), D('Corset Bustier Top','Princess Polly','$59','corset bustier top y2k women'), D('Halter Neck Top','Urban Outfitters','$45','halter neck top women y2k')],
        lux: [D('Logo Crop Top','Jacquemus','$295','logo crop top women'), D('Crystal Bralette','Jacquemus','$395','crystal bralette top women designer'), D('Bodycon Top','Acne Studios','$245','fitted bodycon top women')]
      },
      pants: {
        aff: [D('Low-Rise Flare Jeans','SHEIN','$28','low rise flare jeans women y2k'), D('Wide-Leg Cargo Pants','SHEIN','$28','wide leg cargo pants women y2k'), D('Track Pants','H&M','$30','track pants women y2k')],
        mid: [D('Low-Rise Flare Jeans','ASOS','$65','low rise flare jeans women'), D('Low-Rise Flare Trousers','Princess Polly','$75','low rise flare trousers women'), D('Embroidered Jeans','Urban Outfitters','$89','embroidered jeans women y2k')],
        lux: [D('Low-Rise Denim','Acne Studios','$395','low rise jeans women designer'), D('Designer Flare Jeans','Jacquemus','$495','flare jeans women designer'), D('Wide-Leg Trousers','Jacquemus','$395','wide leg trousers women')]
      },
      skirts: {
        aff: [D('Micro Denim Mini Skirt','SHEIN','$18','micro denim mini skirt women y2k'), D('Pleated Mini Skirt','SHEIN','$18','pleated mini skirt women y2k'), D('Butterfly Skirt','SHEIN','$22','butterfly print mini skirt women')],
        mid: [D('Denim Mini Skirt','Urban Outfitters','$65','low rise denim mini skirt y2k'), D('Satin Mini Skirt','Princess Polly','$55','satin mini skirt women y2k'), D('Wrap Mini Skirt','ASOS','$49','wrap mini skirt y2k women')],
        lux: [D('Denim Mini','Acne Studios','$295','denim mini skirt women designer'), D('Mini Skirt','Jacquemus','$395','mini skirt women designer'), D('Leather Mini Skirt','A.P.C.','$245','leather mini skirt women')]
      },
      dresses: {
        aff: [D('Bodycon Mini Dress','SHEIN','$20','bodycon mini dress women y2k'), D('Slip Dress Metallic','SHEIN','$25','metallic slip dress women y2k'), D('Velour Mini Dress','ASOS','$38','velour mini dress women y2k')],
        mid: [D('Slip Dress','Princess Polly','$79','slip dress women y2k'), D('Bodycon Dress','Urban Outfitters','$75','bodycon mini dress women'), D('Ruched Mini Dress','ASOS','$65','ruched mini dress women y2k')],
        lux: [D('Mini Dress','Jacquemus','$495','mini dress women designer'), D('Velvet Dress','Acne Studios','$595','velvet dress women'), D('Fitted Dress','Reformation','$228','fitted mini dress women')]
      },
      jackets: {
        aff: [D('Vinyl Trench Coat','SHEIN','$45','vinyl trench coat women y2k'), D('Faux Fur Jacket','SHEIN','$35','faux fur jacket women y2k'), D('Bomber Jacket','H&M','$45','bomber jacket women y2k')],
        mid: [D('Cropped Faux-Fur','Urban Outfitters','$89','cropped faux fur jacket women'), D('Shacket','Princess Polly','$79','oversized shacket women y2k'), D('Vinyl Jacket','ASOS','$75','vinyl jacket women y2k')],
        lux: [D('Leather Jacket','Acne Studios','$1095','leather jacket women y2k'), D('Mini Jacket','Jacquemus','$695','mini jacket women designer'), D('Fur-Trim Coat','A.P.C.','$695','fur trim coat women')]
      },
      shoes: {
        aff: [D('Platform Sneakers','H&M','$42','platform sneakers chunky women y2k'), D('Pointed Kitten Heels','SHEIN','$28','pointy kitten heels women y2k'), D('Platform Mules','ASOS','$38','platform mules women y2k')],
        mid: [D('Pointy Kitten Heels','ASOS','$65','pointy kitten heels women'), D('Platform Sneakers','Princess Polly','$79','platform sneakers women chunky'), D('Mary Janes','Urban Outfitters','$75','mary jane shoes women y2k')],
        lux: [D('Pointed Stiletto Heels','Jacquemus','$595','pointed stiletto heels women designer'), D('Crystal Shoes','Jacquemus','$695','crystal embellished shoes women'), D('Platform Boots','Acne Studios','$695','platform shoes women designer')]
      },
      boots: {
        aff: [D('Platform Boots','SHEIN','$42','platform boots women y2k chunky'), D('Knee-High Boots','SHEIN','$45','knee high boots women y2k'), D('Vinyl Thigh-High Boots','ASOS','$55','vinyl thigh high boots women y2k')],
        mid: [D('Platform Knee Boots','ASOS','$89','platform knee high boots women'), D('Square-Toe Boots','Urban Outfitters','$119','square toe boots women y2k'), D('Platform Chelsea','Princess Polly','$95','platform chelsea boots women')],
        lux: [D('Tall Boots','Jacquemus','$895','tall boots women designer'), D('Platform Boots','Acne Studios','$795','platform boots women designer'), D('Knee-High','A.P.C.','$595','knee high boots women')]
      },
      bags: {
        aff: [D('Mini Pink Shoulder Bag','SHEIN','$18','mini shoulder bag y2k pink women'), D('Rhinestone Mini Bag','SHEIN','$12','rhinestone mini bag y2k women'), D('Mini Baguette Bag','SHEIN','$18','mini baguette bag y2k women')],
        mid: [D('Mini Baguette Bag','ASOS','$45','mini baguette bag y2k women'), D('Mini Faux-Fur Bag','Urban Outfitters','$58','mini faux fur bag y2k women'), D('Croc-Embossed Mini','Princess Polly','$55','croc embossed mini bag women y2k')],
        lux: [D('Designer Mini Baguette','Jacquemus','$495','mini baguette bag women designer'), D('Le Chiquito','Jacquemus','$595','le chiquito bag jacquemus'), D('Micro Bag','Acne Studios','$595','micro bag women designer')]
      },
      jewelry: {
        aff: [D('Butterfly Hair Clips','SHEIN','$6','butterfly hair clips y2k women'), D('Rhinestone Choker','SHEIN','$8','rhinestone choker necklace y2k women'), D('Colorful Hoop Set','SHEIN','$10','colorful hoop earrings set y2k')],
        mid: [D('Tinted Designer-Look Sunglasses','Urban Outfitters','$25','tinted oval sunglasses women y2k'), D('Crystal Choker','Urban Outfitters','$28','crystal choker necklace y2k women'), D('Charm Bracelet','Princess Polly','$35','charm bracelet women y2k')],
        lux: [D('Tinted Sunglasses','Acne Studios','$295','tinted sunglasses women designer'), D('Crystal Earrings','Jacquemus','$345','crystal earrings women designer'), D('Gold Hoops','Mejuri','$148','gold hoop earrings women bold')]
      },
      accessories: {
        aff: [D('Tinted Visor Cap','SHEIN','$10','y2k tinted visor cap women'), D('Feather Boa','AliExpress','$8','feather boa pink y2k women'), D('Mini Claw Clips Set','H&M','$6','mini claw clips set y2k women')],
        mid: [D('Oval Sunglasses','Urban Outfitters','$25','oval tinted sunglasses women y2k'), D('Mini Backpack','Princess Polly','$55','mini backpack women y2k'), D('Baguette Belt','ASOS','$32','baguette belt bag women y2k')],
        lux: [D('Logo Sunglasses','Acne Studios','$295','logo sunglasses women designer'), D('Embellished Belt','Jacquemus','$295','embellished belt women designer'), D('Chain Belt','A.P.C.','$195','chain belt women')]
      },
      makeup: {
        aff: [D('Holographic Glitter','Sephora','$12','NYX face glitter body glitter women'), D('Gloss Lip Balm','Sephora','$10','Laneige lip sleeping mask tinted'), D('Shimmer Eye Shadow','Sephora','$14','e.l.f. glitter eyeshadow palette')],
        mid: [D('Glossy Lip Plumper','Sephora','$26','Too Faced lip injection gloss plumper'), D('Iridescent Highlighter','Sephora','$38','Charlotte Tilbury Hollywood flawless filter'), D('Sheer Foundation','Sephora','$42','Fenty Beauty skin tint foundation')],
        lux: [D('Dior Lip Maximizer','Sephora','$38','Dior addict lip maximizer plumping gloss'), D('Armani Luminous Foundation','Sephora','$68','Armani luminous silk foundation'), D('YSL Candy Glaze Lip','Sephora','$38','YSL candy glaze lip gloss stick')]
      },
      fragrances: {
        aff: [D('VS Bombshell Body Mist','Sephora','$22','victorias secret bombshell body mist'), D('Juicy Couture EDT','Sephora','$68','juicy couture viva la juicy perfume'), D('Paris Hilton EDP','Sephora','$32','paris hilton can can perfume')],
        mid: [D('Viva La Juicy','Sephora','$89','juicy couture viva la juicy perfume women'), D('Princess Polly','Sephora','$75','vera wang princess perfume women'), D('Ariana Grande Cloud','Sephora','$75','ariana grande cloud perfume women')],
        lux: [D('Prada Candy','Sephora','$148','prada candy perfume women'), D('Versace Bright Crystal','Sephora','$125','versace bright crystal perfume women'), D('YSL Black Opium','Sephora','$148','ysl black opium perfume women')]
      }
    },

    vintage: {
      tops: {
        aff: [D('Prairie Blouse Cream','SHEIN','$22','prairie blouse vintage cream women'), D('Paisley Print Blouse','H&M','$28','paisley print blouse women vintage'), D('Ribbed Turtleneck','ASOS','$22','ribbed turtleneck women vintage')],
        mid: [D('70s Style Blouse','Free People','$98','70s style blouse women vintage'), D('Paisley Blouse','Urban Outfitters','$65','paisley print blouse women'), D('Vintage-Look Knit','ASOS','$55','vintage look knit top women')],
        lux: [D('Silk Romantic Blouse','Reformation','$178','silk romantic blouse women vintage'), D('Broderie Blouse','Sézane','$148','broderie blouse women vintage'), D('Prairie Blouse','Free People','$138','prairie blouse women premium')]
      },
      pants: {
        aff: [D('High-Waist Flare Jeans','SHEIN','$32','high waist flare jeans 70s vintage women'), D('Corduroy Wide-Leg','H&M','$38','corduroy wide leg trousers women vintage'), D('Patchwork Jeans','ASOS','$38','patchwork jeans women vintage')],
        mid: [D('High-Waist Flare Trousers','COS','$85','high waist flare trousers women vintage'), D('Corduroy Flare Pants','Urban Outfitters','$79','corduroy flare pants women'), D('70s Flare Jeans','ASOS','$69','70s style flare jeans women')],
        lux: [D('Wide-Leg Wool Trousers','Reformation','$228','wide leg wool trousers women vintage'), D('Flare Jeans','Levis','$168','flare jeans women premium vintage wash'), D('Corduroy Flare','Free People','$138','corduroy flare pants women premium')]
      },
      skirts: {
        aff: [D('Corduroy A-Line Skirt','SHEIN','$28','corduroy a-line skirt vintage women'), D('Denim Midi Skirt','H&M','$35','denim midi skirt women vintage'), D('Suede Mini Skirt','ASOS','$30','suede mini skirt women vintage')],
        mid: [D('Corduroy Midi Skirt','Urban Outfitters','$75','corduroy midi skirt women'), D('Suede Midi Skirt','Free People','$98','suede midi skirt women vintage'), D('A-Line Midi Skirt','ASOS','$59','vintage a-line midi skirt women')],
        lux: [D('Corduroy Midi Skirt','Reformation','$178','corduroy midi skirt women'), D('Suede Skirt','Free People','$168','suede skirt women premium vintage'), D('Wool Midi Skirt','Sézane','$148','wool midi skirt women vintage')]
      },
      dresses: {
        aff: [D('Floral Midi Dress','SHEIN','$28','floral midi dress vintage women 70s'), D('Prairie Dress','H&M','$38','prairie dress women vintage boho'), D('Smocked Maxi Dress','ASOS','$35','smocked maxi dress women vintage')],
        mid: [D('70s Wrap Dress','Free People','$128','70s wrap dress women vintage'), D('Floral Maxi Dress','Urban Outfitters','$89','floral maxi dress women vintage boho'), D('Prairie Midi Dress','ASOS','$75','prairie midi dress women vintage')],
        lux: [D('Floral Midi Dress','Reformation','$248','floral midi dress women vintage'), D('Prairie Dress','Sézane','$198','prairie dress women premium'), D('Wrap Maxi Dress','Free People','$178','wrap maxi dress women vintage')]
      },
      jackets: {
        aff: [D('Faux Suede Jacket','H&M','$55','faux suede jacket women vintage'), D('Corduroy Blazer','SHEIN','$38','corduroy blazer women vintage'), D('Denim Jacket','ASOS','$42','vintage wash denim jacket women')],
        mid: [D('Suede Fringe Jacket','Free People','$198','suede fringe jacket women vintage'), D('Vintage Denim Jacket','Urban Outfitters','$75','vintage wash denim jacket women'), D('Corduroy Jacket','ASOS','$89','corduroy jacket women vintage')],
        lux: [D('Suede Jacket','Free People','$268','suede jacket women premium vintage'), D('Shearling Jacket','Acne Studios','$1295','shearling jacket women'), D('Leather Jacket','A.P.C.','$695','leather jacket women vintage')]
      },
      shoes: {
        aff: [D('Suede Ankle Boots','SHEIN','$45','suede ankle boots vintage women'), D('Brown Suede Loafers','H&M','$45','brown suede loafers vintage women'), D('Square-Toe Flats','ASOS','$32','square toe flats women vintage')],
        mid: [D('Tan Suede Knee Boots','COS','$129','suede knee high boots tan women'), D('Vintage Loafers','Urban Outfitters','$89','vintage loafers women 70s'), D('Suede Block Heels','Free People','$98','suede block heel shoes women vintage')],
        lux: [D('Tall Suede Boots','Acne Studios','$595','tall suede boots tan women'), D('Leather Loafers','A.P.C.','$395','leather loafers women vintage'), D('Block Heel Boots','Reformation','$298','block heel boots women vintage')]
      },
      boots: {
        aff: [D('Suede Ankle Boots','H&M','$55','suede ankle boots women vintage'), D('Knee-High Boots','SHEIN','$48','knee high boots women vintage'), D('Cowboy Boots','ASOS','$58','cowboy boots women vintage')],
        mid: [D('Tan Suede Platform Boots','COS','$129','tan suede platform boots vintage women'), D('Dr. Martens 1460','Dr. Martens','$179','dr martens 1460 cherry red women'), D('Cowboy Boots','Urban Outfitters','$149','cowboy boots women vintage')],
        lux: [D('Suede Boots','Acne Studios','$895','suede boots women vintage'), D('Leather Cowboy Boots','Reformation','$398','leather cowboy boots women'), D('Tall Boots','A.P.C.','$695','tall leather boots women')]
      },
      bags: {
        aff: [D('Leather Satchel Tan','SHEIN','$35','leather satchel bag vintage tan women'), D('Woven Bucket Bag','Etsy','$38','woven bucket bag vintage women'), D('Fringe Crossbody','H&M','$38','fringe crossbody bag women vintage')],
        mid: [D('Vintage Leather Crossbody','Etsy','$95','vintage leather crossbody bag women'), D('Suede Shoulder Bag','Free People','$98','suede shoulder bag women vintage'), D('Vintage Leather Satchel','Depop','$75','vintage leather satchel bag women')],
        lux: [D('Leather Shoulder Bag','A.P.C.','$425','leather shoulder bag women vintage'), D('Saddle Bag','Sézane','$298','saddle bag women leather vintage'), D('Structured Satchel','Reformation','$328','structured leather satchel women')]
      },
      jewelry: {
        aff: [D('Wide Leather Belt','H&M','$18','wide leather belt women vintage'), D('Round Vintage Sunglasses','SHEIN','$8','round retro sunglasses vintage women'), D('Large Gold Hoops','H&M','$10','large gold hoop earrings vintage women')],
        mid: [D('Large Gold Hoops','Mejuri','$85','gold hoop earrings large women'), D('Retro Hoop Earrings','Urban Outfitters','$32','retro gold hoop earrings vintage women'), D('Layered Necklace','& Other Stories','$45','layered necklace gold women vintage')],
        lux: [D('Statement Gold Earrings','Mejuri','$248','gold statement earrings women vintage'), D('Hammered Gold Hoops','Mejuri','$198','hammered gold hoop earrings women'), D('Diamond Studs','Mejuri','$395','diamond stud earrings women gold')]
      },
      accessories: {
        aff: [D('Wide-Brim Hat','H&M','$18','wide brim hat women vintage'), D('Floral Silk Scarf','SHEIN','$12','floral silk scarf women vintage'), D('Vintage Sunglasses','Depop','$15','vintage sunglasses women round')],
        mid: [D('Suede Hat','Free People','$65','suede hat women vintage'), D('Paisley Scarf','Urban Outfitters','$35','paisley scarf women vintage'), D('Retro Sunglasses','& Other Stories','$55','retro sunglasses women vintage')],
        lux: [D('Cashmere Hat','Toteme','$195','cashmere hat women'), D('Vintage Silk Scarf','Etsy','$95','vintage silk scarf women hermes style'), D('Leather Hat','Free People','$128','leather hat women vintage')]
      },
      makeup: {
        aff: [D('Sheer Lipstick','Sephora','$14','e.l.f. sheer lipstick vintage rose'), D('Brown Eyeliner','Sephora','$10','essence brown pencil eyeliner women'), D('Peachy Blush','Sephora','$12','NYX cream blush peach')],
        mid: [D('Vintage Rose Lipstick','Sephora','$38','Charlotte Tilbury pillowtalk lipstick'), D('Brown Mascara','Sephora','$32','Benefit bad gal bang mascara brown'), D('Sun-Kissed Bronzer','Sephora','$42','NARS bronzer laguna')],
        lux: [D('Chanel Rouge Coco Lip','Sephora','$42','Chanel rouge coco lip blush'), D('Guerlain Meteorites','Sephora','$68','Guerlain meteorites powder pearls'), D('Burberry Lip Velvet','Sephora','$42','Burberry velvet lip colour')]
      },
      fragrances: {
        aff: [D('Patchouli Musk Spray','Sephora','$24','patchouli body spray women vintage'), D('Warm Amber EDT','Sephora','$28','elizabeth arden red door perfume vintage'), D('Sandalwood Mist','Sephora','$18','bath body works warm sandalwood')],
        mid: [D('Santal 26 Candle','Sephora','$65','le labo santal 26 candle'), D('Musc Ravageur','Sephora','$185','frederic malle musc ravageur'), D('Fleurs de Magnolia','Sephora','$125','chanel les exclusifs magnolia')],
        lux: [D('Maison Magnolia','Sephora','$195','maison margiela replica magnolia'), D('Tom Ford Neroli','Sephora','$265','tom ford neroli portofino perfume women'), D('Chanel Coco Mademoiselle','Sephora','$185','chanel coco mademoiselle eau de parfum')]
      }
    },

    softgirl: {
      tops: {
        aff: [D('Lace-Trim Camisole Pink','SHEIN','$14','lace trim camisole pink women soft girl'), D('Ruffle Floral Blouse','SHEIN','$18','ruffle floral blouse women soft girl'), D('Bow-Tie Crop Top','H&M','$18','bow tie crop top women pastel')],
        mid: [D('Lace-Trim Cami Top','Reformation','$98','lace trim cami top women'), D('Floral Lace Blouse','& Other Stories','$79','floral lace blouse women romantic'), D('Ribbon Trim Blouse','COS','$65','ribbon trim blouse women soft girl')],
        lux: [D('Silk Bow Camisole','Reformation','$148','silk bow camisole women romantic'), D('Lace Blouse','Sézane','$165','lace blouse women romantic'), D('Ruffled Silk Top','Jacquemus','$395','ruffled silk top women')]
      },
      pants: {
        aff: [D('Pastel Wide-Leg Trousers','H&M','$29','pastel wide leg trousers women soft girl'), D('Floral Wide-Leg','SHEIN','$28','floral wide leg pants women'), D('Lace-Trim Pyjama Pants','H&M','$25','lace trim pyjama pants women pastel')],
        mid: [D('Floral Trousers','COS','$69','floral trousers women romantic'), D('Linen Trousers Cream','& Other Stories','$95','linen trousers cream women soft'), D('Wide-Leg Trousers Blush','ASOS','$55','wide leg trousers blush pink women')],
        lux: [D('Silk Trousers','Reformation','$198','silk trousers women pastel'), D('Floral Wide-Leg','& Other Stories','$145','floral wide leg trousers women'), D('Pleated Trousers','Jacquemus','$495','pleated trousers women pink')]
      },
      skirts: {
        aff: [D('Pleated Mini Skirt Pastel','SHEIN','$22','pleated mini skirt pastel pink women'), D('Floral Midi Skirt','SHEIN','$22','floral midi skirt women soft girl'), D('Tulle Mini Skirt Pink','H&M','$28','tulle mini skirt pink women')],
        mid: [D('Pleated Midi Skirt Pastel','& Other Stories','$95','pleated midi skirt pastel women romantic'), D('Tulle Mini Skirt','COS','$69','tulle mini skirt pink women'), D('Floral Midi Skirt','ASOS','$55','floral midi skirt women romantic')],
        lux: [D('Tulle Midi Skirt','Reformation','$228','tulle midi skirt women romantic'), D('Floral Satin Midi','Toteme','$395','floral satin midi skirt women'), D('Crystal-Hem Skirt','Jacquemus','$595','crystal hem skirt women pink')]
      },
      dresses: {
        aff: [D('Floral Mini Dress','SHEIN','$25','floral mini dress women soft girl'), D('Smocked Midi Dress','H&M','$38','smocked midi dress women romantic'), D('Lace-Trim Sundress','H&M','$35','lace trim sundress women pastel')],
        mid: [D('Floral Midi Dress','& Other Stories','$145','floral midi dress women romantic'), D('Lace Midi Dress','COS','$89','lace midi dress women soft girl'), D('Smocked Floral Midi','ASOS','$69','smocked floral midi dress women')],
        lux: [D('Floral Midi Dress','Reformation','$248','floral midi dress romantic women'), D('Lace Dress','Sézane','$198','lace dress women romantic'), D('Tulle Dress','Jacquemus','$695','tulle dress women pink designer')]
      },
      jackets: {
        aff: [D('Cropped Pastel Cardigan','H&M','$25','cropped cardigan pastel women soft girl'), D('Floral Bomber Jacket','SHEIN','$35','floral bomber jacket women'), D('Fluffy Fleece Jacket','H&M','$38','fluffy fleece jacket women pastel')],
        mid: [D('Lace-Trim Blazer','COS','$89','lace trim blazer women soft girl'), D('Pastel Trench Coat','& Other Stories','$175','pastel trench coat women soft girl'), D('Floral Bomber','Urban Outfitters','$79','floral bomber jacket women')],
        lux: [D('Cropped Lace Jacket','Reformation','$198','cropped lace jacket women'), D('Tulle Jacket','Jacquemus','$695','tulle jacket women designer'), D('Pink Blazer','Acne Studios','$595','pink blazer women')]
      },
      shoes: {
        aff: [D('Ballet Flats with Ribbon','SHEIN','$28','ballet flats with ribbon ties women'), D('Mary Jane Flats','H&M','$29','mary jane flats women pink'), D('Kitten Heels Blush','H&M','$38','kitten heels blush pink women')],
        mid: [D('Ribbon Ballet Flats','COS','$69','ribbon ballet flats women'), D('Pearl Mary Janes','Charles & Keith','$75','pearl mary jane shoes women'), D('Satin Mules','& Other Stories','$95','satin mules women soft girl')],
        lux: [D('Crystal Ballet Flats','Jacquemus','$395','crystal embellished ballet flats women'), D('Satin Heels','Reformation','$248','satin heels women romantic'), D('Leather Mary Janes','Toteme','$395','leather mary jane shoes women')]
      },
      boots: {
        aff: [D('Lace-Up Ankle Boots','H&M','$48','lace up ankle boots women soft girl'), D('Pastel Chelsea Boots','H&M','$42','pastel chelsea boots women'), D('Kitten Heel Boots','SHEIN','$38','kitten heel ankle boots women')],
        mid: [D('Mary Jane Boots','COS','$119','mary jane boots women soft girl'), D('Lace-Up Boots','& Other Stories','$195','lace up boots women'), D('Heeled Ankle Boots','ASOS','$89','heeled ankle boots women soft girl')],
        lux: [D('Leather Ankle Boots','Reformation','$298','leather ankle boots women soft girl'), D('Satin Boots','Jacquemus','$695','satin boots women designer'), D('Mary Jane Boots','Toteme','$595','mary jane boots women')]
      },
      bags: {
        aff: [D('Quilted Mini Bag Pink','SHEIN','$25','quilted mini shoulder bag pink women'), D('Pearl-Strap Mini Bag','H&M','$22','pearl strap mini shoulder bag women'), D('Heart-Lock Bag','H&M','$22','heart lock mini bag women soft girl')],
        mid: [D('Quilted Pink Shoulder Bag','Charles & Keith','$89','pink quilted shoulder bag women'), D('Pearl-Strap Bag','& Other Stories','$89','pearl strap shoulder bag women'), D('Mini Flap Bag','COS','$79','mini flap bag women pink')],
        lux: [D('Mini Quilted Chain Bag','JW PEI','$88','mini quilted chain shoulder bag women soft girl'), D('Satin Mini Bag','Jacquemus','$495','satin mini bag women designer'), D('Quilted Shoulder Bag','Toteme','$595','quilted shoulder bag women pink')]
      },
      jewelry: {
        aff: [D('Pearl Hair Bow','SHEIN','$8','pearl hair bow clip pastel women'), D('Heart Pendant Necklace','H&M','$10','heart pendant necklace women soft girl'), D('Pearl Drop Earrings','SHEIN','$8','pearl drop earrings women soft girl')],
        mid: [D('Pearl Heart Necklace','Pandora','$85','pearl heart pendant necklace women'), D('Pearl Drop Earrings','& Other Stories','$45','pearl drop earrings women romantic'), D('Bow Ring','COS','$25','bow ring women soft girl')],
        lux: [D('Pearl Drop Earrings','Tiffany & Co.','$395','pearl drop earrings tiffany women'), D('Pearl Choker','Mejuri','$198','pearl choker necklace women'), D('Diamond Heart Ring','Mejuri','$295','diamond heart ring women')]
      },
      accessories: {
        aff: [D('Satin Hair Ribbons Set','SHEIN','$6','satin hair ribbons set women soft girl'), D('Pearl Headband','H&M','$9','pearl headband women soft girl'), D('Mini Bow Claw Clips','H&M','$8','mini bow claw clips women pastel')],
        mid: [D('Satin Hair Bow','COS','$22','satin hair bow women'), D('Ribbon Headband','& Other Stories','$28','ribbon headband women soft girl'), D('Pearl Sunglasses','Urban Outfitters','$30','pearl trim sunglasses women soft girl')],
        lux: [D('Silk Ribbon Bow','Toteme','$95','silk ribbon bow women'), D('Pearl Hair Pin','Mejuri','$98','pearl hair pin gold women'), D('Sunglasses','Jacquemus','$295','sunglasses women romantic pink')]
      },
      makeup: {
        aff: [D('Pink Blush','Sephora','$14','e.l.f. monochromatic multi-stick pink blush'), D('Cherry Lip Tint','Sephora','$10','Laneige lip sleeping mask berry'), D('Dewy Setting Spray','Sephora','$12','NYX dewy setting spray women')],
        mid: [D('Soft Pinch Blush','Sephora','$36','Rare Beauty soft pinch liquid blush rose'), D('Lash & Brow Serum','Sephora','$58','Grande Lash serum mascara women'), D('Satin Lip Liner','Sephora','$28','Charlotte Tilbury lip liner pillowtalk rose')],
        lux: [D('Dior Lip Glow Rose','Sephora','$38','Dior addict lip glow oil rose women'), D('Charlotte Tilbury Blush','Sephora','$50','Charlotte Tilbury glowgasm blush palette'), D('YSL Lash Clash Mascara','Sephora','$42','YSL lash clash mascara women')]
      },
      fragrances: {
        aff: [D('VS Bombshell Mist','Sephora','$22','victorias secret bombshell body mist women'), D('Cherry Blossom Mist','Sephora','$18','bath and body works japanese cherry blossom'), D('Pink Sugar EDT','Sephora','$38','Aquolina pink sugar perfume women')],
        mid: [D('Daisy by Marc Jacobs','Sephora','$95','marc jacobs daisy eau de toilette women'), D('Chloe Rose De Chloe','Sephora','$125','chloe rose de chloe perfume women'), D('YSL Mon Paris','Sephora','$135','ysl mon paris eau de parfum women')],
        lux: [D('Chanel Chance Tender','Sephora','$185','chanel chance eau tendre perfume women'), D('Miss Dior Blooming','Sephora','$165','miss dior blooming bouquet perfume women'), D('Guerlain Mon Guerlain','Sephora','$145','mon guerlain eau de parfum women')]
      }
    },
    hijabicore: {
      tops: {
        aff: [D('Long-Sleeve Modest Top','SHEIN','$15','long sleeve modest top women neutral'), D('Loose Cotton Long-Sleeve Tee','Uniqlo','$25','loose cotton long sleeve tee women modest'), D('Oversized Cotton Shirt','H&M','$30','oversized cotton button down shirt women modest')],
        mid: [D('Brown Ribbed Turtleneck','Uniqlo','$39','brown ribbed turtleneck sweater women modest'), D('Oversized Knit Sweater','COS','$135','cream oversized fluffy knit sweater women'), D('Silk Long-Sleeve Blouse','Zara','$69','silk long sleeve blouse women modest neutral')],
        lux: [D('Cashmere Crewneck','COS','$245','cashmere crewneck sweater women neutral'), D('Silk Tunic Top','Toteme','$395','silk tunic top women long sleeve'), D('Wool Knit Pullover','Acne Studios','$495','wool knit pullover women oversized')]
      },
      pants: {
        aff: [D('Modest Wide-Leg Trousers','H&M','$35','modest wide leg trousers women neutral'), D('Loose-Fit Linen Pants','Uniqlo','$45','loose fit linen pants women modest'), D('Dark Indigo Wide-Leg Jeans','Uniqlo','$49','dark indigo high waist wide leg jeans women modest')],
        mid: [D('Tailored Wide-Leg Trousers','COS','$135','tailored wide leg trousers women modest'), D('Pleated Fluid Trousers','Zara','$69','pleated fluid wide leg trousers women modest'), D('Wool Tapered Trousers','COS','$165','wool tapered trousers women modest')],
        lux: [D('Wool Wide-Leg','Toteme','$395','wool wide leg trousers women neutral'), D('Tailored Trousers','Acne Studios','$495','tailored wool trousers women'), D('Silk Trousers','Jacquemus','$595','silk wide leg trousers women')]
      },
      skirts: {
        aff: [D('Long Pleated Maxi Skirt','H&M','$45','long pleated maxi skirt women modest'), D('Linen Tiered Maxi','SHEIN','$28','white linen tiered maxi skirt women modest'), D('Satin Bias-Cut Maxi','Zara','$59','satin bias cut maxi skirt women modest beige')],
        mid: [D('Charcoal Pleated Maxi','COS','$135','charcoal pleated maxi skirt women modest'), D('Wool Maxi Skirt','Zara','$89','wool maxi skirt women modest neutral'), D('Brown Pinstripe Maxi','Zara','$59','brown pinstripe wool blend maxi skirt women modest')],
        lux: [D('Silk Maxi Skirt','Toteme','$495','silk maxi skirt women neutral modest'), D('Pleated Maxi','Acne Studios','$595','pleated maxi skirt women modest long'), D('Linen Maxi Skirt','Jacquemus','$395','linen maxi skirt women modest')]
      },
      dresses: {
        aff: [D('Long-Sleeve Modest Maxi','SHEIN','$24','long sleeve modest maxi dress women neutral'), D('Linen Long-Sleeve Maxi','H&M','$59','linen long sleeve maxi dress women modest'), D('Belted Modest Dress','Uniqlo','$59','belted long sleeve modest dress women neutral')],
        mid: [D('Long-Sleeve Wrap Dress','COS','$165','long sleeve wrap maxi dress women modest'), D('Modest Shirt Dress','Zara','$89','modest shirt dress women long sleeve'), D('Long-Sleeve Knit Dress','COS','$185','long sleeve knit maxi dress women modest neutral')],
        lux: [D('Long-Sleeve Silk Maxi','Toteme','$695','long sleeve silk maxi dress women modest'), D('Wool Maxi Dress','Acne Studios','$895','wool maxi dress women long sleeve modest'), D('Premium Abaya','Modanisa','$189','premium cashmere abaya women modest')]
      },
      jackets: {
        aff: [D('Long-Line Trench Coat','H&M','$79','long line trench coat women modest'), D('Faux-Leather Belted Coat','H&M','$79','brown faux leather oversized belted coat women modest'), D('Wool Overcoat','Uniqlo','$129','wool overcoat women modest neutral')],
        mid: [D('Oversized Wool Coat','COS','$295','oversized wool coat camel women modest'), D('Long Belted Coat','Zara','$129','long belted wool coat women modest'), D('Sage Linen Jacket','Zara','$59','sage green linen tie front cropped jacket women')],
        lux: [D('Heritage Wool Coat','Toteme','$995','heritage wool overcoat camel women modest'), D('Wool Coat','Acne Studios','$1495','wool coat oversized women modest'), D('Wool Tailored Coat','COS','$495','wool tailored long coat women modest')]
      },
      shoes: {
        aff: [D('Pointed Flats Nude','H&M','$32','pointed flats women nude modest'), D('White Leather Sneakers','H&M','$45','white leather sneakers women clean'), D('Pointed Mules','Zara','$49','pointed mules women modest neutral')],
        mid: [D('Leather Ballet Flats','Zara','$79','leather ballet flats women brown modest'), D('Leather Loafers','COS','$185','leather loafers women modest'), D('Adidas Stan Smith','Adidas','$85','white leather sneakers women adidas stan smith')],
        lux: [D('Leather Pumps','COS','$245','leather pumps brown women modest'), D('Mules','Toteme','$595','leather mules women neutral'), D('Pointed Loafers','Acne Studios','$595','pointed loafers women leather')]
      },
      boots: {
        aff: [D('Pointed Ankle Boots','H&M','$59','pointed ankle boots women neutral modest'), D('Suede Boots','SHEIN','$45','suede boots women neutral modest'), D('Brown Western Boots','H&M','$69','brown western boots women modest')],
        mid: [D('Leather Ankle Boots','COS','$195','leather ankle boots women modest'), D('Knee-High Boots','Zara','$129','knee high leather boots women modest'), D('Heeled Ankle Boots','Charles & Keith','$109','heeled ankle boots women modest brown')],
        lux: [D('Knee-High Boots','Toteme','$895','knee high leather boots women modest'), D('Ankle Boots','Acne Studios','$695','leather ankle boots women modest'), D('Pointed Boots','Jacquemus','$695','pointed leather boots women modest')]
      },
      bags: {
        aff: [D('Suede Tote Bag','H&M','$45','suede tote bag women brown modest'), D('Structured Shoulder Bag','SHEIN','$25','structured shoulder bag women neutral'), D('Woven Tote','Zara','$59','woven tote bag women neutral')],
        mid: [D('Brown Suede Tote','COS','$245','brown suede structured leather tote bag women'), D('Cream Hobo Bag','COS','$195','cream soft leather hobo shoulder bag women'), D('Structured Shopper','Zara','$89','structured leather shopper bag women')],
        lux: [D('Heritage Leather Tote','Toteme','$895','heritage leather tote bag women neutral'), D('Soft Leather Bag','Polène','$595','soft leather shoulder bag women neutral'), D('Structured Tote','Acne Studios','$1295','structured leather tote bag women')]
      },
      jewelry: {
        aff: [D('Gold Layered Necklace Set','H&M','$18','gold layered pendant necklace set women delicate'), D('Gold Stacking Rings','H&M','$18','gold stacking rings set women minimal'), D('Gold Pendant','SHEIN','$10','gold pendant necklace women delicate')],
        mid: [D('Layered Pendant Set','Mejuri','$98','gold layered pendant necklace set women delicate'), D('Pearl Hoop Earrings','Mejuri','$78','bold pearl hoop earrings gold'), D('Gold Bangle Stack','Pandora','$120','gold bangle stack women minimal')],
        lux: [D('Diamond Layered Set','Mejuri','$495','diamond layered necklace set women'), D('Pearl Drop Earrings','Tiffany & Co.','$395','pearl drop earrings tiffany women'), D('Gold Chain Necklace','Mejuri','$245','gold thick chain necklace women')]
      },
      accessories: {
        aff: [D('Premium Satin Hijab','Modanisa','$15','premium satin hijab women modest'), D('Cotton Hijab Set','Modanisa','$22','cotton hijab set women modest neutral'), D('Modal Hijab Multipack','Modanisa','$28','modal hijab multipack women neutral')],
        mid: [D('Chiffon Hijab Set','Modanisa','$35','chiffon hijab set women premium'), D('Silk Modal Hijab','Modanisa','$45','silk modal hijab women premium'), D('Premium Wool Scarf','COS','$95','premium wool scarf women neutral')],
        lux: [D('Pure Silk Scarf','COS','$95','pure silk scarf women neutral modest'), D('Cashmere Hijab','Modanisa','$95','cashmere hijab premium women'), D('Silk Twill Scarf','Toteme','$395','silk twill scarf women neutral')]
      },
      makeup: {
        aff: [D('NYX Soft Matte Lip','Sephora','$8','NYX soft matte lip cream rose'), D('e.l.f. Bronzer','Sephora','$10','elf bronzer pressed powder warm'), D('Glow Setting Spray','Sephora','$14','e.l.f. dewy glow setting spray')],
        mid: [D('Rare Beauty Blush','Sephora','$23','rare beauty soft pinch liquid blush rose'), D('Charlotte Tilbury Lip','Sephora','$36','charlotte tilbury pillow talk lip liner'), D('Glossier Cloud Paint','Sephora','$22','glossier cloud paint blush rose')],
        lux: [D('Dior Lip Glow','Sephora','$45','dior addict lip glow oil rose'), D('Chanel Les Beiges','Sephora','$68','chanel les beiges blush rose'), D('YSL Touche Eclat','Sephora','$45','ysl touche eclat highlighter')]
      },
      fragrances: {
        aff: [D('Body Mist Warm','Sephora','$18','body mist warm vanilla sandalwood women'), D('Sol de Janeiro Mist','Sephora','$26','sol de janeiro brazilian crush body mist'), D('Le Couvent Maison','Sephora','$32','le couvent maison cologne women')],
        mid: [D('Le Labo Santal 33','Sephora','$185','le labo santal 33 eau de parfum'), D('Maison Margiela Replica','Sephora','$155','maison margiela replica beach walk'), D('Diptyque Tam Dao','Sephora','$195','diptyque tam dao eau de parfum')],
        lux: [D('Tom Ford Oud Wood','Sephora','$295','tom ford oud wood eau de parfum'), D('Frederic Malle','Sephora','$345','frederic malle musc ravageur'), D('Maison Francis Oud','Sephora','$395','maison francis kurkdjian oud satin mood')]
      }
    }
  };

  // ===== Hotspot outfit data (built here so FASHION_DIR is initialized) =====
  var _allCombos = (CURATED_COMBOS[s.id] || CURATED_COMBOS.classic).concat(EXTRA_COMBOS[s.id] || []);
  var _comboByIdx = {};
  _allCombos.forEach(function(c) { _comboByIdx[c.heroIdx] = c; });

  var HOTSPOT_POS = {
    'Top': {x:42,y:28}, 'Shirt': {x:42,y:28}, 'Dress': {x:45,y:43}, 'Jacket': {x:32,y:26}, 'Blazer': {x:30,y:26},
    'Coat': {x:33,y:22}, 'Outer': {x:33,y:22}, 'Layer': {x:66,y:28},
    'Bottom': {x:50,y:63}, 'Skirt': {x:50,y:60}, 'Belt': {x:47,y:52},
    'Tights': {x:50,y:76}, 'Shoes': {x:50,y:89}, 'Boots': {x:50,y:85},
    'Bag': {x:74,y:63}, 'Accessory': {x:58,y:13}, 'Hat': {x:50,y:7},
    'Jewelry': {x:53,y:37}, 'Scarf': {x:38,y:22}, 'Hair': {x:52,y:8},
    // Beauty categories — face-feature defaults for portrait-style outfit images.
    // Per-outfit overrides in OUTFIT_HOTSPOTS should refine these when face position differs.
    'Blush':    {x:30,y:35}, 'Lip':      {x:46,y:55},
    'Lashes':   {x:60,y:18}, 'Skincare': {x:45,y:25}
  };

  /* ── Per-image hotspot overrides ──────────────────────────────
     Keyed by aestheticId → outfitIdx (0..5) → category → {x,y}.
     Coordinates are % of the rendered image (0 = top-left).
     When present, replaces HOTSPOT_POS[category] for that specific
     outfit photo so the dot sits on the visible garment instead of
     the generic category default. Missing categories fall back to
     HOTSPOT_POS, then to {50,50}.
     Hand-tuned via visual inspection of each outfit-N.jpg
     (~270 dots across 54 photos).
     ────────────────────────────────────────────────────────────── */
  var OUTFIT_HOTSPOTS = {
    classic: {
      // outfit-1: model in white mini dress, black knit draped over shoulders, holding black Kelly bag,
      // cat-eye sunglasses on face, gold drop earrings, cuff bracelet on raised wrist, black ballet flats.
      // Jewelry__1 = earrings, Jewelry__2 = cuff bracelet.
      0: { Dress:{x:44,y:55}, Layer:{x:34,y:42}, Bag:{x:63,y:72}, Shoes:{x:48,y:90}, Accessory:{x:46,y:35}, Jewelry:{x:54,y:37}, Jewelry__2:{x:34,y:38} },
      // outfit-2 (Prep Edit): blue pinstripe oxford shirt + navy ribbed knit vest layered over,
      // thin brown belt with gold buckle at waist, dark navy wide-leg jeans, tan structured top-handle bag held at bottom-left.
      // Two Top pieces: __1 = oxford shirt (visible at chest/arms), __2 = vest (visible at torso center).
      1: { Top:{x:55,y:35}, Top__2:{x:38,y:42}, Belt:{x:40,y:60}, Bottom:{x:40,y:85}, Bag:{x:12,y:88} },
      // outfit-3 (Office Hour): cream oversized wool coat dominates torso, black ribbed turtleneck visible at neck,
      // black leather gloves on hands holding black quilted top-handle bag, black opaque tights, pointed ankle boots at feet.
      2: { Coat:{x:46,y:50}, Outer:{x:46,y:50}, Jacket:{x:46,y:50}, Top:{x:46,y:27}, Bag:{x:40,y:65}, Accessory:{x:46,y:60}, Tights:{x:45,y:75}, Shoes:{x:46,y:90}, Boots:{x:46,y:90} },
      // outfit-4 (Elevated): black halter bodysuit on torso, black double-ring belt at waist,
      // white high-waist wide-leg pleated trousers, small black top-handle bag held at left hip,
      // black cat-eye sunglasses on face, gold hoops on visible left ear.
      3: { Top:{x:40,y:35}, Belt:{x:35,y:50}, Bottom:{x:45,y:75}, Bag:{x:20,y:80}, Accessory:{x:33,y:15}, Jewelry:{x:28,y:20} },
      // outfit-5 (Weekend Edit): cream relaxed crewneck knit on torso, cream satin bias-cut midi skirt below,
      // black quilted chain crossbody at left side under arm, white pointed pumps at feet, sunglasses on face, drop earrings on ear.
      4: { Top:{x:45,y:38}, Bottom:{x:45,y:70}, Bag:{x:33,y:45}, Shoes:{x:45,y:90}, Accessory:{x:48,y:17}, Jewelry:{x:53,y:18} },
      // outfit-6 (Timeless Evening): seated Paris café side view — beige trench draped on back/shoulders,
      // white chunky rib-knit sleeve cuff visible on raised arm, black opaque tights below, brown satchel partially visible.
      // Jewelry__1 = gold stacking rings on holding hand, Jewelry__2 = gold chain bracelet on same wrist.
      5: { Coat:{x:55,y:60}, Outer:{x:55,y:60}, Jacket:{x:55,y:60}, Top:{x:35,y:60}, Bag:{x:48,y:85}, Tights:{x:50,y:90}, Jewelry:{x:18,y:55}, Jewelry__2:{x:20,y:62} }
    },
    casual: {
      // outfit-1: chest-up mirror selfie, black crop tee, brown patent belt at waist, charcoal trousers just visible at bottom,
      // GG monogram hobo bag at right, gold hoop earrings on left ear, stacking rings/bangles across both hands.
      // Jewelry__1 = earrings, Jewelry__2 = rings + bangles.
      0: { Top:{x:45,y:50}, Belt:{x:35,y:88}, Bottom:{x:40,y:90}, Bag:{x:70,y:75}, Jewelry:{x:25,y:33}, Jewelry__2:{x:33,y:75} },
      // outfit-2 (Summer Casual): seated, navy polo cap on head, white spaghetti-strap cami on torso,
      // light blue wide-leg jeans on legs, black woven quilted bucket tote sitting at bottom-left of couch,
      // gold cross pendant on chest below neck, gold watch on right wrist holding cup.
      // Jewelry__1 = cross pendant, Jewelry__2 = watch.
      1: { Top:{x:45,y:60}, Hat:{x:35,y:32}, Bottom:{x:55,y:88}, Bag:{x:15,y:90}, Jewelry:{x:43,y:55}, Jewelry__2:{x:40,y:70} },
      // outfit-3 (Smart Casual): squatting on steps, beige/tan houndstooth cropped blazer over white ribbed crop cami,
      // dark blue wide-leg jeans, nude mesh pointed-toe pumps/mules at feet, cream box shoulder bag held bottom-right,
      // black cat-eye sunglasses on face, tiny gold pendant necklace at neck.
      2: { Jacket:{x:50,y:35}, Blazer:{x:50,y:35}, Top:{x:50,y:45}, Bottom:{x:50,y:70}, Shoes:{x:50,y:90}, Bag:{x:60,y:90}, Accessory:{x:48,y:22}, Jewelry:{x:50,y:33} },
      // outfit-4 (Elevated, heroIdx 3): seated in café, stone beige oversized puffer bomber dominates torso,
      // white ribbed crop barely visible underneath, light/white wide-leg sweatpants on legs,
      // Adidas Samba sneakers (white with black stripes) at feet, cream embroidered baseball cap on head.
      3: { Jacket:{x:35,y:45}, Outer:{x:35,y:45}, Top:{x:45,y:45}, Bottom:{x:45,y:70}, Shoes:{x:35,y:85}, Accessory:{x:35,y:22} },
      // outfit-5 (Autumn Casual): standing outdoors with autumn trees, dark brown shearling aviator jacket on torso,
      // cream ribbed turtleneck visible at neck above jacket, medium-wash straight/flared jeans on legs,
      // pointed ankle booties at feet, brown structured leather top-handle bag swung out at right hand.
      4: { Jacket:{x:40,y:38}, Outer:{x:40,y:38}, Top:{x:48,y:27}, Bottom:{x:48,y:75}, Shoes:{x:43,y:90}, Bag:{x:85,y:50} },
      // outfit-6 (Effortless Brunch): standing in front of Parisian arches, black ribbed knit short-sleeve top,
      // cream satin fluid wide-leg trousers, black patent top-handle bag held at left hip, black pointed pumps at feet,
      // gold watch on right wrist, black cat-eye sunglasses on face.
      5: { Top:{x:45,y:35}, Bottom:{x:45,y:65}, Bag:{x:28,y:65}, Shoes:{x:45,y:90}, Jewelry:{x:50,y:50}, Accessory:{x:45,y:25} }
    },
    streetwear: {
      // outfit-1: model outside flower shop, baker boy cap top, amber sunglasses on face, khaki trench draped on shoulders,
      // white dress shirt visible at chest, patterned tie down center, black wide belt at waist, dark gray maxi skirt,
      // brown crossbody at left hip, dark brown platform loafers on raised left foot.
      // Accessory__1 = tie at chest, Accessory__2 = sunglasses on face.
      0: { Hat:{x:38,y:8}, Coat:{x:38,y:35}, Outer:{x:38,y:35}, Jacket:{x:38,y:35}, Top:{x:43,y:30}, Accessory:{x:46,y:32}, Accessory__2:{x:40,y:17}, Belt:{x:40,y:48}, Bottom:{x:40,y:70}, Bag:{x:20,y:65}, Shoes:{x:28,y:90} },
      // outfit-2 (Grey Edit): standing by light pole, grey windowpane plaid oversized blazer dominates torso,
      // grey textured baggy wide-leg trousers, black pointed flats at feet, grey wool beret on head,
      // black mini quilted crossbody tucked at right hip, layered gold chains in open neckline, stacking rings on hand on hip.
      // Jewelry__1 = layered chains, Jewelry__2 = rings.
      1: { Hat:{x:45,y:22}, Jacket:{x:50,y:50}, Blazer:{x:50,y:50}, Bottom:{x:50,y:88}, Shoes:{x:48,y:90}, Bag:{x:53,y:55}, Jewelry:{x:45,y:50}, Jewelry__2:{x:28,y:62} },
      // outfit-3 (Sneaker Focus): standing in record store, electric blue beanie on head, grey oversized cropped sweatshirt,
      // light wash baggy wide-leg jeans, white Converse high-tops at feet, silver layered chains at neckline.
      2: { Hat:{x:48,y:13}, Top:{x:48,y:38}, Bottom:{x:48,y:65}, Shoes:{x:48,y:90}, Jewelry:{x:48,y:28} },
      // outfit-4 (Elevated, heroIdx 3): hallway mirror selfie, dark brown faux leather bomber on torso,
      // chunky green plaid scarf draped from neck down across chest, light grey/sage baggy jeans on legs,
      // camel UGG-style platform mules at feet, neon lime-green mini crossbody at left hip,
      // gold cross pendant on chest, silver hoop earring on visible ear.
      // Jewelry__1 = cross pendant, Jewelry__2 = silver hoops.
      3: { Jacket:{x:40,y:55}, Outer:{x:40,y:55}, Scarf:{x:30,y:60}, Bottom:{x:40,y:80}, Shoes:{x:40,y:90}, Boots:{x:40,y:90}, Bag:{x:25,y:55}, Jewelry:{x:40,y:50}, Jewelry__2:{x:50,y:32} },
      // outfit-5 (Pinstripe Edit): standing in gallery, blue/white pinstripe shirt tied/cropped on torso,
      // light grey distressed baggy wide-leg jeans, green suede platform lace-up mules at feet,
      // small black backpack visible at side, thin clear/square sunglasses on face, silver hoops on ear.
      4: { Top:{x:40,y:40}, Bottom:{x:40,y:75}, Shoes:{x:45,y:90}, Bag:{x:50,y:50}, Accessory:{x:38,y:32}, Jewelry:{x:28,y:30} },
      // outfit-6 (Vintage Tee): walking NYC street, cream vintage graphic football crop tee with "Detroit" + blue sleeve,
      // light blue wash relaxed straight jeans, small black cat-eye sunglasses on face, tiny gold hoops on ear.
      5: { Top:{x:45,y:45}, Bottom:{x:45,y:78}, Accessory:{x:43,y:28}, Jewelry:{x:40,y:30} }
    },
    minimalist: {
      // outfit-1: model at marble bar, chocolate turtleneck on upper torso, brown wide belt at waist,
      // brown plaid wrap midi skirt with side slit, small grey/brown tote held at left, brown knee-high pointed boots.
      // Pieces are Top/Bottom/Belt/Shoes/Bag (NOT Skirt/Boots) — match the actual category names.
      0: { Top:{x:48,y:30}, Belt:{x:50,y:42}, Bottom:{x:50,y:60}, Bag:{x:40,y:58}, Shoes:{x:55,y:88} },
      // outfit-2 (Camel Edit): seated Paris café, camel ribbed turtleneck visible at chest,
      // camel oversized wool coat draped on shoulders/back, camel wide-leg trousers on legs,
      // Adidas Samba white sneakers at feet, cream triangle slouchy bag on cafe table to the right, gold hoop on ear.
      1: { Top:{x:40,y:55}, Coat:{x:35,y:65}, Outer:{x:35,y:65}, Jacket:{x:35,y:65}, Bottom:{x:40,y:80}, Shoes:{x:40,y:90}, Bag:{x:65,y:50}, Jewelry:{x:40,y:38} },
      // outfit-3 (Quiet Work Day): office mirror selfie, white poplin button-down on torso,
      // black high-waist tailored trousers on legs, large black structured tote held at right side,
      // silver watch on right wrist, thin gold chain at open collar, gold ring on hand holding phone.
      // Jewelry__1 = silver watch, Jewelry__2 = gold chain, Jewelry__3 = gold ring.
      2: { Top:{x:40,y:50}, Bottom:{x:40,y:85}, Bag:{x:60,y:70}, Jewelry:{x:50,y:45}, Jewelry__2:{x:35,y:50}, Jewelry__3:{x:40,y:35} },
      // outfit-4 (Elevated, heroIdx 3): street profile, black mock-neck cap-sleeve top on chest,
      // sculptural wavy black leather belt at waist (silver buckle visible), black satin asymmetric midi skirt below,
      // black structured patent top-handle tote held at left hip, gold thick hoop earring on visible ear,
      // gold cuff bracelet + gold ring on right wrist holding cup.
      // Jewelry__1 = thick hoops, Jewelry__2 = cuff bracelet, Jewelry__3 = ring.
      3: { Top:{x:48,y:45}, Bottom:{x:45,y:80}, Belt:{x:45,y:65}, Bag:{x:25,y:75}, Jewelry:{x:40,y:32}, Jewelry__2:{x:50,y:78}, Jewelry__3:{x:48,y:82} },
      // outfit-5 (Relaxed Minimal): standing in park, white relaxed crewneck sweatshirt on torso,
      // dark/medium blue wide-leg jeans on legs, thin black leather belt at waist, large black woven intrecciato tote at left side,
      // black pointed ankle boots barely visible at feet, small black rectangular sunglasses on face, tiny gold hoops on ear.
      4: { Top:{x:45,y:35}, Bottom:{x:45,y:70}, Belt:{x:48,y:50}, Bag:{x:20,y:50}, Shoes:{x:40,y:90}, Accessory:{x:45,y:18}, Jewelry:{x:43,y:22} },
      // outfit-6 (Weekend Market): mirror selfie, black long-sleeve mock-neck fitted bodysuit on torso,
      // black/white horizontal stripe oversized chunky cardigan draped on shoulders, black high-waist wide-leg trousers on legs,
      // black structured mini top-handle bag held at front waist, white chunky platform sneakers at feet,
      // small black rectangular sunglasses on face, small gold hoops on ear.
      5: { Top:{x:45,y:30}, Layer:{x:25,y:25}, Bottom:{x:45,y:65}, Bag:{x:45,y:35}, Shoes:{x:45,y:90}, Accessory:{x:40,y:8}, Jewelry:{x:38,y:12} }
    },
    elegant: {
      // outfit-1: marble bathroom mirror selfie, dark brown sheer floral lace bodysuit on torso,
      // chocolate satin gathered mini skirt at bottom (just visible), gold wide cuff bracelet on right wrist holding phone,
      // gold chunky hoop earrings on left ear. Pieces use Bottom (not Skirt) and Shoes (not visible, place at edge).
      // Jewelry__1 = cuff bracelet on raised wrist, Jewelry__2 = hoop earrings on ear.
      0: { Top:{x:42,y:65}, Bottom:{x:42,y:90}, Jewelry:{x:55,y:35}, Jewelry__2:{x:33,y:35}, Shoes:{x:55,y:90} },
      // outfit-2 (Silk Edit): marble bathroom mirror selfie, dark brown v-neck satin top with lace trim hem visible at waist,
      // ivory cream fitted satin midi skirt below, cream mini Kelly top-handle bag placed on bathroom counter,
      // pearl strand choker necklace at neck.
      1: { Top:{x:38,y:50}, Bottom:{x:45,y:75}, Bag:{x:35,y:90}, Jewelry:{x:45,y:38} },
      // outfit-3 (Day Date): seated at Paris café reading Chanel book, burgundy faux leather long trench dominates,
      // white shirt collar visible above coat, polka dot silk tie down center, white knee-high stiletto boots on crossed legs,
      // white mini bag on table to right, white cat-eye sunglasses on face, pearl drop earrings on ear, gold rings on holding hand.
      // Accessory__1 = polka dot tie, Accessory__2 = white sunglasses.
      // Jewelry__1 = pearl drop earrings, Jewelry__2 = gold stacking rings.
      2: { Coat:{x:35,y:55}, Outer:{x:35,y:55}, Jacket:{x:35,y:55}, Top:{x:42,y:38}, Accessory:{x:42,y:50}, Accessory__2:{x:40,y:22}, Shoes:{x:50,y:85}, Boots:{x:50,y:85}, Bag:{x:78,y:65}, Jewelry:{x:30,y:22}, Jewelry__2:{x:53,y:65} },
      // outfit-4 (Elevated, heroIdx 3): seated on marble stairs, white oversized blazer worn as dress on torso,
      // black knee-high stiletto leather boots on legs, black clean structured shoulder bag on step to left,
      // gold hoop earring on visible ear, luxury compact powder mirror held in hands.
      3: { Blazer:{x:50,y:55}, Top:{x:50,y:55}, Shoes:{x:38,y:80}, Boots:{x:38,y:80}, Bag:{x:15,y:75}, Jewelry:{x:53,y:35}, Accessory:{x:40,y:45} },
      // outfit-5 (Co-ord Edit): seated on stone ledge, cream ribbed sleeveless mock-neck top + matching cream ribbed wide-leg trousers (co-ord),
      // burgundy pointed-toe gold-buckle loafer heels visible at feet on raised crossed leg,
      // gold watch + gold chain bracelet on right wrist resting on knee.
      // Jewelry__1 = gold watch, Jewelry__2 = gold chain bracelet.
      4: { Top:{x:38,y:38}, Bottom:{x:40,y:75}, Shoes:{x:40,y:90}, Jewelry:{x:35,y:50}, Jewelry__2:{x:38,y:48} },
      // outfit-6 (Gallery Opening): twirling in front of Eiffel Tower, white polka dot corset boned midi ballgown billowing,
      // black heart-shape chain mini bag held at waist, large pearl drop earrings on ear, gold stacking rings on raised hand.
      // Jewelry__1 = pearl drop earrings, Jewelry__2 = stacking rings.
      5: { Dress:{x:45,y:70}, Bag:{x:50,y:65}, Jewelry:{x:48,y:33}, Jewelry__2:{x:35,y:28} }
    },
    korean: {
      // outfit-1: model in cafe, white zip-up cap-sleeve cropped top, brown plaid pleated mini skirt at hip,
      // dark brown knee-high buckle-strap boots on legs, tan caramel shoulder bag at right hip,
      // silver hoop earrings on ear, beaded bracelet on left wrist (resting on stool).
      // Pieces are Top/Bottom/Shoes/Bag/Jewelry/Jewelry — match exact category names.
      0: { Top:{x:45,y:42}, Bottom:{x:45,y:60}, Shoes:{x:42,y:90}, Bag:{x:55,y:60}, Jewelry:{x:45,y:33}, Jewelry__2:{x:30,y:50} },
      // outfit-2 (Cozy Edit): seated in dim café, cream fluffy shearling teddy coat draped on shoulders,
      // black sleeveless cami visible underneath, Hermès-style printed silk square scarf wrapping head, black baseball cap on top of scarf.
      1: { Coat:{x:30,y:60}, Outer:{x:30,y:60}, Top:{x:50,y:55}, Accessory:{x:40,y:25}, Hat:{x:38,y:28} },
      // outfit-3 (Study Date): walking down stairs, navy cable-knit cropped V-neck cardigan over white ribbed cami,
      // cream pleated tennis mini skirt below, white knee-high heeled boots at feet, black mini top-handle bag strap visible at hip.
      // Two Top pieces: __1 = navy cardigan, __2 = white tank underneath.
      2: { Top:{x:40,y:40}, Top__2:{x:42,y:38}, Bottom:{x:38,y:55}, Shoes:{x:40,y:90}, Boots:{x:40,y:90}, Bag:{x:28,y:50} },
      // outfit-4 (Elevated, heroIdx 3): walking on brick stairs, white wide-brim fedora on head,
      // cream ruched corset puff-sleeve top on torso, silver/grey sparkly plaid micro mini at hip,
      // cream long sheer duster cardigan draped behind on one side, dark brown suede tote swung out at right hand,
      // black cat-eye sunglasses on face, white pointed mule heels at feet.
      3: { Hat:{x:38,y:18}, Top:{x:40,y:40}, Bottom:{x:40,y:55}, Layer:{x:25,y:50}, Shoes:{x:40,y:90}, Bag:{x:60,y:70}, Accessory:{x:38,y:22} },
      // outfit-5 (Tweed Edit): street mirror selfie, cream tweed chanel-style cropped jacket with gold buttons,
      // white ribbed crop cami visible center under jacket, light blue denim mini skirt at hip,
      // black/white quilted chain crossbody visible at left side, navy embroidered baseball cap on head,
      // black cat-eye sunglasses on face, silver chain necklace and hoop earrings at neck/ear.
      4: { Jacket:{x:45,y:50}, Top:{x:50,y:55}, Bottom:{x:45,y:80}, Bag:{x:28,y:80}, Hat:{x:45,y:22}, Accessory:{x:40,y:30}, Jewelry:{x:45,y:47} },
      // outfit-6 (Night Market): walking, cream sheer floral lace button-down blouse on torso,
      // cream lace/brocade matching mini skirt at hip, cream structured angular mini bag held at right side, pearl choker necklace at neck.
      5: { Top:{x:40,y:45}, Bottom:{x:40,y:75}, Bag:{x:58,y:50}, Jewelry:{x:45,y:28} }
    },
    y2k: {
      // outfit-1: night party shot, brown tweed baker boy cap on top, brown gradient aviator sunglasses on face,
      // white fitted baby crop tee on torso, faux fur leopard mini at hip, cream knee-high pointed boots at feet,
      // Fendi monogram baguette bag partly visible at left, gold layered chain necklaces on chest,
      // gold bangle bracelets stack on left wrist resting on hip.
      // Jewelry__1 = chains on chest, Jewelry__2 = bangles on wrist.
      0: { Hat:{x:48,y:12}, Accessory:{x:48,y:19}, Top:{x:50,y:38}, Bottom:{x:48,y:58}, Shoes:{x:48,y:90}, Bag:{x:25,y:50}, Jewelry:{x:48,y:43}, Jewelry__2:{x:30,y:65} },
      // outfit-2 (Feather Moment): walking night city, leopard baker boy cap on head, pink fluffy feather/marabou off-shoulder top,
      // gold buckle belt at waist over leopard mini skirt, pink mini bag at right hip, pink fur knee-high boots at feet,
      // rhinestone chain choker at neck.
      1: { Hat:{x:40,y:12}, Top:{x:40,y:40}, Bottom:{x:40,y:60}, Belt:{x:40,y:58}, Shoes:{x:35,y:90}, Boots:{x:35,y:90}, Bag:{x:65,y:50}, Jewelry:{x:40,y:28} },
      // outfit-3 (Festival Look): standing under lanterns, dark brown strapless boned corset with lace trim on torso,
      // denim jacket tied around waist, khaki olive baggy balloon-leg pants on legs,
      // silver hoop earring on ear, gold cross pendant + layered gold chains on chest.
      // Jewelry__1 = silver hoops, Jewelry__2 = gold cross pendant, Jewelry__3 = layered chains.
      2: { Top:{x:45,y:40}, Bottom:{x:45,y:80}, Layer:{x:40,y:70}, Jewelry:{x:50,y:30}, Jewelry__2:{x:45,y:50}, Jewelry__3:{x:48,y:38} },
      // outfit-4 (Elevated, heroIdx 3): outside, sheer paisley print open kimono overshirt loose on torso,
      // grey washed distressed wide-leg jeans on legs, light blue/grey structured mini top-handle bag at right hand,
      // gold/amber bead bracelet on raised right wrist, layered gold chains at neck, tinted Y2K sunglasses on face.
      // Jewelry__1 = bead bracelet, Jewelry__2 = layered chains.
      3: { Top:{x:40,y:35}, Bottom:{x:40,y:75}, Bag:{x:50,y:60}, Jewelry:{x:40,y:25}, Jewelry__2:{x:45,y:35}, Accessory:{x:45,y:18} },
      // outfit-5 (Going Out Fit): three models — middle one is pink velour matching set,
      // pink velour zip-up crop hoodie on torso, pink velour wide-leg flare pants on legs,
      // white satin headband on head, crystal rhinestone choker at neck, small pink fluffy bag held at left hip.
      4: { Top:{x:38,y:45}, Bottom:{x:40,y:75}, Accessory:{x:40,y:15}, Jewelry:{x:40,y:30}, Bag:{x:30,y:60} },
      // outfit-6 (Plaid Corset): standing on Seoul street, burgundy plaid corset tank with white lace ruffle hem on torso,
      // grey wide-leg baggy jeans on legs, grey metallic chunky platform shoes at feet,
      // black mini crossbody at left side, black star charm choker + layered beaded necklaces at neck.
      // Jewelry__1 = black star choker, Jewelry__2 = layered beaded necklaces.
      5: { Top:{x:45,y:40}, Bottom:{x:45,y:75}, Shoes:{x:45,y:90}, Bag:{x:20,y:45}, Jewelry:{x:45,y:25}, Jewelry__2:{x:48,y:28} }
    },
    vintage: {
      // outfit-1: 60s mod editorial, white satin headband on top, crystal chandelier drop earring on left ear,
      // white bouclé tweed cropped jacket on upper torso (gold buttons), matching white tweed mini skirt,
      // black opaque tights down legs, white crystal-embellished ankle-strap pumps on raised right foot,
      // rhinestone bracelet on right wrist resting on dresser.
      // Jewelry__1 = chandelier earrings, Jewelry__2 = rhinestone bracelet.
      0: { Accessory:{x:40,y:15}, Jacket:{x:38,y:30}, Outer:{x:38,y:30}, Bottom:{x:38,y:45}, Tights:{x:40,y:65}, Shoes:{x:55,y:70}, Jewelry:{x:45,y:25}, Jewelry__2:{x:33,y:35} },
      // outfit-2 (Military Edit): standing in vintage drawing room, cream structured military-style long jacket with gold buttons on torso,
      // cream ruffled tiered mini skirt visible below jacket, white floral lace tights on legs,
      // multi-strand pearl collar at neck, gold stud earring on ear, gold ring on hand.
      // Jewelry__1 = pearl collar, Jewelry__2 = gold studs, Jewelry__3 = gold ring.
      1: { Jacket:{x:50,y:45}, Outer:{x:50,y:45}, Bottom:{x:48,y:75}, Tights:{x:48,y:88}, Jewelry:{x:48,y:22}, Jewelry__2:{x:55,y:18}, Jewelry__3:{x:45,y:60} },
      // outfit-3 (Flea Market Find): seated on console table by ornate gold mirror, cream tweed bouclé blazer on torso,
      // cream turtleneck visible at neck above jacket, white floral lace tights on legs,
      // white kitten heel pumps on raised leg at top-left, cream quilted Chanel-style flap bag on chair seat below.
      2: { Jacket:{x:45,y:40}, Outer:{x:45,y:40}, Top:{x:50,y:30}, Tights:{x:40,y:70}, Shoes:{x:30,y:60}, Bag:{x:60,y:70} },
      // outfit-4 (Elevated, heroIdx 3): seated Paris café with Eiffel Tower, beige long open trench draped on shoulders,
      // black sheer lace mini dress visible under coat, gold YSL-style belt at waist, black floral lace tights on legs,
      // burgundy pointed stiletto heels at feet, small rectangular vintage sunglasses on face,
      // gold watch on left wrist holding cup, gold stacking rings on same hand.
      // Jewelry__1 = gold watch, Jewelry__2 = stacking rings.
      3: { Coat:{x:35,y:50}, Outer:{x:35,y:50}, Dress:{x:35,y:60}, Belt:{x:40,y:65}, Tights:{x:45,y:85}, Shoes:{x:55,y:90}, Boots:{x:55,y:90}, Accessory:{x:35,y:22}, Jewelry:{x:50,y:50}, Jewelry__2:{x:48,y:55} },
      // outfit-5 (Garden Party): back-view with pink-striped umbrella outside Gothic university building,
      // ivory ruffle full-circle skirt halter mini dress billowing, white pearl-trim shoulder bag held at left side,
      // shoes hidden by dress (placed at bottom), earrings not visible from behind (placed near where ear would be).
      4: { Dress:{x:45,y:70}, Shoes:{x:45,y:90}, Bag:{x:20,y:75}, Jewelry:{x:40,y:35} },
      // outfit-6 (70s Fantasy): lying in bed with retro phone, pink satin strapless bustier on chest,
      // pink sequin fitted midi skirt below, white fluffy faux fur stole draped on right shoulder,
      // crystal rhinestone embellished clutch on bed at left, crystal rhinestone choker at neck,
      // crystal rhinestone tennis bracelet on left wrist.
      // Jewelry__1 = crystal choker, Jewelry__2 = tennis bracelet.
      5: { Top:{x:45,y:45}, Bottom:{x:55,y:70}, Layer:{x:60,y:30}, Bag:{x:15,y:60}, Jewelry:{x:40,y:35}, Jewelry__2:{x:20,y:50} }
    },
    softgirl: {
      // outfit-1: close-up beauty portrait — face hotspots, not clothing
      // Lashes on right eye, Skincare on forehead, Blush on left cheek, Lip on lower lip, Jewelry on faint necklace at very bottom
      0: { Lashes:{x:62,y:13}, Skincare:{x:45,y:20}, Blush:{x:28,y:34}, Lip:{x:46,y:57}, Jewelry:{x:46,y:96} },
      // outfit-2 (Everyday, heroIdx 1): standing by marble wall, pink chunky oversized knit sweater with bow cuff on torso,
      // white tiered ribbon-trim maxi skirt below (visible pink bow ties), cream crescent shoulder bag at left shoulder,
      // nude strappy flat sandals at feet (barely visible).
      1: { Top:{x:40,y:35}, Bottom:{x:40,y:70}, Bag:{x:25,y:45}, Shoes:{x:40,y:90} },
      // outfit-3 (Garden Party, heroIdx 2): mirror selfie, pink ribbed tie-front cropped cardigan on upper torso,
      // pink/white floral spaghetti-strap midi dress visible below cardigan, cream structured mini top-handle bag held at left bottom,
      // white platform strap sandals at feet.
      2: { Top:{x:40,y:40}, Layer:{x:40,y:40}, Dress:{x:40,y:70}, Bag:{x:28,y:80}, Shoes:{x:35,y:90} },
      // outfit-4 (Elevated, heroIdx 3): seated on grass picnic, pink gingham square-neck full-skirt midi dress filling lower half,
      // pink silk lily flower hair clip in hair (top right of head), pearl drop gold earring visible on right ear,
      // pink pendant chain necklace at chest, white flat shoe visible at top-right.
      // Jewelry__1 = pearl drop earrings, Jewelry__2 = pink pendant necklace.
      3: { Dress:{x:40,y:65}, Hair:{x:50,y:25}, Jewelry:{x:45,y:32}, Jewelry__2:{x:40,y:45}, Shoes:{x:70,y:60} },
      // outfit-5 (Preppy Edit, heroIdx 4): seated on bench (cropped above face), navy cable-knit cropped V-neck sweater on torso,
      // white/blue pinstripe collared shirt layered underneath (collar above sweater + cuffs at wrists),
      // cream/ivory wide-leg tailored trousers on legs, brown leather belt at waist,
      // gold logo pendant necklace at chest, small gold hoops near top edge.
      // Two Top pieces: __1 = navy sweater, __2 = pinstripe shirt.
      // Jewelry__1 = pendant, Jewelry__2 = small hoops.
      4: { Top:{x:45,y:35}, Top__2:{x:45,y:18}, Bottom:{x:60,y:75}, Belt:{x:40,y:55}, Jewelry:{x:48,y:25}, Jewelry__2:{x:53,y:6} },
      // outfit-6 (First Date, heroIdx 5): standing in art gallery, navy blue silk/satin button-down shirt on torso,
      // white wide-leg tailored trousers on legs, white leather belt with gold buckle at waist,
      // black quilted chain crossbody held at left side, gold chain bracelet on left wrist, pearl stud earrings on ear.
      // Jewelry__1 = gold chain bracelet, Jewelry__2 = pearl studs.
      5: { Top:{x:40,y:45}, Bottom:{x:40,y:80}, Belt:{x:40,y:65}, Bag:{x:25,y:60}, Jewelry:{x:35,y:60}, Jewelry__2:{x:48,y:30} }
    },
    hijabicore: {
      // outfit-1: seated portrait, brown hijab on head, sunglasses up on hijab, brown leather coat covers torso,
      // turtleneck visible at neck, pinstripe maxi falls bottom-left, brown tote held in lap.
      0: { Scarf:{x:40,y:14}, Accessory:{x:46,y:10}, Coat:{x:46,y:50}, Outer:{x:46,y:50}, Top:{x:40,y:35}, Skirt:{x:30,y:82}, Bag:{x:55,y:70} },
      // outfit-2: top-down street shot, black hijab on head, long wool coat full body, waistcoat visible mid-chest,
      // white shirt collar at top, tie down center, wide trousers visible at bottom, brown bag at right hip.
      1: { Scarf:{x:46,y:22}, Coat:{x:38,y:55}, Outer:{x:38,y:55}, Blazer:{x:46,y:46}, Top:{x:46,y:32}, Bottom:{x:42,y:85}, Bag:{x:64,y:50} },
      // outfit-3: standing full-body, dark hijab top of head, plaid blanket scarf draped across shoulders/right side,
      // gray knit on torso, charcoal pleated maxi lower half, black woven bag at right hip, white sneakers at feet.
      // Scarf appears twice: __1 = plaid blanket scarf, __2 = the hijab.
      2: { Top:{x:43,y:38}, Scarf:{x:55,y:33}, Scarf__2:{x:45,y:17}, Skirt:{x:45,y:70}, Bag:{x:57,y:60}, Shoes:{x:45,y:95} },
      // outfit-4: mirror selfie, mauve hijab draped over neck/shoulders, cream fluffy knit dominates upper torso,
      // beige satin bias maxi lower half, cream hobo bag at bottom-left, gold pendant on chest, gold stacking rings on hand at top.
      // Jewelry appears twice: __1 = pendant on chest, __2 = rings on hand at top.
      3: { Scarf:{x:28,y:12}, Top:{x:50,y:45}, Skirt:{x:45,y:80}, Bag:{x:15,y:80}, Jewelry:{x:43,y:22}, Jewelry__2:{x:33,y:6} },
      // outfit-5: mirror selfie, white hijab full wrap, sage linen tie-front cropped jacket on torso,
      // white long-sleeve tee visible above jacket and on arms, white tiered maxi skirt lower 2/3, flats at bottom.
      4: { Scarf:{x:45,y:13}, Jacket:{x:48,y:32}, Outer:{x:48,y:32}, Top:{x:48,y:23}, Skirt:{x:50,y:70}, Shoes:{x:50,y:96} },
      // outfit-6: hotel hallway mirror selfie, brown hijab on head, structured dark jacket on torso,
      // wide dark jeans lower half, brown LV monogram mini bag at left hip, brown pointed pumps at feet.
      5: { Scarf:{x:45,y:23}, Jacket:{x:43,y:45}, Outer:{x:43,y:45}, Bottom:{x:40,y:78}, Bag:{x:25,y:70}, Shoes:{x:38,y:95} }
    }
  };

  function _getAutoHotspots() {
    var dir = FASHION_DIR[s.id];
    if (!dir) return [];
    return [['Top',dir.tops],['Bottom',dir.pants],['Shoes',dir.shoes],['Bag',dir.bags]]
      .filter(function(p) { return p[1] && p[1].mid && p[1].mid[0]; })
      .map(function(p) {
        var d = p[1].mid[0];
        return { category: p[0], name: d.name, store: d.store, price: d.price, url: buildUrl(d.store, d.q) };
      });
  }

  var hotspotOutfits = [0,1,2,3,4,5].map(function(idx) {
    var outfit = s.outfits[idx] || { img: s.heroImg, label: s.name };
    var rc = _comboByIdx[idx];
    return {
      img: outfit.img,
      label: rc ? rc.name : (outfit.label || s.name),
      tag:   rc ? rc.tag  : '',
      saveId: s.id + '-hs-' + idx,
      pieces: rc
        ? rc.pieces.map(function(p) { return { category: p.category, name: p.name, store: p.store, price: p.price, url: buildUrl(p.store, p.q) }; })
        : _getAutoHotspots()
    };
  });

  // 01 Interactive Outfit Shop — hotspot grid
  var html01 = '<section class="ssec ssec-hotshop"><div class="ssec-inner">';
  html01 += '<span class="ssec-num">01 — Shop This Style</span>';
  html01 += '<h2 class="ssec-hotshop-title">Interactive outfits, <em>fully shoppable.</em></h2>';
  html01 += '<p class="ssec-hotshop-intro">Tap the glowing dots to shop each piece. Six complete looks, every budget.</p>';
  html01 += '<div class="hs-grid">';
  hotspotOutfits.forEach(function(outfit, oi) {
    html01 += '<div class="hs-outfit-wrap">';
    html01 += '<img src="' + outfit.img + '" alt="' + outfit.label + '" loading="' + (oi < 3 ? 'eager' : 'lazy') + '">';
    html01 += '<div class="hs-outfit-overlay"></div>';
    // Track per-category instance count so duplicates (e.g. two Scarf pieces in one outfit)
    // can look up Category__2, Category__3 overrides instead of stacking on the same dot.
    var catCounts = {};
    (outfit.pieces || []).forEach(function(piece, pi) {
      catCounts[piece.category] = (catCounts[piece.category] || 0) + 1;
      var instance = catCounts[piece.category];
      var overrides = OUTFIT_HOTSPOTS[s.id] && OUTFIT_HOTSPOTS[s.id][oi];
      var override = null;
      if (overrides) {
        if (instance > 1) override = overrides[piece.category + '__' + instance];
        if (!override && instance === 1) override = overrides[piece.category];
      }
      var pos = override || HOTSPOT_POS[piece.category] || {x:50,y:50};
      // Don't apply the index-based jitter offset when a final override is present —
      // overrides are pixel-final per piece. Without override, jitter prevents stacking.
      var xO = override ? 0 : (pi===1?5:pi===2?-4:0);
      var yO = override ? 0 : (pi===1?-3:pi===2?5:0);
      html01 += '<div class="hs-dot" style="left:' + Math.min(88,Math.max(12,pos.x+xO)) + '%;top:' + Math.min(90,Math.max(6,pos.y+yO)) + '%">';
      html01 += '<div class="hs-dot-ring"><div class="hs-dot-core"></div></div>';
      html01 += '<div class="hs-panel">';
      html01 += '<div class="hs-panel-cat">' + piece.category + '</div>';
      html01 += '<div class="hs-panel-name">' + piece.name + '</div>';
      html01 += '<div class="hs-panel-meta"><span class="hs-panel-store">' + piece.store + '</span><span class="hs-panel-price">' + piece.price + '</span></div>';
      /* FTC-compliant affiliate disclosure — clear, conspicuous, and at
         the moment of click rather than buried in /terms. Aura must
         disclose any commission relationship the moment the shopper is
         about to follow a retailer link. */
      html01 += '<div class="hs-panel-disclosure" aria-label="Affiliate disclosure">Affiliate link · Aura may earn a commission</div>';
      html01 += '<a href="' + piece.url + '" class="hs-panel-link" target="_blank" rel="noopener noreferrer sponsored">Shop now →</a>';
      /* Two layered fallbacks (Pinterest visual + Google Shopping
         product aggregator). If the primary retailer's search returns
         nothing or a redirect to their homepage, the shopper still has
         two safe escape hatches that always show relevant results.
         2026-05-26 hardening pass — Google Shopping added as a third
         tier because Pinterest alone occasionally surfaces editorial
         imagery rather than buyable products. */
      var fallbackQ = encodeURIComponent(piece.name + ' women');
      html01 += '<a href="https://www.pinterest.com/search/pins/?q=' + fallbackQ + '" class="hs-panel-link-alt" target="_blank" rel="noopener noreferrer">Or search Pinterest →</a>';
      html01 += '<a href="https://www.google.com/search?tbm=shop&q=' + fallbackQ + '" class="hs-panel-link-shop" target="_blank" rel="noopener noreferrer">Or search Google Shopping →</a>';
      html01 += '</div></div>';
    });
    html01 += '<button class="hs-save-btn" data-save-id="' + outfit.saveId + '" data-save-img="' + outfit.img + '" data-save-label="' + outfit.label + '" data-save-style="' + s.name + '" aria-label="Save to moodboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>';
    html01 += '<div class="hs-outfit-info"><span class="hs-outfit-name">' + outfit.label + '</span>';
    if (outfit.tag) html01 += '<span class="hs-outfit-tag">' + outfit.tag + '</span>';
    html01 += '</div></div>';
  });
  html01 += '</div></div></section>';

  // ===== Shop Finder HTML =====
  var SFN_CATS = [
    { id: 'tops',        label: 'Tops'        },
    { id: 'bottoms',     label: 'Bottoms'     },
    { id: 'dresses',     label: 'Dresses'     },
    { id: 'jackets',     label: 'Jackets'     },
    { id: 'shoes',       label: 'Shoes'       },
    { id: 'boots',       label: 'Boots'       },
    { id: 'bags',        label: 'Bags'        },
    { id: 'accessories', label: 'Accessories' },
    { id: 'jewelry',     label: 'Jewelry'     },
    { id: 'makeup',      label: 'Makeup'      },
    { id: 'fragrances',  label: 'Fragrances'  }
  ];
  var SFN_QUERIES = {
    classic: {
      tops:        ['classic white button down shirt', 'silk blouse women elegant', 'cotton oxford shirt women'],
      bottoms:     ['tailored trousers women classic', 'classic pleated wide leg pants', 'straight leg dress pants'],
      dresses:     ['wrap dress midi women', 'classic sheath dress office', 'shirt dress belted women'],
      jackets:     ['wool blazer women tailored', 'trench coat women classic', 'double breasted blazer women'],
      shoes:       ['pointed toe heels women classic', 'classic leather pumps women', 'oxford shoes women flat'],
      boots:       ['knee high leather boots women', 'chelsea boots women classic', 'leather ankle boots women'],
      bags:        ['structured leather handbag women', 'leather tote bag work', 'classic shoulder bag women'],
      accessories: ['silk scarf women', 'pearl earrings classic', 'leather belt women classic'],
      jewelry:     ['pearl necklace women classic', 'gold chain necklace women', 'pearl stud earrings gold'],
      makeup:      ['red lipstick classic women', 'natural coverage foundation', 'lengthening mascara classic'],
      fragrances:  ['floral elegant perfume women', 'classic eau de parfum women', 'chanel type floral perfume']
    },
    minimalist: {
      tops:        ['white minimal t shirt women', 'clean cut tank top women', 'simple linen shirt women'],
      bottoms:     ['straight leg pants neutral minimal', 'wide leg trousers beige', 'minimalist linen pants women'],
      dresses:     ['minimal slip dress women', 'simple column dress neutral', 'clean linen midi dress'],
      jackets:     ['oversized blazer neutral women', 'minimal trench coat women', 'clean cut jacket neutral'],
      shoes:       ['minimal white sneakers women', 'simple leather mules women', 'white leather flats women'],
      boots:       ['simple ankle boots neutral women', 'minimal leather boots beige', 'clean chelsea boots neutral'],
      bags:        ['minimal leather tote bag', 'simple structured leather bag', 'clean minimal shoulder bag'],
      accessories: ['simple gold hoop earrings', 'minimal leather belt women', 'clean minimal sunglasses'],
      jewelry:     ['simple gold ring women', 'thin gold chain necklace', 'minimal gold jewelry set'],
      makeup:      ['tinted moisturizer natural finish', 'no makeup skin tint', 'clean girl makeup essentials'],
      fragrances:  ['clean minimalist perfume women', 'white musk fragrance women', 'simple fresh scent women']
    },
    streetwear: {
      tops:        ['graphic tee oversized women', 'streetwear crop hoodie women', 'boxy graphic crop top'],
      bottoms:     ['cargo pants women streetwear', 'baggy jeans women streetwear', 'jogger pants women'],
      dresses:     ['jersey mini dress women', 'sporty t shirt dress women', 'oversized dress streetwear'],
      jackets:     ['bomber jacket women streetwear', 'puffer jacket oversized women', 'varsity jacket women'],
      shoes:       ['chunky platform sneakers women', 'high top sneakers women bold', 'dad sneakers women'],
      boots:       ['combat boots women lug sole', 'chunky platform boots women', 'dr martens style boots'],
      bags:        ['mini crossbody chain bag', 'canvas tote bag streetwear', 'bucket bag women urban'],
      accessories: ['beanie hat women', 'bucket hat streetwear', 'chain belt women streetwear'],
      jewelry:     ['chunky gold chain necklace', 'large hoop earrings bold', 'chunky rings streetwear set'],
      makeup:      ['glossy clear lip gloss', 'bold colorful eyeshadow palette', 'graphic liner makeup'],
      fragrances:  ['urban fresh cologne women', 'bold woody fragrance women', 'unisex modern perfume']
    },
    korean: {
      tops:        ['korean style blouse women cute', 'bow collar top women', 'korean knit top pastel'],
      bottoms:     ['korean wide leg pants women', 'pleated mini skirt plaid', 'korean a line skirt women'],
      dresses:     ['korean casual dress cute', 'babydoll dress women cute', 'korean floral dress mini'],
      jackets:     ['korean oversized cardigan women', 'pastel oversized hoodie women', 'korean cropped jacket'],
      shoes:       ['mary jane platform shoes women', 'platform loafers chunky women', 'ballet flats cute women'],
      boots:       ['platform ankle boots cute women', 'chunky lug sole boots cute', 'heeled ankle boots women'],
      bags:        ['mini shoulder bag cute women', 'korean style small bag', 'crescent bag women cute'],
      accessories: ['bow hair clips set women', 'cute korean hair accessories', 'pastel hair clips ribbon'],
      jewelry:     ['cute star earrings women', 'dainty layering necklace women', 'cute charm jewelry set'],
      makeup:      ['korean glass skin foundation', 'dewy skin tint natural', 'korean tinted lip balm'],
      fragrances:  ['sweet floral perfume women', 'soft clean floral fragrance', 'light fruity women perfume']
    },
    y2k: {
      tops:        ['y2k butterfly crop top women', 'rhinestone embellished top y2k', 'y2k baby tee graphic'],
      bottoms:     ['low rise jeans y2k women', 'pleated mini skirt y2k', 'flared pants y2k women'],
      dresses:     ['y2k mini dress women party', 'metallic mini dress silver', 'butterfly print mini dress'],
      jackets:     ['y2k faux fur jacket women', 'metallic jacket women silver', 'velvet blazer women y2k'],
      shoes:       ['platform chunky heels women y2k', 'butterfly slide sandals', 'jelly platform shoes women'],
      boots:       ['platform boots women knee high', 'patent leather ankle boots', 'chunky heel boots women'],
      bags:        ['mini rhinestone bag women y2k', 'butterfly charm bag women', 'clear mini bag y2k'],
      accessories: ['tinted y2k sunglasses women', 'butterfly hair clips pack', 'y2k choker necklace set'],
      jewelry:     ['rhinestone jewelry set y2k', 'butterfly charm bracelet', 'layered necklace set y2k'],
      makeup:      ['glitter eyeshadow palette y2k', 'glossy lip gloss pink shimmer', 'pink shimmer blush powder'],
      fragrances:  ['fruity sweet perfume women', 'pink candy body mist sweet', 'sweet bubblegum spray women']
    },
    elegant: {
      tops:        ['silk blouse women elegant', 'satin camisole top women', 'chiffon blouse women elegant'],
      bottoms:     ['wide leg dress pants elegant', 'midi pencil skirt elegant', 'silk midi skirt women'],
      dresses:     ['elegant midi dress women formal', 'cocktail dress formal women', 'satin evening dress'],
      jackets:     ['structured blazer women elegant', 'cape coat women formal', 'cashmere coat women luxury'],
      shoes:       ['strappy stiletto heels women', 'satin pointed pumps women', 'slingback heels women'],
      boots:       ['thigh high boots heeled women', 'pointed heeled ankle boots', 'sleek leather boots heel'],
      bags:        ['evening clutch bag women satin', 'elegant structured bag women', 'minaudiere clutch party'],
      accessories: ['crystal statement earrings women', 'silk headband women elegant', 'sheer gloves women'],
      jewelry:     ['diamond pendant necklace women', 'pearl drop earrings elegant', 'gold statement necklace'],
      makeup:      ['full coverage luxury foundation', 'classic red matte lipstick', 'luxury highlight palette'],
      fragrances:  ['luxury floral perfume women', 'rose oud eau de parfum', 'sophisticated elegant perfume']
    },
    casual: {
      tops:        ['casual t shirt women cotton', 'oversized sweatshirt women', 'relaxed fit shirt women'],
      bottoms:     ['casual straight jeans women', 'everyday leggings women soft', 'relaxed chinos women'],
      dresses:     ['casual sundress women everyday', 'everyday t shirt dress', 'simple casual day dress'],
      jackets:     ['denim jacket women casual', 'zip up hoodie women', 'casual utility jacket women'],
      shoes:       ['white sneakers women casual', 'slip on shoes women everyday', 'loafers women casual'],
      boots:       ['casual ankle boots flat women', 'everyday chelsea boots women', 'simple rain boots women'],
      bags:        ['canvas tote bag everyday', 'casual crossbody bag women', 'everyday backpack women'],
      accessories: ['baseball cap women casual', 'simple watch women everyday', 'casual canvas belt'],
      jewelry:     ['simple gold stud earrings', 'everyday necklace gold women', 'casual bracelet women'],
      makeup:      ['bb cream everyday coverage', 'tinted lip balm spf women', 'waterproof mascara everyday'],
      fragrances:  ['fresh daily perfume women', 'clean everyday fragrance light', 'light airy scent women']
    },
    softgirl: {
      tops:        ['soft girl crop top pastel', 'pastel baby tee women', 'ruffle collar top cute women'],
      bottoms:     ['plaid mini skirt soft girl', 'pastel pleated skirt women', 'floral print mini skirt cute'],
      dresses:     ['pastel babydoll dress women', 'soft girl aesthetic dress', 'cottagecore floral dress mini'],
      jackets:     ['fluffy cardigan pastel women', 'pastel oversized hoodie women', 'bow cropped jacket women'],
      shoes:       ['platform mary janes women', 'pastel chunky heels women', 'cute platform ballet shoes'],
      boots:       ['pink platform boots women', 'pastel chunky ankle boots', 'ribbon bow ankle boots cute'],
      bags:        ['pastel mini bag women cute', 'heart shaped bag women', 'soft plush bag charm women'],
      accessories: ['butterfly hair clips set women', 'pastel hair bow ribbon', 'cute hair accessories soft'],
      jewelry:     ['heart earrings gold cute women', 'pastel pearl jewelry set', 'charm necklace layered cute'],
      makeup:      ['soft pink blush palette women', 'pastel eyeshadow palette cute', 'glossy pink lip tint'],
      fragrances:  ['sweet cherry blossom perfume', 'cotton candy body mist women', 'soft pink floral perfume']
    },
    vintage: {
      tops:        ['vintage floral blouse women', 'retro button down shirt women', '70s boho top women'],
      bottoms:     ['vintage high waist flare jeans', 'retro wide leg pants women', 'vintage corduroy pants'],
      dresses:     ['vintage floral midi dress women', 'retro wrap dress 70s', 'boho vintage maxi dress'],
      jackets:     ['vintage denim jacket women', 'retro moto leather jacket women', 'vintage corduroy jacket'],
      shoes:       ['vintage mary jane heels women', 'retro platform wedge shoes', '70s wedge sandals women'],
      boots:       ['western cowboy boots women', 'vintage inspired ankle boots', 'vintage platform boots women'],
      bags:        ['vintage structured shoulder bag', 'retro wicker basket bag', 'boho fringe bag women'],
      accessories: ['vintage round sunglasses women', 'retro bandana scarf silk', '70s wide belt women'],
      jewelry:     ['vintage gold drop earrings', 'retro layered chain necklace', 'vintage statement ring women'],
      makeup:      ['retro red lip classic matte', 'vintage pin up makeup kit', 'cat eye liner liquid'],
      fragrances:  ['vintage musk perfume women', 'retro patchouli fragrance women', 'earthy vintage perfume']
    },
    hijabicore: {
      tops:        ['long sleeve modest top women neutral', 'oversized knit sweater women modest', 'silk long sleeve blouse women modest'],
      bottoms:     ['modest wide leg trousers women neutral', 'high waist wide leg jeans women modest', 'tailored wool trousers women modest'],
      dresses:     ['long sleeve modest maxi dress women', 'modest wrap dress women long sleeve', 'long sleeve abaya dress modest women'],
      jackets:     ['long line oversized wool coat women modest', 'tailored long blazer women modest', 'belted trench coat women modest'],
      shoes:       ['pointed flats women nude modest', 'leather loafers women modest brown', 'white leather sneakers women clean'],
      boots:       ['leather ankle boots women modest', 'knee high leather boots women modest', 'heeled ankle boots women modest brown'],
      bags:        ['brown suede tote bag women', 'structured leather shoulder bag women neutral', 'cream soft leather hobo bag women'],
      accessories: ['premium satin hijab women modest', 'chiffon hijab set women modest', 'silk modal hijab women premium'],
      jewelry:     ['gold layered pendant necklace women delicate', 'pearl hoop earrings gold women', 'gold stacking rings set women minimal'],
      makeup:      ['rose tinted lip balm warm women', 'bronzed cheek blush warm women', 'soft brown eyeshadow palette women'],
      fragrances:  ['le labo santal 33 women', 'maison margiela replica beach walk', 'diptyque tam dao eau de parfum']
    }
  };

  function sfnUrl(store, q) {
    var e = encodeURIComponent(q);
    var map = {
      'SHEIN':            'https://us.shein.com/pdsearch/' + e + '/',
      'H&M':              'https://www2.hm.com/en_us/search-results.html?q=' + e,
      'AliExpress':       'https://www.aliexpress.com/wholesale?SearchText=' + e,
      'Zara':             'https://www.zara.com/us/en/search?searchTerm=' + e,
      'ASOS':             'https://www.asos.com/search/?q=' + e,
      'COS':              'https://www.cos.com/en_usd/search.html?q=' + e,
      'Uniqlo':           'https://www.uniqlo.com/us/en/search?q=' + e,
      'Urban Outfitters': 'https://www.urbanoutfitters.com/search?q=' + e,
      'Reformation':      'https://www.thereformation.com/search?q=' + e,
      'Jacquemus':        'https://jacquemus.com/search?q=' + e,
      'Acne Studios':     'https://www.acnestudios.com/en/search?q=' + e,
      'Toteme':           'https://toteme.com/search?q=' + e,
      'Tiffany & Co.':    'https://www.tiffany.com/search/?q=' + e,
      'Sephora':          'https://www.sephora.com/search?keyword=' + e,
      'Dior Beauty':      'https://www.dior.com/en_us/beauty/search?q=' + e
    };
    return map[store] || ('#' + e);
  }

  function sfnStores(budget, cat) {
    var beauty = (cat === 'makeup' || cat === 'fragrances');
    var acc    = (cat === 'shoes' || cat === 'boots' || cat === 'bags' || cat === 'jewelry');
    if (budget === 'aff') return ['SHEIN','H&M','ASOS','Uniqlo','AliExpress'];
    if (budget === 'mid') {
      if (beauty) return ['ASOS','Urban Outfitters','H&M'];
      if (acc)    return ['Zara','ASOS','COS','Urban Outfitters'];
      return ['Zara','ASOS','COS','Uniqlo','Urban Outfitters'];
    }
    if (budget === 'lux') {
      if (beauty)            return ['Dior Beauty','Sephora'];
      if (cat === 'jewelry') return ['Tiffany & Co.','Acne Studios','Toteme'];
      return ['Reformation','Jacquemus','Acne Studios','Toteme'];
    }
    return [];
  }

  var html02 = '<section class="ssec ssec-shopfinder" style="--sfn-acc:' + theme.acc + ';--sfn-bg:' + theme.bg + ';--sfn-brd:' + theme.brd + ';--sfn-text:' + theme.text + '">';
  html02 += '<div class="ssec-inner">';
  html02 += '<span class="ssec-num">02 — Build Your Wardrobe</span>';
  html02 += '<h2 class="sfn-title">Find your piece, <em>shop it now.</em></h2>';
  html02 += '<div class="sfn-controls">';
  html02 += '<div class="sfn-ctrl-block">';
  html02 += '<p class="sfn-ctrl-q">What are you looking for?</p>';
  html02 += '<div class="sfn-cats">';
  SFN_CATS.forEach(function(cat, i) {
    html02 += '<button class="sfn-cat-btn' + (i === 0 ? ' sfn-active' : '') + '" data-sfncat="' + cat.id + '">' + cat.label + '</button>';
  });
  html02 += '</div>';
  html02 += '</div>';
  html02 += '<div class="sfn-ctrl-block sfn-budget-block">';
  html02 += '<p class="sfn-ctrl-q">What is your budget?</p>';
  html02 += '<div class="sfn-budgets">';
  [['all','All'],['aff','Affordable'],['mid','Mid-range'],['lux','Luxury']].forEach(function(b, i) {
    html02 += '<button class="sfn-bud-btn' + (i === 0 ? ' sfn-active' : '') + '" data-sfnbud="' + b[0] + '">' + b[1] + '</button>';
  });
  html02 += '</div>';
  html02 += '</div>';
  html02 += '</div>';
  html02 += '<div class="sfn-results" id="sfn-results" data-sfn-id="' + s.id + '"></div>';
  html02 += '</div></section>';

  // ── INSPIRATION — LAST SECTION ──
  var _seenInspo = new Set();
  var _uniqueOutfits = s.outfits.filter(function(o) {
    if (_seenInspo.has(o.img)) return false;
    _seenInspo.add(o.img);
    return true;
  });
  html += '<section class="ssec ssec-inspo"><div class="ssec-inner">';
  html += '<div class="ssec-inspo-header">';
  html += '<span class="ssec-num">03 — Inspiration</span>';
  html += '</div>';
  html += '<div class="ssec-inspo-grid">';
  _uniqueOutfits.forEach(function(o, i) {
    var saveId = s.id + '-outfit-' + i;
    html += '<div class="ssec-inspo-cell">';
    html += '<img src="' + o.img + '" alt="" loading="lazy">';
    html += '<button class="inspo-save-btn" data-save-id="' + saveId + '" data-save-img="' + o.img + '" data-save-label="' + (o.label || s.name + ' outfit') + '" data-save-style="' + s.name + '" aria-label="Save to moodboard">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    html += '</button>';
    html += '</div>';
  });
  html += '</div></div></section>';

  root.innerHTML = html_hero + html01 + html02 + html;

  // Shop Finder interactivity
  (function initShopFinder() {
    var resultsEl = document.getElementById('sfn-results');
    if (!resultsEl) return;
    var styleId = resultsEl.dataset.sfnId;
    var queries = SFN_QUERIES[styleId] || SFN_QUERIES.classic;
    var TIER_LABELS = { aff: 'Affordable', mid: 'Mid-range', lux: 'Luxury' };
    var activeCat = 'tops';
    var activeBud = 'all';

    function renderResults() {
      var qList = queries[activeCat] || [];
      var tiers = activeBud === 'all' ? ['aff','mid','lux'] : [activeBud];
      var out = '';
      tiers.forEach(function(t) {
        var stores = sfnStores(t, activeCat);
        if (!stores.length) return;
        if (activeBud === 'all') {
          out += '<div class="sfn-tier-block">';
          out += '<span class="sfn-tier-label sfn-tier-' + t + '">' + TIER_LABELS[t] + '</span>';
        }
        out += '<div class="sfn-cards' + (activeBud !== 'all' ? ' sfn-cards-solo' : '') + '">';
        stores.forEach(function(store, si) {
          var q = qList[si % qList.length];
          var url = sfnUrl(store, q);
          out += '<a class="sfn-card" href="' + url + '" target="_blank" rel="noopener noreferrer">';
          out += '<span class="sfn-card-store">' + store + '</span>';
          out += '<span class="sfn-card-q">' + q + '</span>';
          out += '<span class="sfn-card-arrow">→</span>';
          out += '</a>';
        });
        out += '</div>';
        if (activeBud === 'all') out += '</div>';
      });
      resultsEl.innerHTML = out || '<p class="sfn-empty">No results for this combination.</p>';
    }

    document.querySelectorAll('.sfn-cat-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeCat = btn.dataset.sfncat;
        document.querySelectorAll('.sfn-cat-btn').forEach(function(b) {
          b.classList.toggle('sfn-active', b.dataset.sfncat === activeCat);
        });
        renderResults();
      });
    });

    document.querySelectorAll('.sfn-bud-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        activeBud = btn.dataset.sfnbud;
        document.querySelectorAll('.sfn-bud-btn').forEach(function(b) {
          b.classList.toggle('sfn-active', b.dataset.sfnbud === activeBud);
        });
        renderResults();
      });
    });

    renderResults();
  })();

  // Scroll to top after render — overrides browser scroll restoration
  requestAnimationFrame(() => window.scrollTo(0, 0));

  // Wire up all save-to-moodboard buttons (inspo grid + hotspot outfit saves).
  // Guests get the signup modal; their save queues via Aura.requireAuth and
  // auto-fires after auth via main.js's registered 'save' resume handler.
  document.querySelectorAll('[data-save-id]').forEach(btn => {
    if (btn._wired) return;
    btn._wired = true;
    if (typeof isSaved === 'function' && isSaved(btn.dataset.saveId)) btn.classList.add('saved');
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const item = { id: btn.dataset.saveId, img: btn.dataset.saveImg, label: btn.dataset.saveLabel || '', style: btn.dataset.saveStyle || '' };
      // Save requires a verified email — guests get signup modal,
      // signed-in-but-unverified users get routed to the verify screen.
      const isVerified = (window.Aura && Aura.isVerifiedAccount) ? Aura.isVerifiedAccount() : false;
      try {
        if (window.Aura && Aura.track) Aura.track('save_click', { aesthetic: (item.style || '').toLowerCase().slice(0, 32) || null });
      } catch (e) {}
      if (!isVerified && window.Aura && Aura.requireVerifiedEmail) {
        try { if (Aura.track) Aura.track('save_gate_open', { aesthetic: (item.style || '').toLowerCase().slice(0, 32) || null }); } catch (e) {}
        Aura.requireVerifiedEmail({
          title: 'Save this to your moodboard',
          subtitle: 'Create your Aura profile to keep your favourite looks in one place.',
          eyebrow: 'Save look',
          pending: { key: 'save', data: item }
        }).catch(function () { /* user dismissed */ });
        return;
      }
      const added = typeof toggleMoodboard === 'function' ? toggleMoodboard(item) : false;
      btn.classList.toggle('saved', added);
      try {
        if (added && window.Aura && Aura.track) Aura.track('save_success', { aesthetic: (item.style || '').toLowerCase().slice(0, 32) || null });
      } catch (e) {}
      if (typeof showToast === 'function') showToast(added ? 'Saved to moodboard ✦' : 'Removed from moodboard');
    });
  });

  // ── Universal guest gate for ALL external shop links ────────────
  // Capture-phase delegated listener so it runs BEFORE the browser
  // honors the <a target="_blank"> default. The listener intercepts
  // ANY external retailer link the page can render — hotspot panels
  // (.hs-panel-link, .hs-panel-link-alt), Shop Finder budget cards
  // (.sfn-card), or any future `<a target="_blank">` that points
  // off-domain, including links tagged `data-shop`.
  //
  // Behavior:
  //   • Signed-in users → link opens normally.
  //   • Guests → preventDefault + show the same premium signup modal,
  //     queue the URL as a pending 'shop' action. After auth the
  //     'shop' resume handler (registered just below) shows a
  //     "Continue to {retailer} →" toast that opens the original URL.
  //
  // Same-origin links (internal nav) always pass through untouched —
  // we ONLY block links to off-origin retailers / shopping destinations.
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    var a = e.target.closest('a');
    if (!a || !a.href) return;

    // Identify shop-like links: opens-in-new-tab, OR known retailer
    // class, OR explicit data-shop attribute. (Any one is enough.)
    var isNewTab    = a.target === '_blank';
    var isShopClass = a.classList.contains('hs-panel-link')
                   || a.classList.contains('hs-panel-link-alt')
                   || a.classList.contains('hs-panel-link-shop')
                   || a.classList.contains('sfn-card');
    var isMarked    = a.hasAttribute('data-shop');
    if (!isNewTab && !isShopClass && !isMarked) return;

    // Same-origin internal links pass through (defensive — internal
    // anchors should never have target=_blank here, but we don't
    // want to swallow them if they ever do).
    var url;
    try { url = new URL(a.href, window.location.href); } catch (_) { return; }
    if (url.origin === window.location.origin && !isMarked) return;

    var isAuthed = (window.Aura && Aura.isSignedIn) ? Aura.isSignedIn() : false;

    /* Determine retailer + source ONCE — used by both the auth gate
       and the analytics events. */
    var retailer = '', pieceName = '', source = 'link';
    var panel = a.closest('.hs-panel');
    if (panel) {
      pieceName = ((panel.querySelector('.hs-panel-name')  || {}).textContent || '').trim();
      retailer  = ((panel.querySelector('.hs-panel-store') || {}).textContent || '').trim();
      if (a.classList.contains('hs-panel-link-alt')) {
        source = 'pinterest_fallback';
        retailer = 'Pinterest';
      } else if (a.classList.contains('hs-panel-link-shop')) {
        source = 'google_shopping_fallback';
        retailer = 'Google Shopping';
      } else {
        source = 'hotspot';
      }
    } else if (a.classList.contains('sfn-card')) {
      retailer  = ((a.querySelector('.sfn-card-store') || {}).textContent || '').trim();
      pieceName = ((a.querySelector('.sfn-card-q')     || {}).textContent || '').trim();
      source    = 'shop_finder';
    } else {
      retailer  = (a.dataset && a.dataset.retailer) || url.hostname.replace(/^www\./, '') || 'retailer';
      pieceName = (a.dataset && a.dataset.piece) || (a.textContent || '').trim();
      source    = 'other';
    }
    /* Aesthetic id is in the URL hash on style.html */
    var aestheticId = null;
    try {
      var h = (location.hash || '').replace('#', '').toLowerCase();
      if (h) aestheticId = h.split(/[?&]/)[0].slice(0, 32);
    } catch (_) {}

    /* Analytics — fire regardless of auth state so we can correlate
       guest gate opens with later signups via sessionId. */
    try {
      if (window.Aura && window.Aura.track) {
        window.Aura.track(isAuthed ? 'shop_click' : 'shop_gate_open', {
          retailer:  retailer ? String(retailer).slice(0, 80) : null,
          category:  pieceName ? String(pieceName).slice(0, 40) : null,
          source:    source,
          aesthetic: aestheticId,
          shopUrl:   String(a.href || '').slice(0, 600)
        });
      }
    } catch (_) {}

    if (isAuthed) return; // logged in: open normally
    if (!window.Aura || !Aura.requireAuth) return; // helper not loaded — degrade gracefully

    e.preventDefault();
    e.stopPropagation();

    Aura.requireAuth({
      title:    'Sign in to shop this look',
      subtitle: 'Create your Aura profile to follow shoppable links and save your favourites.',
      eyebrow:  retailer ? ('Shop · ' + retailer) : 'Shop',
      pending:  { key: 'shop', data: { url: a.href, retailer: retailer || 'retailer', piece: pieceName || '' } }
    }).catch(function () { /* dismissed */ });
  }, true);

  // Resume handler for shop clicks (registered once globally).
  if (window.Aura && Aura.registerResume) {
    Aura.registerResume('shop', function (shop) {
      if (!shop || !shop.url) return;
      Aura.showResumeToast({
        message: shop.piece ? ('Saved your interest in: ' + shop.piece) : 'Welcome to Aura Glossy',
        ctaLabel: 'Continue to ' + (shop.retailer || 'retailer') + ' →',
        onContinue: function () {
          // User-gesture-driven window.open survives most popup blockers in
          // regular browsers. In-app browsers (TikTok/Instagram/etc.) SILENTLY
          // return null from window.open without throwing — fall back to a
          // same-tab navigation so the user actually reaches the retailer.
          var w = null;
          try { w = window.open(shop.url, '_blank', 'noopener'); } catch (e) {}
          if (!w) window.location.href = shop.url;
        }
      });
    });
  }

  // Hotspot interactions
  // Desktop: hover to preview (320 ms grace period so the popup doesn't vanish
  //          while moving from dot to panel), click to pin/lock open.
  // Touch:   tap to open, tap same dot or outside to close.
  (function initHotspots() {
    var hsDots = Array.from(document.querySelectorAll('.hs-dot'));
    if (!hsDots.length) return;
    var isHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var _locked = null; /* dot currently click-pinned open */

    function setEdge(dot) {
      var wrap = dot.closest('.hs-outfit-wrap');
      if (!wrap) return;
      var wr = wrap.getBoundingClientRect(), dr = dot.getBoundingClientRect();
      var xPct = ((dr.left + dr.width / 2) - wr.left) / wr.width * 100;
      var yPct = ((dr.top  + dr.height / 2) - wr.top)  / wr.height * 100;
      dot.classList.toggle('panel-right', xPct > 65);
      dot.classList.toggle('panel-left',  xPct < 30);
      dot.classList.toggle('panel-below', yPct < 32);
    }

    function closeAll(except) {
      hsDots.forEach(function(d) {
        if (d !== except) {
          d.classList.remove('open', 'locked');
          if (d === _locked) _locked = null;
        }
      });
    }

    if (isHover) {
      /* ── Desktop: hover preview + click-to-lock ──────────── */
      hsDots.forEach(function(dot) {
        var panel  = dot.querySelector('.hs-panel');
        var _timer = null;

        function open() {
          clearTimeout(_timer);
          closeAll(dot);
          setEdge(dot);
          dot.classList.add('open');
        }
        function scheduleClose() {
          clearTimeout(_timer);
          /* 320 ms grace — plenty of time to move from dot → panel */
          _timer = setTimeout(function() {
            if (dot !== _locked) dot.classList.remove('open');
          }, 320);
        }
        function cancelClose() { clearTimeout(_timer); }

        dot.addEventListener('mouseenter', open);
        dot.addEventListener('mouseleave', function() {
          if (dot !== _locked) scheduleClose();
        });
        if (panel) {
          /* Moving into the panel cancels the pending close */
          panel.addEventListener('mouseenter', cancelClose);
          panel.addEventListener('mouseleave', function() {
            if (dot !== _locked) scheduleClose();
          });
        }

        /* Click: pin open (or unpin if already locked) */
        dot.addEventListener('click', function(e) {
          e.stopPropagation();
          if (_locked === dot) {
            /* Already pinned — unpin and close */
            _locked = null;
            dot.classList.remove('locked', 'open');
          } else {
            /* Pin this dot open */
            if (_locked) { _locked.classList.remove('locked', 'open'); }
            _locked = dot;
            cancelClose();
            setEdge(dot);
            dot.classList.add('open', 'locked');
          }
        });
      });

    } else {
      /* ── Touch: tap to open, tap same dot or outside to close ── */
      hsDots.forEach(function(dot) {
        dot.addEventListener('click', function(e) {
          e.stopPropagation();
          var wasOpen = dot.classList.contains('open');
          closeAll();
          if (!wasOpen) { setEdge(dot); dot.classList.add('open'); }
        });
      });
    }

    /* Tap / click outside → close everything */
    document.addEventListener('click', function() {
      closeAll();
      _locked = null;
    });

    /* Clicks inside a panel stay inside the panel */
    document.querySelectorAll('.hs-panel').forEach(function(p) {
      p.addEventListener('click', function(e) { e.stopPropagation(); });
    });
  })();

  /* ✦✦ Per-user features — recently viewed + aesthetic like button ✦✦ */
  function _initUserFeatures() {
    /* Record this aesthetic as recently viewed (debounced 2s in firebase.js) */
    if (typeof fbRecordView === 'function') fbRecordView(s.id, s.name);
    /* Analytics — aesthetic_view fires once per render (style-page is a
       single-page surface, so re-renders are intentional re-views). */
    try {
      if (window.Aura && Aura.track) Aura.track('aesthetic_view', { aesthetic: (s.id || '').toLowerCase().slice(0, 32) || null });
    } catch (e) {}

    /* Like button — sync state from Firestore then wire click */
    var likeBtn = document.getElementById('aesthetic-like-btn');
    if (!likeBtn || typeof fbGetLikedAesthetics !== 'function') return;

    fbGetLikedAesthetics().then(function(liked) {
      var isLiked = liked.some(function(a) { return a.id === s.id; });
      likeBtn.classList.toggle('liked', isLiked);
      var lbl = likeBtn.querySelector('.aesthetic-like-label');
      if (lbl) lbl.textContent = isLiked ? 'Saved' : 'Save';
    }).catch(function() {});

    likeBtn.addEventListener('click', function() {
      if (typeof fbToggleLikeAesthetic !== 'function') return;
      fbToggleLikeAesthetic(s.id, s.name).then(function(nowLiked) {
        likeBtn.classList.toggle('liked', nowLiked);
        var lbl = likeBtn.querySelector('.aesthetic-like-label');
        if (lbl) lbl.textContent = nowLiked ? 'Saved' : 'Save';
        if (typeof showToast === 'function') {
          showToast(nowLiked ? s.name + ' aesthetic saved ✦' : 'Removed from saved aesthetics');
        }
      }).catch(function() {});
    });
  }

  /* Wait for Firebase auth confirmation before initialising user features */
  if (typeof _auth !== 'undefined') {
    _auth.onAuthStateChanged(function(user) { if (user) _initUserFeatures(); });
  }
})();
