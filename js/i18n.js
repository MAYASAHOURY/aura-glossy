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
        err_rate: 'Too many attempts. Please wait {secs} seconds.'
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
        retake: 'Retake the quiz'
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
        delete_post: 'Delete post',
        delete_confirm: 'Delete this post?',
        liked: 'Liked', like: 'Like'
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
        row_joined: 'Joined', row_language: 'Language',
        signout_btn: 'Sign out',
        moodboard_link: 'View my Moodboard →',
        quiz_link: 'Take the style quiz →',
        replay_guide: 'Replay Aura Guide',
        no_quiz_yet: 'Not taken yet'
      },
      onboarding: {
        welcome_headline: 'Welcome to Aura.',
        welcome_body: 'A quick look at where to start.',
        quiz_headline: 'Start with the quiz.',
        quiz_body: 'Find your style in 10 questions.',
        community_headline: 'Join your circle.',
        community_body: 'Meet people who share your taste.',
        moodboard_headline: 'Save looks you love.',
        moodboard_body: 'Build your inspiration.',
        aesthetics_headline: 'Find your style.',
        aesthetics_body: 'Browse curated aesthetics.',
        lang_headline: 'Aura speaks your language.',
        lang_body: 'Switch languages anytime here.',
        next_show: 'Show me around →',
        next_final: 'Start exploring ✦',
        eyebrow: 'Aura Guide'
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
        err_rate: 'Demasiados intentos. Espera {secs} segundos.'
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
        retake: 'Volver a hacer el quiz'
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
        delete_post: 'Eliminar publicación',
        delete_confirm: '¿Eliminar esta publicación?',
        liked: 'Me gusta', like: 'Me gusta'
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
        row_joined: 'Miembro desde', row_language: 'Idioma',
        signout_btn: 'Cerrar sesión',
        moodboard_link: 'Ver mi Moodboard →',
        quiz_link: 'Hacer el quiz de estilo →',
        replay_guide: 'Repetir la guía de Aura',
        no_quiz_yet: 'Aún no realizado'
      },
      onboarding: {
        welcome_headline: 'Bienvenido a Aura.',
        welcome_body: 'Un vistazo rápido para empezar.',
        quiz_headline: 'Empieza con el quiz.',
        quiz_body: 'Encuentra tu estilo en 10 preguntas.',
        community_headline: 'Únete a tu círculo.',
        community_body: 'Conoce a quienes comparten tu gusto.',
        moodboard_headline: 'Guarda lo que ames.',
        moodboard_body: 'Crea tu inspiración.',
        aesthetics_headline: 'Encuentra tu estilo.',
        aesthetics_body: 'Explora estéticas curadas.',
        lang_headline: 'Aura habla tu idioma.',
        lang_body: 'Cambia el idioma aquí cuando quieras.',
        next_show: 'Muéstrame →',
        next_final: 'Empezar a explorar ✦',
        eyebrow: 'Guía de Aura'
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
        err_rate: 'محاولات كثيرة. يرجى الانتظار {secs} ثانية.'
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
        retake: 'إعادة الاختبار'
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
        delete_post: 'حذف المنشور',
        delete_confirm: 'هل تريد حذف هذا المنشور؟',
        liked: 'أعجبني', like: 'إعجاب'
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
        row_joined: 'تاريخ الانضمام', row_language: 'اللغة',
        signout_btn: 'تسجيل الخروج',
        moodboard_link: 'عرض لوحتي ←',
        quiz_link: 'ابدأ اختبار الستايل ←',
        replay_guide: 'إعادة دليل Aura',
        no_quiz_yet: 'لم تأخذه بعد'
      },
      onboarding: {
        welcome_headline: 'أهلاً بك في Aura.',
        welcome_body: 'نظرة سريعة على نقطة البداية.',
        quiz_headline: 'ابدأ بالاختبار.',
        quiz_body: 'اكتشف ستايلك في 10 أسئلة.',
        community_headline: 'انضم إلى دائرتك.',
        community_body: 'تعرّف على من يشاركونك ذوقك.',
        moodboard_headline: 'احفظ ما تحبه.',
        moodboard_body: 'ابنِ مصادر إلهامك.',
        aesthetics_headline: 'اكتشف ستايلك.',
        aesthetics_body: 'تصفّح جماليات منسّقة.',
        lang_headline: 'Aura يتحدّث لغتك.',
        lang_body: 'بدّل اللغة من هنا في أي وقت.',
        next_show: 'أرني ←',
        next_final: 'ابدأ الاستكشاف ✦',
        eyebrow: 'دليل Aura'
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
        err_rate: 'יותר מדי ניסיונות. המתיני {secs} שניות.'
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
        retake: 'חידון מחדש'
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
        delete_post: 'מחיקת פוסט',
        delete_confirm: 'למחוק את הפוסט?',
        liked: 'אהבתי', like: 'לייק'
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
        row_joined: 'תאריך הצטרפות', row_language: 'שפה',
        signout_btn: 'התנתקות',
        moodboard_link: 'לוח ההשראה שלי ←',
        quiz_link: 'התחלת חידון סגנון ←',
        replay_guide: 'הפעלת מדריך Aura מחדש',
        no_quiz_yet: 'עוד לא בוצע'
      },
      onboarding: {
        welcome_headline: 'ברוכה הבאה ל-Aura.',
        welcome_body: 'מבט מהיר על איפה להתחיל.',
        quiz_headline: 'התחילי בחידון.',
        quiz_body: 'גלי את הסגנון שלך ב-10 שאלות.',
        community_headline: 'הצטרפי למעגל שלך.',
        community_body: 'הכירי אנשים שחולקים את הטעם שלך.',
        moodboard_headline: 'שמרי לוקים שאת אוהבת.',
        moodboard_body: 'בני את ההשראה שלך.',
        aesthetics_headline: 'גלי את הסגנון שלך.',
        aesthetics_body: 'עיון באסתטיקות מאוצרות.',
        lang_headline: 'Aura מדברת בשפה שלך.',
        lang_body: 'אפשר להחליף שפה מכאן בכל זמן.',
        next_show: 'הראי לי ←',
        next_final: 'להתחיל לחקור ✦',
        eyebrow: 'מדריך Aura'
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

  /* ── Lookup ──────────────────────────────────────────────── */
  function _get(dict, path) {
    if (!dict) return null;
    var parts = path.split('.');
    var v = dict;
    for (var i = 0; i < parts.length; i++) {
      if (v == null || typeof v !== 'object') return null;
      v = v[parts[i]];
    }
    return (typeof v === 'string') ? v : null;
  }

  function t(key, vars) {
    var str = _get(T[_current], key);
    if (str == null) str = _get(T[DEFAULT_LANG], key);
    if (str == null) return key;
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

  /* ── Set language ────────────────────────────────────────── */
  function setLang(code) {
    if (SUPPORTED.indexOf(code) < 0) code = DEFAULT_LANG;
    _current = code;
    try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
    document.documentElement.lang = code;
    document.documentElement.dir  = (RTL_LANGS.indexOf(code) >= 0) ? 'rtl' : 'ltr';
    apply();
    /* Sync .is-active on every pill across all switcher instances */
    var pills = document.querySelectorAll('.aura-lang-pill');
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('is-active', pills[i].getAttribute('data-lang') === code);
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

  /* ── Build the in-page language switcher UI ──────────────── */
  function buildSwitcher(container, opts) {
    opts = opts || {};
    var compact = !!opts.compact;
    container.classList.add('aura-lang');
    if (compact) container.classList.add('aura-lang--compact');

    container.innerHTML = '';
    var label = document.createElement('span');
    label.className = 'aura-lang-label';
    label.textContent = t('lang_switcher.label');
    label.setAttribute('data-i18n', 'lang_switcher.label');
    container.appendChild(label);

    var pills = document.createElement('div');
    pills.className = 'aura-lang-pills';
    container.appendChild(pills);

    SUPPORTED.forEach(function (code) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aura-lang-pill';
      btn.setAttribute('data-lang', code);
      btn.setAttribute('lang', code);
      btn.textContent = DISPLAY[code];
      if (code === _current) btn.classList.add('is-active');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (code === _current) return;
        setLang(code);
        /* update active state on all pills (across instances) */
        document.querySelectorAll('.aura-lang-pill').forEach(function (b) {
          b.classList.toggle('is-active', b.getAttribute('data-lang') === code);
        });
      });
      pills.appendChild(btn);
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
    setLang:      setLang,
    getLang:      function () { return _current; },
    supported:    SUPPORTED.slice(),
    rtl:          function () { return RTL_LANGS.indexOf(_current) >= 0; },
    displayName:  function (code) { return DISPLAY[code] || code; },
    apply:        apply,
    buildSwitcher: buildSwitcher
  };
})();
