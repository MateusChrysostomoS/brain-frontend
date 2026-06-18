// Brain umbrella home page — server component, composes shared components + static JSX.
// Hero variant A only (dual-product split). All other sections ported verbatim from brain.html.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { BrandHeader } from "./_components/BrandHeader";
import { BrandFooter } from "./_components/BrandFooter";
import { BrandIcon } from "./_components/BrandIcon";
import { PriceCard } from "./_components/PriceCard";
import { Faq } from "./_components/Faq";
import { ContactForm } from "./_components/ContactForm";
import { Reveal } from "./_components/Reveal";

// ---------------------------------------------------------------------------
// Metadata — ported from <title> and <meta name="description"> in brain.html
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Brain — Inteligência no WhatsApp para clínicas | PreCheck + secretarIA",
  description:
    "A Brain coloca inteligência no WhatsApp da sua clínica: PreCheck conduz a anamnese antes da consulta e a secretarIA atende pacientes e cuida da agenda.",
};

// ---------------------------------------------------------------------------
// FAQ data — 5 Brain FAQ items, answers may contain <strong>
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
        dúvidas dos pacientes no WhatsApp e agenda, cancela e remarca consultas.
        Um prepara a consulta; o outro cuida do paciente e da agenda.
      </>
    ),
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
// Page
// ---------------------------------------------------------------------------

export default function BrainHomePage() {
  return (
    <>
      {/* ====================== HEADER ====================== */}
      <BrandHeader
        variant="brain"
        navLinks={[
          { href: "#produtos", label: "Produtos" },
          { href: "#planos", label: "Planos" },
          { href: "#empresa", label: "A empresa" },
          { href: "#seguranca", label: "Segurança" },
          { href: "#faq", label: "FAQ" },
        ]}
      />

      {/* ====================== HERO — VARIANT A (dual-product split) ====================== */}
      <section className="hero hero-variant" data-variant="A">
        <div className="container hero-inner">
          {/* Left: copy */}
          <div className="hero-copy">
            <span className="eyebrow">Plataforma Brain · PreCheck + secretarIA</span>
            <h1 className="display">
              Inteligência no WhatsApp,{" "}
              <span className="em">do primeiro &ldquo;oi&rdquo; à consulta</span>.
            </h1>
            <p className="lead">
              A Brain coloca duas IAs no WhatsApp da sua clínica: o{" "}
              <strong>PreCheck</strong> conduz a anamnese antes do atendimento e
              a <strong>secretarIA</strong> responde os pacientes e cuida da
              agenda. Mais contexto para o médico, menos atrito para todos.
            </p>
            <div className="hero-cta">
              <a className="btn btn--primary btn--lg" href="#produtos">
                <BrandIcon name="arrowR" />
                Conhecer os produtos
              </a>
              <a className="btn btn--outline btn--lg" href="#contato">
                Agendar demonstração
              </a>
            </div>
            <div className="hero-trust">
              <div className="chip-row">
                <span className="chip">
                  <BrandIcon name="check" />
                  Dois produtos, uma clínica
                </span>
                <span className="chip">
                  <BrandIcon name="check" />
                  WhatsApp oficial
                </span>
                <span className="chip">
                  <BrandIcon name="check" />
                  Conformidade LGPD
                </span>
              </div>
            </div>
          </div>

          {/* Right: visual — .prod-stack with two mini-cards (no phone mockup) */}
          <div className="hero-visual">
            <Reveal>
              <div className="prod-stack">
                {/* PreCheck mini card — resumo da pré-consulta */}
                <div className="mini-card mini-precheck">
                  <div className="mini-head">
                    <span
                      className="mini-dot"
                      style={{ background: "var(--brand)" }}
                    />
                    PreCheck · resumo da pré-consulta
                  </div>
                  <div className="mini-line">
                    <span className="mk">QP</span> Cefaleia há 4 dias, com fotofobia
                  </div>
                  <div className="mini-alerts">
                    <span className="alert-line alert-line--red">
                      <span className="dot dot--red" />
                      Sinal de alarme: rigidez de nuca
                    </span>
                    <span className="alert-line alert-line--green">
                      <span className="dot dot--green" />
                      Sem febre · sem déficit focal
                    </span>
                  </div>
                </div>

                {/* secretarIA mini card — WhatsApp chat bubbles */}
                <div className="mini-card mini-secretaria">
                  <div className="mini-head">
                    <span
                      className="mini-dot"
                      style={{ background: "#25a35f" }}
                    />
                    secretarIA · WhatsApp
                  </div>
                  <div className="bub bub--out show" style={{ maxWidth: "88%" }}>
                    Dá pra marcar um retorno quinta?
                  </div>
                  <div
                    className="bub bub--in show"
                    style={{ maxWidth: "92%" }}
                  >
                    Tenho <strong>quinta 14:00</strong> ✅ Quer que eu confirme?
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====================== PRODUTOS ====================== */}
      <section className="section" id="produtos">
        <div className="container">
          <div className="sec-head center">
            <Reveal>
              <span className="eyebrow eyebrow--center">Produtos</span>
              <h2 className="h-sec mt-s">
                Dois produtos, <span className="em">uma só clínica</span>.
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                Use cada um por conta própria ou combine os dois. Mesma
                engenharia, mesma conformidade.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-2 prod-grid">
            {/* PreCheck product card */}
            <Reveal>
              <div className="card prod-card">
                <div className="prod-top">
                  <span className="prod-badge">Antes da consulta</span>
                  <h3 className="prod-h">
                    Pre<span className="em">Check</span>
                  </h3>
                </div>
                <p className="muted prod-lead">
                  Conduz a anamnese pré-consulta pelo WhatsApp. O médico define
                  o roteiro e recebe um resumo estruturado, com sinais de alarme
                  destacados, antes do atendimento começar.
                </p>
                <ul className="tick-list mt-m">
                  <li className="ok">
                    <BrandIcon name="check" />
                    Anamnese guiada por IA, sem app
                  </li>
                  <li className="ok">
                    <BrandIcon name="check" />
                    Resumo no padrão POMR + SOAP
                  </li>
                  <li className="ok">
                    <BrandIcon name="check" />
                    Alertas em vermelho / amarelo / verde
                  </li>
                </ul>
                {/* Alert strip demo — mirrors the color-coded severity indicators */}
                <div className="alert-strip mt-m">
                  <span className="alert-line alert-line--red">
                    <span className="dot dot--red" />
                    Dor torácica + dispneia há 6h
                  </span>
                  <span className="alert-line alert-line--amber">
                    <span className="dot dot--amber" />
                    HAS sem aferição há 8 meses
                  </span>
                  <span className="alert-line alert-line--green">
                    <span className="dot dot--green" />
                    Sem sinais de alarme
                  </span>
                </div>
                <Link
                  href="/precheck"
                  className="btn btn--outline btn--block mt-l"
                >
                  Conhecer PreCheck <BrandIcon name="arrowR" />
                </Link>
              </div>
            </Reveal>

            {/* secretarIA product card */}
            <Reveal delay={1}>
              <div className="card prod-card">
                <div className="prod-top">
                  <span className="prod-badge">No dia a dia</span>
                  <h3 className="prod-h">
                    secretar<span className="em">IA</span>
                  </h3>
                </div>
                <p className="muted prod-lead">
                  Uma secretária com IA no WhatsApp que responde os pacientes
                  como se fosse o próprio médico — e agenda, cancela e remarca
                  consultas sozinha, com o contexto que o médico configura.
                </p>
                <ul className="tick-list mt-m">
                  <li className="ok">
                    <BrandIcon name="check" />
                    Responde dúvidas no tom do médico
                  </li>
                  <li className="ok">
                    <BrandIcon name="check" />
                    Agenda, cancela e remarca consultas
                  </li>
                  <li className="ok">
                    <BrandIcon name="check" />
                    Sincronizada com o Google Calendar
                  </li>
                </ul>
                {/* Mini WhatsApp chat preview inside the card */}
                <div
                  className="card-soft mt-m"
                  style={{ padding: 14, background: "var(--wa-screen)" }}
                >
                  <div className="bub bub--out show" style={{ maxWidth: "80%" }}>
                    Vocês atendem Unimed?
                  </div>
                  <div
                    className="bub bub--in show mt-s"
                    style={{ maxWidth: "90%" }}
                  >
                    Atendemos sim 😊 Quer agendar uma{" "}
                    <strong>primeira consulta</strong>?
                  </div>
                </div>
                <Link
                  href="/secretaria"
                  className="btn btn--primary btn--block mt-l"
                >
                  Conhecer secretarIA <BrandIcon name="arrowR" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====================== PLANOS ====================== */}
      <section
        className="section"
        id="planos"
        style={{ background: "var(--page-grad)" }}
      >
        <div className="container">
          <div className="sec-head center">
            <Reveal>
              <span className="eyebrow eyebrow--center">Planos</span>
              <h2 className="h-sec mt-s">
                Leve um. Ou leve <span className="em">a clínica toda</span>.
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                Cada produto pode ser contratado sozinho, e o pacote Brain
                Completo junta os dois com vantagem. Os valores abaixo são
                exemplos.
              </p>
              {/* Placeholder price warning — must remain visible until real prices are set */}
              <p className="price-note center mt-s">
                ⚠︎ Valores de exemplo — substituir pelos preços reais antes de
                publicar.
              </p>
            </Reveal>
          </div>

          <div className="price-grid">
            {/* PLACEHOLDER-PRICE: plano-precheck */}
            <Reveal>
              <PriceCard
                name="Plano PreCheck"
                tagline="Pré-consulta no WhatsApp"
                amount="R$ —"
                unit="/mês · valor de exemplo"
                note="a partir de · editar"
                features={[
                  "Anamnese guiada por IA",
                  "Resumo estruturado + alertas",
                  "Análise de exames por foto",
                  "Painel clínico PreCheck",
                ]}
                ctaLabel="Falar com a Brain"
                ctaHref="#contato"
              />
            </Reveal>

            {/* PLACEHOLDER-PRICE: plano-brain-completo (featured) */}
            <Reveal delay={1}>
              <PriceCard
                name="Brain Completo"
                tagline="PreCheck + secretarIA, juntos"
                amount="R$ —"
                unit="/mês · valor de exemplo"
                note="a partir de · editar"
                features={[
                  "Tudo do PreCheck",
                  "Tudo da secretarIA",
                  "Os dois produtos integrados",
                  "Implantação assistida",
                ]}
                ctaLabel="Agendar demonstração"
                ctaHref="#contato"
                featured
                flag="Melhor valor"
              />
            </Reveal>

            {/* PLACEHOLDER-PRICE: plano-secretaria */}
            <Reveal delay={2}>
              <PriceCard
                name="Plano secretarIA"
                tagline="Secretária com IA no WhatsApp"
                amount="R$ —"
                unit="/mês · valor de exemplo"
                note="a partir de · editar"
                features={[
                  "Respostas com o seu contexto",
                  "Agendar, cancelar e remarcar",
                  "Sincronização com Google Calendar",
                  "Painel da secretarIA",
                ]}
                ctaLabel="Falar com a Brain"
                ctaHref="#contato"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ====================== A EMPRESA ====================== */}
      <section className="section" id="empresa">
        <div className="container split">
          {/* Left: text */}
          <Reveal>
            <span className="eyebrow">A empresa</span>
            <h2 className="h-sec mt-s">
              A Brain existe para devolver{" "}
              <span className="em">tempo de consulta</span>.
            </h2>
            <p className="lead mt-s">
              Nossa missão é simples: dar contexto ao médico antes do
              atendimento e tirar o atrito do caminho do paciente. Construímos
              nativos do WhatsApp porque é onde a clínica brasileira já conversa
              — sem app, sem fricção.
            </p>
            <p className="lead mt-m">
              A Brain é dona de dois produtos: o <strong>PreCheck</strong>, que
              cuida da pré-consulta, e a <strong>secretarIA</strong>, que cuida
              do atendimento e da agenda. Mesma engenharia, mesma conformidade,
              mesma obsessão por simplicidade.
            </p>
          </Reveal>

          {/* Right: stats + legal entity card */}
          <Reveal delay={1}>
            <div className="grid grid-2" style={{ gap: 18 }}>
              <div className="card-soft">
                <div
                  className="serif-num"
                  style={{ fontSize: 40, color: "var(--brand)" }}
                >
                  2
                </div>
                <p className="muted mt-s" style={{ fontSize: 13.5 }}>
                  produtos sob a mesma plataforma
                </p>
              </div>
              <div className="card-soft">
                <div
                  className="serif-num"
                  style={{ fontSize: 40, color: "var(--brand)" }}
                >
                  1
                </div>
                <p className="muted mt-s" style={{ fontSize: 13.5 }}>
                  plataforma para toda a clínica
                </p>
              </div>
              <div className="card-soft">
                <span
                  className="feat-ico"
                  style={{ width: 38, height: 38 }}
                >
                  <BrandIcon name="server" />
                </span>
                <p className="muted mt-s" style={{ fontSize: 13.5 }}>
                  Hospedagem em servidor brasileiro
                </p>
              </div>
              <div className="card-soft">
                <span
                  className="feat-ico"
                  style={{ width: 38, height: 38 }}
                >
                  <BrandIcon name="shield" />
                </span>
                <p className="muted mt-s" style={{ fontSize: 13.5 }}>
                  Conformidade LGPD &amp; CFM nativa
                </p>
              </div>
            </div>
            {/* Legal entity row */}
            <div
              className="card-soft mt-m"
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <span className="feat-ico" style={{ width: 38, height: 38 }}>
                <BrandIcon name="doc" />
              </span>
              <div>
                <div
                  className="faint"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  Entidade legal
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  PMB Consultoria e Assessoria Empresarial e Projetos LTDA
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====================== SEGURANÇA (dark band) ====================== */}
      <section className="section band-dark" id="seguranca">
        <div className="container">
          <div className="sec-head center">
            <Reveal>
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
            </Reveal>
          </div>

          <div className="grid grid-3">
            {/* Six security feature cards */}
            <Reveal>
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
            </Reveal>
            <Reveal delay={1}>
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
            </Reveal>
            <Reveal delay={2}>
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
            </Reveal>
            <Reveal>
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
            </Reveal>
            <Reveal delay={1}>
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
            </Reveal>
            <Reveal delay={2}>
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
            </Reveal>
          </div>

          {/* Tech strip — "Sob o capô" */}
          <div style={{ marginTop: 48 }}>
            <div
              className="eyebrow eyebrow--center"
              style={{ justifyContent: "center", marginBottom: 20 }}
            >
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

      {/* ====================== FAQ ====================== */}
      <section
        className="section"
        id="faq"
        style={{ background: "var(--page-grad)" }}
      >
        <div className="container">
          <div className="sec-head center">
            <Reveal>
              <span className="eyebrow eyebrow--center">
                Perguntas frequentes
              </span>
              <h2 className="h-sec mt-s">
                Sobre a Brain e os <span className="em">dois produtos</span>.
              </h2>
            </Reveal>
          </div>
          {/* Faq is a client component — no Reveal wrapper needed (it handles its own state) */}
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ====================== CONTATO ====================== */}
      <section className="section" id="contato">
        <div className="container split">
          {/* Left: pitch copy */}
          <Reveal>
            <span className="eyebrow">Vamos conversar</span>
            <h2 className="h-sec mt-s">
              Veja a Brain rodando{" "}
              <span className="em">no seu serviço</span>.
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
          </Reveal>

          {/* Right: controlled form (client component) */}
          <Reveal delay={1}>
            <ContactForm variant="brain" />
          </Reveal>
        </div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <BrandFooter variant="brain" />
    </>
  );
}
