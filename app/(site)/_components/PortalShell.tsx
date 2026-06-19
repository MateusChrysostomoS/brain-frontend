"use client";

// PortalShell — shared chrome for the role portals (/admin/*, /doctor/*).
// Renders the Brain header (brand + portal label + theme toggle + user + Sair) and a
// left sidebar nav, with the route's page in <main>. Theme-aware via brand-ds.css tokens
// (light default, dark via ThemeToggle) — it does NOT invent a new design system.
// Owns no data; the layouts pass nav items + user label + logout.

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BrandGlyph } from "./BrandGlyph";
import { BrandIcon, type IconName } from "./BrandIcon";
import { ThemeToggle } from "./ThemeToggle";
import "./PortalShell.css";

export type PortalNavItem = {
  href: string;
  label: string;
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
}: PortalShellProps) {
  const pathname = usePathname();
  const initial = (userLabel.trim()[0] || "B").toUpperCase();

  return (
    <div className="portal">
      {/* --- Header --- */}
      <header className="portal-header">
        <Link href="/" className="portal-brand" aria-label="Brain">
          <BrandGlyph size={26} />
          <span className="portal-wordmark">Brain</span>
          <span className="portal-label">{portalLabel}</span>
        </Link>

        <div className="portal-header-right">
          <ThemeToggle />
          <span className="portal-user">
            <span className="portal-avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="portal-user-label">{userLabel}</span>
          </span>
          <button type="button" className="btn btn--outline btn--sm" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

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
