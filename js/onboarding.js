/* ================================================================
   AURA — First-time onboarding guide   (onboarding.js v2)

   Shows EXACTLY ONCE per user account — enforced by reading
   Firestore BEFORE deciding whether to show, so the guide never
   repeats even if localStorage is cleared or the user is on a
   new device.

   Decision tree on every page load:
     1. Is this a replay request (?onboard=1)?  → show, skip all checks
     2. Did we already process this UID this session? → skip
     3. Does localStorage have the flag?        → skip (fast path)
     4. Does Firestore have onboardedAt?        → sync localStorage, skip
     5. None of the above                       → first time, show guide

   Completion writes:
     localStorage  →  aura_onboarded = '1'
     Firestore     →  users/{uid}.onboardedAt = serverTimestamp()

   Replay (manual only):
     Settings → "Replay Aura Guide" → index.html?onboard=1
   ================================================================ */

(function () {
  'use strict';

  var STORAGE_KEY  = 'aura_onboarded';
  var REPLAY_PARAM = 'onboard';
  var PAD          = 10;   // spotlight padding around target element (px)

  var STEPS = [
    {
      target:   '.nav-links a[href="quiz.html"]',
      symbol:   '✦',
      headline: 'Let\'s find your aesthetic.',
      body:     'Answer a few questions and Aura will discover the style that feels most like you — your identity, your community, your fashion world.',
      tip:      'Takes about three minutes. Worth every second.',
    },
    {
      target:   '.nav-links a[href="community.html"]',
      symbol:   '◎',
      headline: 'Your fashion circle.',
      body:     'Private groups for every aesthetic. Connect exclusively with people who share your exact taste, energy, and style — no one else gets in.',
      tip:      'Your people are already here.',
    },
    {
      target:   '.nav-links a[href="moodboard.html"]',
      symbol:   '◈',
      headline: 'Your personal moodboard.',
      body:     'Save outfits, looks, and pieces you love. Build the wardrobe you\'re growing toward — one beautiful thing at a time.',
      tip:      'Heart anything, anywhere. It all lives here.',
    },
    {
      target:   '.nav-links a[href="index.html#styles"]',
      symbol:   '✿',
      headline: 'Every aesthetic, explored.',
      body:     'Tap any style world to shop curated looks and discover outfits that match the exact vibe you\'re after.',
      tip:      'From Y2K to Dark Academia — there\'s a world for you.',
    },
    {
      target:   null,
      symbol:   '◆',
      headline: 'Aura was made for you.',
      body:     'Everything here — the quiz, the circles, the looks, the moodboard — is designed to feel like it truly knows you.',
      tip:      'Because it will.',
      final:    true,
    },
  ];

  /* ── State ──────────────────────────────────────────────────── */
  var _el          = {};    // { overlay, spotlight, tooltip }
  var _step        = 0;
  var _uid         = null;
  var _isReplay    = false; // set by ?onboard=1 before auth resolves
  var _checkedUids = {};    // prevents re-triggering the same UID in one page session
  var _resizeTimer = null;

  /* ── Public API ─────────────────────────────────────────────── */
  window.startOnboarding = startOnboarding;
  window.closeOnboarding = closeOnboarding;
  window._onboardNext    = onboardNext;
  window._onboardBack    = onboardBack;

  /* ── Boot ───────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Detect replay request BEFORE auth resolves so the flag is ready */
    var params = new URLSearchParams(location.search);
    if (params.get(REPLAY_PARAM) === '1') {
      localStorage.removeItem(STORAGE_KEY);
      history.replaceState(null, '', location.pathname);
      _isReplay = true;
    }

    if (typeof onAuthChange !== 'function') return;

    onAuthChange(function (user) {
      _uid = user ? user.uid : null;
      if (!user) return;

      /* ── Guard 1: only run the check once per UID per page session.
         onAuthStateChanged can fire multiple times (token refresh, etc.)
         and we must not queue up duplicate guide checks. */
      if (_checkedUids[user.uid]) return;
      _checkedUids[user.uid] = true;

      /* ── Guard 2: explicit replay — bypass all completion checks */
      if (_isReplay) {
        _isReplay = false; // consume so it doesn't fire again
        _waitForIntro(function () { startOnboarding(true); });
        return;
      }

      /* ── Guard 3: fast path — localStorage already flagged on this device */
      if (localStorage.getItem(STORAGE_KEY)) return;

      /* ── Guard 4: Firestore check — handles cross-device case.
         Read onboardedAt from the user's Firestore doc. If it exists,
         the guide was already completed on another device. Sync
         localStorage and stop. Only show if the field is genuinely absent. */
      if (typeof _db === 'undefined') {
        /* Firestore not yet available — rely on localStorage alone */
        _waitForIntro(function () { startOnboarding(); });
        return;
      }

      _db.collection('users').doc(user.uid).get()
        .then(function (doc) {
          var data = doc.exists ? doc.data() : null;
          if (data && data.onboardedAt) {
            /* Already done on another device — sync flag locally and stop */
            localStorage.setItem(STORAGE_KEY, '1');
            return;
          }
          /* Genuinely first time on any device — show the guide */
          _waitForIntro(function () { startOnboarding(); });
        })
        .catch(function () {
          /* Firestore unreachable — fall back to localStorage gate.
             If localStorage is empty we show; on the next visit
             localStorage will have the flag from _markDone(). */
          _waitForIntro(function () { startOnboarding(); });
        });
    });
  });

  /* ── Wait for cinematic preroll to finish ───────────────────── */
  /* Observes #intro-preroll and defers the guide until it fades out,
     so the first-impression moment isn't interrupted. */
  function _waitForIntro(cb) {
    var preroll = document.getElementById('intro-preroll');
    if (!preroll) { setTimeout(cb, 800); return; }

    var st = getComputedStyle(preroll);
    if (st.display === 'none' || parseFloat(st.opacity) < 0.1) {
      setTimeout(cb, 600);
      return;
    }

    var fired = false;
    var observer = new MutationObserver(function () {
      if (fired) return;
      var s = getComputedStyle(preroll);
      if (parseFloat(s.opacity) < 0.1 || s.display === 'none' || s.visibility === 'hidden') {
        fired = true;
        observer.disconnect();
        setTimeout(cb, 700);
      }
    });
    observer.observe(preroll, { attributes: true, attributeFilter: ['style', 'class'] });

    /* Hard fallback — start after 4 s regardless */
    setTimeout(function () {
      if (fired) return;
      fired = true;
      observer.disconnect();
      cb();
    }, 4000);
  }

  /* ── Start ──────────────────────────────────────────────────── */
  function startOnboarding(force) {
    if (!force && localStorage.getItem(STORAGE_KEY)) return;
    if (document.getElementById('onboard-overlay')) return; // already running

    _step = 0;
    _buildDOM();
    _showStep(0);
  }

  /* ── DOM construction ───────────────────────────────────────── */
  function _buildDOM() {
    _el.overlay = document.createElement('div');
    _el.overlay.id        = 'onboard-overlay';
    _el.overlay.className = 'onboard-overlay';

    _el.spotlight = document.createElement('div');
    _el.spotlight.id        = 'onboard-spotlight';
    _el.spotlight.className = 'onboard-spotlight';

    _el.tooltip = document.createElement('div');
    _el.tooltip.id        = 'onboard-tooltip';
    _el.tooltip.className = 'onboard-tooltip';
    _el.tooltip.setAttribute('role',       'dialog');
    _el.tooltip.setAttribute('aria-modal', 'true');
    _el.tooltip.setAttribute('aria-label', 'Aura style guide');

    document.body.appendChild(_el.overlay);
    document.body.appendChild(_el.spotlight);
    document.body.appendChild(_el.tooltip);
    document.body.classList.add('onboard-active');

    window.addEventListener('resize', _onResize);
    document.addEventListener('keydown', _onKey);
  }

  /* ── Step rendering ─────────────────────────────────────────── */
  function _showStep(idx) {
    var step = STEPS[idx];
    if (!step) { closeOnboarding(); return; }

    _el.tooltip.classList.remove('onboard-tooltip--in');

    var dots = STEPS.map(function (_, i) {
      return '<span class="onboard-dot' + (i === idx ? ' onboard-dot--on' : '') + '"></span>';
    }).join('');

    _el.tooltip.innerHTML =
      '<button class="onboard-close-btn" onclick="closeOnboarding()" aria-label="Close guide">×</button>' +

      '<div class="onboard-step-symbol">' + step.symbol + '</div>' +

      '<h3 class="onboard-headline">' + step.headline + '</h3>' +
      '<p class="onboard-body">'     + step.body     + '</p>' +
      (step.tip ? '<p class="onboard-tip">' + step.tip + '</p>' : '') +

      '<div class="onboard-actions">' +
        (idx > 0
          ? '<button class="onboard-back-btn" onclick="_onboardBack()">← Back</button>'
          : '<span></span>') +
        '<button class="onboard-next-btn' + (step.final ? ' onboard-next--final' : '') + '" onclick="_onboardNext()">' +
          (step.final ? 'Start exploring ✦' : 'Next →') +
        '</button>' +
      '</div>' +

      '<div class="onboard-footer-row">' +
        '<div class="onboard-dots">' + dots + '</div>' +
        '<button class="onboard-skip-btn" onclick="closeOnboarding()">Skip guide</button>' +
      '</div>';

    _positionStep(idx);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        _el.tooltip.classList.add('onboard-tooltip--in');
      });
    });
  }

  /* ── Positioning ────────────────────────────────────────────── */
  function _positionStep(idx) {
    var step     = STEPS[idx];
    var isMobile = window.innerWidth <= 680;
    var rect     = _getRect(step.target);

    if (rect && !isMobile) {
      _el.spotlight.style.cssText =
        'left:'   + (rect.left   - PAD)    + 'px;' +
        'top:'    + (rect.top    - PAD)    + 'px;' +
        'width:'  + (rect.width  + PAD*2)  + 'px;' +
        'height:' + (rect.height + PAD*2)  + 'px;' +
        'opacity:1;';
    } else {
      _el.spotlight.style.cssText = 'opacity:0;width:0;height:0;top:-9999px;left:-9999px;';
    }

    if (!isMobile) {
      _placeTooltip(rect);
    } else {
      _el.tooltip.removeAttribute('style');
    }
  }

  function _getRect(selector) {
    if (!selector) return null;
    var el = document.querySelector(selector);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    if (r.bottom < 0 || r.top  > window.innerHeight) return null;
    if (r.right  < 0 || r.left > window.innerWidth)  return null;
    return r;
  }

  function _placeTooltip(rect) {
    var TW     = 368;
    var MARGIN = 18;
    var vpW    = window.innerWidth;
    var vpH    = window.innerHeight;
    var left, top;

    if (rect) {
      var belowFits = (rect.bottom + 18 + 300) < vpH;
      var aboveFits = (rect.top   - 18 - 280) > 0;

      if (belowFits) {
        top = rect.bottom + 18;
      } else if (aboveFits) {
        top = rect.top - 18 - 280;
      } else {
        top = Math.max(MARGIN, (vpH - 300) / 2);
      }
      left = rect.left + rect.width / 2 - TW / 2;
    } else {
      left = (vpW - TW) / 2;
      top  = (vpH - 320) / 2;
    }

    left = Math.max(MARGIN, Math.min(vpW - TW - MARGIN, left));
    top  = Math.max(MARGIN + 60, Math.min(vpH - 340 - MARGIN, top));

    _el.tooltip.style.cssText =
      'left:'  + left + 'px;' +
      'top:'   + top  + 'px;' +
      'width:' + TW   + 'px;';
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  function onboardNext() {
    _step++;
    if (_step >= STEPS.length) { closeOnboarding(); return; }
    _showStep(_step);
  }

  function onboardBack() {
    if (_step > 0) { _step--; _showStep(_step); }
  }

  /* ── Complete / close ───────────────────────────────────────── */
  function closeOnboarding() {
    _markDone();

    var fadeTargets = [_el.overlay, _el.spotlight, _el.tooltip];
    fadeTargets.forEach(function (el) {
      if (!el) return;
      el.style.transition = 'opacity .38s ease';
      el.style.opacity    = '0';
    });

    setTimeout(function () {
      fadeTargets.forEach(function (el) { if (el) el.remove(); });
      _el = {};
      document.body.classList.remove('onboard-active');
      window.removeEventListener('resize', _onResize);
      document.removeEventListener('keydown', _onKey);
    }, 400);
  }

  function _markDone() {
    /* Write completion immediately to both localStorage and Firestore
       so the next check (any device) will find it. */
    localStorage.setItem(STORAGE_KEY, '1');
    if (_uid && typeof _db !== 'undefined') {
      try {
        _db.collection('users').doc(_uid).set(
          { onboardedAt: firebase.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        ).catch(function () {});
      } catch (e) {}
    }
  }

  /* ── Events ─────────────────────────────────────────────────── */
  function _onResize() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      if (document.getElementById('onboard-overlay')) _positionStep(_step);
    }, 120);
  }

  function _onKey(e) {
    if (e.key === 'Escape')                              { closeOnboarding(); return; }
    if (e.key === 'ArrowRight' || e.key === 'Enter')     { onboardNext();     return; }
    if (e.key === 'ArrowLeft'  && _step > 0)             { onboardBack(); }
  }

})();
