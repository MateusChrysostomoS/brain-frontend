"use client";

// /app — Unified post-login dashboard shell.
// Reads session from sessionStorage, calls getEntitlements(), then renders the
// appropriate panel (PreCheck / secretarIA / no-entitlements) gated by tenant
// entitlements. PreCheckPanel/SecretariaPanel (./_components) own their own real
// data fetch, filters and pagination — this file only owns session boot,
// entitlement gating and the tab switcher. Originally ported from
// _design-source/dashboard.html; that file's PC_DATA/SA_DATA mock rows have since
// been fully replaced by real brain-api calls (see the panel components).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandGlyph } from "../_components/BrandGlyph";
import { BrandIcon } from "../_components/BrandIcon";
import { ThemeToggle } from "../_components/ThemeToggle";
import { PreCheckPanel } from "./_components/PreCheckPanel";
import { SecretariaPanel } from "./_components/SecretariaPanel";
import {
  clearSession,
  getEntitlements,
  getPrecheckSsoToken,
  getSession,
  logout,
  ManageApiError,
  type Entitlements,
  type Session,
} from "@/lib/manage-api";
import { setToken } from "@/lib/auth";
import "./dashboard-shell.css";

// NoEntitlementsPanel — lock empty state shown when clinic has no active products.
function NoEntitlementsPanel() {
  return (
    <section className="panel">
      <div className="empty-ent">
        <span className="feat-ico">
          <BrandIcon name="lock" />
        </span>
        <h2 className="h-card" style={{ fontSize: 24 }}>
          Sua clínica ainda não tem um produto ativo
        </h2>
        <p className="muted mt-s">
          Fale com a Brain para liberar o PreCheck, a secretarIA, ou os dois para o seu consultório.
        </p>
        <a className="btn btn--primary mt-l" href="/#contato">
          Agendar demonstração
        </a>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page — root component for the /app route.
// Manages async boot: reads session → calls getEntitlements → updates state.
// ---------------------------------------------------------------------------
export default function AppPage() {
  // --- State ---
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const [clinicLabel, setClinicLabel] = useState("Administrador");
  // Active product tab; resolved after entitlements load
  const [activeTab, setActiveTab] = useState<"precheck" | "secretaria">("precheck");
  // Session kept in state for the PreCheck SSO handoff (POST /sso/precheck/token)
  // and passed down to the panels, which own their own real data fetches.
  const [session, setSession] = useState<Session | null>(null);
  // "Abrir PreCheck" handoff UI state.
  const [ssoPending, setSsoPending] = useState(false);
  const [ssoError, setSsoError] = useState<string | null>(null);

  // --- Boot: require a session, then fetch entitlements from brain-api ---
  useEffect(() => {
    const current = getSession();
    if (!current?.token) {
      // Not logged in — send the user to the unified login.
      router.replace("/login");
      return;
    }
    setSession(current);
    getEntitlements(current)
      .then((e) => {
        setEnt(e);
        // Strip "Consultório " prefix; fall back to "Administrador"
        setClinicLabel(
          e.clinicName ? e.clinicName.replace("Consultório ", "") : "Administrador",
        );
        // Default active tab: precheck if entitled, else secretaria
        setActiveTab(e.precheck ? "precheck" : "secretaria");
        setLoading(false);
      })
      .catch(() => {
        // Expired/invalid session (401) — clear it and bounce to login.
        clearSession();
        router.replace("/login");
      });
  }, [router]);

  // --- PreCheck SSO handoff ---
  // Exchange the brain session for a PreCheck-compatible token, store it as PreCheck's
  // own `precheck_token` (same origin as /dashboard), then navigate. The ported dashboard
  // reads that token and calls the real PreCheck backend — no second login.
  async function openPrecheck() {
    if (!session) return;
    setSsoError(null);
    setSsoPending(true);
    try {
      const { token } = await getPrecheckSsoToken(session);
      setToken(token);
      router.push("/dashboard");
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      setSsoError(
        status === 403
          ? "Sua clínica não tem o PreCheck habilitado."
          : status === 409
            ? "Sua conta ainda não está conectada ao PreCheck. Peça ao administrador da clínica para vincular seu acesso."
            : "Não foi possível abrir o PreCheck agora. Tente novamente.",
      );
      setSsoPending(false); // on success we navigate away, so only reset on failure
    }
  }

  // --- Derived: which tab is logically active given current entitlements ---
  const resolvedTab =
    ent && !ent[activeTab]
      ? ent.precheck
        ? "precheck"
        : "secretaria"
      : activeTab;

  // Whether to show the tab switcher (only when both products are entitled)
  const showTabs = ent?.precheck && ent?.secretaria;

  // Initials for the avatar — take first letter of clinic label
  const avatarInitial = clinicLabel.charAt(0).toUpperCase();

  // --- Render ---
  return (
    <>
      {/* ==================== HEADER ==================== */}
      <header className="dash-header">
        <div className="container dash-nav">
          {/* Brand mark → home */}
          <Link className="brand-mark" href="/" aria-label="Brain">
            <BrandGlyph size={28} />
            <span className="wordmark" style={{ fontSize: 22 }}>
              Brain
            </span>
          </Link>

          {/* Product tab switcher — hidden when only one product is entitled */}
          {showTabs && (
            <div className="prod-tabs" role="tablist">
              {ent?.precheck && (
                <button
                  className={`prod-tab${resolvedTab === "precheck" ? " on" : ""}`}
                  role="tab"
                  aria-selected={resolvedTab === "precheck"}
                  onClick={() => setActiveTab("precheck")}
                >
                  <BrandIcon name="note" />
                  PreCheck
                </button>
              )}
              {ent?.secretaria && (
                <button
                  className={`prod-tab${resolvedTab === "secretaria" ? " on" : ""}`}
                  role="tab"
                  aria-selected={resolvedTab === "secretaria"}
                  onClick={() => setActiveTab("secretaria")}
                >
                  <BrandIcon name="whatsapp" />
                  secretarIA
                </button>
              )}
            </div>
          )}

          {/* User cluster: theme toggle, avatar, clinic name, sign-out */}
          <div className="dash-user">
            <ThemeToggle />
            <span className="uava" aria-hidden="true">
              {avatarInitial}
            </span>
            <span className="uname">{clinicLabel}</span>
            <Link className="btn btn--ghost btn--sm" href="/app/billing">
              Assinatura
            </Link>
            <Link
              className="btn btn--outline btn--sm"
              href="/login"
              // Best-effort server-side refresh-token revocation; the local
              // session is cleared unconditionally inside logout() first, so
              // this can never leave the user "stuck logged in".
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
            Carregando entitlements…
          </div>
        </div>
      )}

      {/* ==================== MAIN ==================== */}
      {!loading && ent && session && (
        <main className="dash-main">
          {resolvedTab === "precheck" && ent.precheck && (
            <PreCheckPanel
              session={session}
              onOpen={openPrecheck}
              ssoPending={ssoPending}
              ssoError={ssoError}
            />
          )}
          {resolvedTab === "secretaria" && ent.secretaria && (
            <SecretariaPanel session={session} />
          )}
          {!ent.precheck && !ent.secretaria && <NoEntitlementsPanel />}
        </main>
      )}
    </>
  );
}
