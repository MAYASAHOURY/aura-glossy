/* ============================================================
   AURA — Auth gate (sign-in screen between intro and homepage)

   Session strategy:
   • Sign in / Register  → localStorage  (30-day, persists across sessions)
   • Continue as guest   → sessionStorage (tab-scoped, clears on close)
   ============================================================ */
(function () {
  const overlay = document.getElementById('aura-signin');
  if (!overlay) return;

  // ── Session helpers ──────────────────────────────────────────
  const KEY = 'aura_session';

  function getSession() {
    try {
      // Persistent login first, then tab-scoped guest
      const ls = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (ls) return ls;
      return JSON.parse(sessionStorage.getItem(KEY) || 'null');
    } catch (e) { return null; }
  }

  function saveSession(name, isGuest) {
    try {
      const data = JSON.stringify({
        name:    name || 'Guest',
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
        guest:   !!isGuest
      });
      // Guests: sessionStorage only (disappears when tab closes)
      // Signed-in users: localStorage (persists 30 days)
      if (isGuest) {
        sessionStorage.setItem(KEY, data);
      } else {
        localStorage.setItem(KEY, data);
      }
    } catch (e) {}
  }

  // ── Skip gate if already logged in ──────────────────────────
  const session    = getSession();
  const isLoggedIn = session && session.expires > Date.now();
  if (isLoggedIn) {
    overlay.style.display = 'none';
    // Still fire homepage-reveal so hero animations play after the intro ends.
    // We watch for the intro to be removed, then fire with a short delay.
    const introEl = document.getElementById('intro');
    if (introEl) {
      const mo = new MutationObserver(() => {
        if (introEl.classList.contains('is-done') || introEl.classList.contains('is-removed')) {
          mo.disconnect();
          setTimeout(() => window.dispatchEvent(new CustomEvent('aura:homepage-reveal')), 300);
        }
      });
      mo.observe(introEl, { attributes: true, attributeFilter: ['class'] });
    } else {
      // No intro at all — fire immediately
      setTimeout(() => window.dispatchEvent(new CustomEvent('aura:homepage-reveal')), 50);
    }
    return;
  }

  // ── View management ──────────────────────────────────────────
  const views = {
    signin:   document.getElementById('asgn-view-signin'),
    register: document.getElementById('asgn-view-register'),
    success:  document.getElementById('asgn-view-success')
  };

  function showView(name, direction) {
    direction = direction || 'up';
    Object.keys(views).forEach(k => {
      const v = views[k];
      if (!v) return;
      if (k === name) {
        v.classList.remove('asgn-view-out-up', 'asgn-view-out-down');
        v.classList.add('asgn-view-active');
      } else if (v.classList.contains('asgn-view-active')) {
        v.classList.remove('asgn-view-active');
        v.classList.add(direction === 'up' ? 'asgn-view-out-up' : 'asgn-view-out-down');
        setTimeout(() => v.classList.remove('asgn-view-out-up', 'asgn-view-out-down'), 600);
      }
    });
  }

  // ── Show overlay ─────────────────────────────────────────────
  function show() {
    showView('signin');

    // Show INSTANTLY — bypass the CSS transition so there is zero gap between
    // the intro hiding and the auth gate being visible. If we let the 0.9s
    // opacity transition play from scratch, the homepage shows through for
    // nearly a second. Disabling transition inline, applying the class, then
    // restoring the transition (via rAF) means the overlay snaps to full
    // opacity immediately and the dismiss animation still works normally.
    overlay.style.transition = 'none';
    overlay.classList.add('asgn-visible');
    requestAnimationFrame(() => { overlay.style.transition = ''; });

    // Subtle image settle (single rAF is fine here — just a transform)
    const img = overlay.querySelector('.asgn-left-img');
    if (img) {
      img.style.transform = 'scale(1.08)';
      requestAnimationFrame(() => {
        img.style.transition = 'transform 2.4s cubic-bezier(0.16, 1, 0.3, 1)';
        img.style.transform  = 'scale(1.0)';
      });
    }
  }

  // ── Dismiss overlay ──────────────────────────────────────────
  function dismiss() {
    // Snap to top before the overlay fades out — the page may still be
    // scrolled to the intro-spacer position and we always want the homepage
    // to reveal from the very top.
    window.scrollTo({ top: 0, behavior: 'instant' });
    overlay.classList.add('asgn-exiting');
    overlay.classList.remove('asgn-visible');
    // Fire homepage-reveal 180ms after dismiss — timed so hero animations
    // start just as the auth gate begins to fade, making the reveal feel live.
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('aura:homepage-reveal'));
    }, 180);
    setTimeout(() => { overlay.style.display = 'none'; }, 1400);
  }

  // ── Hook into intro end (with initial-state check) ────────────
  // We watch for 'is-done' (not 'is-removed') because is-done is added first
  // and immediately applies `visibility: hidden` to the intro — at that exact
  // moment the homepage becomes visible underneath. is-removed comes 1100 ms
  // later (when the spacer is removed). Watching only for is-removed + adding
  // a 360 ms delay means the homepage was exposed for ~2.4 s — visible to the
  // user before the auth gate appeared. By catching is-done we can show the
  // gate the instant the intro disappears, with no delay.
  //
  // Three cases handled:
  // 1. intro hasn't ended yet → MutationObserver fires on is-done (or is-removed)
  // 2. intro already hidden (reduced motion, fast skip) → show immediately
  // 3. no intro element at all → show immediately
  function hookIntro() {
    const intro = document.getElementById('intro');
    if (!intro) {
      show();
      return;
    }
    // Already done/removed by the time auth.js runs
    if (intro.classList.contains('is-done') || intro.classList.contains('is-removed')) {
      show();
      return;
    }
    // Wait for intro to start its exit (is-done fires, intro goes visibility:hidden)
    const mo = new MutationObserver(() => {
      if (intro.classList.contains('is-done') || intro.classList.contains('is-removed')) {
        mo.disconnect();
        show(); // Instant — no delay, no gap
      }
    });
    mo.observe(intro, { attributes: true, attributeFilter: ['class'] });
  }
  hookIntro();

  // ── View navigation ───────────────────────────────────────────
  const $goRegister = document.getElementById('go-register');
  const $goSignin   = document.getElementById('go-signin');
  if ($goRegister) $goRegister.addEventListener('click', () => showView('register', 'up'));
  if ($goSignin)   $goSignin.addEventListener('click',   () => showView('signin',   'down'));

  // ── Password eye toggle ───────────────────────────────────────
  const eyeBtn  = document.getElementById('asgn-eye');
  const pwInput = document.getElementById('asgn-pw');
  if (eyeBtn && pwInput) {
    eyeBtn.addEventListener('click', () => {
      const visible = pwInput.type === 'text';
      pwInput.type  = visible ? 'password' : 'text';
      const icon = document.getElementById('asgn-eye-icon');
      if (icon) icon.innerHTML = visible
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
    });
  }

  // ── Success view + dismiss ────────────────────────────────────
  function onSuccess(name) {
    const nameEl = document.getElementById('asgn-success-name');
    if (nameEl) {
      const first = (name && name !== 'Guest') ? name.split(' ')[0] : null;
      nameEl.textContent = first ? 'Welcome, ' + first + '.' : 'Welcome.';
    }
    showView('success');
    requestAnimationFrame(() => {
      const circle = overlay.querySelector('.asgn-check-circle');
      const mark   = overlay.querySelector('.asgn-check-mark');
      if (circle) circle.classList.add('asgn-stroke-in');
      if (mark)   mark.classList.add('asgn-stroke-in');
    });
    setTimeout(dismiss, 2200);
  }

  // ── Sign-in form ──────────────────────────────────────────────
  const formSignin = document.getElementById('asgn-form-signin');
  if (formSignin) {
    formSignin.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('asgn-email').value.trim();
      const pw    = document.getElementById('asgn-pw').value;
      const err   = document.getElementById('asgn-err-signin');
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        err.textContent = 'Please enter a valid email address.'; return;
      }
      if (!pw) { err.textContent = 'Please enter your password.'; return; }
      err.textContent = '';
      const btn = formSignin.querySelector('.asgn-submit');
      btn.classList.add('asgn-loading');
      setTimeout(() => {
        btn.classList.remove('asgn-loading');
        saveSession(email.split('@')[0], false);   // persistent login
        onSuccess(email.split('@')[0]);
      }, 900);
    });
  }

  // ── Register form ─────────────────────────────────────────────
  const formRegister = document.getElementById('asgn-form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', e => {
      e.preventDefault();
      const name  = document.getElementById('asgn-name').value.trim();
      const email = document.getElementById('asgn-reg-email').value.trim();
      const pw    = document.getElementById('asgn-reg-pw').value;
      const err   = document.getElementById('asgn-err-register');
      if (!name)  { err.textContent = 'Please enter your name.'; return; }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        err.textContent = 'Please enter a valid email address.'; return;
      }
      if (!pw || pw.length < 6) {
        err.textContent = 'Password must be at least 6 characters.'; return;
      }
      err.textContent = '';
      const btn = formRegister.querySelector('.asgn-submit');
      btn.classList.add('asgn-loading');
      setTimeout(() => {
        btn.classList.remove('asgn-loading');
        saveSession(name, false);   // persistent login
        onSuccess(name);
      }, 900);
    });
  }

  // ── Guest buttons (tab-scoped session only) ───────────────────
  ['asgn-guest-signin', 'asgn-guest-register'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => {
      saveSession('Guest', true);   // sessionStorage → cleared on tab close
      onSuccess(null);
    });
  });

})();
