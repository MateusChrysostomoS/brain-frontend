"use client";

// PlanCheckoutCta — the interactive "buy" button rendered inside a PriceCard via
// its optional `cta` prop. PriceCard itself stays a pure server component; all
// session checks, the authenticated Stripe Checkout call, and error/pending UI
// live here.
//
// Two flows share this one button:
// - Session exists (logged-in tenant) → unchanged from before: POST
//   /billing/checkout via createCheckoutSession, then a full-page redirect to
//   the returned Stripe Checkout URL. Admins (no tenant to bill) get an inline
//   notice instead of navigating.
// - No session (anonymous visitor) → navigate to the /cadastro wizard
//   (Feature 0), pre-tagged with `plan`/`catalogIds` via query params. The
//   wizard owns the rest of the cold-signup flow (contact fields + the
//   onboarding intake questionnaire) before it POSTs /public/signup-intents.
//
// Also renders CheckoutTrialNotice right under the button — the pre-checkout
// billing/trial disclosure, since this card is where both flows above start.
// Scoped to secretarIA-bearing purchases only (see
// catalogRequiresWhatsappCoexistence); a PreCheck-only card shows nothing.
//
// PRE-LAUNCH GATE: because every purchasable card on the site routes its CTA
// through this one component, it is also the single place the launch gate needs
// to exist — and, for the same reason, the gate must be asked PER PRODUCT and
// not as a global boolean (a global one blocked PreCheck too, which is on
// sale). isPurchaseGated answers that for the ids this particular card carries:
// while it is true, handleClick short-circuits into LaunchWaitlistModal before
// it looks at the session at all, and the trial notice is suppressed (see
// below). Nothing about the card's own markup — prices, copy, layout — changes
// either way.
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCheckoutSession,
  getSession,
  ManageApiError,
  type CatalogAddonId,
  type CatalogPlanId,
} from "@/lib/manage-api";
import { isPurchaseGated } from "../_lib/launch";
import { CheckoutTrialNotice } from "./CheckoutTrialNotice";
import { LaunchWaitlistModal } from "./LaunchWaitlistModal";

export type PlanCheckoutCtaProps = {
  plan: CatalogPlanId;
  addons?: CatalogAddonId[];
  // Primary button label (e.g. "Contratar PreCheck").
  label: string;
  // Button style — mirrors PriceCard's featured/outline split.
  featured?: boolean;
  // Optional secondary link kept from the card's original static CTA
  // (e.g. "Falar com a Brain" / "Agendar demonstração").
  secondaryHref?: string;
  secondaryLabel?: string;
  // Catalog ids sent as `catalog_ids` on the public signup intent when no
  // session exists — passed through to /cadastro as `?catalog=`. Independent
  // of `plan`/`addons` (the authenticated billing enum): the anonymous
  // cold-signup flow speaks the broader public catalog.
  catalogIds: string[];
};

// Inline alert style shared by every branch below — mirrors the ssoError pattern
// in app/(site)/app/page.tsx so error copy reads consistently across the app.
const alertStyle: CSSProperties = {
  fontSize: 12.5,
  lineHeight: 1.4,
  color: "var(--danger, #c0392b)",
  margin: "8px 0 0",
};

export function PlanCheckoutCta({
  plan,
  addons,
  label,
  featured,
  secondaryHref,
  secondaryLabel,
  catalogIds,
}: PlanCheckoutCtaProps) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // The authenticated path bills `plan` itself, which may not appear in the
  // anonymous-flow `catalogIds` list — include it so CheckoutTrialNotice sees
  // the full purchase when deciding whether it's secretarIA-bearing.
  const purchaseCatalogIds = Array.from(new Set([plan, ...catalogIds]));

  // Whether THIS card's purchase is still behind the launch gate. Scoped to the
  // product being bought, so a PreCheck card checks out normally while a
  // secretarIA one still collects a lead (app/(site)/_lib/launch.ts).
  const gated = isPurchaseGated(purchaseCatalogIds);

  async function handleClick() {
    setError(null);
    setAdminNotice(false);

    // PRE-LAUNCH GATE — first thing, before the session is even read: while
    // this product is not on sale, no click may reach /cadastro or Stripe
    // Checkout, logged in or not. Collect the lead instead.
    if (gated) {
      setWaitlistOpen(true);
      return;
    }

    const session = getSession();
    if (!session) {
      // No account yet — hand off to the /cadastro wizard (contact fields +
      // onboarding intake), which itself creates the signup intent + checkout
      // session once it has collected everything.
      const params = new URLSearchParams({ plan, catalog: catalogIds.join(",") });
      router.push(`/cadastro?${params.toString()}`);
      return;
    }
    if (session.role === "admin") {
      // Admin accounts are platform-level and own no tenant — nothing to bill.
      setAdminNotice(true);
      return;
    }
    if (!session.tenantId) {
      router.push("/login");
      return;
    }

    setPending(true);
    try {
      const url = await createCheckoutSession(session, plan, addons);
      window.location.assign(url);
      // Leave `pending` true — the browser is navigating away to Stripe.
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      setError(
        status === 503
          ? "Cobrança ainda não configurada. Fale com a Brain."
          : status === 422
            ? "Plano indisponível no momento."
            : "Não foi possível iniciar o checkout. Tente novamente.",
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={"btn btn--block" + (featured ? " btn--primary" : " btn--outline")}
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Abrindo checkout…" : label}
      </button>

      {/* Pre-checkout billing disclosure — must be visible before Stripe's
          hosted Checkout page, which this button can navigate straight to
          for a logged-in tenant. Renders nothing for a PreCheck-only
          purchase (see catalogRequiresWhatsappCoexistence).

          Suppressed entirely behind the launch gate: it is a disclosure ABOUT
          a checkout the button currently cannot reach, so showing it would
          promise a trial nobody can start (and it would fire a
          /public/checkout-config request per card for nothing). */}
      {!gated && <CheckoutTrialNotice catalogIds={purchaseCatalogIds} />}

      {secondaryHref && secondaryLabel && (
        <Link
          href={secondaryHref}
          className="btn btn--ghost btn--block btn--sm"
          style={{ marginTop: 8 }}
        >
          {secondaryLabel}
        </Link>
      )}

      {adminNotice && (
        <p role="alert" style={alertStyle}>
          Entre com a conta da clínica para contratar.
        </p>
      )}
      {error && (
        <p role="alert" style={alertStyle}>
          {error}
        </p>
      )}

      {/* Pre-launch gate. Mounted unconditionally (it renders null while closed
          and portals to <body> when open) so the launch flip is a one-line
          change in _lib/launch.ts and nothing here. `planHint` records which
          card was clicked — same id list the purchase would have carried. */}
      <LaunchWaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        planHint={purchaseCatalogIds.join(",")}
      />
    </div>
  );
}
