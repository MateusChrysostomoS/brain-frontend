"use client";

// /esqueci_senha/atualizar_senha — Step 3 of the password-reset flow.
// Receives the validated token via ?token=... and POSTs the new
// password to /auth/password-reset/confirm. On success, redirects
// to /login?reset=success so the login screen shows a confirmation
// banner. No auto-login by design.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { confirmPasswordReset } from "@/lib/api";

import { AuthShell } from "../../_shared/AuthShell";
import { PasswordField } from "../../_shared/PasswordField";
import { StepIndicator } from "../../_shared/StepIndicator";

// Mirror the backend rule (`MIN_PASSWORD_LENGTH` in services/password_reset.py).
const MIN_PASSWORD_LENGTH = 8;

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<UpdatePasswordFallback />}>
      <UpdatePasswordInner />
    </Suspense>
  );
}

function UpdatePasswordInner() {
  const router = useRouter();
  const search = useSearchParams();

  // --- State ---
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Derived ---
  const token = search.get("token") ?? "";

  // --- Effects ---
  // If we landed here without a token, bounce back to step 2 so the user
  // can paste one. This avoids a confusing "invalid token" error on submit.
  useEffect(() => {
    if (!token) {
      router.replace("/esqueci_senha/token");
    }
  }, [token, router]);

  // --- Handlers ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmPwd) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(token, password);
      router.push("/login?reset=success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.toLowerCase().includes("rate limit")
          ? "Muitas tentativas. Aguarde um minuto e tente novamente."
          : msg.toLowerCase().includes("token")
            ? "Token inválido ou expirado. Solicite um novo link."
            : "Não foi possível redefinir a senha. Tente novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={
        <>
          Crie uma <em>nova senha</em>.
        </>
      }
      subtitle="Escolha uma senha forte. Você usará ela para acessar o painel da clínica."
      error={error}
      belowCard={
        <p className="login-help">
          Mudou de ideia? <Link href="/login">Voltar ao login</Link>
        </p>
      }
    >
      <StepIndicator current={3} total={3} />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <PasswordField
          id="new-password"
          label="Nova senha"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
          hint={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres.`}
        />

        <PasswordField
          id="confirm-password"
          label="Confirmar nova senha"
          value={confirmPwd}
          onChange={setConfirmPwd}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          className="btn btn-primary login-submit"
          disabled={loading || !password || !confirmPwd}
        >
          {loading ? "Salvando…" : "Redefinir senha"}
        </button>
      </form>
    </AuthShell>
  );
}

function UpdatePasswordFallback() {
  return (
    <AuthShell
      title={
        <>
          Crie uma <em>nova senha</em>.
        </>
      }
      subtitle="Carregando…"
    >
      <div style={{ height: 120 }} aria-hidden="true" />
    </AuthShell>
  );
}
