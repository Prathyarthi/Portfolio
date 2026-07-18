# Pricing & Subscription — Manual QA Checklist

Step-by-step tests for plan restrictions and Razorpay subscription handling.

## Pricing model reference


| Tier      | How it's determined                 | Templates      | Imports | Live previews                | Edit / publish |
| --------- | ----------------------------------- | -------------- | ------- | ---------------------------- | -------------- |
| **Trial** | First 30 days from `user.createdAt` | All            | Yes     | 2 max                        | Yes            |
| **Free**  | Trial ended, no active Pro          | `minimal` only | No      | 2 max                        | Yes            |
| **Pro**   | `subscriptionStatus === "active"`   | All            | Yes     | 50 max (UI says "Unlimited") | Yes            |


> **Dev fallback:** If Razorpay keys or plan IDs are missing, all restrictions are bypassed — everyone gets full access regardless of tier.

> **Pro is webhook-driven:** Checkout sets `pending`; Pro is granted only when the webhook sets `active`.

---

## Before you start

### 0.1 Confirm billing is enabled

In `.env`, verify these are set:

```
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_PRO_PLAN_ID_MONTHLY=...   # or legacy RAZORPAY_PRO_PLAN_ID
RAZORPAY_PRO_PLAN_ID_QUARTERLY=...
RAZORPAY_PRO_PLAN_ID_YEARLY=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_BILLING_CURRENCY=inr # must match every configured plan
CRON_SECRET=...                  # protects scheduled reconciliation
NEXTAUTH_URL=http://localhost:3000
```

- [x] All Razorpay env vars present (checkout fails closed without them)

### 0.2 Start the app

```bash
npm run dev
```

- [x] App running at `http://localhost:3000`

### 0.3 Open tools

- [x] Browser (normal + incognito for logged-out tests)
- [x] DevTools → Network tab (filter: `billing`, `portfolio`, `profile`, `resume`)
- [x] DB access via Prisma Studio:

```bash
npx prisma studio
```

### 0.4 Test accounts


| Account   | Email suggestion           | Purpose             |
| --------- | -------------------------- | ------------------- |
| **Trial** | `trial-test@…`             | Fresh sign-up       |
| **Free**  | Reuse Trial after DB tweak | Expired trial       |
| **Pro**   | `pro-test@…` or DB tweak   | Active subscription |


- [x] Trial account created (or planned)

---

## DB cheat sheet

Use between phases in Prisma Studio → `users` table:


| Simulate  | `createdAt`    | `subscriptionStatus` |
| --------- | -------------- | -------------------- |
| Trial     | Recent (today) | `none`               |
| Free      | 31+ days ago   | `none`               |
| Pending   | Any            | `pending`            |
| Pro       | Any            | `active`             |
| Cancelled | Any            | `none`               |


---

## Phase 1 — Verify tier detection (~5 min)

### Step 1: Sign up as Trial user

1. Go to `/sign-up`
2. Create account (e.g. `trial-test@…`)
3. Log in and land on `/dashboard`

- [x] Account created and logged in

### Step 2: Check billing API

1. Open DevTools → Network
2. Go to `/dashboard/billing`
3. Find `GET /api/billing/me` and inspect the response

Expected:

- [x] `access.tier === "trial"`
- [x] `canUsePremiumTemplates === true`
- [x] `canUseImports === true`
- [x] `trialDaysRemaining` ≈ 30
- [x] `subscription === null`
- [x] `razorpayReady === true`

---

## Phase 2 — Trial user: full access (~15 min)

Stay logged in as the Trial user.

### Step 3: Premium templates

1. Go to `/dashboard/templates`
2. Confirm green "Free trial active" banner
3. Click a non-minimal template (e.g. Modern or Bento)

- [x] No lock icons on templates
- [x] Template saves successfully (success toast)

### Step 4: Imports

1. Go to `/dashboard/import`
2. Check all 4 tabs: Resume, GitHub, Medium, LeetCode

- [x] No amber lock banner
- [x] All tabs enabled
- [x] Importers visible (Resume uploader, GitHub importer, etc.)

### Step 5: Live preview limit (2 slots)

1. Go to `/dashboard/edit` → Projects
2. Create 3 projects, each with a live URL (e.g. `https://example.com`)
3. Enable live preview on project 1
4. Enable live preview on project 2
5. Try to enable live preview on project 3

- [x] Projects 1 and 2 enable successfully
- [x] Project 3 blocked — "Upgrade to Pro" or "X/2 used" shown

### Step 6: Publish on premium template

1. Set a slug (e.g. `trial-test`) in settings or publish step
2. Go to `/dashboard/preview` → click **Publish**
3. Open `/p/trial-test`

- [x] Public site loads with premium template (not minimal)

---

## Phase 3 — Expired trial → Free tier (~20 min)

### Step 7: Expire trial in database

1. Prisma Studio → `users` → find trial account
2. Set `createdAt` → **31 days ago**
3. Set `subscriptionStatus` → `**none`**
4. Save

- [x] DB updated

### Step 8: Re-check tier

1. Log out and log back in (or hard refresh)
2. Go to `/dashboard/billing`
3. Inspect `GET /api/billing/me`

Expected:

- [x] `access.tier === "free"`
- [x] `trialDaysRemaining === 0`
- [x] `canUsePremiumTemplates === false`
- [x] `canUseImports === false`
- [x] `allowedTemplateIds === ["minimal"]`
- [x] Billing page badge shows **Free**
- [x] Amber "trial ended" message visible

### Step 9: Template locks (UI)

1. Go to `/dashboard/templates`
2. Confirm amber "trial ended" banner
3. Confirm non-minimal templates have lock overlay
4. Click a locked template (e.g. Modern)
5. Click **Minimal**

- [x] Locked template shows toast "Upgrade to Pro…" and does not change
- [x] Minimal template still selectable and saves

### Step 10: Preview fallback

1. Go to `/dashboard/preview`
2. Try switching to a locked template in the sidebar

- [x] Preview renders as **minimal** (even if DB has premium template)
- [x] Locked template switch shows toast and does not persist

### Step 11: Import locks (UI)

1. Go to `/dashboard/import`

- [x] Amber banner at top
- [x] All tabs disabled
- [x] Locked placeholder text on each tab (no importers)

### Step 12: Import lock (API bypass)

DevTools Console (logged in as Free user):

```javascript
fetch("/api/resume/parse", { method: "POST", body: new FormData() })
  .then(r => r.json())
  .then(console.log)
```

- [x] Status **403**, body includes `code: "PLAN_LIMITED"`

Optional — repeat for `/api/profile/github/fetch`:

- [x] Same 403 response

### Step 13: Template lock (API bypass)

DevTools Console:

```javascript
fetch("/api/portfolio/template", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ templateId: "modern" })
}).then(async r => ({ status: r.status, body: await r.json() })).then(console.log)
```

- [x] Status **403**, `code: "PLAN_LIMITED"`
- [x] Error message mentions upgrading to Pro

### Step 14: Public site fallback

1. Open `/p/trial-test` (published in Phase 2)

- [x] Public site renders **minimal**, not the stored premium template
- [x] Portfolio is still published (not 404)

### Step 15: Free essentials still work

1. Go to `/dashboard/edit` — add or edit content, save
2. Go to `/dashboard/preview` — publish toggle still works
3. Confirm previously imported content is still visible

- [x] Edit and save works
- [x] Publish / unpublish works
- [x] Existing imported data still visible

---

## Phase 4 — Pro user (~10 min)

### Step 16: Activate Pro in DB

1. Prisma Studio → same user (or new account)
2. Set `subscriptionStatus` → `**active`**
3. Save

- [x] DB updated

### Step 17: Verify Pro tier

1. Refresh `/dashboard/billing`
2. Inspect `GET /api/billing/me`

Expected:

- [x] `access.tier === "pro"`
- [x] `subscription.status === "ACTIVE"`
  - [x] `canUsePremiumTemplates === true`
- [x] `canUseImports === true`
- [x] Pro badge shown, no upgrade button

### Step 18: Re-test unlocked features

1. `/dashboard/templates` — select premium template → saves
2. `/dashboard/import` — all tabs enabled
3. Enable live preview on 3+ projects
4. `/p/trial-test` — public site shows premium template

- [x] Premium templates unlocked
- [x] Imports unlocked
- [x] Live preview limit lifted (3+ projects work)
- [x] Public site shows premium template
- [x] Billing page shows "Unlimited" live preview slots

---

## Phase 5 — Subscription checkout (~15–20 min)

Use Razorpay **test mode**. Start with a fresh non-Pro account.

### Step 19: Start checkout

1. Log in as non-Pro user
2. Go to `/dashboard/billing`
3. Click **Upgrade to Pro — ₹599/month**
4. Watch Network for `POST /api/billing/checkout`

- [ ] Response contains `checkoutUrl`
- [ ] Browser redirects to Razorpay
- [ ] DB: `subscriptionStatus === "pending"`

### Step 20: Complete Razorpay test payment

1. Use Razorpay test card/details
2. Complete payment
3. Land on `/dashboard/billing?payment_status=success`

- [ ] Green banner: "Payment received — subscription being activated"

### Step 21: Pending state (before webhook)

1. Refresh `/dashboard/billing`
2. Inspect API response

- [ ] `subscription.status === "PENDING"`
- [ ] `access.tier` is **not** `"pro"` yet
- [ ] Upgrade button shows "Payment pending…" and is disabled
- [ ] Premium templates / imports still locked (if trial expired)

### Step 22: Pricing page states

1. Go to `/pricing` while logged in

- [ ] Trial user: green banner with days remaining
- [ ] Free user: amber "trial ended" banner
- [ ] Pending user: "Complete subscription" button visible
- [ ] Active Pro: "Your subscription is active"

Also test checkout from pricing page:

- [ ] "Subscribe to Pro" on `/pricing` triggers same checkout flow

---

## Phase 6 — Webhook activation (~10 min)

Configure Razorpay webhook:

- URL: `https://your-domain/api/billing/webhook` (use ngrok locally)
- Events: `subscription.activated`, `subscription.charged`, `subscription.cancelled`, etc.

### Step 23: Trigger activation

**Option A:** Wait for Razorpay to fire automatically after test payment

**Option B:** Razorpay Dashboard → send test event `subscription.activated` with `notes.userId` = user UUID

**Option C (entitlements only):** Set `subscriptionStatus = "active"` in DB

- [ ] Webhook received (or DB manually set)

### Step 24: Confirm Pro after activation

1. Refresh `/dashboard/billing`

- [ ] `access.tier === "pro"`
- [ ] `subscription.status === "ACTIVE"`
- [ ] Templates and imports unlocked without logout

### Step 25: Webhook security (optional)

Test `POST /api/billing/webhook`:

- [ ] Missing `x-razorpay-signature` → **400**
- [ ] Invalid signature → **401**
- [ ] Missing `RAZORPAY_WEBHOOK_SECRET` → **503**
- [ ] Payload without `userId` in notes → `{ ok: true, ignored: true }`

### Step 26: Webhook status mapping


| Event                        | Expected `subscriptionStatus` |
| ---------------------------- | ----------------------------- |
| `subscription.authenticated` | `pending`                     |
| `subscription.pending`       | `pending`                     |
| `subscription.activated`     | `active`                      |
| `subscription.charged`       | `active`                      |
| `subscription.resumed`       | `active`                      |
| `subscription.halted`        | `none`                        |
| `subscription.cancelled`     | `none`                        |
| `subscription.paused`        | `none`                        |
| `subscription.completed`     | `none`                        |


- [ ] `activated` / `charged` → Pro entitlements on next `/api/billing/me`
- [ ] `cancelled` / `halted` / `paused` → entitlements revoked

---

## Phase 7 — Cancellation / downgrade (~10 min)

### Step 27: Simulate cancellation

**Option A:** Cancel in Razorpay Dashboard → webhook `subscription.cancelled`

**Option B:** Prisma Studio → `subscriptionStatus = "none"`

- [ ] Cancellation triggered

### Step 28: Verify access revoked

1. Refresh `/dashboard/billing`
2. Check templates, imports, public site

- [ ] Tier back to **free** (or **trial** if trial not expired)
- [ ] Premium templates locked
- [ ] Imports locked
- [ ] `/p/trial-test` falls back to **minimal**
- [ ] API blocks premium template change (403)

### Step 29: Premium template held through downgrade

1. User was on premium template (e.g. `spotlight`) while Pro
2. After cancellation, check DB vs live site

- [ ] DB may still store premium `templateId`
- [ ] Live site and preview show **minimal**
- [ ] User can switch to `minimal` but not to another premium template

---

## Phase 8 — Marketing UI (~5 min)

### Step 30: Logged-out pricing

1. Incognito → `/pricing`

- [ ] Starter CTA → `/sign-up`
- [ ] Pro CTA → "Sign up to subscribe" (not direct checkout)

### Step 31: Landing page pricing

1. Incognito → `/` (landing page pricing section)

- [ ] CTAs match logged-out behavior

### Step 32: Billing page feature rows

On `/dashboard/billing`, confirm rows match tier:


| Feature                | Trial      | Free       | Pro       |
| ---------------------- | ---------- | ---------- | --------- |
| Premium templates      | Unlocked   | Locked     | Unlocked  |
| Resume & GitHub import | Unlocked   | Locked     | Unlocked  |
| Live preview slots     | 2 included | 2 included | Unlimited |


- [ ] Rows accurate for each tier tested

---

## Phase 9 — Edge cases (~10 min)

### Step 33: Billing not configured

1. Stop dev server
2. Comment out Razorpay env vars
3. Restart, log in as free user (expired trial in DB)
4. Check `/api/billing/me`

- [ ] `razorpayReady === false`
- [ ] `canUseImports === true` (dev fallback)
- [ ] `canUsePremiumTemplates === true` (dev fallback)
- [ ] Billing page: "Payments are not configured"
- [ ] Upgrade buttons disabled

### Step 34: Unauthenticated API

Log out, DevTools Console:

```javascript
fetch("/api/billing/checkout", { method: "POST" }).then(r => r.status).then(console.log)
```

- [ ] Status **401**

### Step 35: Checkout without Razorpay config

With env vars removed, logged in:

```javascript
fetch("/api/billing/checkout", { method: "POST" }).then(async r => ({ status: r.status, body: await r.json() })).then(console.log)
```

- [ ] Status **503** with clear error message

---

## End-to-end journeys (summary)

### Journey A — Trial → Free

1. Sign up → use premium template + import + publish
2. Backdate `createdAt` 31 days
3. Confirm restrictions apply; edit/publish still works

- [ ] Complete journey passes

### Journey B — Trial → Pro

1. Sign up → start checkout → complete payment
2. Confirm pending → webhook activates → Pro unlocked

- [ ] Complete journey passes

### Journey C — Pro → Cancelled

1. Active Pro on premium template
2. Cancel subscription
3. Confirm downgrade immediate

- [ ] Complete journey passes

---

## Known behaviors to verify (not bugs)

- [ ] No in-app cancel flow — cancellation is Razorpay + webhook only
- [ ] Trial is based on `createdAt`, not first login or first publish
- [ ] Live preview limit (2) applies to trial users too
- [ ] Pricing card "Manage billing" links to `/dashboard/settings` (confirm intentional)
- [ ] Pro "Unlimited" live previews is capped at 50 in code

---

## Quick pass/fail summary


| Phase | What you proved                                                     |
| ----- | ------------------------------------------------------------------- |
| 1–2   | Trial = full access, 2 live preview cap                             |
| 3     | Free = minimal only, no imports, API + UI enforced, public fallback |
| 4     | Pro = everything unlocked                                           |
| 5–6   | Checkout → pending → webhook → active                               |
| 7     | Cancel → access revoked                                             |
| 8     | Pricing / marketing UI correct per state                            |
| 9     | Dev fallback and auth guards                                        |


---

## Tips

1. **Hard refresh or re-login** after DB changes — billing state is fetched on page load.
2. **Webhook is source of truth for Pro** — don't expect Pro immediately after Razorpay redirect.
3. For local webhooks, use **ngrok** and point Razorpay to your tunnel URL.
4. If a step fails, check Network tab for the exact API response before moving on.

