"use client";
// ServicesSection — Section 02 "Serviços oferecidos".
// Manages a list of service rows (name, duration, price) with add/remove.
// ServiceRow is an internal sub-component not used elsewhere.

import { Icon, HelpTip, TextInput } from "../../_shared/ui";
import { Section } from "./Section";
import { CSelect } from "./CSelect";
import type { Service } from "../lib/types";
import type { Dispatch, SetStateAction } from "react";

// Duration options in minutes matching the original source.
const DURATION_OPTIONS = [15, 20, 30, 40, 50, 60, 90];

// ---------------------------------------------------------------------------
// ServiceRow — internal: single editable service row
// ---------------------------------------------------------------------------

type ServiceRowProps = {
  s: Service;
  onChange: (updated: Service) => void;
  onRemove: () => void;
  canRemove: boolean;
};

// One row in the services table: name TextInput, duration CSelect, price TextInput, remove button.
function ServiceRow({ s, onChange, onRemove, canRemove }: ServiceRowProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr 1fr 38px",
      gap: 10,
      alignItems: "center",
    }}>
      <TextInput
        value={s.name}
        onChange={e => onChange({ ...s, name: e.target.value })}
        placeholder="Nome do serviço"
      />
      <CSelect
        value={s.dur}
        onChange={e => onChange({ ...s, dur: +e.target.value })}
      >
        {DURATION_OPTIONS.map(d => (
          <option key={d} value={d}>{d} min</option>
        ))}
      </CSelect>
      <TextInput
        value={s.price}
        onChange={e => onChange({ ...s, price: e.target.value })}
        placeholder="R$ — (opcional)"
      />
      {/* remove button — disabled when only one service remains */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        title="Remover"
        style={{
          width: 38, height: 38, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--surface-2)", border: "1px solid var(--line)",
          color: "var(--ink-faint)",
          opacity: canRemove ? 1 : 0.4,
          cursor: canRemove ? "pointer" : "not-allowed",
        }}
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServicesSection
// ---------------------------------------------------------------------------

type ServicesSectionProps = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
};

// Renders the services list with add/remove controls inside Section 02.
export function ServicesSection({ services, setServices }: ServicesSectionProps) {
  const update = (i: number, s: Service) =>
    setServices(prev => prev.map((x, j) => (j === i ? s : x)));

  const remove = (i: number) =>
    setServices(prev => prev.filter((_, j) => j !== i));

  const add = () =>
    setServices(prev => [...prev, { id: Date.now(), name: "", dur: 50, price: "" }]);

  return (
    <Section
      id="srv"
      num="02"
      icon="doc"
      title="Serviços oferecidos"
      desc="Os tipos de atendimento que a secretarIA pode agendar. A duração define automaticamente o tamanho do horário na agenda."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {/* column header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 38px",
          gap: 10, padding: "0 2px",
        }}>
          {(["Serviço", "Duração", "Valor", ""] as const).map((header, i) => (
            <span
              key={i}
              style={{
                fontSize: 11.5, fontWeight: 700,
                color: "var(--ink-faint)", letterSpacing: ".04em",
                textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {header}
              {/* HelpTip on Duração and Valor columns */}
              {i === 1 && <HelpTip text="Tempo reservado na agenda para esse serviço." />}
              {i === 2 && <HelpTip text="Opcional. Se preenchido, a secretarIA pode informar o valor ao paciente." />}
            </span>
          ))}
        </div>

        {/* service rows */}
        {services.map((s, i) => (
          <ServiceRow
            key={s.id}
            s={s}
            onChange={ns => update(i, ns)}
            onRemove={() => remove(i)}
            canRemove={services.length > 1}
          />
        ))}

        {/* add service button */}
        <button
          type="button"
          onClick={add}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            alignSelf: "flex-start", marginTop: 4,
            padding: "9px 15px", borderRadius: 10,
            fontSize: 13.5, fontWeight: 600,
            color: "var(--brand)", background: "var(--brand-tint)",
            border: "1px dashed var(--brand)", cursor: "pointer",
          }}
        >
          <Icon name="plus" size={16} />
          Adicionar serviço
        </button>
      </div>
    </Section>
  );
}
