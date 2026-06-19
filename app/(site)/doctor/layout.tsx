"use client";

// DoctorLayout — guards the /doctor/* portal (roles tenant_owner / tenant_staff) and
// renders the shared PortalShell with the doctor sidebar. An admin token is bounced to
// /admin/dashboard (wrong portal); an absent session goes to /login. brain-api also
// re-checks the role on every /doctor/* call.

import { useRouter } from "next/navigation";

import { PortalShell, type PortalNavItem } from "../_components/PortalShell";
import { clearSession, usePortalGuard } from "../_components/usePortalGuard";

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

  function logout() {
    clearSession();
    router.push("/login");
  }

  if (!ready || !session) {
    return (
      <div className="portal-loading" aria-live="polite">
        <div className="portal-spinner" aria-hidden="true" />
        <div>Carregando…</div>
      </div>
    );
  }

  return (
    <PortalShell
      portalLabel="Clínica"
      userLabel={session.email}
      nav={DOCTOR_NAV}
      onLogout={logout}
    >
      {children}
    </PortalShell>
  );
}
