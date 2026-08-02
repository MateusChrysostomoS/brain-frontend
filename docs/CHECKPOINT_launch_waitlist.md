# CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half)

Status: **BUILT + tested + verified in the browser (2026-08-01)**, UNCOMMITTED, not deployed.
**Amended 2026-08-02: the gate is now SCOPED TO secretarIA, not global — see "Scoping"
below.** PreCheck (Basic and Advanced) checks out normally; only secretarIA-bearing
purchases still hit the waitlist.

```
.\node_modules\.bin\tsc.cmd --noEmit      # clean
npm test                                  # 91 passed (4 files) — was 87, +4 new
npm run build                             # clean, all routes still static
```

(`npm run lint` is not usable in this repo — `next lint` prompts to configure ESLint from
scratch. Pre-existing, unrelated to this round.)

The backend half is in `brain-api/docs/CHECKPOINT_launch_waitlist.md`.

## THE FLAG

```
app/(site)/_lib/launch.ts   →   export const PRODUCT_LAUNCHED = false;
```

**That one line is the whole switch.** Flip it to `true` on launch day and the purchase
flow returns to exactly what it was — no other code change, nothing to un-delete. Nothing
else in the repo hardcodes "not launched".

It is a code constant rather than an env var on purpose: the pricing page is statically
exported, so an env read would either be baked in at build time anyway (same effect, but
invisible in the diff) or force a runtime fetch onto a page that must not wait on the
network to decide whether a button works.

## Scoping — which purchases the gate applies to (2026-08-02)

The flag above stayed, but it is no longer consulted directly by the two doors. Both now
call one helper, also in `_lib/launch.ts`:

```ts
export function isPurchaseGated(catalogIds: string[]): boolean {
  if (PRODUCT_LAUNCHED) return false;
  return catalogRequiresWhatsappCoexistence(catalogIds);   // lib/manage-api.ts
}
```

**Why:** the original global boolean was correct about the mechanism (one component owns
every buy button) and wrong about the commercial reality — it also blocked PreCheck, which
is on sale. The two products launch independently: what is not ready is secretarIA's
WhatsApp Coexistence approval, which is exactly what
`catalogRequiresWhatsappCoexistence` already identifies (every `secretaria*` plan + the
combo, mirroring brain-api's catalog). Reusing it means the gate and the pre-checkout
trial disclosure can never disagree about what "a secretarIA purchase" is.

Flipping `PRODUCT_LAUNCHED` to `true` still opens everything at once, as before.

## What the gate does

Two doors, both calling `isPurchaseGated` with the ids of the purchase at hand:

### Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons)

Every purchasable card on the site (secretarIA plans, PreCheck plans, add-ons, on both `/`
and `/secretaria`) renders this one component as its `cta`. The gate is the FIRST thing in
`handleClick()`, before the session is even read:

```
const gated = isPurchaseGated(purchaseCatalogIds);   // plan + catalogIds
...
if (gated) { setWaitlistOpen(true); return; }
```

For a gated card neither the anonymous path (`/cadastro`) nor the logged-in path
(`createCheckoutSession` → Stripe) is reachable; for a PreCheck card both work normally.
`<CheckoutTrialNotice />` is suppressed on the same condition — it is a disclosure about a
checkout the button cannot reach, and leaving it would promise a trial nobody can start.
(On an ungated PreCheck card it now mounts but renders nothing and fires no
`/public/checkout-config` request, since `catalogRequiresWhatsappCoexistence` is false
there too.)

### Door 2 — `cadastro/page.tsx` (the signup wizard route)

**Not in the original spec — added because the premise "PlanCheckoutCta is the single
purchase entry point" turned out not to hold.** Bookmarks and stale marketing links reach
`/cadastro?plan=...` directly. (Until 2026-08-02 the pricing page itself did too, via a
"Conheça o PreCheck Advanced →" text link — that link is gone now that Advanced has a real
card.)

So the wizard route is gated on the same per-product rule: a secretarIA-bearing `?plan=`
never renders `CadastroWizard` (no registration, no signup intent, no Stripe) and shows the
waitlist capture inline instead, while `?plan=precheck_basic|precheck_advanced` goes
straight through. Checked AFTER `resolvePlan`, because which plan the link carried is now
what decides the answer; an unknown plan id therefore gets "Plano não encontrado" (it used
to get "Estamos quase lá", which was the honest answer only while nothing was for sale).

## Components

- **`_components/LaunchWaitlistForm.tsx`** (new) — the capture itself: Nome + E-mail,
  submit, and the confirmation that replaces them on success. Presentation-free so both
  surfaces above can host it. Never unmounts itself on failure: a network/server error
  shows inline and keeps what the visitor typed (retrying is safe — the backend is
  idempotent per e-mail).
- **`_components/LaunchWaitlistModal.tsx`** (new) — dialog chrome around that form.
- **`lib/manage-api.ts`** — `submitLaunchWaitlist()` → `POST /public/launch-waitlist`,
  unauthenticated, sending `plan_hint` = the clicked card's catalog ids joined by `,`
  (sliced to the backend's 255-char column so a long selection can't 422 a lead away).

### Two decisions worth remembering in the modal

1. **It uses the site design system, not `_components/Modal`.** That shared modal is styled
   by `PortalShell.css`, which the `(site)` layout does not load — reusing it would have
   pulled 555 lines of portal CSS onto the marketing pages, exactly the kind of thing that
   stops a "pixel-identical" pricing page from being pixel-identical. The overlay is
   inline-styled (like `PlanCheckoutCta`'s own `alertStyle`); the card is `.card` +
   `.field-l` + `.input` + `.btn` from `brand-ds.css`. No new dependency.

2. **It renders through `createPortal` into `<body>`.** `PriceCard` sits inside `<Reveal>`,
   whose `.reveal` class carries a `transform` until it scrolls into view — and any
   transformed ancestor makes `position:fixed` resolve against that ancestor instead of
   the viewport, which would strand the overlay inside the card. The portal also escapes
   `.band-dark`'s token overrides, so the modal always reads the page-level theme from
   `<html data-theme>`.

### Accessibility

`role="dialog"` + `aria-modal`, labelled by its own heading, Esc closes, Tab/Shift+Tab wrap
inside the card, focus moves to the Nome field on open and is **restored to the button that
opened it** on close.

That last part cost a real bug worth not reintroducing: the form originally used React's
`autoFocus`, which React applies during the COMMIT phase — before the modal's effect runs.
The effect therefore recorded the Nome input (not the buy button) as "the opener", and
closing restored focus to a detached element, i.e. nowhere. The modal now records the
opener first and focuses the field itself, and `autoFocus` is documented as forbidden in
`LaunchWaitlistForm`. Related: the close-time restore checks `activeElement` is
`<body>`/null, NOT `card.contains(activeElement)` — by cleanup time React has already
detached the portal, so the `contains` check reads correctly and never fires.

## Browser verification (dev server, 2026-08-01)

Both pricing pages, both themes:

- Anonymous click on "Contratar PreCheck Basic" / "Contratar secretarIA" → modal opens,
  URL unchanged, no navigation to `/cadastro`.
- **Logged-in clinic session** (`tenant_owner` + `tenantId` in `sessionStorage`) → modal
  opens, **zero network calls**, no `/billing/checkout`, no Stripe redirect.
- Submit (stubbed 201) → `POST /public/launch-waitlist`, **no `Authorization` header**,
  name/e-mail trimmed, `plan_hint: "secretaria_basico"`; modal stays open and the form is
  replaced by the confirmation, with focus moved onto the dialog.
- Submit (stubbed network failure) → modal stays open, inline error, typed values kept,
  submit re-enabled.
- Client-side validation (blank name, `not-an-email`, `a@b`) → inline pt-BR message, **zero
  network calls**.
- Esc and the × button both close and return focus to the originating button.
- Focus trap: Tab at the last focusable wraps to the first.
- `/cadastro?plan=precheck_advanced` → "Estamos quase lá", no wizard, no password field.
- `CheckoutTrialNotice` absent and **zero `/public/checkout-config` requests** while gated.
- Console clean (no errors/warnings).

### Re-verified after the 2026-08-02 scoping (dev server)

- "Contratar secretarIA" → modal "Estamos quase lá", URL unchanged. **Not regressed.**
- "Contratar Basic" / "Contratar Advanced" → no modal; navigates to
  `/cadastro?plan=precheck_advanced&catalog=precheck_advanced` and the wizard renders
  ("Vamos criar sua conta").
- `/cadastro?plan=secretaria_basico` opened directly → still "Estamos quase lá", no wizard.

Nothing was sent to the deployed brain-api: `fetch` was stubbed for the submit tests
(`.env.local` points at `secretaria-brain-api.cpux9k.easypanel.host`, and the endpoint is
not deployed there yet).

## Pricing screen

Untouched by the original round (the only visual difference while gated was the suppressed
`CheckoutTrialNotice` line). **Changed on 2026-08-02 for a different reason** — PreCheck
Advanced became a real fourth `PriceCard` and the pricing grid went to 4 columns; see
`CHECKPOINT_precheck_billing_portal.md`.

## Pendências

- [ ] Deploy brain-api first (this frontend calls `POST /public/launch-waitlist`; until it
      exists the modal shows its error state and captures nothing).
- [ ] Apply brain-api migration `0011_launch_waitlist`.
- [ ] On secretarIA launch day: set `PRODUCT_LAUNCHED = true` in
      `app/(site)/_lib/launch.ts`, rebuild, deploy. Nothing else.
- [x] ~~Optional follow-up: make the "PreCheck Advanced" upsell open the modal in place~~ —
      moot since 2026-08-02: the upsell link is gone (Advanced is a real card) and PreCheck
      is no longer gated at all.
- [ ] PreCheck now checks out for real from the landing page, so its Stripe Prices
      (`precheck_basic` / `precheck_advanced` in `STRIPE_PRICE_MAP`) must actually exist in
      the deployed environment before this ships — otherwise the button reaches Checkout
      and gets 503 `price_not_configured`. See
      `brain-api/docs/CHECKPOINT_precheck_billing.md`.
