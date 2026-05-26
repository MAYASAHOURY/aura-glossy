/* ============================================================
   AURA — i18n runtime + translation dictionaries

   Supported languages:
     en — English (default)
     es — Español
     ar — العربية   (RTL)
     he — עברית    (RTL)

   ── How translation works ─────────────────────────────────────
   HTML elements opt in via attributes:
     data-i18n="nav.home"               → set element.textContent
     data-i18n-html="hero.title"        → set element.innerHTML
     data-i18n-attr="placeholder:login.email_placeholder"
                                        → set the named attribute
     Multiple attrs:   "placeholder:k1;aria-label:k2"

   Dynamic strings call Aura.i18n.t('key.path', { name: 'Maya' }).
   Variables in source strings use {name} placeholders.

   ── How the language is chosen ────────────────────────────────
     1. localStorage.aura_lang  (user-set, persists)
     2. navigator.language       (browser default, suggested)
     3. 'en' fallback

   ── How RTL works ─────────────────────────────────────────────
     setLang('ar' | 'he') sets <html dir="rtl">.
     CSS uses [dir="rtl"] selectors to flip layout where needed.

   ── Pre-paint set ─────────────────────────────────────────────
   A tiny inline <script> in every page <head> sets the lang+dir
   attributes BEFORE first paint, so RTL pages never flash LTR.
   This file handles the rest (text replacement, switcher, etc).
   ============================================================ */
(function () {
  'use strict';

  var LANG_KEY     = 'aura_lang';
  var DEFAULT_LANG = 'en';
  var SUPPORTED    = ['en', 'es', 'ar', 'he'];
  var RTL_LANGS    = ['ar', 'he'];

  /* ── Native display names (shown in the switcher) ─────────── */
  var DISPLAY = {
    en: 'English',
    es: 'Español',
    ar: 'العربية',
    he: 'עברית'
  };

  /* ── Translation dictionaries ─────────────────────────────── */
  var T = {

    en: {
      common: {
        back: 'Back', next: 'Next →', skip: 'Skip', close: 'Close',
        loading: 'Loading…', save: 'Save', cancel: 'Cancel',
        confirm: 'Confirm', delete: 'Delete', remove: 'Remove',
        share: 'Share', edit: 'Edit', done: 'Done', got_it: 'Got it ✦'
      },
      nav: {
        home: 'Home', quiz: 'Style Quiz', aesthetics: 'Aesthetics',
        moodboard: 'Moodboard', community: 'Community', partners: 'Partners',
        account: 'Account', signin: 'Sign in', signout: 'Sign out',
        language: 'Language', open_menu: 'Open menu'
      },
      hero: {
        eyebrow: 'A curated fashion universe',
        title_a: 'Discover your aesthetic.',
        title_b: 'Own your style.',
        cta_quiz: 'Take the Style Quiz',
        cta_explore: 'Explore aesthetics'
      },
      styles: { section_eyebrow: 'Aesthetics', explore: 'Explore' },
      footer: {
        tagline: 'A curated fashion universe.',
        col_discover: 'Discover', col_aesthetics: 'Aesthetics', col_partners: 'Shop partners',
        copyright: '© 2026 Aura Glossy',
        designed: 'Designed with care, dressed with intention.',
        link_quiz: 'Style quiz', link_all: 'All aesthetics',
        link_moodboard: 'Moodboard', link_partners: 'Partners'
      },
      login: {
        title_a: 'Begin your', title_b: 'story.',
        eyebrow: 'Begin your story',
        tab_join: 'Join', tab_signin: 'Sign in',
        name_placeholder: 'Your name',
        email_placeholder: 'Email address',
        new_password_placeholder: 'Create password',
        password_placeholder: 'Password',
        create_account: 'Create account →',
        signin_btn: 'Sign in →',
        already_member: 'Already a member?',
        new_here: 'New here?',
        signin_link: 'Sign in',
        create_link: 'Create account',
        creating: 'Creating account…',
        signing_in: 'Signing in…',
        redirecting: 'Redirecting…',
        /* Password visibility toggle */
        show_password: 'Show password',
        hide_password: 'Hide password',
        /* Forgot password / reset flow */
        forgot_password: 'Forgot password?',
        reset_title: 'Reset your password',
        reset_body: "Enter your email and we'll send you a reset link.",
        reset_email_placeholder: 'Email address',
        reset_send: 'Send reset link',
        reset_sending: 'Sending…',
        reset_success: 'Check your email for the reset link.',
        reset_close: 'Close',
        err_reset_invalid: 'Please enter a valid email address.',
        err_reset_no_user: 'No account found with this email.',
        err_reset_network: 'No internet connection. Please check your network.',
        err_reset_generic: "Couldn't send reset email. Please try again.",
        /* Standard errors */
        err_email: 'Please enter a valid email address.',
        err_password: 'Please enter your password.',
        err_password_short: 'Password must be at least 6 characters.',
        err_fill: 'Please fill in all fields.',
        err_already: 'This email is already registered.',
        err_invalid_email: 'Invalid email address.',
        err_weak: 'Password must be at least 6 characters.',
        err_no_user: 'No account found with this email.',
        err_wrong_pw: 'Incorrect password.',
        err_bad_cred: 'Incorrect email or password.',
        err_network: 'No internet connection. Please check your network.',
        err_too_many: 'Too many attempts. Please wait a moment and try again.',
        err_disabled: 'This account has been disabled.',
        err_generic: 'Something went wrong. Please try again.',
        err_rate: 'Too many attempts. Please wait {secs} seconds.',
        /* Email-verification screen (2026-05-25). Shown when an email/password
           account hasn't clicked the verification link yet. Google accounts
           skip this entirely (auto-verified by Google). */
        verify_check_inbox:    'Check your inbox…',
        verify_sending:        'Sending…',
        verify_sent:           'Verification email sent. Check your inbox.',
        verify_too_many:       'Too many requests. Please wait a few minutes and try again.',
        verify_send_failed:    'Could not send verification email. Please try again.',
        verify_wait:           'Please wait {secs}s before sending another.',
        verify_checking:       'Checking…',
        verify_success:        'Verified ✓ Redirecting…',
        verify_still_pending:  'Still not verified. Check your inbox for the link.',
        verify_recheck_failed: 'Could not check just now. Try again in a moment.',
        /* In-app browser banner */
        iab_title: 'For the best sign-in experience, open Aura in your browser.',
        iab_sub: "You're inside an in-app browser. Sign-in works here, but is faster and more reliable in Safari, Chrome, or your default browser.",
        iab_open: 'Open in browser',
        iab_copy: 'Copy link',
        iab_copied: 'Link copied ✓',
        iab_use_menu: 'Tap … menu → Open in browser',
        /* Stall watchdog copy */
        stall_inapp: "Sign-in is slow inside the in-app browser. If it doesn't finish, tap \"Open in browser\" above and try again.",
        stall_generic: 'Sign-in is taking longer than expected. Check your connection, or try again.',
        /* Brand-moment preroll (~1.5s) */
        preroll_sub: 'discover your aesthetic',
        /* Premium value proposition — three benefit lines + free-signup tag.
           The <em> markup is preserved (data-i18n-html) and italicizes the
           noun in each language. */
        value_aesthetic: 'Discover your <em>aesthetic.</em>',
        value_community: 'Join your style <em>community.</em>',
        value_outfits:   'Save outfits you <em>love.</em>',
        value_cta:       'Sign up — free. <span class="auth-value-spark">✦</span>'
      },
      quiz: {
        page_eyebrow: 'Find your aesthetic',
        question: 'Question {n}',
        help_btn: 'Help me',
        modal_title: 'No wrong answers.',
        modal_body: "Just pick the option that feels most natural — your instinct is always right.",
        see_result: 'See result →',
        result_eyebrow: 'Your aesthetic',
        save_result: 'Save to moodboard',
        share_result: 'Share my result',
        retake: 'Retake the quiz',
        /* Per-question translations. Order matches QUIZ in js/data.js
           (do NOT reorder — quiz.html maps by array index). For each
           question we provide q (the question), hint (under-title
           guidance), helpText (text inside the "Help me" modal), and
           parallel arrays for the four option labels and their moods
           — same order as the four `options` in data.js. */
        questions: [
          {
            q:        'What kind of outfits make you feel most like yourself?',
            hint:     "Think about what you'd actually wear on a free day — not what's trending, just what feels right.",
            helpText: "There's no wrong answer here. Just picture opening your wardrobe on a relaxed morning — which energy are you most drawn to?",
            options:  ['Polished and put together', 'Easy and comfortable', 'Bold and unapologetic', 'Quiet and minimal'],
            moods:    ['blazers, structure, clean lines', 'soft fabrics, relaxed fits, casual ease', 'statement pieces, loud energy', 'neutral tones, simple cuts, nothing extra']
          },
          {
            q:        'Which color world feels most like home?',
            hint:     "Which of these palettes feels most calming, exciting, or simply most \"you\"?",
            helpText: "Colors reflect personality more than we think. Just pick the palette you'd most likely fill your wardrobe — or your bedroom — with.",
            options:  ['Cream, oat, ivory', 'Blush, pearl, soft rose', 'Pastel pink and lace', 'Pink chrome and bubblegum'],
            moods:    ['soft, serene, barely-there', 'delicate, feminine, warm', 'sweet, dreamy, romantic', 'playful, glossy, nostalgic']
          },
          {
            q:        'Your ideal Saturday looks like…',
            hint:     'Just pick the scene that instantly makes you feel happy and at home.',
            helpText: "The environments we love tend to mirror the aesthetics we dress in. Whether it's a cosy café or a bustling city street — it all connects.",
            options:  ['A pastel café with a book', 'A quiet wine bar at dinner', 'City streets with friends', 'Hunting through a vintage market'],
            moods:    ['soft lighting, matcha, a pretty corner', 'candlelight, elegance, slow evenings', 'music, energy, exploring everywhere', 'old treasures, Sunday morning, finds']
          },
          {
            q:        'If you could only wear one pair of shoes forever…',
            hint:     'Forget practicality — which one just feels most like you?',
            helpText: "Shoes are one of the most honest parts of an outfit. Your instinctive pick says a lot about your real style personality.",
            options:  ['White sneakers', 'Leather loafers', 'Heels or satin mules', 'Mary Janes or ballet flats'],
            moods:    ['clean, versatile, effortless', 'polished, quiet, timeless', 'elevated, feminine, intentional', 'soft, sweet, effortlessly pretty']
          },
          {
            q:        "Whose style makes you think \"I wish that was mine\"?",
            hint:     "Go with your gut — whichever vibe feels most exciting, not most realistic.",
            helpText: "We're not asking who you are — we're asking who you'd love to dress like for a week. That instinctive pull tells us the aesthetic you're most drawn to.",
            options:  ['Audrey Hepburn — timeless', 'A K-pop idol with an iced americano', 'Paris Hilton circa 2003', 'A 70s flower child'],
            moods:    ['pearls, trench coats, quiet perfection', 'cute layers, effortless cool, Seoul style', 'pink everything, mini skirts, born iconic', 'suede boots, flared jeans, vintage charm']
          },
          {
            q:        'When you dress in the morning, you reach for…',
            hint:     "Just the most natural picture of you getting dressed — coverage, comfort, layering, mood.",
            helpText: "How we layer says a lot about identity. There's no right answer — pick what feels honest to you on a typical morning.",
            options:  ['Soft layered coverage, head to toe', 'Refined modesty with elegant lines', 'A statement dress and minimal layers', 'Effortless and breezy'],
            moods:    ['flowing pieces, abaya, intentional draping', 'tailored coverage, quiet confidence, polish', 'one piece does the work, less is more', 'light fabrics, easy movement, no fuss']
          }
        ]
      },
      community: {
        page_eyebrow: 'Your style circle',
        page_title_a: 'The', page_title_b: 'community.',
        composer_placeholder: 'Share an outfit, a look, a moment…',
        composer_img_placeholder: 'Add an image URL (optional)',
        post_btn: 'Post',
        comment_placeholder: 'Add a comment…',
        comment_send: 'Send',
        show_comments: 'Show comments',
        hide_comments: 'Hide comments',
        empty_title: 'Your circle is quiet.',
        empty_body: 'Be the first to share a look.',
        no_comments: 'No comments yet. Be the first.',
        delete_post: 'Delete post',
        delete_confirm: 'Delete this post?',
        liked: 'Liked', like: 'Like',
        /* Hub + circle access UI (added 2026-05-26 — replaces
           hard-coded English so RTL + ES users see translated
           buttons in the hub and access modals). Aesthetic names
           are passed as {name}/{own} variables and are NOT
           translated — they remain in EN with dir="ltr" inline
           where rendered, per the established convention. */
        enter_circle:           'Enter Circle →',
        enter_my_community:     'Enter My Community →',
        your_circle_badge:      'Your Circle',
        your_community:         'Your community',
        admin_eyebrow:          'Admin Access',
        admin_title:            'All circles open.',
        admin_sub:              'Every community is accessible.',
        not_sure_eyebrow:       'Not sure yet?',
        find_aesthetic_title:   'Find your aesthetic.',
        find_aesthetic_sub:     'Take the 5-minute style quiz to unlock your exclusive community circle.',
        already_took_btn:       'Already took the quiz? Reload ↻',
        circles_eyebrow:        'Private Circles',
        find_community_title:   'Find your community.',
        find_community_sub:     'Take the style quiz to discover your aesthetic and unlock your exclusive circle.',
        welcome_back:           'Welcome back.',
        you_belong_to:          'You belong to the {name} circle.'
      },
      /* Modal copy for the access-control overlay shown when a non-
         admin tries to enter a circle that isn't theirs (or before
         they've taken the quiz). Aesthetic names interpolate via
         {name}/{own} and stay in English regardless of locale. */
      access: {
        no_quiz_title:          'Discover your aesthetic first',
        no_quiz_body:           'Take the style quiz to unlock your exclusive community circle.',
        take_quiz_btn:          'Take the Style Quiz →',
        not_now:                'Not now',
        wrong_circle_title:     "This isn't your style circle",
        wrong_circle_body:      'The {name} community is a private group.',
        wrong_circle_yours:     'Your community is {own}.',
        go_to_my_circle:        'Go to my circle →',
        close:                  'Close',
        profile_changed_title:  'Your style profile changed',
        profile_changed_body:   'Take the quiz again to unlock your community.',
        aesthetic_changed_title:'Your aesthetic just changed',
        aesthetic_changed_body: "You're now part of the {name} circle. Access to your previous circle has been closed.",
        enter_cta:              'Enter {name} →',
        stay_in_hub:            'Stay in the hub'
      },
      quiz_guest: {
        title:       'Sign in to take the quiz',
        sub:         'Create your Aura profile to discover your aesthetic, save your result, and unlock your style circle.',
        create:      'Create account',
        signin:      'Sign in',
        continue:    'Continue browsing'
      },
      moodboard: {
        eyebrow: 'Your collection',
        title_a: 'Your', title_b: 'moodboard.',
        intro: "Every look you've saved across the platform. Tap any image to remove it.",
        empty_title: 'Your moodboard is empty',
        empty_body: "Save outfits across the platform and they'll collect here.",
        empty_cta: 'Start exploring',
        teaser_heading: 'A taste of what you can save',
        count_one: '{n} look saved',
        count_many: '{n} looks saved',
        clear_all: 'Clear all',
        filter_all: 'All ({n})'
      },
      settings: {
        eyebrow: 'Your profile',
        title_a: 'Account', title_b: 'settings.',
        row_name: 'Name', row_email: 'Email', row_provider: 'Provider',
        row_aesthetic: 'Aesthetic', row_community: 'Community',
        row_moodboard: 'Moodboard', row_liked: 'Liked', row_viewed: 'Viewed',
        row_joined: 'Joined', row_language: 'Language',
        signout_btn: 'Sign Out',
        my_circle: 'My Style Circle →',
        moodboard_link: 'View Moodboard →',
        quiz_link: 'Take the style quiz →',
        replay_guide: 'Replay Aura Guide ✦',
        back_home: 'Back to Homepage',
        no_quiz_yet: 'Not taken yet'
      },
      onboarding: {
        /* Step 1 — Welcome (centered card, no spotlight) */
        welcome_headline: 'Welcome to Aura Glossy.',
        welcome_body:     "We'll take you on a quick tour. It only takes a few steps.",
        next_show:        'Next →',
        skip_tour:        'Skip tour',

        /* Step 2 — Style Quiz (spotlight on hero CTA) */
        quiz_headline:    'Start with a quick quiz.',
        quiz_body:        'It helps Aura discover your style.',

        /* Step 3 — Community (opens menu, spotlight on link) */
        community_headline: 'This is your community.',
        community_body:     'Based on your quiz answers.',

        /* Step 4 — Aesthetics (spotlight on Explore Aesthetics button) */
        aesthetics_headline: 'You can also explore more aesthetics.',
        aesthetics_body:     'Browse all aesthetic circles.',

        /* Step 5 — Final (centered card, single CTA) */
        final_headline:   "In the end, let's start.",
        final_body:       "You're all set. Let's begin your journey.",
        next_final:       "Let's Go →",

        eyebrow:          'Aura Guide'
      },
      lang_switcher: {
        label: 'Language',
        current: 'Current language'
      },
      offline: 'No internet connection — some features may not work'
    },

    es: {
      common: {
        back: 'Atrás', next: 'Siguiente →', skip: 'Saltar', close: 'Cerrar',
        loading: 'Cargando…', save: 'Guardar', cancel: 'Cancelar',
        confirm: 'Confirmar', delete: 'Eliminar', remove: 'Quitar',
        share: 'Compartir', edit: 'Editar', done: 'Listo', got_it: 'Entendido ✦'
      },
      nav: {
        home: 'Inicio', quiz: 'Quiz de Estilo', aesthetics: 'Estéticas',
        moodboard: 'Moodboard', community: 'Comunidad', partners: 'Marcas',
        account: 'Cuenta', signin: 'Iniciar sesión', signout: 'Cerrar sesión',
        language: 'Idioma', open_menu: 'Abrir menú'
      },
      hero: {
        eyebrow: 'Un universo de moda curado',
        title_a: 'Descubre tu estética.',
        title_b: 'Vive tu estilo.',
        cta_quiz: 'Hacer el quiz de estilo',
        cta_explore: 'Explorar estéticas'
      },
      styles: { section_eyebrow: 'Estéticas', explore: 'Explorar' },
      footer: {
        tagline: 'Un universo de moda curado.',
        col_discover: 'Descubrir', col_aesthetics: 'Estéticas', col_partners: 'Tiendas',
        copyright: '© 2026 Aura Glossy',
        designed: 'Diseñado con cuidado, vestido con intención.',
        link_quiz: 'Quiz de estilo', link_all: 'Todas las estéticas',
        link_moodboard: 'Moodboard', link_partners: 'Marcas'
      },
      login: {
        title_a: 'Empieza tu', title_b: 'historia.',
        eyebrow: 'Empieza tu historia',
        tab_join: 'Crear cuenta', tab_signin: 'Iniciar sesión',
        name_placeholder: 'Tu nombre',
        email_placeholder: 'Correo electrónico',
        new_password_placeholder: 'Crea una contraseña',
        password_placeholder: 'Contraseña',
        create_account: 'Crear cuenta →',
        signin_btn: 'Iniciar sesión →',
        already_member: '¿Ya eres miembro?',
        new_here: '¿Nuevo aquí?',
        signin_link: 'Inicia sesión',
        create_link: 'Crea una cuenta',
        creating: 'Creando cuenta…',
        signing_in: 'Iniciando sesión…',
        redirecting: 'Redirigiendo…',
        /* Password visibility toggle */
        show_password: 'Mostrar contraseña',
        hide_password: 'Ocultar contraseña',
        /* Forgot password / reset flow */
        forgot_password: '¿Olvidaste tu contraseña?',
        reset_title: 'Recuperar tu contraseña',
        reset_body: 'Introduce tu correo y te enviaremos un enlace para restablecerla.',
        reset_email_placeholder: 'Correo electrónico',
        reset_send: 'Enviar enlace',
        reset_sending: 'Enviando…',
        reset_success: 'Revisa tu correo para encontrar el enlace.',
        reset_close: 'Cerrar',
        err_reset_invalid: 'Introduce un correo electrónico válido.',
        err_reset_no_user: 'No existe una cuenta con este correo.',
        err_reset_network: 'Sin conexión a internet. Revisa tu red.',
        err_reset_generic: 'No se pudo enviar el correo. Inténtalo de nuevo.',
        /* Standard errors */
        err_email: 'Introduce un correo electrónico válido.',
        err_password: 'Introduce tu contraseña.',
        err_password_short: 'La contraseña debe tener al menos 6 caracteres.',
        err_fill: 'Completa todos los campos.',
        err_already: 'Este correo ya está registrado.',
        err_invalid_email: 'Correo electrónico inválido.',
        err_weak: 'La contraseña debe tener al menos 6 caracteres.',
        err_no_user: 'No existe una cuenta con este correo.',
        err_wrong_pw: 'Contraseña incorrecta.',
        err_bad_cred: 'Correo o contraseña incorrectos.',
        err_network: 'Sin conexión a internet. Revisa tu red.',
        err_too_many: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
        err_disabled: 'Esta cuenta ha sido deshabilitada.',
        err_generic: 'Algo salió mal. Inténtalo de nuevo.',
        err_rate: 'Demasiados intentos. Espera {secs} segundos.',
        /* Email-verification screen */
        verify_check_inbox:    'Revisa tu bandeja…',
        verify_sending:        'Enviando…',
        verify_sent:           'Correo de verificación enviado. Revisa tu bandeja.',
        verify_too_many:       'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.',
        verify_send_failed:    'No se pudo enviar el correo de verificación. Inténtalo de nuevo.',
        verify_wait:           'Espera {secs}s antes de enviar otro.',
        verify_checking:       'Verificando…',
        verify_success:        'Verificado ✓ Redirigiendo…',
        verify_still_pending:  'Aún no verificado. Revisa tu bandeja para el enlace.',
        verify_recheck_failed: 'No se pudo verificar en este momento. Inténtalo en un momento.',
        iab_title: 'Para una mejor experiencia de inicio de sesión, abre Aura en tu navegador.',
        iab_sub: 'Estás dentro de un navegador integrado. El inicio de sesión funciona aquí, pero es más rápido y fiable en Safari, Chrome o tu navegador predeterminado.',
        iab_open: 'Abrir en el navegador',
        iab_copy: 'Copiar enlace',
        iab_copied: 'Enlace copiado ✓',
        iab_use_menu: 'Toca el menú … → Abrir en el navegador',
        stall_inapp: 'El inicio de sesión es lento dentro del navegador integrado. Si no se completa, toca "Abrir en el navegador" arriba y vuelve a intentarlo.',
        stall_generic: 'El inicio de sesión está tardando más de lo esperado. Revisa tu conexión o inténtalo de nuevo.',
        preroll_sub: 'descubre tu estética',
        value_aesthetic: 'Descubre tu <em>estética.</em>',
        value_community: 'Únete a tu <em>comunidad</em> de estilo.',
        value_outfits:   'Guarda los looks que <em>amas.</em>',
        value_cta:       'Regístrate gratis. <span class="auth-value-spark">✦</span>'
      },
      quiz: {
        page_eyebrow: 'Encuentra tu estética',
        question: 'Pregunta {n}',
        help_btn: 'Ayuda',
        modal_title: 'No hay respuestas incorrectas.',
        modal_body: 'Elige lo que te sienta más natural — tu instinto siempre acierta.',
        see_result: 'Ver resultado →',
        result_eyebrow: 'Tu estética',
        save_result: 'Guardar en moodboard',
        share_result: 'Compartir mi resultado',
        retake: 'Volver a hacer el quiz',
        questions: [
          {
            q:        '¿Qué tipo de outfits te hacen sentir más tú misma?',
            hint:     "Piensa en lo que realmente te pondrías un día libre — no lo que está de moda, solo lo que se siente bien.",
            helpText: "Aquí no hay respuestas equivocadas. Imagina abrir tu armario en una mañana tranquila — ¿a qué energía te sientes más atraída?",
            options:  ['Pulido y elegante', 'Cómodo y relajado', 'Atrevido y sin disculpas', 'Silencioso y minimalista'],
            moods:    ['blazers, estructura, líneas limpias', 'tejidos suaves, cortes relajados, comodidad casual', 'piezas con statement, energía intensa', 'tonos neutros, cortes simples, nada de más']
          },
          {
            q:        '¿Qué mundo de color te siente más como en casa?',
            hint:     "¿Cuál de estas paletas te resulta más calmante, emocionante, o simplemente más \"tú\"?",
            helpText: "Los colores reflejan personalidad más de lo que creemos. Elige la paleta con la que llenarías tu armario — o tu habitación.",
            options:  ['Crema, avena, marfil', 'Rubor, perla, rosa suave', 'Rosa pastel y encaje', 'Rosa cromado y chicle'],
            moods:    ['suave, sereno, apenas presente', 'delicado, femenino, cálido', 'dulce, soñador, romántico', 'juguetón, brillante, nostálgico']
          },
          {
            q:        'Tu sábado ideal se ve como…',
            hint:     'Elige la escena que te hace sentir feliz y en casa al instante.',
            helpText: "Los entornos que amamos suelen reflejar las estéticas que vestimos. Sea un café acogedor o una calle bulliciosa — todo está conectado.",
            options:  ['Un café pastel con un libro', 'Un wine bar tranquilo a la hora de cenar', 'Calles de la ciudad con amigos', 'Buscando en un mercado vintage'],
            moods:    ['luz suave, matcha, un rincón bonito', 'luz de velas, elegancia, noches lentas', 'música, energía, explorando por todas partes', 'tesoros antiguos, domingo por la mañana, hallazgos']
          },
          {
            q:        'Si solo pudieras llevar un par de zapatos para siempre…',
            hint:     'Olvida la practicidad — ¿cuál se siente más como tú?',
            helpText: "Los zapatos son una de las partes más honestas de un outfit. Tu elección instintiva dice mucho de tu verdadera personalidad de estilo.",
            options:  ['Zapatillas blancas', 'Mocasines de cuero', 'Tacones o mules de satén', 'Mary Janes o bailarinas'],
            moods:    ['limpias, versátiles, sin esfuerzo', 'pulidos, silenciosos, atemporales', 'elevado, femenino, intencional', 'suave, dulce, bonito sin esfuerzo']
          },
          {
            q:        "¿De quién es el estilo que te hace pensar \"ojalá fuera el mío\"?",
            hint:     "Sigue tu instinto — el vibe que más te emocione, no el más realista.",
            helpText: "No te preguntamos quién eres — te preguntamos como quién te encantaría vestir durante una semana. Esa atracción instintiva nos dice qué estética te llama más.",
            options:  ['Audrey Hepburn — atemporal', 'Un ídolo K-pop con un americano helado', 'Paris Hilton hacia 2003', 'Una hija de las flores de los 70'],
            moods:    ['perlas, trench coats, perfección silenciosa', 'capas adorables, cool sin esfuerzo, estilo Seúl', 'todo rosa, mini faldas, ícono de nacimiento', 'botas de ante, jeans acampanados, encanto vintage']
          },
          {
            q:        '¿Qué es lo primero que eliges al vestirte por la mañana?',
            hint:     'La imagen más natural de ti vistiéndote — cobertura, comodidad, capas, ánimo.',
            helpText: 'Cómo nos vestimos en capas dice mucho sobre la identidad. No hay respuesta incorrecta — elige lo que te resulta más honesto.',
            options:  ['Cobertura suave en capas, de pies a cabeza', 'Modestia refinada con líneas elegantes', 'Un vestido statement con mínimas capas', 'Ligero y con flow'],
            moods:    ['piezas fluidas, abaya, drapeados intencionales', 'cobertura sartorial, confianza silenciosa, pulido', 'una pieza lo dice todo, menos es más', 'tejidos ligeros, movimiento fácil, sin esfuerzo']
          }
        ]
      },
      community: {
        page_eyebrow: 'Tu círculo de estilo',
        page_title_a: 'La', page_title_b: 'comunidad.',
        composer_placeholder: 'Comparte un look, un outfit, un momento…',
        composer_img_placeholder: 'Añade una URL de imagen (opcional)',
        post_btn: 'Publicar',
        comment_placeholder: 'Añade un comentario…',
        comment_send: 'Enviar',
        show_comments: 'Ver comentarios',
        hide_comments: 'Ocultar comentarios',
        empty_title: 'Tu círculo está en silencio.',
        empty_body: 'Sé el primero en compartir un look.',
        no_comments: 'Aún no hay comentarios. Sé el primero.',
        delete_post: 'Eliminar publicación',
        delete_confirm: '¿Eliminar esta publicación?',
        liked: 'Me gusta', like: 'Me gusta',
        enter_circle:           'Entrar al círculo →',
        enter_my_community:     'Entrar a mi comunidad →',
        your_circle_badge:      'Tu círculo',
        your_community:         'Tu comunidad',
        admin_eyebrow:          'Acceso de administrador',
        admin_title:            'Todos los círculos abiertos.',
        admin_sub:              'Cada comunidad es accesible.',
        not_sure_eyebrow:       '¿No estás segura?',
        find_aesthetic_title:   'Encuentra tu estética.',
        find_aesthetic_sub:     'Haz el quiz de estilo de 5 minutos para desbloquear tu círculo exclusivo.',
        already_took_btn:       '¿Ya hiciste el quiz? Recargar ↻',
        circles_eyebrow:        'Círculos privados',
        find_community_title:   'Encuentra tu comunidad.',
        find_community_sub:     'Haz el quiz de estilo para descubrir tu estética y desbloquear tu círculo exclusivo.',
        welcome_back:           'Bienvenida de nuevo.',
        you_belong_to:          'Perteneces al círculo {name}.'
      },
      access: {
        no_quiz_title:          'Descubre tu estética primero',
        no_quiz_body:           'Haz el quiz de estilo para desbloquear tu círculo exclusivo.',
        take_quiz_btn:          'Hacer el quiz de estilo →',
        not_now:                'Ahora no',
        wrong_circle_title:     'Este no es tu círculo de estilo',
        wrong_circle_body:      'La comunidad {name} es un grupo privado.',
        wrong_circle_yours:     'Tu comunidad es {own}.',
        go_to_my_circle:        'Ir a mi círculo →',
        close:                  'Cerrar',
        profile_changed_title:  'Tu perfil de estilo cambió',
        profile_changed_body:   'Haz el quiz de nuevo para desbloquear tu comunidad.',
        aesthetic_changed_title:'Tu estética cambió',
        aesthetic_changed_body: 'Ahora formas parte del círculo {name}. El acceso a tu círculo anterior se ha cerrado.',
        enter_cta:              'Entrar a {name} →',
        stay_in_hub:            'Quedarme en el inicio'
      },
      quiz_guest: {
        title:       'Inicia sesión para hacer el quiz',
        sub:         'Crea tu perfil de Aura para descubrir tu estética, guardar tu resultado y desbloquear tu círculo de estilo.',
        create:      'Crear cuenta',
        signin:      'Iniciar sesión',
        continue:    'Seguir explorando'
      },
      moodboard: {
        eyebrow: 'Tu colección',
        title_a: 'Tu', title_b: 'moodboard.',
        intro: 'Cada look que has guardado en la plataforma. Toca cualquier imagen para quitarlo.',
        empty_title: 'Tu moodboard está vacío',
        empty_body: 'Guarda outfits por la plataforma y aparecerán aquí.',
        empty_cta: 'Empezar a explorar',
        teaser_heading: 'Una muestra de lo que puedes guardar',
        count_one: '{n} look guardado',
        count_many: '{n} looks guardados',
        clear_all: 'Vaciar todo',
        filter_all: 'Todos ({n})'
      },
      settings: {
        eyebrow: 'Tu perfil',
        title_a: 'Ajustes de', title_b: 'cuenta.',
        row_name: 'Nombre', row_email: 'Correo', row_provider: 'Proveedor',
        row_aesthetic: 'Estética', row_community: 'Comunidad',
        row_moodboard: 'Moodboard', row_liked: 'Me gusta', row_viewed: 'Vistos',
        row_joined: 'Miembro desde', row_language: 'Idioma',
        signout_btn: 'Cerrar sesión',
        my_circle: 'Mi círculo de estilo →',
        moodboard_link: 'Ver mi Moodboard →',
        quiz_link: 'Hacer el quiz de estilo →',
        replay_guide: 'Repetir la guía de Aura ✦',
        back_home: 'Volver a inicio',
        no_quiz_yet: 'Aún no realizado'
      },
      onboarding: {
        welcome_headline:   'Bienvenido a Aura Glossy.',
        welcome_body:       'Te llevaremos por un tour rápido. Solo unos pasos.',
        next_show:          'Siguiente →',
        skip_tour:          'Saltar tour',

        quiz_headline:      'Empieza con un quiz rápido.',
        quiz_body:          'Ayuda a Aura a descubrir tu estilo.',

        community_headline: 'Esta es tu comunidad.',
        community_body:     'Basada en tus respuestas del quiz.',

        aesthetics_headline:'También puedes explorar más estéticas.',
        aesthetics_body:    'Navega por todos los círculos de estética.',

        final_headline:     'Para terminar, empecemos.',
        final_body:         'Ya está todo listo. Empieza tu camino.',
        next_final:         '¡Vamos! →',

        eyebrow:            'Guía de Aura'
      },
      lang_switcher: {
        label: 'Idioma',
        current: 'Idioma actual'
      },
      offline: 'Sin conexión a internet — algunas funciones pueden no estar disponibles'
    },

    ar: {
      common: {
        back: 'رجوع', next: 'التالي ←', skip: 'تخطّي', close: 'إغلاق',
        loading: 'جارٍ التحميل…', save: 'حفظ', cancel: 'إلغاء',
        confirm: 'تأكيد', delete: 'حذف', remove: 'إزالة',
        share: 'مشاركة', edit: 'تعديل', done: 'تم', got_it: 'حسناً ✦'
      },
      nav: {
        home: 'الرئيسية', quiz: 'اختبار الستايل', aesthetics: 'الجماليات',
        moodboard: 'لوحة الإلهام', community: 'المجتمع', partners: 'الشركاء',
        account: 'الحساب', signin: 'تسجيل الدخول', signout: 'تسجيل الخروج',
        language: 'اللغة', open_menu: 'فتح القائمة'
      },
      hero: {
        eyebrow: 'عالم موضة منسّق بعناية',
        title_a: 'اكتشف جماليّتك.',
        title_b: 'عش أسلوبك.',
        cta_quiz: 'ابدأ اختبار الستايل',
        cta_explore: 'استكشاف الجماليات'
      },
      styles: { section_eyebrow: 'الجماليات', explore: 'استكشاف' },
      footer: {
        tagline: 'عالم موضة منسّق بعناية.',
        col_discover: 'اكتشف', col_aesthetics: 'الجماليات', col_partners: 'متاجر الشركاء',
        copyright: '© 2026 Aura Glossy',
        designed: 'صُمّم بعناية، يُلبَس بقصد.',
        link_quiz: 'اختبار الستايل', link_all: 'كل الجماليات',
        link_moodboard: 'لوحة الإلهام', link_partners: 'الشركاء'
      },
      login: {
        title_a: 'ابدأ', title_b: 'قصتك.',
        eyebrow: 'ابدأ قصتك',
        tab_join: 'انضمام', tab_signin: 'تسجيل الدخول',
        name_placeholder: 'اسمك',
        email_placeholder: 'البريد الإلكتروني',
        new_password_placeholder: 'أنشئ كلمة المرور',
        password_placeholder: 'كلمة المرور',
        create_account: 'إنشاء حساب ←',
        signin_btn: 'تسجيل الدخول ←',
        already_member: 'لديك حساب بالفعل؟',
        new_here: 'جديد هنا؟',
        signin_link: 'سجّل الدخول',
        create_link: 'أنشئ حساباً',
        creating: 'جارٍ إنشاء الحساب…',
        signing_in: 'جارٍ تسجيل الدخول…',
        redirecting: 'جارٍ التحويل…',
        /* Password visibility toggle */
        show_password: 'إظهار كلمة المرور',
        hide_password: 'إخفاء كلمة المرور',
        /* Forgot password / reset flow */
        forgot_password: 'نسيت كلمة المرور؟',
        reset_title: 'إعادة تعيين كلمة المرور',
        reset_body: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.',
        reset_email_placeholder: 'البريد الإلكتروني',
        reset_send: 'إرسال الرابط',
        reset_sending: 'جارٍ الإرسال…',
        reset_success: 'تحقق من بريدك الإلكتروني للحصول على الرابط.',
        reset_close: 'إغلاق',
        err_reset_invalid: 'يرجى إدخال بريد إلكتروني صحيح.',
        err_reset_no_user: 'لا يوجد حساب بهذا البريد الإلكتروني.',
        err_reset_network: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة.',
        err_reset_generic: 'تعذّر إرسال البريد. يرجى المحاولة مرة أخرى.',
        /* Standard errors */
        err_email: 'يرجى إدخال بريد إلكتروني صحيح.',
        err_password: 'يرجى إدخال كلمة المرور.',
        err_password_short: 'يجب أن تتكوّن كلمة المرور من 6 أحرف على الأقل.',
        err_fill: 'يرجى ملء جميع الحقول.',
        err_already: 'هذا البريد مسجّل من قبل.',
        err_invalid_email: 'بريد إلكتروني غير صحيح.',
        err_weak: 'يجب أن تتكوّن كلمة المرور من 6 أحرف على الأقل.',
        err_no_user: 'لا يوجد حساب بهذا البريد الإلكتروني.',
        err_wrong_pw: 'كلمة المرور غير صحيحة.',
        err_bad_cred: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        err_network: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة.',
        err_too_many: 'محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مجدداً.',
        err_disabled: 'تم تعطيل هذا الحساب.',
        err_generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        err_rate: 'محاولات كثيرة. يرجى الانتظار {secs} ثانية.',
        /* شاشة التحقق من البريد الإلكتروني */
        verify_check_inbox:    'تحققي من بريدك الإلكتروني…',
        verify_sending:        'جارٍ الإرسال…',
        verify_sent:           'تم إرسال رسالة التحقق. تحققي من بريدك الإلكتروني.',
        verify_too_many:       'طلبات كثيرة جدًا. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.',
        verify_send_failed:    'تعذر إرسال رسالة التحقق. يرجى المحاولة مرة أخرى.',
        verify_wait:           'يرجى الانتظار {secs} ثانية قبل الإرسال مرة أخرى.',
        verify_checking:       'جارٍ التحقق…',
        verify_success:        'تم التحقق ✓ جارٍ التحويل…',
        verify_still_pending:  'لم يتم التحقق بعد. تحققي من بريدك للحصول على الرابط.',
        verify_recheck_failed: 'تعذر التحقق الآن. حاولي بعد قليل.',
        iab_title: 'للحصول على أفضل تجربة تسجيل دخول، افتح أورا في متصفحك.',
        iab_sub: 'أنت داخل متصفح مدمج. تسجيل الدخول يعمل هنا، ولكنه أسرع وأكثر موثوقية في سفاري أو كروم أو متصفحك الافتراضي.',
        iab_open: 'فتح في المتصفح',
        iab_copy: 'نسخ الرابط',
        iab_copied: 'تم نسخ الرابط ✓',
        iab_use_menu: 'اضغطي على قائمة … → فتح في المتصفح',
        stall_inapp: 'تسجيل الدخول بطيء داخل المتصفح المدمج. إذا لم يكتمل، اضغطي على "فتح في المتصفح" أعلاه وحاولي مرة أخرى.',
        stall_generic: 'تسجيل الدخول يستغرق وقتاً أطول من المعتاد. تحققي من اتصالك أو حاولي مرة أخرى.',
        preroll_sub: 'اكتشفي جماليّتك',
        value_aesthetic: 'اكتشفي <em>جماليّتك.</em>',
        value_community: 'انضمّي إلى <em>مجتمع</em> أسلوبك.',
        value_outfits:   'احفظي الإطلالات التي <em>تحبّينها.</em>',
        value_cta:       'سجّلي مجاناً. <span class="auth-value-spark">✦</span>'
      },
      quiz: {
        page_eyebrow: 'اكتشف جماليّتك',
        question: 'السؤال {n}',
        help_btn: 'مساعدة',
        modal_title: 'لا توجد إجابات خاطئة.',
        modal_body: 'اختر ما يبدو طبيعياً لك — حدسك دائماً صحيح.',
        see_result: 'عرض النتيجة ←',
        result_eyebrow: 'جماليّتك',
        save_result: 'حفظ في لوحة الإلهام',
        share_result: 'مشاركة نتيجتي',
        retake: 'إعادة الاختبار',
        questions: [
          {
            q:        'ما نوع الملابس التي تجعلك تشعرين بأنك أنتِ نفسك؟',
            hint:     'فكّري فيما قد ترتدينه فعلاً في يوم حر — ليس ما هو رائج، فقط ما يبدو صحيحاً لك.',
            helpText: 'لا توجد إجابة خاطئة هنا. تخيّلي أنك تفتحين خزانتك في صباح هادئ — أي طاقة تجذبك أكثر؟',
            options:  ['أنيق ومُتقَن', 'سهل ومريح', 'جريء وبلا اعتذار', 'هادئ وبسيط'],
            moods:    ['بليزرات، بنية، خطوط نظيفة', 'أقمشة ناعمة، قصّات مريحة، هدوء يومي', 'قطع لافتة، طاقة قوية', 'ألوان محايدة، قصّات بسيطة، بلا زوائد']
          },
          {
            q:        'أي عالم من الألوان يشبه شعور البيت أكثر؟',
            hint:     'أي من هذه اللوحات يبعث على الهدوء، أو الإثارة، أو ببساطة يعبّر عنكِ أكثر؟',
            helpText: 'الألوان تعكس الشخصية أكثر مما نظن. اختاري اللوحة التي قد تملئين بها خزانتك — أو غرفتك.',
            options:  ['كريمي، شوفاني، عاجي', 'وردي خدودي، لؤلؤي، وردي ناعم', 'وردي باستيل ودانتيل', 'وردي معدني ولبان'],
            moods:    ['ناعم، هادئ، خافت', 'رقيق، أنثوي، دافئ', 'حلو، حالم، رومانسي', 'مرح، لامع، حنيني']
          },
          {
            q:        'يوم السبت المثالي بالنسبة لك يبدو هكذا…',
            hint:     'اختاري المشهد الذي يجعلك تشعرين بالسعادة والراحة فوراً.',
            helpText: 'الأماكن التي نحبها تعكس عادةً الجماليات التي نرتديها. سواء كان مقهى دافئاً أو شارعاً نابضاً بالحياة — كل شيء مترابط.',
            options:  ['مقهى باستيل مع كتاب', 'بار نبيذ هادئ على العشاء', 'شوارع المدينة مع الأصدقاء', 'البحث في سوق فينتاج'],
            moods:    ['إضاءة هادئة، ماتشا، زاوية جميلة', 'ضوء الشموع، أناقة، أمسيات بطيئة', 'موسيقى، طاقة، استكشاف في كل مكان', 'كنوز قديمة، صباح الأحد، اكتشافات']
          },
          {
            q:        'لو كان عليكِ ارتداء زوج حذاء واحد إلى الأبد…',
            hint:     'انسي الجانب العملي — أيها يبدو الأقرب إليكِ؟',
            helpText: 'الأحذية من أصدق أجزاء الإطلالة. اختياركِ التلقائي يكشف الكثير عن شخصيتك الستايلية الحقيقية.',
            options:  ['أحذية رياضية بيضاء', 'لوفر جلدي', 'كعب عالٍ أو ميول ساتان', 'ماري جين أو باليرينا'],
            moods:    ['نظيفة، متعدّدة الاستخدامات، بلا مجهود', 'أنيق، هادئ، خالد', 'راقٍ، أنثوي، مقصود', 'ناعم، حلو، جميل بطبيعته']
          },
          {
            q:        "أسلوب من يجعلك تفكرين \"أتمنى لو كان لي\"؟",
            hint:     'اتبعي حدسك — أي طاقة تثيرك أكثر، وليس الأكثر واقعية.',
            helpText: 'لسنا نسألك عمن أنتِ — بل عمن تودين ارتداء أسلوبه لأسبوع. هذا الانجذاب التلقائي يكشف الجمالية التي تجذبك أكثر.',
            options:  ['أودري هيبورن — كلاسيكية خالدة', 'نجم كي-بوب يحمل أمريكانو مثلج', 'باريس هيلتون عام 2003', 'فتاة الزهور في السبعينيات'],
            moods:    ['لؤلؤ، معاطف ترنش، كمال هادئ', 'طبقات لطيفة، شياكة عفوية، ستايل سيول', 'كل شيء وردي، تنانير قصيرة، أيقونة بالفطرة', 'حذاء سويدي، جينز واسع، سحر فينتاج']
          },
          {
            q:        'صباحًا، ما الذي تختارينه أولاً؟',
            hint:     'الصورة الأكثر طبيعية لكِ وأنتِ تستعدّين — تغطية، راحة، تنسيق، مزاج.',
            helpText: 'الطريقة التي نُكوِّن بها طبقاتنا تقول الكثير عن هويّتنا. لا توجد إجابة خاطئة — اختاري ما يبدو الأصدق إليكِ.',
            options:  ['طبقات ناعمة وكاملة من الرأس للقدمين', 'احتشام مصقول بخطوط أنيقة', 'فستان مميّز مع طبقات قليلة', 'انسيابي وخفيف'],
            moods:    ['قطع منسابة، عباية، طيّات مقصودة', 'تغطية مُفصّلة، ثقة هادئة، لمسة راقية', 'قطعة واحدة تقول كل شيء', 'أقمشة خفيفة، حركة سهلة، بلا تكلّف']
          }
        ]
      },
      community: {
        page_eyebrow: 'دائرة أسلوبك',
        page_title_a: 'الـ', page_title_b: 'مجتمع.',
        composer_placeholder: 'شارك إطلالة، لوكاً، أو لحظة…',
        composer_img_placeholder: 'أضف رابط صورة (اختياري)',
        post_btn: 'نشر',
        comment_placeholder: 'أضف تعليقاً…',
        comment_send: 'إرسال',
        show_comments: 'عرض التعليقات',
        hide_comments: 'إخفاء التعليقات',
        empty_title: 'دائرتك هادئة.',
        empty_body: 'كن أول من يشارك إطلالة.',
        no_comments: 'لا توجد تعليقات بعد. كن الأول.',
        delete_post: 'حذف المنشور',
        delete_confirm: 'هل تريد حذف هذا المنشور؟',
        liked: 'أعجبني', like: 'إعجاب',
        enter_circle:           'ادخلي الدائرة',
        enter_my_community:     'ادخلي مجتمعي',
        your_circle_badge:      'دائرتك',
        your_community:         'مجتمعك',
        admin_eyebrow:          'وصول المسؤول',
        admin_title:            'كل الدوائر مفتوحة.',
        admin_sub:              'كل مجتمع متاح.',
        not_sure_eyebrow:       'لستِ متأكدة؟',
        find_aesthetic_title:   'اكتشفي جماليّتك.',
        find_aesthetic_sub:     'ابدئي اختبار الستايل في 5 دقائق لفتح دائرتك الخاصة.',
        already_took_btn:       'هل أنهيتِ الاختبار؟ إعادة تحميل ↻',
        circles_eyebrow:        'دوائر خاصة',
        find_community_title:   'اكتشفي مجتمعك.',
        find_community_sub:     'ابدئي اختبار الستايل لاكتشاف جماليّتك وفتح دائرتك الخاصة.',
        welcome_back:           'أهلاً من جديد.',
        you_belong_to:          'أنتِ في دائرة {name}.'
      },
      access: {
        no_quiz_title:          'اكتشفي جماليّتك أولاً',
        no_quiz_body:           'ابدئي اختبار الستايل لفتح دائرتك الخاصة.',
        take_quiz_btn:          'ابدئي اختبار الستايل',
        not_now:                'ليس الآن',
        wrong_circle_title:     'هذه ليست دائرة ستايلك',
        wrong_circle_body:      'مجتمع {name} مجموعة خاصة.',
        wrong_circle_yours:     'مجتمعك هو {own}.',
        go_to_my_circle:        'اذهبي إلى دائرتي',
        close:                  'إغلاق',
        profile_changed_title:  'تغيّر ملف الستايل',
        profile_changed_body:   'أعيدي اختبار الستايل لفتح مجتمعك.',
        aesthetic_changed_title:'تغيّرت جماليّتك',
        aesthetic_changed_body: 'أنتِ الآن جزء من دائرة {name}. تم إغلاق وصولك إلى دائرتك السابقة.',
        enter_cta:              'ادخلي {name}',
        stay_in_hub:            'البقاء في الواجهة'
      },
      quiz_guest: {
        title:       'سجّلي الدخول لبدء الاختبار',
        sub:         'أنشئي ملفك في أورا لاكتشاف جماليّتك، حفظ النتيجة، وفتح دائرة الستايل الخاصة بك.',
        create:      'إنشاء حساب',
        signin:      'تسجيل الدخول',
        continue:    'متابعة التصفح'
      },
      moodboard: {
        eyebrow: 'مجموعتك',
        title_a: 'لوحة', title_b: 'إلهامك.',
        intro: 'كل إطلالة حفظتها على المنصة. اضغط على أي صورة لإزالتها.',
        empty_title: 'لوحتك فارغة',
        empty_body: 'احفظ الإطلالات وستظهر هنا.',
        empty_cta: 'ابدأ الاستكشاف',
        teaser_heading: 'لمحة عمّا يمكنك حفظه',
        count_one: 'حُفظت إطلالة واحدة',
        count_many: 'حُفظت {n} إطلالات',
        clear_all: 'مسح الكل',
        filter_all: 'الكل ({n})'
      },
      settings: {
        eyebrow: 'ملفك الشخصي',
        title_a: 'إعدادات', title_b: 'الحساب.',
        row_name: 'الاسم', row_email: 'البريد', row_provider: 'مزوّد الحساب',
        row_aesthetic: 'الجمالية', row_community: 'المجتمع',
        row_moodboard: 'لوحة الإلهام', row_liked: 'المُعجَب بها', row_viewed: 'الأخيرة',
        row_joined: 'تاريخ الانضمام', row_language: 'اللغة',
        signout_btn: 'تسجيل الخروج',
        my_circle: 'دائرة أسلوبي ←',
        moodboard_link: 'عرض لوحتي ←',
        quiz_link: 'ابدأ اختبار الستايل ←',
        replay_guide: 'إعادة دليل Aura ✦',
        back_home: 'العودة إلى الصفحة الرئيسية',
        no_quiz_yet: 'لم تأخذه بعد'
      },
      onboarding: {
        welcome_headline:   'أهلاً بك في Aura Glossy.',
        welcome_body:       'سنأخذك في جولة سريعة. خطوات قليلة فقط.',
        next_show:          'التالي ←',
        skip_tour:          'تخطّي الجولة',

        quiz_headline:      'ابدأ باختبار سريع.',
        quiz_body:          'يساعد Aura على اكتشاف ستايلك.',

        community_headline: 'هذا هو مجتمعك.',
        community_body:     'بناءً على إجاباتك في الاختبار.',

        aesthetics_headline:'يمكنك أيضاً استكشاف المزيد من الجماليات.',
        aesthetics_body:    'تصفّح كل دوائر الجماليات.',

        final_headline:     'وفي النهاية، لنبدأ.',
        final_body:         'كل شيء جاهز. لنبدأ رحلتك.',
        next_final:         'هيا بنا ←',

        eyebrow:            'دليل Aura'
      },
      lang_switcher: {
        label: 'اللغة',
        current: 'اللغة الحالية'
      },
      offline: 'لا يوجد اتصال بالإنترنت — قد لا تعمل بعض الميزات'
    },

    he: {
      common: {
        back: 'חזרה', next: 'הבא ←', skip: 'דלג', close: 'סגירה',
        loading: 'טוען…', save: 'שמירה', cancel: 'ביטול',
        confirm: 'אישור', delete: 'מחיקה', remove: 'הסרה',
        share: 'שיתוף', edit: 'עריכה', done: 'סיום', got_it: 'הבנתי ✦'
      },
      nav: {
        home: 'בית', quiz: 'חידון סגנון', aesthetics: 'אסתטיקות',
        moodboard: 'לוח השראה', community: 'קהילה', partners: 'שותפים',
        account: 'חשבון', signin: 'התחברות', signout: 'התנתקות',
        language: 'שפה', open_menu: 'פתיחת תפריט'
      },
      hero: {
        eyebrow: 'יקום אופנה אצור בקפידה',
        title_a: 'גלי את האסתטיקה שלך.',
        title_b: 'חיי את הסגנון שלך.',
        cta_quiz: 'התחילי את חידון הסגנון',
        cta_explore: 'לחקור אסתטיקות'
      },
      styles: { section_eyebrow: 'אסתטיקות', explore: 'חקירה' },
      footer: {
        tagline: 'יקום אופנה אצור בקפידה.',
        col_discover: 'גלו', col_aesthetics: 'אסתטיקות', col_partners: 'חנויות שותפות',
        copyright: '© 2026 Aura Glossy',
        designed: 'מעוצב בקפידה, נלבש בכוונה.',
        link_quiz: 'חידון סגנון', link_all: 'כל האסתטיקות',
        link_moodboard: 'לוח השראה', link_partners: 'שותפים'
      },
      login: {
        title_a: 'התחילי את', title_b: 'הסיפור שלך.',
        eyebrow: 'התחילי את הסיפור שלך',
        tab_join: 'הצטרפות', tab_signin: 'התחברות',
        name_placeholder: 'השם שלך',
        email_placeholder: 'כתובת אימייל',
        new_password_placeholder: 'יצירת סיסמה',
        password_placeholder: 'סיסמה',
        create_account: 'יצירת חשבון ←',
        signin_btn: 'התחברות ←',
        already_member: 'כבר חברה?',
        new_here: 'חדשה כאן?',
        signin_link: 'התחברי',
        create_link: 'צרי חשבון',
        creating: 'יוצר חשבון…',
        signing_in: 'מתחבר…',
        redirecting: 'מעביר…',
        /* Password visibility toggle */
        show_password: 'הצגת סיסמה',
        hide_password: 'הסתרת סיסמה',
        /* Forgot password / reset flow */
        forgot_password: 'שכחת סיסמה?',
        reset_title: 'איפוס סיסמה',
        reset_body: 'הזיני את האימייל שלך ונשלח לך קישור לאיפוס.',
        reset_email_placeholder: 'כתובת אימייל',
        reset_send: 'שליחת קישור',
        reset_sending: 'שולח…',
        reset_success: 'בדקי את האימייל שלך כדי לקבל את הקישור.',
        reset_close: 'סגירה',
        err_reset_invalid: 'נא להזין כתובת אימייל תקינה.',
        err_reset_no_user: 'לא נמצא חשבון עם אימייל זה.',
        err_reset_network: 'אין חיבור לאינטרנט. בדקי את הרשת.',
        err_reset_generic: 'לא ניתן היה לשלוח את האימייל. נסי שוב.',
        err_email: 'נא להזין כתובת אימייל תקינה.',
        err_password: 'נא להזין סיסמה.',
        err_password_short: 'הסיסמה חייבת לכלול לפחות 6 תווים.',
        err_fill: 'נא למלא את כל השדות.',
        err_already: 'האימייל הזה כבר רשום.',
        err_invalid_email: 'כתובת אימייל לא תקינה.',
        err_weak: 'הסיסמה חייבת לכלול לפחות 6 תווים.',
        err_no_user: 'לא נמצא חשבון עם אימייל זה.',
        err_wrong_pw: 'סיסמה שגויה.',
        err_bad_cred: 'אימייל או סיסמה שגויים.',
        err_network: 'אין חיבור לאינטרנט. בדקי את הרשת.',
        err_too_many: 'יותר מדי ניסיונות. נסי שוב בעוד רגע.',
        err_disabled: 'חשבון זה הושבת.',
        err_generic: 'משהו השתבש. נסי שוב.',
        err_rate: 'יותר מדי ניסיונות. המתיני {secs} שניות.',
        /* מסך אימות אימייל */
        verify_check_inbox:    'בדקי את תיבת הדואר…',
        verify_sending:        'שולח…',
        verify_sent:           'אימייל אימות נשלח. בדקי את תיבת הדואר.',
        verify_too_many:       'יותר מדי בקשות. המתיני כמה דקות ונסי שוב.',
        verify_send_failed:    'לא ניתן לשלוח את אימייל האימות. נסי שוב.',
        verify_wait:           'המתיני {secs} שניות לפני שליחה נוספת.',
        verify_checking:       'בודק…',
        verify_success:        'אומת ✓ מעבירים…',
        verify_still_pending:  'עדיין לא אומת. בדקי את תיבת הדואר לקבלת הקישור.',
        verify_recheck_failed: 'לא ניתן לבדוק כרגע. נסי שוב בעוד רגע.',
        iab_title: 'לחוויית התחברות מיטבית, פתחי את אורה בדפדפן שלך.',
        iab_sub: 'את בתוך דפדפן מובנה. ההתחברות עובדת כאן, אך מהירה ואמינה יותר בספארי, כרום או בדפדפן ברירת המחדל שלך.',
        iab_open: 'פתחי בדפדפן',
        iab_copy: 'העתיקי קישור',
        iab_copied: 'הקישור הועתק ✓',
        iab_use_menu: 'הקישי על תפריט … → פתחי בדפדפן',
        stall_inapp: 'ההתחברות איטית בתוך הדפדפן המובנה. אם זה לא מסתיים, הקישי על "פתחי בדפדפן" למעלה ונסי שוב.',
        stall_generic: 'ההתחברות לוקחת יותר זמן מהצפוי. בדקי את החיבור או נסי שוב.',
        preroll_sub: 'גלי את האסתטיקה שלך',
        value_aesthetic: 'גלי את <em>האסתטיקה</em> שלך.',
        value_community: 'הצטרפי <em>לקהילת</em> הסגנון שלך.',
        value_outfits:   'שמרי את <em>הלוקים</em> שאת אוהבת.',
        value_cta:       'הירשמי חינם. <span class="auth-value-spark">✦</span>'
      },
      quiz: {
        page_eyebrow: 'גלי את האסתטיקה שלך',
        question: 'שאלה {n}',
        help_btn: 'עזרה',
        modal_title: 'אין תשובות שגויות.',
        modal_body: 'פשוט בחרי את מה שמרגיש לך הכי טבעי — האינסטינקט שלך תמיד צודק.',
        see_result: 'תוצאה ←',
        result_eyebrow: 'האסתטיקה שלך',
        save_result: 'שמירה ללוח ההשראה',
        share_result: 'שיתוף התוצאה',
        retake: 'חידון מחדש',
        questions: [
          {
            q:        'איזה סגנון בגדים גורם לך להרגיש הכי "את עצמך"?',
            hint:     'חשבי על מה היית באמת לובשת ביום פנוי — לא מה שטרנדי, רק מה שמרגיש נכון.',
            helpText: "אין כאן תשובה לא נכונה. דמייני שאת פותחת את הארון בבוקר רגוע — לאיזו אנרגיה את הכי נמשכת?",
            options:  ['מטופח ומאורגן', 'נוח וקל', 'נועז ובלי התנצלויות', 'שקט ומינימליסטי'],
            moods:    ['בלייזרים, מבנה, קווים נקיים', 'בדים רכים, גזרות רפויות, נינוחות יומיומית', 'פריטי סטייטמנט, אנרגיה עוצמתית', 'גוונים נייטרליים, גזרות פשוטות, בלי תוספות']
          },
          {
            q:        "איזה עולם צבעים מרגיש לך הכי 'בית'?",
            hint:     "איזו פלטה מהאלה הכי מרגיעה, מרגשת, או פשוט הכי 'את'?",
            helpText: "צבעים משקפים אישיות יותר ממה שנדמה. בחרי את הפלטה שהיית ממלאת איתה את הארון — או את החדר.",
            options:  ['קרם, שיבולת שועל, שנהב', 'ורד עדין, פנינה, ורוד רך', 'ורוד פסטל ותחרה', 'ורוד מטאלי ובאבל-גאם'],
            moods:    ['רך, שלו, כמעט בלתי-נראה', 'עדין, נשי, חם', 'מתוק, חולמני, רומנטי', 'שובב, מבריק, נוסטלגי']
          },
          {
            q:        'השבת האידיאלית שלך נראית כך…',
            hint:     'בחרי את הסצנה שגורמת לך להרגיש שמחה ובבית באופן מיידי.',
            helpText: "הסביבות שאנחנו אוהבים נוטות לשקף את האסתטיקות שאנחנו לובשות. בין אם זה בית קפה נעים או רחוב סואן — הכול מתחבר.",
            options:  ['בית קפה פסטל עם ספר', 'בר יין שקט בארוחת ערב', 'רחובות העיר עם חברים', "חיפוש בשוק וינטג'"],
            moods:    ["תאורה רכה, מאצ'ה, פינה יפה", 'אור נרות, אלגנטיות, ערבים איטיים', 'מוזיקה, אנרגיה, חקירה בכל מקום', "אוצרות ישנים, בוקר יום ראשון, מציאות"]
          },
          {
            q:        'אם היית יכולה ללבוש רק זוג נעליים אחד לנצח…',
            hint:     'תשכחי מפרקטיות — איזה זוג הכי מרגיש כמוך?',
            helpText: "נעליים הן אחד החלקים הכי כנים בלוק. הבחירה האינסטינקטיבית שלך מספרת הרבה על אישיות הסטייל האמיתית שלך.",
            options:  ['סניקרס לבנים', 'לופרים מעור', 'עקבים או נעלי סאטן', "מארי ג'יין או נעלי בלט"],
            moods:    ['נקי, מגוון, ללא מאמץ', 'מטופח, שקט, על-זמני', 'מורם, נשי, מכוון', 'רך, מתוק, יפה ללא מאמץ']
          },
          {
            q:        "של מי הסטייל גורם לך לחשוב 'הלוואי שזה היה שלי'?",
            hint:     "לכי עם תחושת הבטן — איזה ויב הכי מרגש, לא הכי ריאליסטי.",
            helpText: "אנחנו לא שואלים מי את — אלא כמו מי היית רוצה להתלבש לשבוע. המשיכה האינסטינקטיבית מספרת איזו אסתטיקה הכי מושכת אותך.",
            options:  ['אודרי הפבורן — על-זמנית', 'אליל K-pop עם אמריקנו קר', 'פריס הילטון בערך 2003', 'ילדת פרחים משנות ה-70'],
            moods:    ["פנינים, מעילי טרנץ', שלמות שקטה", 'שכבות חמודות, קולנס ללא מאמץ, סטייל סיאול', 'הכול ורוד, חצאיות מיני, איקונית מלידה', "מגפי זמש, ג'ינס מתרחב, קסם וינטג'"]
          },
          {
            q:        "בבוקר, מה את לוקחת קודם?",
            hint:     "הציור הכי טבעי שלך מתלבשת — כיסוי, נוחות, שכבות, מצב רוח.",
            helpText: "האופן שבו אנחנו לובשות בשכבות מספר הרבה על הזהות שלנו. אין תשובה נכונה — בחרי את מה שמרגיש לך הכי כן.",
            options:  ['כיסוי שכבתי רך, מהראש ועד הרגליים', 'צניעות מעודנת עם קווים אלגנטיים', 'שמלת סטייטמנט ושכבות מינימליות', 'קליל ואוורירי'],
            moods:    ['פריטים זורמים, עבאיה, דרייפ מכוון', 'כיסוי תפור, ביטחון שקט, גימור', 'פריט אחד עושה את העבודה', 'בדים קלים, תנועה קלה, ללא מאמץ']
          }
        ]
      },
      community: {
        page_eyebrow: 'מעגל הסגנון שלך',
        page_title_a: 'הקהילה', page_title_b: '.',
        composer_placeholder: 'שתפי לוק, אאוטפיט, רגע…',
        composer_img_placeholder: 'הוסיפי קישור לתמונה (אופציונלי)',
        post_btn: 'פרסום',
        comment_placeholder: 'הוסיפי תגובה…',
        comment_send: 'שליחה',
        show_comments: 'הצגת תגובות',
        hide_comments: 'הסתרת תגובות',
        empty_title: 'המעגל שלך שקט.',
        empty_body: 'היי הראשונה לשתף לוק.',
        no_comments: 'אין עדיין תגובות. היי הראשונה.',
        delete_post: 'מחיקת פוסט',
        delete_confirm: 'למחוק את הפוסט?',
        liked: 'אהבתי', like: 'לייק',
        enter_circle:           'היכנסי לחוג',
        enter_my_community:     'היכנסי לקהילה שלי',
        your_circle_badge:      'החוג שלך',
        your_community:         'הקהילה שלך',
        admin_eyebrow:          'גישת מנהל',
        admin_title:            'כל החוגים פתוחים.',
        admin_sub:              'כל הקהילות נגישות.',
        not_sure_eyebrow:       'עוד לא בטוחה?',
        find_aesthetic_title:   'מצאי את האסתטיקה שלך.',
        find_aesthetic_sub:     'התחילי את חידון הסגנון בן 5 הדקות כדי לפתוח את החוג הבלעדי שלך.',
        already_took_btn:       'כבר עשית את החידון? טען מחדש ↻',
        circles_eyebrow:        'חוגים פרטיים',
        find_community_title:   'מצאי את הקהילה שלך.',
        find_community_sub:     'התחילי את חידון הסגנון כדי לגלות את האסתטיקה שלך ולפתוח את החוג הבלעדי שלך.',
        welcome_back:           'ברוכה השבה.',
        you_belong_to:          'את שייכת לחוג {name}.'
      },
      access: {
        no_quiz_title:          'גלי את האסתטיקה שלך קודם',
        no_quiz_body:           'התחילי את חידון הסגנון כדי לפתוח את החוג הבלעדי שלך.',
        take_quiz_btn:          'התחילי את חידון הסגנון',
        not_now:                'לא עכשיו',
        wrong_circle_title:     'זה לא חוג הסגנון שלך',
        wrong_circle_body:      'הקהילה {name} היא קבוצה פרטית.',
        wrong_circle_yours:     'הקהילה שלך היא {own}.',
        go_to_my_circle:        'עברי לחוג שלי',
        close:                  'סגירה',
        profile_changed_title:  'פרופיל הסגנון שלך השתנה',
        profile_changed_body:   'עשי את החידון שוב כדי לפתוח את הקהילה שלך.',
        aesthetic_changed_title:'האסתטיקה שלך השתנתה',
        aesthetic_changed_body: 'את עכשיו חלק מחוג {name}. הגישה לחוג הקודם שלך נסגרה.',
        enter_cta:              'היכנסי {name}',
        stay_in_hub:            'להישאר במרכז'
      },
      quiz_guest: {
        title:       'התחברי כדי להתחיל את החידון',
        sub:         'צרי את הפרופיל שלך באורה כדי לגלות את האסתטיקה, לשמור את התוצאה, ולפתוח את חוג הסגנון שלך.',
        create:      'יצירת חשבון',
        signin:      'התחברות',
        continue:    'המשך לעיין'
      },
      moodboard: {
        eyebrow: 'האוסף שלך',
        title_a: 'לוח', title_b: 'ההשראה שלך.',
        intro: 'כל לוק ששמרת בפלטפורמה. לחיצה על תמונה תסיר אותה.',
        empty_title: 'לוח ההשראה שלך ריק',
        empty_body: 'שמרי אאוטפיטים מהפלטפורמה והם יופיעו כאן.',
        empty_cta: 'התחלת חקירה',
        teaser_heading: 'טעימה ממה שאפשר לשמור',
        count_one: 'לוק אחד נשמר',
        count_many: '{n} לוקים נשמרו',
        clear_all: 'ניקוי הכול',
        filter_all: 'הכול ({n})'
      },
      settings: {
        eyebrow: 'הפרופיל שלך',
        title_a: 'הגדרות', title_b: 'החשבון.',
        row_name: 'שם', row_email: 'אימייל', row_provider: 'ספק',
        row_aesthetic: 'אסתטיקה', row_community: 'קהילה',
        row_moodboard: 'לוח השראה', row_liked: 'לייקים', row_viewed: 'נצפו',
        row_joined: 'תאריך הצטרפות', row_language: 'שפה',
        signout_btn: 'התנתקות',
        my_circle: 'מעגל הסגנון שלי ←',
        moodboard_link: 'לוח ההשראה שלי ←',
        quiz_link: 'התחלת חידון סגנון ←',
        replay_guide: 'הפעלת מדריך Aura מחדש ✦',
        back_home: 'חזרה לדף הבית',
        no_quiz_yet: 'עוד לא בוצע'
      },
      onboarding: {
        welcome_headline:   'ברוכה הבאה ל-Aura Glossy.',
        welcome_body:       'ניקח אותך לסיור קצר. רק כמה שלבים.',
        next_show:          'הבא ←',
        skip_tour:          'דילוג על הסיור',

        quiz_headline:      'התחילי בחידון קצר.',
        quiz_body:          'הוא עוזר ל-Aura לגלות את הסגנון שלך.',

        community_headline: 'זו הקהילה שלך.',
        community_body:     'מבוססת על התשובות שלך בחידון.',

        aesthetics_headline:'את גם יכולה לחקור עוד אסתטיקות.',
        aesthetics_body:    'דפדפי בין כל מעגלי האסתטיקה.',

        final_headline:     'בסוף, בואי נתחיל.',
        final_body:         'הכול מוכן. בואי נתחיל את המסע שלך.',
        next_final:         'יוצאים לדרך ←',

        eyebrow:            'מדריך Aura'
      },
      lang_switcher: {
        label: 'שפה',
        current: 'שפה נוכחית'
      },
      offline: 'אין חיבור לאינטרנט — חלק מהפיצ\'רים עלולים לא לעבוד'
    }
  };

  /* ── Internal state ──────────────────────────────────────── */
  function _detect() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && SUPPORTED.indexOf(saved) >= 0) return saved;
    } catch (e) {}
    var nav = (navigator.language || navigator.userLanguage || 'en')
                .toLowerCase().slice(0, 2);
    if (SUPPORTED.indexOf(nav) >= 0) return nav;
    return DEFAULT_LANG;
  }

  var _current = _detect();

  /* ── Lookup ──────────────────────────────────────────────────
     Returns the RAW value at a dotted path — string, array, object,
     or null. Used by both t() (which expects strings) and raw()
     (which needs arrays for things like quiz.questions[]). Previously
     this stripped non-strings, which broke every raw() call against
     a translated object/array (quiz questions, etc.). */
  function _get(dict, path) {
    if (!dict) return null;
    var parts = path.split('.');
    var v = dict;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return null;
      if (typeof v !== 'object') return null;  /* can't traverse a string */
      v = v[parts[i]];
    }
    return (v == null) ? null : v;
  }

  function t(key, vars) {
    var v = _get(T[_current], key);
    if (typeof v !== 'string') v = _get(T[DEFAULT_LANG], key);
    if (typeof v !== 'string') return key;
    var str = v;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split('{' + k + '}').join(vars[k]);
      });
    }
    return str;
  }

  /* ── Apply to DOM ────────────────────────────────────────── */
  function apply(root) {
    root = root || document;
    var nodes;

    nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var s = t(nodes[i].getAttribute('data-i18n'));
      if (s) nodes[i].textContent = s;
    }

    nodes = root.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < nodes.length; j++) {
      var s2 = t(nodes[j].getAttribute('data-i18n-html'));
      if (s2) nodes[j].innerHTML = s2;
    }

    nodes = root.querySelectorAll('[data-i18n-attr]');
    for (var k = 0; k < nodes.length; k++) {
      var el   = nodes[k];
      var spec = el.getAttribute('data-i18n-attr') || '';
      var pairs = spec.split(';');
      for (var p = 0; p < pairs.length; p++) {
        var bits = pairs[p].split(':');
        if (bits.length !== 2) continue;
        var attr = bits[0].trim();
        var key  = bits[1].trim();
        var s3   = t(key);
        if (s3) el.setAttribute(attr, s3);
      }
    }
  }

  /* ── Flag emojis for the dropdown rows ────────────────────────
     Using Unicode regional-indicator sequences. On platforms whose
     system font lacks color flag glyphs (some Windows builds) these
     gracefully degrade to two uppercase letters (e.g. "US"), which
     still reads correctly. The full native language name + code pill
     beside the flag is the primary identifier; the flag is decorative. */
  var FLAG = {
    en: '🇺🇸', /* 🇺🇸 */
    es: '🇪🇸', /* 🇪🇸 */
    ar: '🇸🇦', /* 🇸🇦 */
    he: '🇮🇱'  /* 🇮🇱 */
  };

  /* ── Set language ────────────────────────────────────────── */
  function setLang(code) {
    if (SUPPORTED.indexOf(code) < 0) code = DEFAULT_LANG;
    _current = code;
    try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
    document.documentElement.lang = code;
    document.documentElement.dir  = (RTL_LANGS.indexOf(code) >= 0) ? 'rtl' : 'ltr';
    apply();
    /* Sync `is-active` across every switcher instance — both the
       legacy pill design and the new dropdown design. */
    var i, els;
    els = document.querySelectorAll('.aura-lang-pill');
    for (i = 0; i < els.length; i++) {
      els[i].classList.toggle('is-active', els[i].getAttribute('data-lang') === code);
    }
    els = document.querySelectorAll('.aura-lang-option');
    for (i = 0; i < els.length; i++) {
      var opt    = els[i];
      var active = opt.getAttribute('data-lang') === code;
      opt.classList.toggle('is-active', active);
      opt.setAttribute('aria-selected', active ? 'true' : 'false');
    }
    /* Update every dropdown trigger to show the new native name */
    var triggers = document.querySelectorAll('.aura-lang-trigger');
    for (i = 0; i < triggers.length; i++) {
      var nameEl = triggers[i].querySelector('.aura-lang-trigger-name');
      if (nameEl) {
        nameEl.textContent = DISPLAY[code] || code;
        nameEl.setAttribute('lang', code);
      }
      var ddRoot = triggers[i].closest('.aura-lang-dropdown');
      if (ddRoot) ddRoot.classList.remove('is-open');
      triggers[i].setAttribute('aria-expanded', 'false');
    }
    try {
      window.dispatchEvent(new CustomEvent('aura:langchange', { detail: { lang: code } }));
    } catch (e) {
      var ev = document.createEvent('Event');
      ev.initEvent('aura:langchange', false, false);
      ev.detail = { lang: code };
      window.dispatchEvent(ev);
    }
  }

  /* ── Build the in-page language switcher UI ──────────────────
     New design (matches the spec): a single trigger button showing
       [globe icon] [current language native name] [chevron]
     opens a popover listing every supported language as
       [flag] [native name] [uppercase code]
     The currently-selected language is highlighted.

     Closes on outside click, on Escape, or after a selection.
     Keyboard: ↑/↓ navigate options, Enter / Space select, Esc close.
  ─────────────────────────────────────────────────────────────── */
  function buildSwitcher(container, opts) {
    opts = opts || {};
    container.classList.add('aura-lang-dropdown');
    container.innerHTML = '';

    /* ── Trigger button ────────────────────────────────────── */
    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'aura-lang-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', t('lang_switcher.label'));

    /* Globe icon — inline SVG so it renders identically everywhere */
    var globeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    globeSvg.setAttribute('class', 'aura-lang-trigger-globe');
    globeSvg.setAttribute('viewBox', '0 0 24 24');
    globeSvg.setAttribute('fill', 'none');
    globeSvg.setAttribute('stroke', 'currentColor');
    globeSvg.setAttribute('stroke-width', '1.6');
    globeSvg.setAttribute('stroke-linecap', 'round');
    globeSvg.setAttribute('aria-hidden', 'true');
    globeSvg.innerHTML =
      '<circle cx="12" cy="12" r="9.2"/>' +
      '<ellipse cx="12" cy="12" rx="4.2" ry="9.2"/>' +
      '<path d="M2.8 12h18.4"/>';
    trigger.appendChild(globeSvg);

    var nameEl = document.createElement('span');
    nameEl.className = 'aura-lang-trigger-name';
    nameEl.setAttribute('lang', _current);
    nameEl.textContent = DISPLAY[_current] || _current;
    trigger.appendChild(nameEl);

    var chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'aura-lang-trigger-chevron');
    chevron.setAttribute('viewBox', '0 0 12 12');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '1.6');
    chevron.setAttribute('stroke-linecap', 'round');
    chevron.setAttribute('stroke-linejoin', 'round');
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = '<polyline points="3 4.5 6 7.5 9 4.5"/>';
    trigger.appendChild(chevron);

    container.appendChild(trigger);

    /* ── Menu (popover) ────────────────────────────────────── */
    var menu = document.createElement('div');
    menu.className = 'aura-lang-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', t('lang_switcher.label'));

    SUPPORTED.forEach(function (code) {
      var opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'aura-lang-option' + (code === _current ? ' is-active' : '');
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', code === _current ? 'true' : 'false');
      opt.setAttribute('data-lang', code);
      opt.setAttribute('lang', code);

      /* Just the native name — no codes, no flags. Clean and premium. */
      var nm = document.createElement('span');
      nm.className = 'aura-lang-option-name';
      nm.textContent = DISPLAY[code] || code;
      opt.appendChild(nm);

      /* Small checkmark on the active row — communicates "selected"
         without a heavy background fill. */
      var check = document.createElement('span');
      check.className = 'aura-lang-option-check';
      check.setAttribute('aria-hidden', 'true');
      check.innerHTML =
        '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="3 8.5 6.5 12 13 5"/>' +
        '</svg>';
      opt.appendChild(check);

      opt.addEventListener('click', function (e) {
        e.stopPropagation();
        setLang(code);
        _closeAll();
      });
      menu.appendChild(opt);
    });

    container.appendChild(menu);

    /* ── Open / close behavior ─────────────────────────────── */
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = container.classList.contains('is-open');
      _closeAll();
      if (!isOpen) {
        container.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        /* Focus the currently-active option for keyboard users */
        var active = menu.querySelector('.aura-lang-option.is-active');
        if (active && active.focus) {
          /* Use a microtask so the popover transition has started */
          setTimeout(function () { try { active.focus({ preventScroll: true }); } catch (_) { active.focus(); } }, 0);
        }
      }
    });

    /* Keyboard nav inside the menu */
    container.addEventListener('keydown', function (e) {
      if (!container.classList.contains('is-open')) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          if (document.activeElement === trigger) { e.preventDefault(); trigger.click(); }
        }
        return;
      }
      var opts = Array.prototype.slice.call(menu.querySelectorAll('.aura-lang-option'));
      var idx  = opts.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); _closeAll(); trigger.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); (opts[Math.min(opts.length - 1, idx + 1)] || opts[0]).focus(); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); (opts[Math.max(0, idx - 1)] || opts[opts.length - 1]).focus(); }
      else if (e.key === 'Home')      { e.preventDefault(); opts[0].focus(); }
      else if (e.key === 'End')       { e.preventDefault(); opts[opts.length - 1].focus(); }
    });
  }

  /* Close every open dropdown on the page */
  function _closeAll() {
    var open = document.querySelectorAll('.aura-lang-dropdown.is-open');
    for (var i = 0; i < open.length; i++) {
      open[i].classList.remove('is-open');
      var t = open[i].querySelector('.aura-lang-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
  }

  /* Document-level dismissal: any click outside a dropdown closes it.
     Registered once globally so multiple switcher instances all share it. */
  if (!window.__auraLangGlobal) {
    window.__auraLangGlobal = true;
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.aura-lang-dropdown')) return;
      _closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') _closeAll();
    });
  }

  /* Auto-populate any #lang-switcher slot on the page. Pages just
     drop `<div id="lang-switcher"></div>` somewhere in their nav /
     settings and this fills it in with the pill selector. */
  function _initSwitchers() {
    var slots = document.querySelectorAll('#lang-switcher, .lang-switcher-slot, #lang-switcher-mobile, #lang-switcher-settings');
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      if (el._auraBuilt) continue;
      buildSwitcher(el, { compact: el.classList.contains('aura-lang--compact') || el.dataset.compact === '1' });
      el._auraBuilt = true;
    }
  }

  /* ── Init: set lang/dir BEFORE first paint already happened
     via the inline head script. Apply translations once DOM
     is parsed; pages can also call apply() after adding nodes. */
  function _onReady() {
    apply();
    _initSwitchers();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _onReady);
  } else {
    _onReady();
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.Aura = window.Aura || {};
  window.Aura.i18n = {
    t:            t,
    /* Return the raw value at a dotted path (string, array, or object).
       Used by quiz.html to pull translated question objects with options
       and moods, since t() only returns strings. Falls back to English. */
    raw: function (path) {
      var v = _get(T[_current], path);
      if (v == null) v = _get(T[DEFAULT_LANG], path);
      return v;
    },
    setLang:      setLang,
    getLang:      function () { return _current; },
    supported:    SUPPORTED.slice(),
    rtl:          function () { return RTL_LANGS.indexOf(_current) >= 0; },
    displayName:  function (code) { return DISPLAY[code] || code; },
    flag:         function (code) { return FLAG[code] || ''; },
    apply:        apply,
    buildSwitcher: buildSwitcher
  };
})();
