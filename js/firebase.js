/* ============================================================
   AURA — Firebase Firestore integration
   Overrides main.js moodboard functions with cloud storage
   ============================================================ */

const AURA_FB_CONFIG = {
  apiKey:            "AIzaSyAO0RDi_9YaSm-kpTpB7MHVyDkcaveUqlk",
  authDomain:        "auraglossy.com",
  projectId:         "aura-fashion-fc2d4",
  storageBucket:     "aura-fashion-fc2d4.firebasestorage.app",
  messagingSenderId: "246808677665",
  appId:             "1:246808677665:web:4ef423fef9e63b9989c260"
};

if (!firebase.apps.length) firebase.initializeApp(AURA_FB_CONFIG);
const _db   = firebase.firestore();
const _auth = firebase.auth();

// Persist across browser restarts; fall back to SESSION if LOCAL is blocked (iOS private mode / ITP)
_auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function() {
  return _auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
}).catch(function() {});

/* ─────────────────────────────────────────────────────────────────
   IN-APP BROWSER DETECTION  —  single source of truth
   ────────────────────────────────────────────────────────────────
   Pages should read `Aura.inApp.is` instead of running their own
   regex. Centralising means a single update flips behavior across
   the whole site. The regex matches the User-Agent strings used by
   TikTok, Instagram, Facebook, Snapchat, Pinterest, Twitter, Line,
   WeChat — i.e. the embedded WebViews where Google OAuth popups
   either silently fail or trap users without a back button.

   `Aura.inApp.openExternal(url?)` is the "Open in your browser"
   helper. Most in-app browsers expose this via their "…" menu, so
   the cleanest cross-platform fallback is: copy the URL, surface
   the instruction. We attempt `window.open(_blank)` first, which
   does work in a few of them (notably some Pinterest builds).
   ─────────────────────────────────────────────────────────────── */
(function () {
  var ua = '';
  try { ua = navigator.userAgent || ''; } catch (e) {}
  var IA_RE = /TikTok|musical_ly|Instagram|FBAN|FBAV|FB_IAB|FBIOS|Twitter|TwitterAndroid|Snapchat|Pinterest|Line\/|MicroMessenger|WeChat|KAKAOTALK/i;
  var is = IA_RE.test(ua);
  /* Per-platform name for nicer error copy */
  var name =
    /TikTok|musical_ly/i.test(ua)            ? 'TikTok'    :
    /Instagram/i.test(ua)                    ? 'Instagram' :
    /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)       ? 'Facebook'  :
    /Snapchat/i.test(ua)                     ? 'Snapchat'  :
    /Pinterest/i.test(ua)                    ? 'Pinterest' :
    /Line\//i.test(ua)                       ? 'LINE'      :
    /MicroMessenger|WeChat/i.test(ua)        ? 'WeChat'    : null;

  window.Aura = window.Aura || {};
  window.Aura.inApp = {
    is: is,
    name: name,
    /* Hint the head-gate logic uses to skip intro on slow WebViews */
    isSlow: (function () {
      try {
        var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return !!(c && (c.saveData || /(^|-)2g$/i.test(c.effectiveType || '')));
      } catch (e) { return false; }
    })(),
    /* Try to open the URL outside the in-app browser. Returns true
       if window.open succeeded (some in-app browsers honor it). */
    openExternal: function (url) {
      url = url || window.location.href;
      try {
        var w = window.open(url, '_blank', 'noopener');
        if (w) return true;
      } catch (e) {}
      return false;
    },
    /* Best-effort copy of the current/given URL to the clipboard so
       the user can paste it into their default browser. Returns a
       Promise<boolean>. */
    copyUrl: function (url) {
      url = url || window.location.href;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(url).then(function () { return true; }, function () { return false; });
        }
      } catch (e) {}
      try {
        var ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        return Promise.resolve(!!ok);
      } catch (e) { return Promise.resolve(false); }
    }
  };
})();

/* ─────────────────────────────────────────────────────────────────
   AURA — Signup-gate modal + requireAuth helper

   Public-browsing UX rewrite (2026-05-25): the platform is now open
   for read/browse but personal actions (save, shop link, quiz result,
   community write) require auth. This API is the single gate every
   guarded action calls.

   API:
     Aura.isSignedIn()                 → bool. Sync via _auth.currentUser.
     Aura.onAuthReady(cb)              → callback fires with (user|null) when
                                          Firebase auth state is first known.
     Aura.requireAuth(opts) → Promise   → resolves with user on success,
                                          rejects on dismiss.
       opts = { title, subtitle, primaryLabel, secondaryLabel, returnUrl, pending }
       - title/subtitle: gate modal copy
       - primaryLabel:   "Create account" by default
       - secondaryLabel: "Sign in" by default
       - returnUrl:      where login.html should bounce back to (defaults
                          to current page URL incl. hash + query)
       - pending:        { key, data } — write to sessionStorage so the
                          returnUrl page can resume the original action
                          after auth (used for shop click, save, quiz)

   Why sessionStorage for `pending`: it survives the redirect chain
   (current page → login.html → back) and is per-tab, so two tabs
   don't collide. Cleared by the resume handler on the returnUrl page.

   Security: this is UX only. Firestore rules in firestore.rules
   continue to enforce auth server-side. A guest who pokes the
   console and tries to write is denied at the rules layer.
   ───────────────────────────────────────────────────────────────── */
(function () {
  window.Aura = window.Aura || {};

  // sessionStorage key for pending post-auth actions
  var PENDING_KEY = 'aura_pending_action';

  function isSignedIn() {
    try { return !!_auth.currentUser; } catch (e) { return false; }
  }

  // First-fire async hook: useful for guarded pages that want to
  // reveal/hide UI after auth state is known (avoids flash).
  var _authReady = false;
  var _authReadyCbs = [];
  _auth.onAuthStateChanged(function (user) {
    _authReady = true;
    var cbs = _authReadyCbs.slice();
    _authReadyCbs.length = 0;
    cbs.forEach(function (cb) { try { cb(user); } catch (e) {} });
  });
  function onAuthReady(cb) {
    if (typeof cb !== 'function') return;
    if (_authReady) { try { cb(_auth.currentUser); } catch (e) {} return; }
    _authReadyCbs.push(cb);
  }

  // Pending-action storage (survives the login redirect chain).
  function setPending(action) {
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(action));
    } catch (e) {}
  }
  function getPending() {
    try {
      var raw = sessionStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearPending() {
    try { sessionStorage.removeItem(PENDING_KEY); } catch (e) {}
  }

  // Build the modal element lazily, return it. Idempotent.
  function _getModal() {
    var existing = document.getElementById('aura-gate-modal');
    if (existing) return existing;
    var el = document.createElement('div');
    el.id = 'aura-gate-modal';
    el.className = 'aura-gate-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'aura-gate-title');
    el.innerHTML = ''
      + '<div class="aura-gate-card">'
      +   '<button class="aura-gate-close-x" aria-label="Close" type="button">×</button>'
      +   '<div class="aura-gate-eyebrow" data-aura-gate-eyebrow>Aura Glossy</div>'
      +   '<h2 class="aura-gate-title" id="aura-gate-title" data-aura-gate-title>Create your Aura profile</h2>'
      +   '<p class="aura-gate-sub" data-aura-gate-sub>Save looks, discover your style, and join your circle.</p>'
      +   '<div class="aura-gate-actions">'
      +     '<button class="aura-gate-btn aura-gate-btn-primary" data-aura-gate-primary type="button">Create account</button>'
      +     '<button class="aura-gate-btn aura-gate-btn-secondary" data-aura-gate-secondary type="button">Sign in</button>'
      +   '</div>'
      +   '<button class="aura-gate-dismiss" data-aura-gate-dismiss type="button">Continue browsing</button>'
      + '</div>';
    document.body.appendChild(el);
    return el;
  }

  // Render & open the gate. Returns a Promise that resolves on
  // user-initiated nav to login (we won't actually see resolution
  // because login.html navigates away) — but we still resolve for
  // local listeners that want to do follow-up work pre-navigation.
  function requireAuth(opts) {
    opts = opts || {};
    // Short-circuit: already signed in → resolve immediately.
    if (isSignedIn()) {
      return Promise.resolve(_auth.currentUser);
    }

    var returnUrl = opts.returnUrl || (location.pathname + location.search + location.hash);
    if (opts.pending) {
      setPending({
        key: opts.pending.key,
        data: opts.pending.data,
        returnUrl: returnUrl,
        ts: Date.now()
      });
    }

    return new Promise(function (resolve, reject) {
      var modal = _getModal();
      var titleEl = modal.querySelector('[data-aura-gate-title]');
      var subEl   = modal.querySelector('[data-aura-gate-sub]');
      var eyebrow = modal.querySelector('[data-aura-gate-eyebrow]');
      var primary = modal.querySelector('[data-aura-gate-primary]');
      var secondary = modal.querySelector('[data-aura-gate-secondary]');
      var dismiss = modal.querySelector('[data-aura-gate-dismiss]');
      var closeX  = modal.querySelector('.aura-gate-close-x');

      titleEl.textContent = opts.title || 'Create your Aura profile';
      subEl.textContent   = opts.subtitle || 'Save looks, discover your style, and join your circle.';
      eyebrow.textContent = opts.eyebrow || 'Aura Glossy';
      primary.textContent   = opts.primaryLabel || 'Create account';
      secondary.textContent = opts.secondaryLabel || 'Sign in';

      var nextParam = encodeURIComponent(returnUrl);

      // ── A11y: focus trap + restore (WCAG 2.1.2 No Keyboard Trap, IS 5568) ──
      // Save the element that had focus when the modal opened so we can
      // restore it on dismiss. Then move keyboard focus into the modal
      // and cycle Tab/Shift+Tab through its interactive elements.
      var prevFocus = document.activeElement;
      var focusables = [primary, secondary, dismiss, closeX];
      function onTrap(e) {
        if (e.key !== 'Tab') return;
        // Confine tabbing to modal controls only
        var current = document.activeElement;
        var idx = focusables.indexOf(current);
        if (idx === -1) {
          e.preventDefault();
          focusables[0].focus();
          return;
        }
        var next;
        if (e.shiftKey) {
          next = idx === 0 ? focusables[focusables.length - 1] : focusables[idx - 1];
        } else {
          next = idx === focusables.length - 1 ? focusables[0] : focusables[idx + 1];
        }
        e.preventDefault();
        next.focus();
      }

      function cleanup() {
        modal.classList.remove('visible');
        primary.removeEventListener('click', goCreate);
        secondary.removeEventListener('click', goSignIn);
        dismiss.removeEventListener('click', onDismiss);
        closeX.removeEventListener('click', onDismiss);
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onEsc);
        document.removeEventListener('keydown', onTrap);
        // Restore focus to where it was before the modal opened
        if (prevFocus && typeof prevFocus.focus === 'function') {
          try { prevFocus.focus(); } catch (e) {}
        }
      }
      function goCreate(e) {
        if (e) e.preventDefault();
        cleanup();
        resolve({ navigated: true });
        window.location.href = 'login.html?mode=signup&next=' + nextParam;
      }
      function goSignIn(e) {
        if (e) e.preventDefault();
        cleanup();
        resolve({ navigated: true });
        window.location.href = 'login.html?mode=signin&next=' + nextParam;
      }
      function onDismiss(e) {
        if (e) e.preventDefault();
        clearPending(); // user backed out — don't trigger resume on next nav
        cleanup();
        reject(new Error('dismissed'));
      }
      function onBackdrop(e) {
        if (e.target === modal) onDismiss(e);
      }
      function onEsc(e) {
        if (e.key === 'Escape') onDismiss(e);
      }

      primary.addEventListener('click', goCreate);
      secondary.addEventListener('click', goSignIn);
      dismiss.addEventListener('click', onDismiss);
      closeX.addEventListener('click', onDismiss);
      modal.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onEsc);
      document.addEventListener('keydown', onTrap);

      // Reveal next frame so transition animates, then move focus to
      // the primary action so keyboard users start there
      requestAnimationFrame(function () {
        modal.classList.add('visible');
        try { primary.focus(); } catch (e) {}
      });
    });
  }

  // Post-auth resume — called from each public page (or globally
  // on DOMContentLoaded). Reads sessionStorage pending action and
  // dispatches to the appropriate handler. Handlers (registered by
  // page-specific scripts) clean up via clearPending() when done.
  var _resumeHandlers = {};
  function registerResume(key, handler) {
    _resumeHandlers[key] = handler;
  }
  function tryResumePending() {
    var pending = getPending();
    if (!pending || !pending.key) return;
    // Only resume for signed-in users (a guest somehow landing here
    // with a pending action shouldn't fire it — protects against
    // edge cases like the user cancelling auth mid-flow).
    if (!isSignedIn()) return;
    var handler = _resumeHandlers[pending.key];
    if (typeof handler === 'function') {
      try { handler(pending.data); } catch (e) { console.warn('Resume handler failed:', e); }
      // Most handlers should clearPending() themselves once they've
      // committed the action; clear here as a safety net so we never
      // re-fire on subsequent loads.
      clearPending();
    }
  }
  // Auto-fire once auth state is known on every page load
  onAuthReady(function () { tryResumePending(); });

  // Build & show the post-auth "Continue to {retailer}" toast.
  // Returns the toast element so callers can wire custom behavior.
  function showResumeToast(opts) {
    opts = opts || {};
    var existing = document.querySelector('.aura-resume-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'aura-resume-toast';
    toast.innerHTML = ''
      + '<span class="aura-resume-toast-check">✓</span>'
      + '<span class="aura-resume-toast-text" data-resume-text></span>'
      + '<button class="aura-resume-toast-cta" data-resume-cta type="button"></button>'
      + '<button class="aura-resume-toast-dismiss" aria-label="Dismiss" type="button">×</button>';
    toast.querySelector('[data-resume-text]').textContent = opts.message || 'Welcome to Aura Glossy';
    var cta = toast.querySelector('[data-resume-cta]');
    cta.textContent = opts.ctaLabel || 'Continue →';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('visible'); });

    cta.addEventListener('click', function () {
      if (typeof opts.onContinue === 'function') opts.onContinue();
      toast.classList.remove('visible');
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 320);
    });
    toast.querySelector('.aura-resume-toast-dismiss').addEventListener('click', function () {
      toast.classList.remove('visible');
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 320);
    });
    // Auto-dismiss after 12s if user ignores
    setTimeout(function () {
      if (toast.parentNode) {
        toast.classList.remove('visible');
        setTimeout(function () { if (toast.parentNode) toast.remove(); }, 320);
      }
    }, 12000);
    return toast;
  }

  // ── Cookie / storage acknowledgement banner ─────────────────────
  // Subtle premium notice shown on first visit if the user hasn't
  // dismissed it. Stays out of the way (bottom-left corner, doesn't
  // block content). Required for IL/EU transparency even though
  // Aura Glossy uses only essential storage. Skipped on the legal
  // pages themselves to avoid redundancy.
  function _cookieBannerShouldShow() {
    try {
      if (localStorage.getItem('aura_cookie_ok')) return false;
    } catch (e) { return false; }
    var p = (location.pathname || '').toLowerCase();
    // Don't show on the legal pages themselves (or login — already has its own legal strip)
    if (p.indexOf('cookies') >= 0 || p.indexOf('privacy') >= 0 ||
        p.indexOf('terms') >= 0 || p.indexOf('accessibility') >= 0 ||
        p.indexOf('login') >= 0) return false;
    return true;
  }
  function _mountCookieBanner() {
    if (!_cookieBannerShouldShow()) return;
    if (document.querySelector('.aura-cookie-banner')) return;
    var el = document.createElement('div');
    el.className = 'aura-cookie-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie notice');
    el.innerHTML =
      '<span class="aura-cookie-banner-text">' +
        'Aura Glossy uses only essential browser storage to remember your sign-in and language. ' +
        '<a href="cookies.html">Learn more</a>.' +
      '</span>' +
      '<button class="aura-cookie-banner-ok" type="button" aria-label="Acknowledge cookie notice">Got it</button>';
    document.body.appendChild(el);
    // Show next frame so transition (if any) animates
    requestAnimationFrame(function () { el.classList.add('visible'); });
    el.querySelector('.aura-cookie-banner-ok').addEventListener('click', function () {
      try { localStorage.setItem('aura_cookie_ok', '1'); } catch (e) {}
      el.classList.remove('visible');
      setTimeout(function () { if (el.parentNode) el.remove(); }, 240);
    });
  }
  // Mount on DOMContentLoaded so the banner exists in the layout but
  // doesn't compete with critical paint
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _mountCookieBanner);
  } else {
    _mountCookieBanner();
  }

  // Public API
  window.Aura.isSignedIn       = isSignedIn;
  window.Aura.onAuthReady      = onAuthReady;
  window.Aura.requireAuth      = requireAuth;
  window.Aura.setPending       = setPending;
  window.Aura.getPending       = getPending;
  window.Aura.clearPending     = clearPending;
  window.Aura.registerResume   = registerResume;
  window.Aura.tryResumePending = tryResumePending;
  window.Aura.showResumeToast  = showResumeToast;
})();

/* Explicit pre-redirect session-flag setter — used by login.html
   right after auth succeeds, so the synchronous head-gate on the
   destination page (index.html) passes even if firebase.js's own
   onAuthStateChanged listener hasn't fired yet (slow IndexedDB
   write on TikTok / Instagram WebViews). */
function setAuraSessionFlag() {
  try { localStorage.setItem('aura_has_session', '1'); } catch (e) {}
}
function clearAuraSessionFlag() {
  try { localStorage.removeItem('aura_has_session'); } catch (e) {}
  try { localStorage.removeItem('aura_quiz_id'); } catch (e) {}
  try { localStorage.removeItem('aura_onboarded'); } catch (e) {}
  try { sessionStorage.removeItem('aura_onboard_trigger'); } catch (e) {}
}

/* ─────────────────────────────────────────────────────────────────
   SESSION FLAG — single source of truth for the synchronous head
   auth-gate that every protected page runs BEFORE Firebase loads.

   Firebase auth state lives in IndexedDB and is only readable
   asynchronously (after `firebase.auth()` finishes hydration).
   That async wait is what caused 7-20s blank-screen deadlocks for
   TikTok / Instagram in-app browsers where IndexedDB is slow.

   We mirror Firebase's state into localStorage so head-scripts
   on protected pages can decide instantly whether to render or
   redirect to login. Updated every time Firebase fires, so it
   stays in sync across tabs and browser sessions.
   ───────────────────────────────────────────────────────────────── */
var AURA_SESSION_KEY = 'aura_has_session';
_auth.onAuthStateChanged(function (user) {
  try {
    if (user) {
      localStorage.setItem(AURA_SESSION_KEY, '1');
    } else {
      localStorage.removeItem(AURA_SESSION_KEY);
      /* SHARED-DEVICE FIX: clear per-device onboarding markers on
         sign-out so the NEXT account on this browser starts fresh.
         The same user signing back in is still protected from a
         replay by the Firestore `users/{uid}.onboardedAt` check
         in onboarding.js — that's the per-account source of truth. */
      localStorage.removeItem('aura_onboarded');
      sessionStorage.removeItem('aura_onboard_trigger');
    }
  } catch (e) { /* private mode — flags stay whatever they were */ }
});

/* ── User ID: real account OR anonymous fallback ───────────── */
function _getUid() {
  const user = _auth.currentUser;
  if (user) return user.uid;
  // fallback: random ID in localStorage
  let uid = localStorage.getItem('aura_uid');
  if (!uid) {
    uid = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('aura_uid', uid);
  }
  return uid;
}

function _ref() {
  return _db.collection('moodboards').doc(_getUid()).collection('items');
}

/* ── Expose current user for nav ───────────────────────────── */
function getCurrentUser() { return _auth.currentUser; }
function onAuthChange(cb)  { return _auth.onAuthStateChanged(cb); }

/* ── Local cache (instant UI response) ─────────────────────── */
function _getCache() {
  try {
    var raw = JSON.parse(localStorage.getItem('aura_mb') || '[]');
    if (!Array.isArray(raw)) return [];
    // Deduplicate by id and drop malformed entries
    var seen = {};
    return raw.filter(function(x) {
      if (!x || typeof x.id !== 'string') return false;
      if (seen[x.id]) return false;
      seen[x.id] = true;
      return true;
    });
  } catch { return []; }
}
function _setCache(items) {
  try {
    localStorage.setItem('aura_mb', JSON.stringify(items));
  } catch(e) {
    // Quota exceeded or private-mode block — silently continue;
    // Firestore is the source of truth.
    console.warn('aura_mb cache write failed:', e.message);
  }
}

/* ── Debounced write queue — prevents duplicate Firestore writes ─ */
var _writeTimers = {};
function _queueWrite(key, fn) {
  return new Promise(function(resolve) {
    if (_writeTimers[key]) clearTimeout(_writeTimers[key]);
    _writeTimers[key] = setTimeout(async function() {
      delete _writeTimers[key];
      try { await fn(); resolve(true); }
      catch(e) { console.warn('FB write failed [' + key + ']:', e.message); resolve(false); }
    }, 350);
  });
}

/* ── Firestore helpers ─────────────────────────────────────── */
async function fbSave(item) {
  if (!item.savedAt) item.savedAt = Date.now(); /* timestamp first save */
  const cache = _getCache().filter(x => x.id !== item.id);
  cache.push(item);
  _setCache(cache);
  return _queueWrite('save_' + item.id, () => _ref().doc(item.id).set(item));
}

async function fbRemove(id) {
  _setCache(_getCache().filter(x => x.id !== id));
  return _queueWrite('del_' + id, () => _ref().doc(id).delete());
}

async function fbLoadAll() {
  const localItems = _getCache();
  try {
    const snap  = await _ref().get();
    const cloud = snap.docs.map(d => d.data());

    if (cloud.length > 0) {
      // Cloud has items — trust cloud, refresh cache
      _setCache(cloud);
      return cloud;
    }

    // Cloud is empty but we have local items — push them up to Firestore
    // (handles UID-mismatch / timing issue where saves went to cache only)
    if (localItems.length > 0) {
      localItems.forEach(item => {
        _ref().doc(item.id).set(item).catch(() => {});
      });
      return localItems;
    }

    // Both empty — genuinely empty moodboard
    _setCache([]);
    return [];
  } catch(e) {
    console.warn('FB load — using cache:', e);
    return localItems;
  }
}

/* ── Quiz result save ──────────────────────────────────────────────
   Saves full quiz data: id, name, auraColor, mantra, breakdown, answers.

   COMMUNITY-ACCESS INVARIANT (do not change without reading this):
   A user belongs to exactly ONE community at any moment — the one whose
   id matches users/{uid}.quizResult.id. A retake must therefore HARD
   REPLACE the quizResult map, not deep-merge into it. We use update()
   (replaces the whole `quizResult` field) and fall back to set() if the
   user doc doesn't exist yet.

   After a successful write we (1) mirror the latest id to localStorage
   for synchronous reads, (2) bust client-side caches that were keyed to
   the previous aesthetic, and (3) broadcast on the `aura_quiz` channel
   so any other open tab/page invalidates immediately instead of waiting
   for its Firestore snapshot to catch up.
─────────────────────────────────────────────────────────────────── */
async function fbSaveQuizResult(data) {
  var user = _auth.currentUser;
  if (!user || !data || !data.id) return;

  var now = Date.now();
  var payload = Object.assign({
    completedAt: now,
    updatedAt:   now
  }, data);

  var ref = _db.collection('users').doc(user.uid);

  /* update() REPLACES the quizResult field entirely (no deep-merge).
     If the user doc is missing (brand-new account), fall back to set. */
  try {
    await ref.update({ quizResult: payload });
  } catch(e) {
    if (e && (e.code === 'not-found' || /No document to update/i.test(e.message || ''))) {
      try {
        await ref.set({ quizResult: payload });
      } catch(err) {
        console.warn('Quiz save (set fallback) failed:', err.message);
        return;
      }
    } else {
      console.warn('Quiz save failed:', e.message);
      return;
    }
  }

  /* Synchronous mirror — lets any code read the latest id without waiting
     for Firestore. Used by client-side gates and the cache-bust check. */
  try { localStorage.setItem('aura_quiz_id', payload.id); } catch(e) {}

  /* Bust client-side caches that may have been keyed to the previous result */
  try { sessionStorage.removeItem('aura_liked_ae'); } catch(e) {}

  /* Cross-tab broadcast — other open pages bust their caches and re-render
     against the latest id immediately, without waiting on snapshot latency. */
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      var ch = new BroadcastChannel('aura_quiz');
      ch.postMessage({ type: 'quiz-changed', uid: user.uid, id: payload.id, updatedAt: now });
      ch.close();
    }
  } catch(e) {}
}

/* ── Recently viewed aesthetics ────────────────────────────── */
var _rvTimer = null;
function fbRecordView(id, name) {
  var user = _auth.currentUser;
  if (!user) return;
  /* 2-second debounce so rapid hash changes don't cause duplicate writes */
  clearTimeout(_rvTimer);
  _rvTimer = setTimeout(async function() {
    try {
      var ref  = _db.collection('users').doc(user.uid);
      var snap = await ref.get();
      var views = (snap.exists && snap.data().recentlyViewed) || [];
      views = views.filter(function(v) { return v.id !== id; }); /* remove stale entry */
      views.unshift({ id: id, name: name, viewedAt: Date.now() });
      await ref.set({ recentlyViewed: views.slice(0, 10) }, { merge: true });
    } catch(e) { /* offline — silently skip */ }
  }, 2000);
}

/* ── Liked aesthetics ───────────────────────────────────────── */
async function fbToggleLikeAesthetic(id, name) {
  var user = _auth.currentUser;
  if (!user) return false;
  try {
    var ref  = _db.collection('users').doc(user.uid);
    var snap = await ref.get();
    var liked   = (snap.exists && snap.data().likedAesthetics) || [];
    var isLiked = liked.some(function(a) { return a.id === id; });
    liked = isLiked
      ? liked.filter(function(a) { return a.id !== id; })
      : liked.concat([{ id: id, name: name, likedAt: Date.now() }]);
    try { sessionStorage.removeItem('aura_liked_ae'); } catch(e) {} /* bust cache */
    await ref.set({ likedAesthetics: liked }, { merge: true });
    return !isLiked;
  } catch(e) { console.warn('Like toggle failed:', e.message); return false; }
}

async function fbGetLikedAesthetics() {
  var user = _auth.currentUser;
  if (!user) return [];
  /* Session-scoped cache — one Firestore read per tab */
  try {
    var cached = JSON.parse(sessionStorage.getItem('aura_liked_ae') || 'null');
    if (cached && Array.isArray(cached)) return cached;
  } catch(e) {}
  try {
    var snap  = await _db.collection('users').doc(user.uid).get();
    var liked = (snap.exists && snap.data().likedAesthetics) || [];
    try { sessionStorage.setItem('aura_liked_ae', JSON.stringify(liked)); } catch(e) {}
    return liked;
  } catch(e) { return []; }
}

/* ── Offline banner ────────────────────────────────────────── */
(function() {
  var _banner = null;
  function _showBanner() {
    if (_banner) return;
    _banner = document.createElement('div');
    _banner.className = 'offline-banner';
    _banner.textContent = '⚠  No internet connection — some features may not work';
    document.body.appendChild(_banner);
    requestAnimationFrame(function() { _banner.classList.add('show'); });
  }
  function _hideBanner() {
    if (!_banner) return;
    _banner.classList.remove('show');
    setTimeout(function() { if (_banner) { _banner.remove(); _banner = null; } }, 300);
  }
  window.addEventListener('online',  _hideBanner);
  window.addEventListener('offline', _showBanner);
  if (!navigator.onLine) _showBanner();
})();

/* ── Quiz identity mirror & live aesthetic gate ────────────────────
   `aura_quiz_id` is a synchronous mirror of users/{uid}.quizResult.id.
   It is the single client-side source of truth for "which community
   does this user currently belong to" — read it instead of stashing
   a copy anywhere else, so old-aesthetic access can never leak from
   stale state. The mirror is refreshed on every auth state change and
   on every cross-tab `aura_quiz` broadcast.
─────────────────────────────────────────────────────────────────── */
function getCurrentQuizId() {
  try { return localStorage.getItem('aura_quiz_id') || null; }
  catch(e) { return null; }
}

/* Confirm with Firestore — used by pages that need the freshest value */
async function refreshQuizIdMirror() {
  var user = _auth.currentUser;
  if (!user) {
    try { localStorage.removeItem('aura_quiz_id'); } catch(e) {}
    return null;
  }
  try {
    var snap = await _db.collection('users').doc(user.uid).get();
    var id   = snap.exists && snap.data() && snap.data().quizResult && snap.data().quizResult.id;
    try {
      if (id) localStorage.setItem('aura_quiz_id', id);
      else    localStorage.removeItem('aura_quiz_id');
    } catch(e) {}
    return id || null;
  } catch(e) {
    return getCurrentQuizId();
  }
}

/* Maintain the mirror automatically as auth changes. On sign-out we
   clear it so a different user (or a guest) cannot inherit access. */
_auth.onAuthStateChanged(function(user) {
  if (user) {
    /* Sign-in / re-auth: pull the latest id from Firestore. The page's
       own listeners may also fire — this is just defensive. */
    refreshQuizIdMirror();
  } else {
    try { localStorage.removeItem('aura_quiz_id'); } catch(e) {}
    try { sessionStorage.removeItem('aura_liked_ae'); } catch(e) {}
  }
});

/* Cross-tab quiz-change listener: bust caches + refresh the mirror.
   Pages that care about live state (community.js) attach their own
   re-render logic on top of this via the same channel. */
var _quizChannel = null;
try { _quizChannel = new BroadcastChannel('aura_quiz'); } catch(e) {}
if (_quizChannel) {
  _quizChannel.onmessage = function(e) {
    if (!e || !e.data || e.data.type !== 'quiz-changed') return;
    var user = _auth.currentUser;
    if (!user || (e.data.uid && e.data.uid !== user.uid)) return;
    try {
      if (e.data.id) localStorage.setItem('aura_quiz_id', e.data.id);
      else           localStorage.removeItem('aura_quiz_id');
    } catch(_) {}
    try { sessionStorage.removeItem('aura_liked_ae'); } catch(_) {}
  };
}

/* ── Multi-tab logout sync via BroadcastChannel ────────────── */
var _authChannel = null;
try { _authChannel = new BroadcastChannel('aura_auth'); } catch(e) {}
if (_authChannel) {
  _authChannel.onmessage = function(e) {
    if (e.data === 'logout' && location.pathname.indexOf('login') === -1) {
      /* Verify Firebase says no current user before acting —
         stale BroadcastChannel events can arrive after a re-login in another tab.
         PUBLIC pages don't auto-redirect on logout (just update nav button) —
         the page is browsable as a guest. */
      if (!_auth.currentUser && !window.__auraPublicPage) {
        window.location.replace('login.html');
      }
    }
  };
}

/* ── Mobile burger menu — instant tap on iOS WebViews ──────────────
   firebase.js runs on every page, so wiring the burger here means
   every page gets the same instant-response handler — including
   community.html and settings.html, which don't load main.js.

   Why we use pointerup AND click:
     • On iOS WKWebView (Safari + Instagram + TikTok in-app browsers)
       the `click` event has ~50–100ms latency even with
       touch-action:manipulation, because the browser still waits
       briefly to detect double-tap-to-zoom.
     • `pointerup` fires immediately on touch-lift, so the menu
       opens the instant the finger leaves the screen.
     • We keep `click` as a fallback for mouse, keyboard, and any
       browser that doesn't dispatch pointer events.
     • A 400ms debounce stops the synthetic click that follows a
       pointerup from toggling the menu a second time.
─────────────────────────────────────────────────────────────────── */
(function wireBurgerOnce() {
  function wire() {
    var burger = document.querySelector('.nav-burger');
    if (!burger || burger._wired) return;
    var nav = burger.closest('.nav');
    if (!nav) return;
    burger._wired = true;

    var lastFired = 0;
    function fire(e) {
      var now = Date.now();
      if (now - lastFired < 400) return; /* debounce pointerup→click pair */
      lastFired = now;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      nav.classList.toggle('nav-open');
    }

    /* Fast path — touch / pen lifts. Fires before the synthetic click. */
    if ('PointerEvent' in window) {
      burger.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') fire(e);
      });
    }
    /* Click — handles mouse, keyboard activation, and any non-pointer browser */
    burger.addEventListener('click', fire);
    /* Keyboard activation (Enter / Space) for accessibility */
    burger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(e); }
    });

    /* Close when a nav link is tapped (the user is navigating away) */
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('nav-open'); });
    });

    /* Close on outside tap. Listen for BOTH pointerup (fast) and click
       (fallback) so the menu collapses the instant the user taps away. */
    function closeOnOutside(e) {
      if (!nav.contains(e.target)) nav.classList.remove('nav-open');
    }
    document.addEventListener('click', closeOnOutside);
    if ('PointerEvent' in window) {
      document.addEventListener('pointerup', function (e) {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') closeOnOutside(e);
      });
    }
  }

  /* firebase.js is loaded as a regular (non-deferred) end-of-body script
     on most pages, so the body is parsed and the burger element exists
     when we get here. For pages that DO defer, document.readyState may
     still be "loading" — wait for DCL in that case. */
  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
})();

/*
 * initAuthGuard() — call once per page.
 *
 * Public-browsing mode (2026-05-25): on pages that set
 * `window.__auraPublicPage = true` BEFORE this function is called,
 * we update auth-aware UI (nav button, save state) but DO NOT
 * auto-redirect to login. Personal actions on those pages call
 * `Aura.requireAuth(...)` to open the signup modal instead.
 *
 * On strict pages (settings.html), the legacy behavior is preserved:
 * shows a loading veil, redirects to login if auth doesn't confirm
 * within 7s of fresh load (10s after bfcache restore — bfcache nulls
 * are transient, not real sign-outs).
 *
 * BroadcastChannel logout sync still works on both modes — when one
 * tab signs out, other tabs update their nav state. Only strict-mode
 * tabs auto-redirect to login.
 */
function initAuthGuard() {
  var isPublic = !!window.__auraPublicPage;

  /* Loading veil — strict pages only; public pages show content immediately */
  var veil = null;
  function _revealPage() {
    if (!veil) return;
    veil.classList.add('hidden');
    setTimeout(function() { if (veil.parentNode) veil.remove(); }, 380);
  }
  if (!isPublic) {
    veil = document.createElement('div');
    veil.className = 'auth-veil';
    veil.innerHTML = '<div class="auth-veil-dots"><div class="auth-veil-dot"></div><div class="auth-veil-dot"></div><div class="auth-veil-dot"></div></div>';
    document.body.appendChild(veil);
  }

  var _authed     = false;
  var _guardTimer = null;
  var _bfRestored = false; /* true between bfcache restore and next Firebase confirm */

  _auth.onAuthStateChanged(function(user) {
    clearTimeout(_guardTimer);
    if (user) {
      _authed     = true;
      _bfRestored = false; /* Firebase confirmed — reset flag */
      localStorage.removeItem('aura_uid');
      var btn = document.getElementById('nav-auth-btn');
      if (btn) btn.textContent = 'Account';
      _revealPage();
    } else {
      /* PUBLIC pages: no redirect, no veil to hide. Just update the
         nav button to say "Sign in" so guests have an entry point. */
      if (isPublic) {
        var btn = document.getElementById('nav-auth-btn');
        if (btn) btn.textContent = 'Sign in';
        return;
      }
      /* STRICT pages from here down. */
      /* If we were already confirmed authed and this is a bfcache restore,
         Firebase is just re-initializing — null is transient, NOT a sign-out. */
      if (_authed && _bfRestored) {
        _guardTimer = setTimeout(function() {
          if (!_auth.currentUser) window.location.replace('login.html');
        }, 10000);
        return; /* _authed stays true — no false redirect */
      }
      /* Normal path: fresh load or genuine sign-out */
      _guardTimer = setTimeout(function() {
        if (!_authed && !_auth.currentUser) {
          if (_authChannel) _authChannel.postMessage('logout');
          window.location.replace('login.html');
        }
      }, 7000);
    }
  });

  /* bfcache guard — set _bfRestored flag, reveal if already authed.
     No redirect timers here — onAuthStateChanged handles resolution. */
  window.addEventListener('pageshow', function(e) {
    if (!e.persisted) return;
    _bfRestored = true;
    clearTimeout(_guardTimer);
    if (_authed) {
      _revealPage();
    }
  });
}

/* ── Override main.js functions ────────────────────────────── */
function loadMoodboard()  { return _getCache(); }
function saveMoodboard()  { /* handled by fbSave/fbRemove */ }
function isSaved(id)      { return _getCache().some(x => x.id === id); }

function toggleMoodboard(item) {
  const exists = _getCache().some(x => x.id === item.id);
  if (exists) { fbRemove(item.id); return false; }
  fbSave(item); return true;
}

/* ── Sync cache from Firestore on pages that use moodboard ── */
if (document.getElementById('moodboard-container') || document.getElementById('r-moodboard')) {
  fbLoadAll().catch(() => {});
}
