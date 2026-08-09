// ProductLockup — the per-screen product mark that sits in the portal header,
// right after the Brain brand. The Brain identity on the left is IDENTICAL on
// every logged-in screen; this only ADDS which product the current screen belongs
// to, so the header reads "Brain │ secretarIA" or "Brain │ PreCheck".
//
// Screens that are not product-specific (the doctor dashboard, Meu Perfil, the
// whole admin portal) simply don't render a lockup.

import { PreCheckWordmark } from "./PreCheckWordmark";
import { SecretariaWordmark } from "./SecretariaWordmark";
import "./ProductLockup.css";

// Matches the product keys used by the entitlements payload and by DOCTOR_NAV.
export type PortalProduct = "secretaria" | "precheck";

const PRODUCT_NAME: Record<PortalProduct, string> = {
  secretaria: "secretarIA",
  precheck: "PreCheck",
};

export function ProductLockup({ product }: { product: PortalProduct }) {
  return (
    <span className="portal-lockup" aria-label={`${PRODUCT_NAME[product]} by Brain`}>
      {product === "secretaria" ? <SecretariaWordmark /> : <PreCheckWordmark />}
    </span>
  );
}
