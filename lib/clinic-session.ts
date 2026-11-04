import { ensurePersonalAccount, ensureSession, getSession, ManageApiError, selectPersonalClinic, type Session } from "./manage-api";

export function billingMembership(pathname: string, search: string): string | null {
  if (pathname.replace(/\/+$/, "") !== "/app/billing") return null;
  const id = new URLSearchParams(search).get("vinculo");
  return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

export function personalBillingLogin(userId: string): string {
  return `/login?${new URLSearchParams({ next: "/app/billing", conta: "pessoal", vinculo: userId })}`;
}

// Resolve the explicit clinic BEFORE the account shell renders its children.
// Never fall back to a different clinical cookie or a remembered clinic for billing.
export async function ensurePortalClinic(pathname: string, search: string): Promise<Session | null> {
  const target = billingMembership(pathname, search);
  const current = getSession();
  if (!target) return current ?? ensureSession();
  if (current?.accountUserId === target) return current;
  if (!await ensurePersonalAccount()) throw new ManageApiError(401, "personal_authentication_required");
  return selectPersonalClinic(target);
}
