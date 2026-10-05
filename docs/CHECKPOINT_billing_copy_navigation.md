# Billing wording and account navigation (2026-10-05)

## State

Implementation validated. Commit and push to `main` authorized by the owner on 2026-10-05.
No deployment, billing action or remote data change was performed in this session.

## Changes

- `ClinicAccountShell` is the shared layout for profile and billing. Navigation order is Meu Perfil, then Cobrança. The header no longer links to subscription management.
- The billing route stays `/app/billing`; Next Link handles sidebar navigation and active route styling. Clinic roles and the existing admin impersonation return are preserved.
- `billing-copy` maps all eight catalog limit keys, additional resources and plan names to Portuguese. Unknown catalog keys receive neutral Portuguese labels rather than internal identifiers.
- Zero quotas for `billable_patients`, `active_professionals` and `reminders` mean uncapped billing meters in the backend catalog, not zero real usage or a free service. They display Conforme o uso with an explanation. Numeric quotas remain numeric.
- PreCheck wording replaces upgrade with mudar de plano, cota with pré-consultas incluídas por mês, and credit wording with pré-consultas extras. Plan tiers are translated in this billing UI.
- `billing-actions` places Gerenciar assinatura at the left edge and the activation test link at the right edge, vertically centered on desktop. Below 720px, actions stack with a visible gap.

## Validation

- `npm test`: 269 passed, including billing meter semantics and unknown-key fallback coverage.
- `npm run build`: passed.
- `.\node_modules\.bin\tsc.cmd --noEmit`: passed.
- Chrome with synthetic local API fixtures on the production export: sidebar persists on both routes, profile navigation works, no raw catalog IDs or English tier/upgrade text appears. Desktop actions align at opposite ends; mobile 320px has no horizontal overflow. Light and dark rendering inspected.
- No live Stripe action, purchase or plan change was executed.
- Graphify update attempted, but Windows Application Control blocked `graphify.exe`. The graph was not updated and should be treated as stale for these changes.
