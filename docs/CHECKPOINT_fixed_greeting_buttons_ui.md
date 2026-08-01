# CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI

Date: 2026-08-01. State: **frontend DONE**, no pending frontend work for this round;
depends on the already-shipped secretarIA backend contract (1072 tests green per this
round's brief) — no further backend work needed from this repo's side.

Round scope: secretarIA turned the WhatsApp first-contact greeting buttons from
clinic-editable free text into a FIXED product-level set — **[Agendar] [Remarcar]
[Cancelar]** — routed deterministically server-side (the LLM is never the default
path). `greeting_buttons` was removed from the hub wire entirely: `GET
/tenants/me/config` no longer returns it, and `PUT /tenants/me/config` silently
ignores it if a caller still sends it (200 OK, never persisted). This round updates
`brain-frontend` to match: stop sending the field, stop rendering it as editable, and
show the fixed set as read-only information instead.

## What changed

### `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens")
- Removed the entire "Botões rápidos" editable UI: `MAX_GREETING_BUTTONS`,
  `updateButton`/`removeButton`/`addButton`, the per-row `TextInput` + remove-✕
  button, and the "Adicionar botão (n/3)" control. `TextInput` is no longer imported
  (nothing else in this file used it).
- Added `GreetingButtonsPreview` (internal, no props) — a **read-only** display
  mirroring `PixSection`'s `AsaasStatusPill` pattern (a small labelled block with no
  form control at all, not even a disabled input): a "Botões da primeira mensagem"
  label, three pill chips ("Agendar"/"Remarcar"/"Cancelar" — brand-tint background,
  WhatsApp icon) from a new local `FIXED_GREETING_BUTTONS` constant, and a fixed
  caption: *"Estes são os botões que seus pacientes veem na primeira mensagem — cada
  um inicia o fluxo correspondente automaticamente."* Rendered unconditionally
  (ignores `readOnly` — there's nothing to disable since there's no input). Purely
  local product copy, not fetched from anywhere — there is no endpoint that serves it.
- Collateral (backend FYI in the brief): `greeting_message`/`returning_greeting_message`
  now always cap at 1024 chars server-side. The UI previously had no limit at all on
  either field — added `GREETING_MESSAGE_MAX_LENGTH = 1024`, wired as `maxLength` on
  both `TextArea`s plus a `hint="Até 1024 caracteres."` under each field (mirrors
  `PixSection`'s existing `hint` convention).

### Wire/state cleanup — `greeting_buttons`/`greetingButtons` removed everywhere
- **`lib/secretaria-hub.ts`** — dropped `greeting_buttons: string[]` from both
  `TenantConfigWire` and `TenantConfigUpdatePayload`; added a comment on
  `TenantConfigWire` documenting the removal and pointing at
  `FIXED_GREETING_BUTTONS` for the local display copy.
- **`configuracao/lib/types.ts`** — dropped `greetingButtons: string[]` from the
  `Messages` type.
- **`configuracao/lib/hub-mapping.ts`** — `applyWireMessages` no longer reads
  `cfg.greeting_buttons`; `buildConfigUpdatePayload` no longer sends
  `greeting_buttons` in the PUT body — the frontend now simply never sends the field.
- **`configuracao/page.tsx`** — dropped `greetingButtons: []` from both the initial
  `messages` seed state and the hub-unreachable "demo-data honesty" reset effect.
- **`docs/VERIFICATION_onboarding.md`** — updated the "Mensagens + address/convênios"
  manual-test section and the "What's actually live vs. pending" table row: the
  quick-reply-buttons steps (add/remove/cap-3) are replaced with the new read-only
  preview description; the stale "button-add/remove controls hidden under readOnly"
  claim is corrected to note there's no control to hide any more, under any
  `readOnly` state.
- No demo/fixture data referenced `greeting_buttons`/`greetingButtons`
  (`_shared/data.ts`'s `CLINIC` constant never carried it) and no vitest test covered
  the field (`lib/__tests__/secretaria-hub.test.ts` never referenced
  `greeting_buttons`, even before this round) — nothing to adjust there.
- Repo-wide grep for `greeting_buttons`/`greetingButtons` after this round: every
  remaining hit is an explanatory code comment documenting the removal (in
  `secretaria-hub.ts`, `types.ts`, `MessagesSection.tsx`) — no live code path
  references the field, and nothing is sent on save.

## Tested

- `.\node_modules\.bin\tsc.cmd --noEmit` — clean, repo-wide.
- `npm run build` (from the uppercase `C:\...` path) — green, all **33** static
  routes (unchanged route count — this round touched no routing).
- `npm test` — **69/69 passing**, same 3 files as the prior round
  (`manage-api.test.ts` 57, `sign-out.test.ts` 3, `secretaria-hub.test.ts` 9) — no
  regressions, no new tests needed (nothing vitest-covered touched the removed field).

## Pendências / follow-ups

- Not run this round: a live e2e pass against a dev mesh running the secretarIA build
  that shipped this contract, to confirm `GET /tenants/me/config` really omits
  `greeting_buttons` and `PUT` really ignores it silently rather than 422ing — same
  caveat every other `CHECKPOINT_*`/`VERIFICATION_*` doc in this repo carries for its
  own round.

## Also in this working tree this session (different round — not touched here)

`app/(site)/app/onboarding/lib/meta-embedded-signup.ts` was migrated by another agent
earlier in this session from Meta Embedded Signup's v2 payload shape to **v4**: the
extras payload is now `{ setup: {} }` (previously carried `sessionInfoVersion`, now
dropped — v4 no longer wants it). See brain-api's
`GUIA_CREDENCIAIS_META_EMBEDDED_SIGNUP.md` v1.2 for the full field-by-field contract.
This round did not touch that file — noted here only so this checkpoint doesn't read
as if the onboarding diff already sitting in the working tree came from this round's
work.

## Closing an open question from the prior round

`docs/CHECKPOINT_perfil_gcal_modes.md`'s "Tested" numbers (tsc clean / build 33
routes / vitest 69/69) were measured **after both** deliveries described in that
checkpoint — Entrega 1 (Google Calendar integration modes UI) AND Entrega 2 (Meu
Perfil "Configuração da secretaria" card) — not just the Meu Perfil slice: that doc
describes both entregas first and only then has one single "Tested" section at the
end, covering the resulting state of the whole repo. Those numbers were already the
final, combined state of the repo going into this round.
