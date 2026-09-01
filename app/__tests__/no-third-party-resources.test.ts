import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

// Regression guard for the Google Fonts / LGPD finding, fixed 2026-08-31.
// Twin of the same guard in secretarIA-frontend, which was cloned from this
// repo in 2026-08-14 and carried the same <link> with it.
//
// RootLayout is the only root layout of the App Router: it wraps EVERY route
// surface — (SignIn), (SignOut), (site) and /precheck — so anything it loads
// runs on every screen, including the public "/" and "/precheck", which a
// patient can reach before any login or consent. It used to pull a Google
// Fonts stylesheet from there, which blocked rendering and sent the visitor
// IP to Google on every visit. The seven families are now self-hosted by
// next/font/google (downloaded at build, emitted into _next/static/media).
//
// This asserts on the SOURCE, because the regression is invisible from inside
// the app: re-adding the <link> breaks nothing, renders identically, and the
// only signal is a network tab.

const repoRoot = process.cwd();
const read = (rel: string) => readFileSync(path.join(repoRoot, rel), "utf8");

const ROOT_LAYOUT = "app/layout.tsx";

// Strip line and block comments so the layout's own explanation of what was
// removed (which necessarily names the hosts) does not fail its own guard.
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("root layout loads no third-party resource (PERF-1)", () => {
  const code = stripComments(read(ROOT_LAYOUT));

  it("names no external host at all", () => {
    // Deliberately broader than Google: analytics, pixels, chat widgets and
    // icon CDNs are the same problem on a health product's public screen.
    expect(code.match(/https?:\/\/[^"'`\s]+/g) ?? []).toEqual([]);
  });

  it("declares no <link> or <script src> tag", () => {
    // The inline theme-bootstrap <script> (dangerouslySetInnerHTML, no src) is
    // fine — it ships with the document and calls nobody.
    expect(code).not.toMatch(/<link\b/);
    expect(code).not.toMatch(/<script[^>]*\bsrc=/);
  });

  it("self-hosts its fonts through next/font", () => {
    expect(code).toMatch(/from\s+"next\/font\/google"/);
  });
});

describe("design-system font tokens point at next/font variables", () => {
  // Every family the app renders is declared once, as a --font-* token, in one
  // of the design systems (20 definitions across 9 files here, not 6 across 3:
  // the same token name maps to a DIFFERENT family per route group, e.g.
  // --font-serif is Instrument Serif in (SignIn)/(SignOut)/landing but
  // Newsreader in (site)). A token that still names a family literally
  // means that family is no longer served from our own domain — or is silently
  // falling back, which looks almost right and is easy to miss.
  const cssFiles = (() => {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(path.join(repoRoot, dir))) {
        const rel = `${dir}/${entry}`;
        if (statSync(path.join(repoRoot, rel)).isDirectory()) walk(rel);
        else if (entry.endsWith(".css")) out.push(rel);
      }
    };
    walk("app");
    return out;
  })();

  it("finds the CSS files to check", () => {
    expect(cssFiles.length).toBeGreaterThan(0);
  });

  it("has no --font-* token naming a family literally", () => {
    const offenders: string[] = [];
    for (const rel of cssFiles) {
      read(rel)
        .split("\n")
        .forEach((line, i) => {
          const m = /^\s*(--font-[a-z-]+)\s*:\s*(.+);/.exec(line);
          if (m && !m[2].includes("var(--font-")) {
            offenders.push(`${rel}:${i + 1} ${m[1]}: ${m[2]}`);
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
