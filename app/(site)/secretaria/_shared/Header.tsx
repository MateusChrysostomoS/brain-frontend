"use client";
// ===== secretarIA — product Header =====
// Ported from _design-source/header.jsx.
// Renders: Logo wordmark | spacer | user dropdown | theme toggle | Sair button.
// The parent owns `theme` state and passes `onToggleTheme` down.

import { useState } from "react";
import type { CSSProperties } from "react";
import { Avatar, Btn, Icon, IconBtn } from "./ui";
import type { IconName } from "./ui";
import { CLINIC, CURRENT_USER } from "./data";

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
}: {
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // First name only for compact display in the trigger button
  const displayName = CURRENT_USER.name.split(" ")[0];

  // Clinic name without the "Consultório " prefix for the compact subtitle
  const clinicShort = CLINIC.name.replace("Consultório ", "");

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
            <Avatar name={CURRENT_USER.name} size={30} />
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
                  <Avatar name={CURRENT_USER.name} size={38} />
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>
                      {CURRENT_USER.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-faint)" }}>
                      {CURRENT_USER.role} · {clinicShort}
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

        {/* sign-out */}
        <Btn variant="outline" size="sm" style={{ borderRadius: 12, padding: "9px 18px" }}>
          Sair
        </Btn>
      </div>
    </header>
  );
}
