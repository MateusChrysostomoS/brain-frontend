// AlertList — the clinical-alerts block. Each alert is toned red / amber /
// green from its API level and led by a bold colour-matched tag.

import type { Alert } from "@/lib/types";
import { AlertTriangleIcon, CheckCircleIcon } from "./icons";

type Tone = "red" | "amber" | "green";

// API levels arrive uppercase (RED / YELLOW / GREEN) and are occasionally
// missing — degrade unknown values to amber so nothing renders unstyled.
function tone(level: string | null | undefined): Tone {
  const key = String(level ?? "").toLowerCase();
  if (key === "red") return "red";
  if (key === "green") return "green";
  return "amber"; // yellow / amber / unknown
}

const TAG_LABEL: Record<Tone, string> = {
  red: "Alerta crítico:",
  amber: "Atenção:",
  green: "Normal:",
};

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="alerts">
      {alerts.map((alert, i) => {
        const t = tone(alert.level);
        return (
          <div className={`alert ${t}`} key={i}>
            <span className="a-icon">
              {t === "green" ? (
                <CheckCircleIcon size={14} />
              ) : (
                <AlertTriangleIcon size={14} />
              )}
            </span>
            <div className="a-body">
              <span className="a-tag">{TAG_LABEL[t]}</span>
              {alert.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
