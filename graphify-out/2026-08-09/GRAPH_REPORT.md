# Graph Report - brain-frontend  (2026-08-08)

## Corpus Check
- 188 files · ~135,874 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1233 nodes · 2449 edges · 82 communities (74 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1982ccb`
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
- [[_COMMUNITY_data.ts|data.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_calendar.tsx|calendar.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_modals.tsx|modals.tsx]]
- [[_COMMUNITY_PlanCheckoutCta.tsx|PlanCheckoutCta.tsx]]
- [[_COMMUNITY_icons.tsx|icons.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_api.ts|api.ts]]
- [[_COMMUNITY_PatientCard.tsx|PatientCard.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_hub-mapping.ts|hub-mapping.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_apiFetch|apiFetch]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_PortalShell.tsx|PortalShell.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_manage-api.test.ts|manage-api.test.ts]]
- [[_COMMUNITY_PatientImages.tsx|PatientImages.tsx]]
- [[_COMMUNITY_CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI|CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI]]
- [[_COMMUNITY_Toast.tsx|Toast.tsx]]
- [[_COMMUNITY_BrandGlyph.tsx|BrandGlyph.tsx]]
- [[_COMMUNITY_Manual verification — billing, refresh tokens & secretarIA hub handoff|Manual verification — billing, refresh tokens & secretarIA hub handoff]]
- [[_COMMUNITY_DeleteControls.tsx|DeleteControls.tsx]]
- [[_COMMUNITY_Session|Session]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_brain-frontend|brain-frontend]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_FinalConfirmDeleteModal.tsx|FinalConfirmDeleteModal.tsx]]
- [[_COMMUNITY_next.config.mjs|next.config.mjs]]
- [[_COMMUNITY_ProfessionalsSection.tsx|ProfessionalsSection.tsx]]
- [[_COMMUNITY_PlanCheckoutCta.tsx|PlanCheckoutCta.tsx]]
- [[_COMMUNITY_modals.tsx|modals.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
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
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_resumo.ts|resumo.ts]]
- [[_COMMUNITY_PrecheckBillingSection.tsx|PrecheckBillingSection.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_RestartButton.tsx|RestartButton.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_hub-mapping.ts|hub-mapping.ts]]
- [[_COMMUNITY_MessagesSection.tsx|MessagesSection.tsx]]
- [[_COMMUNITY_DashHeader.tsx|DashHeader.tsx]]
- [[_COMMUNITY_seen.ts|seen.ts]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 38 edges
2. `usePortalGuard()` - 29 edges
3. `Session` - 28 edges
4. `BrandIcon()` - 24 edges
5. `clearSession()` - 21 edges
6. `apiFetch()` - 20 edges
7. `Icon()` - 18 edges
8. `ManageApiError` - 17 edges
9. `hubFetch()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `UsersPage()` --calls--> `useAuthGuard()`  [EXTRACTED]
  app/(SignIn)/users/page.tsx → lib/useAuthGuard.ts
- `loadTrialDays()` --calls--> `getCheckoutTrialDays()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts
- `PatientCard()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts
- `PatientCard()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts

## Import Cycles
- None detected.

## Communities (82 total, 8 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.04
Nodes (54): RestartButton(), RestartButtonProps, AdminAnamnesisList, AdminMetricsClinic, AdminMetricsDoctor, AdminMetricsSatisfaction, AdminMetricsTimelinePoint, AdminMetricsTotals (+46 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.09
Nodes (13): metadata, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times, ThemeToggle() (+5 more)

### Community 2 - "page.tsx"
Cohesion: 0.20
Nodes (9): CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar, Entrega 1 — `/secretaria/configuracao` (hub design system), Entrega 2 — `/doctor/perfil` "Configuração da secretaria" (portal design system), Invalidated hypothesis (carried over from a prior round, re-confirmed this round), Pendências / follow-ups, Reuse vs. duplication (asked for explicitly — see report for the same summary), Shared client layer — `lib/secretaria-hub.ts`, Tested (+1 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.20
Nodes (8): AnamnesesInner(), AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), AnamnesisDetail, getAnamnesis()

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.22
Nodes (10): closedWeek(), SecretariaConfigSection(), AgendaPage(), baseStyle, HubNotice(), HubNoticeProps, warnStyle, Btn() (+2 more)

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.09
Nodes (33): RETRY_DELAYS_MS, UseSecretariaHubResult, getSecretariaHubToken(), AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentWire (+25 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (11): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+3 more)

### Community 7 - "ui.tsx"
Cohesion: 0.07
Nodes (31): AdminAnamnesesInner(), AdminInboundPage(), AdminLayout(), STATUS_TONE, statusBadge(), TenantDetail(), TenantsInner(), ROLE_LABEL (+23 more)

### Community 8 - "page.tsx"
Cohesion: 0.09
Nodes (9): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps, confirmPasswordReset(), requestPasswordReset() (+1 more)

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.20
Nodes (11): ADMIN_NAV, BackToAdminButton(), BrandIcon(), PortalNavItem, PortalShell(), PortalShellProps, useImpersonation(), DOCTOR_NAV (+3 more)

### Community 10 - "page.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.21
Nodes (13): AdminDashboardPage(), Stats, adminGetEntitlements(), adminListAnamneses(), adminListDemoRequests(), adminListTenants(), adminListUsers(), listAnamneses() (+5 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.33
Nodes (5): Modal(), ModalProps, InviteProfessionalModal(), InviteProfessionalModalProps, createProfessionalInvite()

### Community 15 - "data.ts"
Cohesion: 0.08
Nodes (20): SecretariaWordmark(), SecretariaWordmarkProps, timeInputStyle, WEEKDAYS, ProfessionalsSection(), ProfessionalsSectionProps, RosterActionError, applyWireBusinessHours() (+12 more)

### Community 16 - "page.tsx"
Cohesion: 0.15
Nodes (15): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, listDemoRequests() (+7 more)

### Community 17 - "page.tsx"
Cohesion: 0.09
Nodes (33): durationMinutes(), formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal(), isWithinLastDays(), isWithinNextWeek(), matchesSearch() (+25 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.17
Nodes (9): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CToggle(), CToggleProps, DayConfig, Prefs (+1 more)

### Community 19 - "page.tsx"
Cohesion: 0.18
Nodes (9): BrandFooter(), BrandFooterProps, Reveal(), RevealProps, PRICING, PricingPlan, PricingPlanKey, FAQ_ITEMS (+1 more)

### Community 20 - "modals.tsx"
Cohesion: 0.16
Nodes (11): FacebookPageStep(), FacebookPageStepProps, OPTIONS, OPTIONS, PriorApiStep(), PriorApiStepProps, RadioOption, RadioPillGroup() (+3 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.22
Nodes (4): SetPasswordForm(), SetPasswordFormProps, ViewState, setPassword()

### Community 22 - "icons.tsx"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.12
Nodes (17): BrandIconProps, FILLED, IconName, PATHS, Faq(), FaqItem, FaqProps, Phone() (+9 more)

### Community 24 - "api.ts"
Cohesion: 0.10
Nodes (31): ROLE_LABEL, RoleOption, PROFILE_OPTIONS, apiFetch(), createUser(), deletePatients(), getSummary(), listSummaries() (+23 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 26 - "page.tsx"
Cohesion: 0.16
Nodes (12): GoogleGlyph(), GoogleSection(), GoogleSectionProps, PostConsultSection(), PostConsultSectionProps, DEFAULT_PIX_DEPOSIT, EMPTY_PROFESSIONAL_PROFILE, GcalState (+4 more)

### Community 27 - "page.tsx"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 28 - "hub-mapping.ts"
Cohesion: 0.10
Nodes (28): AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireGcal(), applyWireInsurances(), applyWireMessages(), applyWirePixDeposit(), applyWirePostConsult() (+20 more)

### Community 29 - "page.tsx"
Cohesion: 0.20
Nodes (12): PatientCard(), MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips(), buildTailSections(), SummaryContent() (+4 more)

### Community 30 - "page.tsx"
Cohesion: 0.15
Nodes (19): CheckoutSucessoInner(), renderView(), ViewState, decodeJwtPayload(), doRefresh(), enterDoctorMode(), exchangeInviteToken(), exchangeOnboardingToken() (+11 more)

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.14
Nodes (15): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS, TestWindowExplainerStepProps, OPTIONS (+7 more)

### Community 33 - "PortalShell.tsx"
Cohesion: 0.22
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "page.tsx"
Cohesion: 0.11
Nodes (19): DrawerProps, CToast(), CToastProps, NAV, NavItem, SideNav(), SideNavProps, ApptStatus (+11 more)

### Community 35 - "page.tsx"
Cohesion: 0.22
Nodes (8): DURATION_OPTIONS, RequirementRowProps, ServiceCard(), ServiceCardProps, ServicesSection(), ServicesSectionProps, Requirement, Service

### Community 36 - "manage-api.test.ts"
Cohesion: 0.18
Nodes (10): 1. Transição Modo médico ⇄ Admin agora é simétrica (botão, não faixa), 2. "Anamneses (PreCheck)" → "Anamneses", 3. "Configurações" → "Configurações secretarIA" (com o IA estilizado), 4. Uma única Header em toda tela de médico + lockup do produto, CHECKPOINT — Header unificada + lockup de produto + renomeações de nomenclatura, Decisão de layout a confirmar com o usuário, Mapeamento tela → lockup, Outros ajustes de layout (+2 more)

### Community 37 - "PatientImages.tsx"
Cohesion: 0.16
Nodes (12): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStep(), SummaryStepProps, USAGE_LABEL, isPrecheckPlan(), PURCHASABLE_PLANS (+4 more)

### Community 38 - "CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI"
Cohesion: 0.20
Nodes (9): Also in this working tree this session (different round — not touched here), CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI, Closing an open question from the prior round, `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens"), Pendências / follow-ups, Tested, Update 2026-08-02 — trio consolidated to [Agendar] [Gerenciar consulta] [Outro], What changed (+1 more)

### Community 39 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.11
Nodes (11): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, BrandGlyph(), BrandGlyphProps (+3 more)

### Community 41 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.22
Nodes (6): DeleteControlsProps, PatientCardProps, STATUS_CLASS, TrashIcon(), TrashIconProps, Alert

### Community 43 - "Session"
Cohesion: 0.08
Nodes (24): ActivateButton(), ActivateButtonProps, PauseToggles(), PauseTogglesProps, NODES, rankOf(), StateTimeline(), ATTEMPT_RESULT_LABEL (+16 more)

### Community 44 - "page.tsx"
Cohesion: 0.20
Nodes (11): fmtHours(), MetricsPage(), PeriodKey, PERIODS, SCORE_LABELS, UsersPage(), getMe(), getMetricsOverview() (+3 more)

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

### Community 57 - "ProfessionalsSection.tsx"
Cohesion: 0.14
Nodes (15): AddressFields(), AddressFieldsProps, ContextSection(), ContextSectionProps, NumberFieldProps, PixSection(), PixSectionProps, Section() (+7 more)

### Community 58 - "PlanCheckoutCta.tsx"
Cohesion: 0.20
Nodes (12): CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps, isPurchaseGated() (+4 more)

### Community 59 - "modals.tsx"
Cohesion: 0.12
Nodes (21): BLOCK_REASONS, BlockModal(), CANCEL_REASONS, CancelModal(), clinicDisplay(), MessagePreview(), NewApptModal(), RescheduleModal() (+13 more)

### Community 60 - "page.tsx"
Cohesion: 0.14
Nodes (13): Accessibility, Browser verification (dev server, 2026-08-01), CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half), Components, Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons), Door 2 — `cadastro/page.tsx` (the signup wizard route), Pendências, Pricing screen (+5 more)

### Community 61 - "modals.tsx"
Cohesion: 0.20
Nodes (13): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+5 more)

### Community 62 - "CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role)"
Cohesion: 0.14
Nodes (13): A) Painel admin — 4 abas, `app/(site)/admin/anamneses/page.tsx` (NOVA), `app/(site)/admin/inbound/page.tsx` (REFORMADA — não é mais um proxy PreCheck), `app/(site)/admin/metrics/page.tsx` (NOVA), `app/(site)/admin/users/page.tsx`, B) Taxonomia de papéis (contrato com o brain-api), CHECKPOINT — Admin: abas PreCheck (Anamneses/Métricas/Inbound) + taxonomia de papéis (Role), Componentes de apoio (+5 more)

### Community 63 - "types.ts"
Cohesion: 0.11
Nodes (21): ADDON_COPY, AddonsStep(), AddonsStepProps, CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL (+13 more)

### Community 64 - "CadastroWizard.tsx"
Cohesion: 0.47
Nodes (5): formatDate(), isConnected(), ReativarPage(), getTestWindow(), TestWindow

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.11
Nodes (17): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashPaginationProps, SIZE_OPTIONS, DashSearch(), DashSearchProps (+9 more)

### Community 66 - "page.tsx"
Cohesion: 0.18
Nodes (8): AdminAnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), AdminAnamnesis, AdminAnamnesisDetail, adminGetAnamnesis()

### Community 67 - "apiFetch"
Cohesion: 0.27
Nodes (7): PortalHeader(), PortalHeaderProps, PreCheckWordmark(), PreCheckWordmarkProps, PortalProduct, PRODUCT_NAME, ProductLockup()

### Community 68 - "AddonsStep.tsx"
Cohesion: 0.13
Nodes (12): CadastroWizard(), resolvePlan(), CadastroInner(), errorStyle, LaunchWaitlistForm(), LaunchWaitlistFormProps, cardStyle, closeButtonStyle (+4 more)

### Community 69 - "CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users"
Cohesion: 0.22
Nodes (8): CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users, Frente A — Cobrança do PreCheck, Frente B — port de `/metrics` e `/users`, `DashNav` sensível a papel, Notas para o operador, O que mudou, Pendências / follow-ups, Reuso vs. duplicação, Testado

### Community 70 - "PatientImages.tsx"
Cohesion: 0.36
Nodes (6): Lightbox(), MediaThumb(), useSignedUrl(), getMediaUrl(), getSummaryMedia(), SummaryMediaItem

### Community 71 - "page.tsx"
Cohesion: 0.50
Nodes (4): asText(), buildAntro(), buildClassicSections(), buildSoapSections()

### Community 72 - "resumo.ts"
Cohesion: 0.60
Nodes (3): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap()

### Community 73 - "PrecheckBillingSection.tsx"
Cohesion: 0.21
Nodes (10): formatDatePtBR(), PrecheckBillingSection(), PrecheckBillingSectionProps, BRL_FORMATTER, formatBRLFromCents(), NO_BREAK_SPACE, createPrecheckTopupSession(), getPrecheckBillingUsage() (+2 more)

### Community 74 - "page.tsx"
Cohesion: 0.18
Nodes (11): formatDate(), INTEREST_LABEL, LeadCard(), NEXT_ACTIONS, STATUS_FILTERS, STATUS_LABEL, STATUS_TONE, StatusFilter (+3 more)

### Community 75 - "page.tsx"
Cohesion: 0.15
Nodes (14): AdminMetricsInner(), AdminMetricsPage(), fmtHours(), fmtScore(), PeriodKey, PERIODS, SCORE_LABELS, isSessionExpired() (+6 more)

### Community 76 - "RestartButton.tsx"
Cohesion: 0.40
Nodes (3): HubModule, mockHubTokenMint(), mockResponse()

### Community 77 - "page.tsx"
Cohesion: 0.33
Nodes (6): EmbeddedSignupOutcome, FacebookLoginResponse, loadFacebookSdk(), runEmbeddedSignup(), TRUSTED_MESSAGE_ORIGINS, Window

### Community 78 - "hub-mapping.ts"
Cohesion: 0.16
Nodes (16): blockReasonFromSummary(), currentWeekIsoRange(), formatBlockSummary(), isBlockSummary(), mapHubEventsToAppts(), mapHubEventToAppt(), mondayOfWeek(), slotToIsoRange() (+8 more)

### Community 82 - "MessagesSection.tsx"
Cohesion: 0.20
Nodes (8): CSelect(), CSelectProps, FIXED_GREETING_BUTTONS, LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps, Messages, inputStyle

## Knowledge Gaps
- **400 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+395 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Session` to `manage-api.ts`, `PortalShell.tsx`, `page.tsx`, `usePortalGuard`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `BrandGlyph.tsx`, `PrecheckBillingSection.tsx`, `page.tsx`, `page.tsx`, `RestartButton.tsx`, `page.tsx`, `data.ts`, `page.tsx`, `PlanCheckoutCta.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `BrandIcon.tsx` to `CadastroWizard.tsx`, `ui.tsx`, `BrandGlyph.tsx`, `PrecheckBillingSection.tsx`, `page.tsx`, `GoogleSection.tsx`, `Session`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `types.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `types.ts` to `manage-api.ts`, `PatientImages.tsx`, `secretaria-hub.ts`, `ui.tsx`, `BrandGlyph.tsx`, `PrecheckBillingSection.tsx`, `BrandIcon.tsx`, `page.tsx`, `PlanCheckoutCta.tsx`, `PlanCheckoutCta.tsx`, `page.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _400 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.03896103896103896 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08669354838709678 - nodes in this community are weakly interconnected._
- **Should `secretaria-hub.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09243697478991597 - nodes in this community are weakly interconnected._