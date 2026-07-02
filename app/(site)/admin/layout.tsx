"use client";

// AdminLayout — guards the /admin/* portal (role=admin) and renders the shared
// PortalShell with the admin sidebar. A non-admin session is bounced to its own portal
// by usePortalGuard; an absent session goes to /login. Server-side, every brain-api
// /admin/* call independently re-checks the admin role.
//
// The header also carries the "Modo médico" switch: an admin one-click into the doctor
// portal as the demo clinic's doctor (CONTRACTS §11.4) — a dev affordance for working on
// the doctor-facing website + API with real PreCheck/secretarIA data.

import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandIcon } from "../_components/BrandIcon";
import { PortalShell, type PortalNavItem } from "../_components/PortalShell";
import { clearSession, usePortalGuard } from "../_components/usePortalGuard";
import { enterDoctorMode, ManageApiError } from "@/lib/manage-api";

// Admin sidebar nav (RBAC task 3B): Dashboard · Tenants · Usuários · Demo Requests · Inbound.
const ADMIN_NAV: PortalNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "shield" },
  { href: "/admin/tenants", label: "Tenants", icon: "server" },
  { href: "/admin/users", label: "Usuários", icon: "users" },
  { href: "/admin/demo-requests", label: "Demo Requests", icon: "note" },
  { href: "/admin/inbound", label: "Inbound", icon: "send" },
];

// Turn a failed "Modo médico" handoff into a PT-BR message. 401 is handled separately
// (the admin session is dead → bounce to login), so it is not mapped here.
function describeDoctorModeError(error: unknown): string {
  if (error instanceof ManageApiError) {
    if (error.status === 404) {
      return "A clínica de demonstração não está configurada neste ambiente. Rode o seed de desenvolvimento ou ajuste IMPERSONATION_DEMO_EMAIL na brain-api.";
    }
    if (error.status === 403) {
      return "Apenas administradores podem entrar no modo médico.";
    }
  }
  return "Não foi possível entrar no modo médico agora. Tente novamente.";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["admin"]);
  // "Modo médico" handoff state.
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  function logout() {
    clearSession();
    router.push("/login");
  }

  // Enter the doctor portal as the demo clinic's doctor. On success the session is now a
  // tenant token, so /doctor/dashboard's own guard passes; on 401 the admin token expired.
  async function enterDoctorModeHandler() {
    if (!session) return;
    setSwitchError(null);
    setSwitching(true);
    try {
      await enterDoctorMode(session);
      router.push("/doctor/dashboard");
    } catch (error) {
      if (error instanceof ManageApiError && error.status === 401) {
        clearSession();
        router.replace("/login");
        return;
      }
      setSwitching(false);
      setSwitchError(describeDoctorModeError(error));
    }
  }

  // Hold the shell until the role check passes (avoids a flash of the wrong portal).
  if (!ready || !session) {
    return (
      <div className="portal-loading" aria-live="polite">
        <div className="portal-spinner" aria-hidden="true" />
        <div>Carregando…</div>
      </div>
    );
  }

  const doctorModeButton = (
    <button
      type="button"
      className="btn btn--outline btn--sm"
      onClick={enterDoctorModeHandler}
      disabled={switching}
      title="Entrar no portal do médico como a clínica de demonstração"
    >
      <BrandIcon name="swap" />
      {switching ? "Entrando…" : "Modo médico"}
    </button>
  );

  const errorBanner = switchError ? (
    <div className="portal-banner portal-banner--error" role="alert">
      <BrandIcon name="ban" />
      <span>{switchError}</span>
      <button
        type="button"
        className="btn btn--ghost btn--sm portal-banner-spacer"
        onClick={() => setSwitchError(null)}
      >
        Fechar
      </button>
    </div>
  ) : undefined;

  return (
    <PortalShell
      portalLabel="Admin"
      userLabel={session.email}
      nav={ADMIN_NAV}
      onLogout={logout}
      headerActions={doctorModeButton}
      banner={errorBanner}
    >
      {children}
    </PortalShell>
  );
}
