"use client";

// ContactStep — Step 1: name, clinic, email, and the clinic's WhatsApp number.
// Also carries the honeypot field (visually hidden), matching the convention
// already used by PlanCheckoutCta's anonymous signup modal.

import type { FormEvent } from "react";
import { StepHeading, StepActions } from "./WizardShell";
import type { ContactFields } from "../lib/types";

const honeypotStyle = {
  position: "absolute" as const,
  left: -9999,
  width: 1,
  height: 1,
  opacity: 0,
};

type ContactStepProps = {
  value: ContactFields;
  onChange: (patch: Partial<ContactFields>) => void;
  planLabel: string;
  planTagline: string;
  onNext: () => void;
};

export function ContactStep({ value, onChange, planLabel, planTagline, onNext }: ContactStepProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onNext();
  }

  const valid =
    value.name.trim() && value.clinicName.trim() && value.email.trim() && value.whatsappPhone.trim();

  return (
    <form onSubmit={handleSubmit} noValidate>
      <span className="tag" style={{ marginBottom: 14 }}>
        {planLabel} · {planTagline}
      </span>
      <StepHeading
        title="Vamos criar sua conta."
        desc="Alguns dados de contato para preparar o cadastro da sua clínica na Brain."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label className="field-l">
          <span>Seu nome</span>
          <input
            className="input"
            type="text"
            placeholder="Dr. Aurélio Lima"
            value={value.name}
            onChange={(e) => onChange({ name: e.target.value })}
            required
            autoFocus
          />
        </label>

        <label className="field-l">
          <span>Nome da clínica</span>
          <input
            className="input"
            type="text"
            placeholder="Consultório Dr. Aurélio Lima"
            value={value.clinicName}
            onChange={(e) => onChange({ clinicName: e.target.value })}
            required
          />
        </label>

        <label className="field-l">
          <span>E-mail</span>
          <input
            className="input"
            type="email"
            placeholder="voce@clinica.com.br"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
            required
          />
        </label>

        <label className="field-l">
          <span>WhatsApp da clínica</span>
          <input
            className="input"
            type="tel"
            placeholder="(11) 91234-5678"
            value={value.whatsappPhone}
            onChange={(e) => onChange({ whatsappPhone: e.target.value })}
            required
          />
        </label>

        {/* Honeypot — real visitors never see or fill this field. */}
        <input
          type="text"
          name="website"
          value={value.website}
          onChange={(e) => onChange({ website: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={honeypotStyle}
        />
      </div>

      <StepActions nextType="submit" nextLabel="Continuar" nextDisabled={!valid} />
    </form>
  );
}
