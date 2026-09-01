// secretaria-app.ts — where the secretarIA product app lives, now that it is
// not in this repo.
//
// The doctor-facing secretarIA screens (Agenda, Configuração) used to be routes
// here, under /secretaria/*. They were removed: secretarIA is its own domain
// with its own frontend, and keeping a second copy of the configuration screen
// in this app meant two bundles writing the same tenant config through the same
// hub — which is how they drifted apart in the first place.
//
// So this module holds the ONE place that knows the other app's origin. Every
// affordance that used to be an internal <Link> is now a cross-origin link, and
// cross-origin means a plain <a>: next/link's client-side routing cannot leave
// this app, and using it here would produce a link that quietly does nothing.
//
// This is the human-facing web app, not the secretarIA API. There used to be a
// lib/secretaria-hub.ts here holding a SECRETARIA_HUB_BASE and a typed client
// for that API; it was deleted on 2026-09-01 because nothing rendered it any
// more. Once the screens above moved out, the client kept being maintained --
// and kept drifting from the copy that IS rendered -- while no code path
// reached it. If this app ever needs the secretarIA API again, port the live
// client from secretarIA-frontend rather than reviving the dead one.
//
// SESSION NOTE, said out loud because it is a real edge: the session lives in
// sessionStorage, which is per-origin, so following one of these links lands on
// the secretarIA app's own login. brain-api is the identity authority for both,
// so the same credentials work — but it IS a second sign-in, not a silent
// handoff. Copy that sends a user across should not promise otherwise.

// Public origin of the secretarIA frontend. Trailing slashes are stripped so
// `SECRETARIA_APP_BASE + "/configuracao"` never doubles a "/".
export const SECRETARIA_APP_BASE = (
  process.env.NEXT_PUBLIC_SECRETARIA_APP_BASE_URL ?? ""
).replace(/\/+$/, "");

/** Whether the secretarIA app's origin is configured in this build. */
export function secretariaAppConfigured(): boolean {
  return SECRETARIA_APP_BASE.length > 0;
}

/**
 * An absolute URL into the secretarIA app, or `null` when it is not configured.
 *
 * `null` rather than a relative path on purpose: a relative "/configuracao"
 * would resolve against THIS origin and 404, which reads to a clinic as the
 * product being broken. A caller that gets `null` should say the secretarIA app
 * is not configured for this environment.
 */
export function secretariaAppUrl(path: string): string | null {
  if (!secretariaAppConfigured()) return null;
  return SECRETARIA_APP_BASE + (path.startsWith("/") ? path : "/" + path);
}

// The routes this app links to, named once so a rename over there is one edit
// here rather than a grep across seven files.
export const SECRETARIA_APP_ROUTES = {
  home: "/inicio",
  agenda: "/agenda",
  configuracao: "/configuracao",
  /** Section 08 of Configuração — the Google Calendar block. */
  googleCalendar: "/configuracao#gcal",
  /** Configuração scrolled to Section 05, the professionals/invite block. */
  professionals: "/configuracao?secao=prof",
} as const;

/** Copy for the disabled state, so every caller says the same thing. */
export const SECRETARIA_APP_NOT_CONFIGURED =
  "O aplicativo da secretarIA não está configurado neste ambiente.";
