"use client";

// /app/billing — subscription management page for a logged-in tenant.
// Boot mirrors /app: getSession() → missing → /login; getEntitlements() → on
// 401 clearSession + /login. Shows the current plan/status/add-ons/limits from
// GET /entitlements and a "Gerenciar assinatura" button that hands off to the
// Stripe Billing Portal (POST /billing/portal).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandGlyph } from "../../_components/BrandGlyph";
import { BrandIcon } from "../../_components/BrandIcon";
import { ThemeToggle } from "../../_components/ThemeToggle";
import {
  clearSession,
  createPortalSession,
  getEntitlements,
  getSession,
  logout,
  ManageApiError,
  type Entitlements,
  type Session,
} from "@/lib/manage-api";
import "../dashboard-shell.css";
import "./billing.css";

// ---------------------------------------------------------------------------
// Display-only PT-BR labels. These map catalog ids → copy for this screen; they
// are NOT commercial data (prices/features stay backend-owned in
// services/catalog.py) — just what string to print for a known id.
// ---------------------------------------------------------------------------

const PLAN_LABELS: Record<string, string> = {
  precheck: "PreCheck",
  secretaria_basico: "secretarIA Básico",
  complete_clinic_combo: "Brain Completo",
  "brain-completo": "Brain Completo", // legacy alias (see Entitlements comment in manage-api.ts)
  free: "Gratuito",
};

const ADDON_LABELS: Record<string, string> = {
  reactivation_pack: "Pacote de reativação",
  verified_identity: "Identidade verificada",
  multi_professional: "Múltiplos profissionais",
  multi_unit: "Múltiplas unidades",
  ehr: "Prontuário eletrônico",
  pix_deposit: "Sinal via Pix",
  analytics_bi: "Analytics & BI",
  analytics_bi_advanced: "Dashboard Avançado",
  human_backup_24_7: "Backup humano 24/7",
};

const LIMIT_LABELS: Record<string, string> = {
  professionals: "Profissionais",
  units: "Unidades",
  messages: "Mensagens/mês",
  reminders: "Lembretes/mês",
  hsm_proactive: "Modelos proativos (HSM)/mês",
};

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
      return { label: status || "Desconhecido", className: "badge--neutral" };
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
    const current = getSession();
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
        setPortalError("Não foi possível abrir o portal agora. Tente novamente.");
      }
      setPortalPending(false);
    }
  }

  // --- Derived display values ---
  const statusVisual = ent ? humanizeStatus(ent.status) : null;
  const planLabel = ent ? (PLAN_LABELS[ent.plan] ?? ent.plan) : "";
  const activeAddons = ent
    ? Object.entries(ent.addons).filter(([, active]) => active)
    : [];
  const limitEntries = ent ? Object.entries(ent.limits) : [];

  return (
    <>
      {/* ==================== HEADER ==================== */}
      <header className="dash-header">
        <div className="container dash-nav">
          <Link className="brand-mark" href="/" aria-label="Brain">
            <BrandGlyph size={28} />
            <span className="wordmark" style={{ fontSize: 22 }}>
              Brain
            </span>
          </Link>

          <div className="dash-user">
            <ThemeToggle />
            <Link className="btn btn--outline btn--sm" href="/app">
              <BrandIcon name="arrowR" className="flip-h" />
              Voltar ao painel
            </Link>
            <Link
              className="btn btn--outline btn--sm"
              href="/login"
              onClick={() => void logout()}
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

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
        <main className="dash-main">
          <section className="panel">
            <p role="alert" className="muted">
              {loadError}
            </p>
          </section>
        </main>
      )}

      {/* ==================== MAIN ==================== */}
      {!loading && ent && statusVisual && (
        <main className="dash-main">
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
                <span className="sub-summary-label">Status</span>
                <span className={`badge ${statusVisual.className}`}>
                  <span className="d" />
                  {statusVisual.label}
                </span>
              </div>
            </div>

            {/* --- Active add-ons --- */}
            <div className="sub-block">
              <h2 className="sub-block-title">Módulos ativos</h2>
              {activeAddons.length > 0 ? (
                <ul className="tick-list">
                  {activeAddons.map(([id]) => (
                    <li key={id} className="ok">
                      <BrandIcon name="check" />
                      {ADDON_LABELS[id] ?? id}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{ fontSize: 13.5 }}>
                  Nenhum módulo adicional contratado.
                </p>
              )}
            </div>

            {/* --- Plan limits --- */}
            {limitEntries.length > 0 && (
              <div className="sub-block">
                <h2 className="sub-block-title">Limites do plano</h2>
                <div className="limit-grid">
                  {limitEntries.map(([key, value]) => (
                    <div key={key} className="limit-item">
                      <div className="limit-value">
                        {value < 0 ? "Ilimitado" : value}
                      </div>
                      <div className="limit-label">{LIMIT_LABELS[key] ?? key}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Manage subscription (Stripe Billing Portal handoff) --- */}
            <div className="sub-block">
              <button
                type="button"
                className="btn btn--primary"
                onClick={openPortal}
                disabled={portalPending}
              >
                <BrandIcon name="edit" />
                {portalPending ? "Abrindo portal…" : "Gerenciar assinatura"}
              </button>

              {noBillingAccount && (
                <div role="alert" className="portal-alert">
                  <p style={{ margin: 0 }}>
                    Sua clínica ainda não tem uma assinatura via checkout.
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
        </main>
      )}
    </>
  );
}
