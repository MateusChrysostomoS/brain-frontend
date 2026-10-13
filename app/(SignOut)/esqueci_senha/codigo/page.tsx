"use client";

// /esqueci_senha/codigo — Step 2 of the password-reset flow (TASK-056).
// The e-mail typed in step 1 and the token returned here live only in
// lib/password-reset-memory.ts (never in the URL or storage); without them —
// e.g. after a reload — the person is sent back to step 1.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ManageApiError, requestPasswordReset, verifyResetCode } from "@/lib/manage-api";
import {
  forgetResetToken,
  getResetEmail,
  normalizeResetCode,
  setResetToken,
} from "@/lib/password-reset-memory";

import { AuthShell } from "../../_shared/AuthShell";
import { StepIndicator } from "../../_shared/StepIndicator";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ResetCodePage() {
  const router = useRouter();

  // --- State ---
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // --- Effects ---
  // A token from an earlier pass must not survive into this step (review F2).
  useEffect(() => {
    forgetResetToken();
    const current = getResetEmail();
    if (!current) router.replace("/esqueci_senha");
    else setEmail(current);
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  // --- Handlers ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (code.length !== 6) {
      setError("Digite os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    try {
      const { reset_token } = await verifyResetCode(email, code);
      setResetToken(reset_token);
      router.push("/esqueci_senha/atualizar_senha");
    } catch (err) {
      const status = err instanceof ManageApiError ? err.status : 0;
      setError(
        status === 429
          ? "Muitas tentativas. Aguarde um minuto e tente novamente."
          : "Código inválido ou expirado. Confira o e-mail ou peça um novo código.",
      );
      setLoading(false);
    }
  }

  async function resend() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccess("Enviamos um novo código. Use só o mais recente.");
    } catch (err) {
      const status = err instanceof ManageApiError ? err.status : 0;
      setError(
        status === 429
          ? "Muitas tentativas. Tente novamente em alguns minutos."
          : "Erro ao processar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={
        <>
          Digite o <em>código</em>.
        </>
      }
      subtitle={`Enviamos um código de 6 dígitos para ${email}. Ele vale 10 minutos.`}
      error={error}
      success={success}
      belowCard={
        <p className="login-help">
          E-mail errado? <Link href="/esqueci_senha">Usar outro e-mail</Link>
        </p>
      }
    >
      <StepIndicator current={2} total={3} />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="code">Código</label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(normalizeResetCode(e.target.value))}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary login-submit"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verificando…" : "Continuar"}
        </button>

        <p className="login-help">
          Não recebeu?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => void resend()}
            disabled={loading || cooldown > 0}
          >
            {cooldown > 0 ? `Reenviar código em ${cooldown} s` : "Reenviar código"}
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
