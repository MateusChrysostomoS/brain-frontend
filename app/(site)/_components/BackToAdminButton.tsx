"use client";

// BackToAdminButton — leaves "Modo médico" and restores the admin session.
// Rendered in the header next to the account name, mirroring the admin portal's
// "Modo médico" button so both directions of the switch look and sit the same.
// (It replaced a full-width banner across the top of every doctor screen, which
// was visually heavier than the switch in the other direction.)
//
// Renders nothing on a real doctor login, so any doctor-facing header can mount
// it unconditionally.

import { BrandIcon } from "./BrandIcon";
import { useImpersonation } from "./useImpersonation";

export function BackToAdminButton() {
  const { impersonation, exitToAdmin } = useImpersonation();

  if (!impersonation) return null;

  return (
    <button
      type="button"
      className="btn btn--outline btn--sm"
      onClick={exitToAdmin}
      // The banner used to spell this out; as a button, the context moves into
      // the tooltip — the clinic name itself is already shown as the account name.
      title={`Modo médico — você está vendo a clínica ${impersonation.clinicName} como administrador. Clique para voltar ao admin.`}
    >
      <BrandIcon name="swap" />
      {/* Collapses to icon-only on narrow screens — the title above keeps the
          meaning available. See .portal-header-btn-label. */}
      <span className="portal-header-btn-label">Voltar ao admin</span>
    </button>
  );
}
