/* ============================================================
   AURA GLOSSY — Waitlist config check (diagnostic-only)

   Endpoint: GET /.netlify/functions/waitlist-config-check
   Returns:  200 JSON with boolean presence of every env var the
             waitlist subsystem reads. Never exposes values. Never
             touches Firestore or Brevo. Safe to hit anytime.

   Use:
     curl https://auraglossy.com/.netlify/functions/waitlist-config-check
   Returns shape:
     {
       "ok": true,
       "firebase": {
         "mode":          "service_account_json" | "split" | "MISSING",
         "service_account_json_set": true,
         "project_id_set":   false,
         "client_email_set": false,
         "private_key_set":  false,
         "service_account_json_valid": true   // parseable JSON?
       },
       "brevo": {
         "api_key_set":      true,
         "sender_email_set": true,
         "sender_name":      "Aura Glossy" | null,
         "sender_email_masked": "no***@auraglossy.com"
       },
       "public_base_url":    "https://auraglossy.com",
       "checked_at":         "2026-05-29T08:45:00.000Z"
     }

   This endpoint is intentionally PUBLIC because it never reveals
   secret values — only their presence/absence. If you want it
   admin-gated, add a Bearer-token check below using a third env
   var like WAITLIST_DIAG_TOKEN.
   ============================================================ */

/* Helper: same masking as the function uses in its logs. */
function _maskEmail(e) {
  if (!e) return null;
  return String(e).replace(/^(..).*(@.*)$/, '$1***$2');
}

function _present(name) {
  return !!(process.env[name] && String(process.env[name]).length > 0);
}

exports.handler = async function () {
  const saJson      = _present('FIREBASE_SERVICE_ACCOUNT_JSON');
  const projectId   = _present('FIREBASE_PROJECT_ID');
  const clientEmail = _present('FIREBASE_CLIENT_EMAIL');
  const privateKey  = _present('FIREBASE_PRIVATE_KEY');

  let saJsonValid = null;
  if (saJson) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      saJsonValid = !!(parsed && parsed.project_id && parsed.client_email && parsed.private_key);
    } catch (e) {
      saJsonValid = false;
    }
  }

  let firebaseMode = 'MISSING';
  if (saJson) firebaseMode = 'service_account_json';
  else if (projectId && clientEmail && privateKey) firebaseMode = 'split';

  const body = {
    ok: true,
    firebase: {
      mode:                       firebaseMode,
      service_account_json_set:   saJson,
      service_account_json_valid: saJsonValid,
      project_id_set:             projectId,
      client_email_set:           clientEmail,
      private_key_set:            privateKey
    },
    brevo: {
      api_key_set:          _present('BREVO_API_KEY'),
      sender_email_set:     _present('BREVO_SENDER_EMAIL'),
      sender_name:          process.env.BREVO_SENDER_NAME || null,
      sender_email_masked:  _maskEmail(process.env.BREVO_SENDER_EMAIL)
    },
    public_base_url:        process.env.PUBLIC_BASE_URL || 'https://auraglossy.com (default)',
    checked_at:             new Date().toISOString()
  };

  /* Surface a compact one-line summary in Netlify Function logs too —
     useful when reading logs after a failed deploy. */
  console.log('[waitlist-config-check]', JSON.stringify({
    fb: firebaseMode,
    brevo_key: body.brevo.api_key_set,
    brevo_sender: body.brevo.sender_email_set,
    base_url_set: !!process.env.PUBLIC_BASE_URL
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type':  'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(body, null, 2)
  };
};
