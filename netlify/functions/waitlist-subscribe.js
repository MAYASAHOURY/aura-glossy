/* ============================================================
   AURA GLOSSY — Waitlist subscribe (server-side)

   Endpoint: POST /.netlify/functions/waitlist-subscribe
   Body:     { email, lang, sourcePage, hp, t0 }
   Response: 200 { status: 'subscribed' | 'verification_resent' | 'already_subscribed' }
             400 { status: 'invalid_email' | 'invalid_request' }
             429 { status: 'rate_limited' }
             500 { status: 'server_error', detail? }

   What it does:
   - Validates the email (format, length, disposable, fake patterns).
   - Validates the honeypot field (must be empty — bots fill it).
   - Validates the time-trap (must be ≥2s since the form rendered — bots
     submit instantly).
   - Per-IP rate-limits (best-effort, in-memory per function instance).
   - Hashes the email to a deterministic document id so we never store
     two rows for the same address.
   - Writes the entry to Firestore via Firebase Admin SDK (bypasses
     client rules, which deny all client waitlist writes).
   - Generates a one-time verifyToken + 24h expiry.
   - Calls Brevo transactional API to send the confirmation email.

   Required environment (set in Netlify → Site settings → Environment):
     FIREBASE_SERVICE_ACCOUNT_JSON  (OR _PROJECT_ID + _CLIENT_EMAIL + _PRIVATE_KEY)
     BREVO_API_KEY
     BREVO_SENDER_EMAIL             (must be a verified Brevo sender)
     BREVO_SENDER_NAME              (e.g. "Aura Glossy")
     PUBLIC_BASE_URL                (e.g. "https://auraglossy.com" — used to build verify link)
   ============================================================ */

const lib = require('./_lib/waitlist-shared');

const VERIFY_EXPIRY_MS = 24 * 60 * 60 * 1000; /* 24h */
const MIN_RENDER_MS    = 2 * 1000;            /* must wait 2s before submit */

/* ── Brevo transactional send ─────────────────────────────── */
async function sendBrevoVerification({ to, lang, verifyUrl }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY missing');
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName  = process.env.BREVO_SENDER_NAME || 'Aura Glossy';
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL missing');

  const html = _buildEmailHtml({ verifyUrl, lang });
  const subject =
    lang === 'es' ? 'Confirma tu lugar en la lista de Aura Glossy ✨'
  : lang === 'ar' ? 'تأكيد مكانكِ في قائمة Aura Glossy ✨'
  : lang === 'he' ? 'אישור המקום שלך ב-Aura Glossy ✨'
                  : 'Confirm your Aura Glossy waitlist spot ✨';

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'content-type': 'application/json',
      'api-key':      apiKey
    },
    body: JSON.stringify({
      sender:      { name: senderName, email: senderEmail },
      to:          [{ email: to }],
      subject:     subject,
      htmlContent: html
    })
  });

  /* Diagnostic logging: surface enough in Netlify Function logs to
     debug delivery without exposing the api-key or full email body.
     Logs include:
       - HTTP status code from Brevo
       - response body text (capped at 600 chars — includes messageId
         on success, error details on failure)
       - the masked sender + masked recipient so the admin can match
         an attempt to a row without leaking the full address
     Cap text at 600 chars to keep the log readable. */
  const respText = await res.text().catch(function () { return ''; });
  const maskedTo  = String(to).replace(/^(..).*(@.*)$/, '$1***$2');
  const maskedFrom= String(senderEmail).replace(/^(..).*(@.*)$/, '$1***$2');
  if (res.ok) {
    let messageId = null;
    try { messageId = (JSON.parse(respText) || {}).messageId || null; } catch (_) {}
    console.log('[brevo] SENT', JSON.stringify({
      status:   res.status,
      to:       maskedTo,
      from:     maskedFrom,
      subject:  subject.slice(0, 80),
      messageId: messageId,
      lang:     lang
    }));
  } else {
    console.error('[brevo] FAILED', JSON.stringify({
      status:  res.status,
      to:      maskedTo,
      from:    maskedFrom,
      subject: subject.slice(0, 80),
      lang:    lang,
      body:    respText.slice(0, 600)
    }));
    throw new Error('Brevo send failed (' + res.status + '): ' + respText.slice(0, 300));
  }
}

function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _buildEmailHtml({ verifyUrl, lang }) {
  const isRtl = (lang === 'ar' || lang === 'he');
  const dir   = isRtl ? 'rtl' : 'ltr';
  /* Email copy per the user spec:
     - Subject: "Confirm your Aura Glossy waitlist spot ✨"
     - Body line (single short question)
     - Main button: "Yes, confirm my spot ✓"
     - Small ignore-line below
     - Tiny footer with expiry note
     Kept short and elegant — no marketing copy, no extra paragraphs. */
  const t = {
    en: {
      eyebrow: 'Aura Glossy',
      h1:      'Confirm your spot ✨',
      body:    'Do you want to save your spot on the Aura Glossy waitlist?',
      cta:     'Yes, confirm my spot ✓',
      hint:    "If this wasn't you, you can ignore this email.",
      foot:    'This link expires in 24 hours.'
    },
    es: {
      eyebrow: 'Aura Glossy',
      h1:      'Confirma tu lugar ✨',
      body:    '¿Quieres guardar tu lugar en la lista de Aura Glossy?',
      cta:     'Sí, confirmar mi lugar ✓',
      hint:    'Si esto no fuiste tú, puedes ignorar este email.',
      foot:    'Este enlace expira en 24 horas.'
    },
    ar: {
      eyebrow: 'Aura Glossy',
      h1:      'أكّدي مكانكِ ✨',
      body:    'هل تريدين حفظ مكانكِ في قائمة Aura Glossy؟',
      cta:     'نعم، تأكيد مكاني ✓',
      hint:    'إذا لم تكوني أنتِ، يمكنكِ تجاهل هذا البريد.',
      foot:    'ينتهي هذا الرابط خلال ٢٤ ساعة.'
    },
    he: {
      eyebrow: 'Aura Glossy',
      h1:      'אישור המקום שלך ✨',
      body:    'האם תרצי לשמור את המקום שלך ברשימת Aura Glossy?',
      cta:     'כן, אישור המקום שלי ✓',
      hint:    'אם זו לא היית את, אפשר להתעלם מהמייל.',
      foot:    'הקישור פג תוקף בעוד 24 שעות.'
    }
  };
  const L = t[lang] || t.en;

  return `<!doctype html>
<html lang="${_esc(lang || 'en')}" dir="${dir}">
<head>
<meta charset="UTF-8">
<title>${_esc(L.h1)}</title>
</head>
<body style="margin:0;padding:0;background:#0d0905;font-family:'Helvetica Neue',Arial,sans-serif;color:#f0e5d6;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0d0905;">
  <tr><td align="center" style="padding:48px 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="540" style="max-width:540px;background:#161009;border:1px solid rgba(199,154,133,0.18);border-radius:6px;">
      <tr><td style="padding:44px 38px 36px;${isRtl ? 'text-align:right;' : ''}">
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.42em;text-transform:uppercase;color:#c79a85;margin-bottom:18px;">${_esc(L.eyebrow)}</div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;font-size:32px;line-height:1.2;color:#f5ede3;margin:0 0 20px;">${_esc(L.h1)}</h1>
        <p style="font-size:14.5px;line-height:1.65;color:#b8a99a;margin:0 0 28px;">${_esc(L.body)}</p>
        <div style="margin:0 0 28px;${isRtl ? 'text-align:right;' : ''}">
          <a href="${_esc(verifyUrl)}" style="display:inline-block;background:linear-gradient(180deg,#c79a85,#b08770);color:#1a0e08;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;padding:14px 26px;border-radius:2px;">${_esc(L.cta)}</a>
        </div>
        <p style="font-size:11.5px;line-height:1.6;color:#8a7a6c;margin:0 0 8px;font-style:italic;">${_esc(L.hint)}</p>
        <p style="font-size:11px;line-height:1.6;color:#6e604f;margin:0;">${_esc(L.foot)}</p>
      </td></tr>
    </table>
    <p style="font-family:Georgia,serif;font-style:italic;font-size:11px;color:#6e604f;margin:22px 0 0;">Aura Glossy &middot; auraglossy.com</p>
  </td></tr>
</table>
</body>
</html>`;
}

/* ── Main handler ───────────────────────────────────────────── */
exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return lib.json(200, { ok: true });
  }
  if (event.httpMethod !== 'POST') {
    return lib.json(405, { status: 'method_not_allowed' });
  }

  /* ── 1. Parse body ─────────────────────────────────────── */
  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return lib.json(400, { status: 'invalid_request' });
  }

  const rawEmail   = String(body.email || '').slice(0, 320);
  const lang       = ['en','es','ar','he'].includes(body.lang) ? body.lang : 'en';
  const sourcePage = String(body.sourcePage || '').slice(0, 200);
  const honeypot   = String(body.hp || '');
  const t0Raw      = Number(body.t0 || 0);

  /* ── 2. Honeypot — bots fill hidden fields ─────────────── */
  if (honeypot && honeypot.length > 0) {
    /* Lie: respond as if accepted so the bot doesn't retry. */
    return lib.json(200, { status: 'subscribed' });
  }

  /* ── 3. Time-trap — submissions <2s after render are bots ─ */
  const now = Date.now();
  if (!t0Raw || t0Raw <= 0 || now - t0Raw < MIN_RENDER_MS) {
    /* Same trick — respond as if accepted. */
    return lib.json(200, { status: 'subscribed' });
  }

  /* ── 4. Rate limit ─────────────────────────────────────── */
  const ip = lib.clientIp(event);
  if (lib.rateLimit(ip)) {
    return lib.json(429, { status: 'rate_limited' });
  }

  /* ── 5. Email validation ───────────────────────────────── */
  const v = lib.validateEmail(rawEmail);
  if (!v.ok) {
    return lib.json(400, { status: 'invalid_email', reason: v.reason });
  }
  const email = v.normalized;
  const docId = lib.emailDocId(email);

  /* ── 6. Firestore lookup / write ───────────────────────── */
  let db, doc, existing;
  try {
    db  = lib.getDb();
    doc = db.collection('waitlist').doc(docId);
    const snap = await doc.get();
    existing = snap.exists ? snap.data() : null;
  } catch (e) {
    console.error('[waitlist-subscribe] firestore read failed:', e && e.message);
    return lib.json(500, { status: 'server_error', detail: 'firestore_unavailable' });
  }

  let token = lib.newToken();
  let createdAt = lib.admin.firestore.FieldValue.serverTimestamp();
  let payload;

  if (existing && existing.isVerified === true) {
    /* Already verified — surface this state. No email is sent. */
    return lib.json(200, { status: 'already_subscribed' });
  }

  if (existing && !existing.isVerified) {
    /* Existing but not yet confirmed — refresh the token + expiry,
       keep the original createdAt. */
    payload = {
      verifyToken:          token,
      verifyTokenExpiresAt: lib.admin.firestore.Timestamp.fromMillis(now + VERIFY_EXPIRY_MS),
      lastResentAt:         lib.admin.firestore.FieldValue.serverTimestamp(),
      resendCount:          lib.admin.firestore.FieldValue.increment(1),
      lang:                 lang,
      sourcePage:           sourcePage,
      userAgent:            lib.userAgent(event),
      ip:                   ip ? ip.slice(0, 80) : null,
      status:               'pending'
    };
  } else {
    /* Fresh subscription. */
    payload = {
      email:                email,
      emailHash:            docId,
      createdAt:            createdAt,
      lang:                 lang,
      sourcePage:           sourcePage,
      userAgent:            lib.userAgent(event),
      ip:                   ip ? ip.slice(0, 80) : null,
      isVerified:           false,
      status:               'pending',
      verifyToken:          token,
      verifyTokenExpiresAt: lib.admin.firestore.Timestamp.fromMillis(now + VERIFY_EXPIRY_MS),
      resendCount:          0
    };
  }

  try {
    await doc.set(payload, { merge: true });
  } catch (e) {
    console.error('[waitlist-subscribe] firestore write failed:', e && e.message);
    return lib.json(500, { status: 'server_error', detail: 'firestore_write_failed' });
  }

  /* ── 7. Build verify URL ───────────────────────────────── */
  const baseUrl = (process.env.PUBLIC_BASE_URL || 'https://auraglossy.com').replace(/\/+$/, '');
  const verifyUrl = baseUrl + '/.netlify/functions/waitlist-verify?token=' + encodeURIComponent(token);

  /* ── 8. Send email via Brevo ───────────────────────────── */
  /* Truthfulness contract: a 200 response promises the user that an
     email actually shipped. If Brevo throws, we MUST NOT return 200.

     Rollback policy:
       - Fresh subscription (existing == null): delete the orphan
         Firestore row entirely so the next retry creates a clean row.
         No "ghost" pending entries that don't correspond to any sent
         email. The user-facing UI shows a clear error.
       - Resend on an existing row (existing != null): keep the row
         (the original subscription is real and predates this send
         attempt), but flag the failure on the doc so the admin can
         see retry attempts in the report. */
  const isFresh = !existing;
  try {
    await sendBrevoVerification({ to: email, lang, verifyUrl });
  } catch (e) {
    console.error('[waitlist-subscribe] brevo failed:', e && e.message);

    if (isFresh) {
      /* Roll back the orphan row so no fake-pending entries accumulate. */
      try {
        await doc.delete();
        console.log('[waitlist-subscribe] rolled back orphan row', docId);
      } catch (delErr) {
        /* Rollback failed too — leave a marker so the admin can clean up. */
        console.warn('[waitlist-subscribe] rollback delete failed:', delErr && delErr.message);
        try {
          await doc.set({
            lastSendError:   String(e && e.message || 'send_failed').slice(0, 300),
            lastSendErrorAt: lib.admin.firestore.FieldValue.serverTimestamp(),
            rollbackFailed:  true
          }, { merge: true });
        } catch (_) {}
      }
    } else {
      /* Existing row predates this send. Keep it; flag the failure. */
      try {
        await doc.set({
          lastSendError:   String(e && e.message || 'send_failed').slice(0, 300),
          lastSendErrorAt: lib.admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (_) {}
    }

    return lib.json(500, { status: 'server_error', detail: 'email_send_failed' });
  }

  /* ── 9. Success response ───────────────────────────────── */
  /* By contract: 200 means a Brevo email was sent + Firestore row is
     in 'pending' state with isVerified=false + verifyToken set. */
  return lib.json(200, {
    status: existing ? 'verification_resent' : 'subscribed'
  });
};
