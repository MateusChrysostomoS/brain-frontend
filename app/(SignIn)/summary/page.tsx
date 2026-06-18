import { Suspense } from "react";
import SummaryDetail from "./components/SummaryDetail";
import "./summary.css";

// Patient summary — opened as /summary?id=123. The query param keeps the
// route fully static-exportable (no per-id pre-render); useSearchParams in
// SummaryDetail needs the Suspense boundary for the static build.
export default function SummaryPage() {
  return (
    <div className="patient-route">
      <Suspense
        fallback={<div className="patient-loading">Carregando resumo…</div>}
      >
        <SummaryDetail />
      </Suspense>
    </div>
  );
}
