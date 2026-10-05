"use client";

// DoctorLayout - account-only portal for clinic roles; clinical work lives in Brain-Message.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackToAdminButton } from "../_components/BackToAdminButton";
import { PortalShell, type PortalNavItem } from "../_components/PortalShell";
import { useImpersonation } from "../_components/useImpersonation";
import { usePortalGuard } from "../_components/usePortalGuard";
import { logout } from "@/lib/manage-api";
import "./account.css";

const ACCOUNT_NAV: PortalNavItem[] = [
  { href: "/doctor/perfil", label: "Meu Perfil", icon: "user" },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
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
      headerActions={
        <>
          <Link href="/app/billing" className="btn btn--outline btn--sm">Assinatura</Link>
          <BackToAdminButton />
        </>
      }
    >
      {children}
    </PortalShell>
    </div>
  );
}
