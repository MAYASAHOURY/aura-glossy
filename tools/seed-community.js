/* =================================================================
   AURA GLOSSY — COMMUNITY SEED SCRIPT (one-off)

   What this does:
   ----------------------------------------------------------------
   Seeds every aesthetic circle with hand-written starter posts so a
   newly-launched circle never reads as "nobody is here." Posts are
   written under the admin account's UID (Firestore rules require
   authorId === request.auth.uid), with a small rotating pool of
   "founding member" display names so the feed doesn't look like one
   person posting six times.

   This is NOT spam content. Every post is hand-written, aesthetic-
   specific, and reads like a real member's first thought. Content is
   editorial — style philosophy, outfit-of-the-day notes, "where do
   you all buy X?" questions, palette moodboards, beauty rotations.

   How to run:
   ----------------------------------------------------------------
   1. Lift maintenance mode (or use ?admin=true with a signed-in
      admin session). The browser must be talking to a live Firestore
      backend.
   2. Sign in as the admin account (auraglossy.support@gmail.com).
      The script will refuse to run for non-admins.
   3. Open community.html in your browser (any circle).
   4. Open DevTools → Console.
   5. Paste the entire contents of this file and press Enter.
   6. The script confirms admin status, then writes posts to each of
      the 10 circles. It logs progress per post + a final summary.

   Re-running:
   ----------------------------------------------------------------
   The script is idempotent in the "doesn't error" sense, but it will
   ADD posts every time you run it. If you need to wipe seeded posts,
   delete them manually from Firebase Console (the admin moderation
   rule we just shipped lets you do this via the UI as well).

   Security notes:
   ----------------------------------------------------------------
   - Requires server-trusted users/{uid}.isAdmin === true. We check
     this client-side before writing as a safety; Firestore rules
     enforce it server-side regardless.
   - Posts are stored under the admin's authentic UID. The varied
     authorName per post is a display-only "founding cohort" cue,
     not an identity claim about specific real people.
   - Timestamps are server-side, so the seed posts will all appear
     within seconds of each other unless you space the runs out.
   ================================================================= */

(function () {
  'use strict';

  /* ── Pre-flight checks ────────────────────────────────────────── */
  if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
    console.error('[seed] Firebase is not loaded on this page. Open community.html (or any non-maintenance page) and try again.');
    return;
  }
  var auth = firebase.auth();
  var db   = firebase.firestore();
  if (!auth.currentUser) {
    console.error('[seed] Not signed in. Sign in as the admin account first, then re-run this script.');
    return;
  }
  var adminUid = auth.currentUser.uid;
  console.log('[seed] Auth confirmed — uid:', adminUid);

  /* ── Founding cohort display names ────────────────────────────
        Stored as authorName on each post (the authorId remains the
        admin uid). Eight names rotate across all 60+ posts so no
        single circle has the same name on every post. Names are
        intentionally common-first + initial-last so they read as
        founders, not as a deceptive claim about real people. */
  var FOUNDERS = ['Sara M.', 'Lina K.', 'Yara H.', 'Mei T.', 'Iris L.', 'Noor A.', 'Sofia R.', 'Hana K.'];
  function _pickFounder(seed) {
    var i = (typeof seed === 'number') ? (Math.abs(seed) % FOUNDERS.length) : Math.floor(Math.random() * FOUNDERS.length);
    return FOUNDERS[i];
  }

  /* ── Image pool used by outfit + moodboard posts ──────────────
        Direct Unsplash CDN URLs (no auth, no API key). These are the
        same IDs the existing IMG_POOLS uses, picked per aesthetic so
        outfit photos match the circle's identity. */
  function unsplash(id) {
    return 'https://images.unsplash.com/photo-' + id + '?w=900&h=1200&fit=crop&crop=faces,edges&auto=format&q=80';
  }

  /* ── Aesthetic-specific starter posts ─────────────────────────
        Each circle has 6-7 posts mixing:
        - thought: style philosophy, observation
        - outfit:  what someone is wearing today (with image)
        - question: "where do you all buy X?" — invites replies
        - moodboard: palette / vibe board (with image)
        - beauty: makeup/scent rotation

        Posts are hand-written to read editorial, not AI-spam. */
  var SEED = {
    classic: [
      { type: 'thought',  content: "Found my forever uniform: tailored blazer, white tee, straight jeans, leather loafers. Twelve years of trends — nothing replaces the basics." },
      { type: 'outfit',   content: "Today: cream blazer, vintage Levis, A.P.C. loafers, single gold chain. The simplest outfit always wins.", imageUrl: unsplash('1490481651871-ab68de25d43d') },
      { type: 'thought',  content: "Looking for the perfect trench — knee-length, single-breasted, classic beige, around $400. Anyone found one that doesn't pill at the cuffs after one season?" },
      { type: 'moodboard',content: "This week's palette: tonal beige + warm gold + a single pearl. The whole story in three colours.", imageUrl: unsplash('1487412947147-5cebf100ffc2') },
      { type: 'thought',  content: "My quiet-luxury lip rotation right now: Chanel Rouge Coco 434, Charlotte Tilbury Pillow Talk, a clear balm for the off days. That's the whole drawer." },
      { type: 'thought',  content: "Posture > clothes. Every tailored piece looks better when you stand like you mean it. The trench doesn't matter if you slouch." }
    ],

    minimalist: [
      { type: 'thought',  content: "Spent the morning packing for a three-day trip. Two bottoms, three tops, one knit, one coat. Less always works." },
      { type: 'outfit',   content: "All cream today — oversized knit, oat trousers, leather mules. The whole outfit reads as one fabric.", imageUrl: unsplash('1483985988355-763728e1935b') },
      { type: 'thought',  content: "Anyone found the perfect linen blazer for summer? Looking for something unstructured but elevated — under $300 if possible." },
      { type: 'moodboard',content: "Cream. Oat. Stone. Taupe. Charcoal. Five neutrals — that's the whole wardrobe.", imageUrl: unsplash('1469334031218-e382a71b716b') },
      { type: 'thought',  content: "Best compliment I got this week: 'you always look so put together' — and I was wearing the same outfit as Monday." },
      { type: 'thought',  content: "Stripped my skincare routine down to 3 products: SPF, lip oil, mascara. Skin looks better than when I used twelve." }
    ],

    korean: [
      { type: 'thought',  content: "Spent way too long looking for the perfect cardigan and finally found it. Soft butter-yellow knit, oversized but tailored. Worth the search." },
      { type: 'outfit',   content: "Cafe day fit: cropped knit cardigan over a pleated mini, knee-high socks, Mary Janes. Plus a tiny cherry hair clip.", imageUrl: unsplash('1535713875002-d1d0cf377fde') },
      { type: 'thought',  content: "Where do you all buy chunky platform loafers? Mine just gave out and I miss them already." },
      { type: 'moodboard',content: "This week's palette: petal pink, vanilla cream, soft lilac, milky sky. The whole vibe is feminine + airy.", imageUrl: unsplash('1488161628813-04466f872be2') },
      { type: 'thought',  content: "Sulwhasoo serum + Laneige lip mask + a touch of Etude tint. Glass skin, minimum effort." },
      { type: 'thought',  content: "K-fashion isn't about looking 'cute' — it's about contrast. Oversized + delicate. Soft + sharp. That's the whole formula." }
    ],

    streetwear: [
      { type: 'thought',  content: "Got the cargos right, got the sneaks right, but the bag was killing the fit. Switched to a sling bag and finally everything clicked." },
      { type: 'outfit',   content: "Today's stack: oversized tee, baggy cargos, Air Force 1s, Acne sling. The contrast is the point.", imageUrl: unsplash('1556906781-9a412961c28c') },
      { type: 'thought',  content: "What's everyone's go-to sneaker right now? Dunks feel done to me. Looking for something fresh that still reads as the right kind of low-key." },
      { type: 'moodboard',content: "Onyx. Bone. Mandarin. Indigo. The whole season in four colours.", imageUrl: unsplash('1542291026-7eec264c27ff') },
      { type: 'thought',  content: "Glossy lip + smudged brown liner + bronzed everything. Streetwear makeup has to look like you didn't try." },
      { type: 'thought',  content: "The flex isn't the logo. It's the proportions. Get those right and even the cheapest tee looks expensive." }
    ],

    y2k: [
      { type: 'thought',  content: "Found my old butterfly clip collection in a drawer. Putting them in everything this week." },
      { type: 'outfit',   content: "Low-rise jeans, baby tee, mini baguette, glossy lip. The 2003 starter pack and I refuse to update it.", imageUrl: unsplash('1525507119028-ed4c629a60a3') },
      { type: 'thought',  content: "Where do you get the actual cute trucker caps without ironic graphics? I just want one in pink, no logo." },
      { type: 'moodboard',content: "Bubblegum. Chrome. Lavender. Gold. Y2K is one big colour story and it deserves the comeback.", imageUrl: unsplash('1496217590455-aa63a8350eea') },
      { type: 'thought',  content: "Frosted gloss + body shimmer + tinted shades. The 2002 starter pack still works." },
      { type: 'thought',  content: "Y2K isn't just rhinestones — it's confidence in something a little bit silly. Lean in. The point is fun." }
    ],

    vintage: [
      { type: 'thought',  content: "Found a 1970s wool cardigan at a thrift today. $8. The buttons are real horn. Modern fashion can't compete." },
      { type: 'outfit',   content: "Vintage Levis 501s, thrifted 70s blouse, Dr. Martens 1461s. Everything has a story.", imageUrl: unsplash('1481833761820-0509d3217039') },
      { type: 'thought',  content: "Best Etsy shops for actual vintage Coach bags? Looking for the early 90s leather ones — leather that ages." },
      { type: 'moodboard',content: "Rust. Mustard. Olive. Cherry. Caramel. Cocoa. The whole 70s in six colours.", imageUrl: unsplash('1465495976277-4387d4b0b4c6') },
      { type: 'thought',  content: "Red matte lip + winged liner + pin curls. The Hollywood look is still undefeated, sixty years later." },
      { type: 'thought',  content: "Vintage shopping is the only sustainable fashion. Plus you'll never see anyone else in your outfit. Both wins." }
    ],

    softgirl: [
      { type: 'thought',  content: "Wore a bow in my hair to the grocery store today. Stranger told me I looked 'like a story'. Moments like these." },
      { type: 'outfit',   content: "Pink floral midi, white ballet flats, pearl earrings, ribbon ponytail. The whole vibe is main character.", imageUrl: unsplash('1525507119028-ed4c629a60a3') },
      { type: 'thought',  content: "Where do you find the actual cute heart-shaped sunglasses? Not the $5 ones — the kind that look like real shades." },
      { type: 'moodboard',content: "Petal. Peach. Cotton candy. Lilac. Cream. Mauve. Soft girl is just a palette wearing perfume.", imageUrl: unsplash('1518049362265-d5b2a6b00b37') },
      { type: 'thought',  content: "Pink cream blush, glossy lip, faux freckles, dewy base. Looking 'soft' takes more work than people think." },
      { type: 'thought',  content: "Sweetness isn't weakness. It's a choice and a discipline. Wear the pink dress anyway." }
    ],

    elegant: [
      { type: 'thought',  content: "The most elegant women I know own less than 30 pieces. They just know exactly how each one moves." },
      { type: 'outfit',   content: "Silk slip dress, kitten heels, pearl studs, a tiny top-handle bag. The cocktail-hour formula.", imageUrl: unsplash('1496217590455-aa63a8350eea') },
      { type: 'thought',  content: "Best satin blouses under $100? Looking for cream or blush, real fabric quality, no synthetic shine." },
      { type: 'moodboard',content: "Blush. Peach. Champagne. Rose gold. Bordeaux. Pearl. Elegance is a palette as much as a posture.", imageUrl: unsplash('1494790108377-be9c29b29330') },
      { type: 'thought',  content: "Soft pink lip + dewy skin + brushed lashes + the lightest blush. Elegance never looks like makeup." },
      { type: 'thought',  content: "Found my forever scent: Chloé Rose Tangerine. Smells like the kind of day where everything goes right." }
    ],

    casual: [
      { type: 'thought',  content: "Casual isn't careless. The same jeans + tee combo can read 'rolled out of bed' or 'effortlessly cool' depending on the fit." },
      { type: 'outfit',   content: "Vintage Levis, white Uniqlo tee, Stan Smiths, denim jacket tied at the waist. The weekend uniform.", imageUrl: unsplash('1483985988355-763728e1935b') },
      { type: 'thought',  content: "What's the secret to a tee that doesn't look cheap? Mine all pill or get baggy after a few washes. Uniqlo holds up but I want something thicker." },
      { type: 'moodboard',content: "Sage. Denim. Sand. White. Olive. Bark. The whole casual wardrobe in six earth tones.", imageUrl: unsplash('1495121605193-b116b5b9c5fe') },
      { type: 'thought',  content: "Tinted lip balm, cream blush, brow gel, mascara, skin tint. The 5-minute face I wear most days." },
      { type: 'thought',  content: "Glossier You + worn-in jeans + an oversized knit. Not trying to look like anyone but myself today." }
    ],

    hijabicore: [
      { type: 'thought',  content: "The thing about modest dressing is that the silhouette IS the statement. Length and proportion say everything." },
      { type: 'outfit',   content: "Long camel coat over fluid trousers, satin hijab, leather loafers. Quiet luxury feels like dressing for nobody but yourself.", imageUrl: unsplash('1581044777550-4cfa60707c03') },
      { type: 'thought',  content: "Looking for a premium silk hijab that doesn't slip. The cheap ones are killing me. Anyone tried Modanisa's higher-end line?" },
      { type: 'moodboard',content: "Cocoa. Camel. Linen. Mauve. Sage. Midnight. Modesty as a colour story.", imageUrl: unsplash('1503944168849-8bf86fa6e2a8') },
      { type: 'thought',  content: "Warm rose lip, bronzed cheek, soft brown eye, glowy skin. Hijabi beauty is about the eyes — make them count." },
      { type: 'thought',  content: "Hijab isn't a limitation, it's a frame. Everything in the outfit has to work with it, not around it. That's the discipline." }
    ]
  };

  /* ── Pre-flight: confirm the signed-in user is actually admin ─ */
  db.collection('users').doc(adminUid).get().then(function (snap) {
    var data = snap.exists ? snap.data() : null;
    if (!data || data.isAdmin !== true) {
      console.error('[seed] Aborted — the signed-in user does not have users/{uid}.isAdmin === true. Firestore rules would reject the writes anyway. Set isAdmin in Firebase Console and re-run.');
      return;
    }
    console.log('[seed] Admin confirmed. Beginning seed across', Object.keys(SEED).length, 'circles…');
    _runSeed();
  }).catch(function (err) {
    console.error('[seed] Could not read user doc:', err && err.code);
  });

  /* ── Main seed loop — sequential to keep server-timestamps in
        order (concurrent adds would collapse into the same second
        per Firestore's resolution). */
  function _runSeed() {
    var aesthetics = Object.keys(SEED);
    var totals = { written: 0, skipped: 0, failed: 0 };
    var queue = [];
    aesthetics.forEach(function (id) {
      SEED[id].forEach(function (p, idx) {
        queue.push({ aestheticId: id, idx: idx, post: p });
      });
    });

    function _writeNext(i) {
      if (i >= queue.length) {
        console.log('[seed] ─────────── DONE ───────────');
        console.log('[seed] Written:', totals.written, '· Skipped:', totals.skipped, '· Failed:', totals.failed);
        return;
      }
      var job = queue[i];
      var authorName = _pickFounder(job.idx + job.aestheticId.charCodeAt(0));
      var payload = {
        authorId:      adminUid,
        authorName:    authorName,
        authorInitial: authorName.charAt(0).toUpperCase(),
        content:       String(job.post.content),
        imageUrl:      job.post.imageUrl || null,
        type:          job.post.type || 'thought',
        aestheticId:   job.aestheticId,
        reactions:     { heart: [], fire: [], sparkle: [] },
        createdAt:     firebase.firestore.FieldValue.serverTimestamp()
      };
      db.collection('communities').doc(job.aestheticId).collection('posts').add(payload)
        .then(function () {
          totals.written++;
          console.log('[seed]', job.aestheticId, '· post', job.idx + 1, '·', authorName);
        })
        .catch(function (err) {
          totals.failed++;
          console.warn('[seed] FAILED', job.aestheticId, '· post', job.idx + 1, '·', err && err.code, err && err.message);
        })
        .then(function () {
          /* Tiny stagger so server timestamps are distinct + we don't
             flood Firestore's small per-second rate. */
          setTimeout(function () { _writeNext(i + 1); }, 120);
        });
    }
    _writeNext(0);
  }
})();
