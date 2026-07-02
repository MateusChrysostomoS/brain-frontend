"use client";

// DoctorLayout — guards the /doctor/* portal (roles tenant_owner / tenant_staff) and
// renders the shared PortalShell with the doctor sidebar. An admin token is bounced to
// /admin/dashboard (wrong portal); an absent session goes to /login. brain-api also
// re-checks the role on every /doctor/* call.
//
// When an admin entered via "Modo médico" (CONTRACTS §11.4), the session IS a real doctor
// token, so the guard passes normally — we just surface a banner making the impersonation
// explicit and offering "Voltar ao admin" (restores the stashed admin session).

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandIcon } from "../_components/BrandIcon";
import { PortalShell, type PortalNavItem } from "../_components/PortalShell";
import { clearSession, usePortalGuard } from "../_components/usePortalGuard";
import {
  exitDoctorMode,
  getImpersonation,
  type ImpersonationMarker,
} from "@/lib/manage-api";

// Doctor sidebar nav (RBAC task 3C): Agenda · Pacientes · Anamneses (PreCheck) · Configurações.
const DOCTOR_NAV: PortalNavItem[] = [
  { href: "/secretaria/agenda", label: "Agenda", icon: "calendar" },
  { href: "/doctor/pacientes", label: "Pacientes", icon: "users" },
  { href: "/doctor/anamneses", label: "Anamneses (PreCheck)", icon: "note" },
  { href: "/secretaria/configuracao", label: "Configurações", icon: "sliders" },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["tenant_owner", "tenant_staff"]);
  // Read the impersonation marker AFTER mount — sessionStorage is client-only, so reading it
  // during render would risk a hydration mismatch in the static export.
  const [impersonation, setImpersonation] = useState<ImpersonationMarker | null>(null);
  useEffect(() => {
    setImpersonation(getImpersonation());
  }, []);

  function logout() {
    clearSession();
    router.push("/login");
  }

  // Leave "Modo médico": restore the admin session and return to the admin portal (or to
  // /login if there was nothing to restore — e.g. a reload cleared the stash).
  function backToAdmin() {
    const restored = exitDoctorMode();
    router.push(restored ? "/admin/dashboard" : "/login");
  }

  if (!ready || !session) {
    return (
      <div className="portal-loading" aria-live="polite">
        <div className="portal-spinner" aria-hidden="true" />
        <div>Carregando…</div>
      </div>
    );
  }

  const impersonationBanner = impersonation ? (
    <div className="portal-banner" role="status">
      <BrandIcon name="user" />
      <span>
        Modo médico — você está vendo a clínica{" "}
        <span className="portal-banner-strong">{impersonation.clinicName}</span> como
        administrador.
      </span>
      <button
        type="button"
        className="btn btn--outline btn--sm portal-banner-spacer"
        onClick={backToAdmin}
      >
        Voltar ao admin
        <BrandIcon name="arrowR" />
      </button>
    </div>
  ) : undefined;

  return (
    <PortalShell
      portalLabel="Clínica"
      userLabel={impersonation ? impersonation.clinicName : session.email}
      nav={DOCTOR_NAV}
      onLogout={logout}
      banner={impersonationBanner}
    >
      {children}
    </PortalShell>
  );
}
