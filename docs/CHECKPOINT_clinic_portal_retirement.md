# Retirement of the clinic product portal (2026-10-05)

## Scope and state

Implementation validated. Commit and push to `main` authorized by the owner on 2026-10-05.
Deployment was not requested or performed in this session; no remote SQL or production service changes.
Brain-Message owns operational clinic screens. brain-frontend retains account/profile,
subscription management, public signup/checkout and the platform admin portal.

## Result

- Deleted `/doctor/dashboard`, `/doctor/pacientes`, `/doctor/anamneses` and their clinical UI.
- Deleted the embedded PreCheck route group: `/dashboard`, `/summary`, `/inbound`, `/metrics`, `/users`, including exclusive components and helpers.
- Deleted product panels in `/app`, product configuration notices and `/app/onboarding` (WhatsApp activation UI).
- `/app` now forwards to `/app/billing`; the billing screen still manages subscriptions, PreCheck credits and activation trial renewal (`/app/reativar`).
- `DoctorLayout` has exactly one sidebar entry, Meu Perfil. Its header exposes Assinatura; narrow-screen styles prevent action overlap. The existing profile editor and admin impersonation return are preserved.
- `postLoginRoute`, `usePortalGuard`, invitation acceptance and admin doctor-mode now send clinic roles to `/doctor/perfil`. Safe `next` destinations targeting retired pages fall back to the role home.
- `CheckoutSucessoInner` preserves activation polling and session restoration/token exchange, then enters the configured Brain-Message portal for either product and courtesy activation. It no longer mints legacy PreCheck SSO tokens. An explicitly disabled portal URL falls back to subscription management. The existing console-origin purchase return remains unchanged.
- Removed pages deliberately do not retain redirect stubs: direct bookmarks return 404 after deployment. No patient records or backend API contracts were deleted.

## Validation

- `npm run build`: passed; only `/doctor/perfil` exported below `/doctor`.
- TypeScript validation: passed after regeneration of Next build types. The first standalone check encountered stale generated references to deleted routes; rebuilding resolved them.
- `npm test`: 263 tests passed across 14 files, including six new retired-destination cases. Tests exclusive to removed configuration notices were deleted with that feature.
- All nine retired routes absent from `out` and HTTP 404 on a local static server.
- Chrome against the production export with synthetic doctor/manager API fixtures: profile renders, sidebar contains only Meu Perfil, subscription screen renders, light/dark rendering checked. Profile at 320px has no horizontal overflow or header overlap.
- Browser checks did not use real credentials or execute Stripe actions. External checkout/portal session continuity was not exercised against live services.
- Graphify code graph rebuilt with `graphify update .`.
