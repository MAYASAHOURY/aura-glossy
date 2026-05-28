# Aura Glossy — Waitlist Functions Setup

These two functions power the hardened waitlist with double opt-in:

| Function | Endpoint | Purpose |
|---|---|---|
| `waitlist-subscribe.js` | `POST /.netlify/functions/waitlist-subscribe` | Validate, dedupe, write Firestore, send confirmation email |
| `waitlist-verify.js`    | `GET  /.netlify/functions/waitlist-verify?token=…` | Confirm token, mark `isVerified=true`, redirect to `/verify-waitlist.html` |

**Until the environment variables below are set, the subscribe function returns `500 server_error` and the user-facing UI shows a generic error.** The Firestore rules are already locked down so nothing leaks during the gap.

---

## Required Netlify environment variables

Set these in **Netlify Dashboard → Site settings → Environment variables → Add a variable**.

### 1. Firebase Admin SDK credentials

**Option A — single JSON variable (cleanest):**

| Variable | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | The entire downloaded service-account `.json` as a single string |

To get it:
1. Open https://console.firebase.google.com/ → project **aura-fashion-fc2d4**
2. ⚙️ → Project settings → **Service accounts** tab
3. Click **Generate new private key** → confirm → downloads a `aura-fashion-fc2d4-firebase-adminsdk-xxx.json` file
4. Open the file, copy the entire contents (it starts with `{` and ends with `}`)
5. Paste into the `FIREBASE_SERVICE_ACCOUNT_JSON` value field as-is — Netlify will keep the newlines

**Option B — three split variables (friendlier if Option A has paste issues):**

| Variable | Value |
|---|---|
| `FIREBASE_PROJECT_ID` | `aura-fashion-fc2d4` |
| `FIREBASE_CLIENT_EMAIL` | the `client_email` field from the JSON (looks like `firebase-adminsdk-xxx@aura-fashion-fc2d4.iam.gserviceaccount.com`) |
| `FIREBASE_PRIVATE_KEY` | the `private_key` field — keep the literal `\n` markers, the function converts them back |

Either option works. The function picks Option A first if both are present.

### 2. Brevo (transactional email)

| Variable | Value |
|---|---|
| `BREVO_API_KEY` | Brevo API v3 key |
| `BREVO_SENDER_EMAIL` | The "from" address — must be a **verified sender** in Brevo |
| `BREVO_SENDER_NAME` | Display name, e.g. `Aura Glossy` |

To get the API key:
1. Open https://app.brevo.com/settings/keys/api
2. **Generate a new API key** → name it `aura-glossy-prod`
3. Copy the key (you'll only see it once)
4. Paste into `BREVO_API_KEY`

To verify the sender:
1. https://app.brevo.com/senders/list → **Add a sender**
2. Use an address on a domain you control (e.g. `noreply@auraglossy.com` if you've configured the auraglossy.com DNS for Brevo, OR `auraglossy.support@gmail.com` if you just want to verify the Gmail address)
3. Click the verification link Brevo emails you
4. Once verified, paste that exact address into `BREVO_SENDER_EMAIL`

### 3. Public base URL (for the verify link in the email)

| Variable | Value |
|---|---|
| `PUBLIC_BASE_URL` | `https://auraglossy.com` (no trailing slash) |

This is what the function uses to build the `https://auraglossy.com/.netlify/functions/waitlist-verify?token=…` URL inside the confirmation email.

---

## After setting all variables

Netlify Functions **don't auto-redeploy** when env vars change — you have to trigger a new build.

In the Netlify dashboard:
1. **Deploys** tab → **Trigger deploy** → **Deploy site**
2. Wait ~90s for the build to finish

Then run the smoke test below.

---

## End-to-end smoke test (5 min)

After the deploy completes:

1. Open https://auraglossy.com/ in an incognito tab.
2. Maintenance screen renders with the waitlist form.
3. Type a **real email you can check** (NOT a `test@` address — those are blocked by the fake-pattern filter).
4. Click **Join the waitlist**.
5. Within ~2 seconds the form should switch to the **"Check your inbox ✦"** state.
6. Open your inbox (and spam folder for the first try). You should see an email titled **"Confirm your spot on the Aura Glossy waitlist"** with a "Confirm my spot ✦" button.
7. Click the button. You should land on `/verify-waitlist.html?state=verified` with a green "You're in" success state.
8. Now click it AGAIN from the email. You should land on the same page with `?state=already_verified` and an info-tone "You're already in" message.

Then verify in the admin dashboard:
1. Open `/admin-report.html` (sign in as admin if needed).
2. The new **04 Waitlist** section should show:
   - Total signups: **1**
   - Verified: **1**
   - Pending verify: **0**
   - Today / 7 days / 30 days: all **1**
3. Below the KPIs, your email appears in the "Latest waitlist entries" table with status `verified`.

### Common failures + diagnostics

| Symptom | Likely cause | Fix |
|---|---|---|
| UI says "Couldn't save your email" immediately | `FIREBASE_*` env vars missing or wrong | Check Netlify function logs → look for `Firebase credentials missing` or `is not valid JSON` |
| UI shows success but no email arrives (not even in spam) | `BREVO_*` vars missing or sender unverified | Check function logs → `Brevo send failed (4xx)`. Re-verify sender in Brevo dashboard |
| Email arrives but the link says "Invalid" | `PUBLIC_BASE_URL` mismatch | Confirm `PUBLIC_BASE_URL = https://auraglossy.com` (no trailing slash) |
| Email link says "Expired" right away | Server clock drift OR token was wiped by a re-subscribe | Re-submit the email to get a fresh link |
| Repeat subscribes get "rate_limited" | Hitting the 5/min/IP throttle | Wait 60s, retry. To make this stricter use Upstash later. |
| Admin-report shows 500 entries cap | Hardcoded cap | If you get past 500 signups, raise the limit in `js/admin-report.js` → `_loadAll` |

To view function logs: Netlify Dashboard → **Functions** tab → click `waitlist-subscribe` → **Logs** sub-tab.

---

## Security notes

The Firestore rules deployed alongside this code **deny all client writes** to the `waitlist` collection. The only legitimate writer is the Firebase Admin SDK running inside these Netlify Functions, which **bypasses rules entirely** by design. This means:

- A guest poking devtools can no longer post fake emails to the collection.
- Email validation, disposable blocklist, honeypot, time-trap, and rate-limit ALL run server-side. Nothing client-side is load-bearing for security.
- The Brevo API key is server-only — it never reaches the browser.
- The token in the verify URL is 32 random bytes (256 bits), expires in 24 hours, and is wiped on first successful click.

Admins can still **READ** the collection (admin-report dashboard) and **DELETE** entries (manual moderation). Admin-side **UPDATE** is denied via rules so the only way to flip `isVerified=true` is by clicking a valid token link or running an Admin SDK script.
