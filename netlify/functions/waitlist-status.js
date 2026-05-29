/* ============================================================
   AURA GLOSSY — Waitlist status (public, read-only)

   Endpoint: GET /.netlify/functions/waitlist-status
   Returns:  200 {
               ok:             true,
               capacity:       300,
               verifiedCount:  127,        // confirmed VIP members
               spotsRemaining: 173,
               isFull:         false,
               isOpen:         true,
               checkedAt:      "2026-05-29T…"
             }
             200 { ok: false, ... safe defaults } on any read failure

   Purpose:
   - Lets the maintenance/waitlist UI show a TRUTHFUL, live VIP spot
     indicator ("Limited to 300 VIP spots" / "Only N spots remaining")
     and flip to the "VIP list is full" state without the client ever
     reading Firestore directly (the waitlist collection is admin-only).
   - Exposes ONLY aggregate counts. No emails, no rows, no PII.

   Truthfulness:
   - verifiedCount counts ONLY confirmed VIP members (the same number
     the verify transaction maintains). Pending/unverified subscribers
     are never included, so the indicator never overstates how full
     the list is.

   Failure policy:
   - On any error we return ok:false with capacity from the constant,
     verifiedCount:0, isFull:false. The UI then falls back to its
     static "Limited to 300 VIP spots" copy — it never wrongly claims
     the list is full because of a transient read error.
   ============================================================ */

const lib = require('./_lib/waitlist-shared');

function _json(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type':           'application/json; charset=utf-8',
      'Cache-Control':          'no-store, no-cache, must-revalidate, private',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async function (event) {
  const capacity = lib.VIP_WAITLIST_CAPACITY;

  if (event && event.httpMethod === 'OPTIONS') {
    return _json(200, { ok: true });
  }
  if (event && event.httpMethod && event.httpMethod !== 'GET') {
    return _json(405, { ok: false, status: 'method_not_allowed', capacity: capacity });
  }

  let verifiedCount = 0;
  let ok = true;
  try {
    const db = lib.getDb();
    verifiedCount = await lib.getVerifiedCount(db);
    if (typeof verifiedCount !== 'number' || verifiedCount < 0) verifiedCount = 0;
  } catch (e) {
    /* Degrade gracefully — never tell the UI the list is full just
       because Firestore/credentials hiccupped. */
    console.warn('[waitlist-status] read failed:', e && e.message);
    ok = false;
    verifiedCount = 0;
  }

  const spotsRemaining = Math.max(0, capacity - verifiedCount);
  const isFull = ok && verifiedCount >= capacity;

  return _json(200, {
    ok:             ok,
    capacity:       capacity,
    verifiedCount:  verifiedCount,
    spotsRemaining: spotsRemaining,
    isFull:         isFull,
    isOpen:         !isFull,
    checkedAt:      new Date().toISOString()
  });
};
