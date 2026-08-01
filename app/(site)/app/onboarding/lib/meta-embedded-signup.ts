// meta-embedded-signup.ts — thin wrapper around Meta's JS SDK (WhatsApp
// Embedded Signup) for the "Tentar ativar agora" button (Feature 2). Kept out
// of the React component so the SDK's global `window.FB` + postMessage
// plumbing is easy to reason about (and stub) in isolation.
//
// Two data sources have to be combined into one outcome:
//   1. FB.login's callback — carries the OAuth `code` (or nothing, if the
//      user closed the popup without finishing).
//   2. The `WA_EMBEDDED_SIGNUP` window `message` event Meta's flow posts as
//      the user completes phone-number selection — carries `phone_number_id`
//      / `waba_id`, which the login callback does NOT include.
// The message consistently arrives before the popup closes and the login
// callback fires, so this listens first and resolves from the callback once
// both pieces are available (or immediately on an explicit CANCEL/ERROR
// message, which never gets a `code`).

const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
// Graph API / JS SDK version (matches backend's META_GRAPH_BASE_URL). This is a
// DIFFERENT axis from the Embedded Signup flow version (v2/v4, see the FB.login
// `extras` comment below) — bumping this does not affect which Embedded Signup
// version runs, and vice versa. See GUIA_CREDENCIAIS_META_EMBEDDED_SIGNUP.md
// ("Versão do Embedded Signup", brain-api/docs) for the full writeup + sources.
const SDK_VERSION = "v23.0";

// Meta only ever posts embedded-signup messages from these two origins.
const TRUSTED_MESSAGE_ORIGINS = new Set([
  "https://www.facebook.com",
  "https://web.facebook.com",
]);

type FacebookLoginResponse = {
  authResponse?: { code?: string } | null;
};

declare global {
  interface Window {
    FB?: {
      init: (opts: { appId: string; version: string }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        opts: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

let sdkLoadPromise: Promise<void> | null = null;

// Lazily injects the Meta SDK <script> tag exactly once per page load and
// resolves once `window.FB` is ready. Safe to call repeatedly — later calls
// reuse the same in-flight/resolved promise.
export function loadFacebookSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadFacebookSdk called with no window"));
  }
  if (window.FB) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => resolve();
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Failed to load the Meta SDK script"));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

export type EmbeddedSignupOutcome =
  | { result: "pass"; code: string; phoneNumberId: string | null; wabaId: string | null }
  | { result: "fail"; errorCode: string | null };

// Runs one Embedded Signup round-trip: loads the SDK, inits it with the
// tenant's app_id, opens FB.login with the given config_id, and listens for
// the WA_EMBEDDED_SIGNUP message to capture phone_number_id/waba_id.
export async function runEmbeddedSignup(
  appId: string,
  configId: string,
): Promise<EmbeddedSignupOutcome> {
  await loadFacebookSdk();
  const FB = window.FB;
  if (!FB) throw new Error("Meta SDK failed to initialize");

  FB.init({ appId, version: SDK_VERSION });

  return new Promise((resolve) => {
    let phoneNumberId: string | null = null;
    let wabaId: string | null = null;
    let settled = false;

    function finish(outcome: EmbeddedSignupOutcome) {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      resolve(outcome);
    }

    function onMessage(event: MessageEvent) {
      if (!TRUSTED_MESSAGE_ORIGINS.has(event.origin)) return;
      let data: Record<string, unknown>;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return; // not JSON — not our message
      }
      if (data?.type !== "WA_EMBEDDED_SIGNUP") return;

      const payload = (data.data ?? {}) as Record<string, unknown>;
      if (data.event === "FINISH" || data.event === "FINISH_ONLY_WABA") {
        phoneNumberId = typeof payload.phone_number_id === "string" ? payload.phone_number_id : null;
        wabaId = typeof payload.waba_id === "string" ? payload.waba_id : null;
      } else if (data.event === "CANCEL") {
        const step = typeof payload.current_step === "string" ? payload.current_step : "cancelled";
        finish({ result: "fail", errorCode: step });
      } else if (data.event === "ERROR") {
        const msg = typeof payload.error_message === "string" ? payload.error_message : "error";
        finish({ result: "fail", errorCode: msg });
      }
    }

    window.addEventListener("message", onMessage);

    FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (code) {
          finish({ result: "pass", code, phoneNumberId, wabaId });
        } else {
          finish({ result: "fail", errorCode: "auth_cancelled" });
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        // v4 is the current Embedded Signup version (v2 deprecates 2026-10-15,
        // per Meta's official docs). Its documented `extras` is empty besides
        // `setup` — `featureType`/`sessionInfoVersion` were v2-only fields (v2
        // required `sessionInfoVersion` to get phone_number_id/waba_id on the
        // FINISH message; v4 sends full session info for every flow by
        // default, so the field is retired rather than bumped to a new
        // value). Which flow version actually runs is NOT selected here — it
        // is determined by `configId` itself: a Facebook Login for Business
        // Configuration created in the Meta App Dashboard (App Dashboard >
        // Facebook Login for Business > Configurations > "Embedded Signup" >
        // select products). See GUIA_CREDENCIAIS_META_EMBEDDED_SIGNUP.md
        // ("Versão do Embedded Signup", brain-api/docs) for sources.
        extras: { setup: {} },
      },
    );
  });
}
