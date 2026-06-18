import type { Metadata } from "next";

// RootLayout — the single <html>/<body> shell for the whole unified app
// (Brain umbrella + secretarIA product + the ported PreCheck app).
// It deliberately imports NO component CSS: each route group imports its own
// stylesheet (PreCheck → globals.css in the (SignIn)/(SignOut)/precheck routes;
// Brain → brand-ds.css in the (site) group), so the two design systems are
// code-split per route and can never collide on the same page.

export const metadata: Metadata = {
  title: "Brain — Inteligência no WhatsApp para clínicas",
  description:
    "A Brain coloca inteligência no WhatsApp da sua clínica: o PreCheck conduz a anamnese antes da consulta e a secretarIA atende pacientes e cuida da agenda.",
};

// Fonts for BOTH design systems: PreCheck (Space Grotesk / DM Sans / Instrument
// Serif / Inter / JetBrains Mono) and the Brain brand-ds (Newsreader / Hanken Grotesk).
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500;1,6..72,600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap";

// Path-aware theme bootstrap, applied before first paint to avoid a theme flash.
// Shared localStorage key `precheck_theme` so the toggle persists across the whole
// app. Default with no stored value: dark on the ported PreCheck routes (their
// original default), light on the new Brain routes (the brand design's default).
const THEME_INIT_SCRIPT =
  "(function(){try{var t=localStorage.getItem('precheck_theme');if(t!=='light'&&t!=='dark'){var p=location.pathname;var dark=/^\\/(dashboard|summary|inbound|login|esqueci_senha|precheck)(\\/|$)/.test(p);t=dark?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_HREF} rel="stylesheet" />
        {/* Applies the stored / path-default theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
