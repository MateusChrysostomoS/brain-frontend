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
import { usePortalGuard } from "../_components/usePortalGuard";
import {
  exitDoctorMode,
  getDoctorMe,
  getImpersonation,
  logout,
  type ImpersonationMarker,
} from "@/lib/manage-api";

// Which product gates a nav item, or null for items every doctor should always see
// (e.g. a future "Dashboard" entry). Kept alongside DOCTOR_NAV so the mapping is
// obvious at a glance instead of living in a separate lookup table.
type DoctorNavItem = PortalNavItem & { product: "precheck" | "secretaria" | null };

// Doctor sidebar nav (RBAC task 3C): Agenda · Pacientes · Anamneses (PreCheck) · Configurações.
// Agenda/Pacientes/Configurações are secretarIA-backed (see /doctor/pacientes); Anamneses is
// PreCheck-backed. Every item here is product-gated below once entitlements are known.
const DOCTOR_NAV: DoctorNavItem[] = [
  { href: "/secretaria/agenda", label: "Agenda", icon: "calendar", product: "secretaria" },
  { href: "/doctor/pacientes", label: "Pacientes", icon: "users", product: "secretaria" },
  {
    href: "/doctor/anamneses",
    label: "Anamneses (PreCheck)",
    icon: "note",
    product: "precheck",
  },
  {
    href: "/secretaria/configuracao",
    label: "Configurações",
    icon: "sliders",
    product: "secretaria",
  },
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
      nav={nav}
      onLogout={handleLogout}
      banner={impersonationBanner}
    >
      {children}
    </PortalShell>
  );
}
