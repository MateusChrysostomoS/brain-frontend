// Brain home (/) — the umbrella marketing page for PreCheck and secretarIA.
//
// Sections live here as plain JSX; reusable pieces (header, footer, pricing,
// security, FAQ, product vignettes) are in components/landing. Styles come from
// components/landing/site.css, scoped to `.site`, so nothing here can leak into
// the app screens that share the (site) layout.
//
// The product section is the guided demo (TASK-078, 2026-11-06): the owner kept
// this redesign and replaced its two product articles with the pinned PreCheck
// and secretarIA acts from _components/demo (their colours mapped onto the
// --mk-* tokens in guided-demo.css).
//
// COPY RULE: every claim on this page is something the product does today.
// The 2026-10-05 audit removed: "dados só no Brasil" / "servidor brasileiro" (files are on
// Cloudflare R2), "criptografia em trânsito e repouso", "WhatsApp oficial /
// homologado pela Meta" (approval pending), "DPO designado", "Melhor valor",
// "Lei 14.133" and "demonstração de 25 minutos". Do not reintroduce a claim
// without the evidence for it.

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PORTAL_LOGIN_HREF } from "@/lib/portal-login";
import { BrandIcon } from "./_components/BrandIcon";
import { ContactForm } from "./_components/ContactForm";
import { PRICING, PRECHECK_QUOTA } from "./_lib/pricing";

import "@/components/landing/site.css";
import { PreCheckMark, SecretariaMark, SectionLabel, StatusTag } from "@/components/landing/brand";
import { Faq, type FaqEntry } from "@/components/landing/Faq";
import { Pricing } from "@/components/landing/Pricing";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { PortalWindow, SummaryCard } from "@/components/landing/vignettes";

// The guided demo (TASK-078): the two pinned product acts, the hero's
// "role para ver" arrow and the smooth wheel that drives the scrubbing.
import { PreCheckDemo } from "./_components/demo/PreCheckDemo";
import { ScrollCue } from "./_components/demo/ScrollCue";
import { SecretariaDemo } from "./_components/demo/SecretariaDemo";
import { SmoothScroll } from "./_components/demo/SmoothScroll";
import "./_components/demo/guided-demo.css";

export const metadata: Metadata = {
  title: "Brain — PreCheck e secretarIA para clínicas",
  description:
    "O PreCheck conduz a pré-consulta e entrega ao médico um resumo com os sinais de alarme em destaque. A secretarIA responde pacientes e marca, remarca e cancela consultas no Google Agenda da clínica.",
};

const NAV = [
  { href: "#produtos", label: "Produtos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#faq", label: "Perguntas" },
];

const FAQ: FaqEntry[] = [
  {
    q: "Preciso contratar os dois produtos?",
    a: "Não. PreCheck e secretarIA são independentes: dá para começar por um e somar o outro depois. Os dois usam a mesma conta Brain.",
  },
  {
    q: "Qual a diferença entre PreCheck e secretarIA?",
    a: "O PreCheck cuida do antes da consulta: conduz a anamnese com o paciente e entrega ao médico um resumo estruturado. A secretarIA cuida do atendimento do dia a dia: responde dúvidas e marca, remarca e cancela consultas na agenda da clínica.",
  },
  {
    q: "O paciente precisa instalar alguma coisa?",
    a: "Não. A conversa acontece no chat da clínica, que abre no navegador do celular a partir de um link ou de um QR code. Não é preciso baixar aplicativo.",
  },
  {
    q: "Funciona pelo WhatsApp?",
    a: "Ainda não. Hoje o canal é o chat da clínica, no Portal Brain. O WhatsApp está a caminho, e avisamos os clientes quando estiver disponível.",
  },
  {
    q: "A secretarIA já está disponível?",
    a: "Ela está entrando em piloto com as primeiras clínicas. Se quiser participar, ou só ser avisado quando abrir, deixe seu contato no formulário abaixo.",
  },
  {
    q: "A IA substitui o médico ou a recepção?",
    a: "Não. O PreCheck prepara a consulta, mas quem avalia e decide é o médico. A secretarIA cuida das conversas repetitivas e passa para a equipe quando é preciso uma pessoa.",
  },
  {
    q: "Qual inteligência artificial vocês usam?",
    a: "Usamos modelos de linguagem da Anthropic (Claude) e da OpenAI, acessados por API.",
  },
  {
    q: "Quem é o responsável pelos dados dos pacientes?",
    a: "Na LGPD, a clínica que contrata é a controladora dos dados dos seus pacientes. A Brain atua como operadora, tratando esses dados em nome da clínica.",
  },
];

const d = (n: number) => ({ "--d": n }) as CSSProperties;

export default function BrainHomePage() {
  return (
    <div className="site gd-page gd-site--brain">
      <a href="#conteudo" className="mk-skip">
        Pular para o conteúdo
      </a>
      <SmoothScroll />
      <SiteHeader nav={NAV} plansHref="#planos" contactHref="#contato" />

      <main id="conteudo">
        {/* ============================ HERO ============================ */}
        <section className="mk-hero" aria-labelledby="hero-t">
          <div className="mk-wrap">
            <div className="mk-hero__copy mk-enter">
              <a href="#secretaria" className="mk-announce" style={d(0)}>
                <span className="mk-announce__tag">
                  <span className="mk-dot mk-dot--pilot" aria-hidden="true" />
                  Piloto
                </span>
                A secretarIA está chegando às primeiras clínicas
                <BrandIcon name="arrowR" />
              </a>
              <h1 id="hero-t" className="mk-display" style={d(1)}>
                A consulta começa antes do paciente chegar.
              </h1>
              <p className="mk-lead" style={d(2)}>
                O <strong>PreCheck</strong> conduz a anamnese com o paciente e entrega ao médico um
                resumo com os sinais de alarme em destaque. A <strong>secretarIA</strong> responde
                os pacientes e marca, remarca e cancela consultas no Google Agenda da clínica.
              </p>
              <div className="mk-hero__ctas" style={d(3)}>
                <a href="#contato" className="mk-btn mk-btn--primary">
                  Agendar demonstração
                </a>
                <a href="#planos" className="mk-btn mk-btn--secondary">
                  Ver planos
                </a>
              </div>
              <p className="mk-hero__login" style={d(4)}>
                Já é cliente?{" "}
                <Link href={PORTAL_LOGIN_HREF} className="mk-inline-link">
                  Entrar
                </Link>
              </p>
            </div>
          </div>

          <div className="mk-stage-band">
            <div className="mk-wrap">
              <div className="mk-stage">
                <div>
                  <PortalWindow />
                  <p className="mk-caption mk-stage__caption">
                    Ilustrações do Portal Brain e do PreCheck, com dados fictícios.
                  </p>
                </div>
                <div className="mk-stage__side">
                  <SummaryCard />
                </div>
              </div>

              {/* Honest status line: what is live, what is in pilot, what is next. */}
              <ul className="mk-status" aria-label="Onde estamos hoje">
                <li className="mk-status__item">
                  <div className="mk-status__head">
                    <PreCheckMark />
                    <span className="mk-status__state">
                      <StatusTag status="live" />
                    </span>
                  </div>
                  <p>Em funcionamento nas clínicas que já usam a Brain.</p>
                </li>
                <li className="mk-status__item">
                  <div className="mk-status__head">
                    <SecretariaMark />
                    <span className="mk-status__state">
                      <StatusTag status="pilot" />
                    </span>
                  </div>
                  <p>Entrando em piloto com as primeiras clínicas.</p>
                </li>
                <li className="mk-status__item">
                  <div className="mk-status__head">
                    <span>WhatsApp</span>
                    <span className="mk-status__state">
                      <StatusTag status="soon" />
                    </span>
                  </div>
                  <p>Hoje o paciente conversa pelo chat da clínica, no navegador.</p>
                </li>
              </ul>
            </div>
          </div>
          <ScrollCue to="precheck" />
        </section>

        {/* ========================== PRODUTOS ========================== */}
        {/* The two products told as the guided demo (TASK-078, owner 2026-11-06:
            keep this redesign and put the pinned acts in it). PreCheck: the
            pre-visit chat becomes the doctor's summary. secretarIA: a new
            patient goes through the whole booking flow, a known patient asks
            questions and is handed to the team. Pinned and scroll-scrubbed by
            PinnedAct; static and complete without JS or with reduced motion. */}
        <div id="produtos">
          <PreCheckDemo
            title={
              <>
                A pré-consulta acontece pelo celular, <em>antes do paciente chegar.</em>
              </>
            }
            cta={
              <Link href="/precheck" className="mk-btn mk-btn--primary">
                Conhecer o PreCheck
              </Link>
            }
          />
          <SecretariaDemo
            cta={
              <a href="#contato" className="mk-btn mk-btn--primary">
                Quero participar do piloto
              </a>
            }
          />
        </div>
        {/* ======================== COMO FUNCIONA ======================== */}
        <section
          id="como-funciona"
          className="mk-section mk-section--alt"
          aria-labelledby="como-t"
        >
          <div className="mk-wrap">
            <div className="mk-head">
              <SectionLabel>Como funciona</SectionLabel>
              <h2 id="como-t" className="mk-h2">
                Um link para o paciente. Um portal para a equipe.
              </h2>
              <p className="mk-lead">
                Nada para o paciente instalar e um só lugar para a clínica acompanhar tudo. A
                implantação é feita junto com a sua equipe.
              </p>
            </div>
            <ol className="mk-steps">
              <li className="mk-step">
                <span className="mk-step__num" aria-hidden="true">
                  1
                </span>
                <h3 className="mk-h3">A clínica configura</h3>
                <p>
                  Horários, orientações e respostas da secretarIA; o roteiro da pré-consulta do
                  PreCheck. A agenda vem do Google Agenda da clínica.
                </p>
              </li>
              <li className="mk-step">
                <span className="mk-step__num" aria-hidden="true">
                  2
                </span>
                <h3 className="mk-h3">Compartilha o link</h3>
                <p>
                  O chat da clínica tem um link e um QR code para usar no site, nas redes sociais,
                  na confirmação da consulta ou na recepção.
                </p>
              </li>
              <li className="mk-step">
                <span className="mk-step__num" aria-hidden="true">
                  3
                </span>
                <h3 className="mk-h3">Acompanha no portal</h3>
                <p>
                  A equipe vê as conversas e a agenda e entra quando precisa. O médico lê o resumo
                  da anamnese antes de chamar o paciente.
                </p>
                <ul aria-label="Áreas do portal">
                  <li className="mk-tag">Conversas</li>
                  <li className="mk-tag">Agenda</li>
                  <li className="mk-tag">Anamneses</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>

        <Pricing />

        <SecuritySection />

        {/* ========================== A EMPRESA ========================== */}
        <section id="empresa" className="mk-section" aria-labelledby="empresa-t">
          <div className="mk-wrap mk-about">
            <div>
              <SectionLabel>A Brain</SectionLabel>
              <h2 id="empresa-t" className="mk-h2" style={{ marginTop: 18 }}>
                Software brasileiro para clínicas.
              </h2>
            </div>
            <div>
              <p className="mk-about__text">
                A Brain existe para devolver ao médico o tempo da consulta e tirar da recepção o
                trabalho repetitivo. Fazemos dois produtos, o PreCheck e a secretarIA, e
                implantamos cada um junto com a equipe da clínica.
              </p>
              <dl className="mk-about__meta">
                <div>
                  <dt>Produtos</dt>
                  <dd>PreCheck (pré-consulta) e secretarIA (atendimento e agenda)</dd>
                </div>
                <div>
                  <dt>Razão social</dt>
                  <dd>PMB Consultoria e Assessoria Empresarial e Projetos LTDA</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ============================= FAQ ============================= */}
        <section id="faq" className="mk-section mk-section--rule" aria-labelledby="faq-t">
          <div className="mk-wrap mk-split">
            <div className="mk-sticky">
              <SectionLabel>Perguntas frequentes</SectionLabel>
              <h2 id="faq-t" className="mk-h2" style={{ marginTop: 18 }}>
                O que as clínicas costumam perguntar.
              </h2>
              <p className="mk-lead" style={{ marginTop: 18 }}>
                Não encontrou o que procurava?{" "}
                <a href="#contato" className="mk-inline-link">
                  Fale com a gente
                </a>
                .
              </p>
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
                Veja a Brain com o fluxo da sua clínica.
              </h2>
              <p className="mk-lead" style={{ marginTop: 18 }}>
                Uma conversa com a nossa equipe para entender como a clínica funciona hoje e mostrar
                o produto que faz sentido para ela, ou os dois.
              </p>
              <ul className="mk-contact__list">
                <li>
                  <BrandIcon name="check" />
                  Como a clínica atende e agenda hoje
                </li>
                <li>
                  <BrandIcon name="check" />
                  O PreCheck e a secretarIA funcionando
                </li>
                <li>
                  <BrandIcon name="check" />
                  Como é a implantação com a sua equipe
                </li>
              </ul>
              <p className="mk-contact__alt">
                Prefere começar agora? O PreCheck pode ser contratado direto pelo site, a partir de{" "}
                {PRICING.precheckStart.amount}
                {PRICING.precheckStart.unit} ({PRECHECK_QUOTA.start} pré-consultas).{" "}
                <a href="#planos" className="mk-inline-link">
                  Ver planos
                </a>
              </p>
            </div>
            <ContactForm variant="brain" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
