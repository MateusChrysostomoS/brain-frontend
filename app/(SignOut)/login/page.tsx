"use client";

// Login (/login) — authenticates a clinician and stores the JWT.
// Visual chrome is provided by <AuthShell>; this file owns only the
// form state, validation, and the call into `lib/api.login()`.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { login } from "@/lib/api";
import { setToken } from "@/lib/auth";

import { AuthShell } from "../_shared/AuthShell";
import { PasswordField } from "../_shared/PasswordField";

// Suspense boundary required by Next.js 15 because <LoginInner> reads
// URL search params (?reset=success after a finished password reset).
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();

  // --- State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Derived ---
  // Show a success banner when /esqueci_senha redirects here after a reset.
  const justReset = search.get("reset") === "success";
  const success = justReset
    ? "Senha redefinida com sucesso. Faça login com a nova senha."
    : "";

  // --- Handlers ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "Credenciais inválidas"
          ? "E-mail ou senha incorretos."
          : "Erro ao conectar. Tente novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={
        <>
          Acesso à <em>sua clínica</em>.
        </>
      }
      subtitle="Entre para revisar os resumos pré-consulta do dia."
      error={error}
      success={success}
      belowCard={
        <>
          <div className="login-divider">ou</div>
          <p className="login-help">
            Sua clínica ainda não usa PreCheck?{" "}
            <Link href="/#contato">Agendar demonstração</Link>
          </p>
        </>
      }
    >
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="clinica@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <PasswordField
          id="senha"
          label="Senha"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />

        <div className="login-row">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Lembrar de mim
          </label>
          <Link href="/esqueci_senha">Esqueci a senha</Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary login-submit"
          disabled={loading}
        >
          {loading ? (
            "Entrando…"
          ) : (
            <>
              Entrar
              <ArrowRightIcon />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}

function LoginFallback() {
  return (
    <AuthShell
      title={
        <>
          Acesso à <em>sua clínica</em>.
        </>
      }
      subtitle="Carregando…"
    >
      <div style={{ height: 200 }} aria-hidden="true" />
    </AuthShell>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
