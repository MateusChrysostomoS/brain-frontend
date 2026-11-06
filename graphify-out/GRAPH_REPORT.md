# Graph Report - wt-site-brain  (2026-11-04)

## Corpus Check
- 164 files · ~128,411 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1076 nodes · 2009 edges · 72 communities (64 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32dda815`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CadastroWizard.tsx
- manage-api.ts
- BrandIcon.tsx
- Retorno ao console após compra — correção da TASK B
- create-tenant.ts
- page.tsx
- page.tsx
- page.tsx
- ThemeToggle.tsx
- CHECKPOINT — card "Profissionais" no detalhe da clínica (TASK-063)
- page.tsx
- api.ts
- package.json
- compilerOptions
- page.tsx
- manageFetch
- format.ts
- WizardShell.tsx
- FacebookPageStep.tsx
- PrecheckBillingSection.tsx
- page.tsx
- page.tsx
- page.tsx
- PlanCheckoutCta.tsx
- clearSession
- page.tsx
- sessionFromTokenResponse
- isSessionExpired
- SummaryStep.tsx
- layout.tsx
- manage-api.test.ts
- Manual verification — onboarding wizard & multi-professional configuration
- usePortalGuard
- CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)
- ContactStep.tsx
- add-product-api.test.ts
- Retirement of the clinic product portal (2026-10-05)
- layout.tsx
- layout.tsx
- error.tsx
- Session
- CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half)
- Billing wording and account navigation (2026-10-05)
- next.config.mjs
- next-env.d.ts
- reset-token-lifetime.test.ts
- CHECKPOINT — Fontes self-hosted via `next/font/google` (LGPD)
- CHECKPOINT — papel `secretary` no portal (frontend)
- CHECKPOINT — Banner "configure sua secretarIA" (FEAT 42)
- CHECKPOINT — Header unificada + lockup de produto + renomeações de nomenclatura
- CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI
- CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar
- CHECKPOINT — escolha de plano no /cadastro
- O que mudou
- CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users
- CHECKPOINT_saida_secretaria.md
- Manual verification — billing, refresh tokens & secretarIA hub handoff
- CHECKPOINT — feedback de campo obrigatório no /cadastro (+ `.btn:disabled` no DS)
- CHECKPOINT: "Criar clínica de teste" em `/admin/tenants` (parte 2/2)
- CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login
- brain-frontend
- CHECKPOINT — secretarIA Agenda mock purge (de-demo round)
- plans.ts
- ContactForm.tsx
- Add product to the subscription - UI (TASK-015)

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 50 edges
2. `clearSession()` - 28 edges
3. `usePortalGuard()` - 24 edges
4. `ManageApiError` - 23 edges
5. `BrandIcon()` - 22 edges
6. `isSessionExpired()` - 21 edges
7. `apiFetch()` - 20 edges
8. `Session` - 19 edges
9. `compilerOptions` - 16 edges
10. `BrandGlyph()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `markup()` --indirect_call--> `PlanCheckoutCta()`  [INFERRED]
  lib/__tests__/plan-checkout-cta.test.ts → app/(site)/_components/PlanCheckoutCta.tsx
- `AddProductDialog()` --indirect_call--> `addProductReducer()`  [INFERRED]
  app/(site)/_components/AddProductDialog.tsx → lib/add-product.ts
- `render()` --calls--> `AddProductDialog()`  [EXTRACTED]
  lib/__tests__/add-product-dialog.test.ts → app/(site)/_components/AddProductDialog.tsx
- `CheckoutTrialNotice()` --calls--> `catalogRequiresWhatsappCoexistence()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts
- `PlanCheckoutCta()` --calls--> `consoleReturnRoute()`  [EXTRACTED]
  app/(site)/_components/PlanCheckoutCta.tsx → lib/console-return.ts

## Import Cycles
- None detected.

## Communities (72 total, 8 thin omitted)

### Community 0 - "CadastroWizard.tsx"
Cohesion: 0.14
Nodes (19): ADDON_COPY, AddonsStep(), AddonsStepProps, CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL (+11 more)

### Community 1 - "manage-api.ts"
Cohesion: 0.03
Nodes (61): AddProductResult, AdminAnamnesisList, AdminMetricsClinic, AdminMetricsDoctor, AdminMetricsSatisfaction, AdminMetricsTimelinePoint, AdminMetricsTotals, AdminTenantDeleteResult (+53 more)

### Community 2 - "BrandIcon.tsx"
Cohesion: 0.06
Nodes (35): BackToAdminButton(), BrandIconProps, FILLED, IconName, PATHS, ACCOUNT_NAV, ClinicAccountShell(), Notice() (+27 more)

### Community 3 - "Retorno ao console após compra — correção da TASK B"
Cohesion: 0.33
Nodes (5): Causa e mudança, Estado, Publicação, Retorno ao console após compra — correção da TASK B, Validação

### Community 4 - "create-tenant.ts"
Cohesion: 0.28
Nodes (10): buildCreateTenantPayload(), CreateTenantForm, CreateTenantResult, describeCreateTenantError(), EMPTY_CREATE_TENANT_FORM, submitCreateTenant(), validateCreateTenantForm(), FILLED (+2 more)

### Community 5 - "page.tsx"
Cohesion: 0.21
Nodes (7): CheckoutSucessoInner(), renderView(), ViewState, ensureSession(), getOnboardingStatus(), getSession(), refreshFromCookie()

### Community 6 - "page.tsx"
Cohesion: 0.06
Nodes (54): CreateClinic(), UpdatePasswordPage(), ResetCodePage(), ForgotPasswordPage(), LoginInner(), AuthShell(), AuthShellProps, PasswordField() (+46 more)

### Community 7 - "page.tsx"
Cohesion: 0.29
Nodes (5): CalendarConnectedInner(), SECRETARIA_APP_BASE, SECRETARIA_APP_ROUTES, secretariaAppConfigured(), secretariaAppUrl()

### Community 8 - "ThemeToggle.tsx"
Cohesion: 0.31
Nodes (6): ThemeToggle(), applyTheme(), getCurrentTheme(), setTheme(), Theme, toggleTheme()

### Community 9 - "CHECKPOINT — card "Profissionais" no detalhe da clínica (TASK-063)"
Cohesion: 0.40
Nodes (4): CHECKPOINT — card "Profissionais" no detalhe da clínica (TASK-063), O que entrou, Pendente, Provas

### Community 10 - "page.tsx"
Cohesion: 0.18
Nodes (13): AdminInboundPage(), formatDate(), INTEREST_LABEL, LeadCard(), NEXT_ACTIONS, STATUS_FILTERS, STATUS_LABEL, STATUS_TONE (+5 more)

### Community 11 - "api.ts"
Cohesion: 0.06
Nodes (47): PROFILE_OPTIONS, apiFetch(), confirmPasswordReset(), createUser(), deletePatients(), getMe(), getMediaUrl(), getMetricsOverview() (+39 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.09
Nodes (24): BLOCKED_TEXT, CapacityInputResult, describeBlockedReason(), describeCapacityError(), describeUsage(), parseCapacityInput(), BASE, ProfessionalCapacityCard() (+16 more)

### Community 16 - "manageFetch"
Cohesion: 0.12
Nodes (19): adminGetEntitlements(), createProfessionalInvite(), createSecretaryInvite(), createSelfProfessional(), getAnamnesis(), getDoctorOnboarding(), getMe(), listAnamneses() (+11 more)

### Community 19 - "WizardShell.tsx"
Cohesion: 0.16
Nodes (13): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS, PlanStep(), PlanStepProps (+5 more)

### Community 20 - "FacebookPageStep.tsx"
Cohesion: 0.12
Nodes (15): FacebookPageStep(), FacebookPageStepProps, OPTIONS, OPTIONS, PriorApiStep(), PriorApiStepProps, OPTIONS, WhatsappUsageStep() (+7 more)

### Community 21 - "PrecheckBillingSection.tsx"
Cohesion: 0.10
Nodes (27): formatDatePtBR(), PRECHECK_TIERS, PrecheckBillingSection(), PrecheckBillingSectionProps, BillingPage(), humanizeStatus(), StatusVisual, pluralize() (+19 more)

### Community 22 - "page.tsx"
Cohesion: 0.11
Nodes (21): AdminAnamnesesInner(), AdminAnamnesesListView(), AdminAnamnesisDetailView(), formatDateTime(), shortTenantId(), STATUS_LABEL, STATUS_TONE, statusBadge() (+13 more)

### Community 23 - "page.tsx"
Cohesion: 0.15
Nodes (15): AdminDashboardPage(), Stats, formatDate(), TenantsTable(), formatDate(), ROLE_LABEL, ROLE_TONE, UsersPage() (+7 more)

### Community 24 - "page.tsx"
Cohesion: 0.05
Nodes (53): d(), FAQ, metadata, NAV, PreCheckPage(), tierName(), TIERS, BrandGlyph() (+45 more)

### Community 25 - "PlanCheckoutCta.tsx"
Cohesion: 0.06
Nodes (50): AddProductDialog(), AddProductDialogProps, cardStyle, failureParts(), productName(), errorStyle, LaunchWaitlistForm(), LaunchWaitlistFormProps (+42 more)

### Community 26 - "clearSession"
Cohesion: 0.21
Nodes (12): RestartButton(), RestartButtonProps, formatDate(), isConnected(), ReativarPage(), clearSession(), getTestWindow(), logout() (+4 more)

### Community 27 - "page.tsx"
Cohesion: 0.20
Nodes (7): CreateUserPanel(), SetPasswordForm(), SetPasswordFormProps, ConviteInner(), ViewState, exchangeInviteToken(), setPassword()

### Community 28 - "sessionFromTokenResponse"
Cohesion: 0.20
Nodes (12): decodeJwtPayload(), enterDoctorMode(), exchangeOnboardingToken(), exitDoctorMode(), fetchImpersonationDoctor(), login(), personalIdentity(), readBoolClaim() (+4 more)

### Community 29 - "isSessionExpired"
Cohesion: 0.24
Nodes (11): AdminMetricsInner(), AdminMetricsPage(), fmtHours(), fmtScore(), formatShortDay(), PeriodKey, PERIODS, SCORE_LABELS (+3 more)

### Community 31 - "SummaryStep.tsx"
Cohesion: 0.13
Nodes (15): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStepProps, USAGE_LABEL, TestWindowExplainerStep(), TestWindowExplainerStepProps, CheckoutTrialNotice() (+7 more)

### Community 32 - "layout.tsx"
Cohesion: 0.18
Nodes (9): dmSans, FONT_VARIABLES, hankenGrotesk, instrumentSerif, inter, jetbrainsMono, metadata, newsreader (+1 more)

### Community 33 - "manage-api.test.ts"
Cohesion: 0.20
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "Manual verification — onboarding wizard & multi-professional configuration"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 39 - "usePortalGuard"
Cohesion: 0.31
Nodes (8): ADMIN_NAV, AdminLayout(), usePortalGuard(), billingMembership(), ensurePortalClinic(), personalBillingLogin(), ManageApiError, selectPersonalClinic()

### Community 40 - "CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)"
Cohesion: 0.14
Nodes (13): A) Painel admin — 4 abas, `app/(site)/admin/anamneses/page.tsx` (NOVA), `app/(site)/admin/inbound/page.tsx` (REFORMADA — não é mais um proxy PreCheck), `app/(site)/admin/metrics/page.tsx` (NOVA), `app/(site)/admin/users/page.tsx`, B) Taxonomia de papéis (contrato com o brain-api), CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role), Componentes de apoio (+5 more)

### Community 41 - "ContactStep.tsx"
Cohesion: 0.33
Nodes (5): ContactStep(), ContactStepProps, honeypotStyle, passwordError(), ContactFields

### Community 48 - "Retirement of the clinic product portal (2026-10-05)"
Cohesion: 0.17
Nodes (9): Result, Retirement of the clinic product portal (2026-10-05), Scope and state, Validation, Fluxo, Recuperação preservada, TASK-062 — Criar minha clínica sem trocar de conta, Validação (+1 more)

### Community 52 - "Session"
Cohesion: 0.33
Nodes (3): Session, ManageApiModule, SignOutModule

### Community 53 - "CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half)"
Cohesion: 0.14
Nodes (13): Accessibility, Browser verification (dev server, 2026-08-01), CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half), Components, Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons), Door 2 — `cadastro/page.tsx` (the signup wizard route), Pendências, Pricing screen (+5 more)

### Community 56 - "Billing wording and account navigation (2026-10-05)"
Cohesion: 0.40
Nodes (4): Billing wording and account navigation (2026-10-05), Changes, State, Validation

### Community 61 - "CHECKPOINT — Fontes self-hosted via `next/font/google` (LGPD)"
Cohesion: 0.15
Nodes (12): 1. O que estava errado, 2. Onde este repo difere do `secretarIA-frontend`, 3. A correção, 4. Como foi provado, 5. Pendências, A ÚNICA mudança visual: JetBrains Mono @ 600, Armadilha de medição (herdada do repo irmão, confirmada aqui), CHECKPOINT — Fontes self-hosted via `next/font/google` (LGPD) (+4 more)

### Community 62 - "CHECKPOINT — papel `secretary` no portal (frontend)"
Cohesion: 0.17
Nodes (11): CHECKPOINT — papel `secretary` no portal (frontend), Convite de equipe, `lib/manage-api.ts`, O papel, em uma frase de frontend, O que mudou, O que NÃO precisou mudar, Pendências, `ProfessionalsSection.tsx` (Seção 05 de `/secretaria/configuracao`) (+3 more)

### Community 63 - "CHECKPOINT — Banner "configure sua secretarIA" (FEAT 42)"
Cohesion: 0.18
Nodes (10): 1. O que é, 2. De onde vem o sinal — e a correção ao prompt, 3. As três decisões, confirmadas pelo usuário antes do código, 4. Arquivos, 5. Armadilhas registradas, 6. Gates (rodados 2026-08-29), 7. Pendências, CHECKPOINT — Banner "configure sua secretarIA" (FEAT 42) (+2 more)

### Community 64 - "CHECKPOINT — Header unificada + lockup de produto + renomeações de nomenclatura"
Cohesion: 0.18
Nodes (10): 1. Transição Modo médico ⇄ Admin agora é simétrica (botão, não faixa), 2. "Anamneses (PreCheck)" → "Anamneses", 3. "Configurações" → "Configurações secretarIA" (com o IA estilizado), 4. Uma única Header em toda tela de médico + lockup do produto, CHECKPOINT — Header unificada + lockup de produto + renomeações de nomenclatura, Decisão de layout a confirmar com o usuário, Mapeamento tela → lockup, Outros ajustes de layout (+2 more)

### Community 65 - "CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI"
Cohesion: 0.20
Nodes (9): Also in this working tree this session (different round — not touched here), CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI, Closing an open question from the prior round, `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens"), Pendências / follow-ups, Tested, Update 2026-08-02 — trio consolidated to [Agendar] [Gerenciar consulta] [Outro], What changed (+1 more)

### Community 66 - "CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar"
Cohesion: 0.20
Nodes (9): CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar, Entrega 1 — `/secretaria/configuracao` (hub design system), Entrega 2 — `/doctor/perfil` "Configuração da secretaria" (portal design system), Invalidated hypothesis (carried over from a prior round, re-confirmed this round), Pendências / follow-ups, Reuse vs. duplication (asked for explicitly — see report for the same summary), Shared client layer — `lib/secretaria-hub.ts`, Tested (+1 more)

### Community 67 - "CHECKPOINT — escolha de plano no /cadastro"
Cohesion: 0.22
Nodes (8): 1. O que estava acontecendo, 2. O que entrou, 3. As três decisões que não são estéticas, 4. Divergência de quota — RESOLVIDA (a copy cedeu), 5. Validação, 6. Atualização de 2026-09-03 — são três faixas, 7. Pendências, CHECKPOINT — escolha de plano no /cadastro

### Community 68 - "O que mudou"
Cohesion: 0.22
Nodes (8): As 3 telas, CHECKPOINT — "Esqueci a senha" agora fala com a brain-api, `lib/api.ts` — **NÃO foi apagado**, `lib/manage-api.ts`, O bug, O que mudou, Pendências, Testes

### Community 69 - "CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users"
Cohesion: 0.22
Nodes (8): CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users, Frente A — Cobrança do PreCheck, Frente B — port de `/metrics` e `/users`, `DashNav` sensível a papel, Notas para o operador, O que mudou, Pendências / follow-ups, Reuso vs. duplicação, Testado

### Community 72 - "CHECKPOINT_saida_secretaria.md"
Cohesion: 0.25
Nodes (7): A decisão que passou do pedido literal, Como se chega na secretarIA agora, O que ficou, O que saiu, Pendências, Por quê, ⚠️ Variável de build obrigatória

### Community 73 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 74 - "CHECKPOINT — feedback de campo obrigatório no /cadastro (+ `.btn:disabled` no DS)"
Cohesion: 0.29
Nodes (6): 1. O que estava acontecendo (três coisas somadas), 2. O que entrou, 3. O buraco do design system (era maior que o bug relatado), 4. Decisão pendente — o telefone continua OBRIGATÓRIO, 5. Validação, CHECKPOINT — feedback de campo obrigatório no /cadastro (+ `.btn:disabled` no DS)

### Community 76 - "CHECKPOINT: "Criar clínica de teste" em `/admin/tenants` (parte 2/2)"
Cohesion: 0.33
Nodes (5): CHECKPOINT: "Criar clínica de teste" em `/admin/tenants` (parte 2/2), Decisões, O que entrou, Pendente, Provas

### Community 77 - "CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login"
Cohesion: 0.33
Nodes (5): 1. O glifo é a logo real, 2. Os grupos legados `(SignOut)` e `(SignIn)`, 3. Copy do login que a troca de marca deixou incoerente, CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login, Pendências

### Community 78 - "brain-frontend"
Cohesion: 0.40
Nodes (4): brain-frontend, Documentação, graphify, Prompts prontos para rodar

### Community 79 - "CHECKPOINT — secretarIA Agenda mock purge (de-demo round)"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 82 - "plans.ts"
Cohesion: 0.20
Nodes (11): CadastroWizard(), PLAN_FAMILIES, planChoices(), PRICING_BY_PLAN_ID, PURCHASABLE_PLANS, resolvePlan(), resolve(), CadastroInner() (+3 more)

### Community 86 - "ContactForm.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 89 - "Add product to the subscription - UI (TASK-015)"
Cohesion: 0.50
Nodes (3): Add product to the subscription - UI (TASK-015), Independent review fix pass, Resumption verification (2026-09-30)

## Knowledge Gaps
- **402 isolated node(s):** `screens`, `AuthShellProps`, `PasswordFieldProps`, `StepIndicatorProps`, `metadata` (+397 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BrandIcon()` connect `page.tsx` to `CadastroWizard.tsx`, `BrandIcon.tsx`, `usePortalGuard`, `api.ts`, `page.tsx`, `PrecheckBillingSection.tsx`, `ContactForm.tsx`, `page.tsx`, `clearSession`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `BrandGlyph()` connect `page.tsx` to `BrandIcon.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `plans.ts`, `WizardShell.tsx`, `clearSession`, `page.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `usePortalGuard` to `CadastroWizard.tsx`, `manage-api.ts`, `create-tenant.ts`, `page.tsx`, `page.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`, `PlanCheckoutCta.tsx`, `clearSession`, `page.tsx`, `SummaryStep.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `screens`, `AuthShellProps`, `PasswordFieldProps` to the rest of the system?**
  _403 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CadastroWizard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1383399209486166 - nodes in this community are weakly interconnected._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.030303030303030304 - nodes in this community are weakly interconnected._
- **Should `BrandIcon.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05957767722473605 - nodes in this community are weakly interconnected._