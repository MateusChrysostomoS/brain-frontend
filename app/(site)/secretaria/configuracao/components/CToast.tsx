"use client";
// CToast — fixed bottom-center toast notification strip.
// Appears above the sticky save bar (bottom: 88px) and auto-dismisses
// after the parent clears the `toast` prop to null.
// The popIn animation comes from app-shell.css / product-tokens.css keyframes.

import { Icon } from "../../_shared/ui";

type CToastProps = {
  toast: string | null;
};

// Renders a success toast pill when toast is non-null; returns null otherwise.
export function CToast({ toast }: CToastProps) {
  if (!toast) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 88,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 80,
      animation: "popIn .25s var(--ease)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "13px 20px",
        borderRadius: 14,
        background: "#0e564d",
        color: "#eafff4",
        boxShadow: "var(--shadow-lg)",
        fontSize: 14,
        fontWeight: 500,
      }}>
        {/* icon chip */}
        <span style={{
          width: 26, height: 26, borderRadius: 99,
          background: "rgba(255,255,255,.16)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="check" size={15} />
        </span>
        {toast}
      </div>
    </div>
  );
}
