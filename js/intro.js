/* ============================================================
   AURA — intro.js
   Cinematic intro · 3 scenes · time-driven (auto-plays)

   Architecture: single continuous rAF loop advances globalP
   over a fixed duration — no scroll dependency, works on all
   devices. Skip button exits immediately.
   ============================================================ */
(function () {

  var intro  = document.getElementById('intro');
  var spacer = document.getElementById('intro-spacer');
  if (!intro || !spacer) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ── FIRST-VISIT GUARD ────────────────────────────────────────
     The intro is a first-visit experience only.
     sessionStorage persists for the lifetime of the tab, so:
       • First open  → intro plays, flag is set
       • Navigate away + come back → instant, flag already set
       • Close tab + reopen → fresh experience, flag gone
     When we skip, we remove all intro DOM so auth.js sees no
     #intro and proceeds straight to its normal flow.
  ─────────────────────────────────────────────────────────────── */
  var INTRO_SEEN_KEY = 'aura_intro_seen';
  var _skipIntro = false;
  try {
    if (localStorage.getItem(INTRO_SEEN_KEY))       _skipIntro = true;
    if (sessionStorage.getItem('aura_skip_intro'))  _skipIntro = true;
  } catch(e) { /* private mode / quota — play intro but don't crash */ }

  if (_skipIntro) {
    /* Tear down intro chrome immediately */
    if (intro.parentNode)  intro.parentNode.removeChild(intro);
    if (spacer.parentNode) spacer.parentNode.removeChild(spacer);
    var _preroll = document.getElementById('intro-preroll');
    if (_preroll && _preroll.parentNode) _preroll.parentNode.removeChild(_preroll);
    return;
  }

  /* Spacer was only needed for scroll-driven approach — remove it immediately
     so the page height is correct from the start. */
  if (spacer.parentNode) spacer.parentNode.removeChild(spacer);

  var REDUCED     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCENE_COUNT = 3;
  var TOTAL_MS    = 5800;   /* full playthrough duration in ms (after preroll) */

  var scenes  = intro.querySelectorAll('.scene');
  var skip    = intro.querySelector('.intro-skip');
  var fill    = intro.querySelector('.intro-progress-fill');
  var counter = document.getElementById('intro-counter-num');
  var cta     = intro.querySelector('.scene-cta');
  var prompt  = intro.querySelector('.intro-prompt');

  /* Hide "scroll to explore" — no longer scroll-driven */
  if (prompt) prompt.style.display = 'none';

  /* ── Cache scene elements ─────────────────────────────────── */
  var cache = Array.from(scenes).map(function (sc) {
    return {
      el:    sc,
      img:   sc.querySelector('.scene-bg img'),
      bg:    sc.querySelector('.scene-bg'),
      text:  sc.querySelector('.scene-text'),
      fg:    sc.querySelector('.scene-fg'),
      grain: sc.querySelector('.scene-grain')
    };
  });

  /* ── Force transition:none on every rAF-driven element ─────── */
  cache.forEach(function (c) {
    [c.el, c.img, c.bg, c.text, c.fg, c.grain].forEach(function (el) {
      if (!el) return;
      el.style.transition = 'none';
      el.style.willChange = 'transform, opacity';
    });
  });
  if (cta) { cta.style.transition = 'none'; cta.style.willChange = 'transform, opacity'; }

  /* ── Ghost scene numbers ──────────────────────────────────── */
  cache.forEach(function (c, i) {
    var g = document.createElement('div');
    g.className   = 'scene-ghost-num';
    g.textContent = String(i + 1).padStart(2, '0');
    c.el.appendChild(g);
  });

  /* ── Scene-transition flash overlay ──────────────────────── */
  var flash = document.createElement('div');
  flash.className = 'scene-flash';
  intro.appendChild(flash);
  var lastCounterTxt = '';

  /* ── Math helpers ─────────────────────────────────────────── */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t)  { return a + (b - a) * t; }
  function smoothstep(t)  { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  /* Ease-in-out so scenes start briskly and linger on the finale */
  function easeInOut(t)   {
    t = clamp(t, 0, 1);
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /* ── Scene opacity envelope ───────────────────────────────── */
  function sceneOpacity(p) {
    if (p <= -0.30 || p >= 1.2) return 0;
    if (p < 0)     return smoothstep((p + 0.30) / 0.30);
    if (p <= 0.85) return 1;
    return 1 - smoothstep((p - 0.85) / 0.35);
  }

  /* ── Per-scene Ken Burns ──────────────────────────────────── */
  function applyScene(idx, p) {
    var c  = cache[idx];
    var op = sceneOpacity(p);

    if (op === 0) {
      if (c.el._lastOp !== 0) {
        c.el.style.opacity = '0';
        c.el._lastOp = 0;
        c.el._textIn = false;
        c.el.classList.remove('text-entered');
        if (c.fg)    c.fg.style.transform    = '';
        if (c.grain) c.grain.style.transform = '';
        if (c.img)   c.img.style.transform   = '';
      }
      return;
    }

    c.el.style.opacity = String(op);
    c.el._lastOp = op;

    if (op > 0.6 && !c.el._textIn) {
      c.el._textIn = true;
      c.el.classList.add('text-entered');
    } else if (op < 0.08 && c.el._textIn) {
      c.el._textIn = false;
      c.el.classList.remove('text-entered');
    }

    var t = clamp((p + 0.30) / 1.15, 0, 1);

    /* Text float — rises in as scene enters */
    if (c.text) {
      var tS    = smoothstep(clamp(t * 2, 0, 1));
      var riseY = lerp(24, 0, tS);
      var tOp   = (p > -0.30 && p < 1.05) ? tS : 0;
      c.text.style.opacity   = String(tOp);
      c.text.style.transform = (idx === 2)
        ? 'translateX(-50%) translateY(' + riseY + 'px)'
        : 'translateY(' + riseY + 'px)';
    }

    if (idx === 0) {
      /* Scene 1 — subtle diagonal drift */
      var x1 = lerp(-1.5, 1.5, t);
      var y1 = lerp(1.0, -1.0, t);
      c.img.style.transform   = 'scale(1.0) translate3d(' + x1 + '%,' + y1 + '%,0)';
      if (c.fg)    c.fg.style.transform    = 'translate3d(' + (-x1 * 0.08) + '%,' + (-y1 * 0.08) + '%,0)';
      if (c.grain) c.grain.style.transform = 'translate3d(' + (-x1 * 0.20) + '%,' + (-y1 * 0.20) + '%,0)';

    } else if (idx === 1) {
      /* Scene 2 — no zoom at all, pan upward slightly to keep faces centred */
      var pan2 = lerp(0, -1.5, t);  /* gentle upward pan */
      c.img.style.transform = 'translate3d(0,' + pan2 + '%,0)';
      if (c.fg)    c.fg.style.transform    = '';
      if (c.grain) c.grain.style.transform = '';

    } else if (idx === 2) {
      /* Scene 3 — hold steady, CTA fades in */
      if (c.bg) c.bg.style.clipPath = '';
      c.img.style.transform = 'scale(1.0)';
      if (cta) {
        var ctaT = clamp((t - 0.55) * 2.5, 0, 1);
        var ctaS = smoothstep(ctaT);
        cta.style.opacity   = String(ctaS);
        cta.style.transform = 'translate3d(-50%,' + lerp(14, 0, ctaS) + 'px,0)';
      }
    }
  }

  /* ── END INTRO ────────────────────────────────────────────── */
  var ended = false;
  function endIntro() {
    if (ended) return;
    ended = true;
    try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch(e) {} /* survives OAuth redirects */
    window.scrollTo({ top: 0, behavior: 'instant' }); /* ensure homepage starts from top */
    intro.classList.add('is-done');
    setTimeout(function () {
      intro.classList.add('is-removed');
      if (!document.getElementById('aura-signin')) {
        window.dispatchEvent(new CustomEvent('aura:homepage-reveal'));
      }
    }, 1000);
  }

  /* ── MAIN LOOP — time-driven, no scroll required ────────────── */
  var startTime = null;

  function tick(ts) {
    if (ended) return;
    if (!startTime) startTime = ts;

    var elapsed = ts - startTime;
    var tNorm   = clamp(elapsed / TOTAL_MS, 0, 1);
    /* Ease so the intro starts briskly and pauses on the final scene */
    var globalP = easeInOut(tNorm) * SCENE_COUNT;

    for (var i = 0; i < SCENE_COUNT; i++) {
      applyScene(i, globalP - i);
    }

    /* Progress bar */
    if (fill) {
      fill.style.transform = 'scaleX(' + clamp(globalP / SCENE_COUNT, 0, 1) + ')';
    }

    /* Scene counter + flash on scene change */
    if (counter) {
      var idx = clamp(Math.floor(globalP), 0, SCENE_COUNT - 1);
      var txt = String(idx + 1).padStart(2, '0');
      if (txt !== lastCounterTxt) {
        lastCounterTxt = txt;
        counter.textContent = txt;
        setTimeout(function () {
          flash.classList.remove('scene-flash-go');
          flash.classList.add('scene-flash-go');
          counter.classList.remove('counter-pop');
          counter.classList.add('counter-pop');
        }, 0);
      }
    }

    if (globalP >= SCENE_COUNT - 0.05) { endIntro(); return; }

    requestAnimationFrame(tick);
  }

  /* ── SKIP BUTTON — exits immediately ─────────────────────── */
  if (skip) {
    skip.addEventListener('click', function () {
      endIntro();
    });
  }

  /* ── PRE-ROLL (visual only) ───────────────────────────────── */
  var prerollEl = document.getElementById('intro-preroll');

  if (REDUCED) {
    /* Reduced motion: skip the entire intro straight away */
    requestAnimationFrame(endIntro);
    return;
  }

  if (!prerollEl) {
    /* No preroll: start immediately */
    requestAnimationFrame(tick);
    return;
  }

  var prerollDone = false;
  function endPreroll() {
    if (prerollDone) return;
    prerollDone = true;
    prerollEl.classList.add('is-fading');
    setTimeout(function () { prerollEl.style.display = 'none'; }, 1200);
    /* Start scenes immediately — they fade in as preroll fades out */
    if (!ended) requestAnimationFrame(tick);
  }

  /* Auto-dismiss after 2.2 s, or immediately on click/tap */
  setTimeout(endPreroll, 2200);
  prerollEl.addEventListener('click',      endPreroll, { once: true });
  prerollEl.addEventListener('touchstart', endPreroll, { once: true, passive: true });

})();
