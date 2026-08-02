"use client";

// Shared auth plumbing for the panel pages (/dashboard, /summary, /inbound,
// /metrics, /users). Replaces the isAuthed-redirect + logout + isAuthError
// boilerplate that was repeated in each page. Behaviour is identical to the
// inlined versions:
//   - requireAuth(): sync gate for the top of a load effect — redirects to
//     /login and returns false when there is no token.
//   - logout(): optional cleanup callback, clears the token, goes to "/".
//   - handleAuthError(e): for catch blocks — logs out on expired/invalid
//     session errors and tells the caller whether it did.

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearToken, isAuthed, isAuthError } from "./auth";

export function useAuthGuard(onLogout?: () => void) {
  const router = useRouter();

  const logout = useCallback(() => {
    onLogout?.();
    clearToken();
    router.push("/");
  }, [router, onLogout]);

  const requireAuth = useCallback(() => {
    if (isAuthed()) return true;
    router.replace("/login");
    return false;
  }, [router]);

  const handleAuthError = useCallback(
    (e: unknown) => {
      if (!isAuthError(e)) return false;
      logout();
      return true;
    },
    [logout],
  );

  return { logout, requireAuth, handleAuthError };
}
