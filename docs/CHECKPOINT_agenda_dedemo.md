# CHECKPOINT — secretarIA Agenda mock purge (de-demo round)

Date: 2026-07-22. State: **frontend DONE**, pending backend follow-up (see Pendências) and a
manual e2e pass against a live dev mesh.

Round scope: kill every fabricated appointment/block in `app/(site)/secretaria/agenda/**`, wire
the `useSecretariaHub`/`HubNotice` contract's `unavailable`/`retry` fields (landed the same
session), make real Google Calendar blocks round-trip with correct styling, and replace the
hardcoded demo clinic name in outgoing WhatsApp message previews with the tenant's real name.

## What changed

- **`_shared/data.ts`** — deleted `SEED_APPTS` (27 fake rows) and `SEED_BLOCKS` (7 fake rows) and
  their private factory helpers. Everything else (`CLINIC`, `CURRENT_USER`, types, time helpers,
  calendar-grid constants) is unchanged — still consumed by `Header.tsx` (logged-out fallback
  only — verified, not edited) and `configuracao/page.tsx`.
- **`agenda/page.tsx`** — `appts` now starts (and permanently stays) empty; `blocks` state is gone
  entirely (real blocks arrive already classified from the hub fetch). Every local-only
  "fabricate a row" create/cancel/reschedule/edit/status-change code path is deleted. `HubNotice`
  now receives `unavailable`/`onRetry={retry}`. The old "showing demo data" fallback banner on a
  hub-fetch failure was replaced with a real error banner + "Tentar novamente" button (calls
  `reloadWeek()`). Toolbar's "Nova consulta"/"Bloquear" are disabled unless `hubReady`. The real
  clinic name is fetched once via `getMe(session)` and threaded into `NewApptModal`.
- **`agenda/lib/hub-mapping.ts`** — events whose summary is (or starts with) "Bloqueado" —
  secretarIA's own convention, verified against `secretarIA/src/secretaria/schemas/calendar.py`
  (`BlockCreate.summary` default) and `api/hub/calendar.py::create_block`
  (`appointment_type="Bloqueado"`) — are now classified `status: "bloqueio"` instead of a generic
  appointment. `formatBlockSummary()` makes the write side (`page.tsx`'s `createBlock`) tag every
  real block with that same `"Bloqueado: {reason}"` summary — the client always supplies an
  explicit `summary`, so the backend's bare default never actually fired before this change. This
  is what makes a block round-trip: real POST → reappears from the events read, styled as a block.
- **`agenda/drawer.tsx`** — dropped `onSetStatus`/`onCancel`/`onReschedule`/`onEdit`/
  `onRemoveBlock` props entirely (every item shown is hub-sourced now, and the hub has no
  endpoint for any of those actions yet). The status picker, Remarcar/Editar/Cancelar, and Remover
  bloqueio all still render, disabled, with an honest hint — instead of quietly mutating local
  state and flashing a fake success.
- **`agenda/modals.tsx`** — `RescheduleModal`/`CancelModal` are no longer imported/rendered from
  `page.tsx` (their only entry point, the Drawer's now-disabled buttons, is unreachable) but are
  left defined/exported for a future round. `CLINIC` import removed entirely: `NewApptModal`/
  `RescheduleModal`/`CancelModal` now take a `clinicName: string` prop (real tenant name, or
  generic phrasing when empty) instead of the hardcoded "Consultório Dr. Aurélio Lima".
- **`agenda/calendar.tsx`** — unchanged. It already consumed a single merged `items: Appt[]` prop,
  so removing local `blocks` state needed no signature change.

## Tested

- `.\node_modules\.bin\tsc.cmd --noEmit` — clean, repo-wide.
- `npm test` — 60/60 passing (`manage-api.test.ts`, `sign-out.test.ts`; neither touches this
  round's files).
- `npm run build` — green, all 32 routes including `/secretaria/agenda` and
  `/secretaria/configuracao`.
- Not run this round: a live e2e pass against a dev mesh (session × hubReady × fetch-result
  matrix, real create, real block round-trip, the retry button) — see Pendências.

## Pendências / follow-ups

- **Backend read-model gap (cancel/reschedule/edit/status-change)**:
  `GET /tenants/me/calendar/events` only returns `{id, summary, start, end}` — no DB
  `Appointment.id` — so the hub write endpoints that need one
  (`.../appointments/{id}/cancel|reschedule`) can't be called from a hub-fetched item. Those
  Drawer actions stay disabled until secretarIA's read model exposes that id (`TODO(hub-write)`
  markers left in `hub-mapping.ts` and `drawer.tsx`).
- **No hub endpoint to remove a block** — same id-mapping gap; "Remover bloqueio" is disabled
  with a hint to use Google Calendar directly for now.
- **Calendar chrome is still a fixed June-2026 scaffold** — `WEEK_DAYS`/`MONTH_LABEL`/
  `PERIOD_LABEL`/`MonthView`'s hardcoded month grid, and the "today"/current-time marker, do not
  track the real date; real hub events are placed by day-of-week only. Pre-existing (inherited
  from the ported `_design-source`), not in this round's scope — flagged here as a needed
  follow-up ("make the calendar grid date-aware") since it becomes more visible now that real
  data flows through it.
- Manual e2e verification against a live dev mesh still needed before calling this fully shipped
  — same caveat `VERIFICATION_onboarding.md` documents for its own round.
