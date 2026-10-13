"use client";

// /esqueci_senha — Step 1 of the password-reset flow (TASK-056: by e-mailed code).
// Owns the e-mail input and calls /auth/password-reset/request. The backend
// always answers the same generic message whether or not the e-mail exists, so
// the UI moves on to the code step either way and never reveals which.
// The address goes to step 2 in memory (lib/password-reset-memory.ts) — never
// in the URL or storage — and comes prefilled from /login the same way.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ManageApiError, requestPasswordReset } from "@/lib/manage-api";
import { forgetResetToken, setResetEmail, takeLoginEmail } from "@/lib/password-reset-memory";

import { AuthShell } from "../_shared/AuthShell";
import { StepIndicator } from "../_shared/StepIndicator";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // --- State ---
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Effects ---
  // Prefill with what was typed on /login (read-once memory hand-off), and drop any
  // token left by an abandoned new-password step.
  useEffect(() => {
    forgetResetToken();
    const handed = takeLoginEmail();
    if (handed) setEmail(handed);
  }, []);

  // --- Handlers ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(trimmed);
      setResetEmail(trimmed);
      router.push("/esqueci_senha/codigo");
    } catch (err) {
      // Rate-limit and validation errors land here.
      const status = err instanceof ManageApiError ? err.status : 0;
      setError(
        status === 429
          ? "Muitas tentativas. Tente novamente em alguns minutos."
          : status === 422
            ? "Digite um e-mail válido."
            : "Erro ao processar. Tente novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={
        <>
          Esqueceu a <em>senha</em>?
        </>
      }
      subtitle="Informe o e-mail da sua conta. Enviaremos um código para criar uma nova senha."
      error={error}
      belowCard={
        <p className="login-help">
          Lembrou a senha? <Link href="/login">Voltar ao login</Link>
        </p>
      }
    >
      <StepIndicator current={1} total={3} />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="clinica@email.com"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
          {loading ? "Enviando…" : "Enviar código"}
        </button>
      </form>
    </AuthShell>
  );
}
