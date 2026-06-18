"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { side: "in" | "out"; html: string };

// WhatsApp pré-consulta conversation — ported verbatim from the original landing.
const conversation: Msg[] = [
  {
    side: "in",
    html:
      "\u{1F44B} Olá! Bem-vindo(a) ao PreCheck!<br/>Somos um serviço de pré-consulta. \u{1F60A}<br/><br/>Nossa função é:<br/><br/>\u{1F9E9} Entender melhor o seu histórico clínico<br/>\u{1F469}‍⚕️\u{1F468}‍⚕️ Preparar uma consulta mais completa e personalizada<br/>\u{1F499} Garantir um atendimento acolhedor e eficiente<br/><br/>Por favor, responda com atenção",
  },
  { side: "in", html: "Pode me contar, com suas palavras, o motivo principal da consulta hoje?" },
  { side: "out", html: "Estou com dor de cabeça forte há uns 4 dias, principalmente do lado direito." },
  {
    side: "in",
    html:
      "Entendi. A dor é constante ou vem em crises? Você notou algum gatilho — luz, barulho, alimentação?",
  },
  { side: "out", html: "Vem em crises, geralmente à tarde. Pioro com luz forte e tive enjoo ontem." },
  { side: "in", html: "✓ Anotado. Mais 3 perguntas e seu resumo já estará com o Dr. Almeida." },
];
const times = ["09:14", "09:14", "09:15", "09:15", "09:16", "09:17"];

const INITIAL_DELAY = 500;
const FOLLOWUP_DELAY = 700;
const NEXT_MESSAGE_DELAY = 1100;
const TYPING_DURATION = 1400;

export default function WorkflowDemo() {
  const [count, setCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let step = 0;
    let timer: ReturnType<typeof setTimeout>;

    function advance() {
      if (step >= conversation.length) {
        // Conversation complete — keep the typing bubble at the bottom
        // so the chat looks like the bot is composing the next question.
        setIsTyping(true);
        return;
      }
      const m = conversation[step];
      const prev = step > 0 ? conversation[step - 1] : null;
      const isBotReplyingToUser = m.side === "in" && prev?.side === "out";

      if (isBotReplyingToUser) {
        setIsTyping(true);
        timer = setTimeout(() => {
          setIsTyping(false);
          step += 1;
          setCount(step);
          timer = setTimeout(advance, NEXT_MESSAGE_DELAY);
        }, TYPING_DURATION);
        return;
      }

      setIsTyping(false);
      step += 1;
      setCount(step);
      timer = setTimeout(advance, step === 1 ? FOLLOWUP_DELAY : NEXT_MESSAGE_DELAY);
    }

    timer = setTimeout(advance, INITIAL_DELAY);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [count, isTyping]);

  return (
    <div className="wa-body" id="wa-chat-body" ref={bodyRef}>
      <div className="wa-day">Hoje</div>
      {conversation.slice(0, count).map((m, i) => {
        const time = times[i];
        const html = m.html + (time ? `<span class="time">${time}</span>` : "");
        return (
          <div
            key={i}
            className={"wa-bubble " + m.side}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
      {isTyping && (
        <div className="wa-bubble in typing" aria-label="Digitando">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}
