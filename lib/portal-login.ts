// portal-login.ts — where the public site's "Entrar" goes. Pure on purpose.
//
// Doctors and clinic staff work in the Brain-Message portal (Conversas, Agenda,
// Contexto). This app's own /login only reaches Meu Perfil and billing since the
// clinic portal was retired here (docs/CHECKPOINT_clinic_portal_retirement.md),
// so the marketing pages send clinic people straight to the portal's login.
//
// /login stays as it is for the platform admin and for the checkout and billing
// flows, which link to it directly. It is also the fallback: the same brain-api
// account signs in there, so an empty or invalid base still gives a working door.

import { BRAIN_MESSAGE_URL, normalizeBrainMessageUrl } from "./console-return";

export const LOCAL_LOGIN_PATH = "/login";

export function portalLoginHref(base: string | null | undefined): string {
  const portal = normalizeBrainMessageUrl(base);
  // Trailing slash: the portal is a static export with trailingSlash, so this is
  // the exact path it serves, with no redirect hop.
  return portal ? `${portal}/login/` : LOCAL_LOGIN_PATH;
}

export const PORTAL_LOGIN_HREF = portalLoginHref(BRAIN_MESSAGE_URL);
