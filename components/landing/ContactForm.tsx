"use client";

import { useState } from "react";
import { submitDemoRequest } from "@/lib/api";

const PROFILE_OPTIONS = [
  "Clínica privada",
  "Médico autônomo",
  "Secretaria municipal",
  "Hospital",
  "Outro",
];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clinic, setClinic] = useState("");
  const [profile, setProfile] = useState(PROFILE_OPTIONS[0]);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Preencha pelo menos nome e e-mail.");
      return;
    }

    setSubmitting(true);
    try {
      await submitDemoRequest({
        name: name.trim(),
        email: email.trim(),
        clinic: clinic.trim() || undefined,
        profile,
        message: message.trim() || undefined,
      });
      setSent(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      // Mensagem amigável; o rate limit do backend devolve 429.
      setError(
        raw.includes("429")
          ? "Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente."
          : "Não foi possível enviar agora. Tente novamente em alguns instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="final-cta-form" id="lp-contact-form" onSubmit={handleSubmit} noValidate>
      {sent ? (
        <div className="form-success">
          <strong>Recebemos seu pedido.</strong> Entraremos em contato em até 1 dia útil
          pelo email informado. Acabamos de te mandar uma confirmação por e-mail.
        </div>
      ) : (
        <>
          <div className="row">
            <div className="field">
              <label htmlFor="f-nome">Nome</label>
              <input
                id="f-nome"
                type="text"
                required
                placeholder="Dr. Ana Almeida"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="f-email">Email profissional</label>
              <input
                id="f-email"
                type="email"
                required
                placeholder="ana@clinica.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                autoComplete="email"
              />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="f-clinica">Clínica ou instituição</label>
              <input
                id="f-clinica"
                type="text"
                placeholder="Clínica São Lucas"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                disabled={submitting}
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <label htmlFor="f-perfil">Perfil</label>
              <select
                id="f-perfil"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                disabled={submitting}
              >
                {PROFILE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field" style={{ marginBottom: "16px" }}>
            <label htmlFor="f-msg">
              O que você quer ver na demo?{" "}
              <span style={{ color: "var(--dim)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              id="f-msg"
              placeholder="Atendemos cardiologia ambulatorial, queremos avaliar redução do tempo de anamnese."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "12px",
                padding: "10px 14px",
                fontSize: "13.5px",
                color: "#7a2c25",
                background: "rgba(196, 84, 76, 0.08)",
                border: "1px solid rgba(196, 84, 76, 0.25)",
                borderRadius: "10px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary form-submit"
            disabled={submitting}
          >
            {submitting ? "Enviando…" : "Agendar minha demonstração"}
            {!submitting && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
          <p
            style={{
              fontSize: "12px",
              color: "var(--dim)",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            Ao enviar, você concorda com nossa Política de Privacidade. Não compartilhamos
            seus dados.
          </p>
        </>
      )}
    </form>
  );
}
