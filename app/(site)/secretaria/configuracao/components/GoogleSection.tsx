"use client";
// GoogleSection — Section 08 "Integração com o Google Calendar".
// Shows an OAuth connect card when disconnected, and a connected state card
// when gcal.connected is true.
// When `onConnect`/`onDisconnect` are provided (hubReady in the parent page),
// they drive the real secretarIA hub OAuth handoff. When either is
// undefined, the corresponding action is genuinely unavailable — the button
// renders disabled with an explanatory hint, never a fabricated result.
//
// `connected` is the ONLY field GcalState carries, because it is the ONLY
// one secretarIA's wire actually backs (TenantConfigWire.calendar_connected).
// There is no account email, named-calendar list, or two-way-sync
// preference on the wire today, so none of that is rendered or editable
// here — inventing values for them would be exactly the kind of fake data
// on an authenticated surface this pass removes.
//
// Onboarding & Multi-Professional pass: this stays the TENANT-level connect
// (unchanged single-professional path, per spec) — multi-professional clinics
// additionally get a per-professional "Conectar Google Calendar" button in
// ProfessionalsSection (Section 05).

import { useState } from "react";
import { Icon, Btn } from "../../_shared/ui";
import { Section } from "./Section";
import { GoogleGlyph } from "./GoogleGlyph";
import type { GcalState } from "../lib/types";

type GoogleSectionProps = {
  // Read-only display state — the real `connected` flag is owned and
  // updated by the parent page (hydration on load, onDisconnect on
  // success). GoogleSection has no local mutation path for it anymore: the
  // old fake-connect/demo-edit branches that needed a setter are gone.
  gcal: GcalState;
  // Real hub handoff (see lib/secretaria-hub.ts). undefined => genuinely
  // unavailable right now (not logged in, or the hub isn't reachable) — the
  // connect button renders disabled instead of simulating a result.
  onConnect?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
  // Shown next to the disabled connect button when onConnect is undefined,
  // so the parent can explain WHY (not logged in vs. hub temporarily
  // unreachable) instead of one generic message.
  connectHint?: string;
};

// Section 08 — Google Calendar OAuth connect/disconnect + real connected status.
export function GoogleSection({
  gcal,
  onConnect,
  onDisconnect,
  connectHint = "Conecte-se após entrar na sua conta para ativar a integração.",
}: GoogleSectionProps) {
  // Local loading state for the connect flow
  const [connecting, setConnecting] = useState(false);
  // Inline error shown when the real hub OAuth handoff fails
  const [oauthError, setOauthError] = useState<string | null>(null);

  const connect = async () => {
    if (!onConnect) return; // no real handoff available — button is disabled instead
    setOauthError(null);
    setConnecting(true);
    try {
      // On success this navigates the browser away to Google's consent
      // screen — the pending state below only matters on failure.
      await onConnect();
    } catch (e) {
      console.error("secretaria hub: failed to start Google OAuth", e);
      setOauthError("Não foi possível iniciar a conexão com o Google agora. Tente novamente.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!onDisconnect) return; // connected card only renders with real data — see below
    setOauthError(null);
    try {
      await onDisconnect();
    } catch (e) {
      console.error("secretaria hub: failed to disconnect Google Calendar", e);
      setOauthError("Não foi possível desconectar agora. Tente novamente.");
    }
  };

  return (
    <Section
      id="gcal"
      num="08"
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
              {/* real "can't connect right now" state — never a fabricated success */}
              {!onConnect && (
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 6 }}>
                  {connectHint}
                </div>
              )}
            </div>
            <Btn
              variant="solidDark"
              icon="calendar"
              onClick={connect}
              disabled={connecting || !onConnect}
            >
              {connecting ? "Autorizando…" : "Conectar com Google"}
            </Btn>
          </div>

          {/* inline error — only surfaces when the real hub OAuth handoff fails */}
          {oauthError && (
            <p role="alert" style={{ fontSize: 12.5, color: "var(--st-miss-ink, #c0392b)", margin: 0 }}>
              {oauthError}
            </p>
          )}

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
        </div>
      ) : (
        // --- connected state — only `connected` is real, so only `connected` is shown ---
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
            </div>
            <Btn variant="outline" size="sm" onClick={disconnect} disabled={!onDisconnect}>
              Desconectar
            </Btn>
          </div>

          {/* inline error — only surfaces when the real hub disconnect fails */}
          {oauthError && (
            <p role="alert" style={{ fontSize: 12.5, color: "var(--st-miss-ink, #c0392b)", margin: 0 }}>
              {oauthError}
            </p>
          )}
        </div>
      )}
    </Section>
  );
}
