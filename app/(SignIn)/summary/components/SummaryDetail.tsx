"use client";

// SummaryDetail — patient clinical summary (/summary?id=123).
// The visual layer is the Claude Design handoff (Paciente.html); the data
// layer is unchanged — auth gating, getSummary, patchSummaryStatus, the
// SOAP-vs-classic split and the copy-to-clipboard text are all carried
// over verbatim from the previous implementation.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import DashNav from "@/components/DashNav";
import { getSummary, patchSummaryStatus } from "@/lib/api";
import { clearToken, isAuthed, isAuthError } from "@/lib/auth";
import { EXAME_FISICO_PADRAO } from "@/lib/constants";
import { fmtBirth, fmtDate } from "@/lib/format";
import { buildResumoText } from "@/lib/resumo";
import { markSeen } from "@/lib/seen";
import type { Alert, StructuredData, Summary } from "@/lib/types";
import { useToast } from "../hooks/useToast";
import ActionButton from "./ActionButton";
import AlertList from "./AlertList";
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  CopyIcon,
  XIcon,
} from "./icons";
import PatientHeader, { type MetaChip } from "./PatientHeader";
import PatientImages from "./PatientImages";
import QaList, { type QaItem } from "./QaList";
import SummarySection from "./SummarySection";
import Toast from "./Toast";

// ── Lookups ──────────────────────────────────────────────────────
const SEX_LABEL: Record<string, string> = { M: "Masculino", F: "Feminino" };
const RISK_CLASS: Record<string, string> = {
  Baixo: "soap-risk-baixo",
  Moderado: "soap-risk-moderado",
  "Moderado a alto": "soap-risk-moderado-alto",
  Alto: "soap-risk-alto",
};

// One rendered section — the parent assigns its number at map time.
type SectionDef = {
  key: string;
  title: ReactNode;
  emphasis?: boolean;
  body: ReactNode;
};

// Coerce dynamic structured_data content into displayable text.
function asText(content: unknown): string {
  return typeof content === "string" ? content : JSON.stringify(content, null, 2);
}

export default function SummaryDetail() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  // --- State ---
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Once an action succeeds the buttons stay locked — preserves the
  // single-shot behaviour of the original page.
  const [actionsDisabled, setActionsDisabled] = useState(false);
  const { message, tone, visible, showToast } = useToast();

  function logout() {
    clearToken();
    router.push("/");
  }

  // --- Load ---
  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }
    markSeen(Number(id));
    let cancelled = false;
    (async () => {
      try {
        const s = await getSummary(id);
        if (cancelled) return;
        setSummary(s);
        setLoading(false);
        window.scrollTo(0, 0);
      } catch (e) {
        if (cancelled) return;
        if (isAuthError(e)) {
          logout();
        } else {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  // --- Handlers ---
  async function handlePatch(status: string, okMessage: string) {
    if (!summary) return;
    setActionsDisabled(true);
    try {
      await patchSummaryStatus(summary.id, status);
      setSummary({ ...summary, status });
      showToast(okMessage, status === "rejected" ? "info" : "success");
    } catch {
      // Re-enable so the clinician can retry a failed update.
      setActionsDisabled(false);
      showToast("Não foi possível atualizar o status. Tente novamente.", "info");
    }
  }

  async function handleCopy() {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(buildResumoText(summary));
      showToast("Resumo copiado para a área de transferência.");
    } catch {
      showToast("Não foi possível copiar o resumo.", "info");
    }
  }

  return (
    <>
      <DashNav onLogout={logout} />
      <main className="page">
        {loading ? (
          <LoadingSkeleton />
        ) : error || !summary ? (
          <ErrorState onBack={() => router.push("/dashboard")} />
        ) : (
          <SummaryContent
            summary={summary}
            actionsDisabled={actionsDisabled}
            onPatch={handlePatch}
            onCopy={handleCopy}
          />
        )}
      </main>
      <Toast message={message} tone={tone} visible={visible} />
    </>
  );
}

// ── Loaded content ───────────────────────────────────────────────

type SummaryContentProps = {
  summary: Summary;
  actionsDisabled: boolean;
  onPatch: (status: string, okMessage: string) => void;
  onCopy: () => void;
};

// SummaryContent — the loaded patient page: back link, header, the top
// action row, the numbered clinical sections and the footer action bar.
function SummaryContent({
  summary,
  actionsDisabled,
  onPatch,
  onCopy,
}: SummaryContentProps) {
  const sd = summary.structured_data || {};
  const sections: SectionDef[] = [
    ...(sd.format === "soap"
      ? buildSoapSections(summary)
      : buildClassicSections(summary)),
    ...buildTailSections(summary),
  ];

  const markAttended = () => onPatch("approved", "Paciente marcado como atendido.");

  return (
    <>
      <Link href="/dashboard" className="back-link">
        <ChevronLeftIcon size={14} />
        Voltar para o painel
      </Link>

      <PatientHeader
        name={summary.patient?.full_name || "Paciente"}
        chips={buildChips(summary)}
        status={summary.status}
      />

      {/* Top action row — mirrored, in reverse, by the footer bar */}
      <div className="action-row">
        <div className="action-row-left">
          <ActionButton
            variant="primary"
            icon={<CheckIcon size={15} />}
            onClick={markAttended}
            disabled={actionsDisabled}
          >
            Marcar como Atendido
          </ActionButton>
          <ActionButton
            variant="danger"
            icon={<XIcon size={15} />}
            onClick={() => onPatch("rejected", "Atendimento rejeitado.")}
            disabled={actionsDisabled}
          >
            Rejeitar
          </ActionButton>
        </div>
        <div className="action-row-right">
          <ActionButton
            variant="ghost"
            icon={<CopyIcon size={15} />}
            onClick={onCopy}
            disabled={actionsDisabled}
          >
            Copiar resumo
          </ActionButton>
        </div>
      </div>

      <div className="sections">
        {sections.map((section, i) => (
          <SummarySection
            key={section.key}
            num={i + 1}
            title={section.title}
            emphasis={section.emphasis}
          >
            {section.body}
          </SummarySection>
        ))}
        {/* Self-gating: renders only when this consultation has exam photos. */}
        <PatientImages summaryId={summary.id} />
      </div>

      <footer className="foot-actions">
        <div className="left">Gerado por PreCheck · {fmtDate(summary.created_at)}</div>
        <div className="right">
          <ActionButton
            variant="ghost"
            icon={<CopyIcon size={15} />}
            onClick={onCopy}
            disabled={actionsDisabled}
          >
            Copiar resumo
          </ActionButton>
          <ActionButton
            variant="primary"
            icon={<CheckIcon size={15} />}
            onClick={markAttended}
            disabled={actionsDisabled}
          >
            Marcar como Atendido
          </ActionButton>
        </div>
      </footer>
    </>
  );
}

// Builds the patient-header meta chips from whatever fields are present.
function buildChips(s: Summary): MetaChip[] {
  const sd = s.structured_data || {};
  const patient = s.patient || {};
  const chips: MetaChip[] = [];

  if (sd.subflow) chips.push({ key: "Subfluxo", value: String(sd.subflow) });
  if (sd.clinic_name) chips.push({ key: "Clínica", value: String(sd.clinic_name) });
  chips.push({ key: "Data", value: fmtDate(s.created_at) });

  const birth = fmtBirth(patient.birth_date);
  if (birth) chips.push({ key: "Nascimento", value: birth });
  if (patient.sex) {
    chips.push({ key: "Sexo", value: SEX_LABEL[patient.sex] || patient.sex });
  }
  if (patient.external_id) {
    chips.push({ key: "ID", value: String(patient.external_id) });
  }
  return chips;
}

// ── Classic-format sections ──────────────────────────────────────

function buildClassicSections(s: Summary): SectionDef[] {
  const sd = s.structured_data || {};
  const sec = sd.sections || {};
  const alerts: Alert[] = sd.alerts || [];
  const out: SectionDef[] = [];

  if (alerts.length > 0) {
    out.push({
      key: "alerts",
      title: "Alertas Clínicos",
      body: <AlertList alerts={alerts} />,
    });
  }
  if (s.ai_summary) {
    out.push({
      key: "ai",
      title: "Síntese Clínica · IA",
      emphasis: true,
      body: <SectionText text={s.ai_summary} />,
    });
  }

  const CLASSIC: [string, string, unknown][] = [
    ["ident", "Identificação", sec.identificacao],
    ["qp", "Queixa Principal", sec.queixa_principal],
    ["hda", "HDA — História da Doença Atual", sec.hda],
    ["hpp", "HPP — Antecedentes Pessoais", sec.hpp],
    ["fam", "História Familiar", sec.historia_familiar],
    ["hab", "Hábitos de Vida", sec.habitos],
    ["ros", "Revisão de Sistemas", sec.ros],
    ["ef", "Exame Físico", sec.exame_fisico],
    ["exc", "Exames Complementares", sec.exames_complementares],
  ];

  const antro = buildAntro(sd);
  for (const [key, title, content] of CLASSIC) {
    if (!content) continue;
    out.push({ key, title, body: <SectionText text={asText(content)} /> });
    // Anthropometry trails the physical-exam section, as in the original.
    if (key === "ef" && antro) {
      out.push({ key: "antro", title: "Dados Antropométricos", body: antro });
    }
  }
  // BMI present but no physical-exam section to anchor it to.
  if (antro && !sec.exame_fisico) {
    out.push({ key: "antro", title: "Dados Antropométricos", body: antro });
  }

  return out;
}

// Anthropometry rows — null when there is no BMI data at all.
function buildAntro(sd: StructuredData): ReactNode | null {
  const rows: MetaChip[] = [];
  if (sd.bmi) rows.push({ key: "IMC", value: String(sd.bmi) });
  if (sd.bmi_classification) {
    rows.push({ key: "Classificação", value: String(sd.bmi_classification) });
  }
  if (rows.length === 0) return null;
  return (
    <div className="antro">
      {rows.map((row) => (
        <div className="antro-row" key={row.key}>
          <span className="k">{row.key}</span>
          {row.value}
        </div>
      ))}
    </div>
  );
}

// ── SOAP-format sections ─────────────────────────────────────────

function buildSoapSections(s: Summary): SectionDef[] {
  const sd = s.structured_data || {};
  const obj: StructuredData = sd.objetivo || {};
  const av: StructuredData = sd.avaliacao || {};
  const prob: StructuredData = sd.problemas || {};
  const out: SectionDef[] = [];

  if (s.ai_summary) {
    out.push({
      key: "ai",
      title: "Síntese Clínica · IA",
      emphasis: true,
      body: <SectionText text={s.ai_summary} />,
    });
  }
  if (sd.identificacao) {
    out.push({
      key: "ident",
      title: "Identificação",
      body: <SectionText text={asText(sd.identificacao)} />,
    });
  }

  const hasProblems = !!(
    prob.ativos?.length ||
    prob.cronicos?.length ||
    prob.potenciais?.length
  );
  if (hasProblems) {
    out.push({
      key: "prob",
      title: "Lista de Problemas",
      body: <ProblemGrid prob={prob} />,
    });
  }

  const subjective: string[] = sd.subjetivo || [];
  if (subjective.length > 0) {
    out.push({
      key: "soap-s",
      title: <SoapTitle letter="s" label="Subjetivo" />,
      body: <SectionText text={subjective.join("\n\n")} />,
    });
  }

  out.push({
    key: "soap-o",
    title: <SoapTitle letter="o" label="Objetivo" />,
    body: <SoapObjective obj={obj} />,
  });

  const hypotheses: string[] = av.hipoteses || [];
  const soapAlerts: string[] = av.alertas || [];
  const risk: string = av.classificacao_risco || "";
  if (hypotheses.length > 0 || soapAlerts.length > 0 || risk) {
    out.push({
      key: "soap-a",
      title: <SoapTitle letter="a" label="Avaliação" />,
      body: <SoapAssessment hypotheses={hypotheses} alerts={soapAlerts} risk={risk} />,
    });
  }

  out.push({
    key: "soap-p",
    title: <SoapTitle letter="p" label="Plano" />,
    body: <SoapPlan plano={sd.plano} />,
  });

  return out;
}

// ── Shared tail sections ─────────────────────────────────────────

function buildTailSections(s: Summary): SectionDef[] {
  const sd = s.structured_data || {};
  const out: SectionDef[] = [];

  if (s.final_summary) {
    out.push({
      key: "final",
      title: "Revisão Médica · Final",
      body: <SectionText text={s.final_summary} />,
    });
  }

  const deepening = sd.deepening;
  if (Array.isArray(deepening) && deepening.length > 0) {
    out.push({
      key: "deepening",
      title: "Aprofundamento",
      body: <QaList items={deepening as QaItem[]} />,
    });
  }

  // Raw conversation blocks, minus media placeholders.
  const blocks: QaItem[] = ((sd.blocos_brutos as QaItem[] | undefined) || []).filter(
    (b) => b.resposta !== "__MEDIA__",
  );
  if (blocks.length > 0) {
    out.push({
      key: "qa",
      title: "Perguntas e Respostas",
      body: <QaList items={blocks} />,
    });
  }

  return out;
}

// ── Section bodies ───────────────────────────────────────────────

// SectionText — renders free text as paragraphs (blank lines split them;
// single newlines survive via the CSS `white-space` on `.sec-body p`).
function SectionText({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="sec-body">
      {paragraphs.length > 0 ? (
        paragraphs.map((p, i) => <p key={i}>{p}</p>)
      ) : (
        <p className="ni">Não informado.</p>
      )}
    </div>
  );
}

// SoapTitle — a section title prefixed with its S/O/A/P letter badge.
function SoapTitle({
  letter,
  label,
}: {
  letter: "s" | "o" | "a" | "p";
  label: string;
}) {
  return (
    <>
      <span className={`soap-letter soap-letter-${letter}`} aria-hidden="true">
        {letter.toUpperCase()}
      </span>
      {label}
    </>
  );
}

// ProblemGrid — the SOAP problem list, split into three tonal columns.
function ProblemGrid({ prob }: { prob: StructuredData }) {
  return (
    <div className="sec-body">
      <div className="soap-grid">
        <ProblemColumn title="Ativos" items={prob.ativos} />
        <ProblemColumn title="Crônicos" items={prob.cronicos} />
        <ProblemColumn title="Potenciais" items={prob.potenciais} />
      </div>
    </div>
  );
}

function ProblemColumn({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="soap-col">
      <h4>{title}</h4>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// SoapObjective — metric pills, the standard physical-exam block and any
// recorded exam findings.
function SoapObjective({ obj }: { obj: StructuredData }) {
  const metrics: MetaChip[] = [];
  if (obj.altura) metrics.push({ key: "Altura", value: String(obj.altura) });
  if (obj.peso) metrics.push({ key: "Peso", value: String(obj.peso) });
  if (obj.imc) {
    metrics.push({
      key: "IMC",
      value: `${obj.imc}${obj.imc_classificacao ? ` · ${obj.imc_classificacao}` : ""}`,
    });
  }
  const findings: string[] = obj.achados_exames || [];

  return (
    <div className="sec-body">
      {metrics.length > 0 && (
        <div className="soap-metrics">
          {metrics.map((m) => (
            <span className="soap-pill" key={m.key}>
              <span className="k">{m.key}</span>
              {m.value}
            </span>
          ))}
        </div>
      )}
      <div className="soap-exam">
        <div className="soap-exam-label">Exame físico</div>
        <p className="soap-exam-text">{EXAME_FISICO_PADRAO}</p>
      </div>
      {findings.length > 0 && <BulletList label="Achados de exames" items={findings} />}
    </div>
  );
}

// SoapAssessment — hypotheses, alerts and the risk classification badge.
function SoapAssessment({
  hypotheses,
  alerts,
  risk,
}: {
  hypotheses: string[];
  alerts: string[];
  risk: string;
}) {
  return (
    <div className="sec-body">
      {hypotheses.length > 0 && <BulletList label="Hipóteses" items={hypotheses} />}
      {alerts.length > 0 && <BulletList label="Alertas" items={alerts} />}
      {risk && (
        <div className="soap-risk-row">
          <span className="bullet-label">Classificação de risco</span>
          <span className={`soap-risk ${RISK_CLASS[risk] || "soap-risk-moderado"}`}>
            {risk}
          </span>
        </div>
      )}
    </div>
  );
}

// SoapPlan — the plan list, or a placeholder when the doctor has not
// filled it in yet.
function SoapPlan({ plano }: { plano: unknown }) {
  if (Array.isArray(plano) && plano.length > 0) {
    return <SectionText text={plano.join("\n\n")} />;
  }
  return (
    <div className="sec-body">
      <p className="ni">Plano a ser preenchido pelo médico.</p>
    </div>
  );
}

// BulletList — a labelled bullet group used inside the SOAP sections.
function BulletList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="bullet-group">
      <span className="bullet-label">{label}</span>
      <ul className="bullet-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Status views ─────────────────────────────────────────────────

// LoadingSkeleton — placeholder shaped like the patient page while the
// summary request is in flight.
function LoadingSkeleton() {
  return (
    <div className="patient-skeleton" aria-hidden="true">
      <div className="patient-head">
        <span className="skel-line skel-eyebrow" />
        <span className="skel-line skel-name" />
        <div className="skel-chips">
          <span className="skel-line skel-chip" />
          <span className="skel-line skel-chip" />
          <span className="skel-line skel-chip" />
        </div>
      </div>
      <div className="sections">
        {[0, 1, 2].map((i) => (
          <div className="sec" key={i}>
            <div className="sec-head">
              <span className="skel-line skel-sectitle" />
            </div>
            <span className="skel-line skel-body" />
            <span className="skel-line skel-body" />
            <span className="skel-line skel-body short" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ErrorState — shown when the id is missing or the summary fails to load.
function ErrorState({ onBack }: { onBack: () => void }) {
  return (
    <div className="patient-error">
      <div className="patient-error-icon">
        <AlertCircleIcon size={26} />
      </div>
      <h2>Não foi possível abrir este resumo</h2>
      <p>
        O resumo pode ter sido removido ou o endereço está incompleto. Volte ao
        painel e tente novamente.
      </p>
      <ActionButton variant="ghost" icon={<ChevronLeftIcon size={15} />} onClick={onBack}>
        Voltar para o painel
      </ActionButton>
    </div>
  );
}
