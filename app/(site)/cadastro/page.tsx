"use client";

// /cadastro — self-service signup wizard (Feature 0). Opened by PlanCheckoutCta
// for anonymous visitors as `?plan=<catalogPlanId>&catalog=<comma,list>`
// instead of the old inline modal. Static export has no dynamic route segments,
// so plan selection travels entirely via query params (the repo's existing
// `?id=` convention, e.g. /admin/tenants?id=). Wrapped in Suspense because
// useSearchParams requires it (same pattern as /checkout/sucesso).
//
// PRE-LAUNCH GATE (see app/(site)/_lib/launch.ts): PlanCheckoutCta stops the buy
// buttons before they ever navigate here, but it is NOT the only door — a
// bookmark or a stale marketing link reaches this route directly. So the wizard
// itself is gated too, with the SAME per-product rule the CTA uses: a
// secretarIA-bearing `?plan=` never renders CadastroWizard (no registration, no
// signup intent, no Stripe) and offers the waitlist capture instead, while a
// PreCheck link goes straight through to the wizard.

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrandGlyph } from "../_components/BrandGlyph";
import { LaunchWaitlistForm } from "../_components/LaunchWaitlistForm";
import { isPurchaseGated } from "../_lib/launch";
import { CadastroWizard } from "./_components/CadastroWizard";
import { resolvePlan } from "./lib/plans";
import "../checkout/checkout.css";

export default function CadastroPage() {
  return (
    <Suspense fallback={<CadastroFallback />}>
      <CadastroInner />
    </Suspense>
  );
}

function CadastroInner() {
  const searchParams = useSearchParams();
  const plan = resolvePlan(searchParams);

  // Checked AFTER the plan is resolved — the gate is per product now, so which
  // plan the link carried is exactly what decides the answer. An unknown plan
  // id falls through to "Plano não encontrado" below (the honest answer once
  // part of the catalog is genuinely purchasable). `planId` is included
  // alongside `catalogIds` for the same reason PlanCheckoutCta does it: a
  // `?catalog=` list may name add-ons only, never contradicting the plan.
  if (plan && isPurchaseGated([plan.planId, ...plan.catalogIds])) {
    return (
      <>
        <BrandHeader />
        <main className="checkout-shell">
          <div className="card checkout-card">
            <h1 className="h-sec" style={{ fontSize: 22 }}>
              Estamos quase lá
            </h1>
            <p className="muted mt-s">
              Ainda estamos finalizando os últimos ajustes antes do lançamento. Deixe seu
              nome e e-mail e avisamos você assim que for possível contratar.
            </p>
            <div className="mt-m" style={{ textAlign: "left" }}>
              <LaunchWaitlistForm
                // The gated plan the link asked for — same sales hint the modal
                // sends from a card click.
                planHint={plan.catalogIds.join(",")}
                doneAction={
                  <Link href="/#planos" className="btn btn--outline btn--block mt-m">
                    Ver planos
                  </Link>
                }
              />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!plan) {
    return (
      <>
        <BrandHeader />
        <main className="checkout-shell">
          <div className="card checkout-card">
            <span className="checkout-icon" aria-hidden="true">
              ⚠️
            </span>
            <h1 className="h-sec" style={{ fontSize: 22 }}>
              Plano não encontrado
            </h1>
            <p className="muted mt-s">
              O link usado para chegar aqui não trouxe um plano válido. Volte para a página de
              planos e tente novamente.
            </p>
            <div className="checkout-actions">
              <Link href="/#planos" className="btn btn--primary">
                Ver planos
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return <CadastroWizard plan={plan} />;
}

function BrandHeader() {
  return (
    <header className="container" style={{ padding: "24px 0" }}>
      <Link href="/" className="brand-mark" aria-label="Brain — início">
        <BrandGlyph size={32} />
        <span className="wordmark">Brain</span>
      </Link>
    </header>
  );
}

function CadastroFallback() {
  return (
    <>
      <BrandHeader />
      <main className="checkout-shell">
        <div className="card checkout-card">
          <div className="checkout-spinner" aria-hidden="true" />
          <p style={{ fontSize: 14.5, fontWeight: 600 }}>Carregando…</p>
        </div>
      </main>
    </>
  );
}
