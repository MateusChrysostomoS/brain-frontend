"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SLIDE_COUNT = 8;

// Duration of the programmatic slide-to-slide scroll animation.
const SCROLL_ANIMATION_MS = 420;

// easeOutCubic — brisk start, gentle finish. Standard carousel motion curve.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// FeaturesCarousel — horizontally scrollable gallery of product feature cards
// for the landing page "Funcionalidades" section. Owns the active-slide index
// and drives the prev/next arrows and the dot indicators.
//
// The track uses `scroll-snap-type: x mandatory` (see landing.css). Native
// smooth scrolling fights mandatory snapping on multi-slide jumps — the snap
// engine cancels the animation partway — so navigation runs its own rAF tween
// with snapping briefly disabled.
export default function FeaturesCarousel() {
  // --- Refs & state ---
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Mirror of activeIndex so click handlers read the latest value even when
  // clicks arrive faster than React commits a render.
  const activeIndexRef = useRef(0);

  // Handle of the in-flight scroll-tween frame, or null when idle. While a
  // tween runs, the scroll listener is suppressed so the animation isn't
  // mistaken for a manual swipe.
  const animationFrame = useRef<number | null>(null);

  // Single source of truth for the index — keeps the ref and state in sync.
  const setIndex = useCallback((next: number) => {
    activeIndexRef.current = next;
    setActiveIndex(next);
  }, []);

  // --- Manual-swipe detection ---
  // Resolve the active slide from the raw scroll position. Runs only for
  // user-driven scrolls. The extremes are matched explicitly: slides 0 and
  // SLIDE_COUNT-1 can't be centered on wide screens (their snap point clamps
  // to the scroll boundary), so a pure nearest-center test never reports them.
  const syncIndexFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || animationFrame.current !== null) return;

    const { scrollLeft, clientWidth, scrollWidth } = track;
    const maxScroll = scrollWidth - clientWidth;

    if (scrollLeft <= 2) {
      setIndex(0);
      return;
    }
    if (scrollLeft >= maxScroll - 2) {
      setIndex(SLIDE_COUNT - 1);
      return;
    }

    // Otherwise pick the slide whose center sits nearest the viewport center.
    const viewportCenter = scrollLeft + clientWidth / 2;
    const slides = track.children;
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const el = slides[i] as HTMLElement;
      const slideCenter = el.offsetLeft + el.clientWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    setIndex(best);
  }, [setIndex]);

  // --- Navigation ---
  // Animate the track so slide `i` is centered, and make `i` the authoritative
  // index. The index is set immediately (not derived from the resulting
  // scroll) so navigation always advances by exactly one slide, even for the
  // edge slides whose centered position clamps against the scroll boundary.
  const goToSlide = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;

      const target = Math.max(0, Math.min(SLIDE_COUNT - 1, i));
      const el = track.children[target] as HTMLElement | undefined;
      if (!el) return;

      setIndex(target);

      // Center the slide; clamp to the scrollable range for the edge slides.
      const centeredLeft =
        el.offsetLeft + el.clientWidth / 2 - track.clientWidth / 2;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const to = Math.max(0, Math.min(maxScroll, centeredLeft));
      const from = track.scrollLeft;

      const running = animationFrame.current;
      // Idle and already there — nothing to animate.
      if (running === null && Math.abs(to - from) < 2) return;
      // A tween is in flight — drop it and retarget from the live position.
      if (running !== null) cancelAnimationFrame(running);

      // Disable snapping for the tween: mandatory snapping re-snaps every
      // programmatic scroll write and would cancel the animation. It is
      // restored on the final frame, where `to` is itself a snap point.
      track.style.scrollSnapType = "none";

      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / SCROLL_ANIMATION_MS);
        track.scrollLeft = from + (to - from) * easeOutCubic(progress);
        if (progress < 1) {
          animationFrame.current = requestAnimationFrame(step);
        } else {
          animationFrame.current = null;
          track.style.scrollSnapType = ""; // revert to the CSS value
        }
      };
      animationFrame.current = requestAnimationFrame(step);
    },
    [setIndex],
  );

  // Keep the dots in sync when the user scrolls/swipes the track directly.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    syncIndexFromScroll();
    track.addEventListener("scroll", syncIndexFromScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", syncIndexFromScroll);
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [syncIndexFromScroll]);

  return (
    <div className="feat-carousel-wrap">
      <div className="feat-carousel" id="feat-track" ref={trackRef}>
        {/* Slide 1: Summary (wide) */}
        <div className="feat-slide wide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5M9 13h6M9 17h4" />
            </svg>
          </div>
          <h3>Formatos clínicos estruturados</h3>
          <p>
            Saída no padrão POMR + SOAP, com Lista de Problemas (ativos, crônicos,
            potenciais) e nota clínica completa. Não é texto corrido — é dado clínico
            organizado.
          </p>
          <div className="feat-summary-mock">
            <div className="feat-summary-row">
              <span className="tag">ATIVOS</span>
              <p>Cefaleia hemicraniana há 4 dias - Náusea associada</p>
            </div>
            <div className="feat-summary-row">
              <span className="tag">CRÔNICOS</span>
              <p>Enxaqueca (dx. 22a) - Sono irregular</p>
            </div>
            <div className="feat-summary-row">
              <span className="tag">POTENCIAIS</span>
              <p>Cefaleia em salvas — a investigar</p>
            </div>
          </div>
        </div>
        {/* Slide 2 */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l9 5-9 5-9-5z" />
              <path d="M3 13l9 5 9-5M3 18l9 5 9-5" />
            </svg>
          </div>
          <h3>Anamnese sob medida por especialidade</h3>
          <p>
            Roteiros dedicados para clínica geral (primeira consulta e retorno) hoje em
            produção. Cardiologia ambulatorial em desenvolvimento. Cada especialidade
            ganha seu fluxo, suas perguntas, seu formato de saída.
          </p>
        </div>
        {/* Slide 3: Alerts */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
              <path d="M10 21a2 2 0 0 0 4 0" />
            </svg>
          </div>
          <h3>Alertas clínicos</h3>
          <p>
            Sinais de alarme classificados em verde, amarelo e vermelho. O médico vê o
            que importa, primeiro.
          </p>
          <div className="feat-alerts-mock">
            <div className="feat-alert red">
              <span className="dot" />
              <strong>Vermelho:</strong>&nbsp;Dor torácica + dispneia há 6h
            </div>
            <div className="feat-alert amber">
              <span className="dot" />
              <strong>Amarelo:</strong>&nbsp;HAS sem aferição há 8 meses
            </div>
            <div className="feat-alert green">
              <span className="dot" />
              <strong>Verde:</strong>&nbsp;Sem sinais de alarme cardiovasculares
            </div>
          </div>
        </div>
        {/* Slide 4 */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5v0a3 3 0 0 0 2 5v0a3 3 0 0 0 3 3h0a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
              <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5v0a3 3 0 0 1-2 5v0a3 3 0 0 1-3 3h0a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
          <h3>Aprofundamento inteligente</h3>
          <p>
            Detecta sinais clínicos na resposta e desce na investigação — caracteriza
            dor, gatilhos, fatores de melhora, intensidade.
          </p>
        </div>
        {/* Slide 5 */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v6a4 4 0 0 0 8 0V3" />
              <path d="M6 3h2M12 3h2M10 13v3a4 4 0 0 0 8 0v-1" />
              <circle cx="18" cy="13" r="2" />
            </svg>
          </div>
          <h3>Primeira consulta e retorno</h3>
          <p>
            Fluxos diferentes para anamnese inicial e seguimento. Retorno não começa do
            zero — usa o histórico que já existe.
          </p>
        </div>
        {/* Slide 6 */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="M21 16l-5-5-9 9" />
            </svg>
          </div>
          <h3>Análise de exames por foto</h3>
          <p>
            O paciente envia foto do hemograma, ECG ou exame de imagem. A IA transcreve,
            estrutura e devolve pronto para revisão.
          </p>
        </div>
        {/* Slide 7 */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l9 5-9 5-9-5z" />
              <path d="M3 13l9 5 9-5M3 18l9 5 9-5" />
            </svg>
          </div>
          <h3>Multi-clínica com isolamento</h3>
          <p>
            Cada clínica vê apenas seus pacientes. Cada médico, seus atendimentos.
            Permissões por papel — médico, secretaria, gestor.
          </p>
        </div>
        {/* Slide 8 */}
        <div className="feat-slide">
          <div className="feat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h3>Conformidade LGPD nativa</h3>
          <p>
            Consentimento explícito antes de qualquer coleta. Direito de exclusão. Logs
            de auditoria. DPO designado.
          </p>
        </div>
      </div>
      <div className="feat-controls container">
        <div className="feat-dots" id="feat-dots">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              className={"feat-dot" + (i === activeIndex ? " active" : "")}
              aria-label={`Ir para card ${i + 1}`}
              aria-current={i === activeIndex ? "true" : undefined}
              onClick={() => goToSlide(i)}
              type="button"
            />
          ))}
        </div>
        <div className="feat-arrows">
          <button
            className="feat-arrow"
            id="feat-prev"
            aria-label="Anterior"
            disabled={activeIndex === 0}
            onClick={() => goToSlide(activeIndexRef.current - 1)}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            className="feat-arrow"
            id="feat-next"
            aria-label="Próximo"
            disabled={activeIndex === SLIDE_COUNT - 1}
            onClick={() => goToSlide(activeIndexRef.current + 1)}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
