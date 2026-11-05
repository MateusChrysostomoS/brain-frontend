// PreCheckDemo — act 2 of the guided demo: the pre-visit conversation on
// WhatsApp, message by message, and then the summary the doctor receives, with
// the alarm sign highlighted. Scroll-scrubbed by PinnedAct (see the data-*
// contract there). A server component: all of the copy is in the static HTML.
//
// Copy rules (owner, 2026-11-05): made-up data only, labelled as such; the
// PreCheck organises the answers and the DOCTOR evaluates and decides — the
// summary never reads as a diagnosis; status label "em uso" is fixed.

import type { ReactNode } from "react";
import { PinnedAct } from "./PinnedAct";

type Msg = { beat: number; from: "in" | "out"; text: ReactNode; chips?: string[] };

const CHAT: Msg[] = [
  {
    beat: 1,
    from: "in",
    text: "Olá! Antes da sua consulta com o Dr. Almeida, vou fazer algumas perguntas. Para começar, você aceita o termo de uso dos seus dados?",
    chips: ["Aceito"],
  },
  { beat: 2, from: "out", text: "Aceito" },
  { beat: 3, from: "in", text: "Qual o motivo principal da consulta? Pode contar com as suas palavras." },
  { beat: 4, from: "out", text: "Dor de cabeça forte há 4 dias, mais do lado direito." },
  { beat: 5, from: "in", text: "A dor é constante ou vem em crises? Notou algum gatilho, como luz ou barulho?" },
  { beat: 6, from: "out", text: "Vem em crises à tarde. Piora com luz forte e tive enjoo ontem." },
  { beat: 7, from: "in", text: "Sente rigidez ou dor ao mexer o pescoço?" },
  { beat: 8, from: "out", text: "Sim, um pouco." },
  { beat: 9, from: "in", text: "Obrigado! Suas respostas já foram enviadas para o Dr. Almeida." },
];

const STEPS: { at: number; text: string }[] = [
  { at: 1, text: "O paciente abre o link e aceita o termo." },
  { at: 3, text: "Conta o motivo da consulta com as próprias palavras." },
  { at: 5, text: "O PreCheck aprofunda o que importa para o caso." },
  { at: 10, text: "O resumo chega ao médico, com os sinais de alarme em destaque." },
];

export const PRECHECK_CONTEXTS = ["Consultas", "Procedimentos", "Exames", "Emergência"];

type PreCheckDemoProps = {
  /** The act's single call to action (each site passes its own button). */
  cta: ReactNode;
  /** Optional chips under the value line (the PreCheck site lists its contexts). */
  contexts?: string[];
};

export function PreCheckDemo({ cta, contexts }: PreCheckDemoProps) {
  return (
    <PinnedAct id="precheck" tone="pc" labelledBy="gd-pc-title">
      <div className="gd-wrap gd-act__grid">
        <div className="gd-act__copy">
          <p className="gd-tag">
            <span className="gd-tag__dot" aria-hidden="true" />
            PreCheck <span className="gd-tag__state">em uso</span>
          </p>
          <h2 id="gd-pc-title" className="gd-h2">
            A pré-consulta acontece no WhatsApp, <em>antes do paciente chegar.</em>
          </h2>
          <ol className="gd-steps">
            {STEPS.map((s, i) => (
              <li key={s.at} data-at={s.at}>
                <span className="gd-steps__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <p className="gd-value" data-beat="15">
            O médico chega à consulta já conhecendo o caso.
          </p>
          {contexts && contexts.length > 0 && (
            <ul className="gd-contexts" aria-label="Onde o PreCheck é usado">
              {contexts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          <div className="gd-act__cta">{cta}</div>
        </div>

        <figure className="gd-scene gd-scene--pc">
          <figcaption className="gd-fict">Ilustração com dados fictícios</figcaption>

          <div className="gd-phone">
            <div className="gd-phone__bar" aria-hidden="true">
              <span className="gd-phone__ava">P</span>
              <span>
                <strong>PreCheck</strong>
                <small>online</small>
              </span>
            </div>
            <div className="gd-chat gd-chat--wa">
              {CHAT.map((m) => (
                <div key={m.beat} className="gd-msg" data-beat={m.beat} data-fx="msg">
                  <div className={`gd-bub gd-bub--${m.from}`}>
                    {m.text}
                    {m.chips && (
                      <span className="gd-bub__chips" aria-hidden="true">
                        {m.chips.map((c) => (
                          <span key={c}>{c}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="gd-phone__input" aria-hidden="true">
              <span>Digite sua resposta…</span>
            </div>
          </div>

          <div className="gd-summary" data-beat="10" data-fx="cover">
            <div className="gd-summary__head">
              <span className="gd-summary__kicker">Resumo da pré-consulta</span>
              <span className="gd-summary__for">Para o Dr. Almeida · antes do atendimento</span>
            </div>
            <dl className="gd-summary__rows">
              <div data-beat="11">
                <dt>Queixa principal</dt>
                <dd>Cefaleia há 4 dias, mais à direita</dd>
              </div>
              <div data-beat="12">
                <dt>História</dt>
                <dd>Crises à tarde, piora com luz forte, náusea ontem</dd>
              </div>
            </dl>
            <p className="gd-alert gd-alert--red" data-beat="13" data-fx="alarm">
              <span className="gd-alert__dot" aria-hidden="true">
                <span data-ring="" />
              </span>
              <span>
                <strong>Sinal de alarme relatado:</strong> rigidez de nuca
              </span>
            </p>
            <p className="gd-alert gd-alert--plain" data-beat="14">
              <span className="gd-alert__dot" aria-hidden="true" />
              <span>Para confirmar na consulta: febre e intensidade da dor</span>
            </p>
            <p className="gd-summary__foot" data-beat="15">
              O PreCheck organiza as respostas. <strong>Quem avalia e decide é o médico.</strong>
            </p>
          </div>
        </figure>
      </div>
    </PinnedAct>
  );
}
