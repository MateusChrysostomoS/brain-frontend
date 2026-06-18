"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")} id="lp-nav">
      <div className="container nav-inner">
        <a href="#" className="brand">
          <span className="brand-name">
            Pre<em>Check</em>
          </span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#problema">O problema</a>
          </li>
          <li>
            <a href="#como-funciona">Como funciona</a>
          </li>
          <li>
            <a href="#recursos">Recursos</a>
          </li>
          <li>
            <a href="#para-quem">Para quem é</a>
          </li>
          <li>
            <a href="#seguranca">Segurança</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="btn btn-link btn-sm" href="/login">
            Entrar
          </Link>
          <a href="#contato" className="btn btn-primary btn-sm">
            Agendar demo
          </a>
        </div>
      </div>
    </nav>
  );
}
