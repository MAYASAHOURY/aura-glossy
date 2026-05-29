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

  /* Expose the maintenance flag globally so other modules can read it
     synchronously. Used by the settings + login sign-out flows and the
     cross-tab BroadcastChannel('aura_auth') handler in firebase.js to
     decide whether to land back on the maintenance screen (index.html)
     or on the normal sign-in form (login.html). Set BEFORE the bypass
     check so it's available even when the gate is bypassed. */
  try { window.__auraMaintenanceMode = MAINTENANCE_MODE; } catch (e) {}

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
  /* Canonical owner identity. Pre-fills the form on first open so
     the owner doesn't have to retype every time. The actual admin
     grant is the Firestore users/{uid}.isAdmin === true field — these
     constants are UX-only, never trusted on their own.

     LABEL is a friendly display name shown above the email field
     ("Maya Admin"). After a successful admin sign-in, both label and
     email are persisted to localStorage so the modal greets the same
     admin on subsequent visits. EMAIL is always editable; LABEL is
     display-only and updates from Firebase user.displayName after the
     first successful login (or stays at the default if no displayName
     is set on the account).

     PASSWORD IS NEVER STORED. Firebase Auth is the sole password
     authority. The "Forgot admin password?" link in the modal triggers
     Firebase's sendPasswordResetEmail() — recovery flows through
     Firebase, not through us. */
  var ADMIN_DEFAULT_LABEL  = 'Maya Admin';
  var ADMIN_DEFAULT_EMAIL  = 'auraglossy.support@gmail.com';
  var REMEMBERED_LABEL_KEY = 'aura_admin_last_label';
  var REMEMBERED_EMAIL_KEY = 'aura_admin_last_email';

  /* ── Maintenance copy translations ──────────────────────────────
        The maintenance gate runs synchronously BEFORE i18n.js loads,
        so it carries its own tiny dictionary keyed on the lang attr
        that the pre-paint script (in every HTML file's <head>) puts
        on documentElement. Keeps EN/ES/AR/HE users seeing the right
        voice + RTL direction the moment the page paints. */
  /* Language policy (user-facing surfaces):
     - English is the universal default for first-time visitors.
     - localStorage.aura_lang wins if the user has manually picked
       a language via the switcher (we persist their choice there).
     - navigator.language is NEVER trusted for auto-switching — too
       many Israel/Saudi users have a Hebrew/Arabic OS locale even
       though they expect the brand surface in English. Manual choice
       only.
     This matches the pre-paint <script> in every HTML <head>. */
  var MAINT_LANG = (function () {
    try {
      var l = null;
      try { l = localStorage.getItem('aura_lang'); } catch (e) {}
      if (l) {
        l = (l || 'en').toLowerCase().slice(0, 2);
        if (['en','es','ar','he'].indexOf(l) >= 0) return l;
      }
      return 'en';
    } catch (e) { return 'en'; }
  })();
  var MAINT_IS_RTL = (MAINT_LANG === 'ar' || MAINT_LANG === 'he');
  var MAINT_T = {
    en: {
      logo:       'Aura Glossy',
      heading_a:  'We’re building something',
      heading_em: 'beautiful',
      sub:        'Aura is in a brief studio moment — refining the curation, the circles, the small details. We’ll be back soon.',
      patience:   'Welcome to your editorial moment.',
      waitlist_eyebrow: 'Be the first inside',
      waitlist_label:   'Your email',
      waitlist_placeholder: 'you@example.com',
      waitlist_cta:     'Join the waitlist',
      waitlist_invalid: 'Please enter a real, well-formed email.',
      waitlist_sending: 'Sending…',
      waitlist_success: 'We sent you an email ✨',
      waitlist_success_sub: 'Go confirm your spot — we’re waiting for you.',
      waitlist_already: 'You’re already on the list ✨',
      waitlist_already_sub: 'We’ll let you know the moment we open the doors.',
      waitlist_resent:  'We sent a fresh link ✨',
      waitlist_resent_sub: 'Your previous link expired. Check your email — the new one is valid for 24 hours.',
      waitlist_rate:    'Too many tries. Take a breath and try again in a minute.',
      waitlist_email_failed: 'We couldn’t send the email',
      waitlist_email_failed_sub: 'Please check your address and try again.',
      waitlist_try_again: 'Try again',
      waitlist_error:   'Couldn’t save your email. Try again in a moment.',
      admin_enter: 'Admin enter',
      admin_title: 'Admin access',
      admin_sub:   'Sign in with your admin account to continue while the site is under maintenance.',
      admin_email_label: 'Email',
      admin_password_label: 'Password',
      admin_submit: 'Enter',
      admin_verifying: 'Verifying…',
      admin_forgot: 'Forgot admin password?',
      admin_send_reset_loading: 'Sending reset email…',
      admin_close: 'Close',
      welcome:    'Hii Bossy'
    },
    es: {
      logo:       'Aura Glossy',
      heading_a:  'Estamos creando algo',
      heading_em: 'precioso',
      sub:        'Aura está en un momento de estudio — refinando la curación, los círculos, los pequeños detalles. Volveremos pronto.',
      patience:   'Bienvenida a tu momento editorial.',
      waitlist_eyebrow: 'Sé la primera en entrar',
      waitlist_label:   'Tu email',
      waitlist_placeholder: 'tu@email.com',
      waitlist_cta:     'Unirse a la lista',
      waitlist_invalid: 'Introduce un email real y bien formado.',
      waitlist_sending: 'Enviando…',
      waitlist_success: 'Te enviamos un email ✨',
      waitlist_success_sub: 'Ve a confirmar tu lugar — te estamos esperando.',
      waitlist_already: 'Ya estás en la lista ✨',
      waitlist_already_sub: 'Te avisaremos en el momento que abramos las puertas.',
      waitlist_resent:  'Enviamos un enlace nuevo ✨',
      waitlist_resent_sub: 'Tu enlace anterior caducó. Revisa tu email — el nuevo es válido durante 24 horas.',
      waitlist_rate:    'Demasiados intentos. Respira y vuelve a intentarlo en un minuto.',
      waitlist_email_failed: 'No pudimos enviar el email',
      waitlist_email_failed_sub: 'Revisa tu dirección y vuelve a intentarlo.',
      waitlist_try_again: 'Intentar de nuevo',
      waitlist_error:   'No pudimos guardar tu email. Inténtalo de nuevo.',
      admin_enter: 'Entrar como admin',
      admin_title: 'Acceso de admin',
      admin_sub:   'Inicia sesión con tu cuenta de admin para continuar mientras el sitio está en mantenimiento.',
      admin_email_label: 'Email',
      admin_password_label: 'Contraseña',
      admin_submit: 'Entrar',
      admin_verifying: 'Verificando…',
      admin_forgot: '¿Olvidaste la contraseña?',
      admin_send_reset_loading: 'Enviando email…',
      admin_close: 'Cerrar',
      welcome:    'Hola Bossy'
    },
    ar: {
      logo:       'أورا غلوسي',
      heading_a:  'نحن نصنع شيئًا',
      heading_em: 'جميلاً',
      sub:        'أورا في لحظة استوديو قصيرة — نُحسّن التنسيق، الدوائر، والتفاصيل الصغيرة. سنعود قريبًا.',
      patience:   'مرحبًا بكِ في لحظتكِ التحريريّة.',
      waitlist_eyebrow: 'كوني أوّل من تدخل',
      waitlist_label:   'بريدكِ الإلكتروني',
      waitlist_placeholder: 'you@example.com',
      waitlist_cta:     'انضمّي إلى القائمة',
      waitlist_invalid: 'يرجى إدخال بريد حقيقي وصحيح.',
      waitlist_sending: 'جارٍ الإرسال…',
      waitlist_success: 'أرسلنا لكِ بريدًا ✨',
      waitlist_success_sub: 'اذهبي لتأكيد مكانكِ — نحن بانتظاركِ.',
      waitlist_already: 'أنتِ بالفعل على القائمة ✨',
      waitlist_already_sub: 'سنُعلمكِ في اللحظة التي نفتح فيها الأبواب.',
      waitlist_resent:  'أرسلنا رابطًا جديدًا ✨',
      waitlist_resent_sub: 'انتهت صلاحيّة رابطكِ السابق. تحقّقي من بريدكِ — الرابط الجديد صالح لمدة 24 ساعة.',
      waitlist_rate:    'محاولات كثيرة. خذي نفسًا وحاولي بعد دقيقة.',
      waitlist_email_failed: 'تعذّر إرسال البريد',
      waitlist_email_failed_sub: 'تحقّقي من العنوان وحاولي مرة أخرى.',
      waitlist_try_again: 'حاولي مرة أخرى',
      waitlist_error:   'تعذّر حفظ بريدكِ. حاولي بعد قليل.',
      admin_enter: 'دخول الأدمن',
      admin_title: 'دخول الأدمن',
      admin_sub:   'سجّلي الدخول بحساب الأدمن لمتابعة العمل خلال الصيانة.',
      admin_email_label: 'البريد الإلكتروني',
      admin_password_label: 'كلمة المرور',
      admin_submit: 'دخول',
      admin_verifying: 'جارٍ التحقق…',
      admin_forgot: 'نسيتِ كلمة المرور؟',
      admin_send_reset_loading: 'يتم الإرسال…',
      admin_close: 'إغلاق',
      welcome:    'مرحبًا بوسي'
    },
    he: {
      logo:       'אורה גלוסי',
      heading_a:  'אנחנו בונות משהו',
      heading_em: 'יפהפה',
      sub:        'אורה ברגע סטודיו קצר — מחדדות את האוצרות, החוגים והפרטים הקטנים. נחזור בקרוב.',
      patience:   'ברוכה הבאה לרגע העריכה שלך.',
      waitlist_eyebrow: 'להיות הראשונה בפנים',
      waitlist_label:   'האימייל שלך',
      waitlist_placeholder: 'you@example.com',
      waitlist_cta:     'הצטרפות לרשימה',
      waitlist_invalid: 'נא להזין אימייל אמיתי ותקין.',
      waitlist_sending: 'שולחים…',
      waitlist_success: 'שלחנו לך אימייל ✨',
      waitlist_success_sub: 'לכי לאשר את המקום שלך — אנחנו מחכים לך.',
      waitlist_already: 'את כבר ברשימה ✨',
      waitlist_already_sub: 'נעדכן אותך ברגע שניפתח את הדלתות.',
      waitlist_resent:  'שלחנו לך לינק חדש ✨',
      waitlist_resent_sub: 'הלינק הקודם פג תוקף. בדקי את האימייל — החדש בתוקף ל-24 שעות.',
      waitlist_rate:    'יותר מדי ניסיונות. קחי נשימה ונסי שוב בעוד דקה.',
      waitlist_email_failed: 'לא הצלחנו לשלוח את האימייל',
      waitlist_email_failed_sub: 'בדקי את הכתובת ונסי שוב.',
      waitlist_try_again: 'נסי שוב',
      waitlist_error:   'לא הצלחנו לשמור את האימייל. נסי שוב.',
      admin_enter: 'כניסת אדמין',
      admin_title: 'כניסת אדמין',
      admin_sub:   'התחברי עם חשבון האדמין שלך להמשיך בזמן התחזוקה.',
      admin_email_label: 'אימייל',
      admin_password_label: 'סיסמה',
      admin_submit: 'כניסה',
      admin_verifying: 'מאמתים…',
      admin_forgot: 'שכחת סיסמה?',
      admin_send_reset_loading: 'שולחים…',
      admin_close: 'סגירה',
      welcome:    'היי בוסי'
    }
  };
  function MT(k) { return (MAINT_T[MAINT_LANG] && MAINT_T[MAINT_LANG][k]) || MAINT_T.en[k] || ''; }
  /* HTML-escape for any value that comes from a translation string before
     it lands in innerHTML. Translation files are author-controlled here,
     but treating them as untrusted keeps a future contributor from
     accidentally introducing a script-injection hole. */
  function MTH(k) {
    var s = MT(k) || '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

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

  /* ── Trace logs for diagnosing maintenance leaks ──────────────────
        Every page that loads maintenance.js prints exactly one of:
          [MAINTENANCE] mode off — passing through
          [MAINTENANCE] admin bypass active for {path}
          [MAINTENANCE] blocked route: {path}
        Plus event-driven logs when an active bypass gets invalidated
        late (bfcache restore, cross-tab logout). If you ever see a
        public page during maintenance, grep the console for these
        lines to know exactly which path fired. */
  var _path = (function () {
    try { return location.pathname + location.search; } catch (e) { return '?'; }
  })();

  if (!MAINTENANCE_MODE) {
    try { console.log('[MAINTENANCE] mode off — passing through'); } catch (e) {}
    return; /* nothing to guard against — gate is disabled */
  }
  if (bypass) {
    try { console.log('[MAINTENANCE] admin bypass active for ' + _path); } catch (e) {}
    _installLateGuards();
    return;
  }

  try { console.log('[MAINTENANCE] blocked route: ' + _path); } catch (e) {}

  /* ── Late-invalidation guards ────────────────────────────────────
        Once we've decided to honor a bypass and let the page render,
        we still need to defend against two cases where the bypass
        becomes invalid AFTER this script finishes:

          1. bfcache restore — iOS Safari (and other browsers) can
             restore the rendered DOM from memory when the user hits
             Back, without re-running scripts. The bypass might have
             been cleared in the meantime (logout, manual reset).

          2. Cross-tab logout — the admin signs out in another tab,
             which clears localStorage.aura_admin_bypass. We get a
             'storage' event here and should reload immediately so
             the maintenance gate re-evaluates and seals the page.

        Both handlers do nothing if bypass is still valid; otherwise
        they reload, which triggers maintenance.js fresh and renders
        the maintenance screen. ──────────────────────────────────── */
  function _installLateGuards() {
    window.addEventListener('pageshow', function (ev) {
      if (!ev.persisted) return; /* fresh load — head script will re-run */
      if (!MAINTENANCE_MODE) return;
      var stillBypass = false;
      try { var v = localStorage.getItem(BYPASS_KEY); stillBypass = (v === 'true' || v === '1'); } catch (e) {}
      if (!stillBypass) {
        try { console.log('[MAINTENANCE] bfcache restore — bypass invalid, reloading'); } catch (e) {}
        window.location.reload();
      }
    });
    window.addEventListener('storage', function (ev) {
      if (ev.key !== BYPASS_KEY) return;
      if (!MAINTENANCE_MODE) return;
      var stillBypass = (ev.newValue === 'true' || ev.newValue === '1');
      if (!stillBypass) {
        try { console.log('[MAINTENANCE] bypass cleared in another tab, reloading'); } catch (e) {}
        window.location.reload();
      }
    });
  }

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
    + '<meta name="description" content="' + MTH('sub') + '">'
    + '<title>' + MTH('logo') + ' — ' + MTH('heading_em') + '</title>'
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
    + '  .aura-admin-hint.is-success{color:#e7c8b5}'
    /* ── Saved-admin identity row (avatar circle + friendly label) ── */
    + '  .aura-admin-identity{display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px;margin:0 0 18px;border:1px solid rgba(199,154,133,.18);border-radius:999px;background:rgba(199,154,133,.06)}'
    + '  .aura-admin-identity-avatar{width:26px;height:26px;flex:0 0 26px;border-radius:50%;background:linear-gradient(180deg,rgba(199,154,133,.42),rgba(176,135,112,.42));color:#f5ede3;display:flex;align-items:center;justify-content:center;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}'
    + '  .aura-admin-identity-name{flex:1;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:.04em;color:#f0e5d6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    /* ── "Forgot admin password?" link — subtle text button under hint ── */
    + '  .aura-admin-forgot{display:block;margin:12px auto 0;background:none;border:none;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:11px;font-weight:400;letter-spacing:.04em;color:rgba(185,169,154,.62);text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(185,169,154,.32);cursor:pointer;padding:6px 8px;transition:color .24s ease,text-decoration-color .24s ease}'
    + '  .aura-admin-forgot:hover,.aura-admin-forgot:focus-visible{color:#c79a85;text-decoration-color:rgba(199,154,133,.6);outline:none}'
    + '  .aura-admin-forgot:disabled{opacity:.45;cursor:not-allowed}'
    /* ── "Hii Bossy ✨" post-login welcome transition ──────────────────
          Full-screen premium overlay shown ONLY after a successful
          admin sign-in (Firebase auth + Firestore isAdmin=true). Sits
          at z-index 200 — above both the modal (z-100) and the
          maintenance page underneath — so it is the sole thing visible
          for the brief moment before we navigate into the site.
          Background fades in first, then the inner text un-blurs and
          rises with a subtle cubic-bezier curve. No buttons, no exit
          animation — we replace the URL when the timer fires. */
    + '  .aura-admin-welcome{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:32px;background:#0d0905;opacity:0;transition:opacity .6s ease;overflow:hidden;-webkit-font-smoothing:antialiased}'
    + '  .aura-admin-welcome.is-visible{display:flex;opacity:1}'
    + '  .aura-admin-welcome::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(ellipse 60% 50% at 50% 45%, rgba(199,154,133,.36) 0%, rgba(60,32,22,.18) 35%, transparent 70%),radial-gradient(ellipse 90% 70% at 50% 50%, rgba(231,200,181,.06) 0%, transparent 60%);animation:auraGlowPulse 5s ease-in-out infinite alternate}'
    + '  .aura-admin-welcome::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;mix-blend-mode:overlay;opacity:.14;background-image:url("data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.32 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");background-size:200px 200px}'
    + '  .aura-admin-welcome-inner{position:relative;z-index:1;text-align:center;filter:blur(10px);opacity:0;transform:translateY(10px);transition:filter .95s cubic-bezier(.2,.7,.2,1),opacity .95s ease,transform 1.1s cubic-bezier(.2,.7,.2,1)}'
    + '  .aura-admin-welcome.is-revealed .aura-admin-welcome-inner{filter:blur(0);opacity:1;transform:translateY(0)}'
    + '  .aura-admin-welcome-text{font-family:"Playfair Display","Times New Roman",serif;font-weight:400;font-style:italic;font-size:clamp(38px,7.4vw,68px);line-height:1.18;letter-spacing:-.005em;color:#f5ede3;margin:0;background:linear-gradient(180deg,#f5ede3 0%,#e7c8b5 100%);-webkit-background-clip:text;background-clip:text;color:transparent;display:inline-flex;align-items:baseline;gap:14px;flex-wrap:nowrap;justify-content:center}'
    + '  .aura-admin-welcome-spark{font-style:normal;display:inline-block;-webkit-background-clip:initial;background-clip:initial;color:#e7c8b5;animation:auraTwinkle 2.4s ease-in-out infinite;text-shadow:0 0 16px rgba(231,200,181,.55),0 0 28px rgba(231,200,181,.32)}'
    + '  @media (prefers-reduced-motion: reduce){.aura-admin-welcome-inner{transition-duration:.001ms}.aura-admin-welcome::before,.aura-admin-welcome-spark{animation:none}}'
    + '  @media (max-width:520px){.aura-admin-welcome{padding:24px}.aura-admin-welcome-text{gap:10px}}'
    + '  @media (max-width:520px){.aura-admin-card{padding:30px 22px 24px}.aura-admin-title{font-size:22px}.aura-admin-trigger{bottom:20px;padding:14px 22px;letter-spacing:.28em}}'
    /* ── Waitlist form (premium, inline, animates in after the sub copy) ── */
    + '  .aura-waitlist-hp{position:absolute;left:-9999px;top:auto;width:1px;height:1px;opacity:0;pointer-events:none}' /* honeypot — bots fill it, humans never see it */
    + '  .aura-waitlist{position:relative;margin-top:40px;width:100%;max-width:380px;animation:auraRise 2.2s 1.05s cubic-bezier(.2,.7,.2,1) both}'
    + '  .aura-waitlist-eyebrow{display:block;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:9px;font-weight:500;letter-spacing:.42em;text-transform:uppercase;color:#c79a85;margin-bottom:12px;text-align:center}'
    + '  .aura-waitlist-form{display:flex;align-items:stretch;gap:8px;width:100%}'
    + '  .aura-waitlist-input{flex:1;min-width:0;background:rgba(255,255,255,.04);border:1px solid rgba(199,154,133,.22);border-radius:2px;padding:13px 14px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:14px;color:#f0e5d6;outline:none;transition:border-color .24s ease,background .24s ease;-webkit-appearance:none;appearance:none}'
    + '  .aura-waitlist-input::placeholder{color:rgba(138,122,108,.55)}'
    + '  .aura-waitlist-input:focus{border-color:rgba(199,154,133,.55);background:rgba(255,255,255,.06)}'
    + '  .aura-waitlist-btn{flex:0 0 auto;padding:12px 18px;background:linear-gradient(180deg,#c79a85 0%,#b08770 100%);border:none;border-radius:2px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:10px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:#1a0e08;cursor:pointer;transition:opacity .24s ease;white-space:nowrap}'
    + '  .aura-waitlist-btn:hover,.aura-waitlist-btn:focus-visible{opacity:.92;outline:none}'
    + '  .aura-waitlist-btn:disabled{opacity:.45;cursor:not-allowed}'
    + '  .aura-waitlist-hint{margin-top:10px;min-height:16px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:11px;line-height:1.5;text-align:center;color:#8a7a6c;transition:color .24s ease}'
    + '  .aura-waitlist-hint.is-error{color:#d49a8c}'
    + '  .aura-waitlist-hint.is-loading{color:#c79a85}'
    + '  .aura-waitlist-hint.is-success{color:#e7c8b5}'
    /* Success state — replaces the form with a single confirmation row */
    /* ── Waitlist success: FOCUSED MODAL ──────────────────────
       Layer A: full-viewport overlay with dim + blur backdrop —
                kills focus on hero/form behind it.
       Layer B: a centered glassy rose card in the middle.
       Layer C: subtle halo bloom behind the card (::before).
       z-index 60 sits above main (z:2), vignette (z:1), and admin
       trigger (which we bump to z:70 below so it stays accessible). */
    + '  .aura-waitlist-success{display:none}'
    + '  .aura-waitlist.is-success .aura-waitlist-success{display:flex;position:fixed;inset:0;z-index:60;align-items:center;justify-content:center;padding:24px;background:radial-gradient(ellipse 90% 70% at 50% 50%,rgba(80,32,52,.55) 0%,rgba(13,9,5,.88) 70%);-webkit-backdrop-filter:blur(18px) saturate(115%);backdrop-filter:blur(18px) saturate(115%);animation:auraOverlayIn .55s cubic-bezier(.2,.7,.2,1) both}'
    /* The card — premium glassy rose, 3D elevation, halo */
    + '  .aura-waitlist-success-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;width:100%;max-width:380px;box-sizing:border-box;padding:32px 28px 30px;background:radial-gradient(ellipse 110% 80% at 50% 0%,rgba(255,210,225,.22) 0%,transparent 60%),linear-gradient(180deg,rgba(255,200,215,.18) 0%,rgba(255,180,200,.08) 100%);border:1px solid rgba(255,190,210,.50);border-radius:22px;-webkit-backdrop-filter:blur(20px) saturate(125%);backdrop-filter:blur(20px) saturate(125%);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 22px 60px rgba(255,170,195,.18),0 6px 18px rgba(255,160,190,.10);animation:auraCardRise .8s .15s cubic-bezier(.2,.7,.2,1) both;opacity:0}'
    + '  .aura-waitlist-success-card::before{content:"";position:absolute;inset:-14px;border-radius:28px;background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(255,170,195,.24) 0%,rgba(255,150,180,.04) 55%,transparent 100%);filter:blur(18px);z-index:-1;pointer-events:none;opacity:.9}'
    /* Softer ERROR variant — same architecture, dustier rose so it
       reads as "gentle problem" not alarm. */
    + '  .aura-waitlist-success.is-error .aura-waitlist-success-card{background:radial-gradient(ellipse 110% 80% at 50% 0%,rgba(230,170,180,.20) 0%,transparent 60%),linear-gradient(180deg,rgba(220,165,180,.16) 0%,rgba(200,150,170,.08) 100%);border:1px solid rgba(220,170,185,.48);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 22px 60px rgba(220,140,165,.18),0 6px 18px rgba(220,140,165,.10)}'
    + '  .aura-waitlist-success.is-error .aura-waitlist-success-card::before{background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(220,150,170,.22) 0%,rgba(220,150,170,.04) 55%,transparent 100%)}'
    /* Close affordance — gently retreats from the card; click + Esc
       both call dismiss(). Hidden by default; shown only on error
       state OR via the Try-again button at the bottom of the card. */
    + '  .aura-waitlist-success-close{position:absolute;top:10px;right:10px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;color:rgba(247,233,236,.55);font-size:18px;font-family:inherit;cursor:pointer;border-radius:50%;transition:color .24s ease,background .24s ease;visibility:hidden;opacity:0}'
    + '  .aura-waitlist-success.is-error .aura-waitlist-success-close,.aura-waitlist-success-close:focus-visible{visibility:visible;opacity:1}'
    + '  .aura-waitlist-success-close:hover,.aura-waitlist-success-close:focus-visible{color:rgba(247,233,236,.95);background:rgba(255,255,255,.06);outline:none}'
    + '  html[dir="rtl"] .aura-waitlist-success-close{right:auto;left:10px}'
    /* Try-again button (error state only) */
    + '  .aura-waitlist-success-retry{display:none;margin-top:16px;padding:11px 22px;background:linear-gradient(180deg,rgba(220,170,185,.95) 0%,rgba(200,150,170,.95) 100%);border:1px solid rgba(230,180,195,.6);border-radius:999px;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#2a1418;cursor:pointer;transition:opacity .24s ease}'
    + '  .aura-waitlist-success.is-error .aura-waitlist-success-retry{display:inline-block}'
    + '  .aura-waitlist-success-retry:hover{opacity:.92}'
    /* Overlay fade-in: backdrop establishes first, card rises after */
    + '  @keyframes auraOverlayIn{from{opacity:0;-webkit-backdrop-filter:blur(0) saturate(100%);backdrop-filter:blur(0) saturate(100%)}to{opacity:1;-webkit-backdrop-filter:blur(18px) saturate(115%);backdrop-filter:blur(18px) saturate(115%)}}'
    + '  @keyframes auraCardRise{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}'
    /* When success modal is up, eyebrow + hint quietly retreat
       (they'd peek over the dim otherwise). */
    + '  .aura-waitlist.is-success .aura-waitlist-eyebrow,.aura-waitlist.is-success .aura-waitlist-hint{visibility:hidden;opacity:0;transition:opacity .3s ease}'
    /* Bump admin trigger above the modal so it stays accessible
       (user spec). It naturally sits at the bottom — never overlaps
       the centered card. */
    + '  .aura-admin-trigger{z-index:72}'
    + '  .aura-waitlist.is-success .aura-waitlist-form{display:none}'
    + '  .aura-waitlist.is-success .aura-waitlist-success{display:flex}'
    /* Mark glyph hidden — title carries ✨ */
    + '  .aura-waitlist-success-mark{display:none}'
    /* Title — bigger serif italic now that the modal commands the
       viewport, soft cream, centered. clamp() keeps it elegant on
       both small phones and desktop. */
    + '  .aura-waitlist-success-text{display:block;font-family:"Playfair Display","Times New Roman",serif;font-style:italic;font-weight:400;font-size:clamp(20px,3.4vw,26px);line-height:1.25;color:#f9ecef;text-align:center;letter-spacing:-.005em;text-shadow:0 1px 14px rgba(255,180,200,.12);background:linear-gradient(180deg,#f9ecef 0%,#f0d8df 100%);-webkit-background-clip:text;background-clip:text;color:transparent}'
    /* Sub — slightly muted rose sans, centered, max-width caps so it
       never wraps awkwardly inside the 380px card. */
    + '  .aura-waitlist-success-sub{display:block;font-family:"Inter","Helvetica Neue",Arial,sans-serif;font-style:normal;font-size:clamp(12.5px,1.5vw,13.5px);font-weight:400;letter-spacing:.012em;color:#d4b8c2;margin-top:10px;line-height:1.6;text-align:center;max-width:30ch;margin-left:auto;margin-right:auto}'
    /* Mobile tuning — keep the card tight and breathable on small
       phones; tighter padding so the title doesn't get cropped. */
    + '  @media (max-width:520px){.aura-waitlist.is-success .aura-waitlist-success{padding:20px 18px}.aura-waitlist-success-card{padding:28px 22px 26px;border-radius:20px}.aura-waitlist-success-card::before{inset:-10px;border-radius:24px}.aura-waitlist-success-sub{margin-top:8px}}'
    + '  @media (max-width:520px){.aura-waitlist{margin-top:32px;max-width:none}.aura-waitlist-form{flex-direction:column;gap:8px}.aura-waitlist-btn{padding:13px 16px}}'
    /* ── RTL polish: flip arrows/letter-spacing where it matters. The
          maintenance page is intentionally simple so most layout still
          centres correctly under <html dir="rtl">. We just need the arrow
          on the admin trigger to flip and the logo's letter-spacing to
          ease so Arabic/Hebrew rendering stays calm. */
    + '  html[dir="rtl"] .aura-admin-trigger .aura-admin-arrow{transform:scaleX(-1)}'
    + '  html[dir="rtl"] .aura-admin-trigger:hover .aura-admin-arrow,html[dir="rtl"] .aura-admin-trigger:focus-visible .aura-admin-arrow{transform:scaleX(-1) translateX(3px)}'
    + '  html[dir="rtl"] .aura-logo{letter-spacing:.18em}'
    + '  html[dir="rtl"] .aura-admin-close{right:auto;left:10px}'
    + '</style>';

  var bodyHtml =
      '<div class="aura-vignette" aria-hidden="true"></div>'
    + '<main class="aura-maint" role="main">'
    +   '<div class="aura-logo" aria-label="' + MTH('logo') + '">'
    +     '<span class="rule" aria-hidden="true"></span>'
    +     '<span class="mark"><span class="star" aria-hidden="true">✦</span>' + MTH('logo') + '</span>'
    +     '<span class="rule" aria-hidden="true"></span>'
    +   '</div>'
    +   '<h1 class="aura-maint">' + MTH('heading_a') + ' <em>' + MTH('heading_em') + '</em>.</h1>'
    +   '<p class="aura-sub">' + MTH('sub') + '</p>'
    +   '<div class="aura-shimmer" aria-hidden="true"></div>'
    +   '<div class="aura-waitlist" id="aura-waitlist">'
    +     '<span class="aura-waitlist-eyebrow">' + MTH('waitlist_eyebrow') + '</span>'
    +     '<form class="aura-waitlist-form" id="aura-waitlist-form" autocomplete="off" novalidate>'
    +       '<label class="visually-hidden" for="aura-waitlist-email" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">' + MTH('waitlist_label') + '</label>'
    +       '<input class="aura-waitlist-input" type="email" id="aura-waitlist-email" name="email" placeholder="' + MTH('waitlist_placeholder') + '" autocomplete="email" inputmode="email" spellcheck="false" autocapitalize="off" required>'
    /* Honeypot — bots autofill any input named "website"/"url"/"phone".
       Real humans never see this; if it gets filled, treat as bot. */
    +       '<input class="aura-waitlist-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">'
    +       '<button type="submit" class="aura-waitlist-btn" id="aura-waitlist-btn">' + MTH('waitlist_cta') + '</button>'
    +     '</form>'
    /* Focused success modal — full-viewport overlay + centered card.
       JS _wireWaitlist() swaps in the right title/sub for each state
       (subscribed / verification_resent / already_subscribed /
       email_send_failed). Close X + Try-again button only show in
       error state; success states stay open until the user follows
       their email link or navigates away. */
    +     '<div class="aura-waitlist-success" role="dialog" aria-modal="true" aria-live="polite" aria-labelledby="aura-waitlist-success-text" aria-hidden="true">'
    +       '<div class="aura-waitlist-success-card">'
    +         '<button type="button" class="aura-waitlist-success-close" id="aura-waitlist-success-close" aria-label="' + MTH('admin_close') + '">✕</button>'
    +         '<span class="aura-waitlist-success-mark" aria-hidden="true">✦</span>'
    +         '<h2 class="aura-waitlist-success-text" id="aura-waitlist-success-text">' + MTH('waitlist_success') + '</h2>'
    +         '<p class="aura-waitlist-success-sub" id="aura-waitlist-success-sub">' + MTH('waitlist_success_sub') + '</p>'
    +         '<button type="button" class="aura-waitlist-success-retry" id="aura-waitlist-success-retry">' + MTH('waitlist_try_again') + '</button>'
    +       '</div>'
    +     '</div>'
    +     '<p class="aura-waitlist-hint" id="aura-waitlist-hint" aria-live="polite" aria-atomic="true"></p>'
    +   '</div>'
    +   '<p class="aura-patience">' + MTH('patience') + '</p>'
    +   '<button type="button" class="aura-admin-trigger" id="aura-admin-trigger" aria-haspopup="dialog" aria-controls="aura-admin-overlay">'
    +     '<span>' + MTH('admin_enter') + '</span>'
    +     '<span class="aura-admin-arrow" aria-hidden="true">→</span>'
    +   '</button>'
    + '</main>'
    + '<div class="aura-admin-welcome" id="aura-admin-welcome" role="status" aria-live="polite" aria-hidden="true">'
    +   '<div class="aura-admin-welcome-inner">'
    +     '<h2 class="aura-admin-welcome-text">'
    +       '<span>' + MTH('welcome') + '</span>'
    +       '<span class="aura-admin-welcome-spark" aria-hidden="true">✨</span>'
    +     '</h2>'
    +   '</div>'
    + '</div>'
    + '<div class="aura-admin-overlay" id="aura-admin-overlay" role="dialog" aria-modal="true" aria-labelledby="aura-admin-title" aria-hidden="true">'
    +   '<div class="aura-admin-card">'
    +     '<button type="button" class="aura-admin-close" id="aura-admin-close" aria-label="' + MTH('admin_close') + '">✕</button>'
    +     '<div class="aura-admin-eyebrow">' + MTH('logo') + '</div>'
    +     '<h2 class="aura-admin-title" id="aura-admin-title">' + MTH('admin_title') + '</h2>'
    +     '<p class="aura-admin-sub">' + MTH('admin_sub') + '</p>'
    +     '<div class="aura-admin-identity" id="aura-admin-identity" aria-hidden="true">'
    +       '<span class="aura-admin-identity-avatar" id="aura-admin-identity-avatar">M</span>'
    +       '<span class="aura-admin-identity-name" id="aura-admin-identity-name">Maya Admin</span>'
    +     '</div>'
    +     '<form id="aura-admin-form" autocomplete="off" novalidate>'
    +       '<div class="aura-admin-field">'
    +         '<label class="aura-admin-label" for="aura-admin-email">' + MTH('admin_email_label') + '</label>'
    +         '<input class="aura-admin-input" type="email" id="aura-admin-email" name="email" autocomplete="email" inputmode="email" spellcheck="false" autocapitalize="off" required>'
    +       '</div>'
    +       '<div class="aura-admin-field">'
    +         '<label class="aura-admin-label" for="aura-admin-password">' + MTH('admin_password_label') + '</label>'
    +         '<input class="aura-admin-input" type="password" id="aura-admin-password" name="password" autocomplete="current-password" required>'
    +       '</div>'
    +       '<button type="submit" class="aura-admin-submit" id="aura-admin-submit">' + MTH('admin_submit') + '</button>'
    +       '<p class="aura-admin-hint" id="aura-admin-hint" aria-live="polite" aria-atomic="true"></p>'
    +       '<button type="button" class="aura-admin-forgot" id="aura-admin-forgot">' + MTH('admin_forgot') + '</button>'
    +     '</form>'
    +   '</div>'
    + '</div>'
    + '<noscript><p style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0d0905;color:#f0e5d6;font-family:Georgia,serif;font-style:italic;padding:32px;text-align:center;">' + MTH('sub') + '</p></noscript>';

  /* ── Stop the parser, then surgically replace head + body ──
        window.stop() aborts any pending source parsing, so the
        remainder of the original HTML never renders. Setting
        documentElement.innerHTML wipes the existing head/body
        (which were mid-construction) and installs the maintenance
        content in one synchronous step — no FOUC, no flash. */
  try { window.stop(); } catch (e) {}

  /* Lock the lang + dir attributes BEFORE we paint the maintenance
     content so RTL languages get correct mirror layout from frame one.
     The pre-paint script in the HTML head already set these, but we
     re-affirm here in case maintenance was triggered before that ran. */
  try {
    document.documentElement.lang = MAINT_LANG;
    document.documentElement.dir  = MAINT_IS_RTL ? 'rtl' : 'ltr';
  } catch (e) {}

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
  _wireWaitlist();

  /* ─────────────────────────────────────────────────────────────
     WAITLIST — server-side double opt-in via Netlify Function.

     The maintenance screen is the most-trafficked surface during a
     build window. Capturing emails turns that traffic into a real
     "launch day" mailing list. Posts to
       /.netlify/functions/waitlist-subscribe
     which (1) validates the email server-side, (2) writes to Firestore
     via the Admin SDK, and (3) sends a Brevo confirmation email.

     Client-side guarantees:
     - Honeypot field (hidden input named "website") — bots fill it
     - Time-trap (must wait ≥2s between form render and submit) — bots
       submit instantly
     - Client-side regex pre-check so obvious typos never round-trip
     - Same-origin POST so CSP allows it without extra origins

     Response handling:
     - subscribed             → "check your inbox" success state
     - verification_resent    → "we sent a fresh link" (was unverified)
     - already_subscribed     → "you're already in" friendly nudge
     - invalid_email          → error hint
     - rate_limited           → "too many tries, take a breath"
     - server_error           → generic error hint
     ───────────────────────────────────────────────────────────── */
  function _wireWaitlist() {
    var form      = document.getElementById('aura-waitlist-form');
    var emailEl   = document.getElementById('aura-waitlist-email');
    var btnEl     = document.getElementById('aura-waitlist-btn');
    var hintEl    = document.getElementById('aura-waitlist-hint');
    var wrap      = document.getElementById('aura-waitlist');
    var successEl = document.querySelector('.aura-waitlist-success');
    var titleEl   = document.getElementById('aura-waitlist-success-text');
    var subEl     = document.getElementById('aura-waitlist-success-sub');
    var closeBtn  = document.getElementById('aura-waitlist-success-close');
    var retryBtn  = document.getElementById('aura-waitlist-success-retry');
    var hpEl      = form && form.querySelector('input[name="website"]');
    if (!form || !emailEl || !btnEl) return;

    /* t0 = the moment the form rendered. Anything submitted faster than
       MIN_RENDER_MS after t0 is treated as a bot — both client AND
       server check this. Keep MIN_RENDER_MS small (2s) so real humans
       are never caught by it. */
    var t0 = Date.now();
    var MIN_RENDER_MS = 2 * 1000;

    var _busy = false;
    function setHint(msg, state) {
      if (!hintEl) return;
      hintEl.textContent = msg || '';
      hintEl.classList.remove('is-error');
      hintEl.classList.remove('is-loading');
      hintEl.classList.remove('is-success');
      if (state === 'error')   hintEl.classList.add('is-error');
      if (state === 'loading') hintEl.classList.add('is-loading');
      if (state === 'success') hintEl.classList.add('is-success');
    }
    function setBusy(b) {
      _busy = !!b;
      if (btnEl)   btnEl.disabled  = _busy;
      if (emailEl) emailEl.disabled = _busy;
      if (btnEl)   btnEl.textContent = _busy ? MT('waitlist_sending') : MT('waitlist_cta');
    }
    /* reveal(state) — swap copy + show the focused modal.
       The title (<h2>) and sub (<p>) are now SIBLINGS inside the
       card, so setting textContent is straightforward — no manual
       DOM surgery to preserve a nested span like the old layout. */
    function reveal(state) {
      var titleKey, subKey, isError = false;
      if (state === 'already_subscribed') {
        titleKey = 'waitlist_already';
        subKey   = 'waitlist_already_sub';
      } else if (state === 'verification_resent') {
        titleKey = 'waitlist_resent';
        subKey   = 'waitlist_resent_sub';
      } else if (state === 'email_send_failed') {
        titleKey = 'waitlist_email_failed';
        subKey   = 'waitlist_email_failed_sub';
        isError  = true;
      } else {
        /* default — fresh subscribe */
        titleKey = 'waitlist_success';
        subKey   = 'waitlist_success_sub';
      }
      try {
        if (titleEl) titleEl.textContent = MT(titleKey);
        if (subEl)   subEl.textContent   = MT(subKey);
        if (retryBtn) retryBtn.textContent = MT('waitlist_try_again');
      } catch (_) {}
      if (successEl) {
        successEl.classList.toggle('is-error', isError);
        successEl.setAttribute('aria-hidden', 'false');
      }
      if (wrap) wrap.classList.add('is-success');
      /* Hint area used by inline errors (invalid/rate). Clear it on
         modal reveal so we don't leave a stale message under the
         hidden form. */
      setHint('', '');
      /* Move focus into the modal for keyboard users. Card has tabindex
         so focus call works even without the close button visible. */
      try {
        var firstFocus = (isError && closeBtn) ? closeBtn : (titleEl || successEl);
        if (firstFocus && firstFocus.focus) firstFocus.focus();
      } catch (_) {}
    }

    /* dismiss() — close the modal, restore the form view. Used by
       the close X, the Try-again button, click on backdrop, and Esc.
       Resets the time-trap baseline so a retry doesn't trip the bot
       check. */
    function dismiss() {
      if (wrap) wrap.classList.remove('is-success');
      if (successEl) {
        successEl.classList.remove('is-error');
        successEl.setAttribute('aria-hidden', 'true');
      }
      try { if (emailEl) emailEl.focus(); } catch (_) {}
      t0 = Date.now();
    }

    /* Dismiss handlers */
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    if (retryBtn) retryBtn.addEventListener('click', dismiss);
    if (successEl) {
      successEl.addEventListener('click', function (e) {
        /* Click on the backdrop (not the card) dismisses. */
        if (e.target === successEl) dismiss();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (wrap && wrap.classList.contains('is-success')) dismiss();
    });

    /* Tight client-side regex — rejects obvious typos but stays
       permissive enough not to false-reject real corporate emails.
       Server validates more strictly (disposable, fake patterns). */
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (_busy) return;
      var email = (emailEl.value || '').trim().toLowerCase();
      if (!email || !EMAIL_RE.test(email) || email.length > 254) {
        setHint(MT('waitlist_invalid'), 'error');
        try { emailEl.focus(); } catch (_) {}
        return;
      }
      /* Client-side time-trap. If a bot somehow submits faster than
         MIN_RENDER_MS the server will also reject — but failing fast
         on the client avoids the round-trip. */
      var hp = (hpEl && hpEl.value) || '';

      setBusy(true);
      setHint(MT('waitlist_sending'), 'loading');

      var payload = {
        email:      email,
        lang:       MAINT_LANG,
        sourcePage: (location.pathname || '/').slice(0, 200),
        hp:         hp,
        t0:         t0
      };

      var ENDPOINT = '/.netlify/functions/waitlist-subscribe';

      fetch(ENDPOINT, {
        method:  'POST',
        mode:    'same-origin',
        cache:   'no-store',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      }).then(function (res) {
        return res.json().then(function (data) { return { status: res.status, data: data }; })
                         .catch(function () { return { status: res.status, data: {} }; });
      }).then(function (out) {
        setBusy(false);
        var s = (out.data && out.data.status) || '';
        var detail = (out.data && out.data.detail) || '';
        if (out.status >= 200 && out.status < 300) {
          /* Contract: 200 ONLY when Brevo actually sent the email
             (the function rolls back the Firestore row on send fail
             and returns 500). So a 200 here is a real success — we
             can safely show "Check your email" without lying. */
          if (s === 'already_subscribed') {
            reveal('already_subscribed');
          } else if (s === 'verification_resent') {
            reveal('verification_resent');
          } else {
            reveal('subscribed');
          }
          setHint('', '');
          try { emailEl.value = ''; } catch (_) {}
          /* Reset the time-trap baseline so a repeat submit is honest. */
          t0 = Date.now();
          return;
        }
        if (out.status === 429 || s === 'rate_limited') {
          setHint(MT('waitlist_rate'), 'error');
          return;
        }
        if (out.status === 400 || s === 'invalid_email' || s === 'invalid_request') {
          setHint(MT('waitlist_invalid'), 'error');
          try { emailEl.focus(); } catch (_) {}
          return;
        }
        /* 500 with detail 'email_send_failed' means: Firestore row was
           either rolled back (fresh) or kept with a send-error flag
           (resend). Either way, no confirmation email reached the user.
           Surface this through the focused modal (softer rose variant)
           so the truthfulness contract is honored AND the visual weight
           matches the success states — no fake success, no buried error. */
        if (detail === 'email_send_failed') {
          reveal('email_send_failed');
          try { console.warn('[waitlist] brevo send failed (server-side)'); } catch (_) {}
          return;
        }
        /* Anything else — generic error. The function logs server-side
           detail (firestore_unavailable / firestore_write_failed / …). */
        setHint(MT('waitlist_error'), 'error');
        try { console.warn('[waitlist] non-ok response:', out.status, s, detail); } catch (_) {}
      }).catch(function (err) {
        setBusy(false);
        setHint(MT('waitlist_error'), 'error');
        try { console.warn('[waitlist] network error:', err && err.message); } catch (_) {}
      });
    });
  }

  /* Identity-memory helpers — separate from _wireAdminEntry so the
     hoisting order works regardless of where each is called. We store
     ONLY the admin label (display name) and email. The password is
     never written to localStorage, sessionStorage, Firestore, or any
     other persistence layer; Firebase Auth owns it. */
  function _getRememberedEmail() {
    try {
      var v = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (v && typeof v === 'string' && /\S+@\S+\.\S+/.test(v)) return v;
    } catch (e) {}
    return ADMIN_DEFAULT_EMAIL;
  }
  function _getRememberedLabel() {
    try {
      var v = localStorage.getItem(REMEMBERED_LABEL_KEY);
      if (v && typeof v === 'string' && v.trim()) return v.trim();
    } catch (e) {}
    return ADMIN_DEFAULT_LABEL;
  }
  /* Save the identity of the admin who just signed in. Both fields are
     optional — pass `null` to preserve the previously remembered value
     for that field (e.g. Firebase user with no displayName shouldn't
     clobber an existing label). */
  function _rememberIdentity(email, label) {
    try {
      if (email && typeof email === 'string' && /\S+@\S+\.\S+/.test(email)) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      }
      if (label && typeof label === 'string' && label.trim()) {
        localStorage.setItem(REMEMBERED_LABEL_KEY, label.trim());
      }
    } catch (e) {}
  }

  function _wireAdminEntry() {
    var trigger    = document.getElementById('aura-admin-trigger');
    var overlay    = document.getElementById('aura-admin-overlay');
    var closeBtn   = document.getElementById('aura-admin-close');
    var form       = document.getElementById('aura-admin-form');
    var emailEl    = document.getElementById('aura-admin-email');
    var passEl     = document.getElementById('aura-admin-password');
    var submitEl   = document.getElementById('aura-admin-submit');
    var hintEl     = document.getElementById('aura-admin-hint');
    var forgotEl   = document.getElementById('aura-admin-forgot');
    var identityEl = document.getElementById('aura-admin-identity');
    var nameEl     = document.getElementById('aura-admin-identity-name');
    var avatarEl   = document.getElementById('aura-admin-identity-avatar');
    if (!trigger || !overlay || !form) return;

    var _busy = false;
    var _prevFocus = null;

    function setHint(msg, state) {
      if (!hintEl) return;
      hintEl.textContent = msg || '';
      hintEl.classList.remove('is-error');
      hintEl.classList.remove('is-loading');
      hintEl.classList.remove('is-success');
      if (state === 'error')   hintEl.classList.add('is-error');
      if (state === 'loading') hintEl.classList.add('is-loading');
      if (state === 'success') hintEl.classList.add('is-success');
    }
    /* `busyLabel` is optional: when present (e.g. 'Verifying…') the
       submit button text changes to that label. Forgot-password flow
       passes nothing so the button keeps reading "Enter" while just
       being disabled — the hint area carries the actual status. */
    function setBusy(b, busyLabel) {
      _busy = !!b;
      if (submitEl) {
        submitEl.disabled = _busy;
        if (_busy && busyLabel)      submitEl.textContent = busyLabel;
        else if (!_busy)              submitEl.textContent = 'Enter';
      }
      if (forgotEl) forgotEl.disabled = _busy;
    }
    /* Refresh the identity row (avatar letter + display name) from
       whatever label is currently remembered. Called on every modal
       open so the row reflects the most recent saved admin. */
    function _refreshIdentity() {
      var label = _getRememberedLabel();
      if (nameEl)   nameEl.textContent   = label;
      if (avatarEl) avatarEl.textContent = (label || 'A').charAt(0).toUpperCase();
    }
    function openPanel() {
      _prevFocus = document.activeElement;
      overlay.classList.add('is-visible');
      overlay.setAttribute('aria-hidden', 'false');
      try { document.body.style.overflow = 'hidden'; } catch (e) {}
      setHint('');
      setBusy(false);
      /* Refresh the identity row from whatever label is remembered,
         then pre-fill the email field. Password field stays empty
         every single time — it is never persisted anywhere. */
      _refreshIdentity();
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
      setBusy(true, 'Verifying…');
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
              /* Credentials valid but NOT admin. Log the failed
                 admin attempt for security visibility, then sign
                 out so the non-admin session doesn't quietly persist. */
              try {
                db.collection('analytics_events').add({
                  type: 'admin_login_failed',
                  ts: firebase.firestore.FieldValue.serverTimestamp(),
                  sessionId: 'maint_' + Math.random().toString(36).slice(2, 10),
                  isGuest: false,
                  uid: uid,
                  email: email ? String(email).slice(0, 200) : null,
                  isAdmin: false,
                  path: location.pathname.slice(0, 200),
                  metadata: { reason: 'not_admin' }
                }).catch(function () {});
              } catch (_) {}
              return auth.signOut().catch(function () {}).then(function () {
                var err = new Error('not_admin');
                err.code = 'aura/not-admin';
                throw err;
              });
            }
            /* Admin verified — remember the email that succeeded AND the
               admin's displayName (label) for next time, set the existing
               bypass flag, then reload. Password is NEVER persisted; if
               displayName is empty we pass null so an existing remembered
               label survives. Reload via location.replace so back-button
               can't bring the maintenance gate back during this session. */
            var displayName = (cred.user && cred.user.displayName) ? cred.user.displayName : null;
            _rememberIdentity(email, displayName);
            try { localStorage.setItem(BYPASS_KEY_PERSIST, 'true'); } catch (e) {}
            /* Analytics — admin_login. Fired directly via Firestore since
               window.Aura.track isn't loaded on the maintenance screen.
               Best-effort: failure here is silent (the bypass+reload still
               happen). */
            try {
              db.collection('analytics_events').add({
                type: 'admin_login',
                ts: firebase.firestore.FieldValue.serverTimestamp(),
                sessionId: 'maint_' + Math.random().toString(36).slice(2, 10),
                isGuest: false,
                uid: uid,
                email: email ? String(email).slice(0, 200) : null,
                isAdmin: true,
                path: location.pathname.slice(0, 200),
                device: (function(){var w=window.innerWidth||0;return w<768?'mobile':w<1024?'tablet':'desktop';})()
              }).catch(function () {});
            } catch (_) {}

            /* Compute the post-welcome destination. If the admin landed
               via ?admin=false (which force-clears the flag), strip the
               param so the reload doesn't immediately wipe what we just
               set. Same-origin only — we never honour arbitrary inputs. */
            var dest = window.location.pathname + window.location.search + window.location.hash;
            if (/[?&]admin=/.test(window.location.search)) {
              var clean = window.location.search
                .replace(/[?&]admin=[^&]*/gi, '')
                .replace(/^&/, '?');
              if (clean === '?') clean = '';
              dest = window.location.pathname + clean + window.location.hash;
            }
            dest = dest || '/';

            /* Premium welcome transition — fires ONLY here, inside the
               post-isAdmin-check success branch. Guests, wrong creds,
               and non-admin accounts never reach this code path. */
            _showWelcomeAndContinue(dest);
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

    /* ─────────────────────────────────────────────────────────────
       Premium post-admin-login welcome screen.
       Triggered exclusively from the isAdmin=true success branch
       above. Never fires for guests, wrong credentials, or non-admin
       accounts — it lives downstream of the access check.

       Sequence (≈1.7s total):
         t=0     : hide the modal, body scroll already locked
                   show welcome overlay (background fades in 0.6s)
         t≈80ms : reveal inner content (un-blurs + rises ~1.1s)
         t≈1700ms: window.location.replace(dest) — site loads
       ───────────────────────────────────────────────────────────── */
    function _showWelcomeAndContinue(dest) {
      var welcome = document.getElementById('aura-admin-welcome');
      if (!welcome) {
        /* Defensive fallback: if the welcome DOM is missing for any
           reason, skip the transition and navigate immediately rather
           than stranding the admin on the modal. */
        window.location.replace(dest);
        return;
      }
      /* Hide the modal so the welcome overlay sits over a clean page
         (the modal's z-index is 100, welcome is 200; but visually
         removing the modal is nicer than overlapping it). */
      if (overlay) {
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
      }
      /* Keep body scroll locked through the transition. */
      try { document.body.style.overflow = 'hidden'; } catch (e) {}

      welcome.classList.add('is-visible');
      welcome.setAttribute('aria-hidden', 'false');
      /* Tiny delay before revealing the inner content so the dark
         background fades in first, then the text emerges. */
      requestAnimationFrame(function () {
        setTimeout(function () {
          welcome.classList.add('is-revealed');
        }, 80);
      });

      setTimeout(function () {
        window.location.replace(dest);
      }, 1700);
    }

    /* ─────────────────────────────────────────────────────────────
       "Forgot admin password?" — Firebase password reset flow.

       Sends a Firebase password-reset email to whatever email is
       currently in the field. Firebase Auth is the sole password
       authority; we never see, store, or transmit a new password —
       Firebase emails the admin a magic reset link, they click it,
       set a new password on Firebase's own page, and come back.

       Soft success / error states render in the same hint area as
       the sign-in flow. Both buttons are disabled while a reset is
       in flight so the user can't double-submit.
       ───────────────────────────────────────────────────────────── */
    if (forgotEl) forgotEl.addEventListener('click', function (e) {
      e.preventDefault();
      if (_busy) return;
      var email = (emailEl && emailEl.value || '').trim();
      if (!email) {
        setHint('Enter your admin email first.', 'error');
        try { emailEl.focus(); } catch (_) {}
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setHint('Enter a valid email first.', 'error');
        try { emailEl.focus(); } catch (_) {}
        return;
      }
      setBusy(true); /* no busy label — Enter button just disables */
      setHint('Sending reset email…', 'loading');

      _loadFirebase().then(function () {
        return firebase.auth().sendPasswordResetEmail(email);
      }).then(function () {
        setBusy(false);
        setHint('Password reset email sent to ' + email + '. Check your inbox.', 'success');
      }).catch(function (err) {
        setBusy(false);
        var code = err && err.code;
        var msg;
        if (code === 'auth/user-not-found') {
          msg = 'No account found with that email.';
        } else if (code === 'auth/invalid-email') {
          msg = 'Enter a valid email first.';
        } else if (code === 'auth/too-many-requests') {
          msg = 'Too many requests. Try again in a moment.';
        } else if (code === 'auth/network-request-failed' ||
                   code === 'aura/load-failed' ||
                   code === 'aura/load-timeout') {
          msg = 'Reset unavailable. Try again.';
        } else {
          msg = 'Could not send reset email. Try again.';
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
