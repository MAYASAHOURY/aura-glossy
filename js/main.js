/* ========================================
   AURA — Shared front-end logic
   ======================================== */

// Global image helper for inline HTML scripts.
function aurImg(q, w, h) {
  w = w || 600; h = h || 800;
  q = String(q);
  const aesthetic = (typeof detectAesthetic !== 'undefined') ? detectAesthetic(q) : null;
  const pool = (aesthetic && typeof IMG_POOLS !== 'undefined' && IMG_POOLS[aesthetic])
            || (typeof IMG_FALLBACK !== 'undefined' && IMG_FALLBACK)
            || ['1490481651871-ab68de25d43d'];
  let seed = 0;
  for (let i = 0; i < q.length; i++) seed = (seed * 31 + q.charCodeAt(i)) >>> 0;
  const photoId = pool[seed % pool.length];
  return 'https://images.unsplash.com/photo-' + photoId + '?w=' + w + '&h=' + h + '&fit=crop&crop=faces,edges&auto=format&q=80';
}

// ---- Moodboard storage ----
function loadMoodboard() {
  try { return JSON.parse(window.name || '[]'); } catch (e) { return []; }
}
function saveMoodboard(items) { window.name = JSON.stringify(items); }
function toggleMoodboard(item) {
  const items = loadMoodboard();
  const i = items.findIndex(x => x.id === item.id);
  if (i >= 0) { items.splice(i, 1); saveMoodboard(items); return false; }
  items.push(item); saveMoodboard(items); return true;
}
function isSaved(id) { return loadMoodboard().some(x => x.id === id); }

// ---- Toast ----
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ---- Reveal on scroll ----
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => obs.observe(el));
}

// ---- Save buttons ----
function attachSaveButtons() {
  document.querySelectorAll('[data-save-id]').forEach(btn => {
    if (btn._wired) return;
    btn._wired = true;
    const id = btn.dataset.saveId;
    if (isSaved(id)) btn.classList.add('saved');
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const item = { id, img: btn.dataset.saveImg, label: btn.dataset.saveLabel || '', style: btn.dataset.saveStyle || '' };
      const added = toggleMoodboard(item);
      btn.classList.toggle('saved', added);
      showToast(added ? 'Saved to moodboard ✦' : 'Removed from moodboard');
    });
  });
}

// ---- AI Stylist response engine ----
function getAiResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  const responses = (typeof AI_RESPONSES !== 'undefined') ? AI_RESPONSES : [];

  // Detect budget intent from message
  function detectBudget(m) {
    if (/\b(cheap|affordable|budget|on a budget|inexpensive|low.?cost|bargain|under \$[0-9]|thrift|fast fashion)\b/.test(m)) return 'aff';
    if (/\b(luxury|designer|high.?end|splurge|investment piece|premium|upscale|high fashion)\b/.test(m)) return 'lux';
    if (/\b(mid.?range|moderate|reasonable price|not too expensive)\b/.test(m)) return 'mid';
    return null;
  }

  // Score each response — multi-word phrases count more than single keywords
  let best = null, bestScore = 0;
  responses.forEach(r => {
    let score = 0;
    r.keywords.forEach(kw => {
      if (msg.includes(kw.toLowerCase())) {
        const wordCount = kw.trim().split(/\s+/).length;
        score += wordCount > 1 ? wordCount + 1 : 1; // phrase bonus
      }
    });
    if (score > bestScore) { bestScore = score; best = r; }
  });

  if (!best || bestScore === 0) {
    const fallbacks = (typeof AI_FALLBACKS !== 'undefined') ? AI_FALLBACKS : ['Tell me more.'];
    return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)], products: [] };
  }

  // Filter products by detected budget tier if possible
  const budget = detectBudget(msg);
  let products = (best.products || []).slice();
  if (budget && products.length >= 2) {
    const filtered = products.filter(p => p.tier === budget);
    if (filtered.length >= 1) products = filtered;
  }

  return { text: best.response, products };
}

// ---- Swap hardcoded URLs to local images ----
function swapToLocal() {
  if (typeof USE_LOCAL_IMAGES === 'undefined' || !USE_LOCAL_IMAGES) return;
  document.querySelectorAll('img[data-local]').forEach(img => {
    img.src = img.dataset.local;
  });
}

// ---- Gracefully hide broken images ----
function watchBrokenImages() {
  function handle(img) {
    if (img._wired_err) return;
    img._wired_err = true;
    img.addEventListener('error', () => {
      img.classList.add('broken-image');
      img.removeAttribute('src');
      img.removeAttribute('alt');
    }, { once: true });
  }
  document.querySelectorAll('img').forEach(handle);
  if ('MutationObserver' in window) {
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (n.tagName === 'IMG') handle(n);
          else if (n.querySelectorAll) n.querySelectorAll('img').forEach(handle);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
}

// ---- DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  swapToLocal();
  watchBrokenImages();
  initReveal();
  attachSaveButtons();
  initNavBurger();
});

// ---- Mobile hamburger menu ----
// Wiring is centralised in firebase.js (wireBurgerOnce) so EVERY page
// — including community.html and settings.html which don't load main.js
// — gets the same instant-response pointerup + click handler. We keep
// this stub so the DOMContentLoaded sequence below still has a function
// to call; it's a no-op when firebase.js has already wired the burger.
function initNavBurger() {
  var burger = document.querySelector('.nav-burger');
  if (!burger || burger._wired) return;
  /* Defensive fallback in the unlikely case firebase.js hasn't loaded
     yet (e.g. blocked by a CSP / network failure). Mirrors the simple
     toggle without the pointerup fast path. */
  var nav = burger.closest('.nav');
  if (!nav) return;
  burger._wired = true;
  function toggle(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    nav.classList.toggle('nav-open');
  }
  burger.addEventListener('click', toggle);
  burger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
  });
  nav.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('nav-open'); });
  });
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) nav.classList.remove('nav-open');
  });
}

// ============================================================
// EXPANDED SHOPPING — multiple stores per category × 3 tiers
// Runtime generation so we don't bloat data.js
// ============================================================
const EXTRA_STORE_URLS = {
  'AliExpress':       q => 'https://www.aliexpress.com/wholesale?SearchText=' + encodeURIComponent(q),
  'Cider':            q => 'https://www.shopcider.com/search?keyword=' + encodeURIComponent(q),
  'Princess Polly':   q => 'https://us.princesspolly.com/search?q=' + encodeURIComponent(q),
  'Urban Outfitters': q => 'https://www.urbanoutfitters.com/search?q=' + encodeURIComponent(q),
  'Free People':      q => 'https://www.freepeople.com/search?q=' + encodeURIComponent(q),
  'Reformation':      q => 'https://www.thereformation.com/search?q=' + encodeURIComponent(q),
  'Aritzia':          q => 'https://www.aritzia.com/us/en/search?q=' + encodeURIComponent(q),
  '& Other Stories':  q => 'https://www.stories.com/en_usd/search.html?q=' + encodeURIComponent(q),
  'Toteme':           q => 'https://toteme-studio.com/search?q=' + encodeURIComponent(q),
  'A.P.C.':           q => 'https://www.apc-us.com/search?q=' + encodeURIComponent(q),
  'Charles & Keith':  q => 'https://www.charleskeith.com/us/search?q=' + encodeURIComponent(q),
  'JW PEI':           q => 'https://www.jwpei.com/search?q=' + encodeURIComponent(q),
  'Polène':           q => 'https://en.polene-paris.com/search?q=' + encodeURIComponent(q),
  'Pandora':          q => 'https://us.pandora.net/en/search?q=' + encodeURIComponent(q),
  'Acne Studios':     q => 'https://www.acnestudios.com/us/en/search?q=' + encodeURIComponent(q),
  'Jacquemus':        q => 'https://www.jacquemus.com/en-us/search?q=' + encodeURIComponent(q),
  'Dior Beauty':      q => 'https://www.dior.com/en_us/beauty/search-results?query=' + encodeURIComponent(q),
  'Chanel':           q => 'https://www.chanel.com/us/search/?query=' + encodeURIComponent(q),
  'Tom Ford':         q => 'https://www.tomfordbeauty.com/search?q=' + encodeURIComponent(q),
  'NYX':              q => 'https://www.nyxcosmetics.com/search?q=' + encodeURIComponent(q),
  'Kiko Milano':      q => 'https://www.kikocosmetics.com/en-us/search?q=' + encodeURIComponent(q),
  'e.l.f.':           q => 'https://www.elfcosmetics.com/search?q=' + encodeURIComponent(q),
  'Rare Beauty':      q => 'https://www.sephora.com/search?keyword=' + encodeURIComponent('rare beauty ' + q),
  'Glossier':         q => 'https://www.glossier.com/search?q=' + encodeURIComponent(q),
  'Converse':         q => 'https://www.converse.com/c/search?q=' + encodeURIComponent(q),
  'Adidas':           q => 'https://www.adidas.com/us/search?q=' + encodeURIComponent(q),
  'Nike':             q => 'https://www.nike.com/w?q=' + encodeURIComponent(q),
  'Dr. Martens':      q => 'https://www.drmartens.com/us/en/search?q=' + encodeURIComponent(q),
  'Tiffany & Co.':    q => 'https://www.tiffany.com/search/?q=' + encodeURIComponent(q),
  'Massimo Dutti':    q => 'https://www.massimodutti.com/us/search?term=' + encodeURIComponent(q),
  'Mejuri':           q => 'https://mejuri.com/search?q=' + encodeURIComponent(q)
};

function expandedShopUrl(store, q) {
  if (EXTRA_STORE_URLS[store]) return EXTRA_STORE_URLS[store](q);
  if (typeof STORE_URLS !== 'undefined' && STORE_URLS[store]) return STORE_URLS[store](q);
  return 'https://www.google.com/search?q=' + encodeURIComponent(store + ' ' + q);
}

// Stores per category × tier — generates a much wider catalog per style
const EXPANDED_STORES = {
  clothing: {
    aff: ['SHEIN', 'AliExpress', 'COS', 'Cider', 'Princess Polly', 'H&M', 'Bershka', 'H&M', 'Zara'],
    mid: ['Zara', 'COS', 'ASOS', 'COS', 'Uniqlo', '& Other Stories', 'Urban Outfitters', 'Aritzia', 'Free People'],
    lux: ['Massimo Dutti', 'Reformation', 'Toteme', 'A.P.C.', 'Acne Studios', 'Jacquemus']
  },
  shoes: {
    aff: ['SHEIN', 'AliExpress', 'COS', 'Cider', 'Princess Polly', 'H&M', 'Bershka', 'Zara'],
    mid: ['Adidas', 'Nike', 'Converse', 'Zara', 'ASOS', 'COS', 'Charles & Keith'],
    lux: ['Dr. Martens', 'Acne Studios', 'Jacquemus', 'Reformation']
  },
  bags: {
    aff: ['SHEIN', 'AliExpress', 'COS', 'Cider', 'Princess Polly', 'H&M', 'Bershka', 'Zara'],
    mid: ['Charles & Keith', 'JW PEI', 'Zara', 'COS', 'ASOS', '& Other Stories', 'Aritzia'],
    lux: ['Polène', 'Jacquemus', 'COS', 'Toteme']
  },
  accessories: {
    aff: ['SHEIN', 'AliExpress', 'COS', 'Cider', 'Princess Polly', 'H&M', 'Bershka', 'Zara'],
    mid: ['Urban Outfitters', 'COS', 'COS', 'Zara', 'ASOS', '& Other Stories'],
    lux: ['Acne Studios', 'Polène', 'Jacquemus']
  },
  beauty: {
    aff: ['SHEIN', 'e.l.f.', 'Kiko Milano', 'NYX'],
    mid: ['Sephora', 'Rare Beauty', 'Glossier', 'COS'],
    lux: ['Dior Beauty', 'Chanel', 'Tom Ford']
  },
  jewelry: {
    aff: ['SHEIN', 'AliExpress', 'COS', 'Cider', 'H&M', 'Pandora'],
    mid: ['Mejuri', 'Pandora', '& Other Stories', 'Urban Outfitters', 'Etsy'],
    lux: ['Mejuri', 'Tiffany & Co.']
  }
};

// Aesthetic-specific store lists — each style gets brands that actually fit its identity
const AESTHETIC_EXPANDED_STORES = {
  classic: {
    clothing:    { aff: ['H&M','Bershka','H&M','ASOS'], mid: ['Zara','COS','COS','Massimo Dutti','Uniqlo','& Other Stories'], lux: ['Toteme','A.P.C.','Reformation','Jacquemus','Acne Studios'] },
    shoes:       { aff: ['H&M','ASOS','Bershka'], mid: ['COS','Zara','Charles & Keith','COS'], lux: ['A.P.C.','Dr. Martens','Toteme'] },
    bags:        { aff: ['H&M','ASOS'], mid: ['COS','Charles & Keith','Zara','COS'], lux: ['Polène','A.P.C.','Toteme','Jacquemus'] },
    accessories: { aff: ['H&M','ASOS'], mid: ['COS','COS','& Other Stories','Zara'], lux: ['A.P.C.','Toteme'] },
    beauty:      { aff: ['e.l.f.','NYX','Kiko Milano'], mid: ['Sephora','Rare Beauty','Glossier'], lux: ['Chanel','Dior Beauty','Tom Ford'] },
    jewelry:     { aff: ['H&M','Pandora'], mid: ['Mejuri','& Other Stories','Pandora'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  casual: {
    clothing:    { aff: ['H&M','Uniqlo','Bershka','H&M'], mid: ['Zara','COS','Levis','Aritzia','Free People','Urban Outfitters'], lux: ['Everlane','COS','A.P.C.','Toteme'] },
    shoes:       { aff: ['H&M','ASOS','Converse'], mid: ['Nike','Adidas','Converse','COS','Zara'], lux: ['Nike','A.P.C.','Acne Studios'] },
    bags:        { aff: ['H&M','ASOS'], mid: ['COS','Charles & Keith','Urban Outfitters','Zara'], lux: ['A.P.C.','Toteme','Polène'] },
    accessories: { aff: ['H&M','ASOS','Cider'], mid: ['Urban Outfitters','COS','Zara','Nike'], lux: ['A.P.C.','Acne Studios'] },
    beauty:      { aff: ['e.l.f.','NYX','Glossier'], mid: ['Glossier','Rare Beauty','Sephora'], lux: ['Chanel','Dior Beauty'] },
    jewelry:     { aff: ['H&M','Pandora'], mid: ['Pandora','Mejuri','& Other Stories'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  streetwear: {
    clothing:    { aff: ['SHEIN','H&M','Cider','AliExpress','H&M','Bershka'], mid: ['Nike','Adidas','Urban Outfitters','ASOS','Zara'], lux: ['Acne Studios','Jacquemus','A.P.C.'] },
    shoes:       { aff: ['SHEIN','H&M','AliExpress','Cider'], mid: ['Nike','Adidas','Converse','ASOS'], lux: ['Nike','Adidas','Acne Studios'] },
    bags:        { aff: ['SHEIN','H&M','AliExpress'], mid: ['Nike','Adidas','Urban Outfitters','ASOS'], lux: ['A.P.C.','Acne Studios','Jacquemus'] },
    accessories: { aff: ['SHEIN','H&M','AliExpress','Cider'], mid: ['Nike','Urban Outfitters','ASOS','Adidas'], lux: ['Acne Studios','A.P.C.'] },
    beauty:      { aff: ['NYX','e.l.f.','Kiko Milano'], mid: ['Rare Beauty','Sephora','Glossier'], lux: ['Chanel','Tom Ford','Dior Beauty'] },
    jewelry:     { aff: ['SHEIN','H&M','AliExpress'], mid: ['Urban Outfitters','Pandora','Mejuri'], lux: ['Mejuri','Acne Studios'] }
  },
  minimalist: {
    clothing:    { aff: ['Uniqlo','H&M','SHEIN'], mid: ['COS','COS','& Other Stories','Aritzia','Zara'], lux: ['Toteme','A.P.C.','Acne Studios','Jacquemus'] },
    shoes:       { aff: ['H&M','Uniqlo','SHEIN'], mid: ['COS','COS','Zara','& Other Stories'], lux: ['Toteme','A.P.C.','Acne Studios'] },
    bags:        { aff: ['H&M','Uniqlo'], mid: ['COS','COS','& Other Stories','Charles & Keith'], lux: ['Polène','A.P.C.','Toteme'] },
    accessories: { aff: ['Uniqlo','H&M'], mid: ['COS','& Other Stories','COS'], lux: ['Mejuri','A.P.C.','Toteme'] },
    beauty:      { aff: ['e.l.f.','NYX','Kiko Milano'], mid: ['Glossier','Rare Beauty','Sephora'], lux: ['Chanel','Dior Beauty','Tom Ford'] },
    jewelry:     { aff: ['H&M','Pandora'], mid: ['Mejuri','& Other Stories','COS'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  elegant: {
    clothing:    { aff: ['SHEIN','H&M','ASOS','Zara'], mid: ['COS','Zara','& Other Stories','Reformation','Charles & Keith'], lux: ['Reformation','Jacquemus','Toteme'] },
    shoes:       { aff: ['SHEIN','H&M','ASOS'], mid: ['COS','Charles & Keith','Zara','& Other Stories'], lux: ['Jacquemus','Reformation','A.P.C.'] },
    bags:        { aff: ['SHEIN','H&M','ASOS'], mid: ['Charles & Keith','COS','JW PEI','Zara'], lux: ['Polène','Jacquemus','A.P.C.','Toteme'] },
    accessories: { aff: ['SHEIN','H&M','ASOS'], mid: ['COS','& Other Stories','Zara','COS'], lux: ['Mejuri','Tiffany & Co.','Jacquemus'] },
    beauty:      { aff: ['e.l.f.','NYX','Kiko Milano'], mid: ['Sephora','Rare Beauty','Glossier'], lux: ['Chanel','Dior Beauty','Tom Ford'] },
    jewelry:     { aff: ['H&M','Pandora'], mid: ['Mejuri','Pandora','& Other Stories'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  korean: {
    clothing:    { aff: ['COS','SHEIN','Cider','AliExpress','Bershka'], mid: ['Uniqlo','COS','ASOS','& Other Stories','Zara'], lux: ['Acne Studios','A.P.C.','Toteme','Jacquemus'] },
    shoes:       { aff: ['COS','SHEIN','Cider','AliExpress'], mid: ['Charles & Keith','COS','Zara','ASOS'], lux: ['A.P.C.','Acne Studios','Jacquemus'] },
    bags:        { aff: ['COS','SHEIN','Cider','AliExpress'], mid: ['Charles & Keith','COS','JW PEI'], lux: ['Polène','Jacquemus','A.P.C.'] },
    accessories: { aff: ['COS','SHEIN','Cider','AliExpress'], mid: ['& Other Stories','COS','Urban Outfitters'], lux: ['Mejuri','Acne Studios'] },
    beauty:      { aff: ['e.l.f.','NYX','COS'], mid: ['Sephora','Rare Beauty','Glossier'], lux: ['Chanel','Dior Beauty'] },
    jewelry:     { aff: ['COS','SHEIN','Cider'], mid: ['Pandora','Mejuri','& Other Stories'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  y2k: {
    clothing:    { aff: ['SHEIN','Cider','AliExpress','Bershka','Princess Polly','H&M'], mid: ['ASOS','Urban Outfitters','Zara','Zara','Princess Polly'], lux: ['Jacquemus','Acne Studios'] },
    shoes:       { aff: ['SHEIN','Cider','AliExpress','Bershka'], mid: ['ASOS','Urban Outfitters','Zara','Adidas'], lux: ['Jacquemus','Acne Studios'] },
    bags:        { aff: ['SHEIN','Cider','AliExpress'], mid: ['ASOS','Urban Outfitters','Princess Polly'], lux: ['Jacquemus','Polène'] },
    accessories: { aff: ['SHEIN','Cider','AliExpress','Princess Polly'], mid: ['Urban Outfitters','ASOS','Zara'], lux: ['Acne Studios','Jacquemus'] },
    beauty:      { aff: ['NYX','e.l.f.','Kiko Milano'], mid: ['Rare Beauty','Glossier','Sephora'], lux: ['Chanel','Dior Beauty','Tom Ford'] },
    jewelry:     { aff: ['SHEIN','Cider','AliExpress'], mid: ['Urban Outfitters','Pandora','Princess Polly'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  vintage: {
    clothing:    { aff: ['Depop','Etsy','SHEIN','H&M','ASOS'], mid: ['Beyond Retro','Urban Outfitters','Free People','COS','Etsy'], lux: ['Reformation','A.P.C.','Toteme'] },
    shoes:       { aff: ['Depop','Etsy','SHEIN','H&M'], mid: ['COS','Dr. Martens','Urban Outfitters','ASOS'], lux: ['Dr. Martens','A.P.C.','Reformation'] },
    bags:        { aff: ['Depop','Etsy','SHEIN'], mid: ['Etsy','Urban Outfitters','COS','Beyond Retro'], lux: ['A.P.C.','Reformation','Polène'] },
    accessories: { aff: ['Depop','Etsy','SHEIN','H&M'], mid: ['Urban Outfitters','Etsy','COS','ASOS'], lux: ['Mejuri','A.P.C.'] },
    beauty:      { aff: ['NYX','e.l.f.','Kiko Milano'], mid: ['Sephora','Rare Beauty','Glossier'], lux: ['Chanel','Dior Beauty','Tom Ford'] },
    jewelry:     { aff: ['Depop','Etsy','SHEIN','H&M'], mid: ['Etsy','Mejuri','Urban Outfitters'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  softgirl: {
    clothing:    { aff: ['SHEIN','Cider','Princess Polly','AliExpress','H&M'], mid: ['Brandy Melville','COS','ASOS','Urban Outfitters','& Other Stories'], lux: ['Reformation','Jacquemus','Polène'] },
    shoes:       { aff: ['SHEIN','Cider','AliExpress','H&M'], mid: ['COS','Zara','Charles & Keith','ASOS'], lux: ['Jacquemus','Reformation','A.P.C.'] },
    bags:        { aff: ['SHEIN','Cider','AliExpress'], mid: ['Charles & Keith','COS','Princess Polly'], lux: ['Polène','Jacquemus','A.P.C.'] },
    accessories: { aff: ['SHEIN','Cider','AliExpress','H&M'], mid: ['Urban Outfitters','COS','& Other Stories'], lux: ['Mejuri','Tiffany & Co.'] },
    beauty:      { aff: ['e.l.f.','NYX','Kiko Milano'], mid: ['Rare Beauty','Glossier','Sephora'], lux: ['Chanel','Dior Beauty'] },
    jewelry:     { aff: ['SHEIN','Cider','H&M','Pandora'], mid: ['Pandora','Mejuri','& Other Stories'], lux: ['Mejuri','Tiffany & Co.'] }
  },
  hijabicore: {
    clothing:    { aff: ['SHEIN','H&M','Uniqlo','Modanisa'], mid: ['COS','Zara','Uniqlo','& Other Stories','Modanisa'], lux: ['Toteme','Acne Studios','COS','A.P.C.'] },
    shoes:       { aff: ['H&M','SHEIN','Uniqlo'], mid: ['COS','Zara','Charles & Keith','Adidas'], lux: ['COS','Toteme','Acne Studios'] },
    bags:        { aff: ['H&M','SHEIN','Zara'], mid: ['COS','Charles & Keith','Zara'], lux: ['Polène','COS','Toteme','Acne Studios'] },
    accessories: { aff: ['Modanisa','SHEIN','H&M'], mid: ['Modanisa','COS','Zara','& Other Stories'], lux: ['COS','Toteme','Modanisa'] },
    beauty:      { aff: ['e.l.f.','NYX','Kiko Milano'], mid: ['Sephora','Rare Beauty','Glossier'], lux: ['Chanel','Dior Beauty','Tom Ford'] },
    jewelry:     { aff: ['H&M','Pandora','SHEIN'], mid: ['Mejuri','Pandora','& Other Stories'], lux: ['Mejuri','Tiffany & Co.'] }
  }
};

// Aesthetic-appropriate item names — used instead of generic "Store — Category"
const AESTHETIC_ITEM_NAMES = {
  classic:    { clothing: ['Tailored Blazer','White Shirt','High-Waist Trousers','Cashmere Knit','Trench Coat','Midi Skirt','Wool Coat','Silk Blouse','Pencil Skirt','Button-Down'], shoes: ['Leather Loafers','Pointed Flats','Slingback Heels','Oxford Flats','Classic Pumps'], bags: ['Leather Tote','Structured Shoulder Bag','Top-Handle','Leather Satchel'], accessories: ['Silk Scarf','Leather Belt','Classic Sunglasses','Hair Pin'], beauty: ['Nude Lip','Rosy Blush','Mascara','Perfume'], jewelry: ['Pearl Studs','Gold Hoops','Gold Watch','Fine Chain'] },
  casual:     { clothing: ['Straight-Leg Jeans','Crew Sweatshirt','Oversized Tee','Knit Sweater','Denim Jacket','Cotton Hoodie','Linen Shirt','Wide-Leg Pants','Zip-Up Sweatshirt'], shoes: ['White Sneakers','Canvas Shoes','Low-Top Trainers','Slides','Slip-Ons'], bags: ['Canvas Tote','Crossbody Bag','Mini Backpack','Woven Tote'], accessories: ['Baseball Cap','Knit Beanie','Simple Belt','Sunglasses'], beauty: ['Tinted Lip Balm','Brow Gel','Clear Mascara','Skin Tint'], jewelry: ['Gold Hoops','Small Studs','Simple Chain','Signet Ring'] },
  streetwear: { clothing: ['Oversized Hoodie','Cargo Pants','Graphic Tee','Baggy Jeans','Track Jacket','Wide-Leg Cargos','Bomber Jacket','Basketball Shorts','Cropped Tee','Windbreaker'], shoes: ['Chunky Sneakers','Air Force 1','Platform Boots','Running Sneakers','Jordan High'], bags: ['Sling Bag','Belt Bag','Mini Backpack','Crossbody Pack'], accessories: ['Bucket Hat','Beanie','Chain Necklace','Sunglasses'], beauty: ['Glossy Lip','Smoked Liner','Bronzer','Body Shimmer'], jewelry: ['Chunky Chain','Silver Hoops','Layered Necklaces','Ear Cuff'] },
  minimalist: { clothing: ['Linen Shirt','Wide-Leg Trousers','Cashmere Knit','Simple Dress','Wool Coat','Turtleneck','Slim Trousers','Merino Blazer','Fluid Top'], shoes: ['Square-Toe Loafers','Leather Mules','White Sneakers','Pointed Flats','Simple Sandals'], bags: ['Structured Tote','Leather Shoulder Bag','Clean Crossbody','Minimal Clutch'], accessories: ['Linen Scarf','Thin Belt','Minimal Sunglasses','Simple Hair Pin'], beauty: ['Berry Tint','Skin Finish','Brow Serum','Perfume'], jewelry: ['Thin Gold Chain','Geometric Earrings','Gold Ring','Simple Stud'] },
  elegant:    { clothing: ['Satin Slip Dress','Silk Blouse','Pleated Midi Skirt','Lace-Trim Top','Fitted Turtleneck','Velvet Dress','Chiffon Blouse','Wrap Dress'], shoes: ['Kitten Heel Slingbacks','Satin Mules','Low Block Heels','Pointed Pumps','Ballet Flats'], bags: ['Top-Handle Bag','Pearl Clutch','Mini Shoulder Bag','Evening Bag'], accessories: ['Pearl Hair Clip','Silk Scarf','Satin Hair Band','Velvet Bow'], beauty: ['Pink Lip','Rosy Eyeshadow','Glowing Skin','Soft Blush'], jewelry: ['Pearl Studs','Pearl Drops','Gold Pendant','Crystal Earrings'] },
  korean:     { clothing: ['Oversized Cardigan','Pleated Mini Skirt','Cropped Knit','Pastel Blazer','Ruffle Blouse','Soft Denim Skirt','Layer Turtleneck','School Dress'], shoes: ['Mary Jane Flats','White Sneakers','Platform Loafers','Ballet Flats','Block-Heel Pumps'], bags: ['Mini Shoulder Bag','Quilted Chain Bag','Cute Bucket Bag','Pearl Mini'], accessories: ['Pearl Hair Clips','Bow Hair Clip','Knee-High Socks','Hair Band'], beauty: ['Lip Tint','Glass Skin Serum','Cushion Foundation','Dewy Blush'], jewelry: ['Pearl Pendant','Heart Necklace','Star Earrings','Dainty Ring'] },
  y2k:        { clothing: ['Baby Tee','Low-Rise Flare Jeans','Mesh Top','Mini Skirt','Cropped Cardigan','Denim Mini','Velour Tracksuit','Butterfly-Print Top','Halter Crop'], shoes: ['Chunky Platform Sneakers','Pointy Kitten Heels','Platform Mary Janes','Mule Slides','Chunky Boots'], bags: ['Mini Baguette Bag','Rhinestone Bag','Tiny Shoulder Bag','Chain Mini'], accessories: ['Butterfly Hair Clips','Tinted Sunglasses','Trucker Cap','Choker'], beauty: ['Frosted Lip Gloss','Glitter Eyeshadow','Shimmer Blush','Body Glitter'], jewelry: ['Layered Chokers','Charm Bracelet','Star Studs','Heart Locket'] },
  vintage:    { clothing: ['High-Waist Flare Jeans','Prairie Blouse','Corduroy Skirt','70s Knit','Patchwork Denim','Embroidered Dress','Wool Cardigan','Bell-Bottom Jeans'], shoes: ['Suede Ankle Boots','Leather Mary Janes','Square-Toe Loafers','Platform Clogs','Dr. Martens Oxford'], bags: ['Vintage Leather Satchel','Woven Bag','Suede Shoulder Bag','Rattan Bag'], accessories: ['Cat-Eye Sunglasses','Wide Leather Belt','Headscarf','Vintage Brooch'], beauty: ['Red Matte Lip','Winged Liner','Classic Red Nail','Rosy Blush'], jewelry: ['Gold Locket','Beaded Necklace','Vintage Hoops','Statement Ring'] },
  softgirl:   { clothing: ['Floral Mini Dress','Lace-Trim Blouse','Pastel Cardigan','Ruffle Top','Pleated Mini Skirt','Coquette Cami','Ribbon Dress','Prairie Midi'], shoes: ['Ballet Flats with Bow','Platform Mary Janes','Satin Mules','Embellished Sandals','Kitten Heels'], bags: ['Heart-Shaped Bag','Mini Quilted Bag','Pearl Crossbody','Flower-Charm Bag'], accessories: ['Bow Hair Clips','Pearl Headband','Heart Sunglasses','Satin Ribbon'], beauty: ['Pink Gloss','Cream Blush','Faux Freckles','Pink Eyeshadow'], jewelry: ['Pearl Pendant','Bow Earrings','Heart Locket','Delicate Ring'] },
  hijabicore: { clothing: ['Long-Sleeve Maxi Dress','Oversized Wool Coat','Cashmere Crewneck','Tailored Wide-Leg Trousers','Pleated Maxi Skirt','Modest Shirt Dress','Silk Long-Sleeve Blouse','Tailored Long Blazer'], shoes: ['Leather Loafers','Pointed Flats','White Leather Sneakers','Pointed Pumps','Leather Mules'], bags: ['Suede Tote','Structured Shoulder Bag','Cream Hobo','Heritage Leather Tote'], accessories: ['Premium Satin Hijab','Chiffon Hijab Set','Silk Modal Hijab','Cashmere Scarf'], beauty: ['Rose Tinted Lip','Bronzed Cheek','Soft Brown Eye','Glow Skin Finish'], jewelry: ['Gold Layered Pendant','Pearl Hoop Earrings','Stacking Rings','Fine Chain Necklace'] }
};

// Approximate price band per tier (for generated alternatives)
const TIER_PRICE_BAND = {
  clothing:    { aff: [12, 35],  mid: [49, 149], lux: [195, 495] },
  shoes:       { aff: [25, 55],  mid: [65, 145], lux: [160, 395] },
  bags:        { aff: [12, 35],  mid: [45, 145], lux: [195, 695] },
  accessories: { aff: [5, 22],   mid: [25, 75],  lux: [85, 295] },
  beauty:      { aff: [5, 18],   mid: [20, 45],  lux: [48, 95] },
  jewelry:     { aff: [7, 25],   mid: [29, 98],  lux: [98, 295] }
};

const CATEGORY_LABELS = {
  clothing: 'Clothing', shoes: 'Shoes', bags: 'Bags',
  accessories: 'Accessories', beauty: 'Beauty', jewelry: 'Jewelry'
};

function getExpandedShop(style, category) {
  const base = (style.shop && style.shop[category]) || [];
  const result = base.slice();
  const usedStores = new Set(base.map(p => p.store));
  const queryByTier = { aff: null, mid: null, lux: null };
  base.forEach(p => { if (!queryByTier[p.tier]) queryByTier[p.tier] = p.q; });
  const fallbackQuery = base[0] ? base[0].q : (style.id + ' ' + category);

  const aeStores = (AESTHETIC_EXPANDED_STORES[style.id] || {})[category] || {};
  const stores = Object.keys(aeStores).length ? aeStores : (EXPANDED_STORES[category] || {});
  const itemNames = (AESTHETIC_ITEM_NAMES[style.id] || {})[category] || [];
  const tierIdx = { aff: 0, mid: 0, lux: 0 };

  ['aff', 'mid', 'lux'].forEach(tier => {
    (stores[tier] || []).forEach(store => {
      if (usedStores.has(store)) return;
      const q = queryByTier[tier] || fallbackQuery;
      const band = (TIER_PRICE_BAND[category] || {})[tier] || [10, 100];
      const seed = (q.length + store.length) % (band[1] - band[0] || 1);
      const price = '$' + (band[0] + seed);
      const baseImg = base.find(p => p.tier === tier);
      const img = baseImg ? baseImg.img : (base[0] ? base[0].img : style.heroImg);
      const name = itemNames.length
        ? itemNames[tierIdx[tier]++ % itemNames.length]
        : (CATEGORY_LABELS[category] || category);
      result.push({ tier, store, name, price, q, img, url: expandedShopUrl(store, q) });
      usedStores.add(store);
    });
  });
  return result;
}
