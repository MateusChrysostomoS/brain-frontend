# Graph Report - brain-frontend  (2026-08-01)

## Corpus Check
- 168 files · ~110,882 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1077 nodes · 2174 edges · 66 communities (60 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0caca3fe`
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
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_manage-api.test.ts|manage-api.test.ts]]
- [[_COMMUNITY_Toast.tsx|Toast.tsx]]
- [[_COMMUNITY_BrandGlyph.tsx|BrandGlyph.tsx]]
- [[_COMMUNITY_Manual verification — billing, refresh tokens & secretarIA hub handoff|Manual verification — billing, refresh tokens & secretarIA hub handoff]]
- [[_COMMUNITY_DeleteControls.tsx|DeleteControls.tsx]]
- [[_COMMUNITY_Session|Session]]
- [[_COMMUNITY_brain-frontend|brain-frontend]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_FinalConfirmDeleteModal.tsx|FinalConfirmDeleteModal.tsx]]
- [[_COMMUNITY_next.config.mjs|next.config.mjs]]
- [[_COMMUNITY_ProfessionalsSection.tsx|ProfessionalsSection.tsx]]
- [[_COMMUNITY_PriorApiStep.tsx|PriorApiStep.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Session|Session]]
- [[_COMMUNITY_ServiceCard.tsx|ServiceCard.tsx]]
- [[_COMMUNITY_sign-out.test.ts|sign-out.test.ts]]
- [[_COMMUNITY_ContactForm.tsx|ContactForm.tsx]]
- [[_COMMUNITY_useSecretariaHub.ts|useSecretariaHub.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_AddonsStep.tsx|AddonsStep.tsx]]
- [[_COMMUNITY_HubNotice.tsx|HubNotice.tsx]]
- [[_COMMUNITY_RestartButton.tsx|RestartButton.tsx]]
- [[_COMMUNITY_PriorApiStep.tsx|PriorApiStep.tsx]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 34 edges
2. `usePortalGuard()` - 27 edges
3. `Session` - 25 edges
4. `BrandIcon()` - 23 edges
5. `Icon()` - 19 edges
6. `clearSession()` - 18 edges
7. `hubFetch()` - 17 edges
8. `apiFetch()` - 16 edges
9. `ManageApiError` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `loadTrialDays()` --calls--> `getCheckoutTrialDays()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts
- `CheckoutSucessoInner()` --calls--> `exchangeOnboardingToken()`  [EXTRACTED]
  app/(site)/checkout/sucesso/page.tsx → lib/manage-api.ts
- `CheckoutSucessoInner()` --calls--> `saveSession()`  [EXTRACTED]
  app/(site)/checkout/sucesso/page.tsx → lib/manage-api.ts
- `PatientCard()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts

## Import Cycles
- None detected.

## Communities (66 total, 6 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.05
Nodes (55): AdminTenantDeleteResult, AdminUserCreate, AnamnesisList, CheckoutConfig, CheckoutConfigAddon, coerceAddons(), coerceLimits(), decodeJwtPayload() (+47 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.08
Nodes (14): metadata, ADMIN_TABS, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times (+6 more)

### Community 2 - "page.tsx"
Cohesion: 0.20
Nodes (9): CHECKPOINT — Meu Perfil (conclusão) + modos de integração Google Calendar, Entrega 1 — `/secretaria/configuracao` (hub design system), Entrega 2 — `/doctor/perfil` "Configuração da secretaria" (portal design system), Invalidated hypothesis (carried over from a prior round, re-confirmed this round), Pendências / follow-ups, Reuse vs. duplication (asked for explicitly — see report for the same summary), Shared client layer — `lib/secretaria-hub.ts`, Tested (+1 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.20
Nodes (8): AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), Anamnesis, AnamnesisDetail, getAnamnesis()

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.33
Nodes (5): GoogleGlyph(), GoogleSection(), GoogleSectionProps, GoogleCalendarMode, Segmented()

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.09
Nodes (35): getSecretariaHubToken(), AddressWire, AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentTypeWire, AppointmentWire (+27 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.07
Nodes (26): PatientCard(), ActionButton(), ActionButtonProps, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, QaItem (+18 more)

### Community 7 - "ui.tsx"
Cohesion: 0.20
Nodes (9): PanelMessageProps, BrandIconProps, FILLED, IconName, PATHS, Phone(), PhoneFloatCard, PhoneProps (+1 more)

### Community 8 - "page.tsx"
Cohesion: 0.10
Nodes (6): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.15
Nodes (13): ADMIN_NAV, AdminLayout(), BrandIcon(), PortalNavItem, PortalShell(), PortalShellProps, DOCTOR_NAV, DoctorLayout() (+5 more)

### Community 10 - "page.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.18
Nodes (12): DrawerProps, ApptStatus, firstLetter(), STATUS_META, Avatar(), Btn(), BtnSize, BtnVariant (+4 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.16
Nodes (11): FacebookPageStep(), FacebookPageStepProps, OPTIONS, RadioOption, RadioPillGroup(), RadioPillGroupProps, OPTIONS, WhatsappUsageStep() (+3 more)

### Community 15 - "data.ts"
Cohesion: 0.18
Nodes (14): CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL, ContactStep(), ContactStepProps, honeypotStyle (+6 more)

### Community 16 - "page.tsx"
Cohesion: 0.17
Nodes (13): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, clearToken() (+5 more)

### Community 17 - "page.tsx"
Cohesion: 0.10
Nodes (31): durationMinutes(), formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal(), isWithinLastDays(), isWithinNextWeek(), matchesSearch() (+23 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.24
Nodes (5): CadastroWizard(), PURCHASABLE_PLANS, ResolvedPlan, resolvePlan(), CadastroInner()

### Community 19 - "page.tsx"
Cohesion: 0.18
Nodes (13): BLOCK_REASONS, BlockModal(), CANCEL_REASONS, CancelModal(), clinicDisplay(), MessagePreview(), NewApptModal(), RescheduleModal() (+5 more)

### Community 20 - "modals.tsx"
Cohesion: 0.20
Nodes (13): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+5 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.15
Nodes (13): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStep(), SummaryStepProps, USAGE_LABEL, CheckoutTrialNotice(), CheckoutTrialNoticeProps (+5 more)

### Community 22 - "icons.tsx"
Cohesion: 0.12
Nodes (15): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+7 more)

### Community 23 - "page.tsx"
Cohesion: 0.09
Nodes (24): BrandFooter(), BrandFooterProps, Faq(), FaqItem, FaqProps, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps (+16 more)

### Community 24 - "api.ts"
Cohesion: 0.12
Nodes (26): PROFILE_OPTIONS, apiFetch(), confirmPasswordReset(), deletePatients(), getMe(), getSummary(), getSummaryMedia(), listDemoRequests() (+18 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 26 - "page.tsx"
Cohesion: 0.22
Nodes (4): SetPasswordForm(), SetPasswordFormProps, ViewState, setPassword()

### Community 27 - "page.tsx"
Cohesion: 0.14
Nodes (13): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, ThemeToggle(), ThemeToggleProps (+5 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.10
Nodes (32): AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireBusinessHours(), applyWireGcal(), applyWireInsurances(), applyWireMessages(), applyWirePixDeposit() (+24 more)

### Community 29 - "page.tsx"
Cohesion: 0.07
Nodes (34): DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, AdminInboundPage(), STATUS_LABEL, STATUS_TONE (+26 more)

### Community 30 - "page.tsx"
Cohesion: 0.31
Nodes (5): CheckoutSucessoInner(), renderView(), ViewState, getOnboardingStatus(), getSession()

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.14
Nodes (18): AdminDashboardPage(), Stats, adminDeleteTenant(), adminGetEntitlements(), adminGetTenant(), adminListDemoRequests(), adminListTenants(), adminListUsers() (+10 more)

### Community 34 - "page.tsx"
Cohesion: 0.17
Nodes (12): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS, TestWindowExplainerStep(), TestWindowExplainerStepProps (+4 more)

### Community 35 - "page.tsx"
Cohesion: 0.14
Nodes (11): ROLE_LABEL, ROLE_TONE, Modal(), ModalProps, InviteProfessionalModal(), InviteProfessionalModalProps, adminCreateUser(), AdminTenant (+3 more)

### Community 36 - "manage-api.test.ts"
Cohesion: 0.25
Nodes (3): b64url(), makeJwt(), ManageApiModule

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
Cohesion: 0.15
Nodes (10): DeleteControlsProps, PatientCardProps, STATUS_CLASS, TrashIcon(), TrashIconProps, buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap() (+2 more)

### Community 43 - "Session"
Cohesion: 0.19
Nodes (11): NODES, rankOf(), StateTimeline(), ATTEMPT_RESULT_LABEL, BLOCKER_COPY, formatDateTime(), MANUAL_ACTION_REASONS, OnboardingPage() (+3 more)

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

### Community 57 - "ProfessionalsSection.tsx"
Cohesion: 0.11
Nodes (20): AddressFields(), AddressFieldsProps, ContextSection(), ContextSectionProps, LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps, NumberFieldProps (+12 more)

### Community 59 - "PriorApiStep.tsx"
Cohesion: 0.13
Nodes (13): Anamnese, APPT_TYPES, CLINIC, CURRENT_USER, DURATIONS, StatusTone, WEEK_DAYS, WeekDay (+5 more)

### Community 60 - "page.tsx"
Cohesion: 0.11
Nodes (19): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CSelect(), CSelectProps, CToggle(), CToggleProps (+11 more)

### Community 61 - "Session"
Cohesion: 0.21
Nodes (13): blockReasonFromSummary(), currentWeekIsoRange(), formatBlockSummary(), isBlockSummary(), mapHubEventsToAppts(), mapHubEventToAppt(), mondayOfWeek(), slotToIsoRange() (+5 more)

### Community 62 - "ServiceCard.tsx"
Cohesion: 0.20
Nodes (8): CToast(), CToastProps, NAV, NavItem, SideNav(), SideNavProps, Icon(), IconName

### Community 63 - "sign-out.test.ts"
Cohesion: 0.10
Nodes (17): timeInputStyle, WEEKDAYS, ProfessionalsSection(), ProfessionalsSectionProps, RosterActionError, hhmmToMinutes(), minutesToHhmm(), EMPTY_PROFESSIONAL_PROFILE (+9 more)

### Community 64 - "ContactForm.tsx"
Cohesion: 0.14
Nodes (13): ActivateButton(), ActivateButtonProps, EmbeddedSignupOutcome, FacebookLoginResponse, loadFacebookSdk(), runEmbeddedSignup(), TRUSTED_MESSAGE_ORIGINS, Window (+5 more)

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.09
Nodes (19): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashHeaderProps, DashPaginationProps, SIZE_OPTIONS, DashSearch() (+11 more)

### Community 71 - "page.tsx"
Cohesion: 0.36
Nodes (6): formatDate(), isConnected(), ReativarPage(), logout(), TestWindow, signOut()

### Community 72 - "AddonsStep.tsx"
Cohesion: 0.25
Nodes (5): ADDON_COPY, AddonsStep(), AddonsStepProps, SignupAddonId, ManageApiError

### Community 75 - "HubNotice.tsx"
Cohesion: 0.19
Nodes (11): closedWeek(), SecretariaConfigSection(), AgendaPage(), baseStyle, HubNotice(), HubNoticeProps, warnStyle, RETRY_DELAYS_MS (+3 more)

### Community 76 - "RestartButton.tsx"
Cohesion: 0.10
Nodes (13): PauseToggles(), PauseTogglesProps, RestartButton(), RestartButtonProps, pauseOnboarding(), restartTestWindow(), RestartTestWindowResult, Session (+5 more)

### Community 77 - "PriorApiStep.tsx"
Cohesion: 0.40
Nodes (4): OPTIONS, PriorApiStep(), PriorApiStepProps, SignupIntakePriorApi

## Knowledge Gaps
- **324 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+319 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `RestartButton.tsx` to `ContactForm.tsx`, `manage-api.ts`, `page.tsx`, `usePortalGuard`, `secretaria-hub.ts`, `manage-api.test.ts`, `HubNotice.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `sign-out.test.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `AddonsStep.tsx` to `manage-api.ts`, `page.tsx`, `secretaria-hub.ts`, `BrandIcon.tsx`, `HubNotice.tsx`, `RestartButton.tsx`, `data.ts`, `PlanCheckoutCta.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `BrandIcon.tsx` to `page.tsx`, `ui.tsx`, `page.tsx`, `AddonsStep.tsx`, `BrandGlyph.tsx`, `Session`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _324 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.048701298701298704 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `secretaria-hub.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._