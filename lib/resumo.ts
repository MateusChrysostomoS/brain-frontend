// Builds the plain-text resumo for the "Copiar resumo" action.
// Ported verbatim from the original index.html (classic + SOAP formats).

import { EXAME_FISICO_PADRAO } from "./constants";
import type { Summary } from "./types";

export function buildResumoText(s: Summary): string {
  const sd = s.structured_data || {};
  if (sd.format === "soap") return buildResumoTextSoap(s);
  return buildResumoTextClassic(s);
}

function buildResumoTextClassic(s: Summary): string {
  const sd = s.structured_data || {};
  const sec = sd.sections || {};
  const lines: string[] = [];

  const ORDERED: [string, any][] = [
    ["IDENTIFICAÇÃO", sec.identificacao],
    ["QUEIXA PRINCIPAL", sec.queixa_principal],
    ["HDA — HISTÓRIA DA DOENÇA ATUAL", sec.hda],
    ["HPP — ANTECEDENTES PESSOAIS", sec.hpp],
    ["HISTÓRIA FAMILIAR", sec.historia_familiar],
    ["HÁBITOS DE VIDA", sec.habitos],
    ["REVISÃO DE SISTEMAS", sec.ros],
    ["EXAME FÍSICO", sec.exame_fisico],
  ];

  for (const [title, content] of ORDERED) {
    if (!content) continue;
    const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    lines.push(title);
    lines.push(text);
    lines.push("");

    if (title === "EXAME FÍSICO" && (sd.bmi || sd.bmi_classification)) {
      lines.push("DADOS ANTROPOMÉTRICOS");
      const parts: string[] = [];
      if (sd.bmi) parts.push(`IMC: ${sd.bmi}`);
      if (sd.bmi_classification) parts.push(sd.bmi_classification);
      lines.push(parts.join(" — "));
      lines.push("");
    }
  }

  if ((sd.bmi || sd.bmi_classification) && !sec.exame_fisico) {
    lines.push("DADOS ANTROPOMÉTRICOS");
    const parts: string[] = [];
    if (sd.bmi) parts.push(`IMC: ${sd.bmi}`);
    if (sd.bmi_classification) parts.push(sd.bmi_classification);
    lines.push(parts.join(" — "));
    lines.push("");
  }

  if (sec.exames_complementares) {
    const text =
      typeof sec.exames_complementares === "string"
        ? sec.exames_complementares
        : JSON.stringify(sec.exames_complementares, null, 2);
    lines.push("EXAMES COMPLEMENTARES");
    lines.push(text);
    lines.push("");
  }

  return lines.join("\n").trim();
}

function buildResumoTextSoap(s: Summary): string {
  const sd = s.structured_data || {};
  const obj = sd.objetivo || {};
  const av = sd.avaliacao || {};
  const prob = sd.problemas || {};
  const lines: string[] = [];

  if (sd.identificacao) {
    lines.push("IDENTIFICAÇÃO");
    lines.push(sd.identificacao);
    lines.push("");
  }

  const hasProb = prob.ativos?.length || prob.cronicos?.length || prob.potenciais?.length;
  if (hasProb) {
    lines.push("LISTA DE PROBLEMAS");
    if (prob.ativos?.length) {
      lines.push("Ativos:");
      prob.ativos.forEach((p: string) => lines.push(`- ${p}`));
    }
    if (prob.cronicos?.length) {
      lines.push("Crônicos:");
      prob.cronicos.forEach((p: string) => lines.push(`- ${p}`));
    }
    if (prob.potenciais?.length) {
      lines.push("Potenciais:");
      prob.potenciais.forEach((p: string) => lines.push(`- ${p}`));
    }
    lines.push("");
  }

  const subj: string[] = sd.subjetivo || [];
  if (subj.length) {
    lines.push("S — SUBJETIVO");
    subj.forEach((b) => lines.push(`- ${b}`));
    lines.push("");
  }

  lines.push("O — OBJETIVO");
  const metrics = [
    obj.altura ? `Altura: ${obj.altura}` : null,
    obj.peso ? `Peso: ${obj.peso}` : null,
    obj.imc
      ? `IMC: ${obj.imc}${obj.imc_classificacao ? ` (${obj.imc_classificacao})` : ""}`
      : null,
  ].filter(Boolean);
  if (metrics.length) lines.push(metrics.join(" · "));
  lines.push("Exame físico:");
  lines.push(EXAME_FISICO_PADRAO);
  if (obj.achados_exames?.length) {
    lines.push("Achados:");
    obj.achados_exames.forEach((a: string) => lines.push(`- ${a}`));
  }
  lines.push("");

  lines.push("A — AVALIAÇÃO");
  if (av.hipoteses?.length) {
    lines.push("Hipóteses:");
    av.hipoteses.forEach((h: string) => lines.push(`- ${h}`));
  }
  if (av.alertas?.length) {
    lines.push("Alertas:");
    av.alertas.forEach((a: string) => lines.push(`- ${a}`));
  }
  if (av.classificacao_risco) {
    lines.push(`Classificação de risco: ${av.classificacao_risco}`);
  }
  lines.push("");

  lines.push("P — PLANO");
  const plano = sd.plano;
  if (Array.isArray(plano) && plano.length) {
    plano.forEach((p: string) => lines.push(`- ${p}`));
  } else {
    lines.push("[a ser preenchido pelo médico]");
  }
  lines.push("");

  if (s.ai_summary) {
    lines.push("SÍNTESE CLÍNICA (IA)");
    lines.push(s.ai_summary);
    lines.push("");
  }

  return lines.join("\n").trim();
}
