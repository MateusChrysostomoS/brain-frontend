"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "E se o paciente não tem ou não usa WhatsApp?",
    a: "Sempre haverá pacientes fora do canal — idosos sem smartphone, pacientes em condições agudas, situações específicas. PreCheck não substitui a anamnese presencial, complementa. A secretaria mantém o fluxo manual para quem precisa.",
  },
  {
    q: "Os dados dos meus pacientes vão para alguma IA fora do Brasil?",
    a: "Sim, a inteligência clínica usa Claude (Anthropic, EUA) para estruturar o resumo. A Anthropic tem política de não treinamento sobre dados de API e é compatível com LGPD via cláusulas contratuais padrão. O armazenamento permanente é exclusivamente em servidor brasileiro.",
  },
  {
    q: "Quem é o responsável legal pelos dados?",
    a: "A clínica contratante é a controladora dos dados. PreCheck é operadora, com DPO designado e contrato de tratamento de dados específico. Cumprimos os requisitos da LGPD para dados sensíveis de saúde (Art. 11).",
  },
  {
    q: "Funciona com quais especialidades?",
    a: "Hoje em produção: clínica geral / família, primeira consulta e retorno. Em desenvolvimento: cardiologia ambulatorial, em parceria com médico especialista. Outras especialidades sob demanda — a arquitetura é modular.",
  },
  {
    q: "Como funciona a contratação?",
    a: "Demo de 25 min com seu fluxo real. Se fizer sentido, partimos para um piloto de 30 dias com 1 ou 2 unidades. Avaliamos métricas reais (adesão, tempo recuperado, qualidade do registro) antes de qualquer expansão. Modelos disponíveis para clínica privada, médico autônomo e contratação pública via Lei 14.133/2021.",
  },
];

export default function Faq() {
  // First item open by default — matches the original behaviour.
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {ITEMS.map((item, i) => (
        <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
          <button
            className="faq-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
            type="button"
          >
            <span>{item.q}</span>
            <span className="faq-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
          <div className="faq-a">
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
