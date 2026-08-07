# Graph Report - brain-frontend  (2026-08-02)

## Corpus Check
- 180 files · ~125,905 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1167 nodes · 2336 edges · 70 communities (62 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3d75795`
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
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_modals.tsx|modals.tsx]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_CadastroWizard.tsx|CadastroWizard.tsx]]
- [[_COMMUNITY_useSecretariaHub.ts|useSecretariaHub.ts]]
- [[_COMMUNITY_apiFetch|apiFetch]]
- [[_COMMUNITY_AddonsStep.tsx|AddonsStep.tsx]]
- [[_COMMUNITY_CHECKPOINT — Portal de cobrança do PreCheck + port de metrics e users|CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users]]
- [[_COMMUNITY_PatientImages.tsx|PatientImages.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_resumo.ts|resumo.ts]]
- [[_COMMUNITY_RestartButton.tsx|RestartButton.tsx]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 36 edges
2. `usePortalGuard()` - 27 edges
3. `Session` - 26 edges
4. `BrandIcon()` - 24 edges
5. `apiFetch()` - 20 edges
6. `Icon()` - 19 edges
7. `clearSession()` - 19 edges
8. `ManageApiError` - 17 edges
9. `hubFetch()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `SummaryContent()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/summary/components/SummaryDetail.tsx → lib/format.ts
- `UsersPage()` --calls--> `useAuthGuard()`  [EXTRACTED]
  app/(SignIn)/users/page.tsx → lib/useAuthGuard.ts
- `loadTrialDays()` --calls--> `getCheckoutTrialDays()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts
- `PatientCard()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts

## Import Cycles
- None detected.

## Communities (70 total, 8 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.05
Nodes (44): AdminTenantDeleteResult, AdminUserCreate, AnamnesisList, CheckoutConfig, CheckoutConfigAddon, coerceAddons(), coerceLimits(), DemoRequestConfirmation (+36 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.09
Nodes (13): metadata, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times, ThemeToggle() (+5 more)

### Community 2 - "page.tsx"
Cohesion: 0.20
Nodes (9): CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar, Entrega 1 — `/secretaria/configuracao` (hub design system), Entrega 2 — `/doctor/perfil` "Configuração da secretaria" (portal design system), Invalidated hypothesis (carried over from a prior round, re-confirmed this round), Pendências / follow-ups, Reuse vs. duplication (asked for explicitly — see report for the same summary), Shared client layer — `lib/secretaria-hub.ts`, Tested (+1 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.22
Nodes (7): AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), AnamnesisDetail, getAnamnesis()

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.18
Nodes (12): closedWeek(), SecretariaConfigSection(), AgendaPage(), baseStyle, HubNotice(), HubNoticeProps, warnStyle, Btn() (+4 more)

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.09
Nodes (34): getSecretariaHubToken(), AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentTypeWire, AppointmentWire, BlockCreatePayload (+26 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (11): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+3 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (31): AdminDashboardPage(), Stats, DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, AdminInboundPage() (+23 more)

### Community 8 - "page.tsx"
Cohesion: 0.09
Nodes (9): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps, confirmPasswordReset(), requestPasswordReset() (+1 more)

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.13
Nodes (16): ADMIN_NAV, AdminLayout(), BrandIcon(), BrandIconProps, FILLED, IconName, PATHS, PortalNavItem (+8 more)

### Community 10 - "page.tsx"
Cohesion: 0.15
Nodes (11): BrandFooter(), BrandFooterProps, PriceCard(), PriceCardProps, Reveal(), RevealProps, PRICING, PricingPlan (+3 more)

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.20
Nodes (14): adminDeleteTenant(), adminGetEntitlements(), adminGetTenant(), adminListDemoRequests(), adminListTenants(), adminListUsers(), adminPatchEntitlements(), listAnamneses() (+6 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.10
Nodes (13): STATUS_TONE, statusBadge(), TenantDetail(), ROLE_LABEL, ROLE_TONE, Modal(), ModalProps, ProductMark() (+5 more)

### Community 15 - "data.ts"
Cohesion: 0.16
Nodes (10): InviteProfessionalModal(), InviteProfessionalModalProps, ProfessionalsSection(), ProfessionalsSectionProps, RosterActionError, ProfessionalProfile, Field(), TextInput() (+2 more)

### Community 16 - "page.tsx"
Cohesion: 0.16
Nodes (14): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, listDemoRequests() (+6 more)

### Community 17 - "page.tsx"
Cohesion: 0.06
Nodes (43): formatDatePtBR(), PrecheckBillingSection(), PrecheckBillingSectionProps, durationMinutes(), formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal() (+35 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.15
Nodes (10): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CToggle(), CToggleProps, ToggleRow(), ToggleRowProps (+2 more)

### Community 19 - "page.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 20 - "modals.tsx"
Cohesion: 0.22
Nodes (8): DURATION_OPTIONS, RequirementRowProps, ServiceCard(), ServiceCardProps, ServicesSection(), ServicesSectionProps, Requirement, Service

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.12
Nodes (9): RestartButton(), RestartButtonProps, SetPasswordForm(), SetPasswordFormProps, ViewState, ManageApiError, restartTestWindow(), RestartTestWindowResult (+1 more)

### Community 22 - "icons.tsx"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.17
Nodes (11): Faq(), FaqItem, FaqProps, Phone(), PhoneFloatCard, PhoneProps, WaStep, FAQ_ITEMS (+3 more)

### Community 24 - "api.ts"
Cohesion: 0.14
Nodes (22): AdminUser, AdminUserListResponse, BulkDeleteResponse, ClinicInfo, ClinicStats, DemoRequest, DemoRequestCreatePayload, DemoRequestListResponse (+14 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 26 - "page.tsx"
Cohesion: 0.16
Nodes (13): AddressFields(), AddressFieldsProps, ContextSection(), ContextSectionProps, GoogleGlyph(), GoogleSection(), GoogleSectionProps, ClinicCtx (+5 more)

### Community 27 - "page.tsx"
Cohesion: 0.14
Nodes (13): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, ThemeToggle(), ThemeToggleProps (+5 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.07
Nodes (39): timeInputStyle, WEEKDAYS, AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireBusinessHours(), applyWireGcal(), applyWireInsurances() (+31 more)

### Community 29 - "page.tsx"
Cohesion: 0.17
Nodes (13): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips() (+5 more)

### Community 30 - "page.tsx"
Cohesion: 0.14
Nodes (18): CheckoutSucessoInner(), renderView(), ViewState, decodeJwtPayload(), doRefresh(), enterDoctorMode(), exchangeInviteToken(), exchangeOnboardingToken() (+10 more)

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.50
Nodes (4): NODES, rankOf(), StateTimeline(), OnboardingState

### Community 33 - "PortalShell.tsx"
Cohesion: 0.22
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "page.tsx"
Cohesion: 0.40
Nodes (4): OnboardingBanner(), STATE_LABEL, DoctorOnboarding, getDoctorOnboarding()

### Community 36 - "manage-api.test.ts"
Cohesion: 0.22
Nodes (9): ActivateButton(), ActivateButtonProps, EmbeddedSignupOutcome, FacebookLoginResponse, loadFacebookSdk(), runEmbeddedSignup(), TRUSTED_MESSAGE_ORIGINS, Window (+1 more)

### Community 38 - "CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI"
Cohesion: 0.20
Nodes (9): Also in this working tree this session (different round — not touched here), CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI, Closing an open question from the prior round, `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens"), Pendências / follow-ups, Tested, Update 2026-08-02 — trio consolidated to [Agendar] [Gerenciar consulta] [Outro], What changed (+1 more)

### Community 39 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.18
Nodes (5): BrandGlyph(), BrandGlyphProps, BrandHeader(), BrandHeaderProps, NavLink

### Community 41 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.40
Nodes (3): DeleteControlsProps, TrashIcon(), TrashIconProps

### Community 43 - "Session"
Cohesion: 0.18
Nodes (10): PauseToggles(), PauseTogglesProps, ATTEMPT_RESULT_LABEL, BLOCKER_COPY, formatDateTime(), MANUAL_ACTION_REASONS, OnboardingPage(), OnboardingBlockerReason (+2 more)

### Community 44 - "page.tsx"
Cohesion: 0.13
Nodes (20): fmtHours(), MetricsPage(), PeriodKey, PERIODS, SCORE_LABELS, ROLE_LABEL, RoleOption, UsersPage() (+12 more)

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

### Community 57 - "ProfessionalsSection.tsx"
Cohesion: 0.07
Nodes (31): CSelect(), CSelectProps, CToast(), CToastProps, FIXED_GREETING_BUTTONS, LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps (+23 more)

### Community 60 - "page.tsx"
Cohesion: 0.14
Nodes (13): Accessibility, Browser verification (dev server, 2026-08-01), CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half), Components, Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons), Door 2 — `cadastro/page.tsx` (the signup wizard route), Pendências, Pricing screen (+5 more)

### Community 61 - "modals.tsx"
Cohesion: 0.05
Nodes (58): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+50 more)

### Community 63 - "types.ts"
Cohesion: 0.05
Nodes (58): ADDON_COPY, AddonsStep(), AddonsStepProps, CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL (+50 more)

### Community 64 - "CadastroWizard.tsx"
Cohesion: 0.31
Nodes (7): formatDate(), isConnected(), ReativarPage(), getTestWindow(), logout(), TestWindow, signOut()

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.09
Nodes (19): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashHeaderProps, DashPaginationProps, SIZE_OPTIONS, DashSearch() (+11 more)

### Community 68 - "AddonsStep.tsx"
Cohesion: 0.09
Nodes (24): CadastroWizard(), resolvePlan(), CadastroInner(), CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, errorStyle (+16 more)

### Community 69 - "CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users"
Cohesion: 0.22
Nodes (8): CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users, Frente A — Cobrança do PreCheck, Frente B — port de `/metrics` e `/users`, `DashNav` sensível a papel, Notas para o operador, O que mudou, Pendências / follow-ups, Reuso vs. duplicação, Testado

### Community 70 - "PatientImages.tsx"
Cohesion: 0.36
Nodes (6): Lightbox(), MediaThumb(), useSignedUrl(), getMediaUrl(), getSummaryMedia(), SummaryMediaItem

### Community 71 - "page.tsx"
Cohesion: 0.40
Nodes (6): asText(), buildAntro(), buildClassicSections(), buildSoapSections(), buildTailSections(), SummaryContent()

### Community 72 - "resumo.ts"
Cohesion: 0.60
Nodes (3): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap()

### Community 76 - "RestartButton.tsx"
Cohesion: 0.33
Nodes (4): Session, HubModule, mockHubTokenMint(), mockResponse()

## Knowledge Gaps
- **367 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+362 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `RestartButton.tsx` to `manage-api.ts`, `PortalShell.tsx`, `page.tsx`, `usePortalGuard`, `manage-api.test.ts`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `page.tsx`, `Session`, `page.tsx`, `data.ts`, `page.tsx`, `PlanCheckoutCta.tsx`, `page.tsx`, `hub-mapping.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `BrandGlyph()` connect `BrandGlyph.tsx` to `CadastroWizard.tsx`, `AddonsStep.tsx`, `BrandIcon.tsx`, `page.tsx`, `Session`, `PlanCheckoutCta.tsx`, `page.tsx`, `page.tsx`, `types.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `PlanCheckoutCta.tsx` to `manage-api.ts`, `AddonsStep.tsx`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `BrandIcon.tsx`, `data.ts`, `page.tsx`, `page.tsx`, `page.tsx`, `types.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _367 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.047474747474747475 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08669354838709678 - nodes in this community are weakly interconnected._
- **Should `secretaria-hub.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0907563025210084 - nodes in this community are weakly interconnected._