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
/* Redirect to the confirmation page. When the user just earned (or
   already holds) a VIP spot, append &spot=N so the page can render
   "VIP Spot #N". Only positive integers are forwarded. */
function _go(state, spot) {
  var url = _baseUrl() + '/verify-waitlist.html?state=' + encodeURIComponent(state);
  var n = Number(spot);
  if (spot != null && Number.isFinite(n) && n > 0) {
    url += '&spot=' + encodeURIComponent(String(Math.floor(n)));
  }
  return lib.redirect(url);
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

  /* Fast path — already a confirmed VIP (link clicked twice).
     Idempotent: re-show their existing spot number, no write, no
     transaction. */
  if (data.isVerified === true) {
    return _go('already_verified', data.vipSpotNumber);
  }

  /* Fast path — expired link. Cheap reject before we touch the
     counter or open a transaction. */
  const expiresAt = data.verifyTokenExpiresAt;
  let expiresMs   = 0;
  if (expiresAt && typeof expiresAt.toMillis === 'function') {
    expiresMs = expiresAt.toMillis();
  }
  if (!expiresMs || Date.now() > expiresMs) {
    return _go('expired');
  }

  /* ── Seed base for the spot counter ──────────────────────────
     The authoritative spot count lives in waitlist_meta/counters.
     The very first confirmation after this feature ships onto an
     existing waitlist won't find that doc yet, so we seed it from a
     live aggregation count of already-verified rows. After it exists
     the counter is the sole source of truth and we never recount. */
  const cRef = lib.counterRef(db);
  let seedBase = 0;
  try {
    const cs = await cRef.get();
    if (!cs.exists) {
      const counted = await lib.countVerifiedRows(db);
      if (counted == null) {
        /* Aggregation unavailable — start from 0 but make the gap loud
           so the admin can reconcile if there were pre-existing members. */
        console.warn('[waitlist-verify] counter missing AND count() unavailable — seeding spot base at 0');
      }
      seedBase = counted == null ? 0 : counted;
    }
  } catch (e) {
    console.warn('[waitlist-verify] counter pre-read failed:', e && e.message);
  }

  /* ── Atomic VIP spot assignment ──────────────────────────────
     A single transaction reads the counter + the entry, then either
     (a) assigns the next spot number and bumps the counter, or
     (b) marks the entry full_waitlist if the cap is already reached.
     All reads precede all writes (Firestore requirement). The SDK
     retries automatically on contention, so two simultaneous
     confirmations can never share a spot number or exceed the cap. */
  let result;
  try {
    result = await db.runTransaction(async function (txn) {
      const cSnap = await txn.get(cRef);
      const eSnap = await txn.get(doc.ref);
      const e = eSnap.data() || {};

      /* Confirmed between our query and this transaction. Idempotent. */
      if (e.isVerified === true) {
        return { state: 'already_verified', spot: e.vipSpotNumber || null };
      }
      /* Token expired/rotated between checks. */
      const exp = e.verifyTokenExpiresAt;
      const expMs = (exp && typeof exp.toMillis === 'function') ? exp.toMillis() : 0;
      if (!expMs || Date.now() > expMs) {
        return { state: 'expired' };
      }

      const current = cSnap.exists ? ((cSnap.data() || {}).verifiedCount || 0) : seedBase;

      if (current >= lib.VIP_WAITLIST_CAPACITY) {
        /* All spots claimed while this user was deciding. Their email
           is real (they clicked the link) but no spot is available —
           move them to the overflow notify list. Counter untouched. */
        txn.update(doc.ref, {
          status:               'full_waitlist',
          isVerified:           false,
          fullWaitlistAt:       lib.admin.firestore.FieldValue.serverTimestamp(),
          verifyToken:          lib.admin.firestore.FieldValue.delete(),
          verifyTokenExpiresAt: lib.admin.firestore.FieldValue.delete()
        });
        return { state: 'full' };
      }

      const spot = current + 1;
      txn.set(cRef, {
        verifiedCount:  spot,
        capacity:       lib.VIP_WAITLIST_CAPACITY,
        updatedAt:      lib.admin.firestore.FieldValue.serverTimestamp(),
        lastVerifiedAt: lib.admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      /* Promote to verified. Token + expiry are wiped — once used the
         URL has no further authority. email/createdAt are preserved. */
      txn.update(doc.ref, {
        isVerified:           true,
        status:               'verified',
        vipSpotNumber:        spot,
        verifiedAt:           lib.admin.firestore.FieldValue.serverTimestamp(),
        verifyToken:          lib.admin.firestore.FieldValue.delete(),
        verifyTokenExpiresAt: lib.admin.firestore.FieldValue.delete()
      });
      return { state: 'verified', spot: spot };
    });
  } catch (e) {
    console.error('[waitlist-verify] transaction failed:', e && e.message);
    return _go('server_error');
  }

  return _go(result.state, result.spot);
};
