/* ================================================================
   AURA — Community Groups  (community.js v1)
   Private fashion circles gated by quiz result aesthetic.

   Flow:
     1. initAuthGuard() (firebase.js) reveals page once auth resolves
     2. onAuthChange fires → load user's quiz result from Firestore
     3. Read URL hash → route to hub or group view
     4. Access checks run on the client AND are enforced by Firestore rules
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

var _currentUser  = null;   // Firebase user object
var _userQuiz     = null;   // { id, name, auraColor, … } from Firestore
var _currentGroup = null;   // group object currently viewed
var _postsUnsub   = null;   // onSnapshot unsubscribe handle

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  _initComposerTabs();
  _initBurger();

  onAuthChange(function (user) {
    _currentUser = user;
    if (!user) return; // initAuthGuard handles the redirect to login

    _loadUserQuiz().then(function () {
      _routeFromHash();
    });
  });

  window.addEventListener('hashchange', function () {
    // Only re-route if we aren't already inside the matching group
    var hash = window.location.hash.slice(1).toLowerCase();
    if (!_currentGroup || _currentGroup.id !== hash) {
      _routeFromHash();
    }
  });
});

/* ── Load user's quiz result ─────────────────────────────────── */
function _loadUserQuiz(isRetry) {
  return _db
    .collection('users').doc(_currentUser.uid).get()
    .then(function (snap) {
      var qr = snap.exists && snap.data() && snap.data().quizResult;
      if (qr && qr.id) {
        _userQuiz = qr;
      } else if (!isRetry) {
        /* Quiz result absent — could be a race condition (quiz save not yet
           committed when we read). Retry once after 1.5 s before giving up. */
        return new Promise(function (resolve) {
          setTimeout(function () {
            _loadUserQuiz(true).then(resolve);
          }, 1500);
        });
      } else {
        _userQuiz = null;
      }
    })
    .catch(function (err) {
      console.warn('[Community] Failed to load quiz result:',
        (err && err.code) || '?', (err && err.message) || err);
      if (!isRetry) {
        /* Retry once on error (transient network / cold-start token issue) */
        return new Promise(function (resolve) {
          setTimeout(function () {
            _loadUserQuiz(true).then(resolve);
          }, 1500);
        });
      }
      _userQuiz = null;
    });
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
  _loadUserQuiz(true).then(function () { _renderHub(); });
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
        feed.innerHTML = '<p class="feed-error">Could not load posts. ' + _esc(err.message) + '</p>';
      }
    );
}

function _emptyFeedHTML(group) {
  return '<div class="feed-empty">' +
    '<span class="feed-empty-symbol" style="color:' + group.color + '">' + group.symbol + '</span>' +
    '<h3>Be the first to share</h3>' +
    '<p>Start the conversation in the ' + _esc(group.name) + ' circle.</p>' +
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
      (isOwn ? '<button class="post-delete" data-post-id="' + post.id + '" title="Delete post">×</button>' : '') +
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

/* ── Feed event handlers ─────────────────────────────────────── */
function _attachFeedHandlers(group) {
  var feed = document.getElementById('posts-feed');

  feed.querySelectorAll('.react-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _toggleReaction(btn.dataset.postId, btn.dataset.type, group);
    });
  });

  feed.querySelectorAll('.comments-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _toggleComments(btn.dataset.postId, group);
    });
  });

  feed.querySelectorAll('.comment-send').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _submitComment(btn.dataset.postId, group);
    });
  });

  feed.querySelectorAll('.comment-input').forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') _submitComment(input.id.replace('ci-', ''), group);
    });
  });

  feed.querySelectorAll('.post-delete').forEach(function (btn) {
    btn.addEventListener('click', function () {
      _deletePost(btn.dataset.postId, group);
    });
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

  ref.get().then(function (snap) {
    if (!snap.exists) return;
    var arr = (snap.data().reactions || {})[type] || [];
    var isOn = arr.indexOf(uid) !== -1;
    var update = {};
    update[field] = isOn
      ? firebase.firestore.FieldValue.arrayRemove(uid)
      : firebase.firestore.FieldValue.arrayUnion(uid);
    return ref.update(update);
  }).catch(function (e) { console.warn('Reaction failed:', e.message); });
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
      if (snap.empty) { list.innerHTML = '<p class="no-comments">No comments yet. Be first.</p>'; return; }
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
      ? '<button class="comment-delete" data-comment-id="' + id + '" data-post-id="' + postId + '" data-group-id="' + group.id + '">×</button>'
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

function _deletePost(postId, group) {
  if (!confirm('Delete this post?')) return;
  _db
    .collection('communities').doc(group.id)
    .collection('posts').doc(postId)
    .delete()
    .catch(function (e) { console.warn('Delete post failed:', e.message); });
}

// Called from inline onclick in comment HTML
function deleteComment(commentId, postId, groupId) {
  if (!confirm('Delete this comment?')) return;
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
}

// Delegate comment-delete clicks (added via innerHTML)
document.addEventListener('click', function (e) {
  var btn = e.target.closest('.comment-delete');
  if (!btn) return;
  deleteComment(btn.dataset.commentId, btn.dataset.postId, btn.dataset.groupId);
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

/* ── Burger menu (no main.js on this page) ───────────────────── */
function _initBurger() {
  var burger = document.querySelector('.nav-burger');
  var links  = document.querySelector('.nav-links');
  if (!burger || !links) return;
  burger.addEventListener('click', function () {
    links.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!burger.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
    }
  });
}

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
