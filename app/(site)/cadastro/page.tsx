"use client";

// /cadastro — self-service signup wizard (Feature 0). Opened by PlanCheckoutCta
// for anonymous visitors as `?plan=<catalogPlanId>&catalog=<comma,list>`
// instead of the old inline modal. Static export has no dynamic route segments,
// so plan selection travels entirely via query params (the repo's existing
// `?id=` convention, e.g. /admin/tenants?id=). Wrapped in Suspense because
// useSearchParams requires it (same pattern as /checkout/sucesso).

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrandGlyph } from "../_components/BrandGlyph";
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
