"use client";

// Marketing header, shared by / and /precheck. Sticky, solid background; the
// hairline under it only appears once the page has scrolled.
//
// Destinations: Entrar -> the clinic portal's login (lib/portal-login.ts),
// Assinar -> the pricing section, Agendar demonstração -> the contact form.

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { PORTAL_LOGIN_HREF } from "@/lib/portal-login";
import { BrandGlyph } from "@/app/(site)/_components/BrandGlyph";
import { BrandIcon } from "@/app/(site)/_components/BrandIcon";
import { PreCheckMark } from "./brand";
import { ThemeButton } from "./ThemeButton";

export type NavItem = { href: string; label: string };

type SiteHeaderProps = {
  nav: NavItem[];
  /** Shows "Brain | PreCheck" when the page belongs to a product. */
  product?: "precheck";
  plansHref: string;
  contactHref: string;
};

function NavLink({ href, label, onClick }: NavItem & { onClick?: () => void }) {
  // In-page anchors stay plain <a> so the browser scrolls natively.
  if (href.startsWith("#")) {
    return (
      <a href={href} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick}>
      {label}
    </Link>
  );
}

export function SiteHeader({ nav, product, plansHref, contactHref }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 4);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="mk-header" data-scrolled={scrolled || open}>
      <div className="mk-wrap mk-header__bar">
        <Link
          href="/"
          className={"mk-brand" + (product ? " mk-brand--product" : "")}
          aria-label="Brain, página inicial"
        >
          <BrandGlyph size={28} />
          <span className="mk-brand__name">Brain</span>
          {product === "precheck" && (
            <>
              <span className="mk-brand__sep" aria-hidden="true" />
              <span className="mk-brand__product">
                <PreCheckMark />
              </span>
            </>
          )}
        </Link>

        <nav className="mk-nav" aria-label="Principal">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="mk-header__actions">
          <ThemeButton className="mk-hide-xs" />
          <Link href={PORTAL_LOGIN_HREF} className="mk-btn mk-btn--sm mk-btn--quiet mk-hide-md">
            Entrar
          </Link>
          <a href={plansHref} className="mk-btn mk-btn--sm mk-btn--secondary mk-hide-md">
            Assinar
          </a>
          <a
            href={contactHref}
            className="mk-btn mk-btn--sm mk-btn--primary"
            aria-label="Agendar demonstração"
          >
            <span className="mk-hide-sm">Agendar demonstração</span>
            <span className="mk-show-sm">Agendar demo</span>
          </a>
          <button
            type="button"
            className="mk-icon-btn mk-menu-btn"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <BrandIcon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>

      <nav id={menuId} className="mk-mnav" data-open={open} aria-label="Menu">
        <div className="mk-wrap">
          {nav.map((item) => (
            <NavLink key={item.href} {...item} onClick={close} />
          ))}
          <div className="mk-mnav__ctas">
            <Link href={PORTAL_LOGIN_HREF} className="mk-btn mk-btn--secondary" onClick={close}>
              Entrar
            </Link>
            <a href={plansHref} className="mk-btn mk-btn--secondary" onClick={close}>
              Assinar
            </a>
          </div>
          <div className="mk-mnav__theme">
            <span>Tema</span>
            <ThemeButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
