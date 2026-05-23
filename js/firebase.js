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
         stale BroadcastChannel events can arrive after a re-login in another tab */
      if (!_auth.currentUser) {
        window.location.replace('login.html');
      }
    }
  };
}

/*
 * initAuthGuard() — call once on every protected page.
 * Shows a loading veil until Firebase confirms auth state.
 * Redirects to login only after confirmation (not a timer guess).
 * Syncs logout across all open tabs via BroadcastChannel.
 */
function initAuthGuard() {
  /* Loading veil — prevents content flash on slow networks */
  var veil = document.createElement('div');
  veil.className = 'auth-veil';
  veil.innerHTML = '<div class="auth-veil-dots"><div class="auth-veil-dot"></div><div class="auth-veil-dot"></div><div class="auth-veil-dot"></div></div>';
  document.body.appendChild(veil);

  function _revealPage() {
    veil.classList.add('hidden');
    setTimeout(function() { if (veil.parentNode) veil.remove(); }, 380);
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
      /* If we were already confirmed authed and this is a bfcache restore,
         Firebase is just re-initializing — null is transient, NOT a sign-out.
         Do not redirect. Use a long safety timer only. */
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
