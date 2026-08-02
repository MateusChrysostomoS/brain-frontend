# Manual verification — onboarding wizard & multi-professional configuration

Frontend adoption round for the SecretarIA Onboarding & Multi-Professional cross-service
contract (`CONTRACT_onboarding_v1.md` §7/§13: `/cadastro` intake wizard, `/app/onboarding`
eligibility screen, `/convite` invite-accept, per-professional Configuração). Automated
coverage lives in `lib/__tests__/manage-api.test.ts` (22 tests) and
`lib/__tests__/sign-out.test.ts` (3 tests) — `npm test`, 25/25 passing. `npm run build`
also verified green (all 29 static routes, including `/cadastro`, `/app/onboarding`,
`/convite`, `/calendar/connected`, `/secretaria/configuracao`). This note is the
user-facing pass — run it against a dev mesh before calling the round shipped.

> **Meu Perfil + Google Calendar modes update (2026-08-01).** Per-professional
> Configuração (§10) gained a second entry point: `/doctor/perfil`'s "Configuração da
> secretaria" card, self-scoped to the logged-in user via the same
> `session.professionalId`/`linked_user_email` resolution this doc's Profissionais section
> already used. GoogleSection also gained a tenant-wide `google_calendar_mode` selector.
> See `docs/CHECKPOINT_perfil_gcal_modes.md`.

## Environment

```
NEXT_PUBLIC_MANAGE_API_BASE_URL=http://localhost:8000        # brain-api
NEXT_PUBLIC_SECRETARIA_HUB_BASE_URL=http://localhost:8001    # secretarIA
```

No new frontend env var is needed for Meta Embedded Signup: unlike a plain reading of
the cross-service contract's settings list, `/app/onboarding` does **not** read a
`NEXT_PUBLIC_META_APP_ID`/`NEXT_PUBLIC_META_ES_CONFIG_ID` (repo-wide grep for
`NEXT_PUBLIC_META` finds no occurrence). `app_id`/`config_id` are sourced live from
`GET /doctor/onboarding`'s `embedded_signup` object, which brain-api fills from its own
`META_APP_ID`/`META_ES_CONFIG_ID` settings. So to see the real Embedded Signup button
(instead of the disabled fallback, §2.4 below) you only need brain-api configured, not
the frontend.

Backend dependencies that change what you'll see in this flow, even though nothing here
is a frontend env var:
- brain-api `META_APP_ID` / `META_APP_SECRET` / `META_GRAPH_BASE_URL` / `META_ES_CONFIG_ID`
  unset → `embedded_signup.configured: false` → the button is always disabled (§2.4).
- secretarIA `SMTP_*` / `EMAIL_ENABLED=false` (default) → invite/nudge emails log as a
  no-op instead of sending. The professional-invite flow still works end to end via the
  copyable link (§3) regardless of email delivery.

Start the dev server from the UPPERCASE drive path — `next dev`/`next build` crash on
`c:\...` in this repo: `cd C:\TECH\BRAIN\brain-frontend; npm run dev`.

## 1. Signup wizard (`/cadastro`)

The wizard only renders with a known `?plan=` — `precheck`, `secretaria_ferro`, or
`secretaria_bronze_1` (`app/(site)/cadastro/lib/plans.ts::PURCHASABLE_PLANS`). The combo
plan (`complete_clinic_combo`) is deliberately excluded — see the LIVE/PENDING table.

> **Register-at-first-card update (2026-07-21).** The first card now REGISTERS the account
> (name, clinic, email, WhatsApp, **password + confirm**) — `POST /public/signup-intents`
> fires on that step's submit, creating the tenant + owner user (real password) + inert
> entitlement and returning a session the wizard `saveSession()`s immediately. The intake
> answers now ride the authenticated `POST /doctor/onboarding/intake` from the summary step
> (the visitor is logged in), and the summary only opens `POST /public/checkout-sessions`.
> See `brain-api/docs/CHECKPOINT_register_at_first_card.md`.

1. Open `/cadastro` with no `?plan=` (or `?plan=complete_clinic_combo`). **Expected:**
   "Plano não encontrado" card with a link back to `/#planos` — the wizard never mounts.
2. Open `/cadastro?plan=secretaria_ferro`. Step 1 ("Vamos criar sua conta.") — fill nome,
   nome da clínica, e-mail, WhatsApp, **senha + confirmar senha**; "Continuar" stays
   disabled until all fields are non-empty. Confirm the honeypot `website` input is present
   in the DOM but visually hidden (`left:-9999px`) — leave it empty. Try a weak password
   (e.g. `12345678`) — **Expected:** an inline pt-BR error ("pelo menos uma letra e um
   número") before any network call. Try mismatched confirm — "As senhas não coincidem."
   On a valid submit, **Expected:** `POST /public/signup-intents` fires with the `password`,
   a `201 {intent_id, session}` returns, the session is saved (`brain.session` in
   sessionStorage), and the wizard advances to Q1. Re-registering the SAME email → `409` →
   "Você já tem conta Brain — entre para contratar." + an "Entrar" link.
3. Step 2 (Q1 — "Você já usa o WhatsApp Business App..."): pick **"Sim, há mais de 7 dias"**
   (`business_7d_plus`). **Expected:** advances straight to Q3 (prior_api) — the dedicated-
   number guide is skipped.
4. Q3 ("já foi usado com alguma API..."): pick **"Não"**. Q4 ("já tem uma Página no
   Facebook?"): pick **"Sim, e sou administrador(a)"** (`yes_admin`). **Expected:** advances
   straight to the Revisão/summary step — no inline notes, no guide screens.
5. Summary step: confirm the four contact rows plus the three intake rows read back
   exactly what was picked ("Já uso há mais de 7 dias" / "Não, nunca foi usado com uma
   API" / "Sim, e eu sou administrador(a) dela"). Click "Voltar" back to the first card and
   forward again — **Expected:** the account is NOT re-registered (no second
   `/public/signup-intents`, no 409); the wizard just advances (history-stack back, not a
   reset).
6. Click "Ir para pagamento". **Expected:** the authenticated `POST /doctor/onboarding/intake`
   fires (best-effort, `Authorization: Bearer <session>`) with
   `{whatsapp_usage: "business_7d_plus", prior_api: "no", fb_page: "yes_admin"}`, then
   `POST /public/checkout-sessions` with the existing `intent_id`, then a full-page redirect
   to the returned `checkout_url` (Stripe test Checkout). **No `createSignupIntent` on this
   step anymore.**
7. **Login-before-payment (the core fix):** after step 2, open `/login` in a new tab and
   sign in with the email + password just chosen. **Expected:** login succeeds and `/app`
   shows the NoEntitlementsPanel ("Sua clínica ainda não tem um produto ativo") — registered
   but not yet entitled. After completing Stripe checkout, `/checkout/sucesso` polls until
   ready and routes into `/secretaria/configuracao` using the session already in hand (no
   token exchange needed in the same browser).

### 1.1 Intake branches (each is its own pass)

- **Q1 = "Ainda não uso" (`none`):** after Q1, the wizard detours through the
  **DedicatedNumberGuide** ("Vamos preparar um número dedicado.", 3 numbered steps + the
  amber "pode levar alguns dias" note) before Q3. "Entendi, continuar" advances; "Voltar"
  from Q3 returns to this guide, not to Q1.
- **Q1 = "Comecei a usar recentemente" (`business_recent`):** same as step 3 above — skips
  the guide, goes straight to Q3.
- **Q3 = "Sim" (prior_api yes):** an inline note appears below the radio group ("Duas
  ações vão agilizar a liberação": disable 2FA on the old account; ask the previous
  vendor to disconnect the number). **Expected:** "Continuar" is still enabled — this
  branch is informational only, never blocking.
- **Q4 = "Sim, mas não sei se sou administrador(a)" (`yes_unknown_admin`):** an inline
  "Como checar se você é administrador(a)" note appears (Configurações → Acesso à
  Página). **Expected:** advances straight to summary — this does NOT route through the
  page-creation guide (only `fb_page === "no"` does).
- **Q4 = "Não, ainda não temos uma Página" (`no`):** after Q4, detours through
  **PageCreationGuide** ("Vamos criar a Página da clínica no Facebook.", 3 numbered
  steps: facebook.com/pages/create → "Empresa ou marca" → foto/informações) before
  summary.

### 1.2 Submit error branches

Reproduce by unsetting config server-side, or reusing an email already in `users`:
- Existing account email → `409`: "Você já tem conta Brain — entre para contratar." +
  an inline "Entrar" link to `/login`.
- No `STRIPE_PRICE_MAP` entry for the plan → `503`: "Cobrança ainda não configurada.
  Fale com a Brain."
- Malformed payload → `422`: "Não foi possível validar os dados. Confira e tente
  novamente."
- Any other failure → generic "Não foi possível continuar agora. Tente novamente."
- All four leave the wizard on the summary step with `submitting` reset (button
  re-enabled) — no partial navigation.

## 2. Eligibility screen (`/app/onboarding`)

Log in as a `tenant_owner`/`tenant_staff` whose tenant is mid-onboarding and open
`/app/onboarding` directly, or via the "Ver detalhes →" link in the amber/red banner
that `OnboardingBanner` renders at the top of `/secretaria/configuracao` for any
`onboarding_state !== "ativo"`. Everything on this page reads `GET /doctor/onboarding`;
reload after each backend-side state change (the page does not poll).

### 2.1 State timeline

`pending`, `aquecimento`, and `aguardando_elegibilidade` all collapse onto the same
first "Aquecendo" timeline node (rank 0) — they read identically on this screen except
for the banner's own label text (§2.5). `conectado` = rank 1 (node 2 lit). `ativo` =
rank 2 (all three lit, ✓ on the first two).

### 2.2 Blocker copy (`blocker_reason`)

Set each value server-side and reload:

| `blocker_reason` | Card style | "Já resolvi" button? |
|---|---|---|
| `atividade_insuficiente` | neutral | No — copy says to keep using the WhatsApp Business App a few more days |
| `numero_em_outro_bsp` | warn (amber) | Yes → `POST /doctor/onboarding/resolve-blocker` |
| `sem_acesso_admin_waba` | warn (amber) | Yes |
| `sem_pagina_facebook` | warn (amber) | Yes |
| `outro` | warn (amber) | Yes |
| `null` | (no card) | — |

Clicking "Já resolvi" (only present on the four manual-action reasons) re-fetches
`GET /doctor/onboarding` on success — **Expected:** state returns to `aquecimento` and
the blocker card disappears once the backend clears `blocker_reason`.

### 2.3 Success states

- `conectado`: green card "Número conectado!" + "Estamos sincronizando o histórico do
  seu WhatsApp Business... mantenha o Business App aberto e o celular desbloqueado" +
  "Concluir configuração" button → `/secretaria/configuracao`. The "Tentar ativar agora"
  button is hidden in this state (and in `ativo`).
- `ativo`: green card "Sua secretarIA está ativa!" + "O WhatsApp da clínica está sendo
  atendido pela secretarIA." + same "Concluir configuração" link.

### 2.4 Activate button — Embedded Signup, incl. the not-configured fallback

- **`embedded_signup.configured: false`** (Meta env unset on brain-api — the default
  until External Wiring lands, see the facts pack's pending list): button renders
  **disabled**, with the note "Ativação assistida ainda não configurada — nossa equipe
  entra em contato." No SDK is loaded, no click handler fires. **This is the case you
  will see in a stock local/dev mesh — confirm it explicitly, don't skip it.**
- **`embedded_signup.configured: true`**: click "Tentar ativar agora" → loads
  `https://connect.facebook.net/en_US/sdk.js`, calls `FB.init` with the returned
  `app_id`, opens `FB.login` with `config_id`. On the Meta popup's `FINISH`/
  `FINISH_ONLY_WABA` postMessage + a returned `code`: `POST /doctor/onboarding/attempts`
  with `result: "pass"`, the `code`, and any captured `phone_number_id`/`waba_id`, then
  refetches the page data. On `CANCEL`/`ERROR`/no-code: `result: "fail"` with an
  `error_code` derived from the popup step/message.
- Each attempt is idempotent client-side via a fresh `crypto.randomUUID()` per click —
  a retried click never double-reports the same attempt.

### 2.5 Last-attempt line, pause toggles, banner label

- After any attempt, a line appears: "Última tentativa: `<data>` — Sucesso" or
  "— Falhou (`<error_code>`)".
- Owner-only "Lembretes por email" block: two independent toggles ("Pausar lembretes de
  tentativa de conexão" / "Pausar lembretes de configuração pendente"), each saves on
  its own via `POST /doctor/onboarding/pause` and refetches on success. `tenant_staff`
  never sees this block.
- `OnboardingBanner` (top of `/secretaria/configuracao`) labels: `pending` → "Cadastro
  em andamento", `aquecimento` → "Aquecendo o número no WhatsApp",
  `aguardando_elegibilidade` → "Aguardando elegibilidade", `aguardando_acao_manual` →
  "Ação necessária para continuar", `conectado` → "Conectado — sincronizando
  histórico". Banner is absent entirely once `ativo`, and fails silently (no banner,
  no error) if the fetch fails or there's no session.

## 3. Professional invite → `/convite` → set password → scoped view

1. As owner, open the "Profissionais" section of `/secretaria/configuracao` →
   "Convidar profissional" → fill nome/e-mail/especialidade (especialidade optional) →
   "Enviar convite". **Expected:** `POST /doctor/professionals/invites`; on success the
   modal swaps to a copyable `invite_link` (`{FRONTEND_BASE_URL}/convite?token=...`)
   with a "Copiar link" button and the note "Convite criado e enviado por e-mail."
   Re-using an already-registered email → 409 → "Esse e-mail já está cadastrado na
   Brain."
2. Close the modal ("Concluir"). **Expected:** roster refetches; the new professional
   shows with a "Convite enviado — aguardando aceite" line and all three completeness
   chips (Agenda/Serviços/Horários) unfilled.
3. Open the copied link in a private window: `/convite?token=<token>`. **Expected:**
   brief "Validando seu convite…" spinner, then "Crie sua senha" with the
   confirm-password form (min 8 chars; mismatch → "As senhas não coincidem.").
4. Submit a valid password. **Expected:** `POST /auth/exchange-invite-token` (already
   fired on page load) followed by the existing set-password call; the session is
   persisted to storage only after the password save succeeds — the token exchange
   alone does not save a session. Note this means the invite token is single-use and
   already burned by the time you reach the password form: if you abandon or reload the
   page between landing on "Crie sua senha" and submitting it, the exchanged session is
   lost with nothing persisted, and the same link now shows "Convite inválido ou
   expirado" (`invite_token_hash` already consumed) — the owner has to send a fresh
   invite. Don't reload mid-flow when testing this step. Router replaces to
   `/secretaria/configuracao` on success.
5. On that landing, confirm the **professional-scoped view** (Feature E): "Contexto da
   clínica" and "Mensagens" render read-only with the amber "Somente o proprietário da
   clínica pode editar essas informações" notice; "Profissionais" shows only that
   person's own specialty/about/instruction fields (no roster, no selector chips, no
   "Convidar profissional"); Services/Availability edit only their own professional row.
6. Missing `?token`: "Link de convite incompleto" card. Invalid/expired/already-used
   token: "Convite inválido ou expirado" card, both with a link to `/login`.

### 3.1 Owner self-bind

If the logged-in owner has no professional row yet (`linked_user_email` on no roster
entry matches the owner's own email), the Profissionais section leads with "Você também
atende pacientes, ou só administra a clínica?" — "Sim, eu também atendo" →
`POST /doctor/professionals/self` → roster refetch (no new login/token needed to see it
in the roster, but the owner's own JWT `professional_id` claim only updates on their
next refresh/login). "Não, só administro" dismisses the prompt for the session without
calling the API.

## 4. Per-professional hours / services / calendar

Requires 2+ professionals on the roster (invite a second one per §3, or self-bind +
invite one).

1. Confirm the selector chip row appears above the roster ONLY when
   `roster.length > 1`, and only for the owner (`tenant_staff` never sees chips — always
   locked to their own professional). Click a different professional's chip.
   **Expected:** Services and Availability sections re-hydrate from a closed week +
   empty service list first, then that professional's own
   `business_hours`/`appointment_types`/specialty/about/instructions — never a flash of
   the previously-selected professional's data.
2. Once 2+ professionals exist, both the "Serviços oferecidos" and "Dias e horários"
   section headers append the selected professional's name, and an "EDITANDO:
   `<NOME>`" label appears above the profile fields — confirms which professional is
   currently being edited.
3. Each roster row has its own "Conectar Google Calendar" / "Reconectar agenda" button
   (`GET /tenants/me/professionals/{id}/calendar/oauth/start`, state signs tenant_id AND
   professional_id) — clicking one professional's button does not affect another's
   `has_calendar` chip.
4. "Salvar configuração" issues **two** PUTs when a real (non-demo) professional is
   selected: `PUT /tenants/me/config` (Contexto + Mensagens + address/insurances/
   collect_insurance + appointment_duration_min — tenant-level) and
   `PUT /tenants/me/professionals/{id}/config` (business_hours + appointment_types +
   specialty/about/context_doctor_message — for the SELECTED professional only).
   Confirm in the network tab that switching the chip and saving again only ever
   touches the currently-selected professional's config endpoint.
5. After a professional-level save, the roster's completeness chips (Serviços/Horários)
   refresh without a full page reload.

## 5. Mensagens + address/convênios

1. "Mensagens" section (tenant-level, editable by owner only): greeting message,
   returning-patient greeting (both capped at 1024 chars, client `maxLength` +
   `hint` mirroring the server-side cap), tom de voz / persona notes, idioma
   (Português (Brasil) / English (US)). Save → these round-trip via
   `greeting_message`/`returning_greeting_message`/`persona_notes`/`language` on
   `PUT /tenants/me/config` — reload the page and confirm they persist (this is
   genuinely wired, not demo state). Below the two greeting fields, a **read-only**
   "Botões da primeira mensagem" preview shows the three FIXED product buttons
   (Agendar/Gerenciar consulta/Outro — trio-gerenciar round; previously
   Agendar/Remarcar/Cancelar) — no input, no add/remove control;
   `greeting_buttons` no longer exists on the wire at all (removed from
   `TenantConfigWire`/`TenantConfigUpdatePayload` — GET omits it, PUT ignores it
   silently if sent).
2. "Contexto da clínica" → structured address block (Endereço/Complemento/Bairro/
   Cidade/UF max 2 chars/CEP) — also genuinely wired (`address` object on the same PUT).
   Leave every address field blank and save: **Expected:** `address` is sent as `null`
   (not an empty object), so a never-touched address never overwrites a previously
   saved one with blanks.
3. "Convênios aceitos" — comma-separated free text in the UI, sent as a trimmed
   `string[]` (blank input → `null`, not `[]`). "Coletar convênio do paciente" toggle
   (LGPD-framed copy: "Ative apenas se for usar essa informação").
4. Confirm `readOnly` staff view: Mensagens and Contexto/address/convênios all render
   disabled with the amber "somente o proprietário" notice; the toggle is hidden
   entirely rather than shown-disabled. (N/A for greeting buttons since the 2026-08
   round — the fixed-button preview has no control to hide or disable in the first
   place, under any `readOnly` state.)

## 6. `/calendar/connected` (Google OAuth landing)

This is the page secretaria's `PORTAL_POST_OAUTH_REDIRECT` should point at — both the
tenant-level and per-professional Calendar connect flows land here after Google's
consent screen.

1. `/calendar/connected?status=success` → ✅ "Google Calendar conectado!" + "A partir de
   agora a secretarIA sincroniza automaticamente com essa agenda do Google." + button
   back to `/secretaria/configuracao`.
2. `/calendar/connected?status=error&reason=access_denied` → ⚠️ "Não foi possível
   conectar" + "Algo deu errado ao conectar o Google Calendar: access_denied. Tente
   novamente."
3. `/calendar/connected` with no `status` (or any non-`success` value) and no `reason`
   → same ⚠️ card with the generic "Algo deu errado... Tente novamente pela
   Configuração." copy.

## What's actually live vs. pending

| Area | LIVE | PENDING (and why) |
|---|---|---|
| `/cadastro` wizard | All 3 purchasable plans, full intake branch matrix (§1.1), `intake` posted on `POST /public/signup-intents`, checkout redirect | Combo (`complete_clinic_combo`) checkout — deliberately excluded from `PURCHASABLE_PLANS` (Phase 2, PreCheck/combo Stripe Prices out of scope); a stray `?plan=complete_clinic_combo` link falls through to "Plano não encontrado" |
| `/app/onboarding` | Full state timeline, all 5 blocker copies + resolve-blocker, last-attempt line, pause toggles, Embedded Signup attempt posting | The real Embedded Signup button itself is environment-dependent, not code-dependent — it silently degrades to "ainda não configurada" until brain-api's `META_APP_ID`/`META_APP_SECRET`/`META_ES_CONFIG_ID` are set (external wiring, not a frontend gap) |
| Professional invite/self-bind | `/doctor/professionals/invites` + `/self`, copyable link, roster completeness chips, `/convite` → set password → scoped view | — |
| Per-professional config | Hours/services/specialty/about/context per professional, per-professional Calendar OAuth, two-PUT save split | Agenda has **no professional filter** — `secretaria/agenda/*` has zero references to a professional field; `CalendarEventRead`/appointment wire data carries no `professional_id` yet, so a multi-professional tenant's `/secretaria/agenda` still shows one unfiltered week for the whole clinic |
| Mensagens section | greeting/returning-greeting/persona_notes/language, all round-trip on `PUT /tenants/me/config`; greeting buttons are a fixed read-only product preview (Agendar/Gerenciar consulta/Outro), not a wire field | — |
| Address / convênios | Structured address + insurances + collect_insurance, all round-trip on the same PUT, null-safe on blank | Clinic **phone** stays demo-only — no wire field for it yet (pre-existing gap, unrelated to this round) |
| Header | De-demoed: real name/role/clinic from `GET /auth/me` once a session exists, falls back to demo constants only while logged out | — |
| `/calendar/connected` | Both tenant-level and per-professional OAuth flows land here | — |

## Not verified in this pass

- No live dev mesh (brain-api + secretarIA + Stripe test mode + a real Meta app) was
  actually driven through a browser for this note — every claim above was verified by
  reading the shipped component/lib code (props, request payloads, conditional
  branches) and by running `npm test` (25/25 passing) and `npm run build` (green, all
  routes present), not by clicking through the UI. Treat this document as ready to
  execute, not as an executed report.
- The Embedded Signup `FINISH`/`CANCEL`/`ERROR` postMessage handling (§2.4) could only
  be verified by reading `app/(site)/app/onboarding/lib/meta-embedded-signup.ts` — it
  was not exercised against a real Meta popup.
