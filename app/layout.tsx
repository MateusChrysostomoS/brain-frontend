import type { Metadata } from "next";
import {
  DM_Sans,
  Hanken_Grotesk,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Newsreader,
  Space_Grotesk,
} from "next/font/google";

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
// Serif / Inter / JetBrains Mono) and the Brain brand-ds (Newsreader / Hanken
// Grotesk).
//
// These are downloaded by next/font at BUILD time and served from our own origin.
// They used to come from a <link> to fonts.googleapis.com in the <head> below,
// which — because this is the ROOT layout — ran on every screen including the
// public ones: a render-blocking third-party stylesheet, and the visitor's IP
// reaching Google before any login or consent, in a health product. Self-hosting
// removes both. Each family exposes one CSS variable, and the design-system
// tokens (--font-ui / --font-serif / --font-body / --font-mono / --font-sans /
// --font-title) point at those variables instead of naming the family literally.
//
// preload:false on all seven is deliberate, not an oversight. The two design
// systems never share a route, but these are declared in the ROOT layout, so
// preloading would make every page fetch the *other* system's fonts as well.
// Left off, the browser fetches a family only when a rule actually matches it,
// so the per-route-group saving comes for free.
//
// weight is left unspecified wherever the family is variable: one file per style
// carries the whole axis, a superset of the weights the old URL enumerated.
// Instrument Serif is the exception — it is not a variable font (400 only).
// axes:["opsz"] on DM Sans and Newsreader mirrors the `opsz` the old URL asked
// for; without it both lose the optical-size adjustment they have today.
// style:["normal","italic"] on Instrument Serif and Newsreader mirrors the `ital`
// the old URL asked for, and only those two — the other five have no italic file
// today either, so their italic text keeps being synthesised exactly as it is now.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-space-grotesk",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  axes: ["opsz"],
  variable: "--font-dm-sans",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-hanken-grotesk",
});

// Applied to <html>, not <body>: two of the token blocks that consume these
// variables live in :root (globals.css and brand-ds.css), and :root IS <html> —
// a variable declared one level lower would not reach them.
const FONT_VARIABLES = [
  spaceGrotesk,
  dmSans,
  instrumentSerif,
  inter,
  jetbrainsMono,
  newsreader,
  hankenGrotesk,
]
  .map((font) => font.variable)
  .join(" ");

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
    <html lang="pt-BR" className={FONT_VARIABLES} suppressHydrationWarning>
      <head>
        {/* Applies the stored / path-default theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
