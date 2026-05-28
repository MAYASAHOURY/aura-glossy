/* ============================================================
   AURA GLOSSY — Waitlist verify (server-side)

   Endpoint: GET /.netlify/functions/waitlist-verify?token=<hex64>
   Always 302-redirects to /verify-waitlist.html?state=<state>
   where <state> is one of:
     verified           — email confirmed for the first time
     already_verified   — link clicked twice; idempotent
     expired            — token expired
     invalid            — token format wrong
     not_found          — no doc has this token
     server_error       — unexpected failure

   The HTML page handles the visual UI; the function only sets state.
   This keeps the user-facing copy translatable in i18n.js without
   redeploying the function.
   ============================================================ */

const lib = require('./_lib/waitlist-shared');

const TOKEN_RE = /^[a-f0-9]{64}$/;

function _baseUrl() {
  return (process.env.PUBLIC_BASE_URL || 'https://auraglossy.com').replace(/\/+$/, '');
}
function _go(state) {
  return lib.redirect(_baseUrl() + '/verify-waitlist.html?state=' + encodeURIComponent(state));
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return _go('invalid');
  }

  /* Token from query string */
  const params = event.queryStringParameters || {};
  const token  = String(params.token || '').toLowerCase().trim();

  if (!token || !TOKEN_RE.test(token)) {
    return _go('invalid');
  }

  let db;
  try { db = lib.getDb(); }
  catch (e) {
    console.error('[waitlist-verify] admin init failed:', e && e.message);
    return _go('server_error');
  }

  /* Look up by verifyToken — single-field query, indexed by Firestore automatically. */
  let snap;
  try {
    snap = await db.collection('waitlist').where('verifyToken', '==', token).limit(1).get();
  } catch (e) {
    console.error('[waitlist-verify] firestore query failed:', e && e.message);
    return _go('server_error');
  }

  if (snap.empty) {
    /* Token doesn't match any row.
       Could be: never existed, already verified (token wiped on success),
       or expired and cleaned. Don't reveal which — keep states distinct
       only when we have evidence. */
    return _go('not_found');
  }

  const doc  = snap.docs[0];
  const data = doc.data() || {};

  /* Already verified — link was clicked twice. Idempotent OK. */
  if (data.isVerified === true) {
    return _go('already_verified');
  }

  /* Check expiry */
  const expiresAt = data.verifyTokenExpiresAt;
  let expiresMs   = 0;
  if (expiresAt && typeof expiresAt.toMillis === 'function') {
    expiresMs = expiresAt.toMillis();
  }
  if (!expiresMs || Date.now() > expiresMs) {
    return _go('expired');
  }

  /* Promote to verified.
     We REMOVE the token + expiry on success — once used the URL has no
     further authority. We keep email/createdAt/etc., add verifiedAt. */
  try {
    await doc.ref.update({
      isVerified:           true,
      status:               'verified',
      verifiedAt:           lib.admin.firestore.FieldValue.serverTimestamp(),
      verifyToken:          lib.admin.firestore.FieldValue.delete(),
      verifyTokenExpiresAt: lib.admin.firestore.FieldValue.delete()
    });
  } catch (e) {
    console.error('[waitlist-verify] firestore update failed:', e && e.message);
    return _go('server_error');
  }

  return _go('verified');
};
