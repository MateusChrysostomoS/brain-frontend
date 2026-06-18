"use client";
// ===== secretarIA — Appointment detail Drawer =====
// Ported from _design-source/drawer.jsx.
// Slides in from the right; shows either appointment details or a block summary.

import { Icon, Btn, StatusBadge, Avatar, IconBtn } from "../_shared/ui";
import { STATUS_META, fmtRange, dayFull } from "../_shared/data";
import type { Appt, ApptStatus } from "../_shared/data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DrawerProps = {
  appt: Appt;
  onClose: () => void;
  onSetStatus: (appt: Appt, status: ApptStatus) => void;
  onCancel: (appt: Appt) => void;
  onReschedule: (appt: Appt) => void;
  onEdit: (appt: Appt) => void;
  onRemoveBlock: (appt: Appt) => void;
};

// ---------------------------------------------------------------------------
// InfoRow — labelled data row with leading icon
// ---------------------------------------------------------------------------

/**
 * A single info row inside the drawer: icon on the left, label + value on the right.
 * Used for date/time, consultation type, phone, etc.
 */
function InfoRow({
  icon,
  label,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-2)",
          color: "var(--ink-faint)",
        }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "var(--ink-faint)",
            letterSpacing: ".02em",
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatusPicker — three quick-action status buttons (Confirmou / Compareceu / Faltou)
// ---------------------------------------------------------------------------

/**
 * Grid of three status buttons used to quickly update appointment attendance.
 * Active button adopts the matching status tone colours.
 */
function StatusPicker({
  value,
  onPick,
}: {
  value: ApptStatus;
  onPick: (k: ApptStatus) => void;
}) {
  const opts: Array<{ k: ApptStatus; label: string; icon: Parameters<typeof Icon>[0]["name"] }> = [
    { k: "confirmou",  label: "Confirmou",  icon: "check" },
    { k: "compareceu", label: "Compareceu", icon: "checkCircle" },
    { k: "faltou",     label: "Faltou",     icon: "xCircle" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
      {opts.map((o) => {
        const active = value === o.k;
        const tone = STATUS_META[o.k].tone;
        return (
          <button
            key={o.k}
            onClick={() => onPick(o.k)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              padding: "11px 6px",
              borderRadius: 11,
              fontSize: 12.5,
              fontWeight: 600,
              transition: "all .15s var(--ease)",
              background: active ? `var(--st-${tone}-bg)` : "var(--surface-2)",
              color: active ? `var(--st-${tone}-ink)` : "var(--ink-soft)",
              border: `1px solid ${active ? `var(--st-${tone}-bd)` : "var(--line)"}`,
              cursor: "pointer",
            }}
          >
            <Icon name={o.icon} size={19} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drawer — slide-in panel showing full appointment or block details
// ---------------------------------------------------------------------------

/**
 * Right-side detail drawer.
 * - For a bloqueio: shows reason, time range, and a "Remover bloqueio" action.
 * - For an appointment: shows patient identity, info rows, anamnese status,
 *   a quick-status picker, and action buttons (remarcar / editar / cancelar).
 */
export function Drawer({
  appt,
  onClose,
  onSetStatus,
  onCancel,
  onReschedule,
  onEdit,
  onRemoveBlock,
}: DrawerProps) {
  if (!appt) return null;

  const isBlock = appt.status === "bloqueio";

  // Anamnese states and their display metadata
  const anamMeta: Record<
    string,
    { l: string; c: string; i: Parameters<typeof Icon>[0]["name"] }
  > = {
    recebida: { l: "Pré-consulta recebida",  c: "attend",  i: "checkCircle" },
    pendente:  { l: "Pré-consulta pendente", c: "pending", i: "clock" },
    "—":       { l: "Sem pré-consulta",       c: "block",   i: "doc" },
  };
  const am = anamMeta[appt.anamnese ?? "—"] ?? anamMeta["—"];

  return (
    <>
      {/* backdrop — closes drawer on click */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8,28,24,.32)",
          zIndex: 50,
          animation: "fadeIn .2s",
        }}
      />

      {/* panel */}
      <aside
        className="scroll"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 392,
          maxWidth: "92vw",
          zIndex: 51,
          background: "var(--surface)",
          borderLeft: "1px solid var(--line-strong)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          animation: "drawerIn .26s var(--ease)",
          overflowY: "auto",
        }}
      >
        {/* sticky top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid var(--line)",
            position: "sticky",
            top: 0,
            background: "var(--surface)",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink-faint)",
              letterSpacing: ".03em",
              textTransform: "uppercase",
            }}
          >
            {isBlock ? "Bloqueio" : "Detalhes da consulta"}
          </span>
          <IconBtn icon="x" onClick={onClose} title="Fechar" />
        </div>

        {/* --- Block content --- */}
        {isBlock ? (
          <div
            style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div>
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 600,
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink)",
                }}
              >
                {appt.reason}
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
                {dayFull(appt.day)} · {fmtRange(appt.start, appt.dur)}
              </div>
            </div>
            <div style={{ height: 1, background: "var(--line)" }} />
            <Btn
              variant="danger"
              icon="ban"
              onClick={() => onRemoveBlock(appt)}
              style={{ justifyContent: "center" }}
            >
              Remover bloqueio
            </Btn>
          </div>
        ) : (
          /* --- Appointment content --- */
          <div
            style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* patient identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <Avatar name={appt.patient} size={50} />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 600,
                    fontFamily: "var(--font-serif)",
                    color: "var(--ink)",
                    lineHeight: 1.15,
                  }}
                >
                  {appt.patient}
                </div>
                <div style={{ marginTop: 5 }}>
                  <StatusBadge status={appt.status} size="sm" />
                </div>
              </div>
            </div>

            {/* info rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 13,
                padding: "15px 0",
                borderTop: "1px solid var(--line)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <InfoRow icon="calendar" label="Data e horário">
                {dayFull(appt.day)} · {fmtRange(appt.start, appt.dur)}
              </InfoRow>
              <InfoRow icon="doc" label="Tipo de consulta">
                {appt.type}
              </InfoRow>
              <InfoRow icon="phone" label="Telefone">
                {appt.phone}
              </InfoRow>
            </div>

            {/* anamnese / pre-consultation status pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 13px",
                borderRadius: 11,
                background: `var(--st-${am.c}-bg)`,
                border: `1px solid var(--st-${am.c}-bd)`,
                color: `var(--st-${am.c}-ink)`,
              }}
            >
              <Icon name={am.i} size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{am.l}</div>
                <div style={{ fontSize: 11.5, opacity: 0.85 }}>
                  via secretarIA · WhatsApp
                </div>
              </div>
              {appt.anamnese === "recebida" && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Ver resumo
                </span>
              )}
            </div>

            {/* quick status update */}
            <div>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                  marginBottom: 9,
                }}
              >
                Marcar status
              </div>
              <StatusPicker
                value={appt.status}
                onPick={(k) => onSetStatus(appt, k)}
              />
            </div>

            {/* action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 2 }}>
              <div
                style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)" }}
              >
                Ações
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                <Btn
                  variant="outline"
                  icon="swap"
                  onClick={() => onReschedule(appt)}
                  style={{ justifyContent: "center", borderRadius: 11 }}
                >
                  Remarcar
                </Btn>
                <Btn
                  variant="outline"
                  icon="edit"
                  onClick={() => onEdit(appt)}
                  style={{ justifyContent: "center", borderRadius: 11 }}
                >
                  Editar
                </Btn>
              </div>
              <Btn
                variant="danger"
                icon="xCircle"
                onClick={() => onCancel(appt)}
                style={{ justifyContent: "center", borderRadius: 11 }}
              >
                Cancelar consulta
              </Btn>
            </div>

            {/* WhatsApp disclaimer */}
            <p
              style={{
                fontSize: 11.5,
                color: "var(--ink-faint)",
                lineHeight: 1.5,
                textAlign: "center",
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Icon name="whatsapp" size={13} style={{ color: "#25a35f" }} />
              Cancelar e remarcar enviam aviso ao paciente — você revisa antes.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
