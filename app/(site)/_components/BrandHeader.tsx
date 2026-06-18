"use client";

// BrandHeader — sticky site header with brand-mark, desktop nav, actions bar, and
// collapsible mobile nav. Supports "brain" (Brain home) and "secretaria" variants
// that differ in the wordmark and glyph size.

import { useState } from "react";
import Link from "next/link";
import { BrandGlyph } from "./BrandGlyph";
import { BrandIcon } from "./BrandIcon";
import { ThemeToggle } from "./ThemeToggle";

export type NavLink = {
  href: string;
  label: string;
};

export type BrandHeaderProps = {
  variant?: "brain" | "secretaria";
  navLinks: NavLink[];
};

export function BrandHeader({
  variant = "brain",
  navLinks,
}: BrandHeaderProps) {
  const [open, setOpen] = useState(false);

  function closeNav() {
    setOpen(false);
  }

  // Determine glyph size: secretaria header uses size 30 per SecretarIA.html.
  const glyphSize = variant === "secretaria" ? 30 : 32;

  return (
    <header className="site-header">
      <div className="container nav">
        {/* Brand mark — always links back to home */}
        <Link
          href="/"
          className="brand-mark"
          aria-label={
            variant === "secretaria"
              ? "secretarIA — página inicial"
              : "Brain — início"
          }
        >
          <BrandGlyph size={glyphSize} />

          {variant === "secretaria" ? (
            // secretarIA variant: "secretar<em>IA</em>" + "por Brain" badge
            <>
              <span className="brand">
                <span className="wordmark">
                  secretar<span className="i">IA</span>
                </span>
              </span>
              {/* marginLeft matches the 2px from SecretarIA.html exactly */}
              <span className="brand-by" style={{ marginLeft: 2 }}>
                por Brain
              </span>
            </>
          ) : (
            // brain variant: plain wordmark
            <span className="wordmark">Brain</span>
          )}
        </Link>

        {/* Desktop nav links — hidden below 1080px via brand-ds.css */}
        <nav className="nav-links" aria-label="Seções">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              // Anchor links: plain <a> so the browser does native smooth-scroll.
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ) : (
              // Internal routes: Next.js Link for client-side navigation.
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Action bar: theme toggle, Entrar ghost, Agendar demo CTA, mobile menu */}
        <div className="nav-actions">
          <ThemeToggle />

          <Link href="/login" className="btn btn--ghost btn--sm hide-sm">
            Entrar
          </Link>

          <a href="#contato" className="btn btn--primary btn--sm">
            Agendar demo
          </a>

          {/* Mobile hamburger — toggles the mnav below */}
          <button
            className="icon-btn nav-toggle"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <BrandIcon name="menu" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer — brand-ds.css controls .mnav / .mnav.open display */}
      <nav
        className={"mnav" + (open ? " open" : "")}
        aria-label="Menu móvel"
      >
        <div className="container">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.href} href={link.href} onClick={closeNav}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} onClick={closeNav}>
                {link.label}
              </Link>
            )
          )}
          {/* Entrar appears in mobile nav, hidden in desktop actions via .hide-sm */}
          <Link href="/login" onClick={closeNav}>
            Entrar
          </Link>
        </div>
      </nav>
    </header>
  );
}
