// secretarIA product marketing home — server component.
// Composes all shared client components (BrandHeader, BrandFooter, Phone, PriceCard,
// Faq, ContactForm, Reveal) with static JSX sections ported from SecretarIA.html.
// CSS is provided globally by brand-ds.css + brand-pages.css (loaded in (site) layout).

import type { Metadata } from "next";
import { BrandHeader } from "../_components/BrandHeader";
import { BrandFooter } from "../_components/BrandFooter";
import { BrandIcon } from "../_components/BrandIcon";
import { Phone, type WaStep } from "../_components/Phone";
import { PriceCard } from "../_components/PriceCard";
import { Faq, type FaqItem } from "../_components/Faq";
import { ContactForm } from "../_components/ContactForm";
import { Reveal } from "../_components/Reveal";

// ─── Metadata ────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "secretarIA — Secretária com IA no WhatsApp | Brain",
  description:
    "Uma secretária com IA no WhatsApp que responde seus pacientes como se fosse você — e agenda, cancela e remarca consultas sozinha. Da Brain, criadora do PreCheck.",
};

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "#problema", label: "O problema" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#personalizacao", label: "Personalização" },
  { href: "#planos", label: "Planos" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#faq", label: "FAQ" },
];

// ─── WhatsApp hero animation steps (verbatim from SecretarIA.html <script>) ──

const WA_SECRETARIA: WaStep[] = [
  { from: "out", text: "Oi! Vocês atendem amanhã de manhã?", time: "09:14", after: 900 },
  {
    from: "in",
    typing: 1100,
    text: "Oi! 😊 Aqui é a secretária do Dr. Aurélio. Amanhã ele tem horários às <strong>09:00</strong> e às <strong>10:30</strong>.",
    time: "09:14",
    after: 1300,
  },
  { from: "out", text: "Pode ser às 9h então", time: "09:15", after: 900 },
  {
    from: "in",
    typing: 900,
    text: "Claro! É <strong>primeira consulta</strong> ou <strong>retorno</strong>?",
    time: "09:15",
    after: 1100,
  },
  { from: "out", text: "Primeira consulta", time: "09:15", after: 900 },
  {
    from: "in",
    typing: 1200,
    text: "Perfeito ✅ Agendei sua <strong>primeira consulta</strong> para amanhã, <strong>09:00</strong>. Qualquer coisa, é só me chamar por aqui!",
    time: "09:16",
    after: 900,
  },
  { card: "br", delay: 500 },
];

// ─── FAQ items ────────────────────────────────────────────────────────────────

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "A secretarIA pode dar respostas erradas ou inventar coisas?",
    a: "Ela responde a partir do que o médico configura — apresentação, convênios, valores, regras e disponibilidade. Quando uma pergunta sai desse escopo ou exige avaliação clínica, ela não inventa: orienta o paciente a falar com a equipe ou, em urgência, procurar o pronto-socorro. O médico define exatamente os limites do que ela pode dizer.",
  },
  {
    q: "Ela substitui a minha secretária?",
    a: "Não — ela tira da frente o repetitivo. Responder dúvidas comuns e marcar, cancelar e remarcar consultas a qualquer hora libera a secretária para o que exige gente: acolher quem chega, casos sensíveis, organização da clínica. Onde for preciso, o atendimento humano assume a conversa.",
  },
  {
    q: "Como ela marca na minha agenda sem dar choque de horário?",
    a: "A secretarIA só oferece horários dentro das janelas que você definiu e sincroniza com o Google Calendar em tempo real. Eventos criados direto no Google também bloqueiam horários para ela — a sincronização funciona nos dois sentidos.",
  },
  {
    q: "Os dados dos meus pacientes vão para uma IA fora do Brasil?",
    a: "A inteligência da conversa usa o Claude (Anthropic, EUA), com política de não treinar sobre dados de API e conformidade com a LGPD via cláusulas contratuais. O armazenamento permanente das conversas e agendamentos é exclusivamente em servidor brasileiro.",
  },
  {
    q: "Já tem lembrete automático, confirmação e campanhas?",
    a: "Ainda não — e preferimos ser honestos. Hoje a secretarIA faz quatro coisas bem feitas: conversar com o paciente, agendar, cancelar e remarcar. Lembretes, confirmação ativa e outras automações estão no nosso roteiro e entrarão como módulos adicionais, sem mexer no seu plano base.",
  },
  {
    q: "Como funciona a contratação?",
    a: "Começa com uma demonstração de 25 minutos usando o fluxo real da sua clínica. Fazendo sentido, configuramos a secretarIA com o seu contexto e rodamos um piloto antes de qualquer expansão. Modelos para médico autônomo, clínica e contratação pública via Lei 14.133/2021.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SecretariaPage() {
  return (
    <>
      <BrandHeader variant="secretaria" navLinks={NAV_LINKS} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-inner">
          {/* Left copy column */}
          <div className="hero-copy">
            <span className="eyebrow">Secretária com IA · no WhatsApp</span>
            <h1 className="display">
              Uma secretária que responde seus pacientes{" "}
              <span className="em">como se fosse você</span>.
            </h1>
            <p className="lead">
              A secretarIA atende no WhatsApp da clínica com o{" "}
              <strong>contexto que o médico configura</strong> — tira dúvidas
              no tom certo e agenda, cancela e remarca consultas sozinha. Sem
              app, sem fila, a qualquer hora.
            </p>
            <div className="hero-cta">
              <a className="btn btn--primary btn--lg" href="#contato">
                <BrandIcon name="whatsapp" />
                Agendar demonstração
              </a>
              <a className="btn btn--outline btn--lg" href="#como-funciona">
                Ver como funciona
              </a>
            </div>
            <div className="hero-trust">
              <div className="chip-row">
                <span className="chip">
                  <BrandIcon name="check" />
                  Direto no WhatsApp, sem app
                </span>
                <span className="chip">
                  <BrandIcon name="check" />
                  Responde no tom do médico
                </span>
                <span className="chip">
                  <BrandIcon name="check" />
                  Agenda sincronizada
                </span>
              </div>
            </div>
          </div>

          {/* Right — animated Phone mockup */}
          <Reveal>
            <Phone
              contactName="Consultório Dr. Aurélio"
              status="online"
              steps={WA_SECRETARIA}
              floatCards={[
                {
                  side: "br",
                  icon: "calendar",
                  title: "Consulta agendada",
                  value: "Amanhã · 09:00 — Primeira consulta",
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ── O PROBLEMA (dark band) ───────────────────────────────────────── */}
      <section className="section band-dark" id="problema">
        <div className="container">
          <Reveal>
            <div className="sec-head left" style={{ marginLeft: 0, marginRight: "auto" }}>
              <span className="eyebrow">O atrito de hoje</span>
              <h2 className="h-sec mt-s">
                Cada mensagem que fica{" "}
                <span className="em">sem resposta</span>
                <br />é uma consulta que não acontece.
              </h2>
              <p className="lead mt-s">
                Paciente manda mensagem a qualquer hora. A secretária não dá
                conta de tudo, e o que escapa custa caro: horário vago, dúvida
                sem resposta, a mesma pergunta repetida o dia inteiro.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-3">
            <Reveal>
              <div className="card">
                <div className="num-tag">01</div>
                <h3 className="h-card mt-m">Mensagem fora do horário</h3>
                <p className="muted mt-s" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                  O paciente decide marcar às 22h, no fim de semana, no caminho
                  do trabalho. A secretária só vê de manhã — e, às vezes, ele
                  já desistiu.
                </p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="card">
                <div className="num-tag">02</div>
                <h3 className="h-card mt-m">Secretária sobrecarregada</h3>
                <p className="muted mt-s" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                  Entre atender o balcão, o telefone e o WhatsApp, conversas se
                  acumulam. Responder todo mundo a tempo vira impossível em dia
                  cheio.
                </p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="card">
                <div className="num-tag">03</div>
                <h3 className="h-card mt-m">A mesma pergunta, o dia todo</h3>
                <p className="muted mt-s" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                  "Qual o endereço?", "atende meu convênio?", "quanto custa?".
                  Perguntas simples que se repetem e consomem o tempo de quem
                  deveria cuidar do paciente na clínica.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section className="section" id="como-funciona">
        <div className="container">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow eyebrow--center">Como funciona</span>
              <h2 className="h-sec mt-s">
                Você configura uma vez.{" "}
                <span className="em">Ela atende sempre.</span>
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                Do ajuste inicial à consulta marcada na sua agenda — sem você
                precisar tocar no WhatsApp.
              </p>
            </div>
          </Reveal>
          {/* steps class adds the connector line between steps */}
          <div className="grid grid-4 steps">
            <Reveal>
              <div className="step">
                <span className="feat-ico">
                  <BrandIcon name="sliders" />
                </span>
                <div className="num-tag" style={{ fontSize: 22, marginTop: 18 }}>01</div>
                <h3 className="h-card mt-s">O médico configura</h3>
                <p className="muted mt-s" style={{ fontSize: 14, lineHeight: 1.55 }}>
                  Texto de apresentação, dúvidas que ela deve resolver, tipos de
                  consulta e horários de atendimento. Em minutos, no painel.
                </p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="step">
                <span className="feat-ico">
                  <BrandIcon name="whatsapp" />
                </span>
                <div className="num-tag" style={{ fontSize: 22, marginTop: 18 }}>02</div>
                <h3 className="h-card mt-s">O paciente manda mensagem</h3>
                <p className="muted mt-s" style={{ fontSize: 14, lineHeight: 1.55 }}>
                  No WhatsApp da clínica, no ritmo dele. Sem baixar nada, sem
                  login, sem horário comercial.
                </p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="step">
                <span className="feat-ico">
                  <BrandIcon name="sparkle" />
                </span>
                <div className="num-tag" style={{ fontSize: 22, marginTop: 18 }}>03</div>
                <h3 className="h-card mt-s">A IA responde com o seu contexto</h3>
                <p className="muted mt-s" style={{ fontSize: 14, lineHeight: 1.55 }}>
                  Usa o que o médico definiu para responder com as informações e
                  o tom certos — como a secretária do consultório responderia.
                </p>
              </div>
            </Reveal>
            <Reveal delay={3}>
              <div className="step">
                <span className="feat-ico">
                  <BrandIcon name="calendar" />
                </span>
                <div className="num-tag" style={{ fontSize: 22, marginTop: 18 }}>04</div>
                <h3 className="h-card mt-s">Agenda, cancela ou remarca</h3>
                <p className="muted mt-s" style={{ fontSize: 14, lineHeight: 1.55 }}>
                  Marca a consulta com uma descrição do que é, e ajusta na
                  agenda sincronizada quando o paciente precisa mudar.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZAÇÃO ───────────────────────────────────────────────── */}
      <section
        className="section section--tight"
        id="personalizacao"
        style={{ background: "var(--page-grad)" }}
      >
        <div className="container">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow eyebrow--center">A diferença está aqui</span>
              <h2 className="h-sec mt-s">
                Não é um chatbot genérico.
                <br />É a <span className="em">sua secretária</span>, com o seu
                contexto.
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                O médico define a apresentação, o tom, as dúvidas a resolver, os
                tipos de consulta e as janelas de atendimento. A secretarIA
                responde como se o próprio médico estivesse respondendo.
              </p>
            </div>
          </Reveal>

          <div className="split">
            {/* Left — configuration card */}
            <Reveal>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Card header bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "16px 22px",
                    borderBottom: "1px solid var(--line)",
                    background: "var(--surface-2)",
                  }}
                >
                  <span
                    className="feat-ico"
                    style={{ width: 34, height: 34, borderRadius: 10 }}
                  >
                    <BrandIcon name="note" />
                  </span>
                  <strong style={{ fontSize: 14.5 }}>O que o médico configura</strong>
                  <span className="tag" style={{ marginLeft: "auto", fontSize: 11 }}>
                    Painel da secretarIA
                  </span>
                </div>
                {/* Config fields */}
                <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="cfg-field">
                    <span className="cfg-label">Apresentação</span>
                    <p className="cfg-val">
                      "Olá! Aqui é a secretária do Dr. Aurélio Lima, clínico
                      geral. Como posso ajudar você hoje?"
                    </p>
                  </div>
                  <div className="cfg-field">
                    <span className="cfg-label">Tom de voz e regras</span>
                    <p className="cfg-val">
                      Cordial e próximo, tratando por "você". Nunca dar
                      diagnóstico. Em urgência, orientar o pronto-socorro.
                    </p>
                  </div>
                  <div className="cfg-field">
                    <span className="cfg-label">Tipos de consulta</span>
                    <div className="cfg-pills">
                      <span className="tag">Primeira consulta · 60 min</span>
                      <span className="tag">Retorno · 30 min</span>
                      <span className="tag">Teleconsulta · 40 min</span>
                    </div>
                  </div>
                  <div className="cfg-field">
                    <span className="cfg-label">Disponibilidade</span>
                    <p className="cfg-val">
                      Seg–Sex · 08:00–12:00 e 14:00–18:00 · sincronizado com o
                      Google Calendar.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right — static WhatsApp chat (NOT the animated Phone component) */}
            <Reveal delay={1}>
              <div className="behav-arrow">
                <BrandIcon name="arrowR" /> Vira este atendimento
              </div>
              <div
                className="card"
                style={{ padding: 0, overflow: "hidden", background: "var(--wa-screen)" }}
              >
                {/* Chat header bar */}
                <div className="wa-bar" style={{ padding: "16px 18px", borderRadius: 0 }}>
                  <span className="wa-ava">A</span>
                  <div>
                    <div className="wa-title">Consultório Dr. Aurélio</div>
                    <div className="wa-status">online</div>
                  </div>
                </div>
                {/* Static bubbles — no animation; illustrates the configured output */}
                <div
                  className="wa-body"
                  style={{ minHeight: "auto", padding: "20px 16px", gap: 10, justifyContent: "flex-start" }}
                >
                  <div className="bub bub--out show">
                    Boa tarde! O Dr. atende plano Unimed?
                    <span className="time">14:02</span>
                  </div>
                  <div className="bub bub--in show">
                    Boa tarde! 😊 Sim, atendemos Unimed, Bradesco Saúde e
                    SulAmérica — e também particular. Você gostaria de agendar?
                    <span className="time">14:02</span>
                  </div>
                  <div className="bub bub--out show">
                    Sim, um retorno pra essa semana
                    <span className="time">14:03</span>
                  </div>
                  <div className="bub bub--in show">
                    Tenho <strong>quinta às 14:00</strong> ou{" "}
                    <strong>sexta às 15:30</strong> para retorno (30 min). Qual
                    prefere?
                    <span className="time">14:03</span>
                  </div>
                </div>
              </div>
              <p className="muted center mt-m" style={{ fontSize: 14 }}>
                Mesmas regras, mesmo tom, todas as conversas — sem você digitar
                nada.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ───────────────────────────────────────────────── */}
      <section className="section" id="funcionalidades">
        <div className="container">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow eyebrow--center">O que ela faz hoje</span>
              <h2 className="h-sec mt-s">
                Quatro coisas. <span className="em">Bem feitas.</span>
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                O essencial de uma secretária no WhatsApp, sem firula. Lembretes,
                marketing e outras automações ficam para depois — quando fizerem
                sentido para a sua clínica.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-2 feats">
            <Reveal>
              <div className="card">
                <span className="feat-ico">
                  <BrandIcon name="chat" />
                </span>
                <h3 className="h-card mt-m">Responde dúvidas dos pacientes</h3>
                <p className="muted mt-s" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  Conversas baseadas na configuração do médico — endereço,
                  convênios, valores, preparo, o que pode e o que não pode. No
                  tom definido por você, com naturalidade.
                </p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="card">
                <span className="feat-ico">
                  <BrandIcon name="calendar" />
                </span>
                <h3 className="h-card mt-m">Agenda consultas</h3>
                <p className="muted mt-s" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  Marca o horário dentro da sua disponibilidade e registra uma{" "}
                  <strong>descrição do assunto</strong> da consulta, para o
                  médico já saber do que se trata.
                </p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="card">
                <span className="feat-ico">
                  <BrandIcon name="ban" />
                </span>
                <h3 className="h-card mt-m">Cancela consultas</h3>
                <p className="muted mt-s" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  O paciente avisa pelo WhatsApp e a secretarIA libera o horário
                  na agenda na hora — sem ligação, sem horário vago de surpresa.
                </p>
              </div>
            </Reveal>
            <Reveal delay={3}>
              <div className="card">
                <span className="feat-ico">
                  <BrandIcon name="swap" />
                </span>
                <h3 className="h-card mt-m">Remarca consultas</h3>
                <p className="muted mt-s" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  Precisou mudar? Ela oferece os próximos horários livres e move
                  o agendamento, mantendo a descrição do que é a consulta.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PLANOS ────────────────────────────────────────────────────────── */}
      <section className="section" id="planos" style={{ background: "var(--page-grad)" }}>
        <div className="container">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow eyebrow--center">Planos</span>
              <h2 className="h-sec mt-s">
                Comece pelo essencial.{" "}
                <span className="em">Cresça quando quiser.</span>
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                Os planos abaixo refletem o escopo atual da secretarIA: conversa
                com os pacientes e gestão de agenda (marcar, cancelar e
                remarcar). Novos recursos chegam como módulos adicionais.
              </p>
              {/* Placeholder price warning — verbatim from HTML */}
              <p className="price-note center mt-s">
                ⚠︎ Valores de exemplo — substituir pelos preços reais antes de publicar.
              </p>
            </div>
          </Reveal>

          <div className="price-grid">
            <Reveal>
              <PriceCard
                name="Individual"
                tagline="Para o médico autônomo"
                amount="R$ —"
                unit="/mês · valor de exemplo"
                note="a partir de · editar"
                features={[
                  "1 número de WhatsApp",
                  "Respostas com o seu contexto",
                  "Agendar, cancelar e remarcar",
                  "Sincronização com Google Calendar",
                ]}
                ctaLabel="Falar com a Brain"
                ctaHref="#contato"
              />
            </Reveal>
            <Reveal delay={1}>
              <PriceCard
                name="Clínica"
                tagline="Para consultórios com mais de um médico"
                amount="R$ —"
                unit="/mês · valor de exemplo"
                note="a partir de · editar"
                features={[
                  "Tudo do plano Individual",
                  "Vários médicos e agendas",
                  "Configuração de tom por profissional",
                  "Implantação assistida",
                ]}
                ctaLabel="Agendar demonstração"
                ctaHref="#contato"
                featured
                flag="Mais comum"
              />
            </Reveal>
            <Reveal delay={2}>
              <PriceCard
                name="Rede / sob consulta"
                tagline="Para redes e setor público"
                amount="Sob consulta"
                note="valor de exemplo · editar"
                features={[
                  "Múltiplas unidades",
                  "Isolamento por clínica",
                  "Faturamento por nota fiscal",
                  "Suporte a processo licitatório",
                ]}
                ctaLabel="Falar com a Brain"
                ctaHref="#contato"
              />
            </Reveal>
          </div>

          {/* Closing note about add-on modules */}
          <p className="muted center mt-l" style={{ fontSize: 13.5 }}>
            Novos módulos (lembretes, confirmação ativa e mais) entram como
            add-ons à medida que forem lançados — sem mudar o seu plano base.
          </p>
        </div>
      </section>

      {/* ── SEGURANÇA (dark band) ────────────────────────────────────────── */}
      <section className="section band-dark" id="seguranca">
        <div className="container">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow eyebrow--center">Segurança &amp; LGPD</span>
              <h2 className="h-sec mt-s">
                Conversa de paciente é dado <span className="em">sensível</span>.
                <br />Tratamos como tal.
              </h2>
              <p className="lead mt-s" style={{ marginInline: "auto" }}>
                Conformidade com a Lei Geral de Proteção de Dados, a Resolução
                CFM 2.314/2022 e boas práticas de telemedicina — pela mesma
                engenharia que opera o PreCheck.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-4">
            <Reveal>
              <div className="card-soft">
                <span className="feat-ico" style={{ width: 38, height: 38 }}>
                  <BrandIcon name="whatsapp" />
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                  WhatsApp Business API oficial
                </h3>
                <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                  Integração pela Meta Cloud API homologada — nada de números
                  clonados ou apps não oficiais.
                </p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="card-soft">
                <span className="feat-ico" style={{ width: 38, height: 38 }}>
                  <BrandIcon name="lock" />
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                  Criptografia em trânsito e repouso
                </h3>
                <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                  Tráfego protegido por TLS 1.3 e dados em repouso criptografados
                  no banco.
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
                  Tenancy lógico: uma clínica nunca vê os pacientes da outra.
                  Auditoria por conversa.
                </p>
              </div>
            </Reveal>
            <Reveal delay={3}>
              <div className="card-soft">
                <span className="feat-ico" style={{ width: 38, height: 38 }}>
                  <BrandIcon name="server" />
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 14 }}>
                  Servidor brasileiro
                </h3>
                <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                  Armazenamento em datacenter no Brasil. Consentimento explícito
                  e DPO designado.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Technology strip */}
          <div className="mt-l" style={{ marginTop: 48 }}>
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
                <BrandIcon name="calendar" />
                Google Calendar API
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

      {/* ── POR QUE WHATSAPP ──────────────────────────────────────────────── */}
      <section className="section" id="whatsapp">
        <div className="container split">
          {/* Left — stats + rationale */}
          <Reveal>
            <span className="eyebrow">Por que WhatsApp</span>
            <h2 className="h-sec mt-s">
              O canal que <span className="em">todo brasileiro</span> já abriu
              hoje.
            </h2>
            <p className="lead mt-s">
              Um app exigiria download, conta, senha esquecida, atualização. O
              WhatsApp já está instalado, já tem credenciais, já é familiar —
              funciona para todo paciente, do mais jovem ao mais idoso.
            </p>
            {/* Two stats */}
            <div className="grid grid-2 mt-l" style={{ gap: 28 }}>
              <div>
                <div className="serif-num" style={{ fontSize: 54, color: "var(--brand)" }}>
                  99%
                </div>
                <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                  dos brasileiros conectados usam WhatsApp todos os dias.
                  <br />
                  <span className="faint">DataReportal, 2024</span>
                </p>
              </div>
              <div>
                <div className="serif-num" style={{ fontSize: 54, color: "var(--brand)" }}>
                  147<span style={{ fontSize: 24 }}> min</span>
                </div>
                <p className="muted mt-s" style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                  tempo médio diário no WhatsApp — entre os apps mais usados do
                  país.
                  <br />
                  <span className="faint">Statista, 2024</span>
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right — "what the patient does NOT need to do" card */}
          <Reveal delay={1}>
            <div className="card">
              <div
                className="faint"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                O que o paciente NÃO precisa fazer
              </div>
              <ul className="tick-list">
                <li className="no">
                  <BrandIcon name="x" />
                  Baixar um aplicativo
                </li>
                <li className="no">
                  <BrandIcon name="x" />
                  Criar conta e senha
                </li>
                <li className="no">
                  <BrandIcon name="x" />
                  Confirmar e-mail
                </li>
                <li className="no">
                  <BrandIcon name="x" />
                  Permitir notificações
                </li>
                <li className="no">
                  <BrandIcon name="x" />
                  Esperar o horário comercial
                </li>
              </ul>
              <div className="divider-soft" style={{ margin: "20px 0" }} />
              <div className="alert-line alert-line--green">
                <span className="dot dot--green" />
                Só abrir a conversa e escrever, como faz todo dia.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="section" id="faq" style={{ background: "var(--page-grad)" }}>
        <div className="container">
          <Reveal>
            <div className="sec-head center">
              <span className="eyebrow eyebrow--center">Perguntas frequentes</span>
              <h2 className="h-sec mt-s">
                Respostas honestas pras perguntas{" "}
                <span className="em">que importam</span>.
              </h2>
            </div>
          </Reveal>
          <Reveal>
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      {/* ── CONTATO ───────────────────────────────────────────────────────── */}
      <section className="section" id="contato">
        <div className="container split">
          {/* Left — pitch copy */}
          <Reveal>
            <span className="eyebrow">Vamos conversar</span>
            <h2 className="h-sec mt-s">
              Quer ver a secretarIA atendendo{" "}
              <span className="em">no WhatsApp da sua clínica</span>?
            </h2>
            <p className="lead mt-s">
              Demonstração de 25 minutos com um caso real do seu fluxo.
              Configuramos o tom e as regras do seu consultório na hora. Sem
              compromisso, sem proposta empurrada.
            </p>
            <ul className="tick-list mt-l">
              <li className="ok">
                <BrandIcon name="check" />
                Atendimento no tom do seu consultório
              </li>
              <li className="ok">
                <BrandIcon name="check" />
                Agenda sincronizada de ponta a ponta
              </li>
              <li className="ok">
                <BrandIcon name="check" />
                Implantação assistida pela equipe Brain
              </li>
            </ul>
          </Reveal>

          {/* Right — contact form (client component) */}
          <Reveal delay={1}>
            <ContactForm variant="secretaria" />
          </Reveal>
        </div>
      </section>

      <BrandFooter variant="secretaria" />
    </>
  );
}
