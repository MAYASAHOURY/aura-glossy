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
      {
        welcome:  true,
        headline: _t('onboarding.welcome_headline', 'Welcome to Aura.'),
        body:     _t('onboarding.welcome_body',     'A quick look at where to start.')
      },
      {
        target:        '.nav-links a[href="quiz.html"]',
        mobileTarget:  '.hero-actions a[href="quiz.html"]',
        mobileScrollTo:'.hero',
        headline:      _t('onboarding.quiz_headline', 'Start with the quiz.'),
        body:          _t('onboarding.quiz_body',     'Find your style in 10 questions.')
      },
      {
        target:        '.nav-links a[href="community.html"]',
        mobileTarget:  '.nav.nav-open .nav-links a[href="community.html"]',
        mobileOpenMenu:true,
        headline:      _t('onboarding.community_headline', 'Join your circle.'),
        body:          _t('onboarding.community_body',     'Meet people who share your taste.')
      },
      {
        target:        '.nav-links a[href="moodboard.html"]',
        mobileTarget:  '.nav.nav-open .nav-links a[href="moodboard.html"]',
        mobileOpenMenu:true,
        headline:      _t('onboarding.moodboard_headline', 'Save looks you love.'),
        body:          _t('onboarding.moodboard_body',     'Build your inspiration.')
      },
      {
        target:        '.nav-links a[href="#styles"]',
        mobileTarget:  '#styles .style-card:first-child',
        mobileScrollTo:'#styles',
        headline:      _t('onboarding.aesthetics_headline', 'Find your style.'),
        body:          _t('onboarding.aesthetics_body',     'Browse curated aesthetics.')
      },
      {
        /* Language-selector step — points at the lang switcher inside
           the burger menu (on desktop the switcher is also in the menu). */
        target:        '#lang-switcher .aura-lang-pills',
        mobileTarget:  '.nav.nav-open #lang-switcher .aura-lang-pills',
        mobileOpenMenu:true,
        headline:      _t('onboarding.lang_headline', 'Aura speaks your language.'),
        body:          _t('onboarding.lang_body',     'Switch languages anytime here.'),
        final:         true
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
    if (document.getElementById('onboard-overlay')) return;   /* already open */
    if (!force) {
      try { if (localStorage.getItem(STORAGE_KEY)) return; } catch (e) {}
    }
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

    /* Stop clicks inside the tooltip from bubbling to document.
       The site has a global click listener (in main.js / initNavBurger)
       that closes the burger menu whenever a click lands outside .nav —
       without this stop, tapping our Next button would close the
       menu we just opened on the "Community" / "Moodboard" steps. */
    _el.tooltip.addEventListener('click', function (e) { e.stopPropagation(); });
    /* Same protection for the dim backdrop and spotlight ring. */
    _el.overlay.addEventListener('click',   function (e) { e.stopPropagation(); });
    _el.spotlight.addEventListener('click', function (e) { e.stopPropagation(); });

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

    var dots = '';
    for (var i = 0; i < STEPS.length; i++) {
      dots += '<span class="onboard-dot' + (i === idx ? ' onboard-dot--on' : '') + '"></span>';
    }

    var nextLabel = step.final   ? _t('onboarding.next_final', 'Start exploring ✦')
                  : step.welcome ? _t('onboarding.next_show',  'Show me around →')
                  :                _t('common.next',           'Next →');
    var backLabel = _t('common.back', 'Back');
    var skipLabel = _t('common.skip', 'Skip');
    var eyebrowTx = _t('onboarding.eyebrow', 'Aura Guide');

    var html =
      '<span class="onboard-beak"></span>' +
      '<button class="onboard-x" type="button" aria-label="' + _t('common.close', 'Close') + '">×</button>';

    if (step.welcome) {
      html += '<div class="onboard-eyebrow">' + eyebrowTx + '</div>' +
              '<div class="onboard-mark">✦</div>';
    }

    html +=
      '<h3 class="onboard-headline">' + step.headline + '</h3>' +
      '<p class="onboard-body">'      + step.body     + '</p>' +
      '<div class="onboard-actions">' +
        (idx > 0
          ? '<button class="onboard-back" type="button">' + backLabel + '</button>'
          : '<span></span>') +
        '<button class="onboard-next' + (step.final ? ' onboard-next--final' : '') +
          '" type="button">' + nextLabel + '</button>' +
      '</div>' +
      '<div class="onboard-footer">' +
        '<div class="onboard-dots">' + dots + '</div>' +
        '<button class="onboard-skip" type="button">' + skipLabel + '</button>' +
      '</div>';

    _el.tooltip.innerHTML = html;
    _el.beak = _el.tooltip.querySelector('.onboard-beak');

    /* Wire controls (no inline handlers -> no global leakage). */
    _el.tooltip.querySelector('.onboard-x').addEventListener('click', closeOnboarding);
    _el.tooltip.querySelector('.onboard-skip').addEventListener('click', closeOnboarding);
    _el.tooltip.querySelector('.onboard-next').addEventListener('click', function () { _go(idx + 1); });
    var back = _el.tooltip.querySelector('.onboard-back');
    if (back) back.addEventListener('click', function () { _go(idx - 1); });

    _position(idx);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        _el.tooltip.classList.add('onboard-tooltip--in');
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
     ================================================================ */
  function _isMobile() { return window.innerWidth <= 680; }

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

  /* ================================================================
     POSITIONING  -  spotlight + card + arrow
     ================================================================ */
  function _position(idx) {
    var step     = STEPS[idx];
    var isMobile = _isMobile();

    /* On mobile, run any setup the step needs BEFORE we measure rects.
       This is what makes spotlights actually work on phones:
         • open the hamburger menu so nav links become visible
         • smooth-scroll a section into view
       Once setup is done we measure and position synchronously. */
    var setup = Promise.resolve();
    if (isMobile) {
      _setMenuOpen(!!step.mobileOpenMenu);
      if (step.mobileOpenMenu) {
        /* Wait for the menu drop-in animation to settle */
        setup = new Promise(function (r) { setTimeout(r, 220); });
      } else if (step.mobileScrollTo) {
        setup = _scrollIntoView(step.mobileScrollTo);
      } else if (window.scrollY > 8 && !step.welcome) {
        /* Default: ensure we're at the top so the target is reachable */
        setup = _scrollIntoView('body');
      }
    }

    setup.then(function () {
      var selector = isMobile ? (step.mobileTarget || step.target) : step.target;
      var rect     = selector ? _rectOf(selector) : null;

      /* --- Spotlight --- */
      if (rect) {
        var pad = isMobile ? 7 : PAD;
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

  function _rectOf(sel) {
    var el = document.querySelector(sel);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    if (r.bottom < 0 || r.top  > window.innerHeight) return null;
    if (r.right  < 0 || r.left > window.innerWidth)  return null;
    return r;
  }

  /* ── Mobile card placement ────────────────────────────────────────
     Card pinned to bottom (with safe-area inset). If the spotlight
     would overlap the card, we shift the card to the top instead.
     ───────────────────────────────────────────────────────────────── */
  function _placeMobile(rect) {
    var vpH    = window.innerHeight;
    var M      = 14;
    var safeBt = 22; /* visual bottom margin */
    /* Estimate card height from current content; offsetHeight is
       reliable once content is rendered. Fallback 220px. */
    var CH     = _el.tooltip.offsetHeight || 220;

    /* Where would the card sit if pinned bottom? */
    var bottomCardTop = vpH - CH - safeBt;

    /* If the spotlight target is in the lower half AND would overlap
       the bottom card, pin to top instead. */
    var pinTop = false;
    if (rect) {
      /* Bottom card overlaps target if target's bottom edge > card's top */
      if (rect.bottom > bottomCardTop - 10) pinTop = true;
    }

    _el.tooltip.style.cssText =
      'left:'   + M + 'px;' +
      'right:'  + M + 'px;' +
      'width:'  + 'auto;' +
      (pinTop
        ? 'top:'    + (88) + 'px; bottom: auto;'
        : 'bottom:' + safeBt + 'px; top: auto;');
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
     ================================================================ */
  function closeOnboarding() {
    _markDone();   /* idempotent - safe to call again */

    var parts = [_el.overlay, _el.spotlight, _el.tooltip];
    parts.forEach(function (el) {
      if (!el) return;
      el.style.transition = 'opacity .34s ease';
      el.style.opacity    = '0';
    });

    setTimeout(function () {
      parts.forEach(function (el) { if (el) el.remove(); });
      _el = {};
      document.body.classList.remove('onboard-active');
      /* Close the burger menu if a previous step opened it. Without this,
         the menu stays open after the guide ends and the user has to
         tap the burger twice to dismiss it. */
      _setMenuOpen(false);
      window.removeEventListener('resize',     _onResize);
      window.removeEventListener('orientationchange', _onResize);
      window.removeEventListener('scroll',     _onScroll);
      document.removeEventListener('keydown',  _onKey);
    }, 380);
  }

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
