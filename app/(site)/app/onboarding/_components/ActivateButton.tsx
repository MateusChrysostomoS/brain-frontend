"use client";

// ActivateButton — "Tentar ativar agora" (Feature 2). When Embedded Signup is
// configured (embedded_signup.configured), runs the Meta JS SDK flow and
// reports the outcome via POST /doctor/onboarding/attempts; otherwise renders
// a disabled button with an explanatory note.

import { useState } from "react";
import {
  postOnboardingAttempt,
  type DoctorOnboarding,
  type Session,
} from "@/lib/manage-api";
import { runEmbeddedSignup } from "../lib/meta-embedded-signup";

type ActivateButtonProps = {
  session: Session;
  embeddedSignup: DoctorOnboarding["embedded_signup"];
  // Caller refetches GET /doctor/onboarding to pick up the new state.
  onAttemptComplete: () => void;
};

export function ActivateButton({ session, embeddedSignup, onAttemptComplete }: ActivateButtonProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!embeddedSignup.app_id || !embeddedSignup.config_id) return;
    setError(null);
    setRunning(true);
    try {
      const outcome = await runEmbeddedSignup(embeddedSignup.app_id, embeddedSignup.config_id);
      const attempt_id = crypto.randomUUID();
      if (outcome.result === "pass") {
        await postOnboardingAttempt(session, {
          attempt_id,
          result: "pass",
          code: outcome.code,
          phone_number_id: outcome.phoneNumberId,
          waba_id: outcome.wabaId,
        });
      } else {
        await postOnboardingAttempt(session, {
          attempt_id,
          result: "fail",
          error_code: outcome.errorCode,
        });
      }
      onAttemptComplete();
    } catch (e) {
      console.error("secretaria onboarding: embedded signup attempt failed", e);
      setError("Não foi possível concluir a ativação agora. Tente novamente.");
    } finally {
      setRunning(false);
    }
  }

  if (!embeddedSignup.configured) {
    return (
      <div>
        <button type="button" className="btn btn--primary" disabled>
          Tentar ativar agora
        </button>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>
          Ativação assistida ainda não configurada — nossa equipe entra em contato.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="btn btn--primary" onClick={handleClick} disabled={running}>
        {running ? "Conectando…" : "Tentar ativar agora"}
      </button>
      {error && (
        <p role="alert" style={{ fontSize: 12.5, color: "var(--danger, #c0392b)", marginTop: 10 }}>
          {error}
        </p>
      )}
    </div>
  );
}
