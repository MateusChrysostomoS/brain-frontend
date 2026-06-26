"use client";
// GoogleSection — Section 04 "Integração com o Google Calendar".
// Shows an OAuth connect card when disconnected, and a connected state card
// when gcal.connected is true. Includes two-way sync toggle and manual
// credential entry (advanced, inside a <details> element).
// The connect action is simulated with a 1.4s delay matching the source design.

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Icon, Btn, Field, TextInput } from "../../_shared/ui";
import { Section } from "./Section";
import { CSelect } from "./CSelect";
import { ToggleRow } from "./ToggleRow";
import { GoogleGlyph } from "./GoogleGlyph";
import type { GcalState } from "../lib/types";

type GoogleSectionProps = {
  gcal: GcalState;
  setGcal: Dispatch<SetStateAction<GcalState>>;
};

// Section 04 — Google Calendar OAuth connect/disconnect + settings when connected.
export function GoogleSection({ gcal, setGcal }: GoogleSectionProps) {
  // Local loading state for the simulated OAuth flow
  const [connecting, setConnecting] = useState(false);

  const connect = () => {
    setConnecting(true);
    // Simulate OAuth round-trip (1.4 s delay mirrors the source)
    setTimeout(() => {
      setConnecting(false);
      setGcal(g => ({
        ...g,
        connected: true,
        email: "dr.aurelio.lima@gmail.com",
        calendar: "Agenda — Consultório",
      }));
    }, 1400);
  };

  const disconnect = () =>
    setGcal(g => ({ ...g, connected: false, email: "", calendar: "" }));

  return (
    <Section
      id="gcal"
      num="04"
      icon="calendar"
      title="Integração com o Google Calendar"
      desc="Autorize o acesso para a secretarIA criar, mover e cancelar eventos na sua agenda do Google em tempo real — sem choque de horários."
    >
      {!gcal.connected ? (
        // --- disconnected state ---
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* connect card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: 20, borderRadius: 14,
            background: "var(--surface-2)", border: "1px solid var(--line)",
          }}>
            <span style={{
              width: 46, height: 46, borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--line-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <GoogleGlyph />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                Conta do Google não conectada
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 2 }}>
                Conecte para sincronizar a agenda de atendimentos.
              </div>
            </div>
            <Btn variant="solidDark" icon="calendar" onClick={connect} disabled={connecting}>
              {connecting ? "Autorizando…" : "Conectar com Google"}
            </Btn>
          </div>

          {/* OAuth privacy notice */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 9,
            fontSize: 12.5, color: "var(--ink-faint)", lineHeight: 1.5,
          }}>
            <Icon name="ban" size={15} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>
              Usamos OAuth 2.0 do Google. A secretarIA recebe apenas permissão de leitura e escrita
              na agenda escolhida — nada além disso. Você pode revogar quando quiser.
            </span>
          </div>

          {/* advanced manual credentials (collapsed by default) */}
          <details style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <summary style={{
              fontSize: 13, fontWeight: 600, color: "var(--ink-soft)",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <Icon name="edit" size={15} />
              Conectar manualmente com credenciais (avançado)
            </summary>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 16, marginTop: 16,
            }}>
              <Field
                label="Client ID"
                tip="ID do cliente OAuth gerado no Google Cloud Console do consultório."
              >
                <TextInput placeholder="xxxxx.apps.googleusercontent.com" />
              </Field>
              <Field
                label="Client Secret"
                tip="Chave secreta do cliente OAuth. Fica criptografada e nunca é exibida ao paciente."
              >
                <TextInput type="password" placeholder="••••••••••••••••" />
              </Field>
            </div>
          </details>
        </div>
      ) : (
        // --- connected state ---
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* connected account card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: 18, borderRadius: 14,
            background: "var(--st-attend-bg)", border: "1px solid var(--st-attend-bd)",
          }}>
            <span style={{
              width: 44, height: 44, borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--line-strong)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <GoogleGlyph />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--st-attend-ink)" }}>
                  Conectado
                </span>
                <Icon name="checkCircle" size={16} style={{ color: "var(--st-attend-ink)" }} />
              </div>
              <div style={{
                fontSize: 13, color: "var(--ink-soft)", marginTop: 2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {gcal.email}
              </div>
            </div>
            <Btn variant="outline" size="sm" onClick={disconnect}>Desconectar</Btn>
          </div>

          {/* calendar + timezone selects */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field
              label="Agenda de destino"
              tip="Em qual calendário do Google as consultas serão criadas. Use uma agenda dedicada ao consultório."
            >
              <CSelect
                value={gcal.calendar}
                onChange={e => setGcal(g => ({ ...g, calendar: e.target.value }))}
              >
                <option>Agenda — Consultório</option>
                <option>Pessoal</option>
                <option>Plantões</option>
              </CSelect>
            </Field>
            <Field
              label="Fuso horário"
              tip="Garante que os horários enviados ao paciente batam com os da agenda."
            >
              <CSelect
                value={gcal.tz}
                onChange={e => setGcal(g => ({ ...g, tz: e.target.value }))}
              >
                <option>(GMT-03:00) Brasília</option>
                <option>(GMT-04:00) Manaus</option>
                <option>(GMT-05:00) Acre</option>
              </CSelect>
            </Field>
          </div>

          {/* two-way sync toggle row */}
          <ToggleRow
            on={gcal.twoWay}
            onChange={v => setGcal(g => ({ ...g, twoWay: v }))}
            title="Sincronização nos dois sentidos"
            desc="Eventos criados direto no Google também bloqueiam horários na secretarIA."
          />
        </div>
      )}
    </Section>
  );
}
