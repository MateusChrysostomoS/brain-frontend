// PatientHeader — editorial patient card: a status eyebrow, the serif
// patient name (surname italicised in teal), and a row of meta chips
// (subflow, clinic, date, demographics) closing with a status chip.

import { statusLabel } from "@/lib/format";

export type MetaChip = { key: string; value: string };

type PatientHeaderProps = {
  name: string;
  chips: MetaChip[];
  status: string;
};

// Storage status -> design status-chip modifier.
const STATUS_CLASS: Record<string, string> = {
  draft: "status-waiting",
  approved: "status-attended",
  rejected: "status-rejected",
};

export default function PatientHeader({ name, chips, status }: PatientHeaderProps) {
  // Split the name so the surname carries the italic-teal emphasis,
  // mirroring the H1 treatment used elsewhere in the app.
  const parts = name.trim().split(/\s+/);
  const first = parts[0] || "Paciente";
  const rest = parts.slice(1).join(" ");
  const statusClass = STATUS_CLASS[status] || "status-waiting";

  return (
    <header className="patient-head">
      <span className="patient-eyebrow">
        <span className="dot" aria-hidden="true" />
        Resumo Clínico
      </span>

      <h1 className="patient-name">
        {first}
        {rest && (
          <>
            {" "}
            <em>{rest}</em>
          </>
        )}
      </h1>

      <div className="patient-meta">
        {chips.map((chip) => (
          <span className="meta-chip" key={chip.key}>
            <span className="k">{chip.key}</span>
            {chip.value}
          </span>
        ))}
        <span className={`meta-chip status ${statusClass}`}>
          <span className="pip" aria-hidden="true" />
          {statusLabel(status)}
        </span>
      </div>
    </header>
  );
}
