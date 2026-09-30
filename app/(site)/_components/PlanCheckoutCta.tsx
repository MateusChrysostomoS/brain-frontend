"use client";

// PlanCheckoutCta — the interactive "buy" button rendered inside a PriceCard via
// its optional `cta` prop. PriceCard itself stays a pure server component; all
// session checks, the authenticated Stripe Checkout call, and error/pending UI
// live here.
//
// Purchase flows share this one button:
// - Exactly one product and the other product card -> AddProductDialog: preview, then
//   add to the existing subscription. A courtesy clinic falls back to checkout.
// - Session exists (logged-in tenant) → unchanged from before: POST
//   /billing/checkout via createCheckoutSession, then a full-page redirect to
//   the returned Stripe Checkout URL. Admins (no tenant to bill) get an inline
//   notice instead of navigating.
// - No session (anonymous visitor) → navigate to the /cadastro wizard
//   (Feature 0), pre-tagged with `plan`/`catalogIds` via query params. The
//   wizard owns the rest of the cold-signup flow (contact fields + the
//   onboarding intake questionnaire) before it POSTs /public/signup-intents.
//   EXCEPT a visitor who came from the Brain-Message console (`?origem=console`):
//   they already have an account, so they go to /login?next=/#planos instead
//   (lib/checkout-cta.ts). Read from window.location in the click handler — no
//   useSearchParams, so no extra <Suspense> around every PriceCard.
// - brain-api answers 409 `has_active_subscription` while TASK B's guard is on
//   (a second subscription would replace the first); the copy says so.
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
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCheckoutSession,
  ensureSession,
  getSession,
  getEntitlements,
  ManageApiError,
  type CatalogAddonId,
  type CatalogPlanId,
  type Session,
} from "@/lib/manage-api";
import { consoleReturnRoute, returnToFromOrigem } from "@/lib/console-return";
import { decideCta, type CtaDecision, type ProductFamily } from "@/lib/add-product";
import { createEntitlementReader } from "@/lib/add-product-entitlement";
import { AddProductDialog } from "./AddProductDialog";
import { anonymousCheckoutRoute, checkoutErrorMessage } from "@/lib/checkout-cta";
import { isPurchaseGated } from "../_lib/launch";
import { CheckoutTrialNotice } from "./CheckoutTrialNotice";
import { LaunchWaitlistModal } from "./LaunchWaitlistModal";

const readCardEntitlement = createEntitlementReader(async (key: string) => {
  const session = getSession();
  if (!session || `${session.tenantId}:${session.token}` !== key) return null;
  return getEntitlements(session);
});

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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [cardDecision, setCardDecision] = useState<CtaDecision>({ kind: "checkout" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [addProduct, setAddProduct] = useState<{ product: ProductFamily; session: Session; returnTo?: "console" } | null>(null);

  // The authenticated path bills `plan` itself, which may not appear in the
  // anonymous-flow `catalogIds` list — include it so CheckoutTrialNotice sees
  // the full purchase when deciding whether it's secretarIA-bearing.
  const purchaseCatalogIds = Array.from(new Set([plan, ...catalogIds]));

  // Whether THIS card's purchase is still behind the launch gate. Scoped to the
  // product being bought, so a PreCheck card checks out normally while a
  // secretarIA one still collects a lead (app/(site)/_lib/launch.ts).
  const gated = isPurchaseGated(purchaseCatalogIds);

  useEffect(() => {
    if (gated) return;
    let canceled = false;
    void (async () => {
      const session = getSession() ?? await ensureSession();
      if (!session?.tenantId || session.role === "admin") return;
      try {
        const ent = await readCardEntitlement(`${session.tenantId}:${session.token}`);
        if (!canceled) setCardDecision(decideCta(ent, plan));
      } catch {
        // The public card remains available; the click reads again before purchasing.
      }
    })();
    return () => { canceled = true; };
  }, [gated, plan]);

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

    // A public page, so this is where a reload hurts most: without asking the
    // cookie, an ALREADY-REGISTERED visitor reads as anonymous and gets sent to
    // /cadastro, where registration then fails with email_already_registered.
    const session = getSession() ?? (await ensureSession());
    if (!session) {
      // New lead → the /cadastro wizard (it creates the signup intent + checkout
      // session itself). A visitor from the console (`?origem=console`) already
      // has an account → /login, then back to #planos.
      const origem = new URLSearchParams(window.location.search).get("origem");
      router.push(anonymousCheckoutRoute({ origem, plan, catalogIds }));
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
    let decision: CtaDecision = { kind: "checkout" };
    try {
      decision = decideCta(await getEntitlements(session), plan);
    } catch {
      // The backend still refuses a second subscription if this read is unavailable.
      decision = { kind: "checkout" };
    }
    setCardDecision(decision);
    if (decision.kind === "blocked") {
      setError(decision.message);
      setPending(false);
      return;
    }
    if (decision.kind === "add-product") {
      setAddProduct({
        product: decision.product,
        session,
        returnTo: returnToFromOrigem(new URLSearchParams(window.location.search).get("origem")),
      });
      setPending(false);
      return;
    }
    await startCheckout(session);
  }

  async function startCheckout(session: Session) {
    setPending(true);
    try {
      // `origem=console` survives /login (withConsoleOrigin) and is forwarded as the
      // allowlisted `return_to`, so paying lands back in the Brain-Message portal.
      const url = await createCheckoutSession(
        session,
        plan,
        addons,
        returnToFromOrigem(new URLSearchParams(window.location.search).get("origem")),
      );
      window.location.assign(url);
      // Leave `pending` true — the browser is navigating away to Stripe.
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      const detail = e instanceof ManageApiError ? e.message : "";
      setError(checkoutErrorMessage(status, detail));
      setPending(false);
    }
  }

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        className={"btn btn--block" + (featured ? " btn--primary" : " btn--outline")}
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Verificando assinatura…" : cardDecision.kind === "add-product" ? "Adicionar à minha assinatura" : label}
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
      {addProduct && (
        <AddProductDialog
          open
          product={addProduct.product}
          plan={plan}
          addons={addons}
          session={addProduct.session}
          returnTo={addProduct.returnTo}
          returnFocusTo={triggerRef.current}
          onClose={() => setAddProduct(null)}
          onFallbackToCheckout={() => {
            const session = addProduct.session;
            setAddProduct(null);
            void startCheckout(session);
          }}
          onDone={(returnQuery) => router.push(consoleReturnRoute(returnQuery) ?? "/app")}
        />
      )}
      <LaunchWaitlistModal
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        planHint={purchaseCatalogIds.join(",")}
      />
    </div>
  );
}
