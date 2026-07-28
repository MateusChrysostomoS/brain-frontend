"use client";
// MessagesSection — Section 02 "Mensagens". Every field here already existed
// on secretarIA's wire (TenantConfigWire) — this is the first UI for them.
// greeting_message/returning_greeting_message/language were silently unused
// by the old UI; greeting_buttons is capped at 3 short labels (WhatsApp
// quick-reply buttons). The old free-text tone/behavior-rules field was
// removed from this UI — a hardcoded safety layer now lives in the backend
// prompt instead of a clinic-editable field.

import { Icon, Field, TextInput, TextArea } from "../../_shared/ui";
import { Section } from "./Section";
import { CSelect } from "./CSelect";
import type { Messages } from "../lib/types";

const MAX_GREETING_BUTTONS = 3;

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
];

type MessagesSectionProps = {
  v: Messages;
  set: <K extends keyof Messages>(key: K, value: Messages[K]) => void;
  // True when the secretarIA hub is unreachable right now (see
  // useSecretariaHub) — inputs are disabled since nothing typed here could
  // be saved until the connection returns.
  readOnly?: boolean;
};

export function MessagesSection({ v, set, readOnly }: MessagesSectionProps) {
  const updateButton = (i: number, text: string) =>
    set(
      "greetingButtons",
      v.greetingButtons.map((b, j) => (j === i ? text : b)),
    );

  const removeButton = (i: number) =>
    set(
      "greetingButtons",
      v.greetingButtons.filter((_, j) => j !== i),
    );

  const addButton = () => {
    if (v.greetingButtons.length >= MAX_GREETING_BUTTONS) return;
    set("greetingButtons", [...v.greetingButtons, ""]);
  };

  return (
    <Section
      id="msg"
      num="02"
      icon="send"
      title="Mensagens"
      desc="Como a secretarIA cumprimenta e se comporta no WhatsApp — a primeira impressão que o paciente tem da clínica."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field
          label="Mensagem de boas-vindas"
          tip="Enviada quando um paciente escreve pela primeira vez (ou depois de muito tempo sem conversar)."
        >
          <TextArea
            value={v.greetingMessage}
            onChange={e => set("greetingMessage", e.target.value)}
            rows={3}
            placeholder='Ex.: "Olá! Aqui é a secretária do Dr. Aurélio Lima. Como posso ajudar você hoje?"'
            disabled={readOnly}
          />
        </Field>

        <Field
          label="Mensagem para paciente recorrente"
          tip="Enviada quando o paciente já conversou com a secretarIA antes — pode ser mais direta e pessoal."
        >
          <TextArea
            value={v.returningGreetingMessage}
            onChange={e => set("returningGreetingMessage", e.target.value)}
            rows={3}
            placeholder='Ex.: "Oi de novo! Em que posso ajudar dessa vez?"'
            disabled={readOnly}
          />
        </Field>

        <Field
          label="Botões rápidos"
          tip="Até 3 opções curtas mostradas como botões do WhatsApp junto com a mensagem de boas-vindas — ex.: “Agendar consulta”, “Ver endereço”."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {v.greetingButtons.map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <TextInput
                  value={text}
                  onChange={e => updateButton(i, e.target.value)}
                  placeholder="Ex.: Agendar consulta"
                  maxLength={20}
                  style={{ flex: 1 }}
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeButton(i)}
                    title="Remover botão"
                    aria-label="Remover botão"
                    style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--ink-faint)",
                      background: "var(--surface-2)", border: "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name="x" size={15} />
                  </button>
                )}
              </div>
            ))}
            {!readOnly && v.greetingButtons.length < MAX_GREETING_BUTTONS && (
              <button
                type="button"
                onClick={addButton}
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600, color: "var(--brand)",
                  padding: "5px 2px",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                <Icon name="plus" size={15} />
                Adicionar botão ({v.greetingButtons.length}/{MAX_GREETING_BUTTONS})
              </button>
            )}
          </div>
        </Field>

        <Field label="Idioma de atendimento">
          <CSelect
            value={v.language}
            onChange={e => set("language", e.target.value)}
            disabled={readOnly}
            style={{ maxWidth: 320 }}
          >
            {LANGUAGE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </CSelect>
        </Field>
      </div>
    </Section>
  );
}
