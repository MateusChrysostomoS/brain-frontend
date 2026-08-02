// launch.ts — the pre-launch buy gate. SINGLE source of truth for "can the
// product actually be purchased yet?".
//
// Deliberately a code-level constant and NOT an env var: the pricing page is
// statically exported, so an env-var read would either be baked in at build time
// anyway (same thing, but invisible in the diff) or need a runtime fetch on a
// page that must not wait on the network to decide whether a button works.
// A constant makes the launch a reviewable one-line commit.
//
// While this is false, PlanCheckoutCta intercepts EVERY buy click on EVERY
// PriceCard (secretarIA plans, PreCheck plans, add-ons — they all render that
// one component) and opens LaunchWaitlistModal instead of reaching /cadastro or
// Stripe Checkout, for anonymous and logged-in visitors alike. Nothing else on
// the pricing page changes: cards, prices and copy are untouched.
//
// Deliberately NOT gated by this flag (out of scope — these serve clinics that
// already bought, which cannot exist while the gate is shut, and must keep
// working the moment one does): /app/reativar subscription reactivation, the
// admin "Modo médico" impersonation, and the billing portal.

// Flip to true on the day the product actually goes on sale. That single edit
// restores the previous checkout behaviour exactly — no other code change.
export const PRODUCT_LAUNCHED = false;
