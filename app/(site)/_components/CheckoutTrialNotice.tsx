"use client";

// CheckoutTrialNotice — pre-checkout billing disclosure. Every subscription
// checkout starts a Stripe trial; the clinic's card is only ever charged once
// Meta approves WhatsApp Coexistence on their number, and the subscription is
// cancelled automatically (no charge) if that approval never lands within the
// trial window. This ONLY applies to purchases that actually enable the
// secretarIA product — PreCheck has no WhatsApp Coexistence step, so a
// PreCheck-only purchase must render nothing here (see
// catalogRequiresWhatsappCoexistence in lib/manage-api.ts, which brain-api's
// own trial-cancellation behavior mirrors).
//
// The visitor must see the (applicable) disclosure BEFORE reaching Stripe's
// hosted Checkout page, so this component is mounted on both funnel paths
// that lead there: next to PlanCheckoutCta's button (logged-in checkout) and
// on /cadastro's summary step, right above the submit button (cold signup).
//
// Static export means there is no request-time server rendering, so the
// trial length is fetched client-side on mount from brain-api — this
// component must NEVER hardcode the trial length; it always reflects the
// deployed STRIPE_TRIAL_PERIOD_DAYS via GET /public/checkout-config (see
// getCheckoutTrialDays in lib/manage-api.ts), which is the single source of
// truth for that number.
//
// Renders nothing while loading (no spinner — the copy just appears once
// resolved) and nothing at all when the backend reports no trial configured
// (0 days), since in that case the "you pay nothing" promise would be false.

import { useEffect, useState, type CSSProperties } from "react";
import { catalogRequiresWhatsappCoexistence, getCheckoutTrialDays } from "@/lib/manage-api";

export type CheckoutTrialNoticeProps = {
  // Every catalog id in this purchase (plan + any add-ons). Decides whether
  // the disclosure applies at all — see catalogRequiresWhatsappCoexistence.
  catalogIds: string[];
};

// Module-level cache so multiple instances mounted on the same page (e.g. the
// two priced plans on the homepage) share one network call instead of each
// fetching independently. Only a SUCCESSFUL resolution is cached: on a failed
// fetch (null) the cache resets immediately, so the next mount retries
// instead of one transient network blip downgrading every future mount, for
// the rest of the SPA session, to the number-free fallback copy.
let trialDaysRequest: Promise<number | null> | null = null;

function loadTrialDays(): Promise<number | null> {
  if (!trialDaysRequest) {
    trialDaysRequest = getCheckoutTrialDays().then((days) => {
      if (days === null) trialDaysRequest = null;
      return days;
    });
  }
  return trialDaysRequest;
}

// Mirrors the alertStyle pattern in PlanCheckoutCta.tsx, but muted — this is
// reassurance copy, not an error, so it never uses the danger color.
const noticeStyle: CSSProperties = {
  fontSize: 12.5,
  lineHeight: 1.4,
  margin: "8px 0 0",
};

export function CheckoutTrialNotice({ catalogIds }: CheckoutTrialNoticeProps) {
  // Whether this purchase even carries the WhatsApp Coexistence promise —
  // computed synchronously from props, no fetch needed to know this part.
  const applies = catalogRequiresWhatsappCoexistence(catalogIds);

  // undefined = still loading (render nothing yet); null = fetch failed
  // (render the number-free fallback copy); number = resolved trial length.
  const [trialDays, setTrialDays] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!applies) return; // PreCheck-only purchase — nothing to disclose, skip the fetch entirely
    let cancelled = false;
    loadTrialDays().then((days) => {
      if (!cancelled) setTrialDays(days);
    });
    return () => {
      cancelled = true;
    };
  }, [applies]);

  if (!applies) return null;
  if (trialDays === undefined) return null; // still loading
  if (trialDays === 0) return null; // no trial configured — the promise would be false

  return (
    <p className="muted" style={noticeStyle} role="status">
      {trialDays === null
        ? "Seu cartão só é cobrado quando a Meta aprovar o WhatsApp Coexistence no seu número. Se isso não acontecer dentro do período de teste, cancelamos a assinatura automaticamente — você não paga nada."
        : `Seu cartão só é cobrado quando a Meta aprovar o WhatsApp Coexistence no seu número. Se isso não acontecer em até ${trialDays} dias, cancelamos a assinatura automaticamente — você não paga nada.`}
    </p>
  );
}
