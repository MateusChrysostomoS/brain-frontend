// StatusBadge — a pill showing a status with a semantic tone. The caller maps a
// domain status (lead pipeline, entitlement status, anamnesis status) to a tone +
// PT-BR label; this component owns only the visual. Classes are in PortalShell.css.

import type { ReactNode } from "react";

export type BadgeTone = "green" | "amber" | "red" | "blue" | "muted";

export function StatusBadge({
  tone,
  children,
}: {
  tone: BadgeTone;
  children: ReactNode;
}) {
  return <span className={`pbadge pbadge--${tone}`}>{children}</span>;
}

// Product on/off mark (✓ / ✗) used in the tenants table.
export function ProductMark({ on }: { on: boolean }) {
  return (
    <span className={`pmark pmark--${on ? "on" : "off"}`} aria-label={on ? "ativo" : "inativo"}>
      {on ? "✓" : "✗"}
    </span>
  );
}
