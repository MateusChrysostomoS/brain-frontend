# CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar

Date: 2026-08-01. State: **frontend DONE** for both rounds described below; pending a live
e2e pass against a dev mesh running the new secretarIA backend endpoints this round
consumes (`google_calendar_mode`, `POST .../professionals/{id}/calendar` — shipped and
unit-tested server-side this session, 1049 tests green, but never exercised end-to-end
from this UI against a running secretarIA).

Round scope: two related pieces of brain-frontend work landed together this session:

1. **Meu Perfil (`/doctor/perfil`)** — new route, portal design system. A prior agent in
   this session built the page shell + "Informações pessoais" card (name editable via
   `PATCH /doctor/me` / `updateDoctorMe`, e-mail/clinic/role read-only) and wired the nav
   item (`app/(site)/doctor/layout.tsx`'s `DOCTOR_NAV`). This round added the second card,
   "Configuração da secretaria" (self-scoped to the logged-in user's own professional),
   plus a self-bind prompt for an owner with no professional yet. (Esse card foi depois
   renomeado para "Configurações secretarIA" e seu título extraído no componente local
   `CardTitle` — ver `CHECKPOINT_header_unificado_produtos.md`.)
2. **Google Calendar integration modes (`/secretaria/configuracao`, hub design system)** —
   UI for the new secretarIA contract: a tenant-wide `google_calendar_mode`
   (`per_professional` | `shared_account`) and, in `shared_account` mode, a
   backend-created secondary calendar per professional inside the clinic's own connected
   Google account (`POST /tenants/me/professionals/{id}/calendar`).

## What changed

### Shared client layer — `lib/secretaria-hub.ts`
- `HubApiError` gained an optional `.code`. `parseHubResponse` now tolerates BOTH error
  shapes secretarIA sends: a plain `detail` string (every existing hub error — behavior
  unchanged) and the new structured `detail: {code, message}` (the two calendar-creation
  errors below). `.message` is always display-ready pt-BR either way; `.code` is only set
  for the structured shape, so callers branch on `.code`, never on parsing `.message`.
- Added `HUB_ERROR_CLINIC_CALENDAR_NOT_CONNECTED` / `HUB_ERROR_GOOGLE_RECONNECT_REQUIRED`
  string constants and `createProfessionalCalendar(session, professionalId)` ->
  `POST /tenants/me/professionals/{id}/calendar` (no body) ->
  `{professional_id, google_calendar_id, created}`.
- `TenantConfigWire` / `TenantConfigUpdatePayload` gained `google_calendar_mode`.
- New tests: `lib/__tests__/secretaria-hub.test.ts` (9 tests) — string vs. structured
  `detail` parsing (incl. malformed/missing-body fallback to `statusText`),
  `createProfessionalCalendar` success / idempotent-replay / 422 / 409, and
  `google_calendar_mode` round-tripping through `getTenantConfig`/`updateTenantConfig`.

### Entrega 1 — `/secretaria/configuracao` (hub design system)
- **`configuracao/lib/types.ts`** — `GcalState` gained `mode: GoogleCalendarMode` (a local
  union mirroring the wire type, same convention `PixDeposit.retentionPolicy` already uses).
- **`configuracao/lib/hub-mapping.ts`** — new `applyWireGcal(cfg)` helper; `hhmmToMinutes`/
  `minutesToHhmm` are now exported (reused as-is by the `/doctor/perfil` hours editor, see
  below); `buildConfigUpdatePayload` takes a 6th `gcalMode` param and includes
  `google_calendar_mode` in the PUT body.
- **`configuracao/components/GoogleSection.tsx`** — new mode selector at the top of
  Section 08 ("Por profissional" / "Conta única da clínica") + a 1–2 sentence explanation
  per option (the `shared_account` copy explicitly recommends an institutional clinic
  account, never a personal Gmail — "ela passa a ser dona das agendas de todos os
  profissionais") + a fixed footnote ("trocar de modo agora não desconecta nada — só muda
  o fluxo de conexão oferecido daqui pra frente"). The disconnected-state card gets one
  extra reinforcing line when `mode === "shared_account"`. New props: `onModeChange` (a
  plain local setter, batched into the SAME "Salvar configuração" PUT as every other field
  on this page — not its own save action) and `readOnly` (disables the selector while the
  hub is unreachable, same convention as every other section).

  **Rework 2026-08-02 — visual only, `onModeChange`/`gcal.mode`/`readOnly` untouched.**
  The selector was a `Segmented` pill sitting inside a full-width rounded `<div>` that had
  no `onClick`, no `cursor`, no role: the big box read as the control while only the small
  pill inside it was clickable. It is now a `RadioPillGroup` — two full-width
  `<label>` + `<input type="radio">` cards where the whole card is the click/tap target and
  each option carries its own explanation, so the visitor knows what each mode does BEFORE
  choosing. The decorative wrapper is gone (the option cards themselves are the rounded
  surfaces now); the `shared_account` institutional-account warning stays as a separate
  line that appears on selection, since it is a consequence, not a description.
- **`_components/RadioPillGroup.tsx`** — promoted out of `cadastro/_components/` (same
  file, moved) when GoogleSection became its second caller; gained an optional `disabled`
  prop backing `readOnly`, plus `.radio-pill.is-disabled` in `brand-ds.css`. The three
  `/cadastro` intake steps import it from the new path; markup and styling are unchanged
  for them. Works on the product routes because `.radio-pill--block` lives in
  `brand-ds.css`, which the `(site)` layout loads for `/secretaria/configuracao` too.
- **`_shared/ui.tsx`** — `Segmented` gained an optional `disabled` prop (small additive
  change; it was used by the mode selector until the 2026-08-02 rework above and is kept —
  every other call site is unaffected).
- **`configuracao/components/ProfessionalsSection.tsx`** — the roster is now mode-aware:
  - New props: `googleCalendarMode`, `clinicCalendarConnected` (= `gcal.connected`),
    `googleCalendarIdByProfessional` (professional id -> `ProfessionalWire.google_calendar_id`,
    derived in `page.tsx` from the hub roster it already fetches into `hubProfessionalsById`).
  - `per_professional` mode: **unchanged** — existing per-row OAuth flow.
  - `shared_account` mode: the row's Calendar button becomes "Criar agenda do
    profissional" and calls the new `createProfessionalCalendar`; once
    `google_calendar_id` is set it shows an "Agenda criada" pill instead of a button
    (creation is idempotent — there is nothing left to do, per this round's explicit
    instruction not to offer a "recreate"). The button is disabled with a pt-BR tooltip
    when the clinic hasn't connected Google yet.
  - "Agenda" `CompletenessChip`: `shared_account` -> `ok = google_calendar_id != null`;
    `per_professional` -> unchanged `has_calendar`.
  - Both `startProfessionalCalendarOauth` failures and `createProfessionalCalendar`
    failures now share one error slot above the roster (`RosterActionError`); the two
    structured error codes (`clinic_calendar_not_connected` 422, `google_reconnect_required`
    409) render the backend's own message plus a button that scrolls to GoogleSection
    (`#gcal`) — never a generic error for these two specific cases.
- **`configuracao/page.tsx`** — `gcal` state is now `{connected, mode}` (default
  `per_professional`); `applyTenantConfig` uses `applyWireGcal`; the hub-unreachable
  "demo-data honesty" effect and `handleGoogleDisconnect` both preserve `mode` correctly
  (a disconnect never silently resets the mode choice, matching the "trocar de modo não
  desconecta nada" promise in reverse); `handleSave` passes `gcal.mode` through
  `buildConfigUpdatePayload`; new `googleCalendarIdByProfessional` derived map threaded
  into `ProfessionalsSection`.

### Entrega 2 — `/doctor/perfil` "Configuração da secretaria" (portal design system)
- **`doctor/perfil/SecretariaConfigSection.tsx`** (new file) — auto-scoped card for the
  logged-in user's own professional:
  - Identity resolution mirrors `ProfessionalsSection`'s self-bind detection exactly:
    prefer `session.professionalId` (JWT claim), fall back to matching
    `linked_user_email` against `getDoctorProfessionals` (brain-api), and ALSO accept the
    id returned directly by a self-bind just performed in this card (covers the instant-
    after-bind gap before both the next token refresh AND the roster refetch resolve it).
  - No professional + owner -> "Você também atende pacientes?" prompt (same copy/flow as
    `ProfessionalsSection`'s, `createSelfProfessional`, reimplemented with portal-DS
    markup). No professional + non-owner -> a quiet "fale com quem administra sua clínica"
    line (edge case only — staff are always created already bound to a professional
    server-side).
  - Fields: specialty, about, `context_doctor_message`, business_hours — saved through the
    same `PUT /tenants/me/professionals/{id}/config` (`updateProfessionalConfig`) call
    `ProfessionalsSection` uses, via a payload that only ever sets these 4 keys
    (appointment types/services are never touched: the payload is a partial/
    `exclude_unset` update, so omitting the key means "leave services alone", never "clear
    them").
  - Google Calendar, mode-sensitive (reads `google_calendar_mode` via the same
    `getTenantConfig` call the hub page makes): `per_professional` shows this
    professional's own connect/reconnect button (`startProfessionalCalendarOauth`);
    `shared_account` shows the dedicated-calendar status + "Criar minha agenda"
    (`createProfessionalCalendar`), with the same 422/409 structured-error handling as
    `ProfessionalsSection` — but the CTA is a `<Link>` to `/secretaria/configuracao#gcal`
    with copy that doesn't assume the reader administers the clinic (staff can reach that
    page too; nothing on it is owner-gated).
  - Hub reachability: reuses `useSecretariaHub()` (the exact hook the hub pages use) — no
    secretarIA entitlement hides the card entirely (mirrors `DoctorLayout`'s own nav-gating
    rule for every other secretaria-linked item); a genuinely unreachable hub shows a
    discreet amber note + "Tentar novamente" scoped to just this card; "hub not configured
    in this environment" (mint succeeds, `hubConfigured()` false) shows a distinct message
    with no retry action, mirroring `HubNotice`'s own derivation. None of this ever blocks
    "Informações pessoais" above it — each card fetches/saves independently.
  - `HoursEditor` / `HoursDayRow` (local, bottom of the file): a lighter native
    `<input type="time">` weekly grid (the portal DS has no `CSelect`/half-hour-picker
    equivalent) — same `DayConfig`/`TimeRange` shape and `toWireBusinessHours`/
    `applyWireBusinessHours` mapping `AvailabilitySection` uses, just a simpler widget
    around it.
- **`doctor/perfil/page.tsx`** — renders `<SecretariaConfigSection session={session} />` as
  the second stacked `<section className="card">` card, replacing the marker comment the
  prior round left.
- **`_components/PortalShell.css`** — `.pfield` extended to also style `textarea` (it
  previously only covered `input`/`select`; the portal DS had no textarea precedent until
  this round's specialty/about/context fields needed one). Small additive fix, not scoped
  to this one card — any future portal textarea benefits too.

### Reuse vs. duplication (asked for explicitly — see report for the same summary)
**Genuinely shared** (imported, not copied): `lib/secretaria-hub.ts`'s whole API surface
(`getTenantConfig`, `getProfessionals`, `updateProfessionalConfig`,
`createProfessionalCalendar`, `startProfessionalCalendarOauth`, `HubApiError` + its error
codes); `configuracao/lib/hub-mapping.ts`'s pure wire<->local mappers
(`applyWireProfessionalProfile`, `applyWireBusinessHours`, `toWireBusinessHours`,
`hhmmToMinutes`/`minutesToHhmm`); `configuracao/lib/types.ts` (`DayConfig`,
`ProfessionalProfile`, `EMPTY_PROFESSIONAL_PROFILE`). `useSecretariaHub()` itself is reused
cross-route from `secretaria/_shared/` — the exact session/entitlement/reachability state
machine the hub pages already have, not reimplemented for the doctor portal.

**Deliberately duplicated** (small, judged not worth a cross-file extraction): the 7-line
weekday seed (`WEEKDAYS`/`closedWeek()`), which lives privately in both
`configuracao/page.tsx` and the new `SecretariaConfigSection.tsx` — extracting it would
mean exporting a private const out of a route's `page.tsx`, the wrong direction (a page
should not become a shared module); and the self-bind prompt's copy/markup, which exists
once per design system (hub `_shared/ui.tsx` components inside `ProfessionalsSection`;
plain `.alert-line`/`.btn` markup here) since the two design systems intentionally don't
share components. No business logic (validation, payload shaping, API call sequencing) is
duplicated anywhere in this round — every wire-shape conversion and every API call goes
through the one shared implementation.

## Tested

- `.\node_modules\.bin\tsc.cmd --noEmit` — clean, repo-wide.
- `npm test` — **69/69 passing** (`manage-api.test.ts` 57, `sign-out.test.ts` 3, new
  `secretaria-hub.test.ts` 9). Baseline going in was 60/60 — no regressions.
- `npm run build` (run from the uppercase `C:\...` path) — green, all **33** static routes,
  including `/doctor/perfil` and `/secretaria/configuracao`.
- Not run this round: a live e2e pass against a dev mesh running the secretarIA build that
  shipped `google_calendar_mode`/the calendar-creation endpoint (mode switch persisting,
  shared-account calendar creation success + both structured errors from a real backend,
  per-professional OAuth still working unchanged, self-bind from `/doctor/perfil`,
  staff-vs-owner identity resolution) — same caveat every other `VERIFICATION_*`/
  `CHECKPOINT_*` doc in this repo carries for its own round.

## Invalidated hypothesis (carried over from a prior round, re-confirmed this round)

The earlier working hypothesis that the Dockerfile needed a new `ARG`/`ENV` pair for some
`NEXT_PUBLIC_META_*` build-time variable was **wrong**, and remains wrong after this
round's changes. No `NEXT_PUBLIC_META_*` env var exists anywhere in this frontend
(repo-wide grep for `NEXT_PUBLIC_META` finds nothing); Meta Embedded Signup config
(`app_id`/`config_id`) is sourced live from `GET /doctor/onboarding`'s `embedded_signup`
object, itself filled server-side by brain-api's own `META_APP_ID`/`META_ES_CONFIG_ID`
settings — see `docs/VERIFICATION_onboarding.md:19-26` for the original finding. The
Dockerfile was intentionally left untouched again this round.

## Pendências / follow-ups

- Live e2e pass (see Tested above) once a dev secretarIA build with this contract is
  reachable from this frontend.
- `HoursEditor` in `/doctor/perfil` is a lighter widget than the hub's `AvailabilitySection`
  (native `<input type="time">` vs. a curated half-hour `<select>` list) — functionally
  equivalent (same wire shape, multiple ranges per day supported) but visually simpler;
  intentional per this round's "portal DS, not hub DS" brief. Flagged here in case product
  wants the exact same picker experience later.
- No UI anywhere lets someone reconcile calendars if a tenant switches from
  `shared_account` back to `per_professional` after professionals already have dedicated
  secondary calendars — out of scope for this round (the backend contract doesn't define
  that flow either); the secondary calendars just become inert until the tenant switches
  back to `shared_account`.
- `SecretariaConfigSection`'s `doctorRosterError`/`hubRosterError` states are surfaced but
  not independently retryable (only the hub-unreachable branch offers "Tentar novamente");
  a plain one-off fetch failure on an otherwise-reachable hub requires a page reload today.
  Matches this round's card-scoped-degrade brief but is narrower recovery UX than the full
  hub Configuração page's retry-everywhere pattern.
