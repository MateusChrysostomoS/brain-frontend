// Brain umbrella home page — the guided demo (TASK-078, 2026-11-05).
//
// One scroll, four acts: hero (one promise, one CTA) → PreCheck act (pinned:
// the pre-visit chat becomes the doctor's summary) → secretarIA act (pinned:
// a slot is booked in the clinic chat, lands on the agenda, the reminder goes
// out, a question is handed to the team) → closing (how it works, plans,
// security, company, FAQ, contact).
//
// Owner rules for this page: no invented numbers, testimonials, logos or
// awards; status labels fixed (PreCheck em uso · secretarIA em piloto ·
// WhatsApp em breve — WhatsApp is live for the PreCheck only); the doctor
// evaluates and decides, never the AI; prices, the security & LGPD section and
// the legal name are unchanged; mock-ups use made-up data, labelled.
// Colour code: Brain green, PreCheck blue, secretarIA amber (guided-demo.css).

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { BrandHeader } from "./_components/BrandHeader";
import { BrandFooter } from "./_components/BrandFooter";
import { BrandIcon } from "./_components/BrandIcon";
import { PriceCard } from "./_components/PriceCard";
import { PlanCheckoutCta } from "./_components/PlanCheckoutCta";
import { Faq } from "./_components/Faq";
import { ContactForm } from "./_components/ContactForm";
import { MotionReveal } from "./_components/demo/MotionReveal";
import { PreCheckDemo } from "./_components/demo/PreCheckDemo";
import { SecretariaDemo } from "./_components/demo/SecretariaDemo";
import { SmoothScroll } from "./_components/demo/SmoothScroll";
import { PRICING } from "./_lib/pricing";
import "./_components/demo/guided-demo.css";

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Brain — PreCheck e secretarIA para clínicas",
  description:
    "O PreCheck faz a pré-consulta pelo WhatsApp e entrega um resumo ao médico. A secretarIA, em piloto, tira dúvidas e marca consultas pelo chat da clínica.",
};

// ---------------------------------------------------------------------------
// FAQ data — answers may contain <strong>
// ---------------------------------------------------------------------------

const FAQ_ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: "Preciso contratar os dois produtos?",
    a: "Não. PreCheck e secretarIA funcionam de forma independente — você pode começar pelo que faz mais sentido para a sua clínica. O pacote Brain Completo junta os dois com vantagem, mas é opcional. Em todos os casos, o acesso é por um único login.",
  },
  {
    q: "Qual a diferença entre PreCheck e secretarIA?",
    a: (
      <>
        O PreCheck atua <strong>antes</strong> da consulta: conduz a anamnese
        pelo WhatsApp e entrega ao médico um resumo estruturado com sinais de
        alarme. A secretarIA atua no <strong>dia a dia</strong>: responde
        dúvidas dos pacientes pelo chat da clínica e agenda, cancela e remarca
        consultas. Um prepara a consulta; o outro cuida do paciente e da agenda.
      </>
    ),
  },
  {
    q: "A secretarIA já funciona no WhatsApp?",
    a: "Ainda não. A secretarIA está em piloto com as primeiras clínicas e atende pelo chat da clínica, aberto por um link ou QR code no navegador. O WhatsApp chega em breve.",
  },
  {
    q: "Os dados dos pacientes ficam no Brasil?",
    a: "Sim. O armazenamento permanente é exclusivamente em servidor brasileiro, para os dois produtos. A inteligência das conversas usa o Claude (Anthropic, EUA), com política de não treinar sobre dados de API e conformidade com a LGPD via cláusulas contratuais.",
  },
  {
    q: "Quem é o responsável legal pelos dados?",
    a: "A clínica contratante é a controladora dos dados. A Brain é operadora, com DPO designado e contrato de tratamento específico, cumprindo os requisitos da LGPD para dados sensíveis de saúde (Art. 11). A entidade legal é a PMB Consultoria e Assessoria Empresarial e Projetos LTDA.",
  },
  {
    q: "Como funciona a contratação pública?",
    a: "Os dois produtos são compatíveis com a Lei 14.133/2021, com faturamento por nota fiscal contra empenho e suporte ao processo licitatório. Atendemos clínicas privadas, médicos autônomos e o setor público — fale com a gente para o modelo adequado.",
  },
];

// ---------------------------------------------------------------------------
// "Como funciona" — three steps, each split by product
// ---------------------------------------------------------------------------

const HOW: { title: string; lines: { tone: "pc" | "sa"; product: string; text: string }[] }[] = [
  {
    title: "Link ou QR code",
    lines: [
      { tone: "pc", product: "PreCheck", text: "O paciente abre o link ou escaneia o QR code e responde pelo WhatsApp, sem baixar aplicativo." },
      { tone: "sa", product: "secretarIA", text: "O link abre o chat da clínica no navegador do celular ou do computador. WhatsApp em breve." },
    ],
  },
  {
    title: "A clínica configura",
    lines: [
      { tone: "pc", product: "PreCheck", text: "O médico define o roteiro de perguntas de cada tipo de atendimento." },
      { tone: "sa", product: "secretarIA", text: "A equipe cadastra profissionais, horários, serviços e convênios. É isso que ela responde." },
    ],
  },
  {
    title: "Acompanhamento no portal",
    lines: [
      { tone: "pc", product: "PreCheck", text: "O resumo de cada paciente chega ao painel antes do atendimento." },
      { tone: "sa", product: "secretarIA", text: "Conversas e agenda ficam à vista da equipe, que assume qualquer conversa quando quiser." },
    ],
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BrainHomePage() {
  return (
    <div className="gd-page gd-site--brain">
      <a className="gd-skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SmoothScroll />

      <BrandHeader
        variant="brain"
        navLinks={[
          { href: "#precheck", label: "PreCheck" },
          { href: "#secretaria", label: "secretarIA" },
          { href: "#como-funciona", label: "Como funciona" },
          { href: "#planos", label: "Planos" },
          { href: "#seguranca", label: "Segurança" },
          { href: "#faq", label: "FAQ" },
        ]}
      />

      <main id="conteudo" tabIndex={-1}>
        {/* ====================== ATO 1 — HERO ====================== */}
        <section className="gd-hero" aria-labelledby="hero-title">
          <div className="gd-wrap gd-hero__grid">
            <div>
              <div className="gd-status gd-rise">
                <span className="gd-chip gd-tone--pc">PreCheck em uso</span>
                <span className="gd-chip gd-tone--sa">secretarIA em piloto</span>
              </div>
              <h1 id="hero-title" className="gd-h1 gd-rise gd-rise--2">
                Mais contexto para o médico e menos repetição para a recepção,{" "}
                <em>do primeiro contato à consulta.</em>
              </h1>
              <p className="gd-lead gd-rise gd-rise--3">
                O <strong>PreCheck</strong> faz a pré-consulta pelo WhatsApp e
                entrega um resumo ao médico. A <strong>secretarIA</strong> tira
                dúvidas e marca consultas pelo chat da clínica.
              </p>
              <div className="gd-hero__cta gd-rise gd-rise--4">
                <a className="btn btn--primary btn--lg" href="#contato">
                  Agendar demonstração
                  <BrandIcon name="arrowR" />
                </a>
                <a className="gd-cue" href="#precheck">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M6 13l6 6 6-6" />
                  </svg>
                  Veja os dois funcionando
                </a>
              </div>
            </div>

            <figure className="gd-hero__art gd-rise gd-rise--3">
              <figcaption className="gd-fict">Ilustração com dados fictícios</figcaption>
              <div className="gd-mini gd-tone--pc">
                <span className="gd-mini__head">PreCheck · resumo da pré-consulta</span>
                <span className="gd-mini__line">Cefaleia há 4 dias, piora com luz forte</span>
                <p className="gd-alert gd-alert--red">
                  <span className="gd-alert__dot" aria-hidden="true" />
                  <span>
                    <strong>Sinal de alarme relatado:</strong> rigidez de nuca
                  </span>
                </p>
              </div>
              <div className="gd-mini gd-tone--sa">
                <span className="gd-mini__head">secretarIA · agenda da Dra. Helena</span>
                <span className="gd-mini__ev">
                  Quinta, 14:00 · Consulta
                  <small>Agendado pela secretarIA no chat da clínica</small>
                </span>
                <span className="gd-mini__sub">Confirmação e lembrete enviados por e-mail.</span>
              </div>
            </figure>
          </div>
        </section>

        {/* ====================== ATO 2 — PRECHECK ====================== */}
        <PreCheckDemo
          cta={
            <Link href="/precheck" className="btn btn--primary btn--lg">
              Conhecer o PreCheck
              <BrandIcon name="arrowR" />
            </Link>
          }
        />

        {/* ====================== ATO 3 — SECRETARIA ====================== */}
        <SecretariaDemo
          cta={
            <a href="#contato" className="btn btn--primary btn--lg">
              Quero participar do piloto
              <BrandIcon name="arrowR" />
            </a>
          }
        />

        {/* ====================== ATO 4 — FECHAMENTO ====================== */}

        {/* Como funciona */}
        <section className="gd-how" id="como-funciona" aria-labelledby="como-title">
          <div className="gd-wrap">
            <MotionReveal className="gd-how__head">
              <span className="eyebrow eyebrow--center">Como funciona</span>
              <h2 id="como-title" className="gd-h2">
                Três passos para a clínica <em>começar</em>.
              </h2>
            </MotionReveal>
            <ol className="gd-how__grid" style={{ listStyle: "none", padding: 0 }}>
              {HOW.map((step, i) => (
                <li key={step.title}>
                  <MotionReveal delay={i} className="gd-how__card">
                    <span className="gd-how__n" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{step.title}</h3>
                    <ul>
                      {step.lines.map((l) => (
                        <li key={l.product}>
                          <span className={`gd-chip gd-tone--${l.tone}`}>{l.product}</span>
                          {l.text}
                        </li>
                      ))}
                    </ul>
                  </MotionReveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Planos — prices unchanged (PRICING); only the secretarIA card says
            "piloto" instead of offering a self-service checkout. */}
        <section className="section" id="planos" style={{ background: "var(--page-grad)" }}>
          <div className="container">
            <div className="sec-head center">
              <MotionReveal>
                <span className="eyebrow eyebrow--center">Planos</span>
                <h2 className="h-sec mt-s">
                  Leve um. Ou leve <span className="em">a clínica toda</span>.
                </h2>
                <p className="lead mt-s" style={{ marginInline: "auto" }}>
                  Cada produto pode ser contratado sozinho, e o pacote Brain
                  Completo junta os dois com vantagem.
                </p>
              </MotionReveal>
            </div>

            {/* As TRÊS faixas do PreCheck numa linha só: a escolha aqui é de
                VOLUME (50/100/300), e volume só se compara lado a lado. */}
            <div className="price-grid price-grid--3">
              <MotionReveal>
                <PriceCard
                  name={PRICING.precheckStart.name}
                  tagline={PRICING.precheckStart.tagline}
                  amount={PRICING.precheckStart.amount}
                  unit={PRICING.precheckStart.unit}
                  features={PRICING.precheckStart.features}
                  ctaLabel="Falar com a Brain"
                  ctaHref="#contato"
                  cta={
                    <PlanCheckoutCta
                      plan="precheck_start"
                      catalogIds={PRICING.precheckStart.catalogIds ?? []}
                      label="Contratar Start"
                      secondaryHref="#contato"
                      secondaryLabel="Falar com a Brain"
                    />
                  }
                />
              </MotionReveal>
              <MotionReveal delay={1}>
                <PriceCard
                  name={PRICING.precheck.name}
                  tagline={PRICING.precheck.tagline}
                  amount={PRICING.precheck.amount}
                  unit={PRICING.precheck.unit}
                  features={PRICING.precheck.features}
                  ctaLabel="Falar com a Brain"
                  ctaHref="#contato"
                  cta={
                    <PlanCheckoutCta
                      plan="precheck_basic"
                      catalogIds={PRICING.precheck.catalogIds ?? []}
                      label="Contratar Basic"
                      secondaryHref="#contato"
                      secondaryLabel="Falar com a Brain"
                    />
                  }
                />
              </MotionReveal>
              <MotionReveal delay={2}>
                <PriceCard
                  name={PRICING.precheckAdvanced.name}
                  tagline={PRICING.precheckAdvanced.tagline}
                  amount={PRICING.precheckAdvanced.amount}
                  unit={PRICING.precheckAdvanced.unit}
                  features={PRICING.precheckAdvanced.features}
                  ctaLabel="Falar com a Brain"
                  ctaHref="#contato"
                  cta={
                    <PlanCheckoutCta
                      plan="precheck_advanced"
                      catalogIds={PRICING.precheckAdvanced.catalogIds ?? []}
                      label="Contratar Advanced"
                      secondaryHref="#contato"
                      secondaryLabel="Falar com a Brain"
                    />
                  }
                />
              </MotionReveal>
            </div>

            <div className="price-grid price-grid--2">
              <MotionReveal>
                <PriceCard
                  name={PRICING.combo.name}
                  tagline={PRICING.combo.tagline}
                  amount={PRICING.combo.amount}
                  unit={PRICING.combo.unit}
                  features={PRICING.combo.features}
                  ctaLabel="Falar com Consultor"
                  ctaHref="#contato"
                  featured
                  flag="Melhor valor"
                />
              </MotionReveal>
              {/* secretarIA is in pilot: same price line, but the way in is the
                  pilot conversation, not a checkout. */}
              <MotionReveal delay={1}>
                <PriceCard
                  name={PRICING.secretaria.name}
                  tagline="Em piloto · chat da clínica, WhatsApp em breve"
                  amount={PRICING.secretaria.amount}
                  unit={PRICING.secretaria.unit}
                  features={PRICING.secretaria.features}
                  ctaLabel="Quero participar do piloto"
                  ctaHref="#contato"
                />
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* Segurança & LGPD — unchanged (owner rule). */}
        <section className="section band-dark" id="seguranca">
          <div className="container">
            <div className="sec-head center">
              <MotionReveal>
                <span className="eyebrow eyebrow--center">Segurança &amp; LGPD</span>
                <h2 className="h-sec mt-s">
                  Dado de saúde é dado <span className="em">sensível</span>. Nos
                  dois produtos.
                </h2>
                <p className="lead mt-s" style={{ marginInline: "auto" }}>
                  A mesma camada de segurança protege o PreCheck e a secretarIA:
                  conformidade com a LGPD, a Resolução CFM 2.314/2022 e boas
                  práticas de telemedicina.
                </p>
              </MotionReveal>
            </div>

            <div className="grid grid-3">
              <MotionReveal>
                <div className="card-soft">
                  <span className="feat-ico" style={{ width: 38, height: 38 }}>
                    <BrandIcon name="lock" />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                    Criptografia em trânsito e repouso
                  </h3>
                  <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    TLS 1.3 no tráfego e dados em repouso criptografados no banco.
                    Segredos nunca em claro.
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal delay={1}>
                <div className="card-soft">
                  <span className="feat-ico" style={{ width: 38, height: 38 }}>
                    <BrandIcon name="check" />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                    Consentimento explícito
                  </h3>
                  <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    Antes de qualquer coleta, o paciente aceita o termo. Registro
                    auditável.
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal delay={2}>
                <div className="card-soft">
                  <span className="feat-ico" style={{ width: 38, height: 38 }}>
                    <BrandIcon name="users" />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                    Isolamento por clínica
                  </h3>
                  <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    Tenancy lógico. Uma clínica nunca vê pacientes da outra.
                    Auditoria por atendimento.
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal>
                <div className="card-soft">
                  <span className="feat-ico" style={{ width: 38, height: 38 }}>
                    <BrandIcon name="server" />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                    Servidor brasileiro
                  </h3>
                  <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    Armazenamento em datacenter no Brasil, sem trânsito
                    internacional desnecessário.
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal delay={1}>
                <div className="card-soft">
                  <span className="feat-ico" style={{ width: 38, height: 38 }}>
                    <BrandIcon name="whatsapp" />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                    WhatsApp Business API oficial
                  </h3>
                  <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    Integração homologada pela Meta Cloud API. Nada de apps ou
                    números não oficiais.
                  </p>
                </div>
              </MotionReveal>
              <MotionReveal delay={2}>
                <div className="card-soft">
                  <span className="feat-ico" style={{ width: 38, height: 38 }}>
                    <BrandIcon name="shield" />
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                    LGPD &amp; CFM
                  </h3>
                  <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    DPO designado e contrato de tratamento de dados. A clínica é a
                    controladora; a Brain, operadora.
                  </p>
                </div>
              </MotionReveal>
            </div>

            {/* Tech strip — "Sob o capô" */}
            <div style={{ marginTop: 48 }}>
              <div className="eyebrow eyebrow--center" style={{ justifyContent: "center", marginBottom: 20 }}>
                Sob o capô
              </div>
              <div className="tech-strip">
                <span className="ti">
                  <BrandIcon name="sparkle" />
                  IA da Anthropic (Claude)
                </span>
                <span className="tech-sep" />
                <span className="ti">
                  <BrandIcon name="whatsapp" />
                  WhatsApp Business API (Meta Cloud)
                </span>
                <span className="tech-sep" />
                <span className="ti">
                  <BrandIcon name="server" />
                  Infraestrutura em servidor brasileiro
                </span>
                <span className="tech-sep" />
                <span className="ti">
                  <BrandIcon name="shield" />
                  Conformidade LGPD
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* A empresa — mission + legal entity (unchanged). The "2 produtos /
            1 plataforma" counters were dropped: numbers without information. */}
        <section className="section" id="empresa">
          <div className="container split">
            <MotionReveal>
              <span className="eyebrow">A empresa</span>
              <h2 className="h-sec mt-s">
                A Brain existe para devolver <span className="em">tempo de consulta</span>.
              </h2>
              <p className="lead mt-s">
                Nossa missão é simples: dar contexto ao médico antes do
                atendimento e tirar o atrito do caminho do paciente. A Brain é dona
                de dois produtos: o <strong>PreCheck</strong>, que cuida da
                pré-consulta, e a <strong>secretarIA</strong>, que cuida do
                atendimento e da agenda.
              </p>
            </MotionReveal>
            <MotionReveal delay={1}>
              <div className="card-soft" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="feat-ico" style={{ width: 38, height: 38 }}>
                  <BrandIcon name="doc" />
                </span>
                <div>
                  <div
                    className="faint"
                    style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}
                  >
                    Entidade legal
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
                    PMB Consultoria e Assessoria Empresarial e Projetos LTDA
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq" style={{ background: "var(--page-grad)" }}>
          <div className="container">
            <div className="sec-head center">
              <MotionReveal>
                <span className="eyebrow eyebrow--center">Perguntas frequentes</span>
                <h2 className="h-sec mt-s">
                  Sobre a Brain e os <span className="em">dois produtos</span>.
                </h2>
              </MotionReveal>
            </div>
            <Faq items={FAQ_ITEMS} />
          </div>
        </section>

        {/* Contato — the closing CTA */}
        <section className="section" id="contato">
          <div className="container split">
            <MotionReveal>
              <span className="eyebrow">Agendar demonstração</span>
              <h2 className="h-sec mt-s">
                Veja a Brain rodando <span className="em">no seu serviço</span>.
              </h2>
              <p className="lead mt-s">
                Demonstração de 25 minutos com um caso real do seu fluxo.
                Mostramos o produto certo para a sua necessidade — ou os dois. Sem
                compromisso, sem proposta empurrada.
              </p>
              <ul className="tick-list mt-l">
                <li className="ok">
                  <BrandIcon name="check" />
                  Diagnóstico do fluxo atual da clínica
                </li>
                <li className="ok">
                  <BrandIcon name="check" />
                  Demonstração do PreCheck e/ou da secretarIA
                </li>
                <li className="ok">
                  <BrandIcon name="check" />
                  Implantação assistida pela equipe Brain
                </li>
              </ul>
            </MotionReveal>
            <MotionReveal delay={1}>
              <p className="muted mt-s" style={{ fontSize: 13.5 }}>
                Quer o PreCheck agora? Assine em poucos minutos — veja os{" "}
                <a href="#planos">planos</a>.
              </p>
              <ContactForm variant="brain" />
            </MotionReveal>
          </div>
        </section>
      </main>

      <BrandFooter variant="brain" />
    </div>
  );
}
