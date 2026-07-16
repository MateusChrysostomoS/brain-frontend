# Graph Report - brain-frontend  (2026-07-16)

## Corpus Check
- 126 files · ~71,854 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 769 nodes · 1462 edges · 57 communities (50 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bf162d1e`
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

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 22 edges
2. `usePortalGuard()` - 21 edges
3. `BrandIcon()` - 17 edges
4. `Icon()` - 16 edges
5. `apiFetch()` - 16 edges
6. `compilerOptions` - 16 edges
7. `clearSession()` - 15 edges
8. `Session` - 13 edges
9. `hubFetch()` - 13 edges
10. `ManageApiError` - 10 edges

## Surprising Connections (you probably didn't know these)
- `PatientCard()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `buildChips()` --calls--> `fmtBirth()`  [EXTRACTED]
  app/(SignIn)/summary/components/SummaryDetail.tsx → lib/format.ts
- `PatientCard()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/dashboard/components/PatientCard.tsx → lib/format.ts
- `useSignedUrl()` --calls--> `getMediaUrl()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientImages.tsx → lib/api.ts

## Import Cycles
- None detected.

## Communities (57 total, 7 thin omitted)

### Community 0 - "manage-api.ts"
Cohesion: 0.08
Nodes (36): adminCreateUser(), adminGetEntitlements(), adminGetTenant(), adminPatchDemoRequest(), AdminUserCreate, AnamnesisList, coerceAddons(), coerceLimits() (+28 more)

### Community 1 - "DashNav.tsx"
Cohesion: 0.08
Nodes (14): metadata, ADMIN_TABS, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times (+6 more)

### Community 2 - "page.tsx"
Cohesion: 0.09
Nodes (19): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashHeaderProps, DashPaginationProps, SIZE_OPTIONS, DashSearch() (+11 more)

### Community 3 - "usePortalGuard"
Cohesion: 0.11
Nodes (22): DemoRequestsPage(), INTEREST_LABEL, NEXT_ACTIONS, STATUS_LABEL, STATUS_TONE, AdminInboundPage(), STATUS_LABEL, STATUS_TONE (+14 more)

### Community 4 - "AvailabilitySection.tsx"
Cohesion: 0.11
Nodes (19): AvailabilitySection(), AvailabilitySectionProps, DayRowProps, TIME_LIST, CSelect(), CToggle(), CToggleProps, DURATION_OPTIONS (+11 more)

### Community 5 - "secretaria-hub.ts"
Cohesion: 0.11
Nodes (25): getSecretariaHubToken(), AppointmentCancelPayload, AppointmentCreatePayload, AppointmentReschedulePayload, AppointmentStatusWire, AppointmentWire, BlockCreatePayload, CachedToken (+17 more)

### Community 6 - "SummaryDetail.tsx"
Cohesion: 0.09
Nodes (10): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+2 more)

### Community 7 - "ui.tsx"
Cohesion: 0.12
Nodes (19): DrawerProps, CSelectProps, NAV, NavItem, SideNav(), SideNavProps, ApptStatus, firstLetter() (+11 more)

### Community 8 - "page.tsx"
Cohesion: 0.13
Nodes (7): AuthShell(), AuthShellProps, StepIndicator(), StepIndicatorProps, confirmPasswordReset(), requestPasswordReset(), verifyResetToken()

### Community 9 - "BrandIcon.tsx"
Cohesion: 0.13
Nodes (15): ADMIN_NAV, AdminLayout(), BrandIconProps, FILLED, IconName, PATHS, PortalNavItem, PortalShell() (+7 more)

### Community 10 - "page.tsx"
Cohesion: 0.11
Nodes (14): ContactForm(), ContactFormProps, FormState, PlanCheckoutCta(), Reveal(), RevealProps, PRICING, PricingPlan (+6 more)

### Community 11 - "GoogleSection.tsx"
Cohesion: 0.15
Nodes (15): AddressFields(), AddressFieldsProps, ContextSectionProps, GoogleGlyph(), GoogleSection(), GoogleSectionProps, Section(), SectionProps (+7 more)

### Community 12 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "page.tsx"
Cohesion: 0.15
Nodes (14): BrandIcon(), Faq(), FaqItem, FaqProps, Phone(), PhoneFloatCard, PhoneProps, WaStep (+6 more)

### Community 15 - "data.ts"
Cohesion: 0.12
Nodes (12): Anamnese, APPT_TYPES, CLINIC, CURRENT_USER, DURATIONS, SEED_APPTS, SEED_BLOCKS, StatusTone (+4 more)

### Community 16 - "page.tsx"
Cohesion: 0.15
Nodes (14): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, getMe() (+6 more)

### Community 17 - "page.tsx"
Cohesion: 0.12
Nodes (10): DotColor, PC_BADGE, PC_DATA, PcRow, PcStatus, SA_BADGE, SA_DATA, SaRow (+2 more)

### Community 18 - "calendar.tsx"
Cohesion: 0.18
Nodes (14): ApptBlock(), DayBlock(), DayView(), heightOf(), MONTH_GRID, MonthView(), NowLine(), toneOf() (+6 more)

### Community 19 - "page.tsx"
Cohesion: 0.18
Nodes (13): currentWeekIsoRange(), mapHubEventsToAppts(), mapHubEventToAppt(), mondayOfWeek(), slotToIsoRange(), ModalState, ToastState, ViewMode (+5 more)

### Community 20 - "modals.tsx"
Cohesion: 0.18
Nodes (13): BLOCK_REASONS, BlockModal(), CANCEL_REASONS, CancelModal(), EditApptModal(), MessagePreview(), NewApptModal(), RescheduleModal() (+5 more)

### Community 21 - "PlanCheckoutCta.tsx"
Cohesion: 0.13
Nodes (13): Modal(), ModalProps, alertStyle, EMPTY_FIELDS, honeypotStyle, PlanCheckoutCtaProps, SignupFields, CatalogAddonId (+5 more)

### Community 22 - "icons.tsx"
Cohesion: 0.15
Nodes (11): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+3 more)

### Community 23 - "page.tsx"
Cohesion: 0.17
Nodes (12): AgendaPage(), ContextSection(), CToast(), CToastProps, ConfiguracaoPage(), NAV_IDS, NavId, WD (+4 more)

### Community 24 - "api.ts"
Cohesion: 0.24
Nodes (13): BulkDeleteResponse, DemoRequest, DemoRequestCreatePayload, DemoRequestListResponse, LoginResponse, MediaUrlResponse, MessageResponse, Patient (+5 more)

### Community 25 - "PatientCard.tsx"
Cohesion: 0.19
Nodes (10): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, fmtBirth() (+2 more)

### Community 26 - "page.tsx"
Cohesion: 0.20
Nodes (10): CheckoutSucessoInner(), renderView(), ViewState, decodeJwtPayload(), enterDoctorMode(), exchangeOnboardingToken(), fetchImpersonationDoctor(), getOnboardingStatus() (+2 more)

### Community 27 - "page.tsx"
Cohesion: 0.19
Nodes (11): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, createPortalSession(), Entitlements (+3 more)

### Community 28 - "hub-mapping.ts"
Cohesion: 0.18
Nodes (10): applyWireAppointmentTypes(), applyWireBusinessHours(), buildConfigUpdatePayload(), LOCAL_TO_WIRE_DAY, toWireAppointmentTypes(), toWireBusinessHours(), WIRE_TO_LOCAL_DAY, AppointmentTypeWire (+2 more)

### Community 29 - "page.tsx"
Cohesion: 0.18
Nodes (6): STATUS_TONE, statusBadge(), TenantDetail(), ProductMark(), adminPatchEntitlements(), AdminTenantDetail

### Community 30 - "page.tsx"
Cohesion: 0.20
Nodes (8): AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), Anamnesis, AnamnesisDetail, getAnamnesis()

### Community 31 - "apiFetch"
Cohesion: 0.18
Nodes (9): PROFILE_OPTIONS, apiFetch(), deletePatients(), getSummary(), listSummaries(), login(), patchSummaryStatus(), submitDemoRequest() (+1 more)

### Community 32 - "page.tsx"
Cohesion: 0.24
Nodes (8): AdminDashboardPage(), Stats, adminGetInbound(), adminListDemoRequests(), adminListTenants(), adminListUsers(), listAnamneses(), pageQuery()

### Community 33 - "BrandHeader.tsx"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 35 - "page.tsx"
Cohesion: 0.22
Nodes (6): ROLE_LABEL, ROLE_TONE, describeApiError(), AdminTenant, AdminUser, Role

### Community 36 - "manage-api.test.ts"
Cohesion: 0.25
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 37 - "PatientImages.tsx"
Cohesion: 0.36
Nodes (6): Lightbox(), MediaThumb(), useSignedUrl(), getMediaUrl(), getSummaryMedia(), SummaryMediaItem

### Community 38 - "SummaryContent"
Cohesion: 0.32
Nodes (8): asText(), buildAntro(), buildChips(), buildClassicSections(), buildSoapSections(), buildTailSections(), SummaryContent(), fmtDate()

### Community 39 - "Toast.tsx"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 40 - "BrandGlyph.tsx"
Cohesion: 0.32
Nodes (4): BrandFooter(), BrandFooterProps, BrandGlyph(), BrandGlyphProps

### Community 41 - "Manual verification — billing, refresh tokens & secretarIA hub handoff"
Cohesion: 0.25
Nodes (7): 1. Refresh-token session lifecycle, 2. Billing (Stripe test mode), 3. secretarIA hub handoff, 4. Entitlement-aware gating, Environment, Manual verification — billing, refresh tokens & secretarIA hub handoff, What's actually live vs. demo, per action/field

### Community 42 - "DeleteControls.tsx"
Cohesion: 0.40
Nodes (3): DeleteControlsProps, TrashIcon(), TrashIconProps

### Community 43 - "Session"
Cohesion: 0.33
Nodes (3): Session, ManageApiModule, SignOutModule

### Community 44 - "resumo.ts"
Cohesion: 0.60
Nodes (3): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap()

### Community 45 - "brain-frontend"
Cohesion: 0.50
Nodes (3): brain-frontend, Documentação — manter em dia (obrigatório), graphify

## Knowledge Gaps
- **223 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+218 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Session` connect `Session` to `manage-api.ts`, `page.tsx`, `usePortalGuard`, `secretaria-hub.ts`, `manage-api.test.ts`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `ManageApiError` connect `PlanCheckoutCta.tsx` to `manage-api.ts`, `usePortalGuard`, `secretaria-hub.ts`, `BrandIcon.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `page.tsx` to `page.tsx`, `BrandHeader.tsx`, `usePortalGuard`, `BrandIcon.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _223 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `manage-api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07507507507507508 - nodes in this community are weakly interconnected._
- **Should `DashNav.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08901515151515152 - nodes in this community are weakly interconnected._