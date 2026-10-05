"use client";

// /checkout/sucesso — Stripe Checkout return URL for the self-service cold
// signup flow (both the "Contratar PreCheck" and "Contratar secretarIA" CTAs
// point Stripe here on success). Reads `session_id` from the query string and
// polls GET /public/onboarding-status every 2s until the async webhook activates
// the tenant's entitlement — the webhook can lag behind the redirect, so this
// NEVER assumes "ready" on the first load. The visitor is normally ALREADY logged
// in (registration saved a session at the first card, which survives the Stripe
// round-trip in the same tab), so once ready this just routes into the portal; the
// one-time onboarding-token exchange is only a FALLBACK for finishing checkout in a
// different browser/tab that never got that session. Wrapped in Suspense because
// Console purchases skip polling and return to the portal (lib/console-return.ts).
// useSearchParams requires it (same pattern as app/(SignOut)/login/page.tsx).

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandGlyph } from "../../_components/BrandGlyph";
import {
  exchangeOnboardingToken,
  getOnboardingStatus,
  ensureSession,
  getSession,
  ManageApiError,
  saveSession,
} from "@/lib/manage-api";
import { BRAIN_MESSAGE_URL, consoleReturnFor, normalizeBrainMessageUrl, type ConsoleReturn } from "@/lib/console-return";
import "../checkout.css";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 120_000; // ~2 minutes, then show the "taking longer" state

// What's currently shown to the visitor. Only "polling" keeps the interval
// alive — every other state is terminal for this page load.
type ViewState =
  | "missing-session"
  | "polling"
  | "failed"
  | "timeout"
  | "ready-secretaria"
  | "ready-already-claimed"
  | "ready-portal";

export default function CheckoutSucessoPage() {
  return (
    <Suspense
      fallback={
        <CheckoutShell>
          <Spinner label="Carregando…" />
        </CheckoutShell>
      }
    >
      <CheckoutSucessoRouter />
    </Suspense>
  );
}

// A purchase that came from the Brain-Message console (`origem=console`) is an
// EXISTING account paying for a product: there is no cold-signup intent, so the
// onboarding-status poll below would get a 404. It skips that flow and goes back
// to the portal instead. Every other arrival (cold signup, courtesy) runs the
// original flow untouched.
function CheckoutSucessoRouter() {
  const searchParams = useSearchParams();
  const back = consoleReturnFor({
    origem: searchParams.get("origem"),
    produto: searchParams.get("produto"),
    baseUrl: BRAIN_MESSAGE_URL,
  });
  if (back.kind === "none") return <CheckoutSucessoInner />;
  return <ConsoleReturn back={back} />;
}

function ConsoleReturn({ back }: { back: Exclude<ConsoleReturn, { kind: "none" }> }) {
  const href = back.kind === "redirect" ? back.href : null;
  useEffect(() => {
    // replace(): the payment page must not be a back-button stop.
    if (href) window.location.replace(href);
  }, [href]);

  return (
    <CheckoutShell>
      {href ? (
        <>
          <Spinner label="Pagamento recebido! Voltando ao portal de atendimento…" />
          <div className="checkout-actions">
            <a href={href} className="btn btn--primary">
              Continuar para o portal
            </a>
          </div>
        </>
      ) : (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✅
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Pagamento recebido!
          </h1>
          <p className="muted mt-s">
            Sua assinatura está sendo ativada; pode levar alguns instantes. Volte ao portal de
            atendimento para continuar.
          </p>
          <div className="checkout-actions">
            <Link href="/app/billing" className="btn btn--outline">
              Gerenciar assinatura
            </Link>
          </div>
        </>
      )}
    </CheckoutShell>
  );
}

function CheckoutSucessoInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  // Courtesy activation is already complete and has no Stripe session to poll.
  const cortesia = searchParams.get("courtesy") === "1";

  const [view, setView] = useState<ViewState>(
    sessionId || cortesia ? "polling" : "missing-session",
  );
  // Only meaningful in the "ready-secretaria" view: the status poll succeeded
  // but exchanging the onboarding token (or saving the session) failed.
  const [exchangeFailed, setExchangeFailed] = useState(false);

  useEffect(() => {
    if (!sessionId && !cortesia) return;
    // Narrowed to a plain `string` for the closures below — TS does not carry
    // the `if (!sessionId) return` narrowing into nested function scopes.
    const sid: string = sessionId ?? "";

    // Stop polling separately from the component lifetime: session restoration
    // continues after a ready status, but never after the page unmounts.
    let cancelled = false;
    let unmounted = false;
    let busy = false; // guards against overlapping ticks if a fetch is slow
    const startedAt = Date.now();

    function stop() {
      cancelled = true;
      clearInterval(intervalId);
    }

    // The unified portal owns clinical access and its own session restoration.
    function enterPortal() {
      const base = normalizeBrainMessageUrl(BRAIN_MESSAGE_URL);
      if (base) window.location.replace(base + "/");
      else router.replace("/app/billing");
    }

    async function tick() {
      if (cancelled || busy) return;
      busy = true;
      try {
        const status = await getOnboardingStatus(sid);
        if (cancelled) return;

        if (status.status === "failed") {
          stop();
          setView("failed");
          return;
        }

        if (status.status === "ready") {
          stop();
          setView("ready-portal");
          let session = getSession() ?? (await ensureSession());
          if (unmounted) return;
          if (session === null && status.onboarding_token) {
            try {
              session = await exchangeOnboardingToken(status.onboarding_token);
              if (unmounted) return;
              saveSession(session);
            } catch {
              setView("ready-secretaria");
              setExchangeFailed(true);
              return;
            }
          }
          if (session === null) {
            setView("ready-already-claimed");
            return;
          }
          enterPortal();
          return;
        }

        // Still pending — bail out once the ~2 min ceiling is hit.
        if (Date.now() - startedAt >= MAX_POLL_MS) {
          stop();
          setView("timeout");
        }
      } catch (e) {
        if (e instanceof ManageApiError && e.status === 404) {
          // The backend doesn't know this session_id at all (not a cold-signup
          // checkout, or a bogus link) — terminal, don't spin until timeout.
          stop();
          setView("failed");
          return;
        }
        // Transient network hiccup — retried on the next tick.
      } finally {
        busy = false;
      }
    }

    // Cortesia: o resgate do cupom já ativou tudo de forma síncrona, e a sessão
    // do brain existe neste navegador desde o cadastro (register_signup devolve
    // uma). Não há o que consultar — só entrar. Sem Checkout Session, `tick()`
    // chamaria onboarding-status com string vazia e tomaria 404 para sempre.
    if (cortesia) {
      // Async because the session may exist only as the refresh cookie here: the
      // coupon redemption is a full navigation, so nothing survives in memory.
      void (async () => {
        const session = getSession() ?? (await ensureSession());
        if (unmounted || cancelled) return;
        if (session === null) {
          // Cadastro feito em outro navegador: aqui não há sessão para trocar, e
          // o token de onboarding do resgate ficou na aba anterior.
          setView("ready-already-claimed");
        } else {
          setView("ready-portal");
          enterPortal();
        }
      })();
      return () => {
        unmounted = true;
        cancelled = true;
      };
    }

    const intervalId = setInterval(tick, POLL_INTERVAL_MS);
    tick(); // check immediately instead of waiting the first interval

    return () => {
      unmounted = true;
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [sessionId, cortesia, router]);

  return <CheckoutShell>{renderView(view, exchangeFailed, cortesia)}</CheckoutShell>;
}

// renderView — pure mapping from state to markup, kept separate from the
// polling effect above so that logic reads top-to-bottom on its own.
//
// `cortesia`: esta tela é TAMBÉM o retorno do resgate de cupom, que ativa a
// clínica sem passar pelo Stripe. Três estados de sucesso são alcançáveis por
// esse caminho: ready-precheck e ready-already-claimed
// — e nenhum deles pode afirmar um pagamento que não houve. O título vira
// `tituloOk`, verdadeiro nos dois caminhos.
function renderView(
  view: ViewState,
  exchangeFailed: boolean,
  cortesia: boolean,
): ReactNode {
  const tituloOk = cortesia ? "Tudo pronto!" : "Pagamento confirmado!";

  switch (view) {
    case "missing-session":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ⚠️
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Não encontramos seu pagamento
          </h1>
          <p className="muted mt-s">
            O link de retorno não trouxe os dados do checkout. Se você acabou
            de pagar, use o link enviado pelo Stripe para voltar a esta
            página.
          </p>
          <div className="checkout-actions">
            <Link href="/#planos" className="btn btn--outline">
              Ver planos
            </Link>
          </div>
        </>
      );

    case "polling":
      return (
        <>
          {/* O resgate de cupom também começa neste estado: `view` nasce
              "polling" para os dois caminhos e só sai dele depois do
              ensureSession() do efeito, que pode ir à rede. */}
          <Spinner
            label={
              cortesia
                ? "Estamos preparando sua conta…"
                : "Pagamento confirmado? Estamos preparando sua conta…"
            }
          />
          <p className="muted mt-s" style={{ fontSize: 13 }}>
            Isso normalmente leva alguns segundos.
          </p>
        </>
      );

    case "failed":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✕
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Não foi possível confirmar o pagamento
          </h1>
          <p className="muted mt-s">
            Algo deu errado ao ativar sua conta. Fale com a nossa equipe
            informando o e-mail usado na compra — vamos resolver rapidamente.
          </p>
          <div className="checkout-actions">
            <Link href="/#contato" className="btn btn--primary">
              Falar com a Brain
            </Link>
          </div>
        </>
      );

    case "timeout":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ⏳
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Está demorando mais que o normal
          </h1>
          <p className="muted mt-s">
            Seu pagamento pode já ter sido aprovado — a confirmação está
            demorando mais que o esperado. Recarregue esta página em alguns
            minutos ou fale com o nosso suporte informando o e-mail usado na
            compra.
          </p>
          <div className="checkout-actions">
            <Link href="/#contato" className="btn btn--primary">
              Falar com a Brain
            </Link>
          </div>
        </>
      );

    case "ready-secretaria":
      return exchangeFailed ? (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✅
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            {tituloOk}
          </h1>
          <p className="muted mt-s">
            Sua conta foi criada, mas não conseguimos abrir o painel
            automaticamente. Entre com o e-mail usado no cadastro.
          </p>
          <div className="checkout-actions">
            <Link href="/login" className="btn btn--primary">
              Entrar
            </Link>
          </div>
        </>
      ) : (
        <Spinner label={`${tituloOk} Abrindo o seu painel…`} />
      );

    case "ready-already-claimed":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✅
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Sua conta já está pronta
          </h1>
          <p className="muted mt-s">
            Entre com o e-mail usado no cadastro para acessar o painel.
          </p>
          <div className="checkout-actions">
            <Link href="/login" className="btn btn--primary">
              Entrar
            </Link>
          </div>
        </>
      );

    // Transitional state after payment or courtesy activation: enter the unified portal.
    case "ready-portal":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✅
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            {tituloOk}
          </h1>
          <p className="muted mt-s">
            Estamos abrindo o Portal Brain-Message…
          </p>
          <Spinner label="Abrindo o portal…" />
        </>
      );


  }
}

// CheckoutShell — minimal brand header + centered card, shared look for every
// state on this page (and reused by /checkout/cancelado).
function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="container" style={{ padding: "24px 0" }}>
        <Link href="/" className="brand-mark" aria-label="Brain — início">
          <BrandGlyph size={32} />
          <span className="wordmark">Brain</span>
        </Link>
      </header>
      <main className="checkout-shell">
        <div className="card checkout-card">{children}</div>
      </main>
    </>
  );
}

// Spinner — small inline "working on it" indicator, used by every pending state.
function Spinner({ label }: { label: string }) {
  return (
    <div aria-live="polite">
      <div className="checkout-spinner" aria-hidden="true" />
      <p style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</p>
    </div>
  );
}
