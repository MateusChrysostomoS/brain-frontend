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
// useSearchParams requires it (same pattern as app/(SignOut)/login/page.tsx).

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandGlyph } from "../../_components/BrandGlyph";
import {
  exchangeOnboardingToken,
  getOnboardingStatus,
  getPrecheckSsoToken,
  getSession,
  ManageApiError,
  saveSession,
  type Session,
} from "@/lib/manage-api";
import "../checkout.css";

// Onde o médico realmente trabalha. O painel /dashboard deste projeto é uma cópia
// portada do PreCheck e está em vias de ser aposentada — todo acesso ao produto
// passa a ser no site oficial.
const PRECHECK_APP_URL = (
  process.env.NEXT_PUBLIC_PRECHECK_URL || "https://precheck.com.br"
).replace(/\/$/, "");

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
  | "ready-precheck"
  | "ready-precheck-pending";

export default function CheckoutSucessoPage() {
  return (
    <Suspense
      fallback={
        <CheckoutShell>
          <Spinner label="Carregando…" />
        </CheckoutShell>
      }
    >
      <CheckoutSucessoInner />
    </Suspense>
  );
}

function CheckoutSucessoInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [view, setView] = useState<ViewState>(
    sessionId ? "polling" : "missing-session",
  );
  // Only meaningful in the "ready-secretaria" view: the status poll succeeded
  // but exchanging the onboarding token (or saving the session) failed.
  const [exchangeFailed, setExchangeFailed] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    // Narrowed to a plain `string` for the closures below — TS does not carry
    // the `if (!sessionId) return` narrowing into nested function scopes.
    const sid: string = sessionId;

    // DUAS flags, de propósito. `cancelled` significa "pare de fazer POLL" e é
    // ligada assim que o status resolve; `unmounted` significa "o componente foi
    // embora, não toque em mais nada". Enquanto era uma flag só, o trabalho que
    // roda DEPOIS do polling terminar (o handoff de SSO abaixo) via a flag já
    // ligada por stop() e abortava antes da primeira tentativa — a tela ficava
    // presa em "abrindo o painel" para sempre.
    let cancelled = false;
    let unmounted = false;
    let busy = false; // guards against overlapping ticks if a fetch is slow
    const startedAt = Date.now();

    function stop() {
      cancelled = true;
      clearInterval(intervalId);
    }

    // Troca a sessão do brain por uma sessão do PreCheck e entra no dashboard.
    //
    // Há uma CORRIDA real aqui: `onboarding-status` vira "ready" assim que o
    // entitlement é ativado, e só DEPOIS o webhook dispara o bridge que cria a
    // clínica e grava `precheck_account_links`. Enquanto essa linha não existe,
    // POST /sso/precheck/token responde 409 `precheck_account_not_linked` — que
    // não é erro, é "ainda não". Por isso o 409 é retentado com espera crescente
    // em vez de virar tela de falha; qualquer outro erro é terminal.
    async function enterPrecheck(session: Session) {
      const esperas = [0, 1000, 2000, 4000, 8000];
      for (const espera of esperas) {
        if (espera > 0) await new Promise((r) => setTimeout(r, espera));
        if (unmounted) return;
        try {
          const { token } = await getPrecheckSsoToken(session);
          // O produto é o PreCheck; o Brain é o caixa. Mandamos o médico para o
          // site oficial em vez do painel embutido aqui.
          //
          // O token viaja no FRAGMENTO (#), nunca na query: o que vem depois do #
          // não é enviado ao servidor, então não entra em log de acesso nem vaza
          // no Referer. `localStorage` não cruza domínios — é assim que a sessão
          // atravessa de brainai.com.br para precheck.com.br. A rota /sso de lá
          // guarda o token e limpa a URL na chegada.
          window.location.replace(
            `${PRECHECK_APP_URL}/sso#token=${encodeURIComponent(token)}`,
          );
          return;
        } catch (err) {
          const naoLigadoAinda =
            err instanceof ManageApiError && err.status === 409;
          if (!naoLigadoAinda) break;
        }
      }
      // O provisionamento não ficou pronto a tempo (ou falhou). A conta e o
      // pagamento estão de pé — o bridge retenta sozinho no primeiro load do
      // portal —, então mandamos o cliente para lá em vez de prometer contato.
      if (!unmounted) setView("ready-precheck-pending");
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
          if (status.products?.secretaria) {
            setView("ready-secretaria");
            // Fast path: registration already saved a session in this browser — just
            // route into the portal (the entitlement is now active).
            if (getSession()) {
              router.replace("/doctor/dashboard");
            } else if (status.onboarding_token) {
              // Fallback (different browser/tab): trade the LATEST one-time token for a
              // session. Never reuse a token from an earlier poll.
              try {
                const session = await exchangeOnboardingToken(
                  status.onboarding_token,
                );
                saveSession(session);
                router.replace("/doctor/dashboard");
              } catch {
                setExchangeFailed(true);
              }
            } else {
              // Token already spent in an earlier poll/tab and no local session — the
              // tenant exists, but there's nothing left here to trade for a session.
              setView("ready-already-claimed");
            }
          } else {
            // PreCheck: mesmo desenho do ramo acima — sessão local primeiro, o
            // onboarding-token como fallback de outro browser —, mas o destino
            // exige um passo a mais: PreCheck não aceita o JWT do brain, então
            // mintamos um token PreCheck-shaped (POST /sso/precheck/token) e o
            // gravamos onde o dashboard portado o procura (localStorage
            // `precheck_token`, mesmo origin).
            setView("ready-precheck");
            let session: Session | null = getSession();
            if (session === null && status.onboarding_token) {
              try {
                session = await exchangeOnboardingToken(status.onboarding_token);
                saveSession(session);
              } catch {
                setExchangeFailed(true);
                return;
              }
            }
            if (session === null) {
              setView("ready-already-claimed");
              return;
            }
            await enterPrecheck(session);
          }
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

    const intervalId = setInterval(tick, POLL_INTERVAL_MS);
    tick(); // check immediately instead of waiting the first interval

    return () => {
      unmounted = true;
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [sessionId, router]);

  return <CheckoutShell>{renderView(view, exchangeFailed)}</CheckoutShell>;
}

// renderView — pure mapping from state to markup, kept separate from the
// polling effect above so that logic reads top-to-bottom on its own.
function renderView(view: ViewState, exchangeFailed: boolean): ReactNode {
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
          <Spinner label="Pagamento confirmado? Estamos preparando sua conta…" />
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
            Pagamento confirmado!
          </h1>
          <p className="muted mt-s">
            Sua conta foi criada, mas não conseguimos abrir o painel
            automaticamente. Entre com o e-mail usado na compra.
          </p>
          <div className="checkout-actions">
            <Link href="/login" className="btn btn--primary">
              Entrar
            </Link>
          </div>
        </>
      ) : (
        <Spinner label="Pagamento confirmado! Abrindo o seu painel…" />
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
            Entre com o e-mail usado na compra para acessar o painel.
          </p>
          <div className="checkout-actions">
            <Link href="/login" className="btn btn--primary">
              Entrar
            </Link>
          </div>
        </>
      );

    // Estado de passagem: o pagamento entrou e estamos abrindo o PreCheck.
    // Some sozinho no router.replace("/dashboard").
    case "ready-precheck":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✅
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Pagamento confirmado!
          </h1>
          <p className="muted mt-s">
            Estamos preparando o seu PreCheck e abrindo o painel…
          </p>
          <Spinner label="Abrindo o painel…" />
        </>
      );

    // O provisionamento não ficou pronto na janela desta página. Nada se perdeu:
    // a conta existe, o pagamento está de pé e o bridge retenta no primeiro load
    // do portal — então a saída é um LINK para o painel, não uma promessa de
    // alguém entrar em contato.
    case "ready-precheck-pending":
      return (
        <>
          <span className="checkout-icon" aria-hidden="true">
            ✅
          </span>
          <h1 className="h-sec" style={{ fontSize: 22 }}>
            Pagamento confirmado!
          </h1>
          <p className="muted mt-s">
            Sua conta está criada e o seu PreCheck está sendo preparado — isso
            leva alguns instantes. Acesse o painel para continuar; se ainda
            estiver em preparo, é só recarregar em um minuto.
          </p>
          <div className="checkout-actions">
            <Link href="/app" className="btn btn--primary">
              Ir para o painel
            </Link>
          </div>
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
