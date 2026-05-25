/* ─────────────────────────────────────────────────────────────────────────────
   AURA GLOSSY — MAINTENANCE GATE
   ─────────────────────────────────────────────────────────────────────────────
   Synchronous head-script that replaces every public page with a premium
   fullscreen maintenance experience BEFORE any other HTML/CSS/JS parses,
   so there is zero flash of the underlying site.

   TO DISABLE MAINTENANCE MODE:
     1) Set  MAINTENANCE_MODE = false  below.
     2) Bump  ?v=N  on the  <script src="js/maintenance.js?v=N">  include
        in every HTML file (Netlify caches /*.js immutable for 1 year).
     3) Deploy.

   HIDDEN ADMIN BYPASS:
     • Append  ?admin=true  to any URL → maintenance is skipped for this
       browser and the bypass is persisted in localStorage so the admin
       can navigate freely without re-adding the parameter.
     • Append  ?admin=false  to clear the bypass and re-enter maintenance.

   This gate does not touch Firebase, Firestore, Auth, Netlify config,
   or any other code. The site stays technically online — just visually
   sealed behind the maintenance screen.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var MAINTENANCE_MODE = true;

  /* ── Firebase config — duplicated from js/firebase.js because that
        module never loads while the maintenance gate is active. Used
        ONLY by the admin-entry modal below; the config is already
        public (Firebase web SDK design), security comes from rules
        and the users/{uid}.isAdmin server-trusted flag. ─────────── */
  var FB_CONFIG = {
    apiKey:            "AIzaSyAO0RDi_9YaSm-kpTpB7MHVyDkcaveUqlk",
    authDomain:        "auraglossy.com",
    projectId:         "aura-fashion-fc2d4",
    storageBucket:     "aura-fashion-fc2d4.firebasestorage.app",
    messagingSenderId: "246808677665",
    appId:             "1:246808677665:web:4ef423fef9e63b9989c260"
  };
  var FB_SDK_BASE = 'https://www.gstatic.com/firebasejs/9.22.0/';
  var BYPASS_KEY_PERSIST  = 'aura_admin_bypass';
  /* Canonical owner-admin email. Pre-fills the form on first open so
     the owner doesn't have to retype it every time. The actual admin
     grant is the Firestore users/{uid}.isAdmin === true field — this
     constant is UX only, never trusted on its own. */
  var ADMIN_DEFAULT_EMAIL  = 'auraglossy.support@gmail.com';
  /* Stores the email that last completed a successful admin sign-in,
     so subsequent maintenance-page visits on the same browser pre-fill
     with whatever the admin used (might be a different admin email
     than the default). Reset by clearing browser storage. */
  var REMEMBERED_EMAIL_KEY = 'aura_admin_last_email';

  /* ── Admin bypass (URL flag, persisted in localStorage) ───────────────────
        ?admin=true   →  set localStorage.aura_admin_bypass = 'true'  + bypass
        ?admin=false  →  remove localStorage.aura_admin_bypass        + FORCE
                         maintenance for this request, regardless of
                         any stale bypass value already in storage
        no param      →  consult localStorage; accept 'true' (current) and
                         '1' (legacy from prior builds) as bypass-active

        Matching is case-insensitive and accepts common boolean aliases
        (true/1/yes/on  vs  false/0/no/off) so a mis-cased URL like
        ?admin=False  still reliably clears the bypass.
        ───────────────────────────────────────────────────────────── */
  var BYPASS_KEY = 'aura_admin_bypass';
  var bypass = false;
  try {
    var params = new URLSearchParams(window.location.search);
    var adminRaw = params.get('admin');
    var adminParam = (adminRaw == null) ? null : ('' + adminRaw).toLowerCase().trim();

    var isTrue  = adminParam !== null && (adminParam === 'true'  || adminParam === '1' || adminParam === 'yes' || adminParam === 'on');
    var isFalse = adminParam !== null && (adminParam === 'false' || adminParam === '0' || adminParam === 'no'  || adminParam === 'off');

    if (isTrue) {
      try { localStorage.setItem(BYPASS_KEY, 'true'); } catch (e) {}
      bypass = true;
    } else if (isFalse) {
      /* Force-clear the bypass AND force maintenance for THIS request,
         even if some stale value somehow still sits in localStorage. */
      try { localStorage.removeItem(BYPASS_KEY); } catch (e) {}
      bypass = false;
    } else {
      try {
        var stored = localStorage.getItem(BYPASS_KEY);
        bypass = (stored === 'true' || stored === '1');
      } catch (e) { bypass = false; }
    }
  } catch (e) {
    /* malformed URL or storage blocked — fail-closed to maintenance */
    bypass = false;
  }

  if (!MAINTENANCE_MODE || bypass) return;

  /* ─── Maintenance head ──────────────────────────────────────────────────
     Note: we set documentElement.innerHTML (not document.write), then
     call window.stop() to abort the original HTML parser. This is the
     only reliable way to keep the rest of the original source from
     continuing to render after a synchronous head-script runs. */
  var headHtml =
      '<meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    + '<meta name="theme-color" content="#0d0905">'
    + '<meta name="robots" content="noindex, nofollow">'
    + '<meta name="description" content="Aura Glossy is currently under maintenance. We will be back shortly.">'
    + '<title>Aura Glossy — Under Maintenance</title>'
    + '<link rel="icon" type="image/svg+xml" href="/favicon.svg">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com">'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">'
    + '<style id="aura-maintenance-style">'
    + '  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}'
    + '  html,body{height:100%;width:100%;overflow:hidden;background:#0d0905;color:#f0e5d6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}'
    + '  body{font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-weight:300;letter-spacing:.01em;line-height:1.55;position:relative;display:flex;align-items:center;justify-content:center;padding:48px 24px;animation:auraFadeIn 1.6s ease-out both}'
    + '  body::before{'
    +    'content:"";position:fixed;inset:0;pointer-events:none;z-index:0;'
    +    'background:'
    +      'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(60,32,22,.65) 0%, rgba(30,16,10,.25) 35%, transparent 70%),'
    +      'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(199,154,133,.05) 0%, transparent 60%);'
    +    'animation:auraGlowPulse 9s ease-in-out infinite alternate;'
    + '  }'
    + '  body::after{'
    +    'content:"";position:fixed;inset:0;pointer-events:none;z-index:1;mix-blend-mode:overlay;opacity:.18;'
    +    'background-image:url("data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.32 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");'
    +    'background-size:200px 200px;'
    + '  }'
    + '  main.aura-maint{position:relative;z-index:2;width:100%;max-width:560px;text-align:center;display:flex;flex-direction:column;align-items:center}'
    + '  .aura-logo{display:flex;align-items:center;justify-content:center;gap:18px;color:#f0e5d6;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-weight:500;text-transform:uppercase;font-size:11px;letter-spacing:.55em;opacity:.92;animation:auraRise 1.8s .15s cubic-bezier(.2,.7,.2,1) both}'
    + '  .aura-logo .rule{flex:0 0 44px;height:1px;background:linear-gradient(90deg,transparent,rgba(199,154,133,.7),transparent)}'
    + '  .aura-logo .mark{display:inline-flex;align-items:baseline;gap:.55em;text-indent:.55em}'
    + '  .aura-logo .star{color:#c79a85;font-size:13px;letter-spacing:0;text-indent:0;transform:translateY(-1px);animation:auraTwinkle 4.4s ease-in-out infinite}'
    + '  h1.aura-maint{margin-top:34px;font-family:"Playfair Display","Times New Roman",serif;font-weight:400;font-size:clamp(32px,5.2vw,52px);line-height:1.18;letter-spacing:-.005em;color:#f5ede3;animation:auraRise 1.9s .35s cubic-bezier(.2,.7,.2,1) both}'
    + '  h1.aura-maint em{font-style:italic;font-weight:400;background:linear-gradient(180deg,#f5ede3 0%,#e7c8b5 100%);-webkit-background-clip:text;background-clip:text;color:transparent}'
    + '  p.aura-sub{margin-top:22px;max-width:38ch;font-size:clamp(14px,1.6vw,16px);line-height:1.7;letter-spacing:.01em;color:#b8a99a;animation:auraRise 2.0s .55s cubic-bezier(.2,.7,.2,1) both}'
    + '  .aura-shimmer{position:relative;margin-top:44px;width:140px;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(199,154,133,.35) 50%,transparent 100%);animation:auraRise 2.1s .75s cubic-bezier(.2,.7,.2,1) both}'
    + '  .aura-shimmer::before{content:"";position:absolute;top:50%;left:0;width:6px;height:6px;border-radius:50%;background:#e7c8b5;box-shadow:0 0 12px rgba(231,200,181,.65),0 0 24px rgba(231,200,181,.28);transform:translate(0,-50%);animation:auraTrail 4.8s ease-in-out infinite}'
    + '  p.aura-patience{margin-top:34px;font-family:"Playfair Display","Times New Roman",serif;font-style:italic;font-weight:400;font-size:clamp(12px,1.3vw,13.5px);letter-spacing:.04em;color:#8a7a6c;opacity:.9;animation:auraRise 2.2s .95s cubic-bezier(.2,.7,.2,1) both}'
    + '  .aura-vignette{position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse 110% 90% at 50% 50%,transparent 55%,rgba(0,0,0,.55) 100%)}'
    + '  @keyframes auraFadeIn{from{opacity:0}to{opacity:1}}'
    + '  @keyframes auraRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}'
    + '  @keyframes auraGlowPulse{0%{opacity:.85}100%{opacity:1}}'
    + '  @keyframes auraTwinkle{0%,100%{opacity:.55}50%{opacity:1}}'
    + '  @keyframes auraTrail{0%{left:0;opacity:0}15%{opacity:1}50%{left:calc(100% - 6px);opacity:1}65%{opacity:1}100%{left:0;opacity:0}}'
    + '  @media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important}}'
    + '  @media (max-width:520px){body{padding:32px 22px}.aura-logo{gap:12px;font-size:10px;letter-spacing:.45em}.aura-logo .rule{flex:0 0 30px}h1.aura-maint{margin-top:28px}p.aura-sub{margin-top:18px}.aura-shimmer{margin-top:36px;width:110px}p.aura-patience{margin-top:28px}}'
    /* ── Admin entry trigger (premium glass pill, fixed at bottom centre)
          Subtle but findable. z-index:50 places it above the vignette
          (z-index:1) so it doesn't get dimmed by the radial overlay,
          but well below the modal overlay (z-index:100). The auraAdminRise
          keyframe preserves translateX(-50%) centering through the entrance. */
    + '  .aura-admin-trigger{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:50;display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:rgba(20,12,8,.58);border:1px solid rgba(199,154,133,.28);border-radius:999px;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:10px;font-weight:500;letter-spacing:.32em;text-transform:uppercase;color:rgba(231,200,181,.78);cursor:pointer;text-decoration:none;transition:color .32s ease,background .32s ease,border-color .32s ease,letter-spacing .32s ease;animation:auraAdminRise 2.4s 1.2s cubic-bezier(.2,.7,.2,1) both;-webkit-tap-highlight-color:transparent}'
    + '  .aura-admin-trigger:hover,.aura-admin-trigger:focus-visible{color:#f5ede3;background:rgba(28,18,12,.85);border-color:rgba(199,154,133,.52);letter-spacing:.36em;outline:none}'
    + '  .aura-admin-trigger .aura-admin-arrow{display:inline-block;transition:transform .32s ease}'
    + '  .aura-admin-trigger:hover .aura-admin-arrow,.aura-admin-trigger:focus-visible .aura-admin-arrow{transform:translateX(3px)}'
    + '  @keyframes auraAdminRise{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}'
    /* ── Admin login modal ── */
    + '  .aura-admin-overlay{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(8,5,3,.74);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0;transition:opacity .32s ease}'
    + '  .aura-admin-overlay.is-visible{display:flex;opacity:1}'
    + '  .aura-admin-card{position:relative;width:100%;max-width:360px;background:linear-gradient(180deg,rgba(28,18,12,.97),rgba(20,12,8,.97));border:1px solid rgba(199,154,133,.18);border-radius:4px;padding:36px 32px 30px;box-shadow:0 22px 60px rgba(0,0,0,.6),0 0 80px rgba(199,154,133,.05);transform:translateY(10px);opacity:0;transition:transform .42s cubic-bezier(.2,.7,.2,1),opacity .42s ease}'
    + '  .aura-admin-overlay.is-visible .aura-admin-card{transform:translateY(0);opacity:1}'
    + '  .aura-admin-close{position:absolute;top:10px;right:10px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:rgba(240,229,214,.5);font-size:18px;font-family:inherit;cursor:pointer;border-radius:50%;transition:color .24s ease,background .24s ease}'
    + '  .aura-admin-close:hover,.aura-admin-close:focus-visible{color:rgba(240,229,214,.95);background:rgba(199,154,133,.08);outline:none}'
    + '  .aura-admin-eyebrow{font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:9px;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:#c79a85;margin-bottom:10px}'
    + '  .aura-admin-title{font-family:"Playfair Display","Times New Roman",serif;font-weight:400;font-size:24px;line-height:1.2;color:#f5ede3;margin:0 0 8px}'
    + '  .aura-admin-sub{font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:12px;line-height:1.55;color:#8a7a6c;margin:0 0 22px}'
    + '  .aura-admin-field{display:block;margin-bottom:14px}'
    + '  .aura-admin-label{display:block;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:9px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:#8a7a6c;margin-bottom:6px}'
    + '  .aura-admin-input{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(199,154,133,.18);border-radius:2px;padding:13px 14px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:16px;color:#f0e5d6;outline:none;transition:border-color .24s ease,background .24s ease;-webkit-appearance:none;appearance:none}'
    + '  .aura-admin-input::placeholder{color:rgba(138,122,108,.55)}'
    + '  .aura-admin-input:focus{border-color:rgba(199,154,133,.55);background:rgba(255,255,255,.06)}'
    + '  .aura-admin-submit{width:100%;margin-top:16px;padding:13px 16px;background:linear-gradient(180deg,#c79a85 0%,#b08770 100%);border:none;border-radius:2px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#1a0e08;cursor:pointer;transition:opacity .24s ease}'
    + '  .aura-admin-submit:hover,.aura-admin-submit:focus-visible{opacity:.92;outline:none}'
    + '  .aura-admin-submit:disabled{opacity:.45;cursor:not-allowed}'
    + '  .aura-admin-hint{margin-top:14px;min-height:18px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:11.5px;line-height:1.5;text-align:center;color:#8a7a6c;transition:color .24s ease}'
    + '  .aura-admin-hint.is-error{color:#d49a8c}'
    + '  .aura-admin-hint.is-loading{color:#c79a85}'
    + '  @media (max-width:520px){.aura-admin-card{padding:30px 22px 24px}.aura-admin-title{font-size:22px}.aura-admin-trigger{bottom:20px;padding:14px 22px;letter-spacing:.28em}}'
    + '</style>';

  var bodyHtml =
      '<div class="aura-vignette" aria-hidden="true"></div>'
    + '<main class="aura-maint" role="main">'
    +   '<div class="aura-logo" aria-label="Aura Glossy">'
    +     '<span class="rule" aria-hidden="true"></span>'
    +     '<span class="mark"><span class="star" aria-hidden="true">✦</span>Aura Glossy</span>'
    +     '<span class="rule" aria-hidden="true"></span>'
    +   '</div>'
    +   '<h1 class="aura-maint">We’re currently under <em>maintenance</em>.</h1>'
    +   '<p class="aura-sub">We’re making Aura even better and will be back shortly.</p>'
    +   '<div class="aura-shimmer" aria-hidden="true"></div>'
    +   '<p class="aura-patience">Thank you for your patience.</p>'
    +   '<button type="button" class="aura-admin-trigger" id="aura-admin-trigger" aria-haspopup="dialog" aria-controls="aura-admin-overlay">'
    +     '<span>Admin enter</span>'
    +     '<span class="aura-admin-arrow" aria-hidden="true">→</span>'
    +   '</button>'
    + '</main>'
    + '<div class="aura-admin-overlay" id="aura-admin-overlay" role="dialog" aria-modal="true" aria-labelledby="aura-admin-title" aria-hidden="true">'
    +   '<div class="aura-admin-card">'
    +     '<button type="button" class="aura-admin-close" id="aura-admin-close" aria-label="Close">✕</button>'
    +     '<div class="aura-admin-eyebrow">Aura Glossy</div>'
    +     '<h2 class="aura-admin-title" id="aura-admin-title">Admin access</h2>'
    +     '<p class="aura-admin-sub">Sign in with your admin account to continue while the site is under maintenance.</p>'
    +     '<form id="aura-admin-form" autocomplete="off" novalidate>'
    +       '<div class="aura-admin-field">'
    +         '<label class="aura-admin-label" for="aura-admin-email">Email</label>'
    +         '<input class="aura-admin-input" type="email" id="aura-admin-email" name="email" autocomplete="email" inputmode="email" spellcheck="false" autocapitalize="off" required>'
    +       '</div>'
    +       '<div class="aura-admin-field">'
    +         '<label class="aura-admin-label" for="aura-admin-password">Password</label>'
    +         '<input class="aura-admin-input" type="password" id="aura-admin-password" name="password" autocomplete="current-password" required>'
    +       '</div>'
    +       '<button type="submit" class="aura-admin-submit" id="aura-admin-submit">Enter</button>'
    +       '<p class="aura-admin-hint" id="aura-admin-hint" aria-live="polite" aria-atomic="true"></p>'
    +     '</form>'
    +   '</div>'
    + '</div>'
    + '<noscript><p style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0d0905;color:#f0e5d6;font-family:Georgia,serif;font-style:italic;padding:32px;text-align:center;">Aura Glossy is currently under maintenance. We will be back shortly.</p></noscript>';

  /* ── Stop the parser, then surgically replace head + body ──
        window.stop() aborts any pending source parsing, so the
        remainder of the original HTML never renders. Setting
        documentElement.innerHTML wipes the existing head/body
        (which were mid-construction) and installs the maintenance
        content in one synchronous step — no FOUC, no flash. */
  try { window.stop(); } catch (e) {}

  try {
    document.documentElement.innerHTML = '<head>' + headHtml + '</head><body>' + bodyHtml + '</body>';
  } catch (e) {
    /* Last-resort fallback: build new head + body nodes and swap them. */
    try {
      var newHead = document.createElement('head');
      newHead.innerHTML = headHtml;
      var newBody = document.createElement('body');
      newBody.innerHTML = bodyHtml;
      var oldHead = document.head;
      var oldBody = document.body;
      if (oldHead && oldHead.parentNode) oldHead.parentNode.replaceChild(newHead, oldHead);
      else document.documentElement.appendChild(newHead);
      if (oldBody && oldBody.parentNode) oldBody.parentNode.replaceChild(newBody, oldBody);
      else document.documentElement.appendChild(newBody);
    } catch (e2) {
      /* Truly last-ditch: at least swap body innerHTML so something shows. */
      try {
        document.documentElement.innerHTML = '<head><title>Aura Glossy — Under Maintenance</title></head><body style="background:#0d0905;color:#f0e5d6;font-family:Georgia,serif;font-style:italic;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:32px;">Aura Glossy is currently under maintenance. We will be back shortly.</body>';
      } catch (e3) { /* give up */ }
    }
  }

  /* Belt-and-suspenders: stop again in case anything is still pending. */
  try { window.stop(); } catch (e) {}

  /* ─────────────────────────────────────────────────────────────────
     ADMIN ENTRY — Firebase-Auth-gated bypass

     Flow:
       1. User taps the "Admin enter →" trigger at the bottom of the
          maintenance page. Modal opens with email + password.
       2. On submit we dynamically load Firebase compat SDK (auth +
          firestore) from the same CSP-allowed gstatic CDN the rest of
          the site uses. Errors here surface as "Admin login
          unavailable. Try again." — not a frozen screen.
       3. signInWithEmailAndPassword. If creds are wrong, soft error.
       4. After successful sign-in we read users/{uid} from Firestore
          and check the server-trusted isAdmin flag. Email is never
          compared — the Firestore field is the only source of truth.
       5. If isAdmin !== true: sign the user out (so their session
          doesn't leak into a non-admin maintenance bypass) and show
          a soft error. The modal stays open so they can retry.
       6. If isAdmin === true: set localStorage.aura_admin_bypass = 'true'
          (the SAME flag the existing ?admin=true URL trick uses) and
          reload. The maintenance gate then short-circuits on next load
          and the site renders normally — the user's auth session
          persists via Firebase's LOCAL persistence, so they keep all
          admin privileges throughout the rest of the site.

     Security notes:
     - The bypass flag itself is purely UX (localStorage isn't a
       trust boundary — anyone in DevTools could set it). The point
       of this modal isn't to add NEW security; it's to give admins
       a polished credential-based entrance without disclosing the
       ?admin=true URL trick. Firestore rules remain authoritative
       for what an admin can actually do once inside.
     - We require the user to RE-authenticate even if Firebase has
       a cached session for them. This blocks the "someone walks up
       to my unlocked phone and taps a button" attack path.
     ───────────────────────────────────────────────────────────────── */
  _wireAdminEntry();

  /* Email memory helpers — separate from _wireAdminEntry so the
     hoisting order works regardless of where each is called. */
  function _getRememberedEmail() {
    try {
      var v = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (v && typeof v === 'string' && /\S+@\S+\.\S+/.test(v)) return v;
    } catch (e) {}
    return ADMIN_DEFAULT_EMAIL;
  }
  function _rememberEmail(email) {
    try {
      if (email && typeof email === 'string' && /\S+@\S+\.\S+/.test(email)) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      }
    } catch (e) {}
  }

  function _wireAdminEntry() {
    var trigger  = document.getElementById('aura-admin-trigger');
    var overlay  = document.getElementById('aura-admin-overlay');
    var closeBtn = document.getElementById('aura-admin-close');
    var form     = document.getElementById('aura-admin-form');
    var emailEl  = document.getElementById('aura-admin-email');
    var passEl   = document.getElementById('aura-admin-password');
    var submitEl = document.getElementById('aura-admin-submit');
    var hintEl   = document.getElementById('aura-admin-hint');
    if (!trigger || !overlay || !form) return;

    var _busy = false;
    var _prevFocus = null;

    function setHint(msg, state) {
      if (!hintEl) return;
      hintEl.textContent = msg || '';
      hintEl.classList.remove('is-error');
      hintEl.classList.remove('is-loading');
      if (state === 'error')   hintEl.classList.add('is-error');
      if (state === 'loading') hintEl.classList.add('is-loading');
    }
    function setBusy(b) {
      _busy = !!b;
      if (submitEl) {
        submitEl.disabled = _busy;
        submitEl.textContent = _busy ? 'Verifying…' : 'Enter';
      }
    }
    function openPanel() {
      _prevFocus = document.activeElement;
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
      try { document.body.style.overflow = 'hidden'; } catch (e) {}
      setHint('');
      setBusy(false);
      /* Pre-fill the email field with the last admin email used on this
         device, or the canonical default if none. Editable — a second
         admin can still sign in by replacing the value. */
      if (emailEl && !emailEl.value) {
        emailEl.value = _getRememberedEmail();
      }
      /* Slight delay so the entrance transition doesn't fight focus.
         If email is pre-filled (the usual case for the owner), drop the
         cursor straight into the password field; otherwise focus email. */
      setTimeout(function () {
        try {
          if (emailEl && emailEl.value && passEl) {
            passEl.focus();
          } else if (emailEl) {
            emailEl.focus();
          }
        } catch (e) {}
      }, 80);
    }
    function closePanel() {
      if (_busy) return; /* don't close mid-auth */
      overlay.classList.remove('is-visible');
      overlay.setAttribute('aria-hidden', 'true');
      try { document.body.style.overflow = ''; } catch (e) {}
      if (_prevFocus && typeof _prevFocus.focus === 'function') {
        try { _prevFocus.focus(); } catch (e) {}
      }
    }

    trigger.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePanel();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-visible')) closePanel();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (_busy) return;
      var email = (emailEl.value || '').trim();
      var pass  = passEl.value || '';
      if (!email || !pass) {
        setHint('Enter your email and password.', 'error');
        return;
      }
      setBusy(true);
      setHint('Verifying…', 'loading');

      _loadFirebase().then(function () {
        var auth = firebase.auth();
        var db   = firebase.firestore();
        return auth.signInWithEmailAndPassword(email, pass).then(function (cred) {
          var uid = cred && cred.user && cred.user.uid;
          if (!uid) throw new Error('no_uid');
          return db.collection('users').doc(uid).get().then(function (snap) {
            var data = snap.exists ? snap.data() : null;
            var isAdmin = !!(data && data.isAdmin === true);
            if (!isAdmin) {
              /* Credentials valid but NOT admin. Sign out so the
                 non-admin session doesn't quietly persist. */
              return auth.signOut().catch(function () {}).then(function () {
                var err = new Error('not_admin');
                err.code = 'aura/not-admin';
                throw err;
              });
            }
            /* Admin verified — remember the email that succeeded for
               next time, set the existing bypass flag, and reload.
               Reload via location.replace so back-button can't bring the
               maintenance gate back during this session. */
            _rememberEmail(email);
            try { localStorage.setItem(BYPASS_KEY_PERSIST, 'true'); } catch (e) {}
            setHint('Welcome back. Loading the site…', 'loading');
            setTimeout(function () {
              var dest = window.location.pathname + window.location.search + window.location.hash;
              /* If the user landed via ?admin=false (which force-clears
                 the flag), strip it so the reload doesn't immediately
                 wipe what we just set. */
              if (/[?&]admin=/.test(window.location.search)) {
                var clean = window.location.search
                  .replace(/[?&]admin=[^&]*/gi, '')
                  .replace(/^&/, '?');
                if (clean === '?') clean = '';
                dest = window.location.pathname + clean + window.location.hash;
              }
              window.location.replace(dest || '/');
            }, 500);
          });
        });
      }).catch(function (err) {
        setBusy(false);
        var code = err && err.code;
        var msg;
        if (code === 'aura/not-admin') {
          msg = 'This account does not have admin access.';
        } else if (code === 'auth/wrong-password' ||
                   code === 'auth/user-not-found' ||
                   code === 'auth/invalid-email'  ||
                   code === 'auth/invalid-credential' ||
                   code === 'auth/invalid-login-credentials') {
          msg = 'Email or password is incorrect.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Too many attempts. Try again in a moment.';
        } else if (code === 'auth/network-request-failed' ||
                   code === 'aura/load-failed' ||
                   code === 'aura/load-timeout') {
          msg = 'Admin login unavailable. Try again.';
        } else if (code === 'auth/user-disabled') {
          msg = 'This account is disabled.';
        } else {
          msg = 'Admin login unavailable. Try again.';
        }
        setHint(msg, 'error');
      });
    });
  }

  /* Dynamic Firebase loader. Sequential script tags so the global
     `firebase` namespace from app-compat is in place before auth-compat
     and firestore-compat attach to it. Idempotent — returns the same
     in-flight Promise on repeat calls so a double-click won't load
     Firebase twice. */
  var _firebasePromise = null;
  function _loadFirebase() {
    if (window.firebase && window.firebase.apps && window.firebase.apps.length) {
      return Promise.resolve();
    }
    if (window.firebase && window.firebase.auth && window.firebase.firestore) {
      try {
        if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
      } catch (e) {}
      return Promise.resolve();
    }
    if (_firebasePromise) return _firebasePromise;

    var sdks = ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js'];
    _firebasePromise = new Promise(function (resolve, reject) {
      var idx = 0;
      var done = false;
      var timeout = setTimeout(function () {
        if (done) return;
        done = true;
        var err = new Error('Firebase load timeout');
        err.code = 'aura/load-timeout';
        _firebasePromise = null; /* allow retry on next click */
        reject(err);
      }, 15000);

      function loadNext() {
        if (done) return;
        if (idx >= sdks.length) {
          clearTimeout(timeout);
          done = true;
          try {
            if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
            /* SESSION persistence on the maintenance page so a wrong-
               account sign-in doesn't outlive the tab. The reload after
               a successful admin login will re-evaluate persistence via
               firebase.js — which sets LOCAL — so admin sessions still
               survive across browser restarts. */
            try { firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION); } catch (e) {}
            resolve();
          } catch (e) {
            var err = new Error('Firebase init failed');
            err.code = 'aura/load-failed';
            _firebasePromise = null;
            reject(err);
          }
          return;
        }
        var s = document.createElement('script');
        s.src = FB_SDK_BASE + sdks[idx++];
        s.async = false;
        s.onload  = loadNext;
        s.onerror = function () {
          if (done) return;
          done = true;
          clearTimeout(timeout);
          var err = new Error('Firebase script failed to load');
          err.code = 'aura/load-failed';
          _firebasePromise = null; /* allow retry */
          reject(err);
        };
        document.head.appendChild(s);
      }
      loadNext();
    });
    return _firebasePromise;
  }
})();
