# Graph Report - brain-frontend  (2026-07-22)

## Corpus Check
- 162 files · ~101,829 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1033 nodes · 2068 edges · 79 communities (72 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f3c3812`
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
- [[_COMMUNITY_BrandHeader.tsx|BrandHeader.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_manage-api.test.ts|manage-api.test.ts]]
- [[_COMMUNITY_PatientImages.tsx|PatientImages.tsx]]
- [[_COMMUNITY_SummaryContent|SummaryContent]]
- [[_COMMUNITY_Toast.tsx|Toast.tsx]]
- [[_COMMUNITY_BrandGlyph.tsx|BrandGlyph.tsx]]
- [[_COMMUNITY_Manual verification — billing, refresh tokens & secretarIA hub handoff|Manual verification — billing, refresh tokens & secretarIA hub handoff]]
- [[_COMMUNITY_DeleteControls.tsx|DeleteControls.tsx]]
- [[_COMMUNITY_Session|Session]]
- [[_COMMUNITY_resumo.ts|resumo.ts]]
- [[_COMMUNITY_brain-frontend|brain-frontend]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_FinalConfirmDeleteModal.tsx|FinalConfirmDeleteModal.tsx]]
- [[_COMMUNITY_next.config.mjs|next.config.mjs]]
- [[_COMMUNITY_ProfessionalsSection.tsx|ProfessionalsSection.tsx]]
- [[_COMMUNITY_WizardShell.tsx|WizardShell.tsx]]
- [[_COMMUNITY_PriorApiStep.tsx|PriorApiStep.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Session|Session]]
- [[_COMMUNITY_ServiceCard.tsx|ServiceCard.tsx]]
- [[_COMMUNITY_sign-out.test.ts|sign-out.test.ts]]
- [[_COMMUNITY_ContactForm.tsx|ContactForm.tsx]]
- [[_COMMUNITY_useSecretariaHub.ts|useSecretariaHub.ts]]
- [[_COMMUNITY_DashHeader.tsx|DashHeader.tsx]]
- [[_COMMUNITY_usePortalGuard|usePortalGuard]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_doRefresh|doRefresh]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_AddonsStep.tsx|AddonsStep.tsx]]
- [[_COMMUNITY_useSecretariaHub.ts|useSecretariaHub.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_HubNotice.tsx|HubNotice.tsx]]
- [[_COMMUNITY_RestartButton.tsx|RestartButton.tsx]]
- [[_COMMUNITY_PriorApiStep.tsx|PriorApiStep.tsx]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 34 edges
2. `usePortalGuard()` - 25 edges
3. `BrandIcon()` - 23 edges
4. `Session` - 22 edges
5. `Icon()` - 19 edges
6. `clearSession()` - 17 edges
7. `apiFetch()` - 16 edges
8. `ManageApiError` - 16 edges
9. `hubFetch()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `SummaryContent()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/summary/components/SummaryDetail.tsx → lib/format.ts
- `CheckoutSucessoInner()` --calls--> `exchangeOnboardingToken()`  [EXTRACTED]
  app/(site)/checkout/sucesso/page.tsx → lib/manage-api.ts
- `useSecretariaHub()` --calls--> `hubConfigured()`  [EXTRACTED]
  app/(site)/secretaria/_shared/useSecretariaHub.ts → lib/secretaria-hub.ts
- `PatientCard()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts

## Import Cycles
- None detected.

## Communities (79 total, 7 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.05
Nodes (40): AdminTenantDeleteResult, AdminUserCreate, AnamnesisList, CheckoutConfig, CheckoutConfigAddon, coerceAddons(), coerceLimits(), DemoRequestConfirmation (+32 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.08
Nodes (14): metadata, ADMIN_TABS, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times (+6 more)

### Community 2 - "page.tsx"
Cohesion: 0.19
Nodes (9): DashPaginationProps, SIZE_OPTIONS, PillOption, PillRow(), PillRowProps, getStoredPageSize(), PAGE_SIZE_OPTIONS, PageSize (+1 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.20
Nodes (8): AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), Anamnesis, AnamnesisDetail, getAnamnesis()

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.20
Nodes (7): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, DayConfig, Prefs, HelpTip()

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.11
Nodes (29): getSecretariaHubToken(), AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentWire, BlockCreatePayload, CachedToken (+21 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (11): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+3 more)

### Community 7 - "ui.tsx"
Cohesion: 0.22
Nodes (8): BrandIconProps, FILLED, IconName, PATHS, Phone(), PhoneFloatCard, PhoneProps, WaStep

### Community 8 - "page.tsx"
Cohesion: 0.09
Nodes (9): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps, confirmPasswordReset(), requestPasswordReset() (+1 more)

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.17
Nodes (11): ADMIN_NAV, AdminLayout(), BrandIcon(), PortalNavItem, PortalShell(), PortalShellProps, DOCTOR_NAV, DoctorLayout() (+3 more)

### Community 10 - "page.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.20
Nodes (11): DrawerProps, ApptStatus, firstLetter(), STATUS_META, Avatar(), Btn(), BtnSize, BtnVariant (+3 more)

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
Cohesion: 0.16
Nodes (15): CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL, ContactStep(), ContactStepProps, honeypotStyle (+7 more)

### Community 16 - "page.tsx"
Cohesion: 0.20
Nodes (9): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, listDemoRequests() (+1 more)

### Community 17 - "page.tsx"
Cohesion: 0.09
Nodes (33): durationMinutes(), formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal(), isWithinLastDays(), isWithinNextWeek(), matchesSearch() (+25 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.22
Nodes (6): CadastroWizard(), PURCHASABLE_PLANS, ResolvedPlan, resolvePlan(), CadastroInner(), CatalogPlanId

### Community 19 - "page.tsx"
Cohesion: 0.14
Nodes (19): BLOCK_REASONS, BlockModal(), CANCEL_REASONS, CancelModal(), clinicDisplay(), MessagePreview(), NewApptModal(), RescheduleModal() (+11 more)

### Community 20 - "modals.tsx"
Cohesion: 0.20
Nodes (13): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+5 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.20
Nodes (8): ADDON_SUMMARY_LABEL, FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStep(), SummaryStepProps, USAGE_LABEL, attachSignupIntake(), createPublicCheckoutSession()

### Community 22 - "icons.tsx"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.09
Nodes (23): BrandFooter(), BrandFooterProps, Faq(), FaqItem, FaqProps, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps (+15 more)

### Community 24 - "api.ts"
Cohesion: 0.14
Nodes (21): PROFILE_OPTIONS, apiFetch(), deletePatients(), getMe(), getSummary(), listSummaries(), login(), patchSummaryStatus() (+13 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.17
Nodes (13): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips() (+5 more)

### Community 26 - "page.tsx"
Cohesion: 0.22
Nodes (4): SetPasswordForm(), SetPasswordFormProps, ViewState, setPassword()

### Community 27 - "page.tsx"
Cohesion: 0.29
Nodes (7): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, createPortalSession()

### Community 28 - "hub-mapping.ts"
Cohesion: 0.08
Nodes (31): GoogleSection(), ServicesSection(), AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireBusinessHours(), applyWireInsurances(), applyWireMessages() (+23 more)

### Community 29 - "page.tsx"
Cohesion: 0.15
Nodes (7): STATUS_TONE, statusBadge(), TenantDetail(), adminDeleteTenant(), adminGetTenant(), adminPatchEntitlements(), AdminTenantDetail

### Community 30 - "page.tsx"
Cohesion: 0.21
Nodes (9): CheckoutSucessoInner(), renderView(), ViewState, enterDoctorMode(), exitDoctorMode(), fetchImpersonationDoctor(), getOnboardingStatus(), getSession() (+1 more)

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.21
Nodes (13): adminGetEntitlements(), adminListDemoRequests(), adminListTenants(), adminListUsers(), adminPatchDemoRequest(), createProfessionalInvite(), createSelfProfessional(), getDoctorProfessionals() (+5 more)

### Community 33 - "BrandHeader.tsx"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 34 - "page.tsx"
Cohesion: 0.23
Nodes (9): DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS, StepActions(), StepHeading() (+1 more)

### Community 35 - "page.tsx"
Cohesion: 0.17
Nodes (9): ROLE_LABEL, ROLE_TONE, UsersPage(), Modal(), ModalProps, adminCreateUser(), AdminTenant, AdminUser (+1 more)

### Community 36 - "manage-api.test.ts"
Cohesion: 0.14
Nodes (5): b64url(), makeJwt(), ManageApiModule, ManageApiModule, SignOutModule

### Community 37 - "PatientImages.tsx"
Cohesion: 0.36
Nodes (6): Lightbox(), MediaThumb(), useSignedUrl(), getMediaUrl(), getSummaryMedia(), SummaryMediaItem

### Community 38 - "SummaryContent"
Cohesion: 0.40
Nodes (6): asText(), buildAntro(), buildClassicSections(), buildSoapSections(), buildTailSections(), SummaryContent()

### Community 39 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.15
Nodes (5): BrandGlyph(), BrandGlyphProps, setToken(), Entitlements, getPrecheckSsoToken()

### Community 41 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.40
Nodes (3): DeleteControlsProps, TrashIcon(), TrashIconProps

### Community 43 - "Session"
Cohesion: 0.11
Nodes (18): PauseToggles(), PauseTogglesProps, NODES, rankOf(), StateTimeline(), ATTEMPT_RESULT_LABEL, BLOCKER_COPY, formatDateTime() (+10 more)

### Community 44 - "resumo.ts"
Cohesion: 0.60
Nodes (3): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap()

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

### Community 57 - "ProfessionalsSection.tsx"
Cohesion: 0.14
Nodes (15): AddressFields(), AddressFieldsProps, ContextSection(), ContextSectionProps, InviteProfessionalModal(), InviteProfessionalModalProps, ProfessionalsSection(), ProfessionalsSectionProps (+7 more)

### Community 58 - "WizardShell.tsx"
Cohesion: 0.28
Nodes (8): CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, catalogRequiresWhatsappCoexistence(), getCheckoutConfig(), getCheckoutTrialDays(), isCheckoutConfigAddon()

### Community 59 - "PriorApiStep.tsx"
Cohesion: 0.22
Nodes (6): CLINIC, CURRENT_USER, Header(), ROLE_LABEL, Theme, getMe()

### Community 60 - "page.tsx"
Cohesion: 0.10
Nodes (17): CSelect(), CSelectProps, CToggle(), CToggleProps, NumberFieldProps, PixSection(), PixSectionProps, DURATION_OPTIONS (+9 more)

### Community 61 - "Session"
Cohesion: 0.16
Nodes (15): blockReasonFromSummary(), currentWeekIsoRange(), formatBlockSummary(), isBlockSummary(), mapHubEventsToAppts(), mapHubEventToAppt(), mondayOfWeek(), slotToIsoRange() (+7 more)

### Community 62 - "ServiceCard.tsx"
Cohesion: 0.14
Nodes (13): CToast(), CToastProps, GoogleGlyph(), GoogleSectionProps, Section(), SectionProps, ServicesSectionProps, NAV (+5 more)

### Community 63 - "sign-out.test.ts"
Cohesion: 0.16
Nodes (12): LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps, PostConsultSection(), PostConsultSectionProps, DEFAULT_PIX_DEPOSIT, EMPTY_PROFESSIONAL_PROFILE, GcalState (+4 more)

### Community 64 - "ContactForm.tsx"
Cohesion: 0.22
Nodes (9): ActivateButton(), ActivateButtonProps, EmbeddedSignupOutcome, FacebookLoginResponse, loadFacebookSdk(), runEmbeddedSignup(), TRUSTED_MESSAGE_ORIGINS, Window (+1 more)

### Community 65 - "useSecretariaHub.ts"
Cohesion: 0.14
Nodes (13): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashSearch(), DashSearchProps, ConfirmDeleteModalProps, clearToken() (+5 more)

### Community 67 - "usePortalGuard"
Cohesion: 0.26
Nodes (8): AdminDashboardPage(), Stats, TenantsInner(), isSessionExpired(), usePortalGuard(), AnamnesesInner(), DoctorPatientsPage(), clearSession()

### Community 68 - "page.tsx"
Cohesion: 0.20
Nodes (8): DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, describeApiError(), AdminDemoRequest, DemoRequestStatus

### Community 69 - "page.tsx"
Cohesion: 0.22
Nodes (7): AdminInboundPage(), STATUS_LABEL, STATUS_TONE, BadgeTone, ProductMark(), adminGetInbound(), PrecheckInbound

### Community 70 - "doRefresh"
Cohesion: 0.29
Nodes (10): decodeJwtPayload(), doRefresh(), exchangeInviteToken(), exchangeOnboardingToken(), login(), rawManageFetch(), readProfessionalIdClaim(), redirectToLogin() (+2 more)

### Community 71 - "page.tsx"
Cohesion: 0.31
Nodes (7): formatDate(), isConnected(), ReativarPage(), getTestWindow(), logout(), TestWindow, signOut()

### Community 72 - "AddonsStep.tsx"
Cohesion: 0.22
Nodes (6): ADDON_COPY, AddonsStep(), AddonsStepProps, SignupAddonId, ManageApiError, updateSignupIntentCatalog()

### Community 73 - "useSecretariaHub.ts"
Cohesion: 0.29
Nodes (6): AgendaPage(), ConfiguracaoPage(), demoWeek(), RETRY_DELAYS_MS, useSecretariaHub(), UseSecretariaHubResult

### Community 74 - "page.tsx"
Cohesion: 0.33
Nodes (4): StatusBadge(), DoctorDashboardPage(), DoctorMe, getDoctorMe()

### Community 75 - "HubNotice.tsx"
Cohesion: 0.40
Nodes (5): baseStyle, HubNotice(), HubNoticeProps, warnStyle, hubConfigured()

### Community 76 - "RestartButton.tsx"
Cohesion: 0.40
Nodes (4): RestartButton(), RestartButtonProps, restartTestWindow(), RestartTestWindowResult

### Community 77 - "PriorApiStep.tsx"
Cohesion: 0.40
Nodes (4): OPTIONS, PriorApiStep(), PriorApiStepProps, SignupIntakePriorApi

## Knowledge Gaps
- **305 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+300 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `ProfessionalsSection.tsx` to `ContactForm.tsx`, `manage-api.ts`, `page.tsx`, `page.tsx`, `usePortalGuard`, `usePortalGuard`, `secretaria-hub.ts`, `BrandGlyph.tsx`, `useSecretariaHub.ts`, `manage-api.test.ts`, `Session`, `RestartButton.tsx`, `HubNotice.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `AddonsStep.tsx` to `manage-api.ts`, `usePortalGuard`, `secretaria-hub.ts`, `BrandGlyph.tsx`, `BrandIcon.tsx`, `useSecretariaHub.ts`, `RestartButton.tsx`, `data.ts`, `PlanCheckoutCta.tsx`, `page.tsx`, `ProfessionalsSection.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `BrandIcon.tsx` to `BrandHeader.tsx`, `usePortalGuard`, `page.tsx`, `BrandGlyph.tsx`, `AddonsStep.tsx`, `ui.tsx`, `Session`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _305 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05121951219512195 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `secretaria-hub.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1103448275862069 - nodes in this community are weakly interconnected._