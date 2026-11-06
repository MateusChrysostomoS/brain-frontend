// PreCheck product page (/precheck). Same marketing system as the Brain home
// (components/landing), so the two pages read as one site.
//
// It used to be a separate design (globals.css + landing.css) with its own
// claims; the 2026-10-05 audit found several of them false or unsubstantiated:
// "WhatsApp Business API oficial (Meta Cloud)",
// "servidor brasileiro", "criptografia em repouso", "DPO designado",
// "implantação em 7 dias", usage statistics and a "quase metade do tempo"
// figure. They are gone; keep it that way unless there is evidence.
//
// The contact form still posts to the PreCheck API (/leads/demo-request), as
// before. Prices come from the same pricing module as the home page; buying
// happens there (/#planos), where the checkout buttons live.

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import "@/components/landing/site.css";
import { BrandIcon } from "@/app/(site)/_components/BrandIcon";
import { PRICING } from "@/app/(site)/_lib/pricing";
import { PreCheckMark, SectionLabel, StatusTag } from "@/components/landing/brand";
import ContactForm from "@/components/landing/ContactForm";
import { Faq, type FaqEntry } from "@/components/landing/Faq";
import { PlayInView } from "@/components/landing/PlayInView";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { PatientConversation, SummaryCard } from "@/components/landing/vignettes";

export const metadata: Metadata = {
  title: "PreCheck — pré-consulta guiada por IA | Brain",
  description:
    "O PreCheck conduz a anamnese antes da consulta, seguindo o roteiro do médico, e entrega um resumo estruturado com os sinais de alarme em destaque.",
};

const NAV = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#resumo", label: "O resumo" },
  { href: "/#planos", label: "Planos" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#faq", label: "Perguntas" },
];

const TIERS = [PRICING.precheckStart, PRICING.precheck, PRICING.precheckAdvanced];
const tierName = (name: string) => name.replace(/^PreCheck\s+/, "");
const d = (n: number) => ({ "--d": n }) as CSSProperties;

const FAQ: FaqEntry[] = [
  {
    q: "O paciente precisa instalar alguma coisa?",
    a: "Não. Ele responde pelo celular, a partir do convite da clínica, sem baixar aplicativo.",
  },
  {
    q: "O PreCheck faz diagnóstico?",
    a: "Não. Ele organiza o que o paciente relatou e destaca sinais de alarme para o médico revisar. A avaliação e a conduta são sempre do médico.",
  },
  {
    q: "E se o paciente não responder antes da consulta?",
    a: "A consulta acontece como sempre. O PreCheck complementa a anamnese feita no consultório; não a substitui.",
  },
  {
    q: "Quanto custa?",
    a: `São três faixas mensais, pelo volume de pré-consultas: ${TIERS.map(
      (t) => `${tierName(t.name)} (${t.features[0]}), ${t.amount}${t.unit}`,
    ).join("; ")}. A contratação é feita pelo site.`,
  },
  {
    q: "Qual inteligência artificial vocês usam?",
    a: "Usamos modelos da Anthropic (Claude) e da OpenAI, acessados por API.",
  },
  {
    q: "Quem é o responsável pelos dados dos pacientes?",
    a: "Na LGPD, a clínica que contrata é a controladora dos dados dos seus pacientes. A Brain atua como operadora, tratando esses dados em nome da clínica.",
  },
];

export default function PreCheckPage() {
  return (
    <div className="site">
      <a href="#conteudo" className="mk-skip">
        Pular para o conteúdo
      </a>
      <SiteHeader nav={NAV} product="precheck" plansHref="/#planos" contactHref="#contato" />

      <main id="conteudo">
        {/* ============================ HERO ============================ */}
        <section className="mk-hero" aria-labelledby="hero-t">
          <div className="mk-wrap mk-pc-hero">
            <div className="mk-enter">
              <div style={d(0)}>
                <StatusTag status="live" label="Em uso em clínicas" />
              </div>
              <h1 id="hero-t" className="mk-display" style={d(1)}>
                A anamnese acontece antes da consulta.
              </h1>
              <p className="mk-lead" style={d(2)}>
                O PreCheck conversa com o paciente antes do atendimento, seguindo o roteiro que o
                médico define, e entrega um resumo estruturado com os sinais de alarme em destaque.
              </p>
              <div className="mk-hero__ctas" style={d(3)}>
                <a href="#contato" className="mk-btn mk-btn--primary">
                  Agendar demonstração
                </a>
                <Link href="/#planos" className="mk-btn mk-btn--secondary">
                  Ver planos
                </Link>
              </div>
            </div>
            <div className="mk-enter">
              <div style={d(2)}>
                <SummaryCard />
                <p className="mk-caption" style={{ marginTop: 14 }}>
                  Exemplo ilustrativo, com dados fictícios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================== PROBLEMA =========================== */}
        <section className="mk-section mk-section--alt" aria-labelledby="porque-t">
          <div className="mk-wrap">
            <div className="mk-head">
              <SectionLabel>Por que existe</SectionLabel>
              <h2 id="porque-t" className="mk-h2">
                Boa parte da consulta vai embora coletando o que o paciente já sabia.
              </h2>
            </div>
            <div className="mk-problems">
              <div>
                <h3 className="mk-h3">O tempo some na coleta</h3>
                <p>
                  Queixa, história, medicações, exames recentes: perguntas que tomam o começo de
                  toda consulta.
                </p>
              </div>
              <div>
                <h3 className="mk-h3">No consultório, o paciente esquece</h3>
                <p>
                  Em casa, com calma, ele lembra do nome do remédio e da data do exame. Na hora da
                  consulta, nem sempre.
                </p>
              </div>
              <div>
                <h3 className="mk-h3">O médico começa sem contexto</h3>
                <p>
                  Sem saber a queixa antes, cada atendimento começa do zero, mesmo quando o
                  paciente já foi atendido antes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================== COMO FUNCIONA ======================== */}
        <section id="como-funciona" className="mk-section" aria-labelledby="como-t">
          <div className="mk-wrap mk-feature">
            <div className="mk-feature__copy">
              <SectionLabel>Como funciona</SectionLabel>
              <h2 id="como-t" className="mk-h2">
                Uma conversa no tempo do paciente. Um resumo no tempo do médico.
              </h2>
              <ol className="mk-steps mk-steps--stack">
                <li className="mk-step">
                  <span className="mk-step__num" aria-hidden="true">
                    1
                  </span>
                  <h3 className="mk-h3">O paciente recebe o convite</h3>
                  <p>A clínica envia o link da pré-consulta antes do atendimento.</p>
                </li>
                <li className="mk-step">
                  <span className="mk-step__num" aria-hidden="true">
                    2
                  </span>
                  <h3 className="mk-h3">Responde pelo celular</h3>
                  <p>
                    No próprio ritmo, em casa ou na sala de espera, sem instalar aplicativo. A IA
                    conduz a conversa pelo roteiro definido pelo médico.
                  </p>
                </li>
                <li className="mk-step">
                  <span className="mk-step__num" aria-hidden="true">
                    3
                  </span>
                  <h3 className="mk-h3">As perguntas se aprofundam</h3>
                  <p>
                    Conforme a queixa e as respostas, o PreCheck pergunta mais sobre o que importa:
                    caráter da dor, gatilhos, sintomas associados.
                  </p>
                </li>
                <li className="mk-step">
                  <span className="mk-step__num" aria-hidden="true">
                    4
                  </span>
                  <h3 className="mk-h3">O médico lê o resumo</h3>
                  <p>Estruturado, com os sinais de alarme no topo, antes de chamar o paciente.</p>
                </li>
              </ol>
            </div>
            <PlayInView>
              <PatientConversation />
            </PlayInView>
          </div>
        </section>

        {/* ========================== O RESUMO ========================== */}
        <section id="resumo" className="mk-section mk-section--alt" aria-labelledby="resumo-t">
          <div className="mk-wrap">
            <div className="mk-head">
              <SectionLabel>O resumo</SectionLabel>
              <h2 id="resumo-t" className="mk-h2">
                O que importa primeiro, por cor.
              </h2>
              <p className="mk-lead">
                O resumo abre com os sinais de alarme, classificados em três níveis. Depois vêm a
                queixa principal, a história e os antecedentes, organizados para leitura rápida.
              </p>
            </div>
            <div className="mk-legend" style={{ marginTop: "clamp(40px, 5vw, 56px)" }}>
              <div className="mk-legend__row">
                <span className="mk-alert mk-alert--red">Vermelho</span>
                <p>
                  Um sinal que pede atenção antes da consulta. Exemplo: dor no peito com falta de
                  ar há poucas horas.
                </p>
              </div>
              <div className="mk-legend__row">
                <span className="mk-alert mk-alert--amber">Amarelo</span>
                <p>
                  Algo que vale conferir no atendimento. Exemplo: pressão alta sem medir há meses.
                </p>
              </div>
              <div className="mk-legend__row">
                <span className="mk-alert mk-alert--green">Verde</span>
                <p>Nenhum sinal de alarme nas respostas sobre aquele tema.</p>
              </div>
            </div>

            <div className="mk-compare">
              <div>
                <h3>Sem pré-consulta</h3>
                <ul>
                  <li>
                    <BrandIcon name="x" />
                    Na agenda, o médico vê só o nome do paciente
                  </li>
                  <li>
                    <BrandIcon name="x" />A anamnese começa do zero a cada atendimento
                  </li>
                  <li>
                    <BrandIcon name="x" />
                    Datas, doses e exames ficam na memória do paciente
                  </li>
                  <li>
                    <BrandIcon name="x" />
                    Sinais de alarme aparecem, ou não, no meio da conversa
                  </li>
                </ul>
              </div>
              <div>
                <h3>Com o PreCheck</h3>
                <ul>
                  <li>
                    <BrandIcon name="check" />O médico abre o resumo antes de chamar
                  </li>
                  <li>
                    <BrandIcon name="check" />
                    Queixa, história e antecedentes já organizados
                  </li>
                  <li>
                    <BrandIcon name="check" />
                    Medicações e alergias registradas pelo próprio paciente
                  </li>
                  <li>
                    <BrandIcon name="check" />
                    Sinais de alarme destacados no topo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================ PLANOS ============================ */}
        <section className="mk-section" aria-labelledby="planos-t">
          <div className="mk-wrap">
            <div className="mk-head">
              <SectionLabel>Planos</SectionLabel>
              <h2 id="planos-t" className="mk-h2">
                Três faixas, pelo volume do mês.
              </h2>
            </div>
            <div className="mk-plans" style={{ marginTop: "clamp(40px, 5vw, 56px)" }}>
              {TIERS.map((t) => (
                <div key={t.name} className="mk-plan">
                  <h3 className="mk-plan__name">{tierName(t.name)}</h3>
                  <p className="mk-plan__tagline">{t.features[0]}</p>
                  <p className="mk-plan__price">
                    <span className="mk-plan__amount">{t.amount}</span>
                    <span className="mk-plan__unit">{t.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mk-pricing__foot" style={{ marginTop: 20 }}>
              <span>Os planos completos e a contratação ficam na página inicial.</span>
              <Link href="/#planos" className="mk-link">
                Ver planos e contratar <BrandIcon name="arrowR" />
              </Link>
            </div>
          </div>
        </section>

        <SecuritySection />

        {/* ============================= FAQ ============================= */}
        <section id="faq" className="mk-section" aria-labelledby="faq-t">
          <div className="mk-wrap mk-split">
            <div className="mk-sticky">
              <SectionLabel>Perguntas frequentes</SectionLabel>
              <h2 id="faq-t" className="mk-h2" style={{ marginTop: 18 }}>
                Sobre o <PreCheckMark withLogo={false} />.
              </h2>
            </div>
            <Faq items={FAQ} />
          </div>
        </section>

        {/* =========================== CONTATO =========================== */}
        <section id="contato" className="mk-section mk-section--alt" aria-labelledby="contato-t">
          <div className="mk-wrap mk-contact">
            <div>
              <SectionLabel>Demonstração</SectionLabel>
              <h2 id="contato-t" className="mk-h2" style={{ marginTop: 18 }}>
                Veja o PreCheck com um caso do seu serviço.
              </h2>
              <p className="mk-lead" style={{ marginTop: 18 }}>
                Mostramos a conversa do lado do paciente e o resumo do lado do médico, pensando no
                fluxo do seu serviço.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
