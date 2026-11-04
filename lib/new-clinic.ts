import { safeNextPath } from "./safe-next";

export function wantsNewClinic(params: URLSearchParams): boolean {
  return params.get("intencao") === "nova-clinica";
}

export function createClinicRoute(plan: string, catalogIds: string[]): string {
  return `/criar-clinica?${new URLSearchParams({ plan, catalog: catalogIds.join(",") })}`;
}

// A purchase destination is not reset authorization. Rebuild its allowlisted values,
// rather than preserving arbitrary next/query fields through the reset flow.
export function newClinicDestination(raw: string | null): string | null {
  if (!safeNextPath(raw)) return null;
  const url = new URL(raw!, "https://brain.invalid");
  if (url.pathname.replace(/\/+$/, "") !== "/criar-clinica") return null;
  const safe = new URLSearchParams();
  for (const key of ["plan", "catalog", "precheck_template_slug", "operacao"]) {
    const value = url.searchParams.get(key);
    if (!value) continue;
    const valid = key === "operacao"
      ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
      : key === "catalog"
        ? /^[a-z0-9_,]{1,255}$/.test(value)
        : /^[a-z0-9_-]{1,100}$/.test(value);
    if (valid) safe.set(key, value);
  }
  return `/criar-clinica${safe.size ? `?${safe}` : ""}`;
}

let destination: string | null = null;
export function rememberClinicDestination(raw: string | null): void {
  destination = newClinicDestination(raw);
}
export function getClinicDestination(): string | null { return destination; }
export function clearClinicDestination(): void { destination = null; }

export function loginClinicDestination(explicitNext: string | null): string | null {
  // A fresh, explicit destination wins. Memory is only the reset-to-login handoff.
  return newClinicDestination(explicitNext) ?? (explicitNext === null ? destination : null);
}
