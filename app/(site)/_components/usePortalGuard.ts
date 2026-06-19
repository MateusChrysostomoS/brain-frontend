"use client";

// usePortalGuard — client-side session + role gate for the /admin and /doctor portals.
// Reads the brain session, redirects to /login when absent, and bounces a user who
// landed on the wrong portal to their own home. Returns the validated session so the
// caller can use its token; `ready` flips true only once the role check passes.
//
// Server-side is still the real authority (every brain-api call re-checks the JWT role);
// this only shapes navigation so a user never sees a portal they cannot use.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSession, ManageApiError, type Session, clearSession } from "@/lib/manage-api";

export function usePortalGuard(allowed: string[]): {
  session: Session | null;
  ready: boolean;
} {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  // Stable primitive dep so the effect doesn't re-run on every render (new array each time).
  const allowedKey = allowed.join(",");

  useEffect(() => {
    const current = getSession();
    if (!current?.token) {
      router.replace("/login");
      return;
    }
    if (!allowed.includes(current.role)) {
      // Right user, wrong portal — route to the home their role can use.
      router.replace(
        current.role === "admin" ? "/admin/dashboard" : "/doctor/dashboard",
      );
      return;
    }
    setSession(current);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, allowedKey]);

  return { session, ready };
}

// True when an error is an expired/invalid-session signal (brain-api 401). Callers should
// clear the session and bounce to /login.
export function isSessionExpired(error: unknown): boolean {
  return error instanceof ManageApiError && error.status === 401;
}

// Convenience: handle a thrown API error by logging the user out on 401, returning a
// human PT-BR message otherwise (for inline display).
export function describeApiError(error: unknown): string {
  if (error instanceof ManageApiError) {
    if (error.status === 403) return "Você não tem permissão para esta ação.";
    if (error.status === 404) return "Registro não encontrado.";
    if (error.status === 409) return error.message || "Conflito de dados.";
    if (error.status === 422) return "Dados inválidos. Verifique os campos.";
  }
  return "Algo deu errado. Tente novamente.";
}

export { clearSession };
