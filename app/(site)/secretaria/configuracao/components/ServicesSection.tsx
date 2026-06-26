"use client";
// ServicesSection — Section 02 "Serviços oferecidos" (appointment types).
// Manages the list of types SecretarIA can book; each one is a ServiceCard
// that also holds its pre-visit requirements. Composition only — the per-card
// editing logic lives in ServiceCard.

import { Icon } from "../../_shared/ui";
import { Section } from "./Section";
import { ServiceCard } from "./ServiceCard";
import type { Service } from "../lib/types";
import type { Dispatch, SetStateAction } from "react";

type ServicesSectionProps = {
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
};

// Renders the appointment-type cards with add/remove controls inside Section 02.
export function ServicesSection({ services, setServices }: ServicesSectionProps) {
  const update = (i: number, s: Service) =>
    setServices(prev => prev.map((x, j) => (j === i ? s : x)));

  const remove = (i: number) =>
    setServices(prev => prev.filter((_, j) => j !== i));

  // New types default to active with no requirements yet.
  const add = () =>
    setServices(prev => [
      ...prev,
      { id: Date.now(), name: "", dur: 50, price: "", active: true, requirements: [] },
    ]);

  return (
    <Section
      id="srv"
      num="02"
      icon="doc"
      title="Serviços oferecidos"
      desc="Os tipos de atendimento que a secretarIA pode agendar. A duração define o tamanho do horário, e as orientações de pré-consulta são enviadas ao paciente ao marcar cada tipo."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* one card per appointment type */}
        {services.map((s, i) => (
          <ServiceCard
            key={s.id}
            service={s}
            onChange={ns => update(i, ns)}
            onRemove={() => remove(i)}
            canRemove={services.length > 1}
          />
        ))}

        {/* add appointment type button */}
        <button
          type="button"
          onClick={add}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            alignSelf: "flex-start", marginTop: 2,
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
