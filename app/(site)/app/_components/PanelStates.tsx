// PanelStates — shared loading/empty/error visuals for the /app dashboard panels
// (PreCheckPanel, SecretariaPanel). Pure presentational, no hooks/browser APIs, so
// (like BrandIcon) it does NOT need "use client" — it just rides along inside
// whichever client component renders it.

import type { ReactNode } from "react";
import { BrandIcon, type IconName } from "../../_components/BrandIcon";

// PanelSkeleton — placeholder rows shaped like a real `.row-card`, shown while a
// panel's fetch is in flight. The bars are decorative (aria-hidden); the visible
// "Carregando…" label above them is what screen readers announce.
export function PanelSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="reg-count">Carregando…</span>
      <div className="rows" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <div className="row-card" key={i}>
            <div className="row-main">
              <div className="sk-bar" style={{ width: "38%", height: 14 }} />
              <div className="sk-bar" style={{ width: "58%", height: 11, marginTop: 8 }} />
            </div>
            <div className="sk-bar" style={{ width: 84, height: 22, borderRadius: 999, flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

type PanelMessageProps = {
  icon: IconName;
  title: string;
  hint?: string;
  action?: ReactNode;
  // "error" tints the icon chip red and marks the box as an ARIA alert; the
  // default (empty state / stub-unavailable) is a neutral brand tint.
  tone?: "neutral" | "error";
};

// PanelMessage — one shared shape for a panel's empty / stub-unavailable / error
// state: icon chip + title + optional hint line + optional action (e.g. a
// "Tentar novamente" retry button). Never renders a fabricated number in place of
// real data — callers only reach this component when there IS no data to show.
export function PanelMessage({ icon, title, hint, action, tone = "neutral" }: PanelMessageProps) {
  return (
    <div className="panel-state" role={tone === "error" ? "alert" : undefined}>
      <span className={`panel-state-ico${tone === "error" ? " tone-error" : ""}`}>
        <BrandIcon name={icon} />
      </span>
      <p className="panel-state-title">{title}</p>
      {hint && <p className="panel-state-hint">{hint}</p>}
      {action && <div className="panel-state-action">{action}</div>}
    </div>
  );
}
