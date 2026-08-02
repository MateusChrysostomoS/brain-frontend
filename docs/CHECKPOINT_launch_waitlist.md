# CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half)

Status: **BUILT + tested + verified in the browser (2026-08-01)**, UNCOMMITTED, not deployed.

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

## What the gate does

Two doors, both reading `PRODUCT_LAUNCHED`:

### Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons)

Every purchasable card on the site (secretarIA plans, PreCheck plans, add-ons, on both `/`
and `/secretaria`) renders this one component as its `cta`. The gate is the FIRST thing in
`handleClick()`, before the session is even read:

```
if (!PRODUCT_LAUNCHED) { setWaitlistOpen(true); return; }
```

So neither the anonymous path (`/cadastro`) nor the logged-in path
(`createCheckoutSession` → Stripe) is reachable. `<CheckoutTrialNotice />` is also
suppressed while gated — it is a disclosure about a checkout the button cannot reach, and
leaving it would promise a trial nobody can start (and fire a `/public/checkout-config`
request per card for nothing).

### Door 2 — `cadastro/page.tsx` (the signup wizard route)

**Not in the original spec — added because the premise "PlanCheckoutCta is the single
purchase entry point" turned out not to hold.** `app/(site)/page.tsx:350` renders a
"Precisa de mais volume? Conheça o PreCheck Advanced →" link pointing straight at
`/cadastro?plan=precheck_advanced`, bypassing the CTA entirely. Bookmarks and stale
marketing links do the same.

Rather than edit the pricing page (explicitly out of scope — it stays byte-identical),
the wizard route itself is gated: while `PRODUCT_LAUNCHED` is false, `/cadastro` never
renders `CadastroWizard` (no registration, no signup intent, no Stripe) and shows the same
waitlist capture inline instead. Checked BEFORE the plan id is validated, so a bad link
gets "Estamos quase lá" rather than the more confusing "Plano não encontrado".

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

Nothing was sent to the deployed brain-api: `fetch` was stubbed for the submit tests
(`.env.local` points at `secretaria-brain-api.cpux9k.easypanel.host`, and the endpoint is
not deployed there yet).

## Pricing screen — unchanged

`PriceCard.tsx`, `_lib/pricing.ts`, prices, copy and layout were **not** touched. The only
visual difference while gated is the deliberately suppressed `CheckoutTrialNotice` line
under the buy button.

## Pendências

- [ ] Deploy brain-api first (this frontend calls `POST /public/launch-waitlist`; until it
      exists the modal shows its error state and captures nothing).
- [ ] Apply brain-api migration `0011_launch_waitlist`.
- [ ] On launch day: set `PRODUCT_LAUNCHED = true` in `app/(site)/_lib/launch.ts`, rebuild,
      deploy. Nothing else.
- [ ] Optional follow-up: if you'd rather the "PreCheck Advanced" upsell open the modal
      in place (instead of navigating to the gated `/cadastro`), that needs a small change
      to `app/(site)/page.tsx` — left alone here because the plans screen was out of scope.
