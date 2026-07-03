"use client";

// PlanCheckoutCta — the interactive "buy" button rendered inside a PriceCard via
// its optional `cta` prop. PriceCard itself stays a pure server component; all
// session checks, the Stripe Checkout call, and error/pending UI live here.
//
// Flow: requires a logged-in TENANT session (a tenant must be signed in to buy).
// - no session → send the visitor to /login
// - role === "admin" (no tenant to bill) → inline message instead of navigating
// - otherwise → POST /billing/checkout via createCheckoutSession, then a full-page
//   redirect to the returned Stripe Checkout URL.

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
}: PlanCheckoutCtaProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState(false);

  async function handleClick() {
    setError(null);
    setAdminNotice(false);

    const session = getSession();
    if (!session) {
      router.push("/login");
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
    </div>
  );
}
