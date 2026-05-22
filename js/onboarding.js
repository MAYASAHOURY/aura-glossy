/* ================================================================
   AURA — First-time onboarding guide   (onboarding.js v1)

   Shows once after first sign-in. Dims the page, spotlights each
   nav element in sequence, and guides the user through the platform.

   Replay:  navigate to  index.html?onboard=1
            or use Settings → "Replay Aura Guide"

   Storage: localStorage  aura_onboarded = '1'
            Firestore      users/{uid}.onboardedAt = serverTimestamp()
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

  /* ── State ───────────────────────────────────────────────── */
  var _el   = {};       // {overlay, spotlight, tooltip}
  var _step = 0;
  var _uid  = null;
  var _resizeTimer = null;

  /* ── Public API ──────────────────────────────────────────── */
  window.startOnboarding = startOnboarding;
  window.closeOnboarding = closeOnboarding;
  window._onboardNext    = onboardNext;
  window._onboardBack    = onboardBack;

  /* ── Boot ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    /* Replay via ?onboard=1 URL param */
    var params = new URLSearchParams(location.search);
    if (params.get(REPLAY_PARAM) === '1') {
      localStorage.removeItem(STORAGE_KEY);
      history.replaceState(null, '', location.pathname);
    }

    if (typeof onAuthChange !== 'function') return;

    onAuthChange(function (user) {
      _uid = user ? user.uid : null;
      if (!user) return;
      if (!localStorage.getItem(STORAGE_KEY)) {
        _waitForIntro(function () { startOnboarding(); });
      }
    });
  });

  /* Wait until the cinematic preroll (#intro-preroll) finishes before
     showing the guide, so we don't interrupt the first-impression moment. */
  function _waitForIntro(cb) {
    var preroll = document.getElementById('intro-preroll');
    if (!preroll) { setTimeout(cb, 800); return; }

    /* Check if it's already hidden */
    var st = getComputedStyle(preroll);
    if (st.display === 'none' || st.opacity === '0' || parseFloat(st.opacity) < 0.1) {
      setTimeout(cb, 600);
      return;
    }

    /* Observe style/class changes — fires when intro.js hides the preroll */
    var observer = new MutationObserver(function () {
      var s = getComputedStyle(preroll);
      if (parseFloat(s.opacity) < 0.1 || s.display === 'none' || s.visibility === 'hidden') {
        observer.disconnect();
        setTimeout(cb, 700);
      }
    });
    observer.observe(preroll, { attributes: true, attributeFilter: ['style', 'class'] });

    /* Hard fallback — start after 4 s regardless */
    setTimeout(function () { observer.disconnect(); cb(); }, 4000);
  }

  /* ── Start ───────────────────────────────────────────────── */
  function startOnboarding(force) {
    if (!force && localStorage.getItem(STORAGE_KEY)) return;
    if (document.getElementById('onboard-overlay')) return;

    _step = 0;
    _buildDOM();
    _showStep(0);
  }

  /* ── DOM construction ────────────────────────────────────── */
  function _buildDOM() {
    /* Click-blocker backdrop — prevents clicking through to nav links */
    _el.overlay = document.createElement('div');
    _el.overlay.id        = 'onboard-overlay';
    _el.overlay.className = 'onboard-overlay';

    /* Spotlight — transparent element whose box-shadow dims everything outside */
    _el.spotlight = document.createElement('div');
    _el.spotlight.id        = 'onboard-spotlight';
    _el.spotlight.className = 'onboard-spotlight';

    /* Tooltip card */
    _el.tooltip = document.createElement('div');
    _el.tooltip.id        = 'onboard-tooltip';
    _el.tooltip.className = 'onboard-tooltip';
    _el.tooltip.setAttribute('role',        'dialog');
    _el.tooltip.setAttribute('aria-modal',  'true');
    _el.tooltip.setAttribute('aria-label',  'Aura style guide');

    document.body.appendChild(_el.overlay);
    document.body.appendChild(_el.spotlight);
    document.body.appendChild(_el.tooltip);
    document.body.classList.add('onboard-active');

    window.addEventListener('resize', _onResize);
    document.addEventListener('keydown', _onKey);
  }

  /* ── Step rendering ──────────────────────────────────────── */
  function _showStep(idx) {
    var step = STEPS[idx];
    if (!step) { closeOnboarding(); return; }

    /* Fade out first, then swap content */
    _el.tooltip.classList.remove('onboard-tooltip--in');

    var dots = STEPS.map(function (_, i) {
      return '<span class="onboard-dot' + (i === idx ? ' onboard-dot--on' : '') + '"></span>';
    }).join('');

    _el.tooltip.innerHTML =
      '<button class="onboard-close-btn" onclick="closeOnboarding()" aria-label="Close guide">×</button>' +

      '<div class="onboard-step-symbol">' + step.symbol + '</div>' +

      '<h3 class="onboard-headline">' + step.headline + '</h3>' +
      '<p class="onboard-body">'     + step.body     + '</p>' +
      (step.tip
        ? '<p class="onboard-tip">' + step.tip + '</p>'
        : '') +

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

    /* Position, then fade in */
    _positionStep(idx);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        _el.tooltip.classList.add('onboard-tooltip--in');
      });
    });
  }

  /* ── Positioning ─────────────────────────────────────────── */
  function _positionStep(idx) {
    var step     = STEPS[idx];
    var isMobile = window.innerWidth <= 680;
    var rect     = _getRect(step.target);

    /* Spotlight */
    if (rect && !isMobile) {
      _el.spotlight.style.cssText =
        'left:'   + (rect.left   - PAD)         + 'px;' +
        'top:'    + (rect.top    - PAD)          + 'px;' +
        'width:'  + (rect.width  + PAD * 2)      + 'px;' +
        'height:' + (rect.height + PAD * 2)      + 'px;' +
        'opacity:1;';
    } else {
      /* No spotlight on mobile — overlay handles the dim */
      _el.spotlight.style.cssText = 'opacity:0;width:0;height:0;top:-9999px;left:-9999px;';
    }

    /* Tooltip — desktop only (mobile is CSS-pinned to bottom) */
    if (!isMobile) {
      _placeTooltip(rect);
    }
    /* On mobile: clear inline styles, let CSS take over */
    else {
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

      /* Center on target, clamped */
      left = rect.left + rect.width / 2 - TW / 2;
    } else {
      /* Centered on screen */
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

  /* ── Navigation ──────────────────────────────────────────── */
  function onboardNext() {
    _step++;
    if (_step >= STEPS.length) { closeOnboarding(); return; }
    _showStep(_step);
  }

  function onboardBack() {
    if (_step > 0) { _step--; _showStep(_step); }
  }

  /* ── Complete / close ────────────────────────────────────── */
  function closeOnboarding() {
    _markDone();

    /* Fade everything out before removing */
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

  /* ── Events ──────────────────────────────────────────────── */
  function _onResize() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      if (document.getElementById('onboard-overlay')) {
        _positionStep(_step);
      }
    }, 120);
  }

  function _onKey(e) {
    if (e.key === 'Escape')                     { closeOnboarding(); return; }
    if (e.key === 'ArrowRight' || e.key === 'Enter') { onboardNext();     return; }
    if (e.key === 'ArrowLeft'  && _step > 0)    { onboardBack(); }
  }

})();
