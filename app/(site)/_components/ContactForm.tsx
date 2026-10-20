"use client";

// ContactForm — "Agendar demonstração" lead capture on the Brain home (#contato).
// "brain" variant: interest radio (PreCheck / secretarIA / Os dois) -> product_interest.
// "secretaria" variant: profile radio (Clínica privada / Médico autônomo / Setor público) -> profile.
// Submits to brain-api POST /demo-requests, then shows the confirmation state.
//
// Markup uses the marketing stylesheet (components/landing/site.css, .mk-*).
// The submit payload and the API call are unchanged.

import { useState, type FormEvent } from "react";
import {
  submitDemoRequest,
  type DemoProductInterest,
  type DemoProfile,
} from "@/lib/manage-api";
import { BrandIcon } from "./BrandIcon";

type ContactFormProps = {
  variant?: "brain" | "secretaria";
};

// The "brain" radio captures product interest.
function mapInterest(radio: string): DemoProductInterest | null {
  if (radio === "PreCheck") return "precheck";
  if (radio === "secretarIA") return "secretaria";
  if (radio === "Os dois") return "ambos";
  return null;
}

// The "secretaria" radio captures the caller's profile. "Setor público" maps to
// the public-sector enum value (secretaria_municipal); hospital/outro aren't
// offered by this variant (the enum is a superset).
function mapProfile(radio: string): DemoProfile | null {
  if (radio === "Clínica privada") return "clinica_privada";
  if (radio === "Médico autônomo") return "medico_autonomo";
  if (radio === "Setor público") return "secretaria_municipal";
  return null;
}

// Field state shape for the controlled form.
type FormState = {
  name: string;
  email: string;
  clinic: string;
  radioValue: string;
  message: string;
};

export function ContactForm({ variant = "brain" }: ContactFormProps) {
  const defaultRadio = variant === "secretaria" ? "Clínica privada" : "Os dois";

  const [fields, setFields] = useState<FormState>({
    name: "",
    email: "",
    clinic: "",
    radioValue: defaultRadio,
    message: "",
  });

  // When true, replaces the form with a success message.
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(key: keyof FormState, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await submitDemoRequest({
        name: fields.name.trim(),
        email: fields.email.trim(),
        clinic: fields.clinic.trim() || null,
        message: fields.message.trim() || null,
        source: variant === "secretaria" ? "secretaria" : "brain",
        // secretaria variant collects a profile; brain variant collects interest.
        profile: variant === "secretaria" ? mapProfile(fields.radioValue) : null,
        product_interest:
          variant === "secretaria" ? "secretaria" : mapInterest(fields.radioValue),
      });
      setSubmitted(true);
    } catch {
      setError("Não foi possível enviar agora. Verifique os dados e tente novamente.");
      setSubmitting(false);
    }
  }

  if (submitted) {
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

  const radioLabel = variant === "secretaria" ? "Perfil" : "Tenho interesse em";
  const radioOptions =
    variant === "secretaria"
      ? ["Clínica privada", "Médico autônomo", "Setor público"]
      : ["PreCheck", "secretarIA", "Os dois"];

  return (
    <form className="mk-form" onSubmit={handleSubmit}>
      <div className="mk-form__row">
        <label className="mk-field">
          <span>Nome</span>
          <input
            className="mk-input"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Dra. Helena Souza"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </label>
        <label className="mk-field">
          <span>E-mail profissional</span>
          <input
            className="mk-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="voce@clinica.com.br"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </label>
      </div>

      <label className="mk-field">
        <span>
          {variant === "secretaria" ? "Clínica ou consultório" : "Clínica ou instituição"}{" "}
          <span className="mk-optional">(opcional)</span>
        </span>
        <input
          className="mk-input"
          type="text"
          name="organization"
          autoComplete="organization"
          placeholder="Clínica Exemplo"
          value={fields.clinic}
          onChange={(e) => update("clinic", e.target.value)}
        />
      </label>

      <fieldset className="mk-fieldset">
        <legend>{radioLabel}</legend>
        <div className="mk-choices">
          {radioOptions.map((opt) => (
            <label key={opt} className="mk-choice">
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
      </fieldset>

      <label className="mk-field">
        <span>
          O que você quer ver na demonstração? <span className="mk-optional">(opcional)</span>
        </span>
        <textarea
          className="mk-input"
          name="message"
          placeholder={
            variant === "secretaria"
              ? "Ex.: como ela responde dúvidas de convênio e marca um retorno"
              : "Conte um pouco sobre a clínica e o que mais interessa"
          }
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </label>

      <button
        className="mk-btn mk-btn--primary mk-btn--block mk-form__submit"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Enviando…" : "Agendar demonstração"}
      </button>

      {error && (
        <p className="mk-form__error" role="alert">
          {error}
        </p>
      )}

      <p className="mk-form__fine">Usamos estes dados só para responder ao seu pedido.</p>
    </form>
  );
}
