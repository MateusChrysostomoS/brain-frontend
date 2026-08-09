"use client";

// DoctorLayout — guards the /doctor/* portal (roles doctor / manager) and
// renders the shared PortalShell with the doctor sidebar. An admin token is bounced to
// /admin/dashboard (wrong portal); an absent session goes to /login. brain-api also
// re-checks the role on every /doctor/* call.
//
// When an admin entered via "Modo médico" (CONTRACTS §11.4), the session IS a real doctor
// token, so the guard passes normally — the impersonation is surfaced by the header's
// BackToAdminButton, next to the account name, mirroring the admin-side switch.

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BackToAdminButton } from "../_components/BackToAdminButton";
import { PortalShell, type PortalNavItem } from "../_components/PortalShell";
import type { PortalProduct } from "../_components/ProductLockup";
import { SecretariaWordmark } from "../_components/SecretariaWordmark";
import { useImpersonation } from "../_components/useImpersonation";
import { usePortalGuard } from "../_components/usePortalGuard";
import { getDoctorMe, logout } from "@/lib/manage-api";

// Which product gates a nav item, or null for items every doctor should always see
// (e.g. a future "Dashboard" entry). Kept alongside DOCTOR_NAV so the mapping is
// obvious at a glance instead of living in a separate lookup table.
type DoctorNavItem = PortalNavItem & { product: PortalProduct | null };

// Doctor sidebar nav (RBAC task 3C): Agenda · Pacientes · Anamneses ·
// Configurações secretarIA · Meu Perfil. Agenda/Pacientes/Configurações are
// secretarIA-backed (see /doctor/pacientes); Anamneses is PreCheck-backed. Every
// product-gated item is filtered below once entitlements are known; `product: null`
// (Meu Perfil) is account-level, not product-gated, so it always shows regardless of
// which products the tenant has.
//
// `product` doubles as the source for the header's product lockup — see
// productForPath below: the nav already knows which product backs each route.
const DOCTOR_NAV: DoctorNavItem[] = [
  { href: "/secretaria/agenda", label: "Agenda", icon: "calendar", product: "secretaria" },
  { href: "/doctor/pacientes", label: "Pacientes", icon: "users", product: "secretaria" },
  {
    href: "/doctor/anamneses",
    label: "Anamneses",
    icon: "note",
    product: "precheck",
  },
  {
    href: "/secretaria/configuracao",
    label: (
      <>
        Configurações <SecretariaWordmark />
      </>
    ),
    icon: "sliders",
    product: "secretaria",
  },
  { href: "/doctor/perfil", label: "Meu Perfil", icon: "user", product: null },
];

// Which product lockup the header shows for the current route. Derived from
// DOCTOR_NAV so there is a single mapping of route -> product; routes not in the
// nav (e.g. /doctor/dashboard) are deliberately product-neutral.
function productForPath(pathname: string | null): PortalProduct | undefined {
  if (!pathname) return undefined;
  const path = pathname.replace(/\/+$/, "");
  const match = DOCTOR_NAV.find(
    (item) => path === item.href || path.startsWith(item.href + "/"),
  );
  return match?.product ?? undefined;
}

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // legacy values accepted during the role-taxonomy transition
  const { session, ready } = usePortalGuard(["doctor", "manager", "tenant_owner", "tenant_staff"]);
  // "Modo médico" marker — only used here to label the account as the clinic; the
  // way back out is owned by BackToAdminButton.
  const { impersonation } = useImpersonation();

  // Nav gating (UX only): fetch entitlements once the guard passes so product-gated nav
  // items only show for products the tenant actually has. `null` = still loading,
  // `"failed"` = the fetch errored — in both cases the filter below decides what to show.
  const [products, setProducts] = useState<{ precheck: boolean; secretaria: boolean } | "failed" | null>(
    null,
  );
  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;
    getDoctorMe(session)
      .then((data) => {
        if (!cancelled) setProducts(data.entitlements.products);
      })
      .catch(() => {
        // Fail OPEN: the backend still 403s per-route, so hiding nothing on a fetch
        // failure only risks a dead-end click, never a permissions gap.
        if (!cancelled) setProducts("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [ready, session]);

  // While entitlements are loading, show only neutral (ungated) items so nothing
  // forbidden flashes before the fetch resolves.
  const nav: PortalNavItem[] = DOCTOR_NAV.filter(({ product }) => {
    if (!product) return true;
    if (products === "failed") return true;
    if (!products) return false;
    return products[product];
  }).map(({ href, label, icon }) => ({ href, label, icon }));

  // "Sair": logout() clears the local session synchronously before it awaits the
  // network revoke, so navigating immediately (without awaiting) is safe.
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
    <PortalShell
      portalLabel="Clínica"
      userLabel={impersonation ? impersonation.clinicName : session.email}
      nav={nav}
      onLogout={handleLogout}
      product={productForPath(pathname)}
      // Renders itself only under "Modo médico" — see BackToAdminButton.
      headerActions={<BackToAdminButton />}
    >
      {children}
    </PortalShell>
  );
}
