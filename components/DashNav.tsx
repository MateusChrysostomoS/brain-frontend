"use client";

// DashNav — shared sticky top bar for /dashboard, /summary, /inbound,
// /metrics and /users. Holds the brand, a segmented tab computed from the
// user's access areas (clínico / métricas / admin), the role chip, inline
// theme toggle and Sair button. Each route supplies the matching scoped CSS
// (.dash-route / .patient-route / .inbound-route / .metrics-route /
// .users-route) for the `.dash-nav` class family.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentTheme, toggleTheme, type Theme } from "@/lib/theme";

type DashNavProps = {
  clinic?: string;
  role?: string;
  // Doctor/admin who is ALSO a manager (users.is_manager) — unlocks the
  // Métricas tab alongside their normal area.
  isManager?: boolean;
  onLogout: () => void;
};

export default function DashNav({ clinic, role, isManager, onLogout }: DashNavProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Read the resolved theme after hydration to avoid SSR ↔ client mismatch.
  // The icon swap is driven by [data-theme] in CSS, so SSR can render either
  // SVG — `mounted` only gates the aria-label.
  useEffect(() => {
    setTheme(getCurrentTheme());
    setMounted(true);
  }, []);

  function handleToggle() {
    setTheme(toggleTheme());
  }

  const initial = (clinic?.trim()?.[0] || "P").toUpperCase();
  const toggleLabel = mounted
    ? theme === "light"
      ? "Ativar tema escuro"
      : "Ativar tema claro"
    : "Alternar tema";

  // Tabs by access area (mirrors the backend gates):
  //   clinical (/dashboard)      — admin and doctor;
  //   metrics  (/metrics)        — admin, manager and is_manager;
  //   admin    (/inbound, /users) — admin only.
  // An area that resolves to nothing just doesn't become a tab — a plain
  // doctor or a plain manager never sees the tab bar at all (tabs.length <= 1).
  const canClinical = role === "admin" || role === "doctor";
  const canMetrics = role === "admin" || role === "manager" || !!isManager;
  const tabs = [
    ...(canClinical ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(canMetrics ? [{ href: "/metrics", label: "Métricas" }] : []),
    ...(role === "admin"
      ? [
          { href: "/inbound", label: "Inbound" },
          { href: "/users", label: "Usuários" },
        ]
      : []),
  ];
  const showAdminTabs = tabs.length > 1;

  return (
    <nav className="dash-nav">
      <div className="dash-nav-inner">
        <div className="dash-nav-left">
          <Link href="/" className="dash-brand" aria-label="PreCheck">
            Pre<em>Check</em>
          </Link>

          {showAdminTabs && (
            <div className="dash-tabs" role="tablist" aria-label="Áreas do painel">
              {tabs.map((tab) => {
                const active = pathname?.startsWith(tab.href) ?? false;
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`dash-tab${active ? " active" : ""}`}
                    role="tab"
                    aria-selected={active}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="dash-nav-right">
          <span className="dash-role">
            <span className="avatar" aria-hidden="true">
              {initial}
            </span>
            {/* Name is hidden on very narrow screens (CSS); the avatar keeps
                identity while freeing room for the brand + controls row. */}
            <span className="dash-clinic-name">{clinic || "Painel Clínico"}</span>
          </span>

          <button
            type="button"
            className="theme-toggle"
            onClick={handleToggle}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            {/* Moon = shown in light mode, hidden in dark via CSS. */}
            <svg
              className="moon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg
              className="sun"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
            </svg>
          </button>

          <button
            type="button"
            className="dash-signout"
            onClick={onLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
