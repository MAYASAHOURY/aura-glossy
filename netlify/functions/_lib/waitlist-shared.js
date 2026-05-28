/* ============================================================
   AURA GLOSSY — Waitlist shared helpers
   Reused by both waitlist-subscribe + waitlist-verify functions.

   Responsibilities:
   - Firebase Admin SDK init (idempotent, called once per cold start)
   - Email validation (format + disposable blocklist + fake patterns)
   - Deterministic doc id (SHA-256 of normalized email)
   - JSON response helpers with CORS / no-cache headers
   - Best-effort in-memory rate limiter per function instance
   ============================================================ */

const crypto = require('crypto');
const admin  = require('firebase-admin');

/* ── Firebase Admin SDK boot ────────────────────────────────
   Credentials are loaded from environment in this priority:
     1. FIREBASE_SERVICE_ACCOUNT_JSON  — single var with full JSON
     2. FIREBASE_PROJECT_ID + _CLIENT_EMAIL + _PRIVATE_KEY  — 3-var split
   Either is acceptable; the 3-var split is friendlier in Netlify UI
   because Netlify limits single env-var size and json-with-newlines
   in a single var has paste issues. */
function _initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(parsed);
    } catch (e) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON: ' + e.message);
    }
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    /* Netlify stores newlines in env vars as literal '\n' — restore real \n. */
    const privateKey = String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');
    credential = admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  privateKey
    });
  } else {
    throw new Error('Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or the FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY trio.');
  }

  admin.initializeApp({ credential });
  return admin;
}

function getDb() {
  _initAdmin();
  return admin.firestore();
}

/* ── Email validation ───────────────────────────────────────
   Rejects:
   - malformed format (RFC-loose practical regex)
   - over 254 chars total (RFC 5321 limit)
   - disposable domains (~40 common providers)
   - obvious test/fake local parts
   - addresses with only one char local
   Returns { ok: boolean, reason?: string, normalized?: string }. */

/* A reasonable practical regex — not RFC 5322 perfect but covers 99% of
   real addresses without rejecting common forms. */
const EMAIL_RE = /^[a-z0-9._+\-]+@[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?)+$/;

/* Known disposable / throwaway providers. Not exhaustive, but covers the
   most-used spam vectors in transactional flows. */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.info','guerrillamail.biz',
  'sharklasers.com','trashmail.com','tempmail.com','temp-mail.org','temp-mail.io',
  '10minutemail.com','10minutemail.net','20minutemail.com',
  'throwawaymail.com','throwaway.email','yopmail.com','yopmail.fr','yopmail.net',
  'mintemail.com','tempinbox.com','jetable.org','spambog.com','spambog.de',
  'maildrop.cc','getairmail.com','dispostable.com','grr.la',
  'fakeinbox.com','mytemp.email','inboxbear.com','tempmailaddress.com',
  'spam4.me','mailcatch.com','tempr.email','spamgourmet.com',
  'mvrht.com','mailnesia.com','mailtemp.uk','mail-temporaire.fr',
  'getnada.com','mohmal.com','emailondeck.com','emaildrop.io'
]);

/* Local-part fake patterns. Case-insensitive; checked AFTER lowercase. */
const FAKE_LOCAL_PARTS = new Set([
  'test','tester','testing','asdf','asdfasdf','qwerty','qwertyuiop',
  'abc','abcdef','xyz','xxx','admin','root','demo','nobody',
  'nope','none','noone','noemail','example','sample',
  'a','b','c','d','e','f','g','h','i','j','k'
]);

function validateEmail(raw) {
  if (typeof raw !== 'string') return { ok: false, reason: 'invalid_format' };

  let e = raw.trim().toLowerCase();
  if (!e) return { ok: false, reason: 'invalid_format' };
  if (e.length < 6) return { ok: false, reason: 'invalid_format' };
  if (e.length > 254) return { ok: false, reason: 'invalid_format' };

  if (!EMAIL_RE.test(e)) return { ok: false, reason: 'invalid_format' };

  const atIdx = e.indexOf('@');
  const local  = e.slice(0, atIdx);
  const domain = e.slice(atIdx + 1);

  if (!local || !domain) return { ok: false, reason: 'invalid_format' };
  if (local.length > 64) return { ok: false, reason: 'invalid_format' };
  if (FAKE_LOCAL_PARTS.has(local)) return { ok: false, reason: 'fake_local' };
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, reason: 'disposable' };

  /* Reject all-numeric local parts — they're either spam or test data */
  if (/^\d+$/.test(local)) return { ok: false, reason: 'fake_local' };

  return { ok: true, normalized: e };
}

/* ── Deterministic doc id (one-doc-per-email) ───────────────
   Hash so we never store the email as the document id (avoids
   PII leakage via doc paths in any future logs). */
function emailDocId(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

/* ── Random token for the verification email link ──────────
   32 bytes -> 64 hex chars. Long enough that guessing is impractical. */
function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

/* ── Best-effort rate limit per function instance ──────────
   In-memory Map keyed by IP, sliding-window count. Not robust across
   instances (Lambda spawns multiple), but cheap and catches casual
   bursts. Real rate-limiting would need Upstash / Redis. */
const _rate = new Map();
const RATE_WINDOW_MS = 60 * 1000;   /* 1 min */
const RATE_MAX       = 5;           /* 5 requests / min / IP per instance */

function rateLimit(ip) {
  if (!ip) return false; /* don't limit unknown IPs — skip */
  const now = Date.now();
  let entry = _rate.get(ip);
  if (!entry) entry = { hits: [] };
  entry.hits = entry.hits.filter(t => now - t < RATE_WINDOW_MS);
  if (entry.hits.length >= RATE_MAX) return true;
  entry.hits.push(now);
  _rate.set(ip, entry);
  return false;
}

/* ── Response helpers ───────────────────────────────────────
   Same-origin POST so we don't need CORS; we still emit no-cache
   headers so any intermediate proxy (Netlify Edge, browser HTTP cache)
   never stores function responses. */
function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type':  'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(body)
  };
}

function redirect(location) {
  return {
    statusCode: 302,
    headers: {
      'Location':      location,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    },
    body: ''
  };
}

/* ── Client IP detection ────────────────────────────────────
   Netlify forwards real client IP via 'x-nf-client-connection-ip' on
   modern functions and 'client-ip' on legacy. Fall through to
   x-forwarded-for first IP. */
function clientIp(event) {
  if (!event || !event.headers) return null;
  const h = event.headers;
  return h['x-nf-client-connection-ip']
      || h['client-ip']
      || (h['x-forwarded-for'] || '').split(',')[0].trim()
      || null;
}

/* ── User agent (truncated for storage) ────────────────────── */
function userAgent(event) {
  if (!event || !event.headers) return null;
  const ua = event.headers['user-agent'] || '';
  return ua.slice(0, 300);
}

module.exports = {
  getDb,
  admin,
  validateEmail,
  emailDocId,
  newToken,
  rateLimit,
  json,
  redirect,
  clientIp,
  userAgent
};
