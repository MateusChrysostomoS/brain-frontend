// console-return.ts — pure decisions for "come back to the Brain-Message portal
// after paying" (spec 2026-09-29, owner answer 16). No window, no router.
//
// brain-api builds the Stripe success_url from its configured base plus
// `origem=console` [+ `produto=precheck`] (POST /billing/checkout with
// `return_to: "console"`). /checkout/sucesso reads those two query values here.
// The redirect target is ONLY `NEXT_PUBLIC_BRAIN_MESSAGE_URL` + one of two fixed
// paths: nothing from the query string is ever echoed into it, so there is no
// open redirect.

import { CONSOLE_ORIGIN } from "./checkout-cta";
import { safeNextPath } from "./safe-next";

// Build-time (Dockerfile ARG/ENV pair). Empty/absent → stay on the page with a
// link; the production value is the owner's to set at deploy.
export const BRAIN_MESSAGE_URL: string = process.env.NEXT_PUBLIC_BRAIN_MESSAGE_URL ?? "";

export const PRECHECK_PRODUCT = "precheck";
export const CONSOLE_HOME_PATH = "/";
export const CONSOLE_ANAMNESES_PATH = "/anamneses/";

export function consoleReturnPath(produto: string | null | undefined): string {
  return produto === PRECHECK_PRODUCT ? CONSOLE_ANAMNESES_PATH : CONSOLE_HOME_PATH;
}

// http(s) origin only, no credentials/query/hash; trailing slashes dropped.
export function normalizeBrainMessageUrl(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username !== "" || url.password !== "") return null;
  if (url.search !== "" || url.hash !== "") return null;
  return url.origin + url.pathname.replace(/\/+$/, "");
}

export type ConsoleReturn =
  | { kind: "none" }
  | { kind: "stay"; why: "no-base-url" }
  | { kind: "redirect"; href: string };

export function consoleReturnFor(input: {
  origem: string | null;
  produto: string | null;
  baseUrl: string | null | undefined;
}): ConsoleReturn {
  if (input.origem !== CONSOLE_ORIGIN) return { kind: "none" };
  const base = normalizeBrainMessageUrl(input.baseUrl);
  if (base === null) return { kind: "stay", why: "no-base-url" };
  return { kind: "redirect", href: base + consoleReturnPath(input.produto) };
}

// The only value the checkout call may forward as `return_to` (brain-api enforces
// the same allowlist; this keeps junk out of the request in the first place).
export function returnToFromOrigem(origem: string | null | undefined): "console" | undefined {
  return origem === CONSOLE_ORIGIN ? CONSOLE_ORIGIN : undefined;
}

// After /login: keep `origem=console` on the followed `next` route so the click on
// a plan card can still send `return_to`. Only ever touches a route that
// safeNextPath already accepts; the query goes before any #fragment.
export function withConsoleOrigin(route: string, origem: string | null | undefined): string {
  if (origem !== CONSOLE_ORIGIN) return route;
  if (safeNextPath(route) === null) return route;
  const hashAt = route.indexOf("#");
  const head = hashAt === -1 ? route : route.slice(0, hashAt);
  const tail = hashAt === -1 ? "" : route.slice(hashAt);
  if (/[?&]origem=/.test(head)) return route;
  return `${head}${head.includes("?") ? "&" : "?"}origem=${CONSOLE_ORIGIN}${tail}`;
}

export const CHECKOUT_SUCCESS_PATH = "/checkout/sucesso";

// The add-product dialog finishes without a Stripe redirect, so it hands the buyer to the same
// /checkout/sucesso return page the checkout uses. `returnQuery` comes from brain-api
// (`return_query`, built server-side) but is still REBUILT here from allowlisted keys/values
// only: nothing else in it can reach the URL. Null = keep the ordinary behaviour.
export function consoleReturnRoute(returnQuery: string | null | undefined): string | null {
  if (typeof returnQuery !== "string" || returnQuery.length === 0 || returnQuery.length > 64) {
    return null;
  }
  const params = new URLSearchParams(returnQuery);
  if (params.get("origem") !== CONSOLE_ORIGIN) return null;
  const next = new URLSearchParams({ origem: CONSOLE_ORIGIN });
  if (params.get("produto") === PRECHECK_PRODUCT) next.set("produto", PRECHECK_PRODUCT);
  return `${CHECKOUT_SUCCESS_PATH}?${next.toString()}`;
}
