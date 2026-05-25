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
    + '</main>'
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
})();
