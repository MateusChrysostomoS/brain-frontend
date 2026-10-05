# Graph Report - brain-frontend  (2026-10-05)

## Corpus Check
- 143 files · ~124,740 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 968 nodes · 1607 edges · 81 communities (73 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5ac95b29`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_manage-api.ts|manage-api.ts]]
- [[_COMMUNITY_DashNav.tsx|DashNav.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_usePortalGuard|usePortalGuard]]
- [[_COMMUNITY_AvailabilitySection.tsx|AvailabilitySection.tsx]]
- [[_COMMUNITY_secretaria-hub.ts|secretaria-hub.ts]]
- [[_COMMUNITY_SummaryDetail.tsx|SummaryDetail.tsx]]
- [[_COMMUNITY_ui.tsx|ui.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_BrandIcon.tsx|BrandIcon.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_GoogleSection.tsx|GoogleSection.tsx]]
- [[_COMMUNITY_package.json|package.json]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_calendar.tsx|calendar.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_modals.tsx|modals.tsx]]
- [[_COMMUNITY_PrecheckBillingSection.tsx|PrecheckBillingSection.tsx]]
- [[_COMMUNITY_icons.tsx|icons.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_PatientCard.tsx|PatientCard.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_LaunchWaitlistModal.tsx|LaunchWaitlistModal.tsx]]
- [[_COMMUNITY_hub-mapping.ts|hub-mapping.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_apiFetch|apiFetch]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_PortalShell.tsx|PortalShell.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_manage-api.test.ts|manage-api.test.ts]]
- [[_COMMUNITY_logout|logout]]
- [[_COMMUNITY_CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI|CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI]]
- [[_COMMUNITY_Toast.tsx|Toast.tsx]]
- [[_COMMUNITY_BrandGlyph.tsx|BrandGlyph.tsx]]
- [[_COMMUNITY_PriorApiStep.tsx|PriorApiStep.tsx]]
- [[_COMMUNITY_DeleteControls.tsx|DeleteControls.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_brain-frontend|brain-frontend]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_Retirement of the clinic product portal (2026-10-05)|Retirement of the clinic product portal (2026-10-05)]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_FinalConfirmDeleteModal.tsx|FinalConfirmDeleteModal.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_sign-out.test.ts|sign-out.test.ts]]
- [[_COMMUNITY_BgCircles.tsx|BgCircles.tsx]]
- [[_COMMUNITY_PlanStep.tsx|PlanStep.tsx]]
- [[_COMMUNITY_ProfessionalsSection.tsx|ProfessionalsSection.tsx]]
- [[_COMMUNITY_modals.tsx|modals.tsx]]
- [[_COMMUNITY_CHECKPOINT — Admin abas PreCheck (AnamnesesMétricasInbound) + taxonomia de papéis (Role)|CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_CadastroWizard.tsx|CadastroWizard.tsx]]
- [[_COMMUNITY_useSecretariaHub.ts|useSecretariaHub.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_apiFetch|apiFetch]]
- [[_COMMUNITY_AddonsStep.tsx|AddonsStep.tsx]]
- [[_COMMUNITY_CHECKPOINT — Portal de cobrança do PreCheck + port de metrics e users|CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users]]
- [[_COMMUNITY_PatientImages.tsx|PatientImages.tsx]]
- [[_COMMUNITY_resumo.ts|resumo.ts]]
- [[_COMMUNITY_PrecheckBillingSection.tsx|PrecheckBillingSection.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_RestartButton.tsx|RestartButton.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_hub-mapping.ts|hub-mapping.ts]]
- [[_COMMUNITY_sign-out.test.ts|sign-out.test.ts]]
- [[_COMMUNITY_CadastroWizard.tsx|CadastroWizard.tsx]]
- [[_COMMUNITY_ContactForm.tsx|ContactForm.tsx]]
- [[_COMMUNITY_Add product to the subscription - UI (TASK-015)|Add product to the subscription - UI (TASK-015)]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 47 edges
2. `usePortalGuard()` - 21 edges
3. `apiFetch()` - 20 edges
4. `ManageApiError` - 19 edges
5. `BrandIcon()` - 18 edges
6. `Session` - 18 edges
7. `clearSession()` - 17 edges
8. `compilerOptions` - 16 edges
9. `BrandGlyph()` - 13 edges
10. `isSessionExpired()` - 11 edges

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

## Communities (81 total, 8 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.18
Nodes (10): ADDON_COPY, AddonsStep(), AddonsStepProps, EMPTY_ANSWERS, EMPTY_CONTACT, SIGNUP_ADDON_IDS, SignupAddonId, StepId (+2 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.03
Nodes (60): AddProductResult, AdminAnamnesisList, AdminMetricsClinic, AdminMetricsDoctor, AdminMetricsSatisfaction, AdminMetricsTimelinePoint, AdminMetricsTotals, AdminTenantDeleteResult (+52 more)

### Community 2 - "page.tsx"
Cohesion: 0.18
Nodes (10): PortalHeader(), PortalHeaderProps, PortalShellProps, PreCheckWordmark(), PreCheckWordmarkProps, PortalProduct, PRODUCT_NAME, ProductLockup() (+2 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.33
Nodes (5): Causa e mudança, Estado, Publicação, Retorno ao console após compra — correção da TASK B, Validação

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.29
Nodes (5): CalendarConnectedInner(), SECRETARIA_APP_BASE, SECRETARIA_APP_ROUTES, secretariaAppConfigured(), secretariaAppUrl()

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.17
Nodes (12): alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps, readCardEntitlement, CtaDecision, createEntitlementReader(), anonymousCheckoutRoute(), checkoutErrorMessage() (+4 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.08
Nodes (20): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps, buildCreateTenantPayload(), CreateTenantForm (+12 more)

### Community 7 - "ui.tsx"
Cohesion: 0.18
Nodes (10): BrandIcon(), Faq(), FaqItem, FaqProps, PriceCard(), PriceCardProps, Reveal(), RevealProps (+2 more)

### Community 8 - "page.tsx"
Cohesion: 0.10
Nodes (12): metadata, ITEMS, LandingNav(), conversation, Msg, times, ThemeToggle(), applyTheme() (+4 more)

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.18
Nodes (10): AdminAnamnesesInner(), AdminDashboardPage(), Stats, AdminInboundPage(), TenantsInner(), UsersPage(), usePortalGuard(), DoctorPerfilPage() (+2 more)

### Community 10 - "page.tsx"
Cohesion: 0.15
Nodes (14): formatDate(), INTEREST_LABEL, LeadCard(), NEXT_ACTIONS, STATUS_FILTERS, STATUS_LABEL, STATUS_TONE, StatusFilter (+6 more)

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.06
Nodes (47): PROFILE_OPTIONS, apiFetch(), confirmPasswordReset(), createUser(), deletePatients(), getMe(), getMediaUrl(), getMetricsOverview() (+39 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.11
Nodes (10): STATUS_TONE, statusBadge(), TenantDetail(), Modal(), ModalProps, adminCreateTenant(), adminDeleteTenant(), adminGetTenant() (+2 more)

### Community 16 - "page.tsx"
Cohesion: 0.11
Nodes (22): adminGetEntitlements(), adminListAnamneses(), adminListUsers(), createProfessionalInvite(), createSecretaryInvite(), createSelfProfessional(), getAnamnesis(), getDoctorMe() (+14 more)

### Community 17 - "page.tsx"
Cohesion: 0.29
Nodes (7): CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, getCheckoutConfig(), getCheckoutTrialDays(), isCheckoutConfigAddon()

### Community 19 - "page.tsx"
Cohesion: 0.16
Nodes (13): ContactStep(), ContactStepProps, honeypotStyle, DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuideProps, STEPS (+5 more)

### Community 20 - "modals.tsx"
Cohesion: 0.16
Nodes (11): FacebookPageStep(), FacebookPageStepProps, OPTIONS, OPTIONS, WhatsappUsageStep(), WhatsappUsageStepProps, RadioOption, RadioPillGroup() (+3 more)

### Community 21 - "PrecheckBillingSection.tsx"
Cohesion: 0.21
Nodes (10): formatDatePtBR(), PRECHECK_TIERS, PrecheckBillingSection(), PrecheckBillingSectionProps, pluralize(), createPrecheckTopupSession(), getPrecheckBillingUsage(), PrecheckBillingUsage (+2 more)

### Community 22 - "icons.tsx"
Cohesion: 0.18
Nodes (8): AdminAnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), AdminAnamnesis, AdminAnamnesisDetail, adminGetAnamnesis()

### Community 23 - "page.tsx"
Cohesion: 0.15
Nodes (10): ROLE_LABEL, ROLE_TONE, Notice(), NoticeProps, NoticeTone, TONE_ICON, adminCreateUser(), AdminTenant (+2 more)

### Community 24 - "page.tsx"
Cohesion: 0.31
Nodes (4): withConsoleOrigin(), isSafeForm(), postLoginRoute(), safeNextPath()

### Community 25 - "PatientCard.tsx"
Cohesion: 0.09
Nodes (30): AddProductDialog(), AddProductDialogProps, cardStyle, productName(), AddProductAction, addProductErrorMessage(), addProductReducer(), AddProductState (+22 more)

### Community 26 - "page.tsx"
Cohesion: 0.20
Nodes (9): formatDate(), isConnected(), ReativarPage(), BrandFooter(), BrandFooterProps, BrandGlyph(), BrandGlyphProps, getTestWindow() (+1 more)

### Community 27 - "LaunchWaitlistModal.tsx"
Cohesion: 0.20
Nodes (9): errorStyle, LaunchWaitlistForm(), LaunchWaitlistFormProps, cardStyle, closeButtonStyle, LaunchWaitlistModal(), LaunchWaitlistModalProps, overlayStyle (+1 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.20
Nodes (12): decodeJwtPayload(), enterDoctorMode(), exchangeInviteToken(), exchangeOnboardingToken(), exitDoctorMode(), fetchImpersonationDoctor(), login(), readBoolClaim() (+4 more)

### Community 29 - "page.tsx"
Cohesion: 0.23
Nodes (10): AdminMetricsInner(), AdminMetricsPage(), fmtHours(), fmtScore(), PeriodKey, PERIODS, SCORE_LABELS, adminGetMetrics() (+2 more)

### Community 30 - "page.tsx"
Cohesion: 0.31
Nodes (4): CadastroWizard(), CadastroInner(), isPurchaseGated(), catalogRequiresWhatsappCoexistence()

### Community 31 - "apiFetch"
Cohesion: 0.20
Nodes (8): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStepProps, USAGE_LABEL, attachSignupIntake(), createPublicCheckoutSession(), redeemCourtesyCoupon()

### Community 32 - "page.tsx"
Cohesion: 0.18
Nodes (9): dmSans, FONT_VARIABLES, hankenGrotesk, instrumentSerif, inter, jetbrainsMono, metadata, newsreader (+1 more)

### Community 33 - "PortalShell.tsx"
Cohesion: 0.20
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "page.tsx"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 35 - "page.tsx"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 36 - "manage-api.test.ts"
Cohesion: 0.22
Nodes (7): BrandIconProps, FILLED, IconName, PATHS, PhoneFloatCard, PhoneProps, WaStep

### Community 37 - "logout"
Cohesion: 0.33
Nodes (6): ensureSession(), logout(), performRefresh(), rawManageFetch(), refreshFromCookie(), signOut()

### Community 38 - "CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI"
Cohesion: 0.18
Nodes (11): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, coerceAddons(), coerceLimits() (+3 more)

### Community 39 - "Toast.tsx"
Cohesion: 0.31
Nodes (6): describeApiError(), isSessionExpired(), ROLE_LABEL, ROLE_TONE, DoctorMe, Session

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.14
Nodes (13): A) Painel admin — 4 abas, `app/(site)/admin/anamneses/page.tsx` (NOVA), `app/(site)/admin/inbound/page.tsx` (REFORMADA — não é mais um proxy PreCheck), `app/(site)/admin/metrics/page.tsx` (NOVA), `app/(site)/admin/users/page.tsx`, B) Taxonomia de papéis (contrato com o brain-api), CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role), Componentes de apoio (+5 more)

### Community 41 - "PriorApiStep.tsx"
Cohesion: 0.40
Nodes (4): OPTIONS, PriorApiStep(), PriorApiStepProps, SignupIntakePriorApi

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.21
Nodes (12): PLAN_FAMILIES, planChoices(), PRICING_BY_PLAN_ID, PURCHASABLE_PLANS, ResolvedPlan, resolvePlan(), resolve(), PRECHECK_QUOTA (+4 more)

### Community 44 - "page.tsx"
Cohesion: 0.40
Nodes (4): RestartButton(), RestartButtonProps, restartTestWindow(), RestartTestWindowResult

### Community 46 - "layout.tsx"
Cohesion: 0.20
Nodes (11): CheckoutSucessoInner(), CheckoutSucessoRouter(), renderView(), ViewState, ConsoleReturn, consoleReturnFor(), consoleReturnPath(), consoleReturnRoute() (+3 more)

### Community 48 - "Retirement of the clinic product portal (2026-10-05)"
Cohesion: 0.40
Nodes (4): Result, Retirement of the clinic product portal (2026-10-05), Scope and state, Validation

### Community 53 - "BgCircles.tsx"
Cohesion: 0.14
Nodes (13): Accessibility, Browser verification (dev server, 2026-08-01), CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half), Components, Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons), Door 2 — `cadastro/page.tsx` (the signup wizard route), Pendências, Pricing screen (+5 more)

### Community 56 - "PlanStep.tsx"
Cohesion: 0.50
Nodes (3): PlanStep(), PlanStepProps, PlanChoice

### Community 61 - "modals.tsx"
Cohesion: 0.15
Nodes (12): 1. O que estava errado, 2. Onde este repo difere do `secretarIA-frontend`, 3. A correção, 4. Como foi provado, 5. Pendências, A ÚNICA mudança visual: JetBrains Mono @ 600, Armadilha de medição (herdada do repo irmão, confirmada aqui), CHECKPOINT — Fontes self-hosted via `next/font/google` (LGPD) (+4 more)

### Community 62 - "CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)"
Cohesion: 0.17
Nodes (11): CHECKPOINT — papel `secretary` no portal (frontend), Convite de equipe, `lib/manage-api.ts`, O papel, em uma frase de frontend, O que mudou, O que NÃO precisou mudar, Pendências, `ProfessionalsSection.tsx` (Seção 05 de `/secretaria/configuracao`) (+3 more)

### Community 63 - "types.ts"
Cohesion: 0.18
Nodes (10): 1. O que é, 2. De onde vem o sinal — e a correção ao prompt, 3. As três decisões, confirmadas pelo usuário antes do código, 4. Arquivos, 5. Armadilhas registradas, 6. Gates (rodados 2026-08-29), 7. Pendências, CHECKPOINT — Banner "configure sua secretarIA" (FEAT 42) (+2 more)

### Community 64 - "CadastroWizard.tsx"
Cohesion: 0.18
Nodes (10): 1. Transição Modo médico ⇄ Admin agora é simétrica (botão, não faixa), 2. "Anamneses (PreCheck)" → "Anamneses", 3. "Configurações" → "Configurações secretarIA" (com o IA estilizado), 4. Uma única Header em toda tela de médico + lockup do produto, CHECKPOINT — Header unificada + lockup de produto + renomeações de nomenclatura, Decisão de layout a confirmar com o usuário, Mapeamento tela → lockup, Outros ajustes de layout (+2 more)

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.20
Nodes (9): Also in this working tree this session (different round — not touched here), CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI, Closing an open question from the prior round, `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens"), Pendências / follow-ups, Tested, Update 2026-08-02 — trio consolidated to [Agendar] [Gerenciar consulta] [Outro], What changed (+1 more)

### Community 66 - "page.tsx"
Cohesion: 0.20
Nodes (9): CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar, Entrega 1 — `/secretaria/configuracao` (hub design system), Entrega 2 — `/doctor/perfil` "Configuração da secretaria" (portal design system), Invalidated hypothesis (carried over from a prior round, re-confirmed this round), Pendências / follow-ups, Reuse vs. duplication (asked for explicitly — see report for the same summary), Shared client layer — `lib/secretaria-hub.ts`, Tested (+1 more)

### Community 67 - "apiFetch"
Cohesion: 0.22
Nodes (8): 1. O que estava acontecendo, 2. O que entrou, 3. As três decisões que não são estéticas, 4. Divergência de quota — RESOLVIDA (a copy cedeu), 5. Validação, 6. Atualização de 2026-09-03 — são três faixas, 7. Pendências, CHECKPOINT — escolha de plano no /cadastro

### Community 68 - "AddonsStep.tsx"
Cohesion: 0.22
Nodes (8): As 3 telas, CHECKPOINT — "Esqueci a senha" agora fala com a brain-api, `lib/api.ts` — **NÃO foi apagado**, `lib/manage-api.ts`, O bug, O que mudou, Pendências, Testes

### Community 69 - "CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users"
Cohesion: 0.22
Nodes (8): CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users, Frente A — Cobrança do PreCheck, Frente B — port de `/metrics` e `/users`, `DashNav` sensível a papel, Notas para o operador, O que mudou, Pendências / follow-ups, Reuso vs. duplicação, Testado

### Community 70 - "PatientImages.tsx"
Cohesion: 0.20
Nodes (10): ADMIN_NAV, AdminLayout(), BackToAdminButton(), PortalNavItem, PortalShell(), useImpersonation(), ACCOUNT_NAV, DoctorLayout() (+2 more)

### Community 72 - "resumo.ts"
Cohesion: 0.25
Nodes (7): A decisão que passou do pedido literal, Como se chega na secretarIA agora, O que ficou, O que saiu, Pendências, Por quê, ⚠️ Variável de build obrigatória

### Community 73 - "PrecheckBillingSection.tsx"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 74 - "page.tsx"
Cohesion: 0.29
Nodes (6): 1. O que estava acontecendo (três coisas somadas), 2. O que entrou, 3. O buraco do design system (era maior que o bug relatado), 4. Decisão pendente — o telefone continua OBRIGATÓRIO, 5. Validação, CHECKPOINT — feedback de campo obrigatório no /cadastro (+ `.btn:disabled` no DS)

### Community 75 - "page.tsx"
Cohesion: 0.22
Nodes (4): SetPasswordForm(), SetPasswordFormProps, ViewState, setPassword()

### Community 76 - "RestartButton.tsx"
Cohesion: 0.33
Nodes (5): CHECKPOINT: "Criar clínica de teste" em `/admin/tenants` (parte 2/2), Decisões, O que entrou, Pendente, Provas

### Community 77 - "page.tsx"
Cohesion: 0.33
Nodes (5): 1. O glifo é a logo real, 2. Os grupos legados `(SignOut)` e `(SignIn)`, 3. Copy do login que a troca de marca deixou incoerente, CHECKPOINT — Novo glifo Brain + desmarcação PreCheck do login, Pendências

### Community 78 - "hub-mapping.ts"
Cohesion: 0.40
Nodes (4): brain-frontend, Documentação, graphify, Prompts prontos para rodar

### Community 79 - "sign-out.test.ts"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 82 - "CadastroWizard.tsx"
Cohesion: 0.24
Nodes (10): CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL, PageCreationGuide(), SummaryStep(), TestWindowExplainerStep() (+2 more)

### Community 86 - "ContactForm.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 89 - "Add product to the subscription - UI (TASK-015)"
Cohesion: 0.50
Nodes (3): Add product to the subscription - UI (TASK-015), Independent review fix pass, Resumption verification (2026-09-30)

## Knowledge Gaps
- **386 isolated node(s):** `AuthShellProps`, `PasswordFieldProps`, `StepIndicatorProps`, `metadata`, `metadata` (+381 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BrandGlyph()` connect `page.tsx` to `page.tsx`, `page.tsx`, `AvailabilitySection.tsx`, `CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI`, `SummaryDetail.tsx`, `page.tsx`, `layout.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `ui.tsx` to `manage-api.ts`, `page.tsx`, `page.tsx`, `manage-api.test.ts`, `CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI`, `PatientImages.tsx`, `BrandIcon.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`, `ContactForm.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `SummaryDetail.tsx` to `manage-api.ts`, `DashNav.tsx`, `secretaria-hub.ts`, `CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI`, `PatientImages.tsx`, `Toast.tsx`, `page.tsx`, `page.tsx`, `layout.tsx`, `CadastroWizard.tsx`, `PrecheckBillingSection.tsx`, `PatientCard.tsx`, `apiFetch`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `AuthShellProps`, `PasswordFieldProps`, `StepIndicatorProps` to the rest of the system?**
  _386 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.03076923076923077 - nodes in this community are weakly interconnected._
- **Should `SummaryDetail.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07560975609756097 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._