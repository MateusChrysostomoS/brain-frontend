# Add product to the subscription - UI (TASK-015)

State: implemented locally; no commit, push or deployment. Last validation: 2026-09-30.

PlanCheckoutCta preserves the launch gate and session recovery. A clinic with exactly one product and an active subscription sees the add-product label on the other product card. createEntitlementReader shares the initial read by tenant/token (single-flight, five-second TTL, bounded cache); the click reads fresh entitlement before purchasing. past_due and trialing block the addition. Other statuses use checkout. A courtesy clinic receives no_active_subscription from the backend and falls back to checkout.

AddProductDialog displays the exact backend charge before confirmation, without applying the combo discount. Confirmation sends a UUID per attempt; the reducer reuses it only for an unknown result (network/5xx). Definitive refusals require a new preview and key. Relevant card/3DS errors offer the billing portal. An already_present preview completes without requiring charge.

addProductToSubscription sends return_to=console on preview and execution. The success button passes return_query to consoleReturnRoute, which rebuilds /checkout/sucesso from allowlisted values only. Ordinary purchases return to /app. getEntitlements maps precheck_plan; billing uses describePlans to show both plans.

Validation: TypeScript exit 0; 293 tests across 16 files. The final static build passed after the JSX label correction, including /, /app/billing and /checkout/sucesso. Evidence: C:/TECH/BRAIN/tasks/TASK-015/frontend-{typecheck,test,build}.txt. Root confirmed price/error/happy-return behavior with synthetic browser stubs. Root also confirmed the final label in desktop/mobile snapshots.

The browser caught a JSX integration omission after helper tests passed: the cardDecision state was ignored by the button. A regression test now renders the actual PlanCheckoutCta through react-dom/server with hydrated decision state and checks the visible label (frontend-red-render-label.txt -> frontend-green-render-label.txt).

Dependencies: brain-api TASK C add-product preview/confirmation, stable refusal codes, precheck_plan, allowlisted return query. Graphify started INVALID and was not primary evidence. Deployment order remains migration -> brain-api -> frontends, subject to explicit authorization. No environment change or real Stripe call was made.

## Independent review fix pass

Review R5: a 409 add_product_in_progress keeps the original displayed charge and idempotency key, because the initial Stripe operation may still complete. Other definitive 4xx refusals rotate the key through a fresh preview.
Review R6: preview also carries return_to, so an already_present response retains the console return path.
Review R7: AddProductDialog now uses native dialog/showModal with inert background, contained Tab focus and opener restoration. Escape and backdrop cannot close it while busy. Cleanup invalidates abandoned responses and restores previous body overflow.
Financial review: confirmations send optional expected_charge containing the four displayed charge fields. The server compares a fresh quote before mutation; preview_changed forces a fresh preview/key and another explicit confirmation. Unknown next-invoice totals are stated as unavailable, without invented amounts.
RED evidence: frontend-red-review.txt (seven failures). GREEN: frontend-green-review.txt (44 tests). All final frontend gates passed after this bundle. Root completed final browser validation of the native modal and these additional paths.

Signed quote stability: preview returns quote_token. The dialog keeps it only in a ref, clears it on fresh preview/open/close, and sends the identical token with expected_charge on confirmation and uncertain-result retries using the same key. No client timestamp is trusted or sent. A preview with charge but missing quote is rejected before user confirmation; already_present can finish without a charge quote. Quote-required/invalid/expired errors trigger a new preview/key and consent. RED2 -> GREEN7 integration evidence: frontend-red-quote.txt and frontend-green-quote.txt. Final tsc, 293 tests and static build all passed after the signed quote addition. Root confirmed the final browser pass for this revision.

Final native-modal browser proof: root verified only dialog content in the accessibility tree, native :modal=true, preview Tab/Shift+Tab containment, busy Tab/Shift+Tab/Escape containment, and no background CTA access. Busy transitions focus the dialog while buttons are disabled. The initiating CTA is passed explicitly through returnFocusTo, because awaiting entitlement and disabling the CTA can move activeElement to body before the modal opens. Escape restores that exact CTA. Root also verified already_present console return, expected_charge/quote_token/return_to request fields, unknown next-invoice copy and desktop/mobile screenshots.

Final regression evidence: frontend-red-busy-focus.txt -> frontend-green-busy-focus.txt; frontend-red-restore-trigger.txt -> frontend-green-restore-trigger.txt. Final TypeScript, 293 tests and static build all passed after these corrections. Graphify 0.9.5 AST update rebuilt 1207 nodes/2172 edges/91 communities; diagnose found zero missing/dangling edges, duplicates or self-loops. Query passed and -Record wrote metadata. Status is STALE because the code remains uncommitted; the rebuilt graph is a local snapshot, not committed provenance. See frontend-graph-{update,diagnose,query,status}.txt.

## Resumption verification (2026-09-30)

The next agent confirmed that implementation and the single independent-review fix pass had already finished. Fresh gates passed: TypeScript, 293 tests and static export build (resume-final-frontend-{tsc,test,build}.log in TASK-015). Vercel's agent-browser CLI tested that exported build locally with synthetic API responses installed before navigation: displayed R$12.50 preview, unknown renewal total, card refusal requiring a new preview, in-progress retry preserving the exact UUID/quote/charge, successful console return, already-present preview returning without confirmation, background inertness, busy Tab/Shift+Tab/Escape containment and exact CTA restoration. No browser page errors. Evidence: agent-browser-qa.log and agent-browser-{desktop,mobile-decline,mobile-busy}.png.

Chromium's native modal can move focus to browser chrome (activeElement BODY) at a Tab boundary; underlying page controls remain inert and absent from the accessibility tree. Busy state keeps focus in the dialog. The QA harness waits for smooth scrolling and rendering before pointer actions and explicitly reloads between same-URL scenarios. The Windows application policy blocked the downloaded Chrome, so QA used the installed Chrome. This is local fixture evidence; no hosted Vercel preview, real Stripe request, commit or deployment was performed.
