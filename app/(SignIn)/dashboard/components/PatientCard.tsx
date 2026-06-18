// PatientCard — one row in the dashboard list.
// Click anywhere on the card navigates to the detail view. While delete
// mode is armed, a trash button slides in on the left (pushing the card
// content right); pressing it marks the patient for bulk deletion. The
// button's click is stopped so it doesn't bubble up and trigger navigation.

"use client";

import TrashIcon from "@/components/TrashIcon";
import { fmtDate, statusLabel } from "@/lib/format";
import type { Alert, Summary } from "@/lib/types";

type PatientCardProps = {
  summary: Summary;
  isNew: boolean;
  // When true, the per-card select button is shown and the content shifts.
  deleteMode: boolean;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  onOpen: (id: number) => void;
};

// Map storage status → design status class.
const STATUS_CLASS: Record<string, string> = {
  draft: "waiting",
  approved: "attended",
  rejected: "rejected",
};

// Alert levels come from the API uppercase (RED / YELLOW / GREEN). The
// dot CSS uses lowercase + a friendlier "amber" key for yellow.
// Defensive against null/undefined — production payloads occasionally
// ship alerts without a `level`, and the type's `string` contract lies.
function dotClass(level: string | null | undefined): string {
  const k = String(level ?? "").toLowerCase();
  if (k === "yellow") return "amber";
  if (k === "red" || k === "green" || k === "amber") return k;
  return "amber"; // unknown levels degrade gracefully
}

export default function PatientCard({
  summary: s,
  isNew,
  deleteMode,
  selected,
  onToggleSelect,
  onOpen,
}: PatientCardProps) {
  const alerts: Alert[] = s.structured_data?.alerts || [];
  const qp: string = s.structured_data?.sections?.queixa_principal || "";
  const subflow: string = s.structured_data?.subflow || "";
  const statusKey = STATUS_CLASS[s.status] || "waiting";
  const dateText = fmtDate(s.created_at);
  const patientName = s.patient?.full_name || "Paciente";

  const cardClass =
    `p-card st-${statusKey}` + (selected ? " selected" : "") + (deleteMode ? " delete-mode" : "");

  return (
    <article className={cardClass} onClick={() => onOpen(s.id)}>
      {/* Select control — absolutely positioned on the left. Collapsed
          (invisible, non-interactive) until delete mode is armed; the
          card's left padding animates open to make room for it. */}
      <div className="p-select-slot">
        <button
          type="button"
          className="p-select-btn"
          onClick={(e) => {
            e.stopPropagation(); // don't bubble to the card's navigate handler
            onToggleSelect(s.id);
          }}
          disabled={!deleteMode}
          aria-hidden={!deleteMode || undefined}
          tabIndex={deleteMode ? undefined : -1}
          aria-pressed={selected}
          aria-label={`Marcar ${patientName} para exclusão`}
        >
          <TrashIcon size={18} />
        </button>
      </div>

      <div className="p-body">
        <div className="p-name">
          <span>{patientName}</span>
          {isNew && <span className="badge-new">NOVO</span>}
        </div>
        <div className="p-meta">
          {dateText}
          {subflow && (
            <>
              {" · "}
              <span className="meta-type">{subflow}</span>
            </>
          )}
        </div>
        <div className={qp ? "p-desc" : "p-desc empty"}>
          {qp || "Sem descrição registrada."}
        </div>
      </div>

      <div className="p-right">
        <span className={`p-status ${statusKey}`}>{statusLabel(s.status)}</span>
        {alerts.length > 0 && (
          <span className="p-dots">
            {alerts.map((a, i) => (
              <span
                key={i}
                className={`p-dot ${dotClass(a.level)}`}
                title={a.description}
              />
            ))}
          </span>
        )}
      </div>
    </article>
  );
}
