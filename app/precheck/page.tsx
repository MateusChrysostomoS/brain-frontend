// PreCheck marketing landing — moved from / to /precheck (the new / is the Brain
// umbrella home). The PreCheck global + landing stylesheets are imported here
// (route-scoped) so they load only for this page, not the Brain (site) routes.
import "../globals.css";
import "../landing.css";
import type { Metadata } from "next";

// PreCheck landing keeps its own tab title (root metadata is Brain-branded).
export const metadata: Metadata = {
  title: "PreCheck — Pré-consulta no WhatsApp",
  description:
    "Pré-consulta automatizada via WhatsApp para clínicas brasileiras. Para que o tempo de consulta seja consulta.",
};

import FeaturesCarousel from "@/components/landing/FeaturesCarousel";
import Faq from "@/components/landing/Faq";
import ContactForm from "@/components/landing/ContactForm";
import LandingNav from "@/components/landing/LandingNav";
import WorkflowDemo from "@/components/landing/WorkflowDemo";

export default function LandingPage() {
  return (
    <div id="landing-view" className="view active">
      <LandingNav />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1>
                A anamnese acontece <em>antes</em> da consulta.
              </h1>
              <p className="hero-sub">
                PreCheck conduz a anamnese pré-consulta pelo WhatsApp. O médico define o
                roteiro e o formato do resumo — e recebe tudo estruturado, com sinais de
                alarme destacados, antes do atendimento começar.
              </p>
              <div className="hero-actions">
                <a href="#contato" className="btn btn-primary">
                  Agendar demonstração
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
                <a href="#como-funciona" className="btn btn-ghost">
                  Ver como funciona
                </a>
              </div>
              <div className="hero-meta">
                <span className="hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Sem app, direto no WhatsApp
                </span>
                <span className="hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Conformidade LGPD
                </span>
                <span className="hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Implantação assistida
                </span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card-float top">
                <div className="label">Tempo de anamnese</div>
                <div className="value" style={{ fontSize: "22px" }}>
                  Recuperado
                  <small style={{ display: "block", marginLeft: 0, marginTop: "2px" }}>
                    a cada consulta
                  </small>
                </div>
              </div>

              <div className="phone">
                <div className="phone-notch" />
                <div className="phone-screen">
                  <div className="wa-header">
                    <div className="wa-avatar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="wa-headtxt">
                      <h4>PreCheck</h4>
                      <p>online</p>
                    </div>
                  </div>
                  <WorkflowDemo />
                  <div className="wa-input">
                    <div className="wa-input-field">Digite sua resposta...</div>
                    <div className="wa-input-send">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-card-float bottom">
                <div className="label">Resumo entregue</div>
                <div className="summary-row">
                  <span className="alert-dot amber" />
                  <span style={{ fontSize: "13px", color: "var(--ink-2)", fontWeight: 500 }}>
                    Cefaleia - 4 dias - fotofobia
                  </span>
                </div>
                <div className="summary-row">
                  <span className="alert-dot" />
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                    Sem sinais de alarme
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="problem" id="problema">
        <div className="container">
          <span className="eyebrow">O atrito de hoje</span>
          <h2>
            A consulta começa <em>perdendo tempo</em>
            <br />
            com perguntas que poderiam estar respondidas.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "#b8c1c8",
              maxWidth: "640px",
              lineHeight: 1.55,
              marginTop: "8px",
            }}
          >
            Boa parte de cada consulta é gasta coletando informações que o paciente já
            sabia em casa, com calma. No consultório, ele esquece datas, doses, exames
            recentes. O médico abre o prontuário no escuro.
          </p>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-card-num">01</div>
              <h3>Tempo de consulta consumido</h3>
              <p>
                Quase metade do tempo é gasto coletando informações que o paciente já
                tinha — antes mesmo de o exame clínico começar.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-card-num">02</div>
              <h3>Paciente esquece detalhes</h3>
              <p>
                Sem pressa, em casa, no WhatsApp, ele lembra do nome do remédio, da data
                do exame, da cirurgia que fez. No consultório, esquece.
              </p>
            </div>
            <div className="problem-card">
              <div className="problem-card-num">03</div>
              <h3>Médico sem contexto prévio</h3>
              <p>
                Sem saber a queixa, sem ver os exames, sem histórico organizado — cada
                consulta começa do zero, mesmo que o paciente já tenha vindo antes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how" id="como-funciona">
        <div className="container-narrow">
          <div className="section-head">
            <span className="eyebrow">Como funciona</span>
            <h2>
              Quatro passos. <em>Zero atrito</em> para o paciente.
            </h2>
            <p>
              Da chegada do paciente ao resumo no celular do médico — poucos minutos de
              conversa, distribuídos no tempo do paciente.
            </p>
          </div>
        </div>
        <div className="container">
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-num">01</div>
              <div className="how-step-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="6" y="6" width="1.5" height="1.5" fill="currentColor" stroke="none" />
                  <rect x="17" y="6" width="1.5" height="1.5" fill="currentColor" stroke="none" />
                  <rect x="6" y="17" width="1.5" height="1.5" fill="currentColor" stroke="none" />
                  <path d="M14 14h2v2M18 14v2h-2M14 18h2M20 14v3M20 20v1M14 20h1M18 20h3" />
                </svg>
              </div>
              <h3>Paciente escaneia</h3>
              <p>
                QR code da clínica, no balcão, na confirmação ou no SMS de lembrete.
                Direciona para o WhatsApp.
              </p>
              <div className="how-step-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-num">02</div>
              <div className="how-step-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-5.4A8 8 0 1 1 21 12Z" />
                  <path d="M9 11h0M12 11h0M15 11h0" />
                </svg>
              </div>
              <h3>Conversa guiada por IA</h3>
              <p>
                O paciente responde no próprio ritmo — em casa, na sala de espera, onde
                estiver. Sem app, sem login.
              </p>
              <div className="how-step-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-num">03</div>
              <div className="how-step-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 5v0a3 3 0 0 0 3 3h0a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                  <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 5v0a3 3 0 0 1-3 3h0a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                </svg>
              </div>
              <h3>Aprofundamento clínico</h3>
              <p>
                A IA aprofunda automaticamente baseado na queixa principal e em sinais
                clínicos relevantes.
              </p>
              <div className="how-step-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-num">04</div>
              <div className="how-step-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                  <path d="M14 3v5h5M9 13h6M9 17h4" />
                </svg>
              </div>
              <h3>Resumo entregue</h3>
              <p>
                O médico recebe um resumo estruturado — QP, HDA, HPP, hábitos, ROS —
                minutos antes da consulta.
              </p>
              <div className="how-step-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="ba" id="antes-depois">
        <div className="container-narrow">
          <div className="section-head">
            <span className="eyebrow">O que muda na consulta</span>
            <h2>
              O médico chega à consulta <em>já sabendo o caso</em>.
            </h2>
          </div>
        </div>
        <div className="container">
          <div className="ba-grid">
            <div className="ba-col ba-before">
              <div className="ba-tag">Sem PreCheck</div>
              <ul>
                <li>
                  <span className="ba-x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Médico lê apenas o nome no painel da agenda
                </li>
                <li>
                  <span className="ba-x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Anamnese começa do zero a cada atendimento
                </li>
                <li>
                  <span className="ba-x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Paciente esquece datas, doses, exames
                </li>
                <li>
                  <span className="ba-x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Sinais de alarme aparecem (ou não) no meio da conversa
                </li>
              </ul>
            </div>
            <div className="ba-col ba-after">
              <div className="ba-tag ba-tag-on">Com PreCheck</div>
              <ul>
                <li>
                  <span className="ba-c">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  Médico abre resumo de 30s no celular antes de chamar
                </li>
                <li>
                  <span className="ba-c">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  Queixa principal, HDA, HPP e hábitos já estruturados
                </li>
                <li>
                  <span className="ba-c">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  Exames enviados em foto já transcritos e estruturados
                </li>
                <li>
                  <span className="ba-c">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  Alertas em vermelho/amarelo destacados no topo
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="recursos">
        <div className="container-narrow">
          <div className="section-head">
            <span className="eyebrow">Funcionalidades</span>
            <h2>
              Não é um <em>chatbot genérico</em>. É pré-consulta clínica.
            </h2>
            <p>
              Você decide as perguntas e como o resumo chega. A IA conduz a conversa. O
              paciente responde no WhatsApp.
            </p>
          </div>
        </div>
        <FeaturesCarousel />
      </section>

      {/* Personas */}
      <section className="personas" id="para-quem">
        <div className="container-narrow">
          <div className="section-head">
            <span className="eyebrow">Para quem é</span>
            <h2>
              Três perfis. <em>Mesma necessidade</em>.
            </h2>
            <p>
              Recuperar tempo de consulta, melhorar a qualidade do registro e dar
              contexto ao médico antes do atendimento.
            </p>
          </div>
        </div>
        <div className="container">
          <div className="persona-grid">
            <div className="persona">
              <div className="persona-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: "6px" }}>
                  <rect x="4" y="3" width="16" height="18" rx="1.5" />
                  <path d="M9 7h0M9 11h0M9 15h0M15 7h0M15 11h0M15 15h0M10 21v-3h4v3" />
                </svg>
                Clínicas privadas
              </div>
              <h3>
                Atenda com mais profundidade clínica sem aumentar o tempo de consulta.
              </h3>
              <p>
                Da clínica de família ao multi-especialidades com 15 médicos. Implantação
                em 7 dias, treinamento da secretaria incluído.
              </p>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Configuração do QR code por unidade
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Painel da secretaria para acompanhar
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Cobrança por unidade ou por agenda
                </li>
              </ul>
            </div>
            <div className="persona">
              <div className="persona-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: "6px" }}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
                Médicos autônomos
              </div>
              <h3>
                Tenha o nível de pré-consulta de uma clínica grande — sozinho.
              </h3>
              <p>
                Configuração individual em minutos. Sem custo de implantação. Cancele
                quando quiser.
              </p>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  QR code pessoal, vinculado ao seu CRM
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Resumo direto no painel PreCheck
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Plano mensal sem fidelidade
                </li>
              </ul>
            </div>
            <div className="persona">
              <div className="persona-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-2px", marginRight: "6px" }}>
                  <path d="M3 21V8l6-4 6 4v13" />
                  <path d="M15 21V12h6v9M3 21h18" />
                  <path d="M7 11h0M7 15h0M11 11h0M11 15h0M18 16h0" />
                </svg>
                Secretarias municipais
              </div>
              <h3>
                Padronize anamnese em UBSs e meça qualidade do atendimento por unidade.
              </h3>
              <p>
                Compatível com Lei 14.133/2021. Faturamento por nota fiscal contra
                empenho. Suporte para processo licitatório.
              </p>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Implantação por unidade de saúde
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Relatórios de gestão por bairro
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  Hospedagem em servidor brasileiro
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why WhatsApp */}
      <section className="why-wa" id="whatsapp">
        <div className="container">
          <div className="why-wa-grid">
            <div>
              <span className="eyebrow">Por que WhatsApp</span>
              <h2
                className="serif"
                style={{
                  fontSize: "clamp(34px,4.4vw,54px)",
                  letterSpacing: "-0.022em",
                  lineHeight: 1.05,
                  marginTop: "18px",
                  marginBottom: "18px",
                  textWrap: "balance",
                }}
              >
                O canal que{" "}
                <em style={{ fontStyle: "italic", color: "var(--teal)" }}>
                  todo brasileiro
                </em>{" "}
                já abriu hoje.
              </h2>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--muted)",
                  lineHeight: 1.55,
                  textWrap: "pretty",
                }}
              >
                Construir um app exigiria download, conta, senha esquecida, atualização.
                WhatsApp já está instalado, já tem credenciais, já é familiar — funciona
                para todos os públicos, do paciente jovem ao mais idoso.
              </p>
              <div className="why-wa-stats">
                <div className="why-wa-stat">
                  <div className="num">
                    <em>99%</em>
                  </div>
                  <div className="label">
                    dos brasileiros conectados usam WhatsApp todos os dias.
                  </div>
                  <div className="source">DataReportal, 2024</div>
                </div>
                <div className="why-wa-stat">
                  <div className="num">
                    147
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "22px" }}>
                      min
                    </span>
                  </div>
                  <div className="label">
                    tempo médio diário no WhatsApp — entre os apps mais usados do país.
                  </div>
                  <div className="source">Statista, 2024</div>
                </div>
              </div>
            </div>
            <div className="why-wa-visual">
              <ul className="zero-friction-list">
                <li className="strike">
                  <span className="x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Baixar app
                </li>
                <li className="strike">
                  <span className="x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Criar conta e senha
                </li>
                <li className="strike">
                  <span className="x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Confirmar email
                </li>
                <li className="strike">
                  <span className="x">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  Permitir notificações
                </li>
                <li>
                  <span className="check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  </span>
                  Escanear o QR e responder
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="security" id="seguranca">
        <div className="container-narrow">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Segurança &amp; LGPD</span>
            <h2>
              Dado de saúde é dado <em>sensível</em>.
              <br />
              Tratamos como tal.
            </h2>
            <p>
              Conformidade com a Lei Geral de Proteção de Dados, Resolução CFM 2.314/2022
              e boas práticas de telemedicina.
            </p>
          </div>
        </div>
        <div className="container">
          <div className="security-grid">
            <div className="security-card">
              <div className="security-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </div>
              <h3>Criptografia em trânsito e em repouso</h3>
              <p>
                Tráfego protegido por TLS 1.3. Dados em repouso criptografados no banco.
                Senhas de serviço derivadas e nunca armazenadas em claro.
              </p>
            </div>
            <div className="security-card">
              <div className="security-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              </div>
              <h3>Consentimento explícito</h3>
              <p>
                Antes da primeira pergunta, o paciente aceita o termo. Registro auditável.
              </p>
            </div>
            <div className="security-card">
              <div className="security-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l9 5-9 5-9-5z" />
                  <path d="M3 13l9 5 9-5M3 18l9 5 9-5" />
                </svg>
              </div>
              <h3>Isolamento por clínica</h3>
              <p>
                Tenancy lógico. Médico A não vê paciente da clínica B. Auditoria por
                consulta.
              </p>
            </div>
            <div className="security-card">
              <div className="security-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="7" rx="2" />
                  <rect x="3" y="13" width="18" height="7" rx="2" />
                  <path d="M7 7.5h0M7 16.5h0" />
                </svg>
              </div>
              <h3>Servidor brasileiro</h3>
              <p>
                Hospedagem em datacenter no Brasil. Sem trânsito internacional
                desnecessário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech strip */}
      <section className="tech">
        <div className="container">
          <div className="tech-inner">
            <span className="tech-label">Sob o capô</span>
            <div className="tech-items">
              <span className="tech-item">
                <span className="mk">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                    <path d="M5.6 5.6l3 3M15.4 15.4l3 3M5.6 18.4l3-3M15.4 8.6l3-3" />
                  </svg>
                </span>
                IA da Anthropic (Claude)
              </span>
              <span className="tech-item">
                <span className="mk">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-5.4A8 8 0 1 1 21 12Z" />
                    <path d="M9 11h0M12 11h0M15 11h0" />
                  </svg>
                </span>
                WhatsApp Business API oficial (Meta Cloud)
              </span>
              <span className="tech-item">
                <span className="mk">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="7" rx="2" />
                    <rect x="3" y="13" width="18" height="7" rx="2" />
                    <path d="M7 7.5h0M7 16.5h0" />
                  </svg>
                </span>
                Infraestrutura em servidor brasileiro
              </span>
              <span className="tech-item">
                <span className="mk">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                Conformidade LGPD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container-narrow">
          <div className="section-head">
            <span className="eyebrow">Perguntas frequentes</span>
            <h2>
              Respostas honestas pras perguntas <em>que importam</em>.
            </h2>
          </div>
          <Faq />
        </div>
      </section>

      {/* Final CTA + Form */}
      <section className="final-cta" id="contato">
        <div className="container-narrow final-cta-inner">
          <span className="eyebrow" style={{ marginBottom: "14px", display: "block" }}>
            Vamos conversar
          </span>
          <h2>
            Quer ver o PreCheck rodando <em>no seu serviço</em>?
          </h2>
          <p>
            Demonstração de 25 minutos com um caso real do seu fluxo. Sem compromisso, sem
            proposta empurrada.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#" className="brand">
                <span className="brand-name">
                  Pre<span style={{ color: "var(--teal-2)" }}>Check</span>
                </span>
              </a>
              <p className="footer-about">
                Pré-consulta automatizada via WhatsApp para clínicas brasileiras. Para que
                o tempo de consulta seja consulta.
              </p>
            </div>
            <div className="footer-col">
              <h4>Produto</h4>
              <ul>
                <li>
                  <a href="#como-funciona">Como funciona</a>
                </li>
                <li>
                  <a href="#recursos">Recursos</a>
                </li>
                <li>
                  <a href="#para-quem">Para quem é</a>
                </li>
                <li>
                  <a href="#seguranca">Segurança</a>
                </li>
                <li>
                  <a href="#faq">Perguntas frequentes</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <ul>
                <li>
                  <a href="#contato">Contato</a>
                </li>
                <li>
                  <a href="#">Setor público</a>
                </li>
                <li>
                  <a href="#">Imprensa</a>
                </li>
                <li>
                  <a href="#">Carreiras</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li>
                  <a href="#">Termos de uso</a>
                </li>
                <li>
                  <a href="#">Política de privacidade</a>
                </li>
                <li>
                  <a href="#">LGPD &amp; DPO</a>
                </li>
                <li>
                  <a href="#">Status</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 PreCheck. Todos os direitos reservados.</span>
            <span className="cnpj">
              PMB Consultoria e Assessoria Empresarial e Projetos LTDA
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
