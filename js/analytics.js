/* ============================================================
   AURA — Analytics event logger

   Public API:
     Aura.track(type, data?)         → fire-and-forget event write
     Aura.session()                  → current per-tab session id
     Aura.analyticsReady(cb)         → called once when the pipeline
                                        is initialized (Firebase loaded
                                        + auth state known)

   Design notes:
   ────────────────────────────────────────────────────────────
   • Every event is one write to `analytics_events`. The Firestore
     rules enforce a strict whitelist of types + length-capped fields.
     Anything not in the whitelist will be rejected server-side, so
     don't invent ad-hoc type names — extend the rules first.

   • Writes are fire-and-forget. Analytics MUST NOT block UX or surface
     errors to the user. Failed writes are warned to console only.

   • Pre-Firebase-ready events are queued in memory for up to 8s, then
     dropped. The page_view auto-fired on script init flows through
     this queue cleanly.

   • Guest events still get a stable `sessionId` (per-tab). Signed-in
     events use the same sessionId + the real `uid`. The dashboard can
     correlate "guest sessionId → later signed up as uid" by checking
     whether the same sessionId appears with both isGuest=true and
     isGuest=false.

   • PRIVACY: we log path + referrer + retailer + outfitIndex, but
     never quiz answers, post content, comment text, search queries,
     or anything resembling PII beyond the signed-in user's own email.
     Passwords are never touched — Firebase Auth owns them entirely.
   ============================================================ */
(function () {
  'use strict';

  /* ── Guards ────────────────────────────────────────────────── */
  /* Don't double-init if this script somehow loads twice (e.g.
     during a hot navigation). */
  if (window.__auraAnalyticsInit) return;
  window.__auraAnalyticsInit = true;

  /* Don't run on admin-report.html itself — the dashboard reads
     events but shouldn't pollute its own dataset by emitting
     page_views and the like. */
  try {
    if (/admin-report\.html/i.test(location.pathname || '')) return;
  } catch (e) {}

  window.Aura = window.Aura || {};

  /* ── Session id (per-tab, stable for guests) ───────────────── */
  var SESSION_KEY = 'aura_sid';
  function _newSid() {
    return 'g_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  }
  function _getSessionId() {
    try {
      var sid = sessionStorage.getItem(SESSION_KEY);
      if (sid && typeof sid === 'string' && sid.length >= 8 && sid.length <= 60) return sid;
      sid = _newSid();
      sessionStorage.setItem(SESSION_KEY, sid);
      return sid;
    } catch (e) {
      /* sessionStorage blocked (rare iOS modes) — use an in-memory
         id; correlation across page navigations will be lost. */
      if (!window.__auraSidMem) window.__auraSidMem = _newSid();
      return window.__auraSidMem;
    }
  }

  /* ── Context detection ─────────────────────────────────────── */
  function _device() {
    try {
      var ua = navigator.userAgent || '';
      var w  = window.innerWidth || 0;
      if (/iPad/i.test(ua) || /Tablet/i.test(ua) || (w >= 768 && w < 1024 && /Mobile|Android/i.test(ua))) return 'tablet';
      if (/Mobile|Android|iPhone|iPod/i.test(ua) || w < 768) return 'mobile';
      return 'desktop';
    } catch (e) { return 'desktop'; }
  }
  function _browser() {
    try {
      var ua = navigator.userAgent || '';
      if (window.Aura && window.Aura.inApp && window.Aura.inApp.is) return 'inapp';
      if (/Edg\//.test(ua))                                          return 'edge';
      if (/OPR\/|Opera/.test(ua))                                    return 'opera';
      if (/Firefox\//.test(ua))                                      return 'firefox';
      if (/Chrome\//.test(ua) && !/Edg\//.test(ua))                  return 'chrome';
      if (/Safari\//.test(ua) && !/Chrome\//.test(ua))               return 'safari';
      return 'other';
    } catch (e) { return 'other'; }
  }
  function _os() {
    try {
      var ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
      if (/Android/.test(ua))           return 'android';
      if (/Windows/.test(ua))           return 'windows';
      if (/Mac OS X|Macintosh/.test(ua)) return 'macos';
      if (/Linux/.test(ua))             return 'linux';
      return 'other';
    } catch (e) { return 'other'; }
  }
  function _inAppName() {
    try {
      if (window.Aura && window.Aura.inApp && window.Aura.inApp.is) {
        return window.Aura.inApp.name || 'other-inapp';
      }
    } catch (e) {}
    return null;
  }
  function _lang() {
    try { return (document.documentElement.lang || 'en').slice(0, 4); }
    catch (e) { return 'en'; }
  }
  function _rtl() {
    try { return document.documentElement.dir === 'rtl'; }
    catch (e) { return false; }
  }
  function _path() {
    try { return (location.pathname || '/').slice(0, 200); }
    catch (e) { return '/'; }
  }
  function _referrer() {
    try {
      var r = document.referrer || '';
      if (!r) return null;
      /* Strip query+hash to avoid leaking sensitive params */
      try {
        var u = new URL(r);
        return (u.origin + u.pathname).slice(0, 300);
      } catch (_) {
        return r.slice(0, 300);
      }
    } catch (e) { return null; }
  }

  /* ── Pipeline state ────────────────────────────────────────── */
  var _ready       = false;
  var _readyCbs    = [];
  var _queue       = [];
  var _user        = null;
  var _isAdmin     = false;
  var _db          = null;
  var QUEUE_MAX_MS = 8000;

  function _baseContext() {
    return {
      sessionId: _getSessionId(),
      isGuest:   !_user,
      uid:       _user ? _user.uid : null,
      email:     _user && _user.email ? String(_user.email).slice(0, 200) : null,
      isAdmin:   !!_isAdmin,
      /* True when the maintenance gate was ON at the time of this event.
         Lets the admin report cleanly separate "events while the public
         surface was sealed" (almost always admin browsing via bypass)
         from real public visitor traffic. window.__auraMaintenanceMode
         is set synchronously by js/maintenance.js before any other head
         script runs, so it's always defined here. */
      isMaintenanceMode: !!(typeof window !== 'undefined' && window.__auraMaintenanceMode),
      /* Hostname the event was fired from. Lets the admin report
         filter out local-preview (localhost / private IPs) traffic
         so dev testing never pollutes the public visitor counts. */
      host:      (typeof location !== 'undefined' && location.hostname) ? String(location.hostname).slice(0, 80) : null,
      lang:      _lang(),
      rtl:       _rtl(),
      device:    _device(),
      browser:   _browser(),
      os:        _os(),
      inApp:     _inAppName(),
      path:      _path(),
      referrer:  _referrer()
    };
  }

  /* Sanitize event-specific fields. Drops anything that isn't on the
     rules whitelist so a typo in calling code doesn't produce a
     permission-denied. */
  var ALLOWED_KEYS = [
    'aesthetic','outfitIndex','category','retailer','shopUrl','source',
    'quizResultId','quizQuestionIndex','modalAction','modalReason',
    'metadata','test'
  ];
  function _clean(data) {
    if (!data || typeof data !== 'object') return {};
    var out = {};
    for (var i = 0; i < ALLOWED_KEYS.length; i++) {
      var k = ALLOWED_KEYS[i];
      if (k in data) {
        var v = data[k];
        /* Coerce strings; cap lengths so the rules never reject */
        if (typeof v === 'string') {
          if (k === 'shopUrl')   v = v.slice(0, 600);
          else if (k === 'aesthetic') v = v.slice(0, 32);
          else if (k === 'category')  v = v.slice(0, 40);
          else if (k === 'retailer')  v = v.slice(0, 80);
          else                         v = v.slice(0, 32);
        }
        out[k] = v;
      }
    }
    return out;
  }

  /* During maintenance, the only legitimate event source is a
     confirmed admin user browsing via bypass. Everything else
     (guests, signed-in non-admins, race conditions where
     isAdmin hasn't been read yet) gets dropped at the writer.
     Without this guard, a brief window between page load and
     Firestore admin confirmation would let "guest" page_view
     events leak into the public dashboard counts — even though
     the maintenance gate is supposed to seal the site. */
  function _shouldEmit() {
    var maintOn = !!(typeof window !== 'undefined' && window.__auraMaintenanceMode);
    if (!maintOn) return true; /* maintenance off — fire normally */
    return !!(_user && _isAdmin); /* maintenance on — admin only */
  }

  function _writeNow(type, data) {
    if (!_db) return;
    if (!_shouldEmit()) return; /* silently drop — see _shouldEmit() */
    var event = _baseContext();
    var clean = _clean(data);
    for (var k in clean) if (clean.hasOwnProperty(k)) event[k] = clean[k];
    event.type = type;
    event.ts   = firebase.firestore.FieldValue.serverTimestamp();
    return _db.collection('analytics_events').add(event).catch(function (err) {
      /* Permission denied / network failure / bad schema — log to
         console only. Analytics must never break UX. */
      if (err && err.code && console && console.warn) {
        console.warn('[analytics]', type, err.code);
      }
    });
  }

  function _flushQueue() {
    /* If we still shouldn't emit (maintenance on but no admin user),
       drop the entire queue instead of writing leaked events. The
       page is about to be reloaded anyway by firebase.js's
       _revalidateBypass IIFE — we'd just be writing noise. */
    if (!_shouldEmit()) {
      if (_queue.length && console && console.log) {
        try { console.log('[analytics] dropped ' + _queue.length + ' queued events (maintenance — no admin)'); } catch (e) {}
      }
      _queue = [];
      return;
    }
    var q = _queue;
    _queue = [];
    for (var i = 0; i < q.length; i++) {
      var item = q[i];
      /* Drop very old events — they're stale and probably wrong path */
      if (Date.now() - item.t > QUEUE_MAX_MS) continue;
      _writeNow(item.type, item.data);
    }
  }

  /* ── Public API ────────────────────────────────────────────── */
  function track(type, data) {
    if (!type || typeof type !== 'string') return;
    if (!_ready) {
      _queue.push({ type: type, data: data, t: Date.now() });
      return;
    }
    _writeNow(type, data);
  }

  function analyticsReady(cb) {
    if (typeof cb !== 'function') return;
    if (_ready) { try { cb(); } catch (e) {} return; }
    _readyCbs.push(cb);
  }

  window.Aura.track          = track;
  window.Aura.session        = _getSessionId;
  window.Aura.analyticsReady = analyticsReady;

  /* ── Boot ──────────────────────────────────────────────────── */
  /* We piggy-back on Aura.onAuthReady (defined in firebase.js) so we
     know whether the user is signed in before flushing the queue. If
     firebase.js hasn't loaded yet (e.g. this script ran first), we
     poll briefly. Bounded by QUEUE_MAX_MS so we don't keep events
     forever. */
  var _started = Date.now();
  function _boot() {
    try {
      if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) {
        if (Date.now() - _started > QUEUE_MAX_MS) return; /* give up */
        setTimeout(_boot, 120);
        return;
      }
      _db = firebase.firestore();
      var auth = firebase.auth();

      /* Resolve admin flag once on auth state; refreshed on changes. */
      var _userDocUnsub = null;
      auth.onAuthStateChanged(function (user) {
        _user = user || null;
        if (_userDocUnsub) { try { _userDocUnsub(); } catch (e) {} _userDocUnsub = null; }
        if (!user) {
          _isAdmin = false;
          _markReady();
          return;
        }
        /* Listen for live changes to isAdmin so admin promotion /
           demotion is reflected without a reload. We snapshot ONCE
           and then unsubscribe inside the callback if we don't care
           about updates — but live is cheap and keeps the dashboard's
           per-event isAdmin flag honest. */
        _userDocUnsub = firebase.firestore()
          .collection('users').doc(user.uid)
          .onSnapshot(
            function (snap) {
              _isAdmin = !!(snap.exists && snap.data() && snap.data().isAdmin === true);
              _markReady();
            },
            function () { _isAdmin = false; _markReady(); }
          );
      });
    } catch (e) {
      /* Anything goes wrong → silently disable. */
    }
  }
  function _markReady() {
    if (_ready) return;
    _ready = true;
    _flushQueue();
    var cbs = _readyCbs.slice();
    _readyCbs.length = 0;
    for (var i = 0; i < cbs.length; i++) {
      try { cbs[i](); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }

  /* ── Auto page_view ────────────────────────────────────────── */
  /* Fire one page_view per page load. style.html appends an
     aesthetic_view of its own (with the aesthetic id) — page_view
     here is the baseline pulse for every public page. */
  try {
    var p = (location.pathname || '').toLowerCase();
    /* Skip the admin login + dashboard pages — already filtered at top,
       this is belt+suspenders. */
    if (!/admin-report\.html/i.test(p)) {
      track('page_view', {});
    }
  } catch (e) {}
})();
