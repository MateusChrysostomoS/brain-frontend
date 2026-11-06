// Product vignettes — small, accurate pictures of what the products do, built
// in HTML/CSS instead of screenshots so they theme with the page and stay sharp.
//
// Everything in them is fictional and illustrative: patient names, times, the
// clinic. No metric, count or result is shown as if it were real. Each one is a
// single role="img" with a plain-language label, so a screen reader hears one
// sentence instead of a fake inbox.

import type { CSSProperties, ReactNode } from "react";
import { BrandGlyph } from "@/app/(site)/_components/BrandGlyph";
import { BrandIcon } from "@/app/(site)/_components/BrandIcon";
import { PreCheckMark } from "./brand";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

// ---------------------------------------------------------------------------
// Portal: inbox + a conversation where the secretarIA books an appointment.
// ---------------------------------------------------------------------------

type Conv = {
  initials: string;
  name: string;
  preview: string;
  time: string;
  chip?: { kind: "bot" | "human" | "pc"; label: ReactNode };
  current?: boolean;
};

const CONVERSATIONS: Conv[] = [
  {
    initials: "AR",
    name: "Ana Paula R.",
    preview: "Quarta às 14h30 está ótimo.",
    time: "09:42",
    chip: { kind: "bot", label: "secretarIA" },
    current: true,
  },
  {
    initials: "CM",
    name: "Carlos M.",
    preview: "Vocês atendem pelo meu convênio?",
    time: "09:31",
    chip: { kind: "human", label: "Com a equipe" },
  },
  {
    initials: "MS",
    name: "Mariana S.",
    preview: "Pré-consulta concluída",
    time: "09:12",
    chip: { kind: "pc", label: "PreCheck" },
  },
  {
    initials: "JL",
    name: "Joana L.",
    preview: "Consegue passar para quinta?",
    time: "08:55",
    chip: { kind: "bot", label: "secretarIA" },
  },
  {
    initials: "RA",
    name: "Roberto A.",
    preview: "Obrigado, até amanhã.",
    time: "Ontem",
  },
];

export function PortalWindow() {
  return (
    <div
      className="mk-win"
      role="img"
      aria-label="Ilustração do Portal Brain: no chat da clínica, a secretarIA oferece horários a uma paciente, marca a consulta escolhida e o evento é criado no Google Agenda."
    >
      <div className="mk-win__bar">
        <span className="mk-win__brand">
          <BrandGlyph size={18} />
          Portal Brain
        </span>
        <span className="mk-win__tabs">
          <span className="mk-win__tab" aria-current="true">
            Conversas
          </span>
          <span className="mk-win__tab">Agenda</span>
          <span className="mk-win__tab">Anamneses</span>
        </span>
        <span className="mk-win__clinic mk-hide-sm">
          <span className="mk-avatar">CE</span>
          Clínica Exemplo
        </span>
      </div>

      <div className="mk-win__body">
        <div className="mk-inbox">
          <div className="mk-inbox__head">
            Conversas <span>Hoje</span>
          </div>
          {CONVERSATIONS.map((c) => (
            <div key={c.name} className="mk-conv" aria-current={c.current ? "true" : undefined}>
              <span className="mk-avatar mk-avatar--lg">{c.initials}</span>
              <div style={{ minWidth: 0 }}>
                <div className="mk-conv__top">
                  <span className="mk-conv__name">{c.name}</span>
                  <span className="mk-conv__time">{c.time}</span>
                </div>
                <div className="mk-conv__preview">{c.preview}</div>
                {c.chip && <span className={`mk-chip mk-chip--${c.chip.kind}`}>{c.chip.label}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mk-thread">
          <div className="mk-thread__head">
            <span className="mk-avatar mk-avatar--lg">AR</span>
            <div className="mk-thread__who">
              <div className="mk-thread__name">Ana Paula R.</div>
              <div className="mk-thread__sub">
                <span className="mk-dot mk-dot--live" aria-hidden="true" />
                Chat da clínica · atendida pela secretarIA
              </div>
            </div>
          </div>
          {/* data-play="run": above the fold, so the booking plays once on load
              (CSS only). Reduced motion shows it complete. */}
          <div className="mk-thread__msgs" data-play="run">
            <div className="mk-msg mk-msg--in" style={order(0)}>
              Oi! Queria marcar uma consulta com a Dra. Helena. Pode ser na semana que vem?
            </div>
            <div className="mk-msg mk-msg--out" style={order(1)}>
              <span className="mk-msg__who">secretarIA</span>
              Olá, Ana Paula! A Dra. Helena tem horário na terça às 9h, na quarta às 14h30 ou na
              sexta às 11h. Qual fica melhor?
            </div>
            <div className="mk-msg mk-msg--in" style={order(2)}>
              Quarta às 14h30 está ótimo.
            </div>
            <div className="mk-msg mk-msg--out" style={order(3)}>
              <span className="mk-msg__who">secretarIA</span>
              Pronto, está marcado: quarta, às 14h30, com a Dra. Helena. Vou te lembrar na véspera.
            </div>
            <div className="mk-event" style={order(4)}>
              <BrandIcon name="calendar" />
              Consulta criada no Google Agenda · qua, 14:30
            </div>
          </div>
          <div className="mk-thread__composer">
            <BrandIcon name="chat" size={15} />
            Escreva uma mensagem para Ana Paula…
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PreCheck: the summary the doctor reads before calling the patient in.
// ---------------------------------------------------------------------------

export function SummaryCard() {
  return (
    <div
      className="mk-sum"
      role="img"
      aria-label="Ilustração de um resumo de pré-consulta do PreCheck: sinais de alarme em vermelho, amarelo e verde no topo, seguidos da queixa principal, antecedentes, medicações, alergias e hábitos."
    >
      <div className="mk-sum__bar">
        <PreCheckMark />
        <span>Resumo da pré-consulta</span>
      </div>
      <div className="mk-sum__patient">
        <span className="mk-avatar mk-avatar--lg">MS</span>
        <div>
          <strong>Mariana S., 34 anos</strong>
          <span>Consulta hoje, 10:30 · Dra. Helena</span>
        </div>
      </div>
      <div className="mk-sum__block">
        <div className="mk-sum__k">Sinais de alarme</div>
        <div className="mk-alerts">
          <span className="mk-alert mk-alert--red">Relata rigidez no pescoço</span>
          <span className="mk-alert mk-alert--amber">Analgésico em 5 dos últimos 7 dias</span>
          <span className="mk-alert mk-alert--green">Sem febre e sem alteração visual</span>
        </div>
      </div>
      <div className="mk-sum__block">
        <div className="mk-sum__k">Queixa principal</div>
        <p className="mk-sum__v">
          Dor de cabeça há 4 dias, em crises à tarde, que piora com luz forte. Náusea ontem.
        </p>
      </div>
      <div className="mk-sum__block">
        <div className="mk-sum__grid">
          <div>
            <div className="mk-sum__k">Antecedentes</div>
            <p className="mk-sum__v">Enxaqueca desde os 16 anos</p>
          </div>
          <div>
            <div className="mk-sum__k">Medicações</div>
            <p className="mk-sum__v">Dipirona, quando tem dor</p>
          </div>
          <div>
            <div className="mk-sum__k">Alergias</div>
            <p className="mk-sum__v">Nega</p>
          </div>
          <div>
            <div className="mk-sum__k">Hábitos</div>
            <p className="mk-sum__v">Sono irregular</p>
          </div>
        </div>
      </div>
      <div className="mk-sum__foot">
        Organizado a partir das respostas da paciente, para revisão do médico.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PreCheck, patient side: the guided conversation that produces the summary.
// ---------------------------------------------------------------------------

export function PatientConversation() {
  return (
    <div
      className="mk-qa"
      role="img"
      aria-label="Ilustração da pré-consulta do PreCheck, do lado da paciente: perguntas que se aprofundam conforme as respostas sobre uma dor de cabeça."
    >
      <div className="mk-qa__bar">
        <img src="/brand/precheck-logo.png" alt="" className="mk-pc-logo" width={22} height={22} />
        <div style={{ minWidth: 0 }}>
          <strong>Pré-consulta</strong>
          <span>Dra. Helena · hoje, 10:30</span>
        </div>
        <span className="mk-qa__progress" aria-hidden="true">
          <i />
        </span>
      </div>
      <div className="mk-thread__msgs">
        <div className="mk-msg mk-msg--in" style={order(0)}>
          Olá, Mariana! Antes da consulta, vou fazer algumas perguntas para a Dra. Helena já
          chegar sabendo do seu caso.
        </div>
        <div className="mk-msg mk-msg--in" style={order(1)}>
          O que te traz à consulta?
        </div>
        <div className="mk-msg mk-msg--out" style={order(2)}>
          Dor de cabeça forte há uns 4 dias.
        </div>
        <div className="mk-msg mk-msg--in" style={order(3)}>
          A dor vem em crises ou é contínua? Alguma coisa piora, como luz, barulho ou esforço?
        </div>
        <div className="mk-msg mk-msg--out" style={order(4)}>
          Vem em crises, mais à tarde. Luz forte piora, e ontem tive enjoo.
        </div>
        <div className="mk-msg mk-msg--in" style={order(5)}>
          Entendi. Nesses dias você teve febre ou sentiu o pescoço rígido?
        </div>
      </div>
      <div className="mk-thread__composer">
        <BrandIcon name="chat" size={15} />
        Digite sua resposta…
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// secretarIA: the week in the clinic's Google Agenda after the booking.
// ---------------------------------------------------------------------------

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const HOURS = ["08h", "09h", "10h", "11h", "14h", "15h", "16h"];

type Ev = {
  day: number; // 0 = Seg
  hour: number; // index into HOURS
  title: string;
  sub?: string;
  kind?: "new" | "moved";
};

const EVENTS: Ev[] = [
  { day: 0, hour: 0, title: "Consulta" },
  { day: 0, hour: 2, title: "Retorno" },
  { day: 1, hour: 1, title: "Consulta" },
  { day: 1, hour: 3, title: "Consulta" },
  { day: 1, hour: 5, title: "Joana L.", sub: "remarcada", kind: "moved" },
  { day: 2, hour: 2, title: "Retorno" },
  { day: 2, hour: 4, title: "Ana Paula R.", sub: "14:30 · nova", kind: "new" },
  { day: 3, hour: 0, title: "Consulta" },
  { day: 3, hour: 5, title: "Joana L.", sub: "15:00" },
  { day: 3, hour: 3, title: "Retorno" },
  { day: 4, hour: 1, title: "Consulta" },
  { day: 4, hour: 4, title: "Consulta" },
  { day: 4, hour: 6, title: "Retorno" },
];

// Mon (0) and Fri (4) collapse on phones; Tue–Thu carry the story.
const sideDay = (day: number) => (day === 0 || day === 4 ? " mk-hide-sm" : "");

export function AgendaWeek() {
  return (
    <div
      className="mk-agenda"
      role="img"
      aria-label="Ilustração da agenda semanal de uma médica, sincronizada com o Google Agenda: a consulta marcada pela secretarIA aparece na quarta às 14h30, e uma consulta remarcada passou de terça para quinta."
    >
      <div className="mk-agenda__bar">
        <span className="mk-fact__ico" style={{ width: 34, height: 34 }}>
          <BrandIcon name="calendar" />
        </span>
        <div>
          <strong>Agenda da Dra. Helena</strong>
          <span>Google Agenda da clínica · marcações feitas pela secretarIA</span>
        </div>
      </div>

      <div className="mk-agenda__grid">
        <span style={{ gridColumn: 1, gridRow: 1, borderBottom: "1px solid var(--mk-line)" }} />
        {DAYS.map((d, i) => (
          <span
            key={d}
            className={"mk-agenda__day" + sideDay(i)}
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            {d}
          </span>
        ))}
        {HOURS.map((h, r) => (
          <span key={h} className="mk-agenda__hour" style={{ gridRow: r + 2 }}>
            {h}
          </span>
        ))}
        {HOURS.flatMap((h, r) =>
          DAYS.map((d, c) => (
            <span
              key={`${h}-${d}`}
              className={"mk-agenda__cell" + sideDay(c)}
              style={{ gridColumn: c + 2, gridRow: r + 2 }}
            />
          )),
        )}
        {EVENTS.map((e) => (
          <span
            key={`${e.day}-${e.hour}`}
            className={"mk-ev" + (e.kind ? ` mk-ev--${e.kind}` : "") + sideDay(e.day)}
            style={{ gridColumn: e.day + 2, gridRow: e.hour + 2 }}
          >
            <strong>{e.title}</strong>
            {e.sub}
          </span>
        ))}
      </div>

      <div className="mk-agenda__foot">
        <BrandIcon name="bell" />
        Lembrete enviado a Carlos M. · consulta amanhã, 09:00
      </div>
    </div>
  );
}
