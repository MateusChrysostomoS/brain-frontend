"use client";

// useImpersonation — reads the "Modo médico" marker (CONTRACTS §11.4) and exposes
// the way back out of it. The marker lives in sessionStorage, so it is read AFTER
// mount: reading it during render would risk a hydration mismatch in the static
// export.
//
// `impersonation` is null on a real doctor login, which is what callers use to
// decide whether to show the "Voltar ao admin" affordance at all.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  exitDoctorMode,
  getImpersonation,
  type ImpersonationMarker,
} from "@/lib/manage-api";

export function useImpersonation(): {
  impersonation: ImpersonationMarker | null;
  exitToAdmin: () => void;
} {
  const router = useRouter();
  const [impersonation, setImpersonation] = useState<ImpersonationMarker | null>(null);

  useEffect(() => {
    setImpersonation(getImpersonation());
  }, []);

  // Restore the stashed admin session and return to the admin portal — or to
  // /login when there was nothing to restore (e.g. a reload cleared the stash).
  function exitToAdmin() {
    const restored = exitDoctorMode();
    router.push(restored ? "/admin/dashboard" : "/login");
  }

  return { impersonation, exitToAdmin };
}
