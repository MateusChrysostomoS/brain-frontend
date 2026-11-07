// PreCheckDemo — act 2 of the guided demo: the pre-visit conversation in the
// clinic's chat (Portal Brain), message by message (terms → standard questions → the AI's
// deepening questions), and then the summary the doctor receives, with the
// alarm sign highlighted. Scroll-scrubbed by PinnedAct (see the data-*
// contract there). A server component: all of the copy is in the static HTML.
//
// Copy rules (owner, 2026-11-05): made-up data only, labelled as such; the
// PreCheck organises the answers and the DOCTOR evaluates and decides — the
// summary never reads as a diagnosis; status label "em uso" is fixed.
// CHANNEL (owner, 2026-11-06): the PreCheck runs only in the clinic's chat on
// the Portal Brain; WhatsApp is not in use, so no copy here may say it is.

import type { ReactNode } from "react";
import { Bubble, Composer, DayPill, ThreadHead, type ReplyButton } from "./ChatParts";
import { PinnedAct } from "./PinnedAct";

// The conversation follows the real PreCheck flow in the Portal, in its four
// stages (owner, 2026-11-06): the terms (LGPD) accepted with "✅ Concordo"; the
// flow's standard questions, the same for every patient (first visit, age,
// daily medication, the reason for the visit); then the deepening questions
// the AI writes for THIS patient's complaint, one at a time; and finally the
// summary for the doctor. Closed questions come as buttons (Sim / Não /
// Voltar), open ones carry only "⬅️ Voltar", a tapped option returns as
// "Opção escolhida". Content is invented (owner rule).
type Msg = {
  beat: number;
  voice: "pc" | "patient";
  time: string;
  text: ReactNode;
  echo?: boolean;
  buttons?: ReplyButton[];
};

const BACK: ReplyButton = { label: "Voltar", icon: "⬅️" };
const YES: ReplyButton = { label: "Sim", icon: "✅" };
const NO: ReplyButton = { label: "Não", icon: "❌" };

const CHAT: Msg[] = [
  // 1 · termos (LGPD)
  {
    beat: 1,
    voice: "pc",
    time: "09:12",
    text: "Para continuar, é necessário concordar com os termos. Por favor, clique no botão “✅ Concordo”.",
    buttons: [{ label: "Concordo", icon: "✅", chosen: true }],
  },
  { beat: 2, voice: "patient", time: "09:12", echo: true, text: <>✅ Concordo</> },
  // 2 · perguntas padrão do fluxo
  {
    beat: 3,
    voice: "pc",
    time: "09:12",
    text: "Esta é a sua primeira consulta nesta clínica?",
    buttons: [{ ...YES, chosen: true }, NO, BACK],
  },
  { beat: 4, voice: "patient", time: "09:12", echo: true, text: <>✅ Sim</> },
  { beat: 5, voice: "pc", time: "09:13", text: "Quantos anos você tem?", buttons: [BACK] },
  { beat: 6, voice: "patient", time: "09:13", text: "34" },
  {
    beat: 7,
    voice: "pc",
    time: "09:13",
    text: "Você usa algum medicamento todos os dias?",
    buttons: [YES, { ...NO, chosen: true }, BACK],
  },
  { beat: 8, voice: "patient", time: "09:13", echo: true, text: <>❌ Não</> },
  {
    beat: 9,
    voice: "pc",
    time: "09:13",
    text: "Qual o motivo da consulta hoje? Descreva com detalhes o que está sentindo.",
    buttons: [BACK],
  },
  { beat: 10, voice: "patient", time: "09:14", text: "Dor de cabeça forte há 4 dias, mais do lado direito." },
  // 3 · perguntas aprofundadas, escritas para a queixa deste paciente
  { beat: 11, voice: "pc", time: "09:14", text: "A dor vem em crises? Piora com luz ou barulho?", buttons: [BACK] },
  { beat: 12, voice: "patient", time: "09:15", text: "Vem em crises à tarde. Piora com luz forte e tive enjoo ontem." },
  {
    beat: 13,
    voice: "pc",
    time: "09:15",
    text: "Sente rigidez ou dor ao mexer o pescoço?",
    buttons: [{ ...YES, chosen: true }, NO, BACK],
  },
  { beat: 14, voice: "patient", time: "09:15", echo: true, text: <>✅ Sim</> },
  { beat: 15, voice: "pc", time: "09:16", text: "Obrigado! Suas respostas já foram enviadas para o Dr. Almeida." },
];

const STEPS: { at: number; text: string }[] = [
  { at: 1, text: "O paciente abre o link e aceita os termos (LGPD)." },
  { at: 3, text: "Responde às perguntas padrão do fluxo da clínica." },
  { at: 11, text: "A IA aprofunda com perguntas feitas para a queixa dele." },
  { at: 16, text: "O resumo chega ao médico, com os sinais de alarme em destaque." },
];

export const PRECHECK_CONTEXTS = ["Consultas", "Procedimentos", "Exames", "Emergência"];

type PreCheckDemoProps = {
  /** The act's single call to action (each site passes its own button). */
  cta: ReactNode;
  /** Optional chips under the value line (the PreCheck site lists its contexts). */
  contexts?: string[];
  /** Heading override (defaults to the clinic-chat heading). */
  title?: ReactNode;
};

export function PreCheckDemo({ cta, contexts, title }: PreCheckDemoProps) {
  return (
    <PinnedAct id="precheck" tone="pc" labelledBy="gd-pc-title" beatVh={22}>
      <div className="gd-wrap gd-act__grid">
        <div className="gd-act__copy">
          <p className="gd-tag">
            <span className="gd-tag__dot" aria-hidden="true" />
            PreCheck <span className="gd-tag__state">em uso</span>
          </p>
          <h2 id="gd-pc-title" className="gd-h2">
            {title ?? (
              <>
                A pré-consulta acontece no chat da clínica, <em>antes do paciente chegar.</em>
              </>
            )}
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
          <p className="gd-value" data-beat="21">
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
            <ThreadHead product="pc" />
            <div className="gd-chat" role="region" aria-label="Conversa de exemplo do PreCheck" tabIndex={0}>
              <div className="gd-chat__track">
                <DayPill>Hoje</DayPill>
                {CHAT.map((m) => (
                  <Bubble
                    key={m.beat}
                    voice={m.voice}
                    beat={m.beat}
                    time={m.time}
                    echo={m.echo}
                    buttons={m.buttons}
                    chooseBeat={m.buttons ? m.beat + 1 : undefined}
                  >
                    {m.text}
                  </Bubble>
                ))}
              </div>
            </div>
            <Composer />
          </div>

          <div className="gd-summary" data-beat="16" data-fx="cover">
            <div className="gd-summary__head">
              <span className="gd-summary__kicker">Resumo da pré-consulta</span>
              <span className="gd-summary__for">Para o Dr. Almeida · antes do atendimento</span>
            </div>
            <dl className="gd-summary__rows">
              <div data-beat="17">
                <dt>Queixa principal</dt>
                <dd>Cefaleia há 4 dias, mais à direita</dd>
              </div>
              <div data-beat="18">
                <dt>Aprofundamento</dt>
                <dd>Crises à tarde, piora com luz forte, náusea ontem</dd>
              </div>
              <div data-beat="18">
                <dt>Perguntas padrão</dt>
                <dd>34 anos · primeira consulta · sem remédio de uso diário</dd>
              </div>
            </dl>
            <p className="gd-alert gd-alert--red" data-beat="19" data-fx="alarm">
              <span className="gd-alert__dot" aria-hidden="true">
                <span data-ring="" />
              </span>
              <span>
                <strong>Sinal de alarme relatado:</strong> rigidez de nuca
              </span>
            </p>
            <p className="gd-alert gd-alert--plain" data-beat="20">
              <span className="gd-alert__dot" aria-hidden="true" />
              <span>Para confirmar na consulta: febre e intensidade da dor</span>
            </p>
            <p className="gd-summary__foot" data-beat="21">
              O PreCheck organiza as respostas. <strong>Quem avalia e decide é o médico.</strong>
            </p>
          </div>
        </figure>
      </div>
    </PinnedAct>
  );
}
