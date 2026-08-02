# Graph Report - brain-frontend  (2026-08-01)

## Corpus Check
- 177 files · ~120,695 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1142 nodes · 2296 edges · 76 communities (70 shown, 6 thin omitted)
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

## Communities (76 total, 6 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.04
Nodes (63): RestartButton(), RestartButtonProps, AdminTenantDeleteResult, AdminUserCreate, AnamnesisList, CheckoutConfig, CheckoutConfigAddon, clearSession() (+55 more)

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
Cohesion: 0.10
Nodes (21): closedWeek(), SecretariaConfigSection(), timeInputStyle, WEEKDAYS, AgendaPage(), applyWireBusinessHours(), applyWireProfessionalProfile(), hhmmToMinutes() (+13 more)

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.09
Nodes (34): getSecretariaHubToken(), AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentTypeWire, AppointmentWire, BlockCreatePayload (+26 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (11): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+3 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (30): DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, AdminInboundPage(), STATUS_LABEL, STATUS_TONE (+22 more)

### Community 8 - "page.tsx"
Cohesion: 0.09
Nodes (9): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps, confirmPasswordReset(), requestPasswordReset() (+1 more)

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.12
Nodes (18): ADMIN_NAV, BrandIcon(), BrandIconProps, FILLED, IconName, PATHS, Phone(), PhoneFloatCard (+10 more)

### Community 10 - "page.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.16
Nodes (16): AdminDashboardPage(), Stats, adminGetEntitlements(), adminGetInbound(), adminGetTenant(), adminListDemoRequests(), adminListTenants(), adminListUsers() (+8 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.10
Nodes (13): STATUS_TONE, statusBadge(), TenantDetail(), ROLE_LABEL, ROLE_TONE, Modal(), ModalProps, adminCreateUser() (+5 more)

### Community 15 - "data.ts"
Cohesion: 0.11
Nodes (20): GoogleGlyph(), GoogleSection(), GoogleSectionProps, FIXED_GREETING_BUTTONS, LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps, PostConsultSection() (+12 more)

### Community 16 - "page.tsx"
Cohesion: 0.18
Nodes (13): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, listDemoRequests() (+5 more)

### Community 17 - "page.tsx"
Cohesion: 0.09
Nodes (33): durationMinutes(), formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal(), isWithinLastDays(), isWithinNextWeek(), matchesSearch() (+25 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.33
Nodes (3): CadastroWizard(), resolvePlan(), CadastroInner()

### Community 19 - "page.tsx"
Cohesion: 0.18
Nodes (16): Drawer(), blockReasonFromSummary(), currentWeekIsoRange(), formatBlockSummary(), isBlockSummary(), mapHubEventsToAppts(), mapHubEventToAppt(), mondayOfWeek() (+8 more)

### Community 20 - "modals.tsx"
Cohesion: 0.14
Nodes (15): DrawerProps, NAV, NavItem, SideNav(), SideNavProps, ApptStatus, firstLetter(), Avatar() (+7 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.22
Nodes (4): SetPasswordForm(), SetPasswordFormProps, ViewState, setPassword()

### Community 22 - "icons.tsx"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.09
Nodes (23): BrandFooter(), BrandFooterProps, Faq(), FaqItem, FaqProps, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps (+15 more)

### Community 24 - "api.ts"
Cohesion: 0.14
Nodes (22): AdminUser, AdminUserListResponse, BulkDeleteResponse, ClinicInfo, ClinicStats, DemoRequest, DemoRequestCreatePayload, DemoRequestListResponse (+14 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.40
Nodes (4): CHECKPOINT — secretarIA Agenda mock purge (de-demo round), Pendências / follow-ups, Tested, What changed

### Community 26 - "page.tsx"
Cohesion: 0.11
Nodes (18): AddressFields(), AddressFieldsProps, ContextSection(), ContextSectionProps, InviteProfessionalModal(), InviteProfessionalModalProps, ProfessionalsSection(), ProfessionalsSectionProps (+10 more)

### Community 27 - "page.tsx"
Cohesion: 0.14
Nodes (12): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, setToken(), createPortalSession() (+4 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.11
Nodes (26): AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireGcal(), applyWireInsurances(), applyWireMessages(), applyWirePixDeposit(), applyWirePostConsult() (+18 more)

### Community 29 - "page.tsx"
Cohesion: 0.17
Nodes (13): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips() (+5 more)

### Community 30 - "page.tsx"
Cohesion: 0.31
Nodes (5): CheckoutSucessoInner(), renderView(), ViewState, getOnboardingStatus(), getSession()

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.38
Nodes (6): CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, catalogRequiresWhatsappCoexistence(), getCheckoutTrialDays()

### Community 33 - "PortalShell.tsx"
Cohesion: 0.22
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "page.tsx"
Cohesion: 0.16
Nodes (13): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, OPTIONS, PriorApiStep(), PriorApiStepProps, TestWindowExplainerStep(), TestWindowExplainerStepProps (+5 more)

### Community 35 - "page.tsx"
Cohesion: 0.20
Nodes (14): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+6 more)

### Community 36 - "manage-api.test.ts"
Cohesion: 0.33
Nodes (6): EmbeddedSignupOutcome, FacebookLoginResponse, loadFacebookSdk(), runEmbeddedSignup(), TRUSTED_MESSAGE_ORIGINS, Window

### Community 37 - "PatientImages.tsx"
Cohesion: 0.13
Nodes (13): Anamnese, APPT_TYPES, CLINIC, CURRENT_USER, DURATIONS, STATUS_META, StatusTone, WeekDay (+5 more)

### Community 38 - "CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI"
Cohesion: 0.20
Nodes (9): Also in this working tree this session (different round — not touched here), CHECKPOINT — Fixed greeting buttons (WhatsApp saudação) UI, Closing an open question from the prior round, `configuracao/components/MessagesSection.tsx` (Section 02 "Mensagens"), Pendências / follow-ups, Tested, Update 2026-08-02 — trio consolidated to [Agendar] [Gerenciar consulta] [Outro], What changed (+1 more)

### Community 39 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.17
Nodes (7): formatDate(), isConnected(), ReativarPage(), BrandGlyph(), BrandGlyphProps, getTestWindow(), TestWindow

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
Cohesion: 0.10
Nodes (18): CSelect(), CSelectProps, CToast(), CToastProps, NumberFieldProps, PixSection(), PixSectionProps, DURATION_OPTIONS (+10 more)

### Community 58 - "SummaryStep.tsx"
Cohesion: 0.16
Nodes (12): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStep(), SummaryStepProps, USAGE_LABEL, isPrecheckPlan(), PURCHASABLE_PLANS (+4 more)

### Community 59 - "FacebookPageStep.tsx"
Cohesion: 0.16
Nodes (11): FacebookPageStep(), FacebookPageStepProps, OPTIONS, RadioOption, RadioPillGroup(), RadioPillGroupProps, OPTIONS, WhatsappUsageStep() (+3 more)

### Community 60 - "page.tsx"
Cohesion: 0.14
Nodes (11): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CToggle(), CToggleProps, ToggleRow(), ToggleRowProps (+3 more)

### Community 61 - "modals.tsx"
Cohesion: 0.18
Nodes (9): BLOCK_REASONS, BlockModal(), CANCEL_REASONS, CancelModal(), clinicDisplay(), MessagePreview(), RescheduleModal(), TIME_OPTS (+1 more)

### Community 62 - "PrecheckBillingSection.tsx"
Cohesion: 0.21
Nodes (10): formatDatePtBR(), PrecheckBillingSection(), PrecheckBillingSectionProps, BRL_FORMATTER, formatBRLFromCents(), NO_BREAK_SPACE, createPrecheckTopupSession(), getPrecheckBillingUsage() (+2 more)

### Community 63 - "types.ts"
Cohesion: 0.20
Nodes (9): ContactStep(), ContactStepProps, honeypotStyle, ContactFields, EMPTY_ANSWERS, EMPTY_CONTACT, SignupAddonId, StepId (+1 more)

### Community 64 - "CadastroWizard.tsx"
Cohesion: 0.24
Nodes (8): CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL, PageCreationGuide(), PageCreationGuideProps, STEPS

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.09
Nodes (19): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashHeaderProps, DashPaginationProps, SIZE_OPTIONS, DashSearch() (+11 more)

### Community 66 - "pricing.ts"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 67 - "apiFetch"
Cohesion: 0.20
Nodes (8): PROFILE_OPTIONS, apiFetch(), deletePatients(), getSummary(), listSummaries(), login(), patchSummaryStatus(), submitDemoRequest()

### Community 68 - "AddonsStep.tsx"
Cohesion: 0.22
Nodes (6): ADDON_COPY, AddonsStep(), AddonsStepProps, SIGNUP_ADDON_IDS, ManageApiError, updateSignupIntentCatalog()

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
Cohesion: 0.40
Nodes (3): HubModule, mockHubTokenMint(), mockResponse()

## Knowledge Gaps
- **352 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+347 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Session` to `manage-api.ts`, `PortalShell.tsx`, `usePortalGuard`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `RestartButton.tsx`, `page.tsx`, `page.tsx`, `PlanCheckoutCta.tsx`, `page.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `BrandIcon.tsx` to `pricing.ts`, `AddonsStep.tsx`, `ui.tsx`, `BrandGlyph.tsx`, `page.tsx`, `GoogleSection.tsx`, `Session`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `AddonsStep.tsx` to `manage-api.ts`, `CadastroWizard.tsx`, `page.tsx`, `AvailabilitySection.tsx`, `secretaria-hub.ts`, `ui.tsx`, `BrandIcon.tsx`, `page.tsx`, `PlanCheckoutCta.tsx`, `page.tsx`, `SummaryStep.tsx`, `page.tsx`, `PrecheckBillingSection.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _352 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.04278846153846154 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08669354838709678 - nodes in this community are weakly interconnected._
- **Should `AvailabilitySection.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._