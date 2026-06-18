// ===== secretarIA — seed data, status metadata, time helpers =====
// Ported from _design-source/data.jsx — plain ES module, no browser globals.
// Reference week: Mon 01/06 – Sat 06/06 (2026). Today = Tue 02/06.

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type ApptStatus =
  | "agendado"
  | "confirmou"
  | "compareceu"
  | "faltou"
  | "cancelado"
  | "bloqueio";

export type Anamnese = "recebida" | "pendente" | "—";

/** A single appointment or block slot on the calendar. */
export type Appt = {
  id: string;
  day: number;
  start: number;   // minutes from midnight
  dur: number;     // duration in minutes
  patient?: string;
  phone?: string;
  type?: string;
  status: ApptStatus;
  anamnese?: Anamnese;
  notes?: string;
  reason?: string; // used by bloqueio blocks
};

/** One column in the weekly calendar header. */
export type WeekDay = {
  key: string;
  label: string;
  date: number;
  full: string;
  today?: boolean;
};

/** Design-token tone identifiers for status colors. */
export type StatusTone = "pending" | "confirm" | "attend" | "miss" | "block";

// ---------------------------------------------------------------------------
// Calendar grid constants
// ---------------------------------------------------------------------------

export const WEEK_DAYS: WeekDay[] = [
  { key: "seg", label: "Seg", date: 1, full: "Segunda" },
  { key: "ter", label: "Ter", date: 2, full: "Terça", today: true },
  { key: "qua", label: "Qua", date: 3, full: "Quarta" },
  { key: "qui", label: "Qui", date: 4, full: "Quinta" },
  { key: "sex", label: "Sex", date: 5, full: "Sexta" },
  { key: "sab", label: "Sáb", date: 6, full: "Sábado" },
];

export const MONTH_LABEL = "Junho de 2026";
export const PERIOD_LABEL = "1 – 6 de junho";

export const HOUR_START = 7;   // 07:00
export const HOUR_END = 20;    // 20:00
export const SLOT_H = 58;      // px height of 1 hour row

export const APPT_TYPES = [
  "Primeira consulta",
  "Retorno",
  "Consulta",
  "Avaliação",
  "Teleconsulta",
  "Procedimento",
];
export const DURATIONS = [30, 40, 50, 60];

// ---------------------------------------------------------------------------
// Status metadata — maps every status to label + tone
// ---------------------------------------------------------------------------

export const STATUS_META: Record<ApptStatus, { label: string; short: string; tone: StatusTone }> = {
  agendado:   { label: "Agendado",   short: "Agendado",   tone: "pending" },
  confirmou:  { label: "Confirmou",  short: "Confirmou",  tone: "confirm" },
  compareceu: { label: "Compareceu", short: "Compareceu", tone: "attend"  },
  faltou:     { label: "Faltou",     short: "Faltou",     tone: "miss"    },
  cancelado:  { label: "Cancelado",  short: "Cancelado",  tone: "block"   },
  bloqueio:   { label: "Bloqueio",   short: "Bloqueio",   tone: "block"   },
};

// ---------------------------------------------------------------------------
// Clinic / user identity
// ---------------------------------------------------------------------------

export const CURRENT_USER = { name: "Camila Soares", role: "Secretária" };
export const CLINIC = { name: "Consultório Dr. Aurélio Lima", specialty: "Clínica geral" };

// ---------------------------------------------------------------------------
// Seed appointments (factory mirrors the original data.jsx `A()` helper)
// ---------------------------------------------------------------------------

let _id = 1;
const A = (
  day: number,
  start: number,
  dur: number,
  patient: string,
  phone: string,
  type: string,
  status: ApptStatus,
  anamnese: Anamnese,
): Appt => ({ id: "a" + _id++, day, start, dur, patient, phone, type, status, anamnese, notes: "" });

export const SEED_APPTS: Appt[] = [
  // ---- Segunda ----
  A(0,  8*60,     50, "Helena Vasconcelos",  "+55 11 98841-2207", "Retorno",            "compareceu", "recebida"),
  A(0,  9*60,     40, "Rafael Monteiro",     "+55 11 99120-7741", "Consulta",            "compareceu", "recebida"),
  A(0, 10*60,     60, "Bianca Ferraz",       "+55 11 98003-5512", "Primeira consulta",   "faltou",     "pendente"),
  A(0, 14*60,     50, "Otávio Lacerda",      "+55 11 99710-8830", "Consulta",            "compareceu", "recebida"),
  A(0, 15*60+30,  40, "Marina Antunes",      "+55 11 98455-1190", "Teleconsulta",        "compareceu", "—"),
  A(0, 17*60,     30, "Diego Prado",         "+55 11 99088-4471", "Retorno",             "compareceu", "recebida"),
  // ---- Terça (hoje) ----
  A(1,  8*60,     40, "Camila Rezende",      "+55 11 98712-0094", "Retorno",             "compareceu", "recebida"),
  A(1,  8*60+50,  50, "Júlia Bernardes",     "+55 11 99633-2218", "Consulta",            "confirmou",  "recebida"),
  A(1, 10*60,     60, "André Coutinho",      "+55 11 98290-7765", "Primeira consulta",   "confirmou",  "recebida"),
  A(1, 11*60+10,  30, "Fernanda Lemos",      "+55 11 99514-8802", "Retorno",             "agendado",   "pendente"),
  A(1, 14*60,     50, "Lucas Tavares",       "+55 11 98176-3340", "Consulta",            "confirmou",  "recebida"),
  A(1, 15*60,     40, "Patrícia Nogueira",   "+55 11 99847-1126", "Teleconsulta",        "agendado",   "—"),
  A(1, 16*60,     60, "Roberto Almeida",     "+55 11 98620-5519", "Avaliação",           "agendado",   "pendente"),
  A(1, 17*60+30,  30, "Sofia Marques",       "+55 11 99205-7783", "Retorno",             "agendado",   "recebida"),
  // ---- Quarta ----
  A(2,  8*60+30,  50, "Gustavo Pires",       "+55 11 98330-2214", "Consulta",            "agendado",   "pendente"),
  A(2,  9*60+40,  60, "Larissa Fontes",      "+55 11 99761-0085", "Primeira consulta",   "agendado",   "recebida"),
  A(2, 14*60,     40, "Eduardo Salles",      "+55 11 98014-6628", "Retorno",             "agendado",   "pendente"),
  A(2, 15*60+30,  50, "Beatriz Cunha",       "+55 11 99458-2231", "Consulta",            "agendado",   "recebida"),
  // ---- Quinta ----
  A(3,  9*60,     60, "Henrique Duarte",     "+55 11 98877-3300", "Procedimento",        "agendado",   "pendente"),
  A(3, 11*60,     30, "Vanessa Rocha",       "+55 11 99332-7714", "Retorno",             "agendado",   "recebida"),
  A(3, 14*60+30,  50, "Thiago Barros",       "+55 11 98540-1182", "Consulta",            "agendado",   "pendente"),
  A(3, 16*60,     40, "Aline Castro",        "+55 11 99670-4408", "Teleconsulta",        "agendado",   "—"),
  // ---- Sexta ----
  A(4,  8*60,     50, "Mariana Vidal",       "+55 11 98123-9970", "Consulta",            "agendado",   "recebida"),
  A(4,  9*60+30,  60, "Felipe Andrade",      "+55 11 99812-2256", "Primeira consulta",   "agendado",   "pendente"),
  A(4, 14*60,     40, "Carolina Paiva",      "+55 11 98447-6613", "Retorno",             "agendado",   "pendente"),
  // ---- Sábado ----
  A(5,  8*60+30,  40, "Renato Figueira",     "+55 11 98905-3321", "Retorno",             "confirmou",  "recebida"),
  A(5,  9*60+30,  50, "Isabela Moraes",      "+55 11 99277-8840", "Consulta",            "agendado",   "pendente"),
];

// ---------------------------------------------------------------------------
// Seed blocks (lunch + absences) — reuse Appt shape with status "bloqueio"
// ---------------------------------------------------------------------------

const B = (day: number, start: number, dur: number, reason: string): Appt => ({
  id: "b" + _id++,
  day,
  start,
  dur,
  status: "bloqueio",
  reason,
});

export const SEED_BLOCKS: Appt[] = [
  B(0, 12*60, 60,  "Almoço"),
  B(1, 12*60, 60,  "Almoço"),
  B(2, 12*60, 60,  "Almoço"),
  B(3, 12*60, 60,  "Almoço"),
  B(4, 12*60, 60,  "Almoço"),
  B(2, 16*60+30, 90, "Reunião clínica"),
  B(4, 11*60,    90, "Ausência"),
];

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

/** Formats minutes-from-midnight as "HH:MM". */
export const fmtTime = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
};

/** Returns a "HH:MM–HH:MM" range string for an appointment. */
export const fmtRange = (start: number, dur: number): string =>
  fmtTime(start) + "–" + fmtTime(start + dur);

/** First character of a name, uppercased — used for Avatar initials. */
export const firstLetter = (name?: string): string =>
  (name || "?").trim().charAt(0).toUpperCase();

/** "Terça, 02/06" style label for a calendar day column. */
export const dayFull = (i: number): string =>
  WEEK_DAYS[i]
    ? WEEK_DAYS[i].full + ", " + String(WEEK_DAYS[i].date).padStart(2, "0") + "/06"
    : "";

/** First word of a name — used in headers, modals, and chat previews. */
export const firstName = (n?: string): string => (n || "").trim().split(" ")[0];
