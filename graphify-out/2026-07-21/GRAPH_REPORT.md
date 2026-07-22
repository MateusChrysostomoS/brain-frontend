# Graph Report - brain-frontend  (2026-07-21)

## Corpus Check
- 153 files · ~89,682 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 958 nodes · 1860 edges · 67 communities (58 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `16f55ae8`
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
- [[_COMMUNITY_DashHeader.tsx|DashHeader.tsx]]
- [[_COMMUNITY_ConfirmDeleteModal.tsx|ConfirmDeleteModal.tsx]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 28 edges
2. `usePortalGuard()` - 23 edges
3. `Session` - 19 edges
4. `BrandIcon()` - 18 edges
5. `Icon()` - 18 edges
6. `apiFetch()` - 16 edges
7. `clearSession()` - 16 edges
8. `hubFetch()` - 16 edges
9. `compilerOptions` - 16 edges
10. `ManageApiError` - 14 edges

## Surprising Connections (you probably didn't know these)
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `SummaryContent()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/summary/components/SummaryDetail.tsx → lib/format.ts
- `PatientCard()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts
- `PatientCard()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts
- `useSignedUrl()` --calls--> `getMediaUrl()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientImages.tsx → lib/api.ts

## Import Cycles
- None detected.

## Communities (67 total, 9 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.06
Nodes (37): AdminUserCreate, AnamnesisList, CheckoutConfig, coerceAddons(), coerceLimits(), DemoRequestConfirmation, DemoRequestPayload, DemoSource (+29 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.08
Nodes (14): metadata, ADMIN_TABS, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times (+6 more)

### Community 2 - "page.tsx"
Cohesion: 0.14
Nodes (15): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashPaginationProps, SIZE_OPTIONS, DashSearch(), DashSearchProps (+7 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.07
Nodes (32): AdminDashboardPage(), Stats, DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, AdminInboundPage() (+24 more)

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.17
Nodes (9): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CToggle(), CToggleProps, DayConfig, Prefs (+1 more)

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.07
Nodes (38): AgendaPage(), useSecretariaHub(), UseSecretariaHubResult, getSecretariaHubToken(), AddressWire, AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload (+30 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (10): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+2 more)

### Community 7 - "ui.tsx"
Cohesion: 0.16
Nodes (12): IconName, Faq(), FaqItem, FaqProps, Phone(), PhoneFloatCard, PhoneProps, WaStep (+4 more)

### Community 8 - "page.tsx"
Cohesion: 0.10
Nodes (6): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.20
Nodes (9): ADMIN_NAV, AdminLayout(), BrandIcon(), BrandIconProps, FILLED, PATHS, PortalNavItem, PortalShell() (+1 more)

### Community 10 - "page.tsx"
Cohesion: 0.18
Nodes (9): PriceCard(), PriceCardProps, Reveal(), RevealProps, PRICING, PricingPlan, PricingPlanKey, FAQ_ITEMS (+1 more)

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.24
Nodes (7): GoogleGlyph(), GoogleSection(), GoogleSectionProps, ToggleRow(), ToggleRowProps, GcalState, Btn()

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
Cohesion: 0.19
Nodes (10): CadastroWizardProps, PROGRESS, PROGRESS_LABEL, ContactStep(), WizardShell(), ContactFields, EMPTY_ANSWERS, EMPTY_CONTACT (+2 more)

### Community 16 - "page.tsx"
Cohesion: 0.14
Nodes (15): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, getMe() (+7 more)

### Community 17 - "page.tsx"
Cohesion: 0.12
Nodes (10): DotColor, PC_BADGE, PC_DATA, PcRow, PcStatus, SA_BADGE, SA_DATA, SaRow (+2 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.22
Nodes (6): CadastroWizard(), PURCHASABLE_PLANS, ResolvedPlan, resolvePlan(), CadastroInner(), CatalogPlanId

### Community 19 - "page.tsx"
Cohesion: 0.22
Nodes (6): ContactForm(), ContactFormProps, FormState, DemoProductInterest, DemoProfile, submitDemoRequest()

### Community 20 - "modals.tsx"
Cohesion: 0.05
Nodes (58): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+50 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.22
Nodes (7): FB_PAGE_LABEL, PRIOR_API_LABEL, SummaryStep(), SummaryStepProps, USAGE_LABEL, attachSignupIntake(), createPublicCheckoutSession()

### Community 22 - "icons.tsx"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 23 - "page.tsx"
Cohesion: 0.11
Nodes (21): CSelectProps, CToast(), CToastProps, LANGUAGE_OPTIONS, MessagesSection(), MessagesSectionProps, Section(), SectionProps (+13 more)

### Community 24 - "api.ts"
Cohesion: 0.16
Nodes (21): apiFetch(), confirmPasswordReset(), deletePatients(), getSummary(), listSummaries(), login(), patchSummaryStatus(), requestPasswordReset() (+13 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.17
Nodes (13): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips() (+5 more)

### Community 26 - "page.tsx"
Cohesion: 0.16
Nodes (16): CheckoutSucessoInner(), renderView(), ViewState, decodeJwtPayload(), doRefresh(), exchangeInviteToken(), exchangeOnboardingToken(), getOnboardingStatus() (+8 more)

### Community 27 - "page.tsx"
Cohesion: 0.20
Nodes (10): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, createPortalSession(), Entitlements (+2 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.10
Nodes (24): ContextSection(), AddressFieldsOfCtx, applyWireAddress(), applyWireAppointmentTypes(), applyWireBusinessHours(), applyWireInsurances(), applyWireMessages(), applyWireProfessionalProfile() (+16 more)

### Community 29 - "page.tsx"
Cohesion: 0.25
Nodes (7): DOCTOR_NAV, DoctorLayout(), DoctorNavItem, exitDoctorMode(), getDoctorMe(), getImpersonation(), ImpersonationMarker

### Community 30 - "page.tsx"
Cohesion: 0.20
Nodes (8): AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), Anamnesis, AnamnesisDetail, getAnamnesis()

### Community 31 - "apiFetch"
Cohesion: 0.11
Nodes (18): 1.1 Intake branches (each is its own pass), 1.2 Submit error branches, 1. Signup wizard (`/cadastro`), 2.1 State timeline, 2.2 Blocker copy (`blocker_reason`), 2.3 Success states, 2.4 Activate button — Embedded Signup, incl. the not-configured fallback, 2.5 Last-attempt line, pause toggles, banner label (+10 more)

### Community 32 - "page.tsx"
Cohesion: 0.21
Nodes (13): adminGetEntitlements(), adminGetInbound(), adminListDemoRequests(), adminListTenants(), adminListUsers(), adminPatchEntitlements(), createProfessionalInvite(), createSelfProfessional() (+5 more)

### Community 33 - "BrandHeader.tsx"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 34 - "page.tsx"
Cohesion: 0.19
Nodes (11): ContactStepProps, honeypotStyle, DedicatedNumberGuide(), DedicatedNumberGuideProps, STEPS, PageCreationGuide(), PageCreationGuideProps, STEPS (+3 more)

### Community 35 - "page.tsx"
Cohesion: 0.18
Nodes (8): ROLE_LABEL, ROLE_TONE, Modal(), ModalProps, adminCreateUser(), AdminTenant, AdminUser, Role

### Community 36 - "manage-api.test.ts"
Cohesion: 0.25
Nodes (3): b64url(), makeJwt(), ManageApiModule

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
Cohesion: 0.19
Nodes (4): BrandFooter(), BrandFooterProps, BrandGlyph(), BrandGlyphProps

### Community 41 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.40
Nodes (3): DeleteControlsProps, TrashIcon(), TrashIconProps

### Community 43 - "Session"
Cohesion: 0.07
Nodes (27): ActivateButton(), ActivateButtonProps, PauseToggles(), PauseTogglesProps, NODES, rankOf(), StateTimeline(), EmbeddedSignupOutcome (+19 more)

### Community 44 - "resumo.ts"
Cohesion: 0.47
Nodes (4): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap(), Summary

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

### Community 57 - "ProfessionalsSection.tsx"
Cohesion: 0.15
Nodes (14): AddressFields(), AddressFieldsProps, ContextSectionProps, InviteProfessionalModal(), InviteProfessionalModalProps, ProfessionalsSection(), ProfessionalsSectionProps, ClinicCtx (+6 more)

### Community 58 - "WizardShell.tsx"
Cohesion: 0.19
Nodes (11): CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, alertStyle, PlanCheckoutCta(), PlanCheckoutCtaProps, CatalogAddonId (+3 more)

### Community 59 - "PriorApiStep.tsx"
Cohesion: 0.40
Nodes (4): OPTIONS, PriorApiStep(), PriorApiStepProps, SignupIntakePriorApi

### Community 60 - "page.tsx"
Cohesion: 0.18
Nodes (5): SetPasswordForm(), SetPasswordFormProps, ViewState, ManageApiError, setPassword()

### Community 61 - "Session"
Cohesion: 0.40
Nodes (4): baseStyle, HubNotice(), HubNoticeProps, Session

### Community 62 - "ServiceCard.tsx"
Cohesion: 0.20
Nodes (9): CSelect(), DURATION_OPTIONS, RequirementRowProps, ServiceCard(), ServiceCardProps, ServicesSection(), ServicesSectionProps, Requirement (+1 more)

### Community 67 - "ConfirmDeleteModal.tsx"
Cohesion: 0.33
Nodes (3): ConfirmDeleteModalProps, getSeenIds(), markSeen()

## Knowledge Gaps
- **291 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+286 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Session` to `manage-api.ts`, `page.tsx`, `usePortalGuard`, `secretaria-hub.ts`, `manage-api.test.ts`, `Session`, `page.tsx`, `ProfessionalsSection.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `sign-out.test.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `page.tsx` to `manage-api.ts`, `usePortalGuard`, `WizardShell.tsx`, `secretaria-hub.ts`, `BrandIcon.tsx`, `data.ts`, `page.tsx`, `PlanCheckoutCta.tsx`, `ProfessionalsSection.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `BrandIcon.tsx` to `BrandHeader.tsx`, `usePortalGuard`, `ui.tsx`, `page.tsx`, `Session`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _291 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05689900426742532 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1383399209486166 - nodes in this community are weakly interconnected._