// StatusBadge — a pill showing a status with a semantic tone. The caller maps a
// domain status (lead pipeline, entitlement status, anamnesis status) to a tone +
// PT-BR label; this component owns only the visual. Classes are in PortalShell.css.

import type { ReactNode } from "react";

export type BadgeTone = "green" | "amber" | "red" | "blue" | "muted";

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: BadgeTone;
  children: ReactNode;
  // Optional extra class (e.g. "pbadge--sm") for callers that need a size/spacing
  // variant on top of the tone — kept optional so every existing call site is
  // unaffected.
  className?: string;
}) {
  return (
    <span className={`pbadge pbadge--${tone}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}

// Product on/off mark (✓ / ✗) used in the tenants table.
export function ProductMark({ on }: { on: boolean }) {
  return (
    <span className={`pmark pmark--${on ? "on" : "off"}`} aria-label={on ? "ativo" : "inativo"}>
      {on ? "✓" : "✗"}
    </span>
  );
}
