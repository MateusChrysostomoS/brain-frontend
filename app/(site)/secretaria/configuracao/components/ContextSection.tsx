"use client";
// ContextSection — Section 01 "Contexto da clínica".
// Collects the clinic name, structured address, phone, accepted insurances,
// and the convênio-collection preference. clinicName is read-only
// (TenantConfigRead.clinic_name, never sent back on save); address/insurances/
// collectInsurance are REAL wire fields (Onboarding & Multi-Professional
// contract §10) as of this pass. `phone` stays demo-only — secretarIA still
// has no clinic-phone wire field. Specialty/about/tone-of-voice moved out:
// specialty/about are now per-professional (see ProfessionalsSection),
// tone-of-voice is now the real `persona_notes` field in MessagesSection.

import { Field, TextInput } from "../../_shared/ui";
import { Section } from "./Section";
import { AddressFields } from "./AddressFields";
import { ToggleRow } from "./ToggleRow";
import type { ClinicCtx } from "../lib/types";

type ContextSectionProps = {
  v: ClinicCtx;
  // Generic setter — keeps each key bound to its own value type (string/boolean).
  set: <K extends keyof ClinicCtx>(key: K, value: ClinicCtx[K]) => void;
  // True for a professional-scoped tenant_staff session (Feature E) — clinic-
  // level info is read-only for them, editable only by the owner.
  readOnly?: boolean;
};

// Renders all context fields inside a Section card with HelpTip annotations.
export function ContextSection({ v, set, readOnly }: ContextSectionProps) {
  return (
    <Section
      id="ctx"
      num="01"
      icon="note"
      title="Contexto da clínica"
      desc="É a base de tudo. A secretarIA usa essas informações para responder pacientes no WhatsApp com o tom e os dados certos."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {readOnly && (
          <div className="alert-line alert-line--amber" style={{ marginBottom: -4 }}>
            <span className="dot dot--amber" />
            Somente o proprietário da clínica pode editar essas informações.
          </div>
        )}

        <Field
          label="Nome da clínica / consultório"
          tip="Nome que a secretarIA usa ao se apresentar e em mensagens — ex.: “Consultório Dr. Aurélio Lima”."
        >
          <TextInput
            value={v.clinicName}
            onChange={e => set("clinicName", e.target.value)}
            placeholder="Consultório Dr. Aurélio Lima"
            disabled={readOnly}
          />
        </Field>

        {/* structured clinic address */}
        <AddressFields v={v} set={set} readOnly={readOnly} />

        {/* row: WhatsApp + accepted insurances */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16 }}>
          <Field
            label="WhatsApp de atendimento"
            tip="Número conectado ao chatbot. É por ele que a secretarIA conversa com os pacientes."
          >
            <TextInput
              value={v.phone}
              onChange={e => set("phone", e.target.value)}
              placeholder="+55 11 99999-9999"
              disabled={readOnly}
            />
          </Field>
          <Field
            label="Convênios aceitos"
            tip="Liste os convênios separados por vírgula. O bot informa o paciente e evita agendamentos indevidos. Deixe em branco se for só particular."
          >
            <TextInput
              value={v.insurances}
              onChange={e => set("insurances", e.target.value)}
              placeholder="Unimed, Bradesco Saúde… (ou vazio para só particular)"
              disabled={readOnly}
            />
          </Field>
        </div>

        {/* convênio collection preference (patient PII — minimized per LGPD) */}
        <ToggleRow
          on={v.collectInsurance}
          onChange={value => set("collectInsurance", value)}
          title="Coletar convênio do paciente"
          desc="Quando ativo, a secretarIA pergunta no agendamento se o paciente tem convênio e qual. Ative apenas se for usar essa informação."
          disabled={readOnly}
        />
      </div>
    </Section>
  );
}
