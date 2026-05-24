/* ================================================================
   AURA — Community Groups  (community.js)
   Private fashion circles gated by quiz result aesthetic.

   ─────────────────────────────────────────────────────────────────
   COMMUNITY-ACCESS INVARIANT
   ─────────────────────────────────────────────────────────────────
   A user belongs to ONE community at any moment: the community whose
   id matches the user's CURRENT users/{uid}.quizResult.id. Retaking
   the quiz immediately revokes access to the previous community.

   This file enforces that invariant on the client:

     • _userQuiz is hydrated and kept fresh by a Firestore snapshot
       listener (`_attachUserQuizListener`). Whenever quizResult.id
       changes — same tab, other tab, or a different device — every
       open community page re-renders against the new value.

     • If the user is currently inside a community feed when their
       id changes (e.g. they retook the quiz in another tab), the
       posts listener is torn down, the URL hash is cleared, and they
       are moved back to the hub with a "your aesthetic changed"
       notice. They can never keep reading/posting in the old group.

     • A cross-tab BroadcastChannel ('aura_quiz') is used as a fast
       path so other tabs invalidate caches the instant a retake is
       saved, before the Firestore snapshot has propagated. Firestore
       rules (server-side) are the final authority — the client is
       belt-and-suspenders.
   ================================================================ */

var COMM_GROUPS = [
  { id: 'classic',      name: 'Classic',         color: '#c4a882', tagline: 'Timeless refinement',   symbol: '✦' },
  { id: 'casual',       name: 'Casual',           color: '#7fb5a5', tagline: 'Effortlessly everyday', symbol: '◎' },
  { id: 'streetwear',   name: 'Streetwear',       color: '#7c8794', tagline: 'Urban edge',            symbol: '◈' },
  { id: 'minimalist',   name: 'Minimalist',       color: '#aeaaa4', tagline: 'Less is more',          symbol: '◻' },
  { id: 'elegant',      name: 'Elegant',          color: '#a08070', tagline: 'Understated luxury',    symbol: '◆' },
  { id: 'korean',       name: 'Korean Fashion',   color: '#f2b8c6', tagline: 'Soft & cute-coded',     symbol: '✿' },
  { id: 'y2k',          name: 'Y2K',              color: '#c084fc', tagline: 'Nostalgic & bold',      symbol: '✩' },
  { id: 'vintage',      name: 'Vintage',          color: '#c8966a', tagline: 'Retro soul',            symbol: '◉' },
  { id: 'softgirl',     name: 'Soft Girl',        color: '#ffacc7', tagline: 'Romantic & dreamy',     symbol: '✿' },
  { id: 'darkacademia', name: 'Dark Academia',    color: '#6b5a3e', tagline: 'Scholarly & moody',     symbol: '◼' },
];

var _currentUser   = null;   // Firebase user object
var _userQuiz      = null;   // { id, name, auraColor, … } — LIVE from Firestore
var _currentGroup  = null;   // group object currently viewed
var _postsUnsub    = null;   // posts onSnapshot unsubscribe handle
var _quizUnsub     = null;   // users/{uid} onSnapshot unsubscribe handle
var _quizChannel   = null;   // cross-tab broadcast for fast invalidation
var _quizHydrated  = false;  // first snapshot has arrived

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  _initComposerTabs();
  _initBurger();

  onAuthChange(function (user) {
    if (_quizUnsub) { _quizUnsub(); _quizUnsub = null; }
    _quizHydrated = false;
    _userQuiz     = null;

    _currentUser = user;
    if (!user) return; // initAuthGuard handles the redirect to login

    _attachUserQuizListener().then(function () {
      _routeFromHash();
    });
  });

  /* Cross-tab fast-path: another tab just saved a new quiz result.
     The Firestore snapshot will fire too, but this lets us bust
     local caches and short-circuit any in-flight UI immediately. */
  try { _quizChannel = new BroadcastChannel('aura_quiz'); } catch (e) {}
  if (_quizChannel) {
    _quizChannel.onmessage = function (e) {
      if (!e || !e.data || e.data.type !== 'quiz-changed') return;
      if (!_currentUser || (e.data.uid && e.data.uid !== _currentUser.uid)) return;
      /* The snapshot listener is our source of truth. We do not mutate
         _userQuiz here — we just nudge any session caches and let the
         snapshot drive the actual re-render. If the snapshot is slow
         to fire (rare), the next route check will read fresh on demand. */
      try { sessionStorage.removeItem('aura_liked_ae'); } catch (_) {}
    };
  }

  window.addEventListener('hashchange', function () {
    // Only re-route if we aren't already inside the matching group
    var hash = window.location.hash.slice(1).toLowerCase();
    if (!_currentGroup || _currentGroup.id !== hash) {
      _routeFromHash();
    }
  });
});

/* ── Live user-quiz listener ──────────────────────────────────
   onSnapshot on users/{uid} is the single source of truth for
   _userQuiz. It hydrates the first time the snapshot arrives,
   and on every subsequent change it diffs against the previous
   id and reacts (see _onQuizChanged).

   We return a Promise that resolves on the FIRST snapshot so
   the bootstrap can route safely. Subsequent emits don't resolve
   anything — they trigger _onQuizChanged.
─────────────────────────────────────────────────────────────── */
function _attachUserQuizListener() {
  return new Promise(function (resolve) {
    var firstFired = false;
    var resolveOnce = function () {
      if (firstFired) return;
      firstFired = true;
      _quizHydrated = true;
      resolve();
    };

    /* Safety net: if Firestore is unreachable and the snapshot never
       fires, don't block routing forever. After 4 s, resolve with
       whatever we have (likely null) so the hub at least renders. */
    var safety = setTimeout(resolveOnce, 4000);

    _quizUnsub = _db
      .collection('users').doc(_currentUser.uid)
      .onSnapshot(
        function (snap) {
          clearTimeout(safety);
          var prevId = _userQuiz && _userQuiz.id;
          var qr     = snap.exists && snap.data() && snap.data().quizResult;
          var newId  = qr && qr.id ? qr.id : null;

          _userQuiz = (qr && newId) ? qr : null;

          /* Keep the synchronous mirror in lockstep with the live value */
          try {
            if (newId) localStorage.setItem('aura_quiz_id', newId);
            else       localStorage.removeItem('aura_quiz_id');
          } catch (_) {}

          if (!firstFired) {
            resolveOnce();
            return;
          }

          /* Subsequent update — id may have changed (retake, sign-out,
             admin-cleared, etc). React only on actual id change. */
          if (prevId !== newId) _onQuizChanged(prevId, newId);
        },
        function (err) {
          console.warn('[Community] quiz listener error:',
            (err && err.code) || '?', (err && err.message) || err);
          clearTimeout(safety);
          resolveOnce();
        }
      );
  });
}

/* ── React to live quiz-id changes ────────────────────────────
   Called when the snapshot listener observes that quizResult.id
   has changed since the last value. If the user is currently
   inside a feed that no longer matches, we hard-kick them out
   (close the posts listener, clear the hash, show a notice).
─────────────────────────────────────────────────────────────── */
function _onQuizChanged(prevId, newId) {
  /* Bust any session caches that depended on the previous result */
  try { sessionStorage.removeItem('aura_liked_ae'); } catch (_) {}

  var hubEl   = document.getElementById('comm-hub');
  var groupEl = document.getElementById('comm-group');

  /* If we're inside a community feed whose id no longer matches the
     user's current aesthetic, kick them back to the hub. */
  var insideGroup = groupEl && groupEl.style.display !== 'none';
  var stillMatches = _currentGroup && newId && _currentGroup.id === newId;
  if (insideGroup && !stillMatches) {
    if (_postsUnsub) { _postsUnsub(); _postsUnsub = null; }
    _currentGroup = null;
    history.replaceState(null, '', location.pathname);
    if (hubEl)   hubEl.style.display   = '';
    if (groupEl) groupEl.style.display = 'none';
    _renderHub();
    _showQuizChangedNotice(prevId, newId);
    return;
  }

  /* Otherwise just refresh the hub so badges/labels reflect the new id. */
  if (hubEl && hubEl.style.display !== 'none') _renderHub();
}

function _showQuizChangedNotice(prevId, newId) {
  var box = document.getElementById('access-modal-box');
  if (!box) return;

  if (!newId) {
    box.innerHTML =
      '<div class="access-icon">✦</div>' +
      '<h3>Your style profile changed</h3>' +
      '<p>Take the quiz again to unlock your community.</p>' +
      '<div class="access-actions">' +
        '<a href="quiz.html" class="btn access-primary-btn">Take the Style Quiz →</a>' +
        '<button class="btn-ghost" onclick="closeAccessModal()">Close</button>' +
      '</div>';
  } else {
    var grp      = COMM_GROUPS.find(function (g) { return g.id === newId; });
    var grpName  = grp ? grp.name  : newId;
    var grpColor = grp ? grp.color : '#c084a0';
    box.innerHTML =
      '<div class="access-icon" style="color:' + grpColor + '">✦</div>' +
      '<h3>Your aesthetic just changed</h3>' +
      '<p>You\'re now part of the <strong>' + _esc(grpName) + '</strong> circle.<br>' +
      'Access to your previous circle has been closed.</p>' +
      '<div class="access-actions">' +
        '<button class="btn access-primary-btn" style="background:' + grpColor + ';border-color:' + grpColor + '"' +
          ' onclick="enterGroup(\'' + newId + '\');closeAccessModal()">Enter ' + _esc(grpName) + ' →</button>' +
        '<button class="btn-ghost" onclick="closeAccessModal()">Stay in the hub</button>' +
      '</div>';
  }
  document.getElementById('access-modal').style.display = 'flex';
}

/* Kept for back-compat with the existing "Already took the quiz? Reload"
   button. With the live snapshot listener attached this is rarely needed,
   but it doesn't hurt to give the user a manual nudge. */
function _loadUserQuiz() {
  return Promise.resolve(_userQuiz);
}

/* ── URL hash router ─────────────────────────────────────────── */
function _routeFromHash() {
  var hash  = window.location.hash.slice(1).toLowerCase();
  var group = hash ? COMM_GROUPS.find(function (g) { return g.id === hash; }) : null;

  if (group) {
    _tryEnterGroup(group);
  } else {
    showHub();
  }
}

/* ── Hub view ────────────────────────────────────────────────── */
function showHub() {
  if (_postsUnsub) { _postsUnsub(); _postsUnsub = null; }
  _currentGroup = null;
  history.replaceState(null, '', location.pathname);

  document.getElementById('comm-hub').style.display   = '';
  document.getElementById('comm-group').style.display = 'none';

  _renderHub();
}

function _renderHub() {
  var container  = document.getElementById('hub-groups');
  var heroSub    = document.querySelector('.comm-hero-sub');
  var heroEyebrow = document.querySelector('.comm-hero .eyebrow');
  var heroH1     = document.querySelector('.comm-hero h1');

  if (!_userQuiz) {
    // No result yet — invite them to take the quiz
    if (heroEyebrow) heroEyebrow.textContent = 'Private Circles';
    if (heroH1)      heroH1.textContent      = 'Find your community.';
    if (heroSub)     heroSub.textContent      = 'Take the style quiz to discover your aesthetic and unlock your exclusive circle.';
    container.innerHTML = _noQuizBanner() + COMM_GROUPS.map(function (g) {
      return _groupCard(g, 'noquiz');
    }).join('');
    return;
  }

  // User has a quiz result — greet them by name
  var myGroup = COMM_GROUPS.find(function (g) { return g.id === _userQuiz.id; });
  if (heroEyebrow) heroEyebrow.textContent = 'Your Style Circle';
  if (heroH1)      heroH1.textContent      = 'Welcome back.';
  if (heroSub)     heroSub.innerHTML       =
    'You belong to the <strong style="color:' + (myGroup ? myGroup.color : 'inherit') + '">' +
    _esc(_userQuiz.name) + '</strong> circle.';

  // User's own group first, then others
  var sorted = COMM_GROUPS.slice().sort(function (a, b) {
    if (a.id === _userQuiz.id) return -1;
    if (b.id === _userQuiz.id) return  1;
    return 0;
  });

  container.innerHTML =
    (myGroup ? _myGroupBanner(myGroup) : '') +
    sorted.map(function (g) {
      return _groupCard(g, g.id === _userQuiz.id ? 'mine' : 'locked');
    }).join('');

  // Keyboard accessibility for cards
  container.querySelectorAll('.group-card').forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });
}

/* ── My community identity banner (shown when quiz result exists) ─ */
function _myGroupBanner(group) {
  var bgTint = group.color + '0f'; // ~6% opacity tint of the aesthetic color
  return '<div class="comm-identity-banner" style="--group-color:' + group.color + ';background:' + bgTint + '">' +
    '<div class="cib-left">' +
      '<span class="cib-eyebrow">Your community</span>' +
      '<h2 class="cib-name" style="color:' + group.color + '">' + _esc(group.name) + '</h2>' +
      '<p class="cib-tagline">' + _esc(group.tagline) + '</p>' +
    '</div>' +
    '<div class="cib-right">' +
      '<button class="cib-enter-btn" style="background:' + group.color + '" onclick="enterGroup(\'' + group.id + '\')">' +
        'Enter My Community →' +
      '</button>' +
    '</div>' +
    '</div>';
}

function _noQuizBanner() {
  return '<div class="hub-quiz-cta">' +
    '<p class="eyebrow">Not sure yet?</p>' +
    '<h2>Find your aesthetic.</h2>' +
    '<p>Take the 5-minute style quiz to unlock your exclusive community circle.</p>' +
    '<a href="quiz.html" class="btn comm-quiz-btn">Take the Style Quiz →</a>' +
    '<button class="hub-reload-btn" onclick="_retryLoadQuiz()">Already took the quiz? Reload ↻</button>' +
    '</div>';
}

function _retryLoadQuiz() {
  var container = document.getElementById('hub-groups');
  container.innerHTML =
    '<div class="feed-loading"><div class="auth-veil-dots">' +
      '<div class="auth-veil-dot"></div>' +
      '<div class="auth-veil-dot"></div>' +
      '<div class="auth-veil-dot"></div>' +
    '</div></div>';

  /* Force a fresh round-trip — bypasses any local Firestore cache and
     covers the rare case where the live snapshot listener has dropped
     (e.g. transient network error). If a new result has arrived since
     last render, the snapshot listener has already updated _userQuiz;
     this is just a manual "I just finished the quiz, show it now" nudge. */
  if (!_currentUser) { _renderHub(); return; }
  _db
    .collection('users').doc(_currentUser.uid)
    .get({ source: 'server' })
    .then(function (snap) {
      var qr    = snap.exists && snap.data() && snap.data().quizResult;
      var newId = qr && qr.id ? qr.id : null;
      var prevId = _userQuiz && _userQuiz.id;
      _userQuiz = (qr && newId) ? qr : null;
      try {
        if (newId) localStorage.setItem('aura_quiz_id', newId);
        else       localStorage.removeItem('aura_quiz_id');
      } catch (_) {}
      _renderHub();
      /* If the listener missed the change, surface it now */
      if (prevId !== newId && _quizHydrated) _onQuizChanged(prevId, newId);
    })
    .catch(function () { _renderHub(); });

  /* Re-attach the live listener if it was lost */
  if (!_quizUnsub) {
    _attachUserQuizListener().catch(function () {});
  }
}

function _groupCard(group, state) {
  var isMine   = state === 'mine';
  var isLocked = state === 'locked' || state === 'noquiz';
  var onclick  = isMine
    ? 'enterGroup(\'' + group.id + '\')'
    : 'blockGroupAccess(\'' + group.id + '\')';

  return '<div class="group-card' +
    (isMine ? ' group-card--mine' : '') +
    (isLocked ? ' group-card--locked' : '') +
    '" style="--group-color:' + group.color + '"' +
    ' onclick="' + onclick + '"' +
    ' role="button" tabindex="0">' +
    '<div class="group-card-accent"></div>' +
    '<div class="group-card-body">' +
      '<span class="group-symbol">' + group.symbol + '</span>' +
      '<h3 class="group-card-name">' + group.name + '</h3>' +
      '<p class="group-card-tagline">' + group.tagline + '</p>' +
      (isMine ? '<span class="group-card-badge">Your Circle</span>' : '') +
    '</div>' +
    '<div class="group-card-cta">' +
      (isMine
        ? '<span class="group-enter-btn">Enter Circle →</span>'
        : '<span class="group-lock-icon">⊘</span>') +
    '</div>' +
    (isLocked ? '<div class="group-card-frost"></div>' : '') +
    '</div>';
}

/* ── Access control ──────────────────────────────────────────── */
function enterGroup(groupId) {
  var group = COMM_GROUPS.find(function (g) { return g.id === groupId; });
  if (!group) return;

  if (!_userQuiz) {
    _showNoQuizModal();
    return;
  }
  if (_userQuiz.id !== groupId) {
    _showWrongGroupModal(groupId);
    return;
  }
  _openGroup(group);
}

function blockGroupAccess(groupId) {
  if (!_userQuiz) {
    _showNoQuizModal();
  } else {
    _showWrongGroupModal(groupId);
  }
}

function _tryEnterGroup(group) {
  if (!_userQuiz) {
    /* No quiz result loaded — don't show a blocking modal here.
       The hub will render the appropriate no-quiz or retry state. */
    showHub();
    return;
  }
  if (_userQuiz.id !== group.id) {
    _showWrongGroupModal(group.id);
    showHub();
    return;
  }
  _openGroup(group);
}

/* ── Access modals ───────────────────────────────────────────── */
function _showNoQuizModal() {
  document.getElementById('access-modal-box').innerHTML =
    '<div class="access-icon">✦</div>' +
    '<h3>Discover your aesthetic first</h3>' +
    '<p>Take the style quiz to unlock your exclusive community circle.</p>' +
    '<div class="access-actions">' +
      '<a href="quiz.html" class="btn access-primary-btn">Take the Style Quiz →</a>' +
      '<button class="btn-ghost" onclick="closeAccessModal()">Not now</button>' +
    '</div>';
  document.getElementById('access-modal').style.display = 'flex';
}

function _showWrongGroupModal(groupId) {
  var group   = COMM_GROUPS.find(function (g) { return g.id === groupId; });
  var myGroup = COMM_GROUPS.find(function (g) { return g.id === _userQuiz.id; });
  var gName   = group   ? group.name   : groupId;
  var myColor = myGroup ? myGroup.color : '#c4a882';

  document.getElementById('access-modal-box').innerHTML =
    '<div class="access-icon" style="color:' + myColor + '">⊘</div>' +
    '<h3>This isn\'t your style circle</h3>' +
    '<p>The <strong>' + _esc(gName) + '</strong> community is a private group.<br>' +
    'Your community is <strong>' + _esc(_userQuiz.name) + '</strong>.</p>' +
    '<div class="access-actions">' +
      '<button class="btn access-primary-btn" style="background:' + myColor + ';border-color:' + myColor + '"' +
        ' onclick="enterGroup(\'' + _userQuiz.id + '\');closeAccessModal()">Go to my circle →</button>' +
      '<button class="btn-ghost" onclick="closeAccessModal()">Close</button>' +
    '</div>';
  document.getElementById('access-modal').style.display = 'flex';
}

function closeAccessModal() {
  document.getElementById('access-modal').style.display = 'none';
}

/* ── Open a group feed ───────────────────────────────────────── */
function _openGroup(group) {
  _currentGroup = group;
  history.replaceState(null, '', '#' + group.id);

  document.getElementById('comm-hub').style.display   = 'none';
  document.getElementById('comm-group').style.display = '';

  // Header identity
  document.getElementById('group-identity').innerHTML =
    '<div class="group-id-dot" style="background:' + group.color + '"></div>' +
    '<div>' +
      '<h2 class="group-id-name">' + _esc(group.name) + '</h2>' +
      '<span class="group-id-tagline">' + _esc(group.tagline) + '</span>' +
    '</div>';

  // Composer avatar
  var displayName = _currentUser.displayName || _currentUser.email || 'A';
  var avatar = document.getElementById('composer-avatar');
  avatar.textContent = displayName[0].toUpperCase();
  avatar.style.background = group.color;

  // Reset composer
  document.getElementById('composer-text').value   = '';
  document.getElementById('composer-img-url').value = '';
  document.getElementById('composer-hint').textContent = '';
  document.querySelector('.ctab[data-type="thought"]').click();

  _startPostsListener(group);
}

/* ── Real-time posts feed ────────────────────────────────────── */
function _startPostsListener(group) {
  if (_postsUnsub) { _postsUnsub(); _postsUnsub = null; }

  var feed = document.getElementById('posts-feed');
  feed.innerHTML =
    '<div class="feed-loading">' +
      '<div class="auth-veil-dots">' +
        '<div class="auth-veil-dot"></div>' +
        '<div class="auth-veil-dot"></div>' +
        '<div class="auth-veil-dot"></div>' +
      '</div>' +
    '</div>';

  _postsUnsub = _db
    .collection('communities').doc(group.id)
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .limit(60)
    .onSnapshot(
      function (snap) {
        if (snap.empty) {
          feed.innerHTML = _emptyFeedHTML(group);
          return;
        }
        var html = snap.docs.map(function (d) {
          return _postCardHTML(Object.assign({ id: d.id }, d.data()), group);
        }).join('');
        feed.innerHTML = html;
        _attachFeedHandlers(group);
      },
      function (err) {
        console.warn('Posts listener error:', err.message);
        /* permission-denied = Firestore rules say this user no longer
           matches this aesthetic. Treat it as a server-side revoke and
           kick back to the hub, re-syncing _userQuiz from authoritative
           server data so the UI matches what the rules will allow. */
        if (err && err.code === 'permission-denied') {
          if (_postsUnsub) { _postsUnsub(); _postsUnsub = null; }
          _currentGroup = null;
          history.replaceState(null, '', location.pathname);
          var hubEl   = document.getElementById('comm-hub');
          var groupEl = document.getElementById('comm-group');
          if (hubEl)   hubEl.style.display   = '';
          if (groupEl) groupEl.style.display = 'none';
          /* Force-refresh from server to catch the latest id, then notify */
          if (_currentUser) {
            _db.collection('users').doc(_currentUser.uid)
              .get({ source: 'server' })
              .then(function (snap) {
                var qr    = snap.exists && snap.data() && snap.data().quizResult;
                var newId = qr && qr.id ? qr.id : null;
                var prevId = _userQuiz && _userQuiz.id;
                _userQuiz = (qr && newId) ? qr : null;
                try {
                  if (newId) localStorage.setItem('aura_quiz_id', newId);
                  else       localStorage.removeItem('aura_quiz_id');
                } catch (_) {}
                _renderHub();
                _showQuizChangedNotice(prevId, newId);
              })
              .catch(function () { _renderHub(); });
          } else {
            _renderHub();
          }
          return;
        }
        feed.innerHTML = '<p class="feed-error">Could not load posts. ' + _esc(err.message) + '</p>';
      }
    );
}

function _emptyFeedHTML(group) {
  var i18n = (window.Aura && window.Aura.i18n) ? window.Aura.i18n : null;
  var title = i18n ? i18n.t('community.empty_title') : 'Your circle is quiet.';
  var body  = i18n ? i18n.t('community.empty_body')  : 'Be the first to share a look.';
  return '<div class="feed-empty">' +
    '<span class="feed-empty-symbol" style="color:' + group.color + '">' + group.symbol + '</span>' +
    '<h3>' + _esc(title) + '</h3>' +
    '<p>' + _esc(body) + '</p>' +
    '</div>';
}

/* ── Post card HTML ──────────────────────────────────────────── */
function _postCardHTML(post, group) {
  var uid       = _currentUser.uid;
  var reactions = post.reactions || { heart: [], fire: [], sparkle: [] };
  var hearts    = (reactions.heart   || []);
  var fires     = (reactions.fire    || []);
  var sparkles  = (reactions.sparkle || []);
  var myHeart   = hearts.indexOf(uid)   !== -1;
  var myFire    = fires.indexOf(uid)    !== -1;
  var mySparkle = sparkles.indexOf(uid) !== -1;

  var time     = post.createdAt ? _relTime(post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt)) : 'just now';
  var isOwn    = post.authorId === uid;
  var typeTag  = { thought: '✦ Thought', outfit: '◎ Outfit', moodboard: '◈ Moodboard' }[post.type] || '✦ Thought';

  return '<article class="post-card" id="post-' + post.id + '">' +

    // Header
    '<div class="post-header">' +
      '<div class="post-avatar" style="background:' + group.color + '">' + _esc(post.authorInitial || '?') + '</div>' +
      '<div class="post-meta">' +
        '<span class="post-author">' + _esc(post.authorName || 'Style Member') + '</span>' +
        '<span class="post-time">' + time + '</span>' +
      '</div>' +
      '<span class="post-type-pill">' + typeTag + '</span>' +
      (isOwn ? '<button class="post-delete" data-post-id="' + post.id + '" title="Delete post"><svg width="11" height="12" viewBox="0 0 11 12" fill="none"><path d="M1 2.5h9M3.5 2.5V1.5h4v1M2 2.5l.5 7h7l.5-7M4 5v3M7 5v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' : '') +
    '</div>' +

    // Body
    '<div class="post-body">' +
      '<p class="post-content">' + _esc(post.content || '') + '</p>' +
      (post.imageUrl ? '<div class="post-image"><img src="' + _esc(post.imageUrl) + '" alt="Shared image" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>' : '') +
    '</div>' +

    // Footer: reactions + comments toggle
    '<div class="post-footer">' +
      '<div class="post-reactions">' +
        '<button class="react-btn' + (myHeart   ? ' react-btn--on' : '') + '" data-post-id="' + post.id + '" data-type="heart">♡ <span>' + (hearts.length   || '') + '</span></button>' +
        '<button class="react-btn' + (myFire    ? ' react-btn--on' : '') + '" data-post-id="' + post.id + '" data-type="fire">✦ <span>'  + (fires.length    || '') + '</span></button>' +
        '<button class="react-btn' + (mySparkle ? ' react-btn--on' : '') + '" data-post-id="' + post.id + '" data-type="sparkle">◎ <span>' + (sparkles.length || '') + '</span></button>' +
      '</div>' +
      '<button class="comments-toggle" data-post-id="' + post.id + '">Comments</button>' +
    '</div>' +

    // Comments (hidden by default)
    '<div class="comments-section" id="cs-' + post.id + '" style="display:none">' +
      '<div class="comments-list" id="cl-' + post.id + '"></div>' +
      '<div class="comment-row">' +
        '<input class="comment-input" id="ci-' + post.id + '" placeholder="Add a comment…" maxlength="400">' +
        '<button class="comment-send" data-post-id="' + post.id + '">→</button>' +
      '</div>' +
    '</div>' +

    '</article>';
}

/* ── Feed event handlers — single delegated listener per feed ── */
function _attachFeedHandlers(group) {
  var feed = document.getElementById('posts-feed');
  if (feed._delegated) return; // already attached; innerHTML changes don't break delegation
  feed._delegated = true;

  feed.addEventListener('click', function (e) {
    var react = e.target.closest('.react-btn');
    if (react) { _toggleReaction(react.dataset.postId, react.dataset.type, group); return; }
    var toggle = e.target.closest('.comments-toggle');
    if (toggle) { _toggleComments(toggle.dataset.postId, group); return; }
    var send = e.target.closest('.comment-send');
    if (send) { _submitComment(send.dataset.postId, group); return; }
    var del = e.target.closest('.post-delete');
    if (del) { _deletePost(del.dataset.postId, group); return; }
  });

  feed.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var input = e.target.closest('.comment-input');
    if (input) _submitComment(input.id.replace('ci-', ''), group);
  });
}

/* ── Reactions ───────────────────────────────────────────────── */
function _toggleReaction(postId, type, group) {
  if (!_currentUser) return;
  var uid = _currentUser.uid;
  var ref = _db
    .collection('communities').doc(group.id)
    .collection('posts').doc(postId);
  var field = 'reactions.' + type;

  /* Read current state from the DOM — avoids a round-trip Firestore read */
  var btn = document.querySelector(
    '.react-btn[data-post-id="' + postId + '"][data-type="' + type + '"]'
  );
  var isOn = btn && btn.classList.contains('react-btn--on');

  var update = {};
  update[field] = isOn
    ? firebase.firestore.FieldValue.arrayRemove(uid)
    : firebase.firestore.FieldValue.arrayUnion(uid);

  ref.update(update).catch(function (e) { console.warn('Reaction failed:', e.message); });
}

/* ── Comments ────────────────────────────────────────────────── */
function _toggleComments(postId, group) {
  var section = document.getElementById('cs-' + postId);
  if (!section) return;
  var isOpen = section.style.display !== 'none';
  section.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) _loadComments(postId, group);
}

function _loadComments(postId, group) {
  var list = document.getElementById('cl-' + postId);
  if (!list) return;
  list.innerHTML = '<p class="comments-loading">Loading…</p>';

  _db
    .collection('communities').doc(group.id)
    .collection('posts').doc(postId)
    .collection('comments')
    .orderBy('createdAt', 'asc')
    .limit(50)
    .get()
    .then(function (snap) {
      if (snap.empty) {
        var i18n = (window.Aura && window.Aura.i18n) ? window.Aura.i18n : null;
        var msg = i18n ? i18n.t('community.no_comments') : 'No comments yet. Be the first.';
        list.innerHTML = '<p class="no-comments">' + _esc(msg) + '</p>';
        return;
      }
      list.innerHTML = snap.docs.map(function (d) {
        return _commentHTML(d.id, d.data(), group, postId);
      }).join('');
    })
    .catch(function () { list.innerHTML = '<p class="no-comments">Could not load comments.</p>'; });
}

function _commentHTML(id, c, group, postId) {
  var time  = c.createdAt ? _relTime(c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt)) : 'just now';
  var isOwn = c.authorId === _currentUser.uid;
  return '<div class="comment-item" id="cmt-' + id + '">' +
    '<span class="comment-avatar" style="background:' + group.color + '">' + _esc(c.authorInitial || '?') + '</span>' +
    '<div class="comment-body">' +
      '<span class="comment-author">' + _esc(c.authorName || 'Style Member') + '</span>' +
      '<p class="comment-text">' + _esc(c.content) + '</p>' +
      '<span class="comment-time">' + time + '</span>' +
    '</div>' +
    (isOwn
      ? '<button class="comment-delete" data-comment-id="' + id + '" data-post-id="' + postId + '" data-group-id="' + group.id + '" title="Delete comment"><svg width="10" height="11" viewBox="0 0 10 11" fill="none"><path d="M1 2.5h8M3 2.5V1.5h4v1M1.5 2.5l.5 6.5h6l.5-6.5M3.5 5v2.5M6.5 5v2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      : '') +
    '</div>';
}

function _submitComment(postId, group) {
  var input   = document.getElementById('ci-' + postId);
  if (!input) return;
  var content = input.value.trim();
  if (!content) return;

  input.disabled = true;
  var name = _currentUser.displayName || _currentUser.email || 'Style Member';

  _db
    .collection('communities').doc(group.id)
    .collection('posts').doc(postId)
    .collection('comments')
    .add({
      authorId:      _currentUser.uid,
      authorName:    name,
      authorInitial: name[0].toUpperCase(),
      content:       content,
      createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function () {
      input.value = '';
      _loadComments(postId, group);
    })
    .catch(function (e) { console.warn('Comment failed:', e.message); })
    .finally(function () { input.disabled = false; });
}

function _confirmDelete(message, onConfirm) {
  document.getElementById('access-modal-box').innerHTML =
    '<div class="access-icon" style="color:var(--rose)">⊘</div>' +
    '<h3>Delete this?</h3>' +
    '<p>' + message + '</p>' +
    '<div class="access-actions">' +
      '<button class="btn access-primary-btn" style="background:var(--rose);border-color:var(--rose)" id="confirm-delete-yes">Delete</button>' +
      '<button class="btn-ghost" onclick="closeAccessModal()">Cancel</button>' +
    '</div>';
  document.getElementById('access-modal').style.display = 'flex';
  document.getElementById('confirm-delete-yes').addEventListener('click', function () {
    closeAccessModal();
    onConfirm();
  });
}

function _deletePost(postId, group) {
  _confirmDelete('This post will be permanently removed.', function () {
    _db
      .collection('communities').doc(group.id)
      .collection('posts').doc(postId)
      .delete()
      .catch(function (e) { console.warn('Delete post failed:', e.message); });
  });
}

// Delegate comment-delete clicks (added via innerHTML)
document.addEventListener('click', function (e) {
  var btn = e.target.closest('.comment-delete');
  if (!btn) return;
  var commentId = btn.dataset.commentId;
  var postId    = btn.dataset.postId;
  var groupId   = btn.dataset.groupId;
  _confirmDelete('This comment will be permanently removed.', function () {
    _db
      .collection('communities').doc(groupId)
      .collection('posts').doc(postId)
      .collection('comments').doc(commentId)
      .delete()
      .then(function () {
        var el = document.getElementById('cmt-' + commentId);
        if (el) el.remove();
      })
      .catch(function (e) { console.warn('Delete comment failed:', e.message); });
  });
});

/* ── Post composer ───────────────────────────────────────────── */
function _initComposerTabs() {
  var tabs = document.querySelectorAll('.ctab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var imgRow = document.getElementById('composer-img-row');
      if (imgRow) imgRow.style.display = tab.dataset.type !== 'thought' ? 'flex' : 'none';
    });
  });

  var postBtn = document.getElementById('composer-post-btn');
  if (postBtn) postBtn.addEventListener('click', _submitPost);

  var textarea = document.getElementById('composer-text');
  if (textarea) {
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) _submitPost();
    });
  }
}

function _submitPost() {
  if (!_currentUser || !_currentGroup) return;

  var text = document.getElementById('composer-text').value.trim();
  if (!text) {
    document.getElementById('composer-hint').textContent = 'Write something first.';
    return;
  }

  var activeTab = document.querySelector('.ctab.active');
  var type      = activeTab ? activeTab.dataset.type : 'thought';
  var imgInput  = document.getElementById('composer-img-url');
  var imageUrl  = (imgInput && imgInput.value.trim()) ? imgInput.value.trim() : null;

  var btn = document.getElementById('composer-post-btn');
  btn.disabled    = true;
  btn.textContent = 'Posting…';
  document.getElementById('composer-hint').textContent = '';

  var name = _currentUser.displayName || _currentUser.email || 'Style Member';

  _db
    .collection('communities').doc(_currentGroup.id)
    .collection('posts')
    .add({
      authorId:      _currentUser.uid,
      authorName:    name,
      authorInitial: name[0].toUpperCase(),
      content:       text,
      imageUrl:      imageUrl,
      type:          type,
      aestheticId:   _currentGroup.id,
      reactions:     { heart: [], fire: [], sparkle: [] },
      createdAt:     firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function () {
      document.getElementById('composer-text').value = '';
      if (imgInput) imgInput.value = '';
      document.querySelector('.ctab[data-type="thought"]').click();
    })
    .catch(function (e) {
      document.getElementById('composer-hint').textContent = 'Could not post. Try again.';
      console.warn('Post failed:', e.message);
    })
    .finally(function () {
      btn.disabled    = false;
      btn.textContent = 'Post';
    });
}

/* ── Burger menu ──────────────────────────────────────────────
   The burger is wired by firebase.js (which IS loaded here) via
   its own instant-response pointerup + click handler. We used to
   wire it locally to .nav-links.open — that was the wrong class
   (CSS expects .nav.nav-open) and the menu silently never opened.
   The local handler is now removed; firebase.js handles everything
   with the correct class and the iOS-WebView-friendly fast path.
─────────────────────────────────────────────────────────────── */
function _initBurger() { /* no-op — handled by firebase.js wireBurgerOnce */ }

/* ── Utilities ───────────────────────────────────────────────── */
function _relTime(date) {
  var diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60)   + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600)  + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

function _esc(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}
