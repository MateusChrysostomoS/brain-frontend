"use client";

// ContactForm — demo request form matching the #contato section in brain.html / SecretarIA.html.
// "brain" variant: interest radio (PreCheck / secretarIA / Os dois).
// "secretaria" variant: profile radio (Clínica privada / Médico autônomo / Setor público).
// No network call on submit — shows a friendly success message (stub for future integration).

import { useState, type FormEvent } from "react";
import { BrandIcon } from "./BrandIcon";

type ContactFormProps = {
  variant?: "brain" | "secretaria";
};

// Field state shape for the controlled form.
type FormState = {
  name: string;
  email: string;
  clinic: string;
  radioValue: string;
  message: string;
};

export function ContactForm({ variant = "brain" }: ContactFormProps) {
  // Default radio selection differs per variant (matches the "on" class in the HTML).
  const defaultRadio =
    variant === "secretaria" ? "Clínica privada" : "Os dois";

  const [fields, setFields] = useState<FormState>({
    name: "",
    email: "",
    clinic: "",
    radioValue: defaultRadio,
    message: "",
  });

  // When true, replaces the form with a success message.
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof FormState, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Stub: no network call. Future: POST to /api/demo-request.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 30px" }}>
        <span style={{ fontSize: 40 }}>✅</span>
        <h3 className="h-card" style={{ marginTop: 18 }}>
          Recebemos seu pedido!
        </h3>
        <p className="muted" style={{ marginTop: 12, fontSize: 15 }}>
          Nossa equipe vai entrar em contato em até 1 dia útil para confirmar o
          horário da demonstração. Até já!
        </p>
      </div>
    );
  }

  // Radio options differ by variant.
  const radioLabel =
    variant === "secretaria" ? "Perfil" : "Tenho interesse em";
  const radioOptions =
    variant === "secretaria"
      ? ["Clínica privada", "Médico autônomo", "Setor público"]
      : ["PreCheck", "secretarIA", "Os dois"];

  return (
    <form className="card" onSubmit={handleSubmit}>
      {/* Name + email row */}
      <div className="form-grid">
        <label className="field-l">
          <span>Nome</span>
          <input
            className="input"
            type="text"
            placeholder="Dr. Aurélio Lima"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>
        <label className="field-l">
          <span>E-mail profissional</span>
          <input
            className="input"
            type="email"
            placeholder="voce@clinica.com.br"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </label>
      </div>

      {/* Clinic / institution */}
      <label className="field-l mt-m">
        <span>
          {variant === "secretaria" ? "Clínica ou consultório" : "Clínica ou instituição"}
        </span>
        <input
          className="input"
          type="text"
          placeholder="Consultório Dr. Aurélio Lima"
          value={fields.clinic}
          onChange={(e) => update("clinic", e.target.value)}
        />
      </label>

      {/* Radio pills */}
      <div className="field-l mt-m">
        <span>{radioLabel}</span>
        <div className="radio-row">
          {radioOptions.map((opt) => (
            <label
              key={opt}
              className={
                "radio-pill" + (fields.radioValue === opt ? " on" : "")
              }
            >
              {/* Input is visually hidden per brand-ds.css; click on label selects it */}
              <input
                type="radio"
                name="radio-option"
                value={opt}
                checked={fields.radioValue === opt}
                onChange={() => update("radioValue", opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Optional message */}
      <label className="field-l mt-m">
        <span>O que você quer ver na demo? (opcional)</span>
        <textarea
          className="textarea"
          placeholder={
            variant === "secretaria"
              ? "Ex.: como ela responde dúvidas de convênio e marca um retorno…"
              : "Conte um pouco sobre a sua clínica e o que mais te interessa…"
          }
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </label>

      {/* Submit CTA — secretaria variant includes a whatsapp icon per SecretarIA.html */}
      <button
        className="btn btn--primary btn--block btn--lg mt-m"
        type="submit"
      >
        {variant === "secretaria" && <BrandIcon name="whatsapp" />}
        Agendar minha demonstração
      </button>

      {/* Privacy note */}
      <p
        className="faint center mt-s"
        style={{ fontSize: 12 }}
      >
        Ao enviar, você concorda com a nossa Política de Privacidade. Não
        compartilhamos seus dados.
      </p>
    </form>
  );
}
