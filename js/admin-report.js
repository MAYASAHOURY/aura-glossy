/* ============================================================
   AURA — Admin report dashboard renderer
   Loaded only by admin-report.html. Renders aggregates from the
   `analytics_events` collection + a head-of-collection sample of
   `users`. Strict-gated: the page already has a session-flag head
   check; this script then confirms users/{uid}.isAdmin === true
   via Firestore before revealing any data.
   ============================================================ */
(function () {
  'use strict';

  var COMM_GROUPS = [
    'classic','casual','streetwear','minimalist','elegant',
    'korean','y2k','vintage','softgirl','hijabicore','darkacademia'
  ];
  var COMM_LABELS = {
    classic: 'Classic', casual: 'Casual', streetwear: 'Streetwear',
    minimalist: 'Minimalist', elegant: 'Elegant', korean: 'Korean',
    y2k: 'Y2K', vintage: 'Vintage', softgirl: 'Soft Girl',
    hijabicore: 'Hijabi Core', darkacademia: 'Dark Academia'
  };

  /* ── State ────────────────────────────────────────────────── */
  var _db, _auth;
  var _range = '7d';
  var _aesthetic = '';
  var _audience = 'public'; /* 'public' | 'all' — see _publicCheck() */
  var _events = [];   /* current loaded events (capped) */
  var _users  = [];   /* most-recent users sample */
  var _loading = false;
  var _lastUpdated = null; /* HH:MM:SS string for the Data quality strip */

  /* Minimum sample sizes for honest conversion rates. Below these
     thresholds we show "—" + a "Not enough data" foot rather than
     publishing a misleading percentage. Tuned conservatively. */
  var MIN_QUIZ_SAMPLE  = 5;
  var MIN_MODAL_SAMPLE = 5;
  var MIN_GUEST_SAMPLE = 10;

  /* ── Helpers ──────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function txt(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmtNum(n) { return n == null ? '—' : Number(n).toLocaleString(); }
  function fmtPct(n, d) {
    if (!d) return '0%';
    return Math.round((n / d) * 100) + '%';
  }
  function fmtTime(d) {
    if (!d) return '—';
    var date = d.toDate ? d.toDate() : new Date(d);
    var diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd ago';
    return date.toISOString().slice(0, 10);
  }
  function startOfRange(range) {
    var now = Date.now();
    if (range === 'today') {
      var d = new Date();
      d.setHours(0,0,0,0);
      return d;
    }
    if (range === '7d')  return new Date(now - 7  * 86400 * 1000);
    if (range === '30d') return new Date(now - 30 * 86400 * 1000);
    return null; /* 'all' */
  }
  function showOverlay(id) {
    var ids = ['ar-loading','ar-denied','ar-app'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.style.display = (ids[i] === id) ? (ids[i] === 'ar-app' ? 'block' : 'flex') : 'none';
    }
  }

  /* ── Bootstrap: confirm admin ─────────────────────────────── */
  function _boot() {
    try {
      if (typeof firebase === 'undefined') {
        return _bail('Firebase failed to load.');
      }
      _auth = firebase.auth();
      _db   = firebase.firestore();
    } catch (e) {
      return _bail('Firebase failed to initialize.');
    }

    var resolved = false;
    var safety = setTimeout(function () {
      if (resolved) return;
      resolved = true;
      _bail('Auth check timed out. Try again from settings.');
    }, 8000);

    _auth.onAuthStateChanged(function (user) {
      if (resolved) return;
      if (!user) {
        resolved = true;
        clearTimeout(safety);
        location.replace('login.html?next=%2Fadmin-report.html');
        return;
      }
      _db.collection('users').doc(user.uid).get().then(function (snap) {
        if (resolved) return;
        resolved = true;
        clearTimeout(safety);
        var data = snap.exists ? snap.data() : null;
        if (!data || data.isAdmin !== true) {
          showOverlay('ar-denied');
          return;
        }
        _start();
      }).catch(function () {
        if (resolved) return;
        resolved = true;
        clearTimeout(safety);
        _bail('Could not verify admin status. Try again.');
      });
    });
  }
  function _bail(msg) {
    var d = $('ar-denied');
    var sub = d && d.querySelector('.ar-overlay-sub');
    if (sub) sub.textContent = msg;
    showOverlay('ar-denied');
  }

  /* ── Wire UI + first load ─────────────────────────────────── */
  function _start() {
    showOverlay('ar-app');

    /* Maintenance banner — visible whenever maintenance.js exposed
       the global flag, regardless of bypass state. This is the
       authoritative signal that public traffic is being sealed. */
    if (window.__auraMaintenanceMode) {
      var banner = $('ar-maint-banner');
      if (banner) banner.classList.add('is-visible');
      /* Header pill — same flag, smaller surface in the sticky top bar
         so the admin sees the seal status without scrolling. */
      var pill = $('ar-maint-pill');
      if (pill) pill.classList.add('is-visible');
    }

    /* Range pills */
    var pills = document.querySelectorAll('.ar-pill[data-range]');
    for (var i = 0; i < pills.length; i++) {
      pills[i].addEventListener('click', function (e) {
        var r = e.currentTarget.getAttribute('data-range');
        if (!r || r === _range) return;
        _range = r;
        for (var j = 0; j < pills.length; j++) pills[j].classList.toggle('is-active', pills[j] === e.currentTarget);
        _loadAll();
      });
    }
    /* Audience pills (public/all). Doesn't re-fetch — events are already
       loaded; we just re-filter + re-render. Instant. */
    var audPills = document.querySelectorAll('.ar-pill[data-audience]');
    for (var ai = 0; ai < audPills.length; ai++) {
      audPills[ai].addEventListener('click', function (e) {
        var a = e.currentTarget.getAttribute('data-audience');
        if (!a || a === _audience) return;
        _audience = a;
        for (var aj = 0; aj < audPills.length; aj++) audPills[aj].classList.toggle('is-active', audPills[aj] === e.currentTarget);
        _render();
      });
    }
    /* Aesthetic filter */
    var sel = $('ar-aesthetic-filter');
    if (sel) sel.addEventListener('change', function () {
      _aesthetic = sel.value;
      _loadAll();
    });
    /* Refresh */
    var refresh = $('ar-refresh');
    if (refresh) refresh.addEventListener('click', function () { _loadAll(); });

    /* Admin action buttons */
    var csv = $('ar-export-csv');
    if (csv) csv.addEventListener('click', _exportCsv);
    var del = $('ar-delete-tests');
    if (del) del.addEventListener('click', _deleteTestEvents);
    /* Empty-state Refresh button uses the same handler as the top bar */
    var emptyRefresh = $('ar-empty-refresh');
    if (emptyRefresh) emptyRefresh.addEventListener('click', function () { _loadAll(); });

    _loadAll();
  }

  /* ── Load events + users for the current filter ───────────── */
  function _loadAll() {
    if (_loading) return;
    _loading = true;
    var btn = $('ar-refresh');
    if (btn) { btn.disabled = true; btn.textContent = '↻ Loading…'; }

    var since = startOfRange(_range);
    var q = _db.collection('analytics_events').orderBy('ts', 'desc');
    if (since) q = q.where('ts', '>=', since);
    q = q.limit(5000);

    Promise.all([
      q.get().catch(function (e) {
        console.warn('events load failed:', e && e.code);
        return { docs: [] };
      }),
      _db.collection('users').orderBy('createdAt', 'desc').limit(40).get().catch(function () {
        /* Older user docs may not have createdAt — fall back to no order */
        return _db.collection('users').limit(40).get().catch(function () { return { docs: [] }; });
      })
    ]).then(function (results) {
      var evSnap = results[0];
      var uSnap  = results[1];
      _events = evSnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
      _users  = uSnap.docs.map(function (d) {
        var data = d.data() || {};
        data.uid = d.id;
        return data;
      });
      _render();
    }).catch(function (e) {
      $('ar-status').className = 'ar-status is-error';
      $('ar-status').textContent = 'Could not load analytics: ' + (e && e.message || 'unknown error');
    }).then(function () {
      _loading = false;
      if (btn) { btn.disabled = false; btn.textContent = '↻ Refresh'; }
      /* Last-updated timestamp for the Data quality strip */
      var d = new Date();
      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
      _lastUpdated = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    });
  }

  /* ── Audience filter ──────────────────────────────────────────
     Returns { ok, reason } so the Latest Events table can show
     WHY each event was excluded. Reasons (in priority order):

       admin           — isAdmin === true (admin browsing via bypass)
       test            — test === true (synthetic / manual test events)
       maintenance     — isMaintenanceMode === true (event fired
                          while the public surface was sealed; the
                          only people who can fire events at all
                          during maintenance are admins via bypass)
       maintenance-scr — isMaintenanceScreen === true (reserved for
                          future per-session maintenance-view tracking;
                          schema accepts it)
       local           — host is localhost / 127.0.0.1 / private IPv4
                          (events from dev preview never count as
                          real visitor traffic)

     Anything else is "public". The check runs in priority order —
     a single event hitting multiple criteria reports the most
     informative reason first. ───────────────────────────────── */
  function _isLocalHost(host) {
    if (!host) return false;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return true;
    if (/^10\./.test(host)) return true;
    if (/^192\.168\./.test(host)) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
    return false;
  }
  function _publicCheck(e) {
    if (e.isAdmin === true)            return { ok: false, reason: 'admin' };
    if (e.test === true)               return { ok: false, reason: 'test' };
    if (e.isMaintenanceMode === true)  return { ok: false, reason: 'maintenance' };
    if (e.isMaintenanceScreen === true) return { ok: false, reason: 'maintenance-screen' };
    if (e.host && _isLocalHost(e.host)) return { ok: false, reason: 'local' };
    return { ok: true, reason: 'public' };
  }
  function _isPublicEvent(e) { return _publicCheck(e).ok; }

  /* ── Render: dispatch to each section ─────────────────────── */
  function _render() {
    var publicOnly = _audience === 'public';

    /* Tally exclusion reasons across the FULL loaded set so the
       Data quality strip shows the same numbers regardless of which
       audience pill is active. */
    var dq = { total: _events.length, public: 0, admin: 0, test: 0, maintenance: 0, local: 0, maintenanceScreen: 0 };
    for (var i = 0; i < _events.length; i++) {
      var c = _publicCheck(_events[i]);
      if (c.ok) dq.public++;
      else if (c.reason === 'admin')              dq.admin++;
      else if (c.reason === 'test')               dq.test++;
      else if (c.reason === 'maintenance')        dq.maintenance++;
      else if (c.reason === 'maintenance-screen') dq.maintenanceScreen++;
      else if (c.reason === 'local')              dq.local++;
    }
    _renderDataQuality(dq);

    var ev = _events.filter(function (e) {
      if (_aesthetic && e.aesthetic !== _aesthetic) return false;
      if (publicOnly && !_isPublicEvent(e)) return false;
      return true;
    });

    /* Empty-state hero: only show when there are NO events at all for
       the current range (pre-filter). If the filter is what produced
       zero, the sections themselves render per-section empty stubs.
       Status strip stays visible either way for legibility. */
    var hero = $('ar-empty-hero');
    if (hero) {
      var trulyEmpty = _events.length === 0;
      hero.classList.toggle('is-visible', trulyEmpty);
    }

    /* Update meta strip — show both the filtered count and (when
       relevant) the excluded count so the admin sees exactly what
       was hidden by the audience filter. */
    var meta = $('ar-overview-meta');
    if (meta) {
      var excludedCount = _events.length - ev.length;
      meta.textContent = ev.length + ' events · range: ' + _rangeLabel(_range)
        + (_aesthetic ? ' · ' + COMM_LABELS[_aesthetic] : '')
        + (excludedCount > 0 ? ' · ' + excludedCount + ' filtered out' : '');
    }
    /* Update KPI note to reflect the current toggle */
    var note = $('ar-kpi-note');
    if (note) {
      if (publicOnly) {
        note.innerHTML = 'Showing <em>public-only</em> events. Toggle <em>All (incl. admin)</em> above to include admin browsing + test events.';
      } else {
        note.innerHTML = 'Showing <em>all</em> events including admin browsing and test data.';
      }
    }

    _renderKpis(ev, publicOnly);
    _renderLatestEvents();  /* always shows ALL events with per-row Public/Reason */
    _renderUsers();
    _renderGuestFunnel(ev);
    _renderShopping(ev);
    _renderModal(ev);
    _renderDeviceBrowser(ev);
    _renderAesthetics(ev);
    _renderQuiz(ev);
    _renderCommunity(ev);
    _renderMoodboard(ev);
    _renderErrors(ev);
  }

  /* ── Data quality strip ──────────────────────────────────── */
  function _renderDataQuality(dq) {
    var set = function (id, v) { var el = $(id); if (el) el.textContent = String(v); };
    set('ar-dq-total',       dq.total);
    set('ar-dq-public',      dq.public);
    set('ar-dq-excl-admin',  dq.admin);
    set('ar-dq-excl-test',   dq.test);
    set('ar-dq-excl-maint',  dq.maintenance + dq.maintenanceScreen);
    set('ar-dq-excl-local',  dq.local);
    set('ar-dq-range',       _rangeLabel(_range));
    set('ar-dq-updated',     _lastUpdated || '—');
  }

  /* ── Latest events — live feed of individual events ──────────
     Always shows ALL recent events regardless of the audience
     toggle. The per-row "Status" column makes the decision
     transparent: ✓ public, or ⊘ <reason> if excluded. Includes the
     6-char Firestore doc id so an admin can grep it in the
     console if needed. ─────────────────────────────────────── */
  function _renderLatestEvents() {
    var el = $('ar-latest-events-table');
    if (!el) return;
    if (!_events.length) {
      el.innerHTML = '<div class="ar-stub" style="text-align:left">No events loaded for this range. Try widening the date filter at the top.</div>';
      return;
    }
    var rows = _events.slice(0, 50).map(function (e) {
      var role;
      if (e.isAdmin)       role = '<span class="ar-tag is-admin">admin</span>';
      else if (e.isGuest)  role = '<span class="ar-tag is-guest">guest</span>';
      else                 role = '<span class="ar-tag is-user">user</span>';

      var maint = e.isMaintenanceMode
        ? '<span class="ar-tag is-maint">yes</span>'
        : '<span class="dim">—</span>';

      var pubCheck = _publicCheck(e);
      var status = pubCheck.ok
        ? '<span class="ar-tag" style="background:rgba(122,152,138,.14);color:#4a7a5e;border:1px solid rgba(122,152,138,.32)" title="Counted in public KPIs">✓ public</span>'
        : '<span class="ar-tag" style="background:rgba(170,160,150,.14);color:#6a5a4a;border:1px solid rgba(170,160,150,.32)" title="Excluded from public KPIs — reason: ' + txt(pubCheck.reason) + '">⊘ ' + txt(pubCheck.reason) + '</span>';

      var browser = e.inApp ? ('inapp · ' + e.inApp) : (e.browser || '—');
      var shortId = e.id ? e.id.slice(0, 6) : '—';

      return '<tr>' +
        '<td class="mono dim" title="' + txt(e.id || '') + '">' + txt(shortId) + '</td>' +
        '<td class="dim">' + fmtTime(e.ts) + '</td>' +
        '<td class="mono">' + txt(e.type) + '</td>' +
        '<td class="trunc mono dim">' + txt(e.path || '—') + '</td>' +
        '<td>' + role + '</td>' +
        '<td>' + maint + '</td>' +
        '<td>' + status + '</td>' +
        '<td>' + (e.aesthetic ? txt(COMM_LABELS[e.aesthetic] || e.aesthetic) : '<span class="dim">—</span>') + '</td>' +
        '<td class="mono dim">' + txt(browser) + '</td>' +
      '</tr>';
    }).join('');
    el.innerHTML = '<table class="ar-table"><thead><tr>' +
      '<th>ID</th><th>Time</th><th>Type</th><th>Path</th><th>Role</th><th>Maint</th><th>Public?</th><th>Aesthetic</th><th>Browser</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }
  function _rangeLabel(r) {
    return { 'today': 'today', '7d': 'last 7 days', '30d': 'last 30 days', 'all': 'all time' }[r] || r;
  }

  /* ── 1. KPIs ──────────────────────────────────────────────────
     Each card carries a `def` tooltip explaining EXACTLY what is
     counted, derived from the audience filter currently active.
     Conversion rates are gated by minimum sample sizes — below the
     threshold we show "—" with a "Not enough data" foot rather than
     publishing a misleading percentage. ─────────────────────── */
  function _renderKpis(ev, publicOnly) {
    var kpis = $('ar-kpis');
    if (!kpis) return;

    var counts = {
      page_view: 0, aesthetic_view: 0, shop_click: 0, shop_gate_open: 0,
      save_click: 0, save_success: 0, save_gate_open: 0,
      quiz_start: 0, quiz_complete: 0, quiz_abandoned: 0,
      community_view: 0, community_post: 0, community_comment: 0, community_reaction: 0,
      signup_modal_open: 0, signup_modal_action: 0, admin_login: 0, error: 0
    };
    var modalActions = { create: 0, signin: 0, dismiss: 0 };
    var uniqueGuestSessions = {};
    var uniqueUserUids = {};
    var todayStart = (function () { var d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
    var todayPageViews = 0;
    var todayUserSignups = 0;
    var weekUserSignups = 0;
    var weekStart = Date.now() - 7 * 86400 * 1000;

    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (counts.hasOwnProperty(e.type)) counts[e.type]++;
      if (e.type === 'signup_modal_action' && e.modalAction && modalActions.hasOwnProperty(e.modalAction)) {
        modalActions[e.modalAction]++;
      }
      /* Unique-user count excludes admins explicitly — even in "All"
         audience mode we don't want to count the admin as a "user". */
      if (e.isGuest && e.sessionId) uniqueGuestSessions[e.sessionId] = 1;
      if (!e.isGuest && !e.isAdmin && e.uid) uniqueUserUids[e.uid] = 1;
      if (e.type === 'page_view') {
        var et = e.ts && e.ts.toMillis ? e.ts.toMillis() : 0;
        if (et && et >= todayStart) todayPageViews++;
      }
    }
    for (var u = 0; u < _users.length; u++) {
      var ud = _users[u];
      var ct = ud.createdAt && ud.createdAt.toMillis ? ud.createdAt.toMillis() : 0;
      if (ct >= todayStart) todayUserSignups++;
      if (ct >= weekStart)  weekUserSignups++;
    }

    var totalUsers = _users.length;
    var guestSessions = Object.keys(uniqueGuestSessions).length;
    var userSessions  = Object.keys(uniqueUserUids).length;
    var modalOpens    = counts.signup_modal_open;
    var modalActed    = modalActions.create + modalActions.signin;

    /* Minimum-sample guards. Show "—" + explanation when sample is
       too small to publish a meaningful percentage. */
    var quizConv, quizFoot;
    if (counts.quiz_start >= MIN_QUIZ_SAMPLE) {
      quizConv = fmtPct(counts.quiz_complete, counts.quiz_start);
      quizFoot = 'start → complete';
    } else {
      quizConv = '—';
      quizFoot = 'Not enough data (need ' + MIN_QUIZ_SAMPLE + '+ quiz starts)';
    }
    var gateConv, gateFoot;
    if (modalOpens >= MIN_MODAL_SAMPLE) {
      gateConv = fmtPct(modalActed, modalOpens);
      gateFoot = 'modal open → create/signin';
    } else {
      gateConv = '—';
      gateFoot = 'Not enough data (need ' + MIN_MODAL_SAMPLE + '+ modal opens)';
    }
    var visConv, visFoot;
    if (guestSessions >= MIN_GUEST_SAMPLE) {
      visConv = fmtPct(modalActed, guestSessions);
      visFoot = 'guest session → modal action';
    } else {
      visConv = '—';
      visFoot = 'Not enough data (need ' + MIN_GUEST_SAMPLE + '+ guest sessions)';
    }

    /* Definitions — show the exact rule when the admin hovers a
       KPI label. The wording reflects the current audience setting. */
    var modeNote = publicOnly
      ? ' (public-only set: admin, test, maintenance, and local-preview events are excluded)'
      : ' (All-audience set: every loaded event is counted)';

    var cards = [
      { label: 'Page views',       def: 'Count of page_view events in the selected range' + modeNote + '.',
        value: fmtNum(counts.page_view), foot: '<strong>' + fmtNum(todayPageViews) + '</strong> today' },
      { label: 'Unique guests',    def: 'Distinct guest sessionIds (isGuest=true). One per browser-tab session' + modeNote + '.',
        value: fmtNum(guestSessions), foot: 'guest sessions in range' },
      { label: 'Unique users',     def: 'Distinct signed-in uids that are NOT flagged isAdmin. Real-account browsing only.',
        value: fmtNum(userSessions), foot: 'distinct non-admin uids' },
      { label: 'Latest signups',   def: 'Most-recent user docs in the users collection. Sample capped at 40 — exact only for the recent slice.',
        value: fmtNum(totalUsers), foot: '<strong>' + fmtNum(todayUserSignups) + '</strong> today · <strong>' + fmtNum(weekUserSignups) + '</strong> this week' },
      { label: 'Shop clicks',      def: 'shop_click events. Fired only when a signed-in user (or admin) actually opens a retailer link' + modeNote + '.',
        value: fmtNum(counts.shop_click), foot: '+ <strong>' + fmtNum(counts.shop_gate_open) + '</strong> guest gates' },
      { label: 'Saves',            def: 'save_success events — moodboard saves that completed.',
        value: fmtNum(counts.save_success), foot: '+ <strong>' + fmtNum(counts.save_gate_open) + '</strong> guest gates' },
      { label: 'Quiz starts',      def: 'quiz_start events — one per quiz session (re-fires after a retake).',
        value: fmtNum(counts.quiz_start), foot: '<strong>' + fmtNum(counts.quiz_complete) + '</strong> completed' },
      { label: 'Community posts',  def: 'community_post events — successful post writes to Firestore.',
        value: fmtNum(counts.community_post), foot: '<strong>' + fmtNum(counts.community_comment) + '</strong> comments · <strong>' + fmtNum(counts.community_reaction) + '</strong> reactions' },
      { label: 'Modal opens',      def: 'signup_modal_open events. Fired when Aura.requireAuth opens the gate for a guest action.',
        value: fmtNum(modalOpens), foot: '<strong>' + fmtNum(modalActions.create) + '</strong> created · <strong>' + fmtNum(modalActions.signin) + '</strong> signed-in · <strong>' + fmtNum(modalActions.dismiss) + '</strong> dismissed' },
      { label: 'Quiz conversion',  def: 'quiz_complete / quiz_start. Hidden when fewer than ' + MIN_QUIZ_SAMPLE + ' starts to avoid misleading low-sample percentages.',
        value: quizConv, foot: quizFoot },
      { label: 'Gate conversion',  def: 'create+signin actions / modal_open events. Hidden when fewer than ' + MIN_MODAL_SAMPLE + ' opens.',
        value: gateConv, foot: gateFoot },
      { label: 'Visitor → signup', def: 'modal create+signin actions / unique guest sessions. Hidden when fewer than ' + MIN_GUEST_SAMPLE + ' guest sessions.',
        value: visConv, foot: visFoot }
    ];

    kpis.innerHTML = cards.map(function (c) {
      return '<div class="ar-kpi">' +
        '<div class="ar-kpi-label" title="' + txt(c.def) + '">' + txt(c.label) +
          ' <span style="opacity:.55;font-weight:400" aria-hidden="true">ⓘ</span></div>' +
        '<div class="ar-kpi-value">' + c.value + '</div>' +
        '<div class="ar-kpi-foot">' + c.foot + '</div></div>';
    }).join('');
  }

  /* ── 2. Users ─────────────────────────────────────────────── */
  function _renderUsers() {
    var wrap = $('ar-users-table');
    if (!wrap) return;
    var meta = $('ar-users-meta');
    if (meta) meta.textContent = _users.length + ' most recent';

    if (!_users.length) {
      wrap.innerHTML = '<div class="ar-stub">No user docs returned. Older users may pre-date createdAt; Firestore order falls back to doc order.</div>';
      return;
    }

    var rows = _users.slice(0, 30).map(function (u) {
      var qr = u.quizResult || {};
      var provider = '—';
      /* providerData isn't on the user doc, but emailVerified hints at email/password vs Google */
      if (u.providerId) provider = u.providerId;
      else if (u.signInMethod) provider = u.signInMethod;
      var emailDisp = u.email ? u.email : (u.displayName || u.uid || '—');
      var nameDisp = u.displayName || (u.email ? u.email.split('@')[0] : (u.uid || '—'));
      var created = u.createdAt;
      var adminTag = u.isAdmin === true
        ? '<span class="ar-tag is-admin">admin</span>'
        : (u.emailVerified === false ? '<span class="ar-tag" style="color:var(--gold)">unverified</span>' : '<span class="ar-tag is-user">user</span>');
      return '<tr>' +
        '<td>' + txt(nameDisp) + '</td>' +
        '<td class="mono trunc">' + txt(emailDisp) + '</td>' +
        '<td>' + (qr.name ? txt(qr.name) : '<span class="dim">—</span>') + '</td>' +
        '<td>' + adminTag + '</td>' +
        '<td class="dim">' + (created ? fmtTime(created) : '—') + '</td>' +
        '</tr>';
    }).join('');
    wrap.innerHTML = '<table class="ar-table"><thead><tr>' +
      '<th>Name</th><th>Email / id</th><th>Aesthetic</th><th>Role</th><th>Created</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ── 3. Guest funnel ──────────────────────────────────────── */
  function _renderGuestFunnel(ev) {
    var wrap = $('ar-guest-funnel');
    if (!wrap) return;
    var guestSessions = {};
    var counts = { page_view: 0, aesthetic_view: 0, community_view: 0, quiz_start: 0,
                   signup_modal_open: 0, modal_action_taken: 0 };
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (!e.isGuest) continue;
      if (e.sessionId) guestSessions[e.sessionId] = 1;
      if (counts.hasOwnProperty(e.type)) counts[e.type]++;
      if (e.type === 'signup_modal_action' && (e.modalAction === 'create' || e.modalAction === 'signin')) {
        counts.modal_action_taken++;
      }
    }
    var sessions = Object.keys(guestSessions).length;
    var top = sessions || 1;
    var steps = [
      { label: 'Guest sessions',           n: sessions },
      { label: 'Aesthetic / style views',  n: counts.aesthetic_view },
      { label: 'Community views',          n: counts.community_view },
      { label: 'Quiz starts',              n: counts.quiz_start },
      { label: 'Signup modal opens',       n: counts.signup_modal_open },
      { label: 'Signup / sign-in action',  n: counts.modal_action_taken }
    ];
    wrap.innerHTML = steps.map(function (s) {
      var pct = top > 0 ? Math.round((s.n / top) * 100) : 0;
      return '<div class="ar-funnel-step">' +
        '<div class="ar-funnel-label">' + txt(s.label) + '</div>' +
        '<div class="ar-funnel-bar"><div class="ar-funnel-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="ar-funnel-count">' + fmtNum(s.n) + '</div>' +
        '<div class="ar-funnel-pct">' + pct + '%</div>' +
      '</div>';
    }).join('');
  }

  /* ── 4. Shopping ──────────────────────────────────────────── */
  function _renderShopping(ev) {
    var retailers = {}, aesthetics = {}, sources = {};
    var shopEvents = [];
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.type !== 'shop_click' && e.type !== 'shop_gate_open') continue;
      shopEvents.push(e);
      if (e.retailer) retailers[e.retailer]   = (retailers[e.retailer] || 0) + 1;
      if (e.aesthetic) aesthetics[e.aesthetic] = (aesthetics[e.aesthetic] || 0) + 1;
      if (e.source)    sources[e.source]       = (sources[e.source] || 0) + 1;
    }
    _renderBars($('ar-top-retailers'), retailers, 10);
    _renderBars($('ar-top-aesthetics-shop'), aesthetics, 10, function (k) { return COMM_LABELS[k] || k; });

    var meta = $('ar-shop-meta');
    if (meta) meta.textContent = shopEvents.length + ' total · showing 30 most recent';

    var rows = shopEvents.slice(0, 30).map(function (e) {
      var typeTag = e.type === 'shop_gate_open'
        ? '<span class="ar-tag is-guest">gate</span>'
        : (e.isGuest ? '<span class="ar-tag is-guest">guest</span>' : '<span class="ar-tag is-user">user</span>');
      return '<tr>' +
        '<td class="dim">' + fmtTime(e.ts) + '</td>' +
        '<td>' + typeTag + '</td>' +
        '<td>' + txt(COMM_LABELS[e.aesthetic] || e.aesthetic || '—') + '</td>' +
        '<td>' + txt(e.retailer || '—') + '</td>' +
        '<td class="mono dim">' + txt(e.source || '—') + '</td>' +
        '<td class="mono dim">' + txt(e.inApp || e.browser || '—') + '</td>' +
        '</tr>';
    }).join('');
    var table = $('ar-shop-table');
    if (table) {
      table.innerHTML = shopEvents.length
        ? '<table class="ar-table"><thead><tr><th>When</th><th>Type</th><th>Aesthetic</th><th>Retailer</th><th>Source</th><th>Browser</th></tr></thead><tbody>' + rows + '</tbody></table>'
        : '<div class="ar-stub">No shop events in this range yet. Try opening a retailer link to generate test data.</div>';
    }
  }

  /* ── 5. Signup modal ──────────────────────────────────────── */
  function _renderModal(ev) {
    var reasons = {}, actions = {};
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.type === 'signup_modal_open' && e.modalReason) {
        reasons[e.modalReason] = (reasons[e.modalReason] || 0) + 1;
      }
      if (e.type === 'signup_modal_action' && e.modalAction) {
        actions[e.modalAction] = (actions[e.modalAction] || 0) + 1;
      }
    }
    _renderBars($('ar-modal-reasons'), reasons, 8);
    _renderBars($('ar-modal-actions'), actions, 8);
  }

  /* ── 6. Device / browser ──────────────────────────────────── */
  function _renderDeviceBrowser(ev) {
    var device = {}, browser = {}, lang = {}, os = {};
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.device)  device[e.device]   = (device[e.device]   || 0) + 1;
      var b = e.inApp ? ('inapp · ' + e.inApp) : (e.browser || 'unknown');
      browser[b] = (browser[b] || 0) + 1;
      if (e.lang) lang[e.lang] = (lang[e.lang] || 0) + 1;
      if (e.os)   os[e.os]     = (os[e.os]     || 0) + 1;
    }
    _renderBars($('ar-device-breakdown'), device, 6);
    _renderBars($('ar-browser-breakdown'), browser, 8);
    _renderBars($('ar-lang-breakdown'), lang, 6);
    _renderBars($('ar-os-breakdown'), os, 6);
  }

  /* ── 7. Aesthetics ────────────────────────────────────────── */
  function _renderAesthetics(ev) {
    var rows = {};
    for (var c = 0; c < COMM_GROUPS.length; c++) rows[COMM_GROUPS[c]] = { views: 0, shop: 0, saves: 0, posts: 0 };
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (!e.aesthetic || !rows[e.aesthetic]) continue;
      if (e.type === 'aesthetic_view') rows[e.aesthetic].views++;
      if (e.type === 'shop_click')      rows[e.aesthetic].shop++;
      if (e.type === 'save_success')    rows[e.aesthetic].saves++;
      if (e.type === 'community_post')  rows[e.aesthetic].posts++;
    }
    var list = Object.keys(rows).map(function (k) { return Object.assign({ id: k }, rows[k]); })
      .sort(function (a, b) { return (b.views + b.shop + b.saves + b.posts) - (a.views + a.shop + a.saves + a.posts); });
    var html = '<table class="ar-table"><thead><tr><th>Aesthetic</th><th class="num">Views</th><th class="num">Shop</th><th class="num">Saves</th><th class="num">Posts</th></tr></thead><tbody>' +
      list.map(function (r) {
        return '<tr>' +
          '<td>' + txt(COMM_LABELS[r.id] || r.id) + '</td>' +
          '<td class="num">' + fmtNum(r.views) + '</td>' +
          '<td class="num">' + fmtNum(r.shop)  + '</td>' +
          '<td class="num">' + fmtNum(r.saves) + '</td>' +
          '<td class="num">' + fmtNum(r.posts) + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table>';
    var el = $('ar-aesthetic-table'); if (el) el.innerHTML = html;
  }

  /* ── 8. Quiz ──────────────────────────────────────────────── */
  function _renderQuiz(ev) {
    var start = 0, complete = 0, abandon = 0;
    var results = {};
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.type === 'quiz_start')     start++;
      if (e.type === 'quiz_complete')  {
        complete++;
        if (e.quizResultId) results[e.quizResultId] = (results[e.quizResultId] || 0) + 1;
      }
      if (e.type === 'quiz_abandoned') abandon++;
    }
    var top = start || 1;
    var steps = [
      { label: 'Quiz started',   n: start },
      { label: 'Quiz completed', n: complete },
      { label: 'Quiz abandoned (Q-level)', n: abandon }
    ];
    var funnel = $('ar-quiz-funnel');
    if (funnel) {
      funnel.innerHTML = steps.map(function (s) {
        var pct = top > 0 ? Math.round((s.n / top) * 100) : 0;
        return '<div class="ar-funnel-step">' +
          '<div class="ar-funnel-label">' + txt(s.label) + '</div>' +
          '<div class="ar-funnel-bar"><div class="ar-funnel-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="ar-funnel-count">' + fmtNum(s.n) + '</div>' +
          '<div class="ar-funnel-pct">' + pct + '%</div>' +
        '</div>';
      }).join('');
    }
    _renderBars($('ar-quiz-results'), results, 10, function (k) { return COMM_LABELS[k] || k; });
  }

  /* ── 9. Community ─────────────────────────────────────────── */
  function _renderCommunity(ev) {
    var per = {}, actions = { community_view: 0, community_post: 0, community_comment: 0, community_reaction: 0 };
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (actions.hasOwnProperty(e.type)) {
        actions[e.type]++;
        if (e.aesthetic) per[e.aesthetic] = (per[e.aesthetic] || 0) + 1;
      }
    }
    _renderBars($('ar-community-activity'), per, 10, function (k) { return COMM_LABELS[k] || k; });
    _renderBars($('ar-community-actions'), {
      'Views':     actions.community_view,
      'Posts':     actions.community_post,
      'Comments':  actions.community_comment,
      'Reactions': actions.community_reaction
    }, 6);
  }

  /* ── 10. Moodboard ────────────────────────────────────────── */
  function _renderMoodboard(ev) {
    var saveBreak = { 'Save (success)': 0, 'Save click': 0, 'Save gate (guest)': 0 };
    var perAesthetic = {};
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.type === 'save_success')   { saveBreak['Save (success)']++;  if (e.aesthetic) perAesthetic[e.aesthetic] = (perAesthetic[e.aesthetic] || 0) + 1; }
      if (e.type === 'save_click')     { saveBreak['Save click']++; }
      if (e.type === 'save_gate_open') { saveBreak['Save gate (guest)']++; }
    }
    _renderBars($('ar-save-breakdown'), saveBreak, 6);
    _renderBars($('ar-save-aesthetics'), perAesthetic, 10, function (k) { return COMM_LABELS[k] || k; });
  }

  /* ── 11. Errors ───────────────────────────────────────────── */
  function _renderErrors(ev) {
    var errors = ev.filter(function (e) { return e.type === 'error'; });
    var el = $('ar-errors-table');
    if (!el) return;
    if (!errors.length) {
      el.innerHTML = '<div class="ar-stub" style="text-align:left">No errors logged for this range. Wire <code>Aura.track(\'error\', { metadata: { code, message } })</code> at known failure points to populate this view.</div>';
      return;
    }
    var rows = errors.slice(0, 30).map(function (e) {
      var meta = e.metadata || {};
      return '<tr>' +
        '<td class="dim">' + fmtTime(e.ts) + '</td>' +
        '<td class="mono">' + txt(meta.code || '—') + '</td>' +
        '<td class="trunc">' + txt(meta.message || '—') + '</td>' +
        '<td class="dim">' + txt(e.path || '—') + '</td>' +
      '</tr>';
    }).join('');
    el.innerHTML = '<table class="ar-table"><thead><tr><th>When</th><th>Code</th><th>Message</th><th>Path</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ── Shared bar-list renderer ─────────────────────────────── */
  function _renderBars(el, dict, limit, labeller) {
    if (!el) return;
    labeller = labeller || function (k) { return k; };
    var entries = Object.keys(dict).map(function (k) { return [k, dict[k]]; })
      .filter(function (x) { return x[1] > 0; })
      .sort(function (a, b) { return b[1] - a[1] });
    var max = entries.length ? entries[0][1] : 1;
    if (limit) entries = entries.slice(0, limit);
    if (!entries.length) {
      el.innerHTML = '<div class="ar-stub" style="text-align:left">No data yet for this range.</div>';
      return;
    }
    el.innerHTML = entries.map(function (e) {
      var pct = max > 0 ? Math.round((e[1] / max) * 100) : 0;
      return '<div class="ar-bar-row">' +
        '<div class="ar-bar-label">' + txt(labeller(e[0])) + '</div>' +
        '<div class="ar-bar-track"><div class="ar-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="ar-bar-count">' + fmtNum(e[1]) + '</div>' +
      '</div>';
    }).join('');
  }

  /* ── CSV export ───────────────────────────────────────────── */
  function _exportCsv() {
    if (!_events.length) {
      alert('No events loaded to export.');
      return;
    }
    var keys = ['ts','type','isGuest','uid','email','isAdmin','sessionId','aesthetic','outfitIndex','category','retailer','shopUrl','source','modalReason','modalAction','quizResultId','quizQuestionIndex','path','referrer','lang','rtl','device','browser','os','inApp','test'];
    var esc = function (v) {
      if (v == null) return '';
      var s = String(v);
      if (/[",\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    var rows = [keys.join(',')];
    for (var i = 0; i < _events.length; i++) {
      var e = _events[i];
      var row = keys.map(function (k) {
        if (k === 'ts') return e.ts && e.ts.toDate ? e.ts.toDate().toISOString() : '';
        return esc(e[k]);
      });
      rows.push(row.join(','));
    }
    var blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aura-analytics-' + new Date().toISOString().slice(0,10) + '.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 0);
  }

  /* ── Delete test events ───────────────────────────────────── */
  function _deleteTestEvents() {
    var tests = _events.filter(function (e) { return e.test === true; });
    if (!tests.length) { alert('No test events to delete.'); return; }
    if (!confirm('Delete ' + tests.length + ' test event(s)? This cannot be undone.')) return;
    var batch = _db.batch();
    tests.forEach(function (e) {
      batch.delete(_db.collection('analytics_events').doc(e.id));
    });
    batch.commit().then(function () {
      alert('Deleted ' + tests.length + ' test event(s).');
      _loadAll();
    }).catch(function (err) {
      alert('Delete failed: ' + (err && err.message || 'unknown'));
    });
  }

  /* ── Go ───────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    _boot();
  }
})();
