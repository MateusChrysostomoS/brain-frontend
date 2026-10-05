"use client";

// ClinicAccountShell - shared profile and billing navigation for clinic accounts.
import { useRouter } from "next/navigation";
import { BackToAdminButton } from "./BackToAdminButton";
import { PortalShell, type PortalNavItem } from "./PortalShell";
import { useImpersonation } from "./useImpersonation";
import { usePortalGuard } from "./usePortalGuard";
import { logout } from "@/lib/manage-api";
import "./ClinicAccountShell.css";

const ACCOUNT_NAV: PortalNavItem[] = [
  { href: "/doctor/perfil", label: "Meu Perfil", icon: "user" },
  { href: "/app/billing", label: "Cobrança", icon: "note" },
];

export default function ClinicAccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["doctor", "manager", "secretary", "tenant_owner", "tenant_staff"]);
  const { impersonation } = useImpersonation();

  function handleLogout() {
    void logout();
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
    <div className="clinic-account">
    <PortalShell
      portalLabel="Clínica"
      userLabel={impersonation ? impersonation.clinicName : session.email}
      nav={ACCOUNT_NAV}
      onLogout={handleLogout}
      headerActions={<BackToAdminButton />}
    >
      {children}
    </PortalShell>
    </div>
  );
}
