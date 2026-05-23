/* ================================================================
   AURA - First-time onboarding guide   (onboarding.js v3)

   A short, anchored mini-tour. Every step spotlights a REAL
   navigation element and points an arrow straight at it:

     1. Welcome      (centred intro card)
     2. Style Quiz   ->  "Start with the quiz."
     3. Community    ->  "Join your style circle."
     4. Moodboard    ->  "Save your favorite looks."
     5. Aesthetics   ->  "Shop your aesthetic."

   ----------------------------------------------------------------
   WHEN IT AUTO-SHOWS  -  exactly once per account, and only on a
   genuine sign-in / account creation. It auto-shows only when
   BOTH of these are true:

     - sessionStorage has 'aura_onboard_trigger'
         Set by login.html the moment a sign-in / sign-up
         succeeds. This script reads it once, then deletes it
         immediately, so it can never fire a second time.

     - the user's Firestore doc has no 'onboardedAt'
         Proves the guide has never been finished on ANY device
         or browser.

   Because the trigger is ONLY ever set by login.html, the guide
   can NOT appear on: a page refresh, a Home click, a Back
   navigation, or a returning user who is already signed in -
   none of those pass through login.html.

   The guide is recorded as done (Firestore + localStorage) the
   instant it appears, so even an interrupted first run - closing
   the tab mid-tour - never brings it back.

   ----------------------------------------------------------------
   REPLAY  -  manual only:
     Settings -> "Replay Aura Guide" -> index.html?onboard=1
   bypasses every check above and replays the tour.
   ================================================================ */

(function () {
  'use strict';

  var STORAGE_KEY  = 'aura_onboarded';        /* localStorage "done" flag         */
  var TRIGGER_KEY  = 'aura_onboard_trigger';  /* sessionStorage one-shot from login */
  var REPLAY_PARAM = 'onboard';               /* ?onboard=1                         */
  var PAD          = 9;                       /* spotlight padding around target px */

  /* ---- Tour steps -------------------------------------------------
     Each anchored step targets a real element that exists on the
     homepage. Copy is read from the i18n dictionary so the entire
     tour translates instantly when the user switches language.

     `target`        — selector used on desktop (always-visible nav link)
     `mobileTarget`  — selector used on mobile, where nav-links are
                       hidden behind a hamburger. May be a different
                       element (e.g. the hero CTA for the quiz step).
     `mobileOpenMenu`— before showing, open the burger menu so the
                       mobile target is visible inside it.
     `mobileScrollTo`— before showing, smooth-scroll this selector
                       into the upper third of the viewport. */
  function _t(key, fallback) {
    if (window.Aura && window.Aura.i18n) return window.Aura.i18n.t(key) || fallback;
    return fallback;
  }
  function buildSteps() {
    return [
      /* ── Step 1: WELCOME — centered card, no spotlight ────────────
         Mockup spec: small bottom-pinned card on mobile, no big
         hero. Action row shows "Skip tour" + "Next →" — no Back
         (it's the first step), no spotlight target (just a friendly
         intro before the guided steps begin). */
      {
        welcome:  true,
        headline: _t('onboarding.welcome_headline', 'Welcome to Aura Glossy.'),
        body:     _t('onboarding.welcome_body',     "We'll take you on a quick tour. It only takes a few steps.")
      },

      /* ── Step 2: STYLE QUIZ — spotlight on the big hero CTA ──────
         Targets the prominent "Take the Style Quiz" button at the
         top of the homepage on both desktop AND mobile. A button-
         sized target gives the spotlight ring room to read clearly. */
      {
        target:    '.hero-actions a[href="quiz.html"]',
        scrollTo:  '.hero',
        headline:  _t('onboarding.quiz_headline', 'Start with a quick quiz.'),
        body:      _t('onboarding.quiz_body',     'It helps Aura discover your style.')
      },

      /* ── Step 3: COMMUNITY — spotlight inside open burger menu ───
         Desktop nav is visible. Mobile: opens burger menu and
         spotlights the COMMUNITY link inside it. Menu auto-closes
         when we advance to the next step. */
      {
        target:        '.nav-links a[href="community.html"]',
        mobileTarget:  '.nav.nav-open .nav-links a[href="community.html"]',
        mobileOpenMenu:true,
        headline:      _t('onboarding.community_headline', 'This is your community.'),
        body:          _t('onboarding.community_body',     'Based on your quiz answers.')
      },

      /* ── Step 4: AESTHETICS — spotlight on EXPLORE AESTHETICS btn
         Mockup spec: highlight the "EXPLORE AESTHETICS" hero button
         (not the style cards section below). Card sits above the
         button with an arrow pointing down to it. Scroll back to
         hero in case the user scrolled while the menu was open. */
      {
        target:    '.hero-actions a[href="#styles"]',
        scrollTo:  '.hero',
        headline:  _t('onboarding.aesthetics_headline', 'You can also explore more aesthetics.'),
        body:      _t('onboarding.aesthetics_body',     'Browse all aesthetic circles.')
      },

      /* ── Step 5: FINAL — centered card, single CTA ───────────────
         Mockup spec: small centered card, no spotlight, single
         "Let's Go →" button. Closing this card ends the tour. */
      {
        final:    true,
        headline: _t('onboarding.final_headline', "In the end, let's start."),
        body:     _t('onboarding.final_body',     "You're all set. Let's begin your journey.")
      }
    ];
  }
  var STEPS = buildSteps();

  /* Re-build steps when the user switches language so subsequent
     renders use the new translations. If the tour is currently open,
     re-render the active step to update the visible copy. */
  window.addEventListener('aura:langchange', function () {
    STEPS = buildSteps();
    if (document.getElementById('onboard-overlay')) _render(_step);
  });

  /* ---- State ------------------------------------------------------ */
  var _el       = {};      /* { overlay, spotlight, tooltip, beak }     */
  var _step     = 0;
  var _uid      = null;
  var _isReplay = false;   /* ?onboard=1                                */
  var _fresh    = false;   /* genuine sign-in / sign-up this visit      */
  var _seenUid  = {};      /* de-dupes repeated onAuthChange callbacks   */
  var _rt       = null;    /* resize debounce timer                     */

  /* ================================================================
     BOOT
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {

    /* Replay request - strip the param, remember to force-show. */
    var params = new URLSearchParams(location.search);
    if (params.get(REPLAY_PARAM) === '1') {
      _isReplay = true;
      history.replaceState(null, '', location.pathname);
    }

    /* One-shot sign-in trigger - read ONCE, then delete immediately
       so a refresh of this same tab can never re-trigger the guide. */
    try {
      if (sessionStorage.getItem(TRIGGER_KEY)) {
        _fresh = true;
        sessionStorage.removeItem(TRIGGER_KEY);
      }
    } catch (e) {}

    if (typeof onAuthChange !== 'function') return;

    onAuthChange(function (user) {
      if (!user) return;
      _uid = user.uid;

      /* onAuthStateChanged can fire repeatedly (token refresh, etc.);
         only ever evaluate the show/skip decision once per account. */
      if (_seenUid[user.uid]) return;
      _seenUid[user.uid] = true;

      /* Manual replay - bypass every completion check. */
      if (_isReplay) {
        _afterReveal(function () { _start(true); });
        return;
      }

      /* Auto-show ONLY right after a genuine sign-in / sign-up.
         No trigger flag -> this is a refresh / Home click / Back /
         already-logged-in visit -> never auto-show. */
      if (!_fresh) return;

      /* Already completed on this device. */
      try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (e) {}

      /* Cross-device / cross-browser check: if Firestore already has
         onboardedAt, the guide was finished elsewhere - sync the
         local flag and stop. Only a genuinely absent field shows it. */
      if (typeof _db === 'undefined') {
        _afterReveal(function () { _start(false); });
        return;
      }
      _db.collection('users').doc(user.uid).get()
        .then(function (doc) {
          var data = doc.exists ? doc.data() : null;
          if (data && data.onboardedAt) {
            try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
            return;
          }
          _afterReveal(function () { _start(false); });
        })
        .catch(function () {
          /* Firestore unreachable - fall back to the local flag,
             which _markDone() writes the instant the guide appears. */
          _afterReveal(function () { _start(false); });
        });
    });
  });

  /* ---- Defer until the cinematic pre-roll has faded -------------- */
  function _afterReveal(cb) {
    var preroll = document.getElementById('intro-preroll');
    if (!preroll) { setTimeout(cb, 700); return; }

    var st = getComputedStyle(preroll);
    if (st.display === 'none' || parseFloat(st.opacity) < 0.1) {
      setTimeout(cb, 600);
      return;
    }

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      mo.disconnect();
      setTimeout(cb, 650);
    }
    var mo = new MutationObserver(function () {
      var s = getComputedStyle(preroll);
      if (parseFloat(s.opacity) < 0.1 || s.display === 'none' || s.visibility === 'hidden') {
        finish();
      }
    });
    mo.observe(preroll, { attributes: true, attributeFilter: ['style', 'class'] });
    setTimeout(finish, 4200); /* hard fallback */
  }

  /* ================================================================
     START / DOM
     ================================================================ */
  function _start(force) {
    /* Defensive: sweep any orphan onboarding DOM from a previous run
       before starting fresh. Without this, calling .show() right after
       .close() (e.g. Replay → close → Replay again) would early-return
       on "already open" because the close animation hadn't finished
       removing nodes yet. */
    var existing = document.getElementById('onboard-overlay');
    if (existing) {
      /* If a tour is actively rendering (tooltip is in-state), respect
         that. Otherwise it's a stale ghost — clean it now. */
      var tt = document.getElementById('onboard-tooltip');
      if (tt && tt.classList.contains('onboard-tooltip--in')) return;
      ['onboard-overlay', 'onboard-spotlight', 'onboard-tooltip'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    }

    if (!force) {
      try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (e) {}
    }

    /* Reset the close guard so a new tour can run after a previous close. */
    _closing = false;

    _step = 0;
    _build();
    _markDone();        /* appearing once IS "seen" - record it now    */
    _render(0);
  }

  /* ================================================================
     PUBLIC API  -  used by Settings -> "Replay Aura Guide" and
     by QA / preview. Always force-shows, no auth or storage check.
     ================================================================ */
  window.auraOnboarding = {
    show:  function () { _start(true); },
    close: function () { closeOnboarding(); }
  };

  function _build() {
    _el.overlay   = _div('onboard-overlay',   'onboard-overlay');
    _el.spotlight = _div('onboard-spotlight', 'onboard-spotlight');
    _el.tooltip   = _div('onboard-tooltip',   'onboard-tooltip');
    _el.tooltip.setAttribute('role',       'dialog');
    _el.tooltip.setAttribute('aria-modal', 'true');
    _el.tooltip.setAttribute('aria-label', 'Aura guide');

    document.body.appendChild(_el.overlay);
    document.body.appendChild(_el.spotlight);
    document.body.appendChild(_el.tooltip);
    document.body.classList.add('onboard-active');

    /* Stop clicks inside the tooltip / spotlight from bubbling to
       document. The site has a global click listener (main.js's
       initNavBurger) that closes the burger menu whenever a click
       lands outside .nav — without this stop, tapping our Next
       button would close the menu we just opened on the Community
       step. The OVERLAY itself does NOT stop propagation; instead
       any tap on the dim backdrop closes the tour. This is the
       primary panic-escape — even if every other path fails, the
       user can always tap the dim to recover. */
    _el.tooltip.addEventListener('click', function (e) { e.stopPropagation(); });
    _el.spotlight.addEventListener('click', function (e) { e.stopPropagation(); });
    _el.overlay.addEventListener('click', function () { closeOnboarding(); });

    window.addEventListener('resize',          _onResize);
    window.addEventListener('orientationchange', _onResize);
    /* When the user scrolls during the tour, the spotlight (position:
       fixed) must keep tracking the target which scrolls with the page.
       Throttled via rAF so we don't reposition more than once per frame. */
    window.addEventListener('scroll', _onScroll, { passive: true });
    document.addEventListener('keydown', _onKey);
  }

  function _div(id, cls) {
    var d = document.createElement('div');
    d.id = id;
    d.className = cls;
    return d;
  }

  /* ================================================================
     RENDER A STEP
     ================================================================ */
  function _render(idx) {
    var step = STEPS[idx];
    if (!step) { closeOnboarding(); return; }
    _step = idx;

    _el.tooltip.classList.remove('onboard-tooltip--in');
    /* Centered variant for welcome + final steps (no spotlight target).
       Replaces the previous full-screen "hero" variant — mockup spec
       wanted the same card style across all steps, just centered when
       there's nothing to anchor to. */
    _el.tooltip.classList.toggle('onboard-tooltip--centered', !!(step.welcome || step.final));

    var dots = '';
    for (var i = 0; i < STEPS.length; i++) {
      dots += '<span class="onboard-dot' + (i === idx ? ' onboard-dot--on' : '') + '"></span>';
    }

    var nextLabel = step.final   ? _t('onboarding.next_final', "Let's Go →")
                  : step.welcome ? _t('onboarding.next_show',  'Next →')
                  :                _t('common.next',           'Next →');
    var backLabel = _t('common.back',                 'Back');
    var skipLabel = _t('onboarding.skip_tour',        'Skip tour');

    var html =
      '<span class="onboard-beak"></span>' +
      '<button class="onboard-x" type="button" aria-label="' + _t('common.close', 'Close') + '">×</button>';

    html += '<h3 class="onboard-headline">' + step.headline + '</h3>' +
            '<p class="onboard-body">'      + step.body     + '</p>';

    /* Action row — left side varies by step type:
         • Welcome (first):  "Skip tour" link
         • Middle:           "Back" button
         • Final:            nothing (single centered CTA)                */
    if (step.final) {
      html += '<div class="onboard-actions onboard-actions--single">' +
                '<button class="onboard-next onboard-next--final" type="button">' +
                  nextLabel +
                '</button>' +
              '</div>';
    } else {
      html += '<div class="onboard-actions">';
      if (step.welcome) {
        html += '<button class="onboard-skip-inline" type="button">' + skipLabel + '</button>';
      } else if (idx > 0) {
        html += '<button class="onboard-back" type="button">' + backLabel + '</button>';
      } else {
        html += '<span></span>';
      }
      html += '<button class="onboard-next" type="button">' + nextLabel + '</button>' +
              '</div>';
    }

    /* Footer with dots — every step shows progress. Final step omits
       the additional Skip button since "Let's Go" is the only action. */
    html += '<div class="onboard-footer' + (step.final ? ' onboard-footer--single' : '') + '">' +
              '<div class="onboard-dots">' + dots + '</div>' +
              (step.final || step.welcome
                ? ''
                : '<button class="onboard-skip" type="button">' + skipLabel + '</button>') +
            '</div>';

    _el.tooltip.innerHTML = html;
    _el.beak = _el.tooltip.querySelector('.onboard-beak');

    /* Wire controls (no inline handlers -> no global leakage). */
    _el.tooltip.querySelector('.onboard-x').addEventListener('click', closeOnboarding);
    var skipBtn = _el.tooltip.querySelector('.onboard-skip');
    if (skipBtn) skipBtn.addEventListener('click', closeOnboarding);
    var skipInline = _el.tooltip.querySelector('.onboard-skip-inline');
    if (skipInline) skipInline.addEventListener('click', closeOnboarding);
    _el.tooltip.querySelector('.onboard-next').addEventListener('click', function () { _go(idx + 1); });
    var back = _el.tooltip.querySelector('.onboard-back');
    if (back) back.addEventListener('click', function () { _go(idx - 1); });

    /* Position the spotlight + card FIRST, then fade the card in.
       If we faded in synchronously, the card would briefly appear
       at some default location and then jump when the spotlight
       settles (most visible on Step 3, where opening the burger
       menu takes a couple hundred ms). Awaiting positioning keeps
       the entry animation smooth and on-target every time. */
    _position(idx).then(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          _el.tooltip.classList.add('onboard-tooltip--in');
        });
      });
    });
  }

  function _go(idx) {
    if (idx < 0) return;
    if (idx >= STEPS.length) { closeOnboarding(); return; }
    _render(idx);
  }

  /* ================================================================
     MOBILE HELPERS  -  menu open/close + smooth scroll-into-view
     ================================================================
     The breakpoint here MUST match the CSS breakpoint at which the
     nav burger appears (768px in styles.css). If onboarding's idea
     of "mobile" is narrower than the nav's, we end up trying to
     spotlight `.nav-links a` elements that are hidden behind a
     closed burger — the spotlight lands on nothing and the user
     sees a floating tooltip with no target. 768 = "burger is the
     only nav surface" = "use mobile flow". */
  function _isMobile() { return window.innerWidth <= 768; }

  function _setMenuOpen(open) {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    if (open) nav.classList.add('nav-open');
    else      nav.classList.remove('nav-open');
  }

  /* rAF-based smooth scroll. We DON'T use `scrollTo({behavior:'smooth'})`
     because it silently no-ops in some in-app WebViews (TikTok / Instagram
     on older Android). Hand-driving the scroll with rAF + an ease-out curve
     gives identical visual feel and works everywhere.

     SAFETY TIMER: if rAF is throttled (page not in foreground, low-power
     mode, etc.) we snap to the final position after `duration + 80ms`
     instead of hanging — guaranteeing the spotlight ALWAYS lands on its
     target. */
  function _smoothScrollTo(targetY, duration) {
    duration = duration || 380;
    return new Promise(function (resolve) {
      var startY = window.scrollY;
      var diff   = targetY - startY;
      if (Math.abs(diff) < 8) { resolve(); return; }
      var done  = false;
      var start = null;
      function step(ts) {
        if (done) return;
        if (!start) start = ts;
        var t     = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3); /* ease-out cubic */
        window.scrollTo(0, Math.round(startY + diff * eased));
        if (t < 1) requestAnimationFrame(step);
        else { done = true; resolve(); }
      }
      requestAnimationFrame(step);
      setTimeout(function () {
        if (done) return;
        done = true;
        window.scrollTo(0, targetY);
        resolve();
      }, duration + 80);
    });
  }

  /* Smooth-scroll a selector into the upper third of the viewport.
     Returns a promise that resolves once scrolling has settled. */
  function _scrollIntoView(sel) {
    var el = document.querySelector(sel);
    if (!el) return Promise.resolve();
    var r       = el.getBoundingClientRect();
    var pageY   = window.scrollY + r.top;
    var navH    = 64; /* mobile nav height */
    var targetY = Math.max(0, pageY - window.innerHeight * 0.22 - navH);
    return _smoothScrollTo(targetY);
  }

  /* Only scroll if the target isn't already comfortably in view.
     Used by desktop too — we never want a "phantom scroll" when
     the user is already looking at the right place. */
  function _scrollIntoViewIfNeeded(sel) {
    var el = document.querySelector(sel);
    if (!el) return Promise.resolve();
    var r   = el.getBoundingClientRect();
    var vpH = window.innerHeight;
    /* Comfortable = top is below the nav AND bottom fits in viewport */
    if (r.top >= 80 && r.bottom <= vpH - 40) return Promise.resolve();
    return _scrollIntoView(sel);
  }

  /* Wait until a selector has a stable, on-screen rect, or give up.
     Used after triggering an animation (e.g. opening the burger
     menu) — we can't predict the transition duration across browsers,
     so we poll once per frame for up to `maxMs` ms. Resolves with the
     rect on success, or null on timeout (caller falls back gracefully). */
  function _waitForRect(sel, maxMs) {
    return new Promise(function (resolve) {
      var deadline = Date.now() + (maxMs || 600);
      function check() {
        var r = _rectOf(sel);
        if (r && r.width > 0 && r.height > 0) return resolve(r);
        if (Date.now() > deadline) return resolve(null);
        requestAnimationFrame(check);
      }
      check();
    });
  }

  /* ================================================================
     POSITIONING  -  spotlight + card + arrow

     Returns a Promise that resolves once the spotlight + card are
     in their final position. _render() awaits it before fading the
     card in, so the tooltip never flashes in some default location
     while the spotlight is still waiting for a scroll / menu-open
     to complete.
     ================================================================ */
  function _position(idx) {
    var step     = STEPS[idx];
    var isMobile = _isMobile();

    /* Welcome + final steps: centered card, no spotlight, no scroll.
       Same card style as the spotlight steps (per mockup spec) — just
       anchored to viewport center because there's nothing to point at. */
    if (step.welcome || step.final) {
      _el.spotlight.style.cssText = 'opacity:0;width:0;height:0;left:-9999px;top:-9999px;';
      _el.tooltip.classList.remove('onboard-tooltip--below', 'onboard-tooltip--above');
      _placeHero();                                     /* still centers, just no hero variant class */
      _setMenuOpen(false);                              /* tidy nav state on both viewports */
      return Promise.resolve();
    }

    /* Pre-positioning setup. Whichever path we take MUST resolve before
       we measure the target's rect — otherwise we'd measure stale state. */
    var setup;
    if (isMobile && step.mobileOpenMenu) {
      /* Open the burger menu and wait until the target link inside it
         actually has a non-zero rect. This is more robust than the
         fixed 220ms wait we used to do — any browser CSS transition
         duration works, including reduced-motion (which is instant). */
      _setMenuOpen(true);
      var mobileSel = step.mobileTarget || step.target;
      setup = _waitForRect(mobileSel, 700);
    } else {
      /* Make sure the burger is closed for every other step,
         including on desktop where it should never be open. */
      _setMenuOpen(false);

      /* Pick the scroll-to target. mobileScrollTo applies on mobile
         only; scrollTo applies on both viewports. */
      var scrollSel = isMobile
        ? (step.mobileScrollTo || step.scrollTo)
        :  step.scrollTo;
      if (scrollSel) {
        setup = _scrollIntoViewIfNeeded(scrollSel);
      } else if (isMobile && window.scrollY > 8) {
        /* No explicit scrollTo on mobile — scroll to top so the
           burger / hero targets are reliably reachable. */
        setup = _scrollIntoView('body');
      } else {
        setup = Promise.resolve();
      }
    }

    return setup.then(function () {
      var selector = isMobile ? (step.mobileTarget || step.target) : step.target;
      var rect     = selector ? _rectOf(selector) : null;

      /* --- Spotlight ---
         Pad sized so the cream ring around a nav-link target feels
         like a deliberate "box around the button" rather than a
         tight outline. We give a little more pad to small targets
         (nav links ~50px wide) so the spotlight reads as obvious. */
      if (rect) {
        var smallTarget = rect.width < 120 || rect.height < 36;
        var pad = isMobile
          ? (smallTarget ? 13 : 11)
          : (smallTarget ? 16 : 14);
        _el.spotlight.style.cssText =
          'left:'   + (rect.left   - pad)     + 'px;' +
          'top:'    + (rect.top    - pad)     + 'px;' +
          'width:'  + (rect.width  + pad * 2) + 'px;' +
          'height:' + (rect.height + pad * 2) + 'px;' +
          'opacity:1;';
      } else {
        _el.spotlight.style.cssText = 'opacity:0;width:0;height:0;left:-9999px;top:-9999px;';
      }

      /* --- Card --- */
      _el.tooltip.classList.remove('onboard-tooltip--below', 'onboard-tooltip--above');

      if (isMobile) {
        _placeMobile(rect);
      } else if (rect) {
        _placeAnchored(rect);
      } else {
        _placeCentered();
      }
    });
  }

  /* Full-screen hero card placement — centered, large, no spotlight. */
  function _placeHero() {
    /* Reset any size constraints we set in _placeMobile so the CSS
       rules for .onboard-tooltip--hero can size the card fully. */
    _el.tooltip.style.cssText = '';
  }

  function _rectOf(sel) {
    var el = document.querySelector(sel);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    if (r.bottom < 0 || r.top  > window.innerHeight) return null;
    if (r.right  < 0 || r.left > window.innerWidth)  return null;
    return r;
  }

  /* ── Mobile / tablet card placement ────────────────────────────────
     Card is anchored DIRECTLY ABOVE OR BELOW the spotlight target with
     a small GAP, so the tooltip visibly belongs to the thing it's
     pointing at — never "floating in the middle". The user instantly
     reads: "the box with the cream ring is the thing, and the card
     right next to it explains it."

     Decision tree:
       1. No target (hero / final / fallback) → centered card near bottom
       2. Below the target has room → place below
       3. Above the target has room → place above
       4. Neither fits cleanly (very tall target) → pin to whichever
          side has more room, allowing partial overlap. The dim still
          makes the target obvious.

     Width is capped at 460px so iPad-portrait doesn't stretch the
     card edge-to-edge — it stays centered like a real anchored card,
     not a full-width banner.
     ───────────────────────────────────────────────────────────────── */
  function _placeMobile(rect) {
    var vpW        = window.innerWidth;
    var vpH        = window.innerHeight;
    var M          = 14;            /* horizontal viewport margin */
    var GAP        = 14;            /* gap between target and card */
    var NAV_GUARD  = 70;            /* reserve under the fixed nav (60px nav + breathing) */
    var SAFE_BT    = 22;            /* card-bottom inset; the card's own padding-bottom
                                       handles safe-area-inset-bottom via CSS env() */
    var MAX_W      = 460;
    /* offsetHeight is reliable once the HTML has been written into
       the tooltip — which _render() does before calling _position().
       Fallback covers the very first paint when offsetHeight=0. */
    var CH         = _el.tooltip.offsetHeight || 240;

    var width  = Math.min(vpW - M * 2, MAX_W);
    var leftPx = Math.round((vpW - width) / 2);
    var top;

    if (!rect) {
      /* No anchor → centered horizontally, near the bottom safe area */
      top = vpH - CH - SAFE_BT;
    } else {
      var spaceBelow = vpH - rect.bottom - GAP - M;       /* px under target */
      var spaceAbove = rect.top - GAP - NAV_GUARD;        /* px above target, below nav */

      if (spaceBelow >= CH) {
        /* Card fits cleanly below — preferred placement (reading order) */
        top = rect.bottom + GAP;
      } else if (spaceAbove >= CH) {
        /* Card fits cleanly above — use it */
        top = rect.top - GAP - CH;
      } else if (spaceBelow >= spaceAbove) {
        /* Neither fits perfectly — pin to bottom, accept some overlap.
           This typically happens when target is very tall (a hero
           image or a whole style card) on a short viewport. The
           dim + ring still make the target obvious. */
        top = vpH - CH - M;
      } else {
        /* Above has more room — pin below nav */
        top = NAV_GUARD;
      }
    }

    /* Final clamp so we never extend off-screen in either direction */
    top = Math.max(NAV_GUARD, Math.min(vpH - CH - M, top));

    _el.tooltip.style.cssText =
      'left:'   + leftPx        + 'px;' +
      'right: auto;' +
      'width:'  + width         + 'px;' +
      'top:'    + Math.round(top) + 'px;' +
      'bottom: auto;';
  }

  /* Card anchored beneath (or above) the target, arrow pointing at it. */
  function _placeAnchored(rect) {
    var TW  = 340;   /* card width  */
    var GAP = 15;    /* target -> card gap */
    var M   = 16;    /* viewport margin    */
    var vpW = window.innerWidth;
    var vpH = window.innerHeight;

    _el.tooltip.style.width = TW + 'px';
    var CH = _el.tooltip.offsetHeight || 210;

    /* The nav lives at the top of the page, so "below" almost always
       wins; fall back to "above" only when there is genuinely no room. */
    var fitsBelow = (rect.bottom + GAP + CH + M) <= vpH;
    var isBelow   = fitsBelow || (rect.top - GAP - CH - M) < 0;

    var top  = isBelow ? (rect.bottom + GAP) : (rect.top - GAP - CH);
    top      = Math.max(M, Math.min(vpH - CH - M, top));

    var left = rect.left + rect.width / 2 - TW / 2;
    left     = Math.max(M, Math.min(vpW - TW - M, left));

    _el.tooltip.style.left = left + 'px';
    _el.tooltip.style.top  = top  + 'px';
    _el.tooltip.classList.add(isBelow ? 'onboard-tooltip--below' : 'onboard-tooltip--above');

    /* Point the arrow at the centre of the target. */
    var beakX = rect.left + rect.width / 2 - left;
    beakX     = Math.max(26, Math.min(TW - 26, beakX));
    if (_el.beak) _el.beak.style.left = beakX + 'px';
  }

  /* Card centred (welcome step / no target). */
  function _placeCentered() {
    var TW  = 360;
    var vpW = window.innerWidth;
    var vpH = window.innerHeight;

    _el.tooltip.style.width = TW + 'px';
    var CH = _el.tooltip.offsetHeight || 240;

    _el.tooltip.style.left = Math.max(16, (vpW - TW) / 2) + 'px';
    _el.tooltip.style.top  = Math.max(16, (vpH - CH) / 2) + 'px';
  }

  /* ================================================================
     CLOSE  -  fires on finish, Skip, x, or Escape
     ────────────────────────────────────────────────────────────────
     Bulletproof teardown. The dim background the user sees is the
     spotlight's massive box-shadow (0 0 0 100vmax). If JS exits
     halfway through, that box-shadow keeps the whole page dimmed
     AND the overlay (z 9990) keeps the page non-interactive.

     This function therefore:
       1. Marks completion FIRST (Firestore + localStorage) so the
          tour can't re-show, even if everything below crashes.
       2. Restores body/document state synchronously — page is
          interactive within the same frame the user clicks
          "Let's Go" or X, regardless of what's still animating.
       3. Removes all event listeners + cancels pending timers /
          rAF jobs to prevent leaks and stale callbacks.
       4. Hides the spotlight box-shadow instantly (the dim killer)
          and fades overlay + tooltip over 260ms.
       5. Hard-removes every onboard DOM node at 280ms (primary)
          AND 1500ms (backup, in case setTimeout was throttled in
          a backgrounded tab — common on iOS Safari + IG WebView).
       6. ID-based lookup as a safety net for the removal pass —
          stale `_el` references can't strand orphan nodes.
     ================================================================ */
  var _closing = false;
  function closeOnboarding() {
    if (_closing) return;
    _closing = true;

    /* 1. Mark done. Always safe to call; ignores its own errors. */
    try { _markDone(); } catch (e) {}

    /* 2. Restore body / document state IMMEDIATELY. The page must
       become interactive in the same tick the user clicks the
       close action, even if downstream animation hangs. */
    try {
      document.body.classList.remove('onboard-active');
      document.body.style.overflow            = '';
      document.documentElement.style.overflow = '';
      document.body.style.pointerEvents       = '';
      document.documentElement.style.pointerEvents = '';
    } catch (e) {}

    /* Close the burger menu if a previous step opened it. */
    try { _setMenuOpen(false); } catch (e) {}

    /* 3. Tear down listeners + cancel timers right away. */
    try {
      window.removeEventListener('resize',           _onResize);
      window.removeEventListener('orientationchange', _onResize);
      window.removeEventListener('scroll',           _onScroll);
      document.removeEventListener('keydown',        _onKey);
      clearTimeout(_rt);
      if (_scrollRaf && window.cancelAnimationFrame) cancelAnimationFrame(_scrollRaf);
      _rt = null;
      _scrollRaf = 0;
    } catch (e) {}

    /* 4. Kill the spotlight's dim box-shadow INSTANTLY. The 100vmax
       shadow is what darkens the entire viewport — setting display:
       none drops it in one frame, no gradual fade artifact. */
    var sp = _el.spotlight || document.getElementById('onboard-spotlight');
    if (sp && sp.style) {
      try {
        sp.style.animation     = 'none';
        sp.style.boxShadow     = 'none';
        sp.style.opacity       = '0';
        sp.style.visibility    = 'hidden';
        sp.style.pointerEvents = 'none';
        sp.style.display       = 'none';
      } catch (e) {}
    }

    /* Fade overlay + tooltip — quick visual confirmation that the
       tour is closing. Visibility goes hidden after the transition. */
    [_el.overlay, _el.tooltip].forEach(function (el) {
      var node = el || null;
      if (!node) return;
      try {
        node.style.transition    = 'opacity .26s ease';
        node.style.opacity       = '0';
        node.style.pointerEvents = 'none';
      } catch (e) {}
    });

    /* 5. Hard removal — primary timer + backup timer. Both call
       hardRemove(); the second call is a no-op once the first fires. */
    var hardRemoved = false;
    function hardRemove() {
      if (hardRemoved) return;
      hardRemoved = true;

      /* ID-based sweep — covers cases where _el refs went stale
         (re-init mid-tour, race with another closer, etc.). */
      ['onboard-overlay', 'onboard-spotlight', 'onboard-tooltip'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.parentNode) {
          try { el.parentNode.removeChild(el); } catch (e) {}
        }
      });

      _el = {};
    }
    setTimeout(hardRemove, 280);    /* after fade */
    setTimeout(hardRemove, 1500);   /* backup if first was throttled */
  }

  /* ================================================================
     SAFETY NET — clean up stale onboarding DOM on bfcache restore
     ────────────────────────────────────────────────────────────────
     If the user navigates away mid-tour and the browser caches the
     page, returning via Back can show stale overlay/spotlight DOM
     that's no longer wired up to anything. This sweeps those out
     and restores body state. Idempotent + safe to call any time. */
  function _safetyCleanup() {
    var ids = ['onboard-overlay', 'onboard-spotlight', 'onboard-tooltip'];
    var any = false;
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.parentNode) {
        try { el.parentNode.removeChild(el); any = true; } catch (e) {}
      }
    }
    if (any || document.body.classList.contains('onboard-active')) {
      try {
        document.body.classList.remove('onboard-active');
        document.body.style.overflow            = '';
        document.documentElement.style.overflow = '';
        document.body.style.pointerEvents       = '';
        document.documentElement.style.pointerEvents = '';
        _setMenuOpen(false);
      } catch (e) {}
    }
  }
  window.addEventListener('pageshow', function (e) {
    /* bfcache restore — clean up any stale onboarding DOM that came
       along with the cached page. */
    if (e.persisted) _safetyCleanup();
  });

  /* ── DOMContentLoaded sweep ────────────────────────────────────
     If a previous tour crashed mid-DOM (extension injection,
     CSS conflict, JS error) the body could carry an orphaned
     onboard-* element OR an `onboard-active` class. Sweep before
     our own boot runs — we'll recreate fresh DOM if a tour is
     actually needed. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _safetyCleanup);
  } else {
    _safetyCleanup();
  }

  /* ── Global Escape — emergency exit ───────────────────────────
     Even if onboarding's own keydown listener has been lost (e.g.
     after a partial close that left DOM behind), pressing Escape
     ANYWHERE will run _safetyCleanup() and restore the page.
     Always-on, doesn't interfere with normal page use because it
     only acts when onboard DOM is actually present. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (document.getElementById('onboard-overlay') ||
        document.getElementById('onboard-spotlight')) {
      closeOnboarding();
      /* Belt and suspenders — if closeOnboarding short-circuits
         (already _closing), run safety directly. */
      setTimeout(_safetyCleanup, 50);
    }
  });

  /* ── Max-duration watchdog ────────────────────────────────────
     If onboarding DOM has been on the page for more than 5 minutes,
     something is definitely wrong. Force-clean so the page is never
     trapped. 5 min is well above any reasonable reading time for a
     5-step tour. Checked every 15s; cheap. */
  var _onboardOpenedAt = 0;
  setInterval(function () {
    var overlay = document.getElementById('onboard-overlay');
    if (!overlay) { _onboardOpenedAt = 0; return; }
    if (!_onboardOpenedAt) { _onboardOpenedAt = Date.now(); return; }
    if (Date.now() - _onboardOpenedAt > 5 * 60 * 1000) {
      _onboardOpenedAt = 0;
      try { _markDone(); } catch (e) {}
      _safetyCleanup();
    }
  }, 15 * 1000);

  /* Record completion to BOTH stores so it never auto-shows again. */
  function _markDone() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    if (_uid && typeof _db !== 'undefined') {
      try {
        _db.collection('users').doc(_uid).set(
          { onboardedAt: firebase.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        ).catch(function () {});
      } catch (e) {}
    }
  }

  /* ================================================================
     EVENTS
     ================================================================ */
  function _onResize() {
    clearTimeout(_rt);
    _rt = setTimeout(function () {
      if (document.getElementById('onboard-overlay')) _position(_step);
    }, 110);
  }

  /* Re-position spotlight + card on scroll. Cheap because we only
     update transform/inset of two elements (no layout reads beyond
     a single getBoundingClientRect on the target). */
  var _scrollRaf = 0;
  function _onScroll() {
    if (_scrollRaf) return;
    _scrollRaf = requestAnimationFrame(function () {
      _scrollRaf = 0;
      if (document.getElementById('onboard-overlay')) _repositionForScroll();
    });
  }
  function _repositionForScroll() {
    var step = STEPS[_step];
    if (!step) return;
    var selector = _isMobile() ? (step.mobileTarget || step.target) : step.target;
    var rect     = selector ? _rectOf(selector) : null;
    if (!rect) return;
    var pad = _isMobile() ? 7 : PAD;
    _el.spotlight.style.left   = (rect.left   - pad)     + 'px';
    _el.spotlight.style.top    = (rect.top    - pad)     + 'px';
    _el.spotlight.style.width  = (rect.width  + pad * 2) + 'px';
    _el.spotlight.style.height = (rect.height + pad * 2) + 'px';
    if (_isMobile()) _placeMobile(rect); /* card may flip top/bottom */
  }

  function _onKey(e) {
    if (e.key === 'Escape')     { closeOnboarding(); return; }
    if (e.key === 'ArrowRight') { _go(_step + 1);    return; }
    if (e.key === 'ArrowLeft')  { _go(_step - 1); }
  }

})();
