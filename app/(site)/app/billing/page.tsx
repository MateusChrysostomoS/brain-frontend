"use client";

// /app/billing — subscription management page for a logged-in tenant.
// Boot mirrors /app: getSession() → missing → /login; getEntitlements() → on
// 401 clearSession + /login. Shows the current plan/status/add-ons/limits from
// GET /entitlements and a "Gerenciar assinatura" button that hands off to the
// Stripe Billing Portal (POST /billing/portal).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandIcon } from "../../_components/BrandIcon";
import {
  clearSession,
  createPortalSession,
  getEntitlements,
  ensureSession,
  getSession,
  ManageApiError,
  type Entitlements,
  type Session,
} from "@/lib/manage-api";
import { billingLimitDisplay, billingPlanLabel, billingAddonLabel } from "@/lib/billing-copy";
import { PrecheckBillingSection } from "./_components/PrecheckBillingSection";
import "../dashboard-shell.css";
import "./billing.css";

type StatusVisual = { label: string; className: string };

// humanizeStatus — maps the raw entitlements status to a PT-BR label + badge tone.
function humanizeStatus(status: string): StatusVisual {
  switch (status) {
    case "active":
      return { label: "Ativa", className: "badge--done" };
    case "trialing":
      return { label: "Período de teste", className: "badge--done" };
    case "past_due":
      return { label: "Pagamento pendente", className: "badge--amber" };
    case "canceled":
    case "inactive":
      return { label: "Inativa", className: "badge--neutral" };
    default:
      return { label: "Situação não disponível", className: "badge--neutral" };
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function BillingPage() {
  const router = useRouter();

  // --- Boot state ---
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // --- "Gerenciar assinatura" (Stripe Billing Portal) handoff state ---
  const [portalPending, setPortalPending] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [noBillingAccount, setNoBillingAccount] = useState(false);

  // --- Boot: require a session, then fetch entitlements from brain-api ---
  useEffect(() => {
    // ASYNC ON PURPOSE, and the reason is easy to miss: since the refresh token
    // moved to an HttpOnly cookie, a signed-in user who RELOADS arrives here with
    // nothing in memory. A synchronous getSession() would read null and bounce
    // them to a login screen they were already past. ensureSession() spends the
    // cookie once (single-flight, shared with every other mount) and answers who
    // they are.
    let cancelled = false;
    void (async () => {
      const current = getSession() ?? (await ensureSession());
      if (cancelled) return;
      if (!current?.token) {
        router.replace("/login");
        return;
      }
      setSession(current);
      getEntitlements(current)
        .then((e) => {
          setEnt(e);
          setLoading(false);
        })
        .catch((e) => {
          if (e instanceof ManageApiError && e.status === 401) {
            // Expired/invalid session — clear it and bounce to login.
            clearSession();
            router.replace("/login");
            return;
          }
          setLoadError("Não foi possível carregar sua assinatura. Tente novamente.");
          setLoading(false);
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  // --- Stripe Billing Portal handoff ---
  async function openPortal() {
    if (!session) return;
    setPortalError(null);
    setNoBillingAccount(false);
    setPortalPending(true);
    try {
      const url = await createPortalSession(session);
      window.location.assign(url);
      // Leave `portalPending` true — the browser is navigating away to Stripe.
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      if (status === 409) {
        // no_billing_account — the tenant never went through checkout.
        setNoBillingAccount(true);
      } else if (status === 503) {
        setPortalError("Cobrança ainda não configurada.");
      } else {
        setPortalError("Não foi possível abrir a página de pagamento agora. Tente novamente.");
      }
      setPortalPending(false);
    }
  }

  // --- Derived display values ---
  const statusVisual = ent ? humanizeStatus(ent.status) : null;
  const planLabel = ent ? billingPlanLabel(ent.plan, ent.precheckPlan) : "";
  const activeAddons = ent
    ? Object.entries(ent.addons).filter(([, active]) => active)
    : [];
  const limitEntries = ent ? Object.entries(ent.limits).map(([key, value]) => ({ key, ...billingLimitDisplay(key, value) })) : [];

  return (
    <>
      {/* ==================== LOADING ==================== */}
      {loading && (
        <div className="dash-loading" aria-live="polite" aria-label="Carregando">
          <div className="spinner" />
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>
            Carregando sua assinatura…
          </div>
        </div>
      )}

      {/* ==================== BOOT ERROR ==================== */}
      {!loading && loadError && (
        <div className="billing-content">
          <section className="panel">
            <p role="alert" className="muted">
              {loadError}
            </p>
          </section>
        </div>
      )}

      {/* ==================== MAIN ==================== */}
      {!loading && ent && statusVisual && (
        <div className="billing-content">
          <section className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Cobrança</span>
                <h1 className="panel-title" style={{ fontSize: 30 }}>
                  Sua assinatura
                </h1>
              </div>
            </div>

            {/* --- Clinic / plan / status summary --- */}
            <div className="sub-summary">
              <div className="sub-summary-row">
                <span className="sub-summary-label">Clínica</span>
                <span className="sub-summary-value">{ent.clinicName || "—"}</span>
              </div>
              <div className="sub-summary-row">
                <span className="sub-summary-label">Plano</span>
                <span className="sub-summary-value">{planLabel}</span>
              </div>
              <div className="sub-summary-row">
                <span className="sub-summary-label">Situação da assinatura</span>
                <span className={`badge ${statusVisual.className}`}>
                  <span className="d" />
                  {statusVisual.label}
                </span>
              </div>
            </div>

            {/* --- Active add-ons --- */}
            <div className="sub-block">
              <h2 className="sub-block-title">Recursos adicionais contratados</h2>
              {activeAddons.length > 0 ? (
                <ul className="tick-list">
                  {activeAddons.map(([id]) => (
                    <li key={id} className="ok">
                      <BrandIcon name="check" />
                      {billingAddonLabel(id)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{ fontSize: 13.5 }}>
                  Seu plano não tem recursos adicionais contratados.
                </p>
              )}
            </div>

            {/* --- Plan limits --- */}
            {limitEntries.length > 0 && (
              <div className="sub-block">
                <h2 className="sub-block-title">O que seu plano oferece</h2>
                <div className="limit-grid">
                  {limitEntries.map(({ key, label, value, hint }) => (
                    <div key={key} className="limit-item">
                      <div className="limit-value">
                        {value}
                      </div>
                      <div className="limit-label">{label}</div>
                      {hint && <p className="limit-hint">{hint}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- PreCheck plan usage/top-ups/upgrade — renders nothing when the
                tenant's plan isn't a PreCheck plan, or if its own optional fetch
                fails (see PrecheckBillingSection for the "resolves null" idiom). --- */}
            {session && <PrecheckBillingSection session={session} />}

            {/* --- Manage subscription (Stripe Billing Portal handoff) --- */}
            <div className="sub-block">
              <div className="billing-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={openPortal}
                disabled={portalPending}
              >
                <BrandIcon name="edit" />
                {portalPending ? "Abrindo a página de pagamento…" : "Gerenciar assinatura"}
              </button>
                <Link href="/app/reativar" className="billing-trial-link">
                  Consultar o período de teste de ativação <span aria-hidden="true">→</span>
                </Link>
              </div>


              {noBillingAccount && (
                <div role="alert" className="portal-alert">
                  <p style={{ margin: 0 }}>
                    Sua clínica ainda não contratou uma assinatura paga.
                  </p>
                  <Link href="/#planos" className="btn btn--outline btn--sm mt-s">
                    Ver planos
                  </Link>
                </div>
              )}
              {portalError && (
                <p role="alert" className="portal-alert" style={{ margin: 0 }}>
                  {portalError}
                </p>
              )}


            </div>
          </section>
        </div>
      )}
    </>
  );
}
