"use client";

// PreCheck demo request form (/precheck#contato). Posts to the PreCheck API
// (lib/api.ts -> POST /leads/demo-request) with the same payload as before;
// only the markup moved to the marketing stylesheet (.mk-*).

import { useState } from "react";
import { submitDemoRequest } from "@/lib/api";
import { BrandIcon } from "@/app/(site)/_components/BrandIcon";

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

  if (sent) {
    return (
      <div className="mk-form">
        <div className="mk-form__done" role="status">
          <span className="mk-form__done-ico" aria-hidden="true">
            <BrandIcon name="check" />
          </span>
          <h3>Recebemos seu pedido.</h3>
          <p>Vamos responder pelo e-mail informado para combinar a demonstração.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="mk-form" id="lp-contact-form" onSubmit={handleSubmit} noValidate>
      <div className="mk-form__row">
        <div className="mk-field">
          <label htmlFor="f-nome">Nome</label>
          <input
            id="f-nome"
            className="mk-input"
            type="text"
            required
            placeholder="Dra. Helena Souza"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            autoComplete="name"
          />
        </div>
        <div className="mk-field">
          <label htmlFor="f-email">E-mail profissional</label>
          <input
            id="f-email"
            className="mk-input"
            type="email"
            required
            placeholder="voce@clinica.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            autoComplete="email"
          />
        </div>
      </div>
      <div className="mk-form__row">
        <div className="mk-field">
          <label htmlFor="f-clinica">
            Clínica ou instituição <span className="mk-optional">(opcional)</span>
          </label>
          <input
            id="f-clinica"
            className="mk-input"
            type="text"
            placeholder="Clínica Exemplo"
            value={clinic}
            onChange={(e) => setClinic(e.target.value)}
            disabled={submitting}
            autoComplete="organization"
          />
        </div>
        <div className="mk-field">
          <label htmlFor="f-perfil">Perfil</label>
          <select
            id="f-perfil"
            className="mk-input"
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
      <div className="mk-field">
        <label htmlFor="f-msg">
          O que você quer ver na demonstração? <span className="mk-optional">(opcional)</span>
        </label>
        <textarea
          id="f-msg"
          className="mk-input"
          placeholder="Ex.: atendemos clínica geral e queremos ver como o resumo chega ao médico"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
        />
      </div>

      {error && (
        <p className="mk-form__error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mk-btn mk-btn--primary mk-btn--block mk-form__submit"
        disabled={submitting}
      >
        {submitting ? "Enviando…" : "Agendar demonstração"}
      </button>
      <p className="mk-form__fine">Usamos estes dados só para responder ao seu pedido.</p>
    </form>
  );
}
