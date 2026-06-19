"use client";

// AdminLayout — guards the /admin/* portal (role=admin) and renders the shared
// PortalShell with the admin sidebar. A non-admin session is bounced to its own portal
// by usePortalGuard; an absent session goes to /login. Server-side, every brain-api
// /admin/* call independently re-checks the admin role.

import { useRouter } from "next/navigation";

import { PortalShell, type PortalNavItem } from "../_components/PortalShell";
import { clearSession, usePortalGuard } from "../_components/usePortalGuard";

// Admin sidebar nav (RBAC task 3B): Dashboard · Tenants · Usuários · Demo Requests · Inbound.
const ADMIN_NAV: PortalNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "shield" },
  { href: "/admin/tenants", label: "Tenants", icon: "server" },
  { href: "/admin/users", label: "Usuários", icon: "users" },
  { href: "/admin/demo-requests", label: "Demo Requests", icon: "note" },
  { href: "/admin/inbound", label: "Inbound", icon: "send" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["admin"]);

  function logout() {
    clearSession();
    router.push("/login");
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

  return (
    <PortalShell
      portalLabel="Admin"
      userLabel={session.email}
      nav={ADMIN_NAV}
      onLogout={logout}
    >
      {children}
    </PortalShell>
  );
}
