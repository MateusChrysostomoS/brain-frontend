# Manual verification — billing, refresh tokens & secretarIA hub handoff

Frontend adoption round for brain-api's billing/auth surface (CONTRACTS §2.1a/b,
§12.2, §13). Automated coverage lives in `lib/__tests__/manage-api.test.ts`
(`npm test`, 14 tests: refresh-and-retry, single-flight, logout, checkout/portal
error branches, hub-token mint). This note is the user-facing pass — run it
against a dev mesh before calling the round shipped.

## Environment

```
NEXT_PUBLIC_MANAGE_API_BASE_URL=http://localhost:8000        # brain-api
NEXT_PUBLIC_SECRETARIA_HUB_BASE_URL=http://localhost:8001    # secretarIA
```

brain-api needs `STRIPE_SECRET_KEY` + `STRIPE_PRICE_MAP` (test-mode price ids
for `precheck`, `secretaria_ferro`, `secretaria_bronze_1`, `complete_clinic_combo`
and any add-on you'll click) and `STRIPE_WEBHOOK_SECRET` (run
`stripe listen --forward-to localhost:8000/webhooks/stripe`).

Start the dev server from the UPPERCASE drive path — `next dev` crashes on
`c:\...` in this repo: `cd C:\TECH\BRAIN\brain-frontend; npm run dev`.

## 1. Refresh-token session lifecycle

1. Log in at `/login` as a tenant user. In devtools → Session Storage →
   `brain.session` now contains `refreshToken` alongside `token`.
2. Force expiry: in the console overwrite the access token with a garbage JWT
   (`s = JSON.parse(sessionStorage["brain.session"]); s.token = s.token.slice(0, -2) + "xx"; sessionStorage["brain.session"] = JSON.stringify(s)`),
   then navigate within `/app`. Expected: ONE `POST /auth/refresh` in the
   network tab, the original request retried and succeeding, session updated
   with a NEW refresh token (rotate-on-use).
3. Replay the OLD refresh token via curl → 401 and the whole family revoked
   (next in-app refresh bounces you to `/login`). This is reuse detection
   working, not a bug.
4. "Sair" (any portal): `POST /auth/logout` fires (204) and the session is
   cleared even if you kill the network first (best-effort by design).
5. Access TTL is 30 min on purpose — do NOT raise `ACCESS_TOKEN_EXPIRE_MINUTES`;
   the refresh flow is the mechanism that keeps sessions alive.

## 2. Billing (Stripe test mode)

1. Logged OUT → any pricing CTA on `/` routes to `/login`. Logged in as
   platform admin → inline "Entre com a conta da clínica para contratar."
2. Logged in as a tenant → "Contratar"/checkout CTA → full-page redirect to a
   Stripe test Checkout. Pay with `4242 4242 4242 4242`. After the webhook lands,
   `/app/billing` shows the new plan/status/add-ons (the webhook is the only
   entitlement writer — allow a second for delivery).
3. Error branches (unset config to reproduce): no `STRIPE_PRICE_MAP` → inline
   "Cobrança ainda não configurada. Fale com a Brain." (503); never a crash.
4. `/app/billing` → "Gerenciar assinatura" opens the Billing Portal for a
   tenant that has checked out; a tenant that never checked out gets the 409
   inline notice with a link back to `/#planos`.

## 3. secretarIA hub handoff

1. Tenant WITH secretarIA entitled: open `/secretaria/configuracao` →
   network tab shows `POST /doctor/secretaria/hub-token` (brain-api) then
   `GET /tenants/me/config` (secretarIA, `Authorization: Bearer <hub_token>`).
   Form hydrates from the real tenant row; saving PUTs it back. "Conectar
   Google" starts the real OAuth consent flow.
2. `/secretaria/agenda` shows the tenant's real current-week events, and
   appointment CREATE / slot BLOCK write for real (see the LIVE/DEMO-ONLY
   table below). Cancel/reschedule are still local demo state.
3. Tenant WITHOUT secretarIA (or after cancelling in Stripe): the mint 403s
   and both pages show the inline "não habilitada" notice — same pattern as
   the PreCheck SSO 403. No hard redirect; the demo rendering stays.
4. Token expiry: leave the tab open past `HUB_TOKEN_EXPIRE_MINUTES` (60) and
   act again — the client re-mints once on the 401 and retries; it never
   touches `/auth/refresh` for the hub token (purpose-scoped, separate leg).

### What's actually live vs. demo, per action/field

| Area | LIVE (hub-backed) | DEMO-ONLY (and why) |
|---|---|---|
| `/secretaria/configuracao` | greeting/persona/language/timezone/appointment-duration/business-hours/services (appointment_types)/is_active via `PUT /tenants/me/config`; `clinic_name` hydrates read-only; Google OAuth connect/disconnect (`GET .../oauth/start`, `POST .../disconnect`) | address (line/complement/neighborhood/city/state/postalCode), insurances, clinic phone, tone, specialty, about, `collectInsurance`, scheduling `gap`/`lead`, Google account email/calendar-name/timezone-picker/two-way-sync — **none exist on `TenantConfigUpdate`** (secretarIA `schemas/config.py`); kept in the UI (not removed, not folded into `persona_notes`) |
| `/secretaria/agenda` | week READ (`GET .../calendar/events`); appointment CREATE (`POST .../calendar/appointments`); slot BLOCK (`POST .../calendar/blocks`) — both refetch the week on success instead of fabricating a local row | appointment cancel/reschedule (`POST .../appointments/{id}/cancel\|reschedule`) — blocked because `CalendarEventRead` (the read model) carries only the Google event id, never the DB `Appointment.id` those endpoints require, and no hub endpoint maps `google_event_id -> Appointment.id`; the demo flashes' "confirmação/aviso enviado no WhatsApp" copy is also a demo-only flourish — the real hub create/block calls send no WhatsApp message, so the live-path flash says "Consulta criada na agenda." instead |

Demo-mode (not `hubReady`) keeps ALL of the above as local-only state
regardless of the table, same as before this pass.

## 4. Entitlement-aware gating

- Doctor portal nav: Anamneses only with PreCheck; Agenda/Pacientes/
  Configurações only with secretarIA. Nav hiding is UX only — the backend
  still 403s per route (fail-open on entitlement fetch error is intentional).
- `/app` panels and `/app/billing` add-on list reflect `GET /entitlements`
  (full `addons`/`limits` keysets) — flip an add-on via the admin PATCH and
  reload to see it ripple.
