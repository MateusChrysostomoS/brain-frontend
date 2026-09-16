# Graph Report - .  (2026-09-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 924 nodes · 1788 edges · 60 communities (51 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76ee1ac8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 57|Community 57]]

## God Nodes (most connected - your core abstractions)
1. `manageFetch()` - 45 edges
2. `usePortalGuard()` - 29 edges
3. `BrandIcon()` - 25 edges
4. `Session` - 23 edges
5. `clearSession()` - 21 edges
6. `apiFetch()` - 20 edges
7. `ManageApiError` - 17 edges
8. `BrandGlyph()` - 16 edges
9. `compilerOptions` - 16 edges
10. `isSessionExpired()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `PatientHeader()` --calls--> `statusLabel()`  [EXTRACTED]
  app/(SignIn)/summary/components/PatientHeader.tsx → lib/format.ts
- `SummaryContent()` --calls--> `fmtDate()`  [EXTRACTED]
  app/(SignIn)/summary/components/SummaryDetail.tsx → lib/format.ts
- `UsersPage()` --calls--> `useAuthGuard()`  [EXTRACTED]
  app/(SignIn)/users/page.tsx → lib/useAuthGuard.ts
- `loadTrialDays()` --calls--> `getCheckoutTrialDays()`  [EXTRACTED]
  app/(site)/_components/CheckoutTrialNotice.tsx → lib/manage-api.ts
- `SecretariaAppLink()` --calls--> `secretariaAppUrl()`  [EXTRACTED]
  app/(site)/app/_components/SecretariaPanel.tsx → lib/secretaria-app.ts

## Import Cycles
- None detected.

## Communities (60 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (59): ADDON_COPY, AddonsStep(), AddonsStepProps, CadastroWizardProps, nextAfterEligibility(), nextStepId(), PROGRESS, PROGRESS_LABEL (+51 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (57): AdminAnamnesisList, AdminMetricsClinic, AdminMetricsDoctor, AdminMetricsSatisfaction, AdminMetricsTimelinePoint, AdminMetricsTotals, AdminTenantDeleteResult, AdminUserCreate (+49 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (29): ADMIN_NAV, SecretariaAppLink(), CalendarConnectedInner(), BackToAdminButton(), PortalHeader(), PortalHeaderProps, PortalNavItem, PortalShell() (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (26): BrandFooter(), BrandFooterProps, BrandGlyph(), BrandGlyphProps, ContactForm(), ContactFormProps, FormState, Faq() (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (30): ActivateButton(), ActivateButtonProps, PauseToggles(), PauseTogglesProps, NODES, rankOf(), StateTimeline(), classifySignupMessage() (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (20): DashFilters(), DashFiltersProps, DateFilter, StatusFilter, DashHeader(), DashHeaderProps, DashPaginationProps, SIZE_OPTIONS (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (10): AuthShell(), AuthShellProps, PasswordField(), PasswordFieldProps, StepIndicator(), StepIndicatorProps, confirmPasswordReset(), ManageApiError (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (24): CadastroWizard(), resolvePlan(), CadastroInner(), CheckoutTrialNotice(), CheckoutTrialNoticeProps, loadTrialDays(), noticeStyle, errorStyle (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (13): metadata, DashNavProps, ITEMS, LandingNav(), conversation, Msg, times, ThemeToggle() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (10): ActionButton(), ActionButtonProps, QaItem, QaList(), RISK_CLASS, SectionDef, SEX_LABEL, SummaryContentProps (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (17): AdminInboundPage(), formatDate(), INTEREST_LABEL, LeadCard(), NEXT_ACTIONS, STATUS_FILTERS, STATUS_LABEL, STATUS_TONE (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (18): PROFILE_OPTIONS, apiFetch(), confirmPasswordReset(), createUser(), deletePatients(), getMetricsOverview(), getSummary(), getSummaryMedia() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (19): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, @types/react-dom (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (10): STATUS_TONE, statusBadge(), TenantDetail(), Modal(), ModalProps, ProductMark(), adminDeleteTenant(), adminGetTenant() (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (12): ConfigGapBanner(), ConfigGapBannerProps, colleagueMessage(), ConfigGapNotice, ConfigGapProfessional, ConfigGapSession, dismissConfigGap(), findConfigGaps() (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (18): adminGetEntitlements(), adminListDemoRequests(), adminListTenants(), adminListUsers(), createProfessionalInvite(), createSecretaryInvite(), createSelfProfessional(), getMe() (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (17): AdminUserListResponse, BulkDeleteResponse, ClinicStats, DemoRequestCreatePayload, DemoRequestListResponse, DoctorStats, LoginResponse, MediaUrlResponse (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (13): PatientCard(), PatientCardProps, STATUS_CLASS, MetaChip, PatientHeader(), PatientHeaderProps, STATUS_CLASS, buildChips() (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (12): formatDate(), LeadCard(), LeadCardProps, STATUS_FILTERS, STATUS_LABEL, STATUS_NEXT, StatusKey, clearToken() (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (14): fmtHours(), MetricsPage(), PeriodKey, PERIODS, SCORE_LABELS, ROLE_LABEL, RoleOption, UsersPage() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (12): durationMinutes(), PanelMessage(), PanelMessageProps, PanelSkeleton(), Period, SecretariaRow(), STATUS_BADGE, STATUS_LABEL (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (10): AdminAnamnesesInner(), AdminAnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), AdminAnamnesis, AdminAnamnesisDetail (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (11): ROLE_LABEL, ROLE_TONE, UsersPage(), Notice(), NoticeProps, NoticeTone, TONE_ICON, adminCreateUser() (+3 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (10): TAG_LABEL, Tone, AlertCircleIcon(), AlertTriangleIcon(), CheckCircleIcon(), CheckIcon(), ChevronLeftIcon(), CopyIcon() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (11): AdminDashboardPage(), Stats, AdminLayout(), AdminMetricsPage(), TenantsInner(), formatDate(), isConnected(), ReativarPage() (+3 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (9): CheckoutSucessoInner(), PRECHECK_APP_URL, renderView(), ViewState, ensureSession(), getOnboardingStatus(), getPrecheckSsoToken(), getSession() (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (9): AnamnesesInner(), AnamnesisDetailView(), formatDateTime(), STATUS_LABEL, STATUS_TONE, statusBadge(), Anamnesis, AnamnesisDetail (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.19
Nodes (13): decodeJwtPayload(), enterDoctorMode(), exchangeInviteToken(), exchangeOnboardingToken(), fetchImpersonationDoctor(), login(), performRefresh(), rawManageFetch() (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.24
Nodes (10): AdminMetricsInner(), fmtHours(), fmtScore(), PeriodKey, PERIODS, SCORE_LABELS, isSessionExpired(), adminGetMetrics() (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (9): formatDatePtBR(), PrecheckBillingSection(), PrecheckBillingSectionProps, BRL_FORMATTER, formatBRLFromCents(), NO_BREAK_SPACE, createPrecheckTopupSession(), getPrecheckBillingUsage() (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.23
Nodes (10): DateFilter, PreCheckPanelProps, PreCheckRow(), STATUS_BADGE, STATUS_LABEL, statusBadgeClass(), StatusFilter, statusLabel() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (9): dmSans, FONT_VARIABLES, hankenGrotesk, instrumentSerif, inter, jetbrainsMono, metadata, newsreader (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (3): b64url(), makeJwt(), ManageApiModule

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (9): formatDateTimePtBR(), formatTimePtBR(), isSameLocalDay(), isTodayLocal(), isWithinLastDays(), isWithinNextWeek(), matchesSearch(), normalizeForSearch() (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.27
Nodes (7): BrandHeader(), BrandHeaderProps, NavLink, ThemeToggle(), ThemeToggleProps, Theme, useBrandTheme()

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (7): BrandIconProps, FILLED, IconName, PATHS, PhoneFloatCard, PhoneProps, WaStep

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): SummaryDetail(), Toast(), ToastProps, ToastTone, ToastState, useToast()

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (7): ADDON_LABELS, BillingPage(), humanizeStatus(), LIMIT_LABELS, PLAN_LABELS, StatusVisual, createPortalSession()

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (5): pluralize(), PreCheckPanel(), SecretariaPanel(), PRECHECK_APP_URL, Entitlements

### Community 40 - "Community 40"
Cohesion: 0.43
Nodes (5): Lightbox(), MediaThumb(), useSignedUrl(), getMediaUrl(), SummaryMediaItem

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (3): DeleteControlsProps, TrashIcon(), TrashIconProps

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (6): asText(), buildAntro(), buildClassicSections(), buildSoapSections(), buildTailSections(), SummaryContent()

### Community 43 - "Community 43"
Cohesion: 0.47
Nodes (4): buildResumoText(), buildResumoTextClassic(), buildResumoTextSoap(), Summary

### Community 44 - "Community 44"
Cohesion: 0.40
Nodes (4): RestartButton(), RestartButtonProps, restartTestWindow(), RestartTestWindowResult

### Community 46 - "Community 46"
Cohesion: 0.50
Nodes (3): exitDoctorMode(), getImpersonation(), ImpersonationMarker

## Knowledge Gaps
- **286 isolated node(s):** `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS`, `DashPaginationProps`, `DashSearchProps` (+281 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BrandGlyph()` connect `Community 3` to `Community 0`, `Community 2`, `Community 35`, `Community 4`, `Community 38`, `Community 6`, `Community 39`, `Community 7`, `Community 8`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `BrandIcon()` connect `Community 25` to `Community 0`, `Community 2`, `Community 35`, `Community 4`, `Community 36`, `Community 38`, `Community 39`, `Community 3`, `Community 14`, `Community 15`, `Community 21`, `Community 23`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Session` connect `Community 31` to `Community 1`, `Community 33`, `Community 3`, `Community 4`, `Community 38`, `Community 39`, `Community 10`, `Community 44`, `Community 45`, `Community 14`, `Community 15`, `Community 21`, `Community 22`, `Community 23`, `Community 26`, `Community 27`, `Community 29`, `Community 30`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `DashFiltersProps`, `DashHeaderProps`, `SIZE_OPTIONS` to the rest of the system?**
  _286 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05045045045045045 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.03502824858757062 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07180851063829788 - nodes in this community are weakly interconnected._