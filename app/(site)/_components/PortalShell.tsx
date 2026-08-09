"use client";

// PortalShell — shared chrome for the role portals (/admin/*, /doctor/*).
// Renders PortalHeader plus a left sidebar nav, with the route's page in <main>.
// Theme-aware via brand-ds.css tokens (light default, dark via ThemeToggle) — it
// does NOT invent a new design system. Owns no data; the layouts pass nav items +
// user label + logout.
//
// The header itself lives in PortalHeader so the full-viewport secretarIA product
// screens, which can't use this scrolling sidebar+main grid, still get the exact
// same header.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BrandIcon, type IconName } from "./BrandIcon";
import { PortalHeader } from "./PortalHeader";
import type { PortalProduct } from "./ProductLockup";
import "./PortalShell.css";

export type PortalNavItem = {
  href: string;
  // ReactNode, not string: a label may embed a product wordmark
  // (e.g. "Configurações secretarIA", where "secretarIA" is stylized).
  label: ReactNode;
  icon: IconName;
};

type PortalShellProps = {
  // Short portal name shown next to the brand (e.g. "Admin", "Clínica").
  portalLabel: string;
  // Identity shown in the header (admin email or clinic name).
  userLabel: string;
  nav: PortalNavItem[];
  onLogout: () => void;
  children: ReactNode;
  // Which product backs the current route, if any — adds the product lockup next
  // to the Brain brand in the header without changing the brand itself.
  product?: PortalProduct;
  // Optional controls rendered in the header between the user identity and "Sair"
  // (e.g. the admin "Modo médico" switch). Omitted on portals that don't need them.
  headerActions?: ReactNode;
  // Optional full-width notice rendered directly under the header, above the body
  // (e.g. an admin error). Reserve it for transient alerts: persistent state
  // belongs in the header (see BackToAdminButton).
  banner?: ReactNode;
};

// Active when the current path equals the item or is nested under it (tolerant of the
// trailing slash that static export adds).
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  const p = pathname.replace(/\/+$/, "");
  return p === href || p.startsWith(href + "/");
}

export function PortalShell({
  portalLabel,
  userLabel,
  nav,
  onLogout,
  children,
  product,
  headerActions,
  banner,
}: PortalShellProps) {
  const pathname = usePathname();

  return (
    <div className="portal">
      <PortalHeader
        portalLabel={portalLabel}
        userLabel={userLabel}
        onLogout={onLogout}
        product={product}
        headerActions={headerActions}
      />

      {/* Optional full-width notice (e.g. an admin error) under the header. */}
      {banner}

      {/* --- Body: sidebar + content --- */}
      <div className="portal-body">
        <nav className="portal-sidebar" aria-label={`Navegação ${portalLabel}`}>
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`portal-nav-item${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <BrandIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}
