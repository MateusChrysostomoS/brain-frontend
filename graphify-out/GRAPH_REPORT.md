# Graph Report - brain-frontend  (2026-08-01)

## Corpus Check
- 180 files · ~124,385 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1164 nodes · 2325 edges · 77 communities (70 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06f396c4`
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
- [[_COMMUNITY_SummaryStep.tsx|SummaryStep.tsx]]
- [[_COMMUNITY_FacebookPageStep.tsx|FacebookPageStep.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_modals.tsx|modals.tsx]]
- [[_COMMUNITY_PrecheckBillingSection.tsx|PrecheckBillingSection.tsx]]
- [[_COMMUNITY_types.ts|types.ts]]
- [[_COMMUNITY_CadastroWizard.tsx|CadastroWizard.tsx]]
- [[_COMMUNITY_useSecretariaHub.ts|useSecretariaHub.ts]]
- [[_COMMUNITY_pricing.ts|pricing.ts]]
- [[_COMMUNITY_apiFetch|apiFetch]]
- [[_COMMUNITY_AddonsStep.tsx|AddonsStep.tsx]]
- [[_COMMUNITY_CHECKPOINT — Portal de cobrança do PreCheck + port de metrics e users|CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users]]
- [[_COMMUNITY_PatientImages.tsx|PatientImages.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_resumo.ts|resumo.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_launch.ts|launch.ts]]
- [[_COMMUNITY_DashHeader.tsx|DashHeader.tsx]]
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
- `CheckoutSucessoInner()` --calls--> `exchangeOnboardingToken()`  [EXTRACTED]
  app/(site)/checkout/sucesso/page.tsx → lib/manage-api.ts

## Import Cycles
- None detected.

## Communities (77 total, 7 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.05
Nodes (53): AdminTenantDeleteResult, AdminUserCreate, AnamnesisList, CheckoutConfig, CheckoutConfigAddon, decodeJwtPayload(), DemoRequestConfirmation, DemoRequestPayload (+45 more)

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
Cohesion: 0.12
Nodes (18): closedWeek(), SecretariaConfigSection(), timeInputStyle, WEEKDAYS, AgendaPage(), applyWireBusinessHours(), applyWireProfessionalProfile(), hhmmToMinutes() (+10 more)

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.09
Nodes (32): getSecretariaHubToken(), AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentTypeWire, AppointmentWire, BlockCreatePayload (+24 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (10): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+2 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (33): AdminDashboardPage(), Stats, DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, AdminInboundPage() (+25 more)

### Community 8 - "page.tsx"
Cohesion: 0.10
Nodes (6): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.18
Nodes (11): ADMIN_NAV, BrandIcon(), PortalNavItem, PortalShell(), PortalShellProps, DOCTOR_NAV, DoctorNavItem, getImpersonation() (+3 more)

### Community 10 - "page.tsx"
Cohesion: 0.12
Nodes (13): BrandFooter(), BrandFooterProps, ContactForm(), ContactFormProps, FormState, PRICING, PricingPlan, PricingPlanKey (+5 more)

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.29
Nodes (11): adminGetEntitlements(), adminGetInbound(), adminListDemoRequests(), adminListTenants(), adminListUsers(), listAnamneses(), listDoctorAppointments(), listDoctorPatients() (+3 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.14
Nodes (11): ROLE_LABEL, ROLE_TONE, Modal(), ModalProps, InviteProfessionalModal(), InviteProfessionalModalProps, adminCreateUser(), AdminTenant (+3 more)

### Community 15 - "data.ts"
Cohesion: 0.09
Nodes (20): GoogleGlyph(), GoogleSection(), GoogleSectionProps, PostConsultSection(), PostConsultSectionProps, ProfessionalsSection(), ProfessionalsSectionProps, RosterActionError (+12 more)

### Community 16 - "page.tsx"
Cohesion: 0.19
Nodes (12): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, clearToken() (+4 more)

### Community 17 - "page.tsx"
Cohesion: 0.07
Nodes (38): formatDatePtBR(), PrecheckBillingSection(), durationMinutes(), formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal(), isWithinLastDays() (+30 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.15
Nodes (7): STATUS_TONE, statusBadge(), TenantDetail(), adminDeleteTenant(), adminGetTenant(), adminPatchEntitlements(), AdminTenantDetail

### Community 19 - "page.tsx"
Cohesion: 0.19
Nodes (14): blockReasonFromSummary(), currentWeekIsoRange(), formatBlockSummary(), isBlockSummary(), mapHubEventsToAppts(), mapHubEventToAppt(), mondayOfWeek(), slotToIsoRange() (+6 more)

### Community 20 - "modals.tsx"
Cohesion: 0.13
Nodes (17): DrawerProps, CToast(), CToastProps, ApptStatus, firstLetter(), STATUS_META, baseStyle, HubNoticeProps (+9 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.22
Nodes (4): SetPasswordForm(), SetPasswordFormProps, ViewState, setPassword()

### Community 22 - "icons.tsx"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.16
Nodes (11): Faq(), FaqItem, FaqProps, PriceCard(), PriceCardProps, Reveal(), RevealProps, FAQ_ITEMS (+3 more)

### Community 24 - "api.ts"
Cohesion: 0.11
Nodes (17): AdminUserListResponse, BulkDeleteResponse, ClinicStats, DemoRequestCreatePayload, DemoRequestListResponse, DoctorStats, LoginResponse, MediaUrlResponse (+9 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 26 - "page.tsx"
Cohesion: 0.15
Nodes (13): AddressFields(), AddressFieldsProps, ContextSection(), ContextSectionProps, NumberFieldProps, PixSection(), PixSectionProps, ToggleRow() (+5 more)

### Community 27 - "page.tsx"
Cohesion: 0.13
Nodes (13): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, setToken(), coerceAddons() (+5 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.09
Nodes (30): FIXED_GREETING_BUTTONS, LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps, AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireGcal() (+22 more)

### Community 29 - "page.tsx"
Cohesion: 0.17
Nodes (13): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips() (+5 more)

### Community 30 - "page.tsx"
Cohesion: 0.15
Nodes (11): CheckoutSucessoInner(), renderView(), ViewState, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps, CatalogAddonId, createCheckoutSession() (+3 more)

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.28
Nodes (8): CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, catalogRequiresWhatsappCoexistence(), getCheckoutConfig(), getCheckoutTrialDays(), isCheckoutConfigAddon()

### Community 33 - "PortalShell.tsx"
Cohesion: 0.22
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "page.tsx"
Cohesion: 0.17
Nodes (12): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS, TestWindowExplainerStep(), TestWindowExplainerStepProps (+4 more)

### Community 35 - "page.tsx"
Cohesion: 0.20
Nodes (13): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+5 more)

### Community 36 - "manage-api.test.ts"
Cohesion: 0.33
Nodes (6): EmbeddedSignupOutcome, FacebookLoginResponse, loadFacebookSdk(), runEmbeddedSignup(), TRUSTED_MESSAGE_ORIGINS, Window

### Community 37 - "PatientImages.tsx"
Cohesion: 0.13
Nodes (13): Anamnese, APPT_TYPES, CLINIC, CURRENT_USER, DURATIONS, StatusTone, WEEK_DAYS, WeekDay (+5 more)

### Community 38 - "CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI"
Cohesion: 0.20
Nodes (9): Also in this working tree this session (different round — not touched here), CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI, Closing an open question from the prior round, `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens"), Pendências / follow-ups, Tested, Update 2026-08-02 — trio consolidated to [Agendar] [Gerenciar consulta] [Outro], What changed (+1 more)

### Community 39 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.14
Nodes (5): CadastroWizard(), resolvePlan(), CadastroInner(), BrandGlyph(), BrandGlyphProps

### Community 41 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.40
Nodes (3): DeleteControlsProps, TrashIcon(), TrashIconProps

### Community 43 - "Session"
Cohesion: 0.08
Nodes (24): ActivateButton(), ActivateButtonProps, PauseToggles(), PauseTogglesProps, NODES, rankOf(), StateTimeline(), ATTEMPT_RESULT_LABEL (+16 more)

### Community 44 - "page.tsx"
Cohesion: 0.17
Nodes (14): fmtHours(), MetricsPage(), PeriodKey, PERIODS, SCORE_LABELS, ROLE_LABEL, RoleOption, UsersPage() (+6 more)

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

### Community 57 - "ProfessionalsSection.tsx"
Cohesion: 0.09
Nodes (24): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CSelect(), CSelectProps, CToggle(), CToggleProps (+16 more)

### Community 58 - "SummaryStep.tsx"
Cohesion: 0.16
Nodes (12): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStep(), SummaryStepProps, USAGE_LABEL, isPrecheckPlan(), PURCHASABLE_PLANS (+4 more)

### Community 59 - "FacebookPageStep.tsx"
Cohesion: 0.12
Nodes (15): FacebookPageStep(), FacebookPageStepProps, OPTIONS, OPTIONS, PriorApiStep(), PriorApiStepProps, RadioOption, RadioPillGroup() (+7 more)

### Community 60 - "page.tsx"
Cohesion: 0.17
Nodes (11): Accessibility, Browser verification (dev server, 2026-08-01), CHECKPOINT — Launch waitlist (pre-launch buy gate, frontend half), Components, Door 1 — `_components/PlanCheckoutCta.tsx` (the buy buttons), Door 2 — `cadastro/page.tsx` (the signup wizard route), Pendências, Pricing screen — unchanged (+3 more)

### Community 61 - "modals.tsx"
Cohesion: 0.18
Nodes (13): BLOCK_REASONS, BlockModal(), CANCEL_REASONS, CancelModal(), clinicDisplay(), MessagePreview(), NewApptModal(), RescheduleModal() (+5 more)

### Community 62 - "PrecheckBillingSection.tsx"
Cohesion: 0.33
Nodes (5): PrecheckBillingSectionProps, createPrecheckTopupSession(), getPrecheckBillingUsage(), PrecheckBillingUsage, upgradePrecheckPlan()

### Community 63 - "types.ts"
Cohesion: 0.13
Nodes (19): ADDON_COPY, AddonsStep(), AddonsStepProps, CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL (+11 more)

### Community 64 - "CadastroWizard.tsx"
Cohesion: 0.24
Nodes (9): RestartButton(), RestartButtonProps, formatDate(), isConnected(), ReativarPage(), getTestWindow(), restartTestWindow(), RestartTestWindowResult (+1 more)

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.11
Nodes (18): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashPaginationProps, SIZE_OPTIONS, DashSearch(), DashSearchProps (+10 more)

### Community 66 - "pricing.ts"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 67 - "apiFetch"
Cohesion: 0.18
Nodes (18): PROFILE_OPTIONS, apiFetch(), confirmPasswordReset(), createUser(), deletePatients(), getMetricsOverview(), getSummary(), getSummaryMedia() (+10 more)

### Community 68 - "AddonsStep.tsx"
Cohesion: 0.20
Nodes (9): errorStyle, LaunchWaitlistForm(), LaunchWaitlistFormProps, cardStyle, closeButtonStyle, LaunchWaitlistModal(), LaunchWaitlistModalProps, overlayStyle (+1 more)

### Community 69 - "CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users"
Cohesion: 0.22
Nodes (8): CHECKPOINT — Portal de cobrança do PreCheck + port de /metrics e /users, Frente A — Cobrança do PreCheck, Frente B — port de `/metrics` e `/users`, `DashNav` sensível a papel, Notas para o operador, O que mudou, Pendências / follow-ups, Reuso vs. duplicação, Testado

### Community 70 - "PatientImages.tsx"
Cohesion: 0.43
Nodes (5): Lightbox(), MediaThumb(), useSignedUrl(), getMediaUrl(), SummaryMediaItem

### Community 71 - "page.tsx"
Cohesion: 0.40
Nodes (6): asText(), buildAntro(), buildClassicSections(), buildSoapSections(), buildTailSections(), SummaryContent()

### Community 72 - "resumo.ts"
Cohesion: 0.47
Nodes (4): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap(), Summary

### Community 73 - "page.tsx"
Cohesion: 0.22
Nodes (8): BrandIconProps, FILLED, IconName, PATHS, Phone(), PhoneFloatCard, PhoneProps, WaStep

### Community 74 - "launch.ts"
Cohesion: 0.33
Nodes (5): NAV, NavItem, SideNav(), SideNavProps, IconName

### Community 76 - "RestartButton.tsx"
Cohesion: 0.40
Nodes (3): HubModule, mockHubTokenMint(), mockResponse()

## Knowledge Gaps
- **366 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+361 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Session` to `CadastroWizard.tsx`, `manage-api.ts`, `PortalShell.tsx`, `usePortalGuard`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `RestartButton.tsx`, `page.tsx`, `data.ts`, `page.tsx`, `calendar.tsx`, `modals.tsx`, `PlanCheckoutCta.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `page.tsx` to `CadastroWizard.tsx`, `manage-api.ts`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `BrandIcon.tsx`, `page.tsx`, `PlanCheckoutCta.tsx`, `SummaryStep.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`, `types.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `BrandGlyph()` connect `BrandGlyph.tsx` to `CadastroWizard.tsx`, `page.tsx`, `pricing.ts`, `BrandIcon.tsx`, `page.tsx`, `Session`, `PlanCheckoutCta.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _366 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0496156533892383 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08669354838709678 - nodes in this community are weakly interconnected._
- **Should `AvailabilitySection.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._