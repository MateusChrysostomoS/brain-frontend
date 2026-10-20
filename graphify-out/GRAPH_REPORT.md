# Graph Report - wt-site  (2026-10-19)

## Corpus Check
- 153 files · ~123,239 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1016 nodes · 1829 edges · 82 communities (71 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb364ddd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AddonsStep.tsx
- manage-api.ts
- layout.tsx
- Retorno ao console após compra — correção da TASK B
- create-tenant.ts
- PlanCheckoutCta.tsx
- page.tsx
- page.tsx
- ThemeToggle.tsx
- clearSession
- page.tsx
- api.ts
- package.json
- compilerOptions
- page.tsx
- manageFetch
- TestWindowExplainerStep.tsx
- format.ts
- WizardShell.tsx
- FacebookPageStep.tsx
- PrecheckBillingSection.tsx
- page.tsx
- page.tsx
- vignettes.tsx
- add-product.ts
- isSessionExpired
- page.tsx
- sessionFromTokenResponse
- usePortalGuard.ts
- Pricing.tsx
- SummaryStep.tsx
- layout.tsx
- manage-api.test.ts
- Manual verification — onboarding wizard & multi-professional configuration
- SiteHeader.tsx
- BrandIcon.tsx
- logout
- getEntitlements
- usePortalGuard
- CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)
- types.ts
- pricing.ts
- RestartButton.tsx
- add-product-api.test.ts
- page.tsx
- SiteHeader
- Retirement of the clinic product portal (2026-10-05)
- layout.tsx
- layout.tsx
- error.tsx
- sign-out.test.ts
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
- CHECKPOINT_esqueci_senha_codigo.md
- CHECKPOINT_saida_secretaria.md
- Manual verification — billing, refresh tokens & secretarIA hub handoff
- CHECKPOINT — feedback de campo obrigatório no /cadastro (+ `.btn:disabled` no DS)
- CHECKPOINT: "Criar clínica de teste" em `/admin/tenants` (parte 2/2)
- CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login
- brain-frontend
- CHECKPOINT — secretarIA Agenda mock purge (de-demo round)
- CadastroWizard.tsx
- ContactForm.tsx
- Add product to the subscription - UI (TASK-015)

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 48 edges
2. `clearSession()` - 27 edges
3. `usePortalGuard()` - 23 edges
4. `BrandIcon()` - 22 edges
5. `isSessionExpired()` - 20 edges
6. `apiFetch()` - 20 edges
7. `ManageApiError` - 19 edges
8. `Session` - 18 edges
9. `compilerOptions` - 16 edges
10. `BrandGlyph()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `markup()` --indirect_call--> `PlanCheckoutCta()`  [INFERRED]
  lib/__tests__/plan-checkout-cta.test.ts → app/(site)/_components/PlanCheckoutCta.tsx
- `AddProductDialog()` --indirect_call--> `addProductReducer()`  [INFERRED]
  app/(site)/_components/AddProductDialog.tsx → lib/add-product.ts
- `render()` --calls--> `AddProductDialog()`  [EXTRACTED]
  lib/__tests__/add-product-dialog.test.ts → app/(site)/_components/AddProductDialog.tsx
- `loadTrialDays()` --calls--> `getCheckoutTrialDays()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts
- `CheckoutTrialNotice()` --calls--> `catalogRequiresWhatsappCoexistence()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts

## Import Cycles
- None detected.

## Communities (82 total, 11 thin omitted)

### Community 0 - "AddonsStep.tsx"
Cohesion: 0.22
Nodes (8): ADDON_COPY, AddonsStep(), AddonsStepProps, SIGNUP_ADDON_IDS, SignupAddonId, getCheckoutConfig(), isCheckoutConfigAddon(), updateSignupIntentCatalog()

### Community 1 - "manage-api.ts"
Cohesion: 0.03
Nodes (59): AddProductResult, AdminAnamnesisList, AdminMetricsClinic, AdminMetricsDoctor, AdminMetricsSatisfaction, AdminMetricsTimelinePoint, AdminMetricsTotals, AdminTenantDeleteResult (+51 more)

### Community 2 - "layout.tsx"
Cohesion: 0.10
Nodes (21): ADMIN_NAV, AdminLayout(), BackToAdminButton(), ACCOUNT_NAV, ClinicAccountShell(), PortalHeader(), PortalHeaderProps, isActive() (+13 more)

### Community 3 - "Retorno ao console após compra — correção da TASK B"
Cohesion: 0.33
Nodes (5): Causa e mudança, Estado, Publicação, Retorno ao console após compra — correção da TASK B, Validação

### Community 4 - "create-tenant.ts"
Cohesion: 0.28
Nodes (10): buildCreateTenantPayload(), CreateTenantForm, CreateTenantResult, describeCreateTenantError(), EMPTY_CREATE_TENANT_FORM, submitCreateTenant(), validateCreateTenantForm(), FILLED (+2 more)

### Community 5 - "PlanCheckoutCta.tsx"
Cohesion: 0.09
Nodes (30): CheckoutSucessoInner(), CheckoutSucessoRouter(), renderView(), ViewState, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps, readCardEntitlement (+22 more)

### Community 6 - "page.tsx"
Cohesion: 0.10
Nodes (24): UpdatePasswordPage(), ResetCodePage(), ForgotPasswordPage(), LoginInner(), AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps (+16 more)

### Community 7 - "page.tsx"
Cohesion: 0.24
Nodes (8): FAQ, metadata, NAV, Faq(), FaqEntry, COLUMNS, FooterLink, SiteFooter()

### Community 8 - "ThemeToggle.tsx"
Cohesion: 0.31
Nodes (6): ThemeToggle(), applyTheme(), getCurrentTheme(), setTheme(), Theme, toggleTheme()

### Community 9 - "clearSession"
Cohesion: 0.39
Nodes (7): AdminDashboardPage(), Stats, UsersPage(), adminListDemoRequests(), adminListTenants(), adminListUsers(), clearSession()

### Community 10 - "page.tsx"
Cohesion: 0.16
Nodes (14): AdminInboundPage(), formatDate(), INTEREST_LABEL, LeadCard(), NEXT_ACTIONS, STATUS_FILTERS, STATUS_LABEL, STATUS_TONE (+6 more)

### Community 11 - "api.ts"
Cohesion: 0.07
Nodes (46): apiFetch(), confirmPasswordReset(), createUser(), deletePatients(), getMe(), getMediaUrl(), getMetricsOverview(), getSummary() (+38 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.12
Nodes (14): formatDate(), STATUS_TONE, statusBadge(), TenantDetail(), TenantsTable(), Modal(), ModalProps, ProductMark() (+6 more)

### Community 16 - "manageFetch"
Cohesion: 0.12
Nodes (19): adminGetEntitlements(), adminListAnamneses(), createProfessionalInvite(), createSecretaryInvite(), createSelfProfessional(), getAnamnesis(), getDoctorOnboarding(), getMe() (+11 more)

### Community 17 - "TestWindowExplainerStep.tsx"
Cohesion: 0.67
Nodes (3): TestWindowExplainerStep(), TestWindowExplainerStepProps, getCheckoutTrialDays()

### Community 19 - "WizardShell.tsx"
Cohesion: 0.15
Nodes (14): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS, OPTIONS, PriorApiStep() (+6 more)

### Community 20 - "FacebookPageStep.tsx"
Cohesion: 0.16
Nodes (11): FacebookPageStep(), FacebookPageStepProps, OPTIONS, OPTIONS, WhatsappUsageStep(), WhatsappUsageStepProps, RadioOption, RadioPillGroup() (+3 more)

### Community 21 - "PrecheckBillingSection.tsx"
Cohesion: 0.12
Nodes (24): formatDatePtBR(), PRECHECK_TIERS, PrecheckBillingSection(), PrecheckBillingSectionProps, BillingPage(), humanizeStatus(), StatusVisual, pluralize() (+16 more)

### Community 22 - "page.tsx"
Cohesion: 0.23
Nodes (10): AdminAnamnesesListView(), AdminAnamnesisDetailView(), formatDateTime(), shortTenantId(), STATUS_LABEL, STATUS_TONE, statusBadge(), AdminAnamnesis (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.17
Nodes (11): formatDate(), ROLE_LABEL, ROLE_TONE, Notice(), NoticeProps, NoticeTone, TONE_ICON, adminCreateUser() (+3 more)

### Community 24 - "vignettes.tsx"
Cohesion: 0.21
Nodes (12): AgendaWeek(), Conv, CONVERSATIONS, DAYS, Ev, EVENTS, HOURS, order() (+4 more)

### Community 25 - "add-product.ts"
Cohesion: 0.11
Nodes (28): AddProductDialog(), AddProductDialogProps, cardStyle, failureParts(), productName(), AddProductAction, addProductErrorMessage(), addProductReducer() (+20 more)

### Community 26 - "isSessionExpired"
Cohesion: 0.33
Nodes (8): formatDate(), isConnected(), ReativarPage(), isSessionExpired(), BrainHomePage(), d(), getTestWindow(), TestWindow

### Community 27 - "page.tsx"
Cohesion: 0.06
Nodes (23): CreateUserPanel(), CalendarConnectedInner(), BrandGlyph(), BrandGlyphProps, errorStyle, LaunchWaitlistForm(), LaunchWaitlistFormProps, cardStyle (+15 more)

### Community 28 - "sessionFromTokenResponse"
Cohesion: 0.18
Nodes (14): decodeJwtPayload(), enterDoctorMode(), exchangeOnboardingToken(), exitDoctorMode(), fetchImpersonationDoctor(), login(), performRefresh(), rawManageFetch() (+6 more)

### Community 29 - "usePortalGuard.ts"
Cohesion: 0.24
Nodes (10): AdminMetricsInner(), fmtHours(), fmtScore(), formatShortDay(), PeriodKey, PERIODS, SCORE_LABELS, adminGetMetrics() (+2 more)

### Community 30 - "Pricing.tsx"
Cohesion: 0.21
Nodes (11): CadastroInner(), isPurchaseGated(), PreCheckMark(), SecretariaMark(), SectionLabel(), Status, STATUS_TEXT, StatusTag() (+3 more)

### Community 31 - "SummaryStep.tsx"
Cohesion: 0.14
Nodes (13): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStepProps, USAGE_LABEL, WizardAnswers, CheckoutTrialNotice(), CheckoutTrialNoticeProps (+5 more)

### Community 32 - "layout.tsx"
Cohesion: 0.18
Nodes (9): dmSans, FONT_VARIABLES, hankenGrotesk, instrumentSerif, inter, jetbrainsMono, metadata, newsreader (+1 more)

### Community 33 - "manage-api.test.ts"
Cohesion: 0.20
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "Manual verification — onboarding wizard & multi-professional configuration"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 35 - "SiteHeader.tsx"
Cohesion: 0.24
Nodes (7): ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme(), NavItem, SiteHeaderProps, ThemeButton()

### Community 36 - "BrandIcon.tsx"
Cohesion: 0.15
Nodes (11): BrandIcon(), BrandIconProps, FILLED, IconName, PATHS, PhoneFloatCard, PhoneProps, WaStep (+3 more)

### Community 38 - "getEntitlements"
Cohesion: 0.67
Nodes (3): coerceAddons(), coerceLimits(), getEntitlements()

### Community 39 - "usePortalGuard"
Cohesion: 0.20
Nodes (10): AdminAnamnesesInner(), AdminMetricsPage(), TenantsInner(), usePortalGuard(), DoctorPerfilPage(), ROLE_LABEL, ROLE_TONE, DoctorMe (+2 more)

### Community 40 - "CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)"
Cohesion: 0.14
Nodes (13): A) Painel admin — 4 abas, `app/(site)/admin/anamneses/page.tsx` (NOVA), `app/(site)/admin/inbound/page.tsx` (REFORMADA — não é mais um proxy PreCheck), `app/(site)/admin/metrics/page.tsx` (NOVA), `app/(site)/admin/users/page.tsx`, B) Taxonomia de papéis (contrato com o brain-api), CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role), Componentes de apoio (+5 more)

### Community 41 - "types.ts"
Cohesion: 0.22
Nodes (8): ContactStep(), ContactStepProps, honeypotStyle, passwordError(), ContactFields, EMPTY_ANSWERS, EMPTY_CONTACT, StepId

### Community 42 - "pricing.ts"
Cohesion: 0.36
Nodes (6): resolvePlan(), resolve(), PRECHECK_QUOTA, PRICING, PricingPlan, PricingPlanKey

### Community 44 - "RestartButton.tsx"
Cohesion: 0.40
Nodes (4): RestartButton(), RestartButtonProps, restartTestWindow(), RestartTestWindowResult

### Community 46 - "page.tsx"
Cohesion: 0.27
Nodes (8): d(), FAQ, metadata, NAV, PreCheckPage(), tierName(), TIERS, PlayInView()

### Community 47 - "SiteHeader"
Cohesion: 0.40
Nodes (3): read(), repoRoot, SiteHeader()

### Community 48 - "Retirement of the clinic product portal (2026-10-05)"
Cohesion: 0.40
Nodes (4): Result, Retirement of the clinic product portal (2026-10-05), Scope and state, Validation

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

### Community 82 - "CadastroWizard.tsx"
Cohesion: 0.16
Nodes (17): CadastroWizard(), CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL, PlanStep(), PlanStepProps (+9 more)

### Community 86 - "ContactForm.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 89 - "Add product to the subscription - UI (TASK-015)"
Cohesion: 0.50
Nodes (3): Add product to the subscription - UI (TASK-015), Independent review fix pass, Resumption verification (2026-09-30)

## Knowledge Gaps
- **391 isolated node(s):** `screens`, `AuthShellProps`, `PasswordFieldProps`, `StepIndicatorProps`, `metadata` (+386 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BrandIcon()` connect `BrandIcon.tsx` to `AddonsStep.tsx`, `layout.tsx`, `SiteHeader.tsx`, `page.tsx`, `clearSession`, `page.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`, `ContactForm.tsx`, `page.tsx`, `vignettes.tsx`, `isSessionExpired`, `Pricing.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `BrandGlyph()` connect `page.tsx` to `layout.tsx`, `SiteHeader.tsx`, `PlanCheckoutCta.tsx`, `page.tsx`, `page.tsx`, `WizardShell.tsx`, `vignettes.tsx`, `isSessionExpired`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `page.tsx` to `AddonsStep.tsx`, `manage-api.ts`, `layout.tsx`, `create-tenant.ts`, `PlanCheckoutCta.tsx`, `RestartButton.tsx`, `CadastroWizard.tsx`, `PrecheckBillingSection.tsx`, `add-product.ts`, `page.tsx`, `usePortalGuard.ts`, `SummaryStep.tsx`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `screens`, `AuthShellProps`, `PasswordFieldProps` to the rest of the system?**
  _392 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03125 - nodes in this community are weakly interconnected._
- **Should `layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09659090909090909 - nodes in this community are weakly interconnected._
- **Should `PlanCheckoutCta.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08686868686868687 - nodes in this community are weakly interconnected._