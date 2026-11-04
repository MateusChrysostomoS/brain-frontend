// Marketing footer. Every link goes somewhere real: the old footer had six
// placeholders (`href="#"`) for Termos, Privacidade, LGPD & DPO, Setor público,
// Carreiras and Status. They were removed rather than kept pointing nowhere —
// the legal pages need to exist before they are linked.

import Link from "next/link";
import { PORTAL_LOGIN_HREF } from "@/lib/portal-login";
import { BrandGlyph } from "@/app/(site)/_components/BrandGlyph";

type FooterLink = { href: string; label: string };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Produtos",
    links: [
      { href: "/precheck", label: "PreCheck" },
      { href: "/#secretaria", label: "secretarIA" },
      { href: "/#planos", label: "Planos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/#empresa", label: "A Brain" },
      { href: "/#seguranca", label: "Segurança e privacidade" },
      { href: "/#faq", label: "Perguntas frequentes" },
    ],
  },
  {
    title: "Clientes",
    links: [
      { href: PORTAL_LOGIN_HREF, label: "Entrar" },
      { href: "/#planos", label: "Assinar" },
      { href: "/#contato", label: "Agendar demonstração" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer__grid">
          <div className="mk-footer__brandcol">
            <Link href="/" className="mk-brand" aria-label="Brain, página inicial">
              <BrandGlyph size={26} />
              <span className="mk-brand__name" style={{ fontSize: 23 }}>
                Brain
              </span>
            </Link>
            <p className="mk-footer__about">
              Software para clínicas: o PreCheck prepara a consulta e a secretarIA cuida do
              atendimento e da agenda.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mk-footer__bottom">
          <span>© {new Date().getFullYear()} Brain</span>
          <span>PMB Consultoria e Assessoria Empresarial e Projetos LTDA</span>
        </div>
      </div>
    </footer>
  );
}
