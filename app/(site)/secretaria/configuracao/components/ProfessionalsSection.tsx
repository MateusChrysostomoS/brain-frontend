"use client";
// ProfessionalsSection — Section 03 "Profissionais" (Feature C3). Owner view:
// self-bind prompt, a selector for which professional Services/Availability
// edit below, that professional's specialty/about/context fields, the roster
// (completeness chips + per-row Calendar connect), and "Convidar profissional".
// Staff view (Feature E, `lockedToOwnProfessional`): just their own profile
// fields — no roster, no invite, no self-bind (owner-only actions).

import { useState } from "react";
import { Avatar, Btn, Field, Icon, TextArea, TextInput } from "../../_shared/ui";
import type { IconName } from "../../_shared/ui";
import { Section } from "./Section";
import { InviteProfessionalModal } from "./InviteProfessionalModal";
import { createSelfProfessional, type DoctorProfessional, type Session } from "@/lib/manage-api";
import { startProfessionalCalendarOauth } from "@/lib/secretaria-hub";
import type { ProfessionalProfile } from "../lib/types";

type ProfessionalsSectionProps = {
  // null in demo/logged-out mode — every action below degrades to disabled
  // (with an explanatory title) rather than a broken/inert click, mirroring
  // GoogleSection's optional onConnect/onDisconnect pattern.
  session: Session | null;
  isOwner: boolean;
  roster: DoctorProfessional[] | null;
  rosterError: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  lockedToOwnProfessional: boolean;
  profile: ProfessionalProfile;
  onProfileChange: <K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) => void;
  onRosterChanged: () => void;
};

export function ProfessionalsSection({
  session,
  isOwner,
  roster,
  rosterError,
  selectedId,
  onSelect,
  lockedToOwnProfessional,
  profile,
  onProfileChange,
  onRosterChanged,
}: ProfessionalsSectionProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [binding, setBinding] = useState(false);
  const [selfBindDismissed, setSelfBindDismissed] = useState(false);

  // Owner-with-no-professional detection: derived from the roster's linked
  // email (fresh immediately after self-bind) rather than session.professionalId
  // (which only updates on the NEXT token refresh/login).
  const ownerHasProfessional = (roster ?? []).some(
    (p) => p.linked_user_email?.toLowerCase() === session?.email.toLowerCase(),
  );
  const showSelfBindPrompt = isOwner && !ownerHasProfessional && !selfBindDismissed && !!roster;

  async function handleSelfBind() {
    if (!session) return;
    setBinding(true);
    try {
      await createSelfProfessional(session, {});
      onRosterChanged();
    } catch (e) {
      console.error("secretaria configuracao: failed to self-bind professional", e);
    } finally {
      setBinding(false);
    }
  }

  async function handleConnectCalendar(professionalId: string) {
    if (!session) return;
    setConnectError(null);
    setConnectingId(professionalId);
    try {
      const url = await startProfessionalCalendarOauth(session, professionalId);
      window.location.assign(url);
      // Leave connectingId set — the browser is navigating away to Google.
    } catch (e) {
      console.error("secretaria configuracao: failed to start professional Calendar OAuth", e);
      setConnectError("Não foi possível iniciar a conexão agora. Tente novamente.");
      setConnectingId(null);
    }
  }

  const selectedName = roster?.find((p) => p.id === selectedId)?.name ?? null;

  return (
    <Section
      id="prof"
      num="03"
      icon="users"
      title="Profissionais"
      desc={
        lockedToOwnProfessional
          ? "Suas informações como profissional — visíveis apenas para você e para quem administra a clínica."
          : "Cada profissional tem sua própria agenda, serviços e horários. Convide sua equipe e conecte a agenda de cada um."
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {showSelfBindPrompt && (
          <div className="alert-line alert-line--amber" style={{ alignItems: "flex-start", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <span className="dot dot--amber" style={{ marginTop: 6 }} />
              <strong>Você também atende pacientes, ou só administra a clínica?</strong>
            </div>
            <div style={{ display: "flex", gap: 10, paddingLeft: 18 }}>
              <Btn variant="primary" size="sm" onClick={handleSelfBind} disabled={binding}>
                {binding ? "Um momento…" : "Sim, eu também atendo"}
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setSelfBindDismissed(true)}>
                Não, só administro
              </Btn>
            </div>
          </div>
        )}

        {rosterError && (
          <p role="alert" style={{ fontSize: 13, color: "var(--danger, #c0392b)" }}>
            Não foi possível carregar a lista de profissionais agora.
          </p>
        )}

        {!roster && !rosterError && (
          <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>Carregando profissionais…</p>
        )}

        {/* --- Professional selector chips (only when there's a real choice) --- */}
        {!lockedToOwnProfessional && roster && roster.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {roster.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "7px 13px", borderRadius: 999,
                  fontSize: 13, fontWeight: 600,
                  color: p.id === selectedId ? "var(--brand-ink)" : "var(--ink-soft)",
                  background: p.id === selectedId ? "var(--brand-tint)" : "var(--surface-2)",
                  border: `1px solid ${p.id === selectedId ? "var(--brand)" : "var(--line)"}`,
                  cursor: "pointer",
                }}
              >
                <Avatar name={p.name} size={20} />
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* --- Selected professional's profile fields --- */}
        {(lockedToOwnProfessional || selectedId) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {selectedName && !lockedToOwnProfessional && (
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-faint)", letterSpacing: ".02em" }}>
                EDITANDO: {selectedName.toUpperCase()}
              </span>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field
                label="Especialidade"
                tip="Ajuda o bot a entender o tipo de atendimento e a triar dúvidas comuns da especialidade."
              >
                <TextInput
                  value={profile.specialty}
                  onChange={(e) => onProfileChange("specialty", e.target.value)}
                  placeholder="Clínica geral, Cardiologia…"
                />
              </Field>
            </div>
            <Field
              label="Sobre o profissional (contexto para o bot)"
              tip="Esse texto ajuda a personalizar como a assistente fala sobre você. Se sua clínica tiver mais de um profissional, os pacientes também veem esse texto direto, assim que escolhem você na lista."
            >
              <TextArea
                value={profile.about}
                onChange={(e) => onProfileChange("about", e.target.value)}
                rows={3}
                placeholder="Ex.: Atende adultos e idosos há 12 anos, com foco em acompanhamento contínuo…"
              />
            </Field>
            <Field
              label="Instruções específicas para esse profissional"
              tip="Regras adicionais que só valem para os pacientes desse profissional (ex.: preferências de horário, particularidades de atendimento)."
            >
              <TextArea
                value={profile.contextDoctorMessage}
                onChange={(e) => onProfileChange("contextDoctorMessage", e.target.value)}
                rows={2}
                placeholder="Opcional"
              />
            </Field>
          </div>
        )}

        {/* --- Roster (owner only) --- */}
        {!lockedToOwnProfessional && roster && roster.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {connectError && (
              <p role="alert" style={{ fontSize: 12.5, color: "var(--danger, #c0392b)" }}>
                {connectError}
              </p>
            )}
            {roster.map((p) => (
              <ProfessionalRow
                key={p.id}
                professional={p}
                selected={p.id === selectedId}
                onSelect={() => onSelect(p.id)}
                onConnectCalendar={() => handleConnectCalendar(p.id)}
                connecting={connectingId === p.id}
                canConnect={!!session}
              />
            ))}
          </div>
        )}

        {!lockedToOwnProfessional && isOwner && (
          <Btn variant="outline" icon="plus" onClick={() => setInviteOpen(true)} style={{ alignSelf: "flex-start" }}>
            Convidar profissional
          </Btn>
        )}
      </div>

      {isOwner && session && (
        <InviteProfessionalModal
          session={session}
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInvited={onRosterChanged}
        />
      )}
    </Section>
  );
}

// ProfessionalRow — one roster entry: name, completeness chips, invite/email
// status, and its own "Conectar Google Calendar" action.
function ProfessionalRow({
  professional,
  selected,
  onSelect,
  onConnectCalendar,
  connecting,
  canConnect,
}: {
  professional: DoctorProfessional;
  selected: boolean;
  onSelect: () => void;
  onConnectCalendar: () => void;
  connecting: boolean;
  canConnect: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        padding: "13px 16px", borderRadius: 12,
        background: selected ? "var(--brand-tint)" : "var(--surface-2)",
        border: `1px solid ${selected ? "var(--brand)" : "var(--line)"}`,
        cursor: "pointer", transition: "all .14s var(--ease)",
      }}
    >
      <Avatar name={professional.name} size={34} />
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{professional.name}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
          <CompletenessChip label="Agenda" ok={professional.has_calendar} />
          <CompletenessChip label="Serviços" ok={professional.has_services} />
          <CompletenessChip label="Horários" ok={professional.has_hours} />
        </div>
        {professional.invite_pending ? (
          <div style={{ fontSize: 11.5, color: "var(--st-pending-ink, #9a6b00)", marginTop: 4 }}>
            Convite enviado — aguardando aceite
          </div>
        ) : professional.linked_user_email ? (
          <div style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 4 }}>
            {professional.linked_user_email}
          </div>
        ) : null}
      </div>
      <Btn
        variant="outline"
        size="sm"
        icon="calendar"
        // Also selects this row (via the card's own onClick, since this button
        // has no propagation guard) — harmless: connecting a professional's
        // calendar while also making them the selected one is sensible UX.
        onClick={onConnectCalendar}
        disabled={connecting || !canConnect}
        title={canConnect ? undefined : "Entre para conectar a agenda"}
      >
        {connecting ? "Conectando…" : professional.has_calendar ? "Reconectar agenda" : "Conectar Google Calendar"}
      </Btn>
    </div>
  );
}

// CompletenessChip — small ✓/✗ indicator reused for agenda/serviços/horários.
function CompletenessChip({ label, ok }: { label: string; ok: boolean }) {
  const icon: IconName = ok ? "checkCircle" : "xCircle";
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 11.5, fontWeight: 600,
        color: ok ? "var(--st-attend-ink, #1a7f4b)" : "var(--ink-faint)",
      }}
    >
      <Icon name={icon} size={13} />
      {label}
    </span>
  );
}
