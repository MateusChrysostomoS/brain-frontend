"use client";

// /esqueci_senha/atualizar_senha — Step 3 of the password-reset flow.
// The single-use token comes from step 2 in memory (lib/password-reset-memory.ts,
// TASK-056) — never from `?token=` in the URL — and is POSTed with the new
// password to /auth/password-reset/confirm. On success it redirects to
// /login?reset=success (a banner, no secret) with the e-mail prefilled through
// the same memory hand-off. No auto-login by design.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ManageApiError, confirmPasswordReset } from "@/lib/manage-api";
import {
  clearResetFlow,
  getResetEmail,
  getResetToken,
  newPasswordError,
  rememberLoginEmail,
} from "@/lib/password-reset-memory";

import { AuthShell } from "../../_shared/AuthShell";
import { PasswordField } from "../../_shared/PasswordField";
import { StepIndicator } from "../../_shared/StepIndicator";

export default function UpdatePasswordPage() {
  const router = useRouter();

  // --- State ---
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Effects ---
  // Without a token in memory (reload, typed URL) there is nothing to confirm.
  useEffect(() => {
    if (!getResetToken()) router.replace("/esqueci_senha");
  }, [router]);

  // --- Handlers ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const invalid = newPasswordError(password, confirmPwd);
    if (invalid) {
      setError(invalid);
      return;
    }
    const token = getResetToken();
    if (!token) {
      router.replace("/esqueci_senha");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(token, password);
      rememberLoginEmail(getResetEmail());
      clearResetFlow();
      router.push("/login?reset=success");
    } catch (err) {
      const status = err instanceof ManageApiError ? err.status : 0;
      if (status === 400) clearResetFlow();
      setError(
        status === 429
          ? "Muitas tentativas. Aguarde um minuto e tente novamente."
          : status === 400
            ? "O tempo para trocar a senha acabou. Peça um novo código."
            : status === 422
              ? "Use pelo menos 8 caracteres, com uma letra e um número."
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
          Precisa de outro código? <Link href="/esqueci_senha">Começar de novo</Link>
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
          hint="Mínimo de 8 caracteres, com uma letra e um número."
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
