"use client";
// useSecretariaHub — client hook shared by the agenda and configuração pages.
// Resolves whether the real secretarIA hub data path is usable, without ever
// hard-redirecting: these product routes double as demo showcases, so a
// missing session or a missing entitlement just means "stay in demo mode".
//
// Flow:
//   1. No session -> stays in demo mode; pages show a "faça login" notice.
//   2. Session, but brain-api refuses the hub token with 403
//      (`secretaria_not_entitled`) -> notEntitled=true; demo mode + notice.
//   3. Session + entitled + a hub base URL is configured -> hubReady=true.

import { useEffect, useState } from "react";
import { getSession, ManageApiError, type Session } from "@/lib/manage-api";
import { getHubToken, hubConfigured } from "@/lib/secretaria-hub";

export type UseSecretariaHubResult = {
  session: Session | null;
  // True once the session/entitlement check has settled (success or failure).
  ready: boolean;
  // True when the tenant does not have the secretarIA entitlement.
  notEntitled: boolean;
  // True when it's safe to call the hub client: session + entitled + hub
  // base URL configured.
  hubReady: boolean;
};

export function useSecretariaHub(): UseSecretariaHubResult {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [notEntitled, setNotEntitled] = useState(false);
  const [entitled, setEntitled] = useState(false);

  useEffect(() => {
    const current = getSession();
    setSession(current);
    if (!current) {
      setReady(true);
      return;
    }
    // Minting the hub token doubles as a live entitlement check — brain-api
    // verifies secretarIA entitlement on every mint (fail-closed).
    getHubToken(current)
      .then(() => setEntitled(true))
      .catch((e) => {
        if (e instanceof ManageApiError && e.status === 403) {
          setNotEntitled(true);
        }
        // Other failures (network, 5xx) leave notEntitled false — the page
        // stays in demo mode and individual hub calls can retry later.
      })
      .finally(() => setReady(true));
  }, []);

  return {
    session,
    ready,
    notEntitled,
    hubReady: entitled && hubConfigured(),
  };
}
