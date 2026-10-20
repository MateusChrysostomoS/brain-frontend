"use client";

// Light/dark switch for the marketing header. Same storage key and <html
// data-theme> contract as the rest of the app (useBrandTheme), so the choice
// follows the visitor into /login and the portal.
//
// Both icons stay mounted and cross-fade (opacity + scale + blur), which keeps
// the swap interruptible and avoids a layout jump.

import { BrandIcon } from "@/app/(site)/_components/BrandIcon";
import { useBrandTheme } from "@/app/(site)/_components/useBrandTheme";

export function ThemeButton({ className = "" }: { className?: string }) {
  const { theme, toggle, mounted } = useBrandTheme();
  const dark = mounted && theme === "dark";

  return (
    <button
      type="button"
      className={"mk-icon-btn " + className}
      onClick={toggle}
      aria-label={mounted ? (dark ? "Usar tema claro" : "Usar tema escuro") : "Alternar tema"}
      suppressHydrationWarning
    >
      <span className="mk-ico-a" data-on={!dark} aria-hidden="true">
        <BrandIcon name="moon" />
      </span>
      <span className="mk-ico-b" data-on={dark} aria-hidden="true">
        <BrandIcon name="sun" />
      </span>
    </button>
  );
}
