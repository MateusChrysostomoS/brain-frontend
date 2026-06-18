// Formatting helpers — ported verbatim from the original index.html.

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("pt-BR") +
    " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

export function fmtBirth(iso?: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  const age = Math.floor((Date.now() - new Date(iso).getTime()) / 31557600000);
  return `${d}/${m}/${y} (${age} anos)`;
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Em espera",
  approved: "Atendido",
  rejected: "Rejeitado",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}
