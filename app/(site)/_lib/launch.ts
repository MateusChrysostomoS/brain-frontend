// launch.ts — the pre-launch buy gate. SINGLE source of truth for "can this
// purchase actually be made yet?".
//
// Deliberately a code-level constant and NOT an env var: the pricing page is
// statically exported, so an env-var read would either be baked in at build time
// anyway (same thing, but invisible in the diff) or need a runtime fetch on a
// page that must not wait on the network to decide whether a button works.
// A constant makes the launch a reviewable one-line commit.
//
// SCOPED TO secretarIA (2026-08-02). The gate started life as a single global
// boolean, but every purchasable card on the site routes its CTA through ONE
// component (PlanCheckoutCta), so a global flag also blocked PreCheck — which
// is on sale. Commercially the two products launch independently: only
// secretarIA still waits (its WhatsApp Coexistence approval is what is not
// ready), PreCheck sells today. So the gate now asks "does THIS purchase carry
// secretarIA?" via isPurchaseGated below, never "is the site launched?".
//
// Deliberately NOT gated (out of scope — these serve clinics that already
// bought, which the gate cannot produce but which must keep working): the
// /app/reativar subscription reactivation, the admin "Modo médico"
// impersonation, and the billing portal.

import { catalogRequiresWhatsappCoexistence } from "@/lib/manage-api";

// Flip to true on the day secretarIA actually goes on sale. That single edit
// restores unrestricted checkout everywhere — no other code change.
export const PRODUCT_LAUNCHED = false;

// True when a purchase carrying these catalog ids must be intercepted by the
// waitlist instead of reaching /cadastro or Stripe Checkout.
//
// Reuses catalogRequiresWhatsappCoexistence — the same "is this purchase
// secretarIA-bearing?" test CheckoutTrialNotice already trusts, mirroring
// brain-api's catalog semantics (every `secretaria*` plan + the combo). A
// PreCheck-only purchase (precheck_basic / precheck_advanced, and any add-on
// bought alongside them) is never gated.
export function isPurchaseGated(catalogIds: string[]): boolean {
  if (PRODUCT_LAUNCHED) return false;
  return catalogRequiresWhatsappCoexistence(catalogIds);
}
