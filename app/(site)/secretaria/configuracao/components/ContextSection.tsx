"use client";
// ContextSection — Section 01 "Contexto da clínica".
// Collects the clinic name, specialty, about blurb, structured address, phone,
// accepted insurances, convênio-collection preference, and tone-of-voice rules
// for the WhatsApp assistant.

import { Field, TextInput, TextArea } from "../../_shared/ui";
import { Section } from "./Section";
import { AddressFields } from "./AddressFields";
import { ToggleRow } from "./ToggleRow";
import type { ClinicCtx } from "../lib/types";

type ContextSectionProps = {
  v: ClinicCtx;
  // Generic setter — keeps each key bound to its own value type (string/boolean).
  set: <K extends keyof ClinicCtx>(key: K, value: ClinicCtx[K]) => void;
};

// Renders all context fields inside a Section card with HelpTip annotations.
export function ContextSection({ v, set }: ContextSectionProps) {
  return (
    <Section
      id="ctx"
      num="01"
      icon="note"
      title="Contexto da clínica"
      desc="É a base de tudo. A secretarIA usa essas informações para responder pacientes no WhatsApp com o tom e os dados certos."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* row 1: clinic name + specialty */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field
            label="Nome da clínica / consultório"
            tip="Nome que a secretarIA usa ao se apresentar e em mensagens — ex.: “Consultório Dr. Aurélio Lima”."
          >
            <TextInput
              value={v.clinicName}
              onChange={e => set("clinicName", e.target.value)}
              placeholder="Consultório Dr. Aurélio Lima"
            />
          </Field>
          <Field
            label="Especialidade principal"
            tip="Ajuda o bot a entender o tipo de atendimento e a triar dúvidas comuns da especialidade."
          >
            <TextInput
              value={v.specialty}
              onChange={e => set("specialty", e.target.value)}
              placeholder="Clínica geral, Cardiologia…"
            />
          </Field>
        </div>

        {/* about textarea */}
        <Field
          label="Sobre a clínica (contexto para o bot)"
          tip="Descreva em poucas linhas o que é a clínica, público atendido e diferenciais. Quanto mais contexto, mais natural e correta fica a resposta da secretarIA."
        >
          <TextArea
            value={v.about}
            onChange={e => set("about", e.target.value)}
            rows={4}
            placeholder="Ex.: Clínica de clínica geral focada em atendimento humanizado a adultos e idosos, atende particular e os convênios listados abaixo. Localizada na região central, com estacionamento próprio…"
          />
        </Field>

        {/* structured clinic address */}
        <AddressFields v={v} set={set} />

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
            />
          </Field>
        </div>

        {/* convênio collection preference (patient PII — minimized per LGPD) */}
        <ToggleRow
          on={v.collectInsurance}
          onChange={value => set("collectInsurance", value)}
          title="Coletar convênio do paciente"
          desc="Quando ativo, a secretarIA pergunta no agendamento se o paciente tem convênio e qual. Ative apenas se for usar essa informação."
        />

        {/* tone of voice */}
        <Field
          label="Tom de voz e regras do atendimento"
          tip="Como a secretarIA deve falar e o que NÃO pode fazer. Ex.: tratar por “você”, não dar diagnóstico, encaminhar urgências ao pronto-socorro."
        >
          <TextArea
            value={v.tone}
            onChange={e => set("tone", e.target.value)}
            rows={3}
            placeholder="Ex.: Tom cordial e próximo, tratando o paciente por “você”. Nunca dar diagnóstico nem orientação clínica. Em caso de urgência, orientar a procurar o pronto-socorro mais próximo."
          />
        </Field>
      </div>
    </Section>
  );
}
