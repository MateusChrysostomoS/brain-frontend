"use client";
// ===== secretarIA — product Header =====
// Ported from _design-source/header.jsx.
// Renders: Logo wordmark | spacer | user dropdown | theme toggle | Sair button.
// The parent owns `theme` state and passes `onToggleTheme` down.
//
// De-demo (Feature F): when a real brain session exists, shows the logged-in
// user's real name/role (GET /auth/me) and the real clinic name — from the
// optional `clinicName` prop when the caller already has it (e.g. Configuração
// already loaded the hub tenant config), else from auth/me's own tenant.
// CURRENT_USER/CLINIC demo constants are the fallback ONLY while logged out
// (or before the auth/me fetch settles), so the showcase keeps working.

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Btn, Icon, IconBtn } from "./ui";
import type { IconName } from "./ui";
import { CLINIC, CURRENT_USER } from "./data";
import { signOut } from "@/lib/sign-out";
import { getMe, getSession, type MeResponse } from "@/lib/manage-api";

// Short PT-BR labels for the roles that can reach this product header.
// Legacy tenant_owner/tenant_staff kept as a display fallback until the
// backfill migration runs (role-taxonomy transition).
const ROLE_LABEL: Record<string, string> = {
  doctor: "Médico(a)",
  manager: "Gestor(a)",
  admin: "Administrador",
  tenant_owner: "Proprietário(a)",
  tenant_staff: "Equipe",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = "light" | "dark";

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

/**
 * secretarIA wordmark — "secretar" in regular weight, "IA" italicised in
 * brand colour. Rendered with the serif variable font for typographic identity.
 */
export function Logo() {
  return (
    <div style={{
      display: "flex", alignItems: "baseline",
      fontFamily: "var(--font-serif)", userSelect: "none",
    }}>
      <span style={{ fontSize: 27, fontWeight: 500, color: "var(--ink)", letterSpacing: "-.01em" }}>
        secretar
      </span>
      <span style={{ fontSize: 27, fontWeight: 500, fontStyle: "italic", color: "var(--brand)", letterSpacing: "-.01em" }}>
        IA
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MenuItem — internal dropdown item
// ---------------------------------------------------------------------------

/**
 * Single row inside the user dropdown menu.
 * Internal to this file — not consumed outside the Header.
 */
function MenuItem({ icon, label }: { icon: IconName; label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 11,
        width: "100%", padding: "9px 10px", borderRadius: 9,
        fontSize: 13.5, fontWeight: 500, color: "var(--ink-soft)",
        background: hov ? "var(--surface-2)" : "transparent",
        border: "none", cursor: "pointer", transition: "background .14s",
      } satisfies CSSProperties}
    >
      <Icon name={icon} size={16} style={{ color: "var(--ink-faint)" }} />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

/**
 * Top bar for all secretarIA product screens.
 * Hosts the Logo, the user cluster (avatar + name + dropdown), a theme
 * toggle IconBtn, and the "Sair" button.
 */
export function Header({
  theme,
  onToggleTheme,
  clinicName,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  // Optional override for the clinic name — pass the hub tenant config's
  // clinic_name once the caller has it loaded (see Configuração page.tsx).
  // Falls back to auth/me's tenant, then to the CLINIC demo constant.
  clinicName?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Real identity (Feature F) — fetched once from GET /auth/me when a session
  // exists. Stays null while logged out, so every render below falls back to
  // the demo constants (CURRENT_USER/CLINIC) — the showcase keeps working.
  const [me, setMe] = useState<MeResponse | null>(null);
  useEffect(() => {
    const session = getSession();
    if (!session) return;
    let cancelled = false;
    getMe(session)
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        // Expired/invalid session — HubNotice-style pages already surface a
        // "faça login" notice; the header just keeps showing the demo name.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // First name only for compact display in the trigger button
  const fullName = me?.user.name || CURRENT_USER.name;
  const displayName = fullName.split(" ")[0];
  const roleLabel = me ? (ROLE_LABEL[me.user.role] ?? me.user.role) : CURRENT_USER.role;

  // Clinic name without the "Consultório " prefix for the compact subtitle
  const resolvedClinicName = clinicName || me?.tenant?.clinic_name || CLINIC.name;
  const clinicShort = resolvedClinicName.replace("Consultório ", "");

  return (
    <header style={{
      height: 64, flexShrink: 0,
      display: "flex", alignItems: "center", gap: 24,
      padding: "0 26px",
      background: "var(--page-grad)", borderBottom: "1px solid var(--line)",
      position: "relative", zIndex: 30,
    }}>
      <Logo />

      {/* flexible spacer pushes user cluster to the right */}
      <div style={{ flex: 1 }} />

      {/* --- user cluster --- */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* dropdown trigger */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(m => !m)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "5px 12px 5px 5px", borderRadius: 999,
              background: menuOpen ? "var(--surface-2)" : "transparent",
              border: "none", cursor: "pointer", transition: "background .15s",
            }}
          >
            <Avatar name={fullName} size={30} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
              {displayName}
            </span>
            <Icon name="chevD" size={15} style={{ color: "var(--ink-faint)" }} />
          </button>

          {/* dropdown panel */}
          {menuOpen && (
            <>
              {/* invisible backdrop — closes menu on outside click */}
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
              />

              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: 232, zIndex: 41,
                background: "var(--surface)", border: "1px solid var(--line-strong)",
                borderRadius: 14, boxShadow: "var(--shadow-lg)",
                padding: 8, animation: "popIn .16s var(--ease)",
              }}>
                {/* user identity row */}
                <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px 12px" }}>
                  <Avatar name={fullName} size={38} />
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
                      {roleLabel} · {clinicShort}
                    </div>
                  </div>
                </div>

                {/* divider */}
                <div style={{ height: 1, background: "var(--line)", margin: "2px 4px 6px" }} />

                <MenuItem icon="user" label="Meu perfil" />
                <MenuItem icon="bell" label="Notificações" />
              </div>
            </>
          )}
        </div>

        {/* theme toggle — icon flips between sun and moon */}
        <IconBtn
          icon={theme === "dark" ? "sun" : "moon"}
          onClick={onToggleTheme}
          title={theme === "dark" ? "Tema claro" : "Tema escuro"}
        />

        {/* sign-out — same behavior as the admin/doctor/"/app" Sair buttons:
            best-effort refresh-token revocation, local session cleared first,
            then /login. Harmless when there is no session (demo mode). */}
        <Btn
          variant="outline"
          size="sm"
          style={{ borderRadius: 12, padding: "9px 18px" }}
          onClick={() => signOut((path) => router.push(path))}
        >
          Sair
        </Btn>
      </div>
    </header>
  );
}
